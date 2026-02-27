from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone
from models.user import ApplicantProfile
from models.application import ApplicationCreate
from auth import get_current_user, require_applicant
from database import get_db
from engine.scoring import compute_match_score
from engine.fairness import apply_fairness_adjustment
from engine.explainer import generate_explanation
from engine.skill_gap import analyze_skill_gaps
from engine.github_validator import validate_github_project

router = APIRouter(prefix="/api/applicant", tags=["Applicant"])


@router.put("/profile")
async def update_profile(profile: ApplicantProfile, user: dict = Depends(require_applicant)):
    db = get_db()
    profile_data = profile.model_dump()
    if profile_data.get("skills"):
        profile_data["skills"] = [s if isinstance(s, dict) else s.model_dump() for s in profile_data["skills"]]
    
    update_fields = {"profile": profile_data}
    if profile_data.get("name"):
        update_fields["name"] = profile_data["name"]
    
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": update_fields}
    )
    return {"message": "Profile updated successfully"}


@router.get("/profile")
async def get_profile(user: dict = Depends(require_applicant)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "profile": user.get("profile", {}),
        "created_at": user.get("created_at")
    }


@router.post("/apply/{job_id}")
async def apply_to_job(job_id: str, user: dict = Depends(require_applicant)):
    db = get_db()
    
    # Check job exists
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check not already applied
    existing = await db.applications.find_one({
        "job_id": job_id,
        "applicant_id": user["_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Compute match score
    profile = user.get("profile", {})
    candidate_skills = profile.get("skills", [])
    required_skills = job.get("required_skills", [])
    experience = profile.get("experience", [])
    projects = profile.get("projects", [])
    
    scoring_result = compute_match_score(
        required_skills=required_skills,
        candidate_skills=candidate_skills,
        experience_level=job.get("experience_level", "beginner"),
        candidate_experience=experience,
        candidate_projects=projects
    )
    
    explanation = generate_explanation(scoring_result, fairness_adj=0.0)
    
    application_doc = {
        "job_id": job_id,
        "applicant_id": user["_id"],
        "applicant_name": user["name"],
        "applicant_email": user["email"],
        "job_title": job["title"],
        "company": job.get("company", ""),
        "status": "pending",
        "match_score": scoring_result["total_score"],
        "explanation": explanation,
        "applied_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.applications.insert_one(application_doc)
    
    # Update applicant count
    await db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$inc": {"applicant_count": 1}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "action": "application_submitted",
        "user_id": user["_id"],
        "details": {
            "job_id": job_id,
            "match_score": scoring_result["total_score"],
            "job_title": job["title"]
        },
        "category": "scoring",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "id": str(result.inserted_id),
        "match_score": scoring_result["total_score"],
        "explanation": explanation,
        "message": "Application submitted successfully"
    }


@router.get("/applications")
async def get_my_applications(user: dict = Depends(require_applicant)):
    db = get_db()
    cursor = db.applications.find({"applicant_id": user["_id"]}).sort("applied_at", -1)
    applications = []
    async for app in cursor:
        app["id"] = str(app.pop("_id"))
        applications.append(app)
    return {"applications": applications}


@router.get("/recommendations")
async def get_recommendations(user: dict = Depends(require_applicant)):
    db = get_db()
    profile = user.get("profile", {})
    candidate_skills = profile.get("skills", [])
    
    if not candidate_skills:
        return {"recommendations": [], "message": "Add skills to get recommendations"}
    
    skill_names = [s["name"].lower() for s in candidate_skills]
    
    # Find jobs matching at least one candidate skill
    cursor = db.jobs.find({"status": "active"}).sort("created_at", -1).limit(50)
    recommendations = []
    
    projects = profile.get("projects", [])

    async for job in cursor:
        required = job.get("required_skills", [])
        experience = profile.get("experience", [])
        
        scoring_result = compute_match_score(
            required_skills=required,
            candidate_skills=candidate_skills,
            experience_level=job.get("experience_level", "beginner"),
            candidate_experience=experience,
            candidate_projects=projects
        )
        
        if scoring_result["total_score"] > 20:
            explanation = generate_explanation(scoring_result)
            recommendations.append({
                "job_id": str(job["_id"]),
                "title": job["title"],
                "company": job.get("company", ""),
                "job_type": job.get("job_type", ""),
                "match_score": scoring_result["total_score"],
                "explanation": explanation,
                "required_skills": required
            })
    
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return {"recommendations": recommendations[:20]}


@router.get("/skill-gap/{job_id}")
async def get_skill_gap(job_id: str, user: dict = Depends(require_applicant)):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    profile = user.get("profile", {})
    candidate_skills = profile.get("skills", [])
    required_skills = job.get("required_skills", [])
    
    gap_analysis = analyze_skill_gaps(required_skills, candidate_skills)
    return {
        "job_title": job["title"],
        "company": job.get("company", ""),
        "analysis": gap_analysis
    }


@router.post("/validate-project")
async def validate_project(body: dict, user: dict = Depends(require_applicant)):
    """Validate a GitHub repo and cross-reference claimed skills."""
    github_url = body.get("github_url", "").strip()
    skills_used = body.get("skills_used", [])
    project_index = body.get("project_index")  # optional: index in projects list

    if not github_url:
        raise HTTPException(status_code=400, detail="GitHub URL is required")
    if not skills_used:
        raise HTTPException(status_code=400, detail="At least one skill must be specified")

    # Run validation
    result = await validate_github_project(github_url, skills_used)

    # Persist validation result in user's profile projects
    if project_index is not None and result.get("is_valid"):
        db = get_db()
        profile = user.get("profile", {})
        projects = profile.get("projects", [])
        if 0 <= project_index < len(projects):
            projects[project_index]["github_url"] = github_url
            projects[project_index]["validation"] = {
                "status": result["status"],
                "message": result["message"],
                "confidence_score": result["skill_analysis"]["confidence_score"],
                "verified_skills": result["skill_analysis"]["verified_skills"],
                "unmatched_skills": result["skill_analysis"]["unmatched_skills"],
                "repo_name": result["repo_info"]["full_name"],
                "languages": result["repo_info"]["languages"],
                "validated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.update_one(
                {"_id": ObjectId(user["_id"])},
                {"$set": {"profile.projects": projects}}
            )

    return result
