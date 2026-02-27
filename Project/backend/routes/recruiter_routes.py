from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone
from models.application import ApplicationStatusUpdate
from auth import get_current_user, require_recruiter
from database import get_db
from engine.scoring import compute_match_score
from engine.fairness import apply_fairness_adjustment, generate_fairness_report
from engine.explainer import generate_explanation

router = APIRouter(prefix="/api/recruiter", tags=["Recruiter"])


@router.put("/profile")
async def update_recruiter_profile(profile: dict, user: dict = Depends(require_recruiter)):
    db = get_db()
    update_fields = {"profile": profile}
    if profile.get("name"):
        update_fields["name"] = profile["name"]
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": update_fields}
    )
    return {"message": "Profile updated"}


@router.get("/jobs")
async def get_my_jobs(user: dict = Depends(require_recruiter)):
    db = get_db()
    cursor = db.jobs.find({"recruiter_id": user["_id"]}).sort("created_at", -1)
    jobs = []
    async for job in cursor:
        job["id"] = str(job.pop("_id"))
        job["recruiter_id"] = str(job["recruiter_id"])
        jobs.append(job)
    return {"jobs": jobs}


@router.get("/jobs/{job_id}/candidates")
async def get_ranked_candidates(job_id: str, user: dict = Depends(require_recruiter)):
    db = get_db()
    
    # Verify job ownership
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job["recruiter_id"]) != user["_id"]:
        raise HTTPException(status_code=403, detail="Not your job posting")
    
    # Get all applications for this job
    cursor = db.applications.find({"job_id": job_id})
    candidates = []
    
    async for app in cursor:
        # Get applicant profile
        applicant = await db.users.find_one({"_id": ObjectId(app["applicant_id"])})
        if not applicant:
            continue
        
        profile = applicant.get("profile", {})
        candidate_skills = profile.get("skills", [])
        required_skills = job.get("required_skills", [])
        experience = profile.get("experience", [])
        
        scoring_result = compute_match_score(
            required_skills=required_skills,
            candidate_skills=candidate_skills,
            experience_level=job.get("experience_level", "beginner"),
            candidate_experience=experience
        )
        
        candidates.append({
            "application_id": str(app["_id"]),
            "applicant_id": app["applicant_id"],
            "applicant_name": app.get("applicant_name", applicant.get("name", "")),
            "applicant_email": app.get("applicant_email", applicant.get("email", "")),
            "status": app.get("status", "pending"),
            "total_score": scoring_result["total_score"],
            "skill_breakdown": scoring_result["skill_breakdown"],
            "strengths": scoring_result["strengths"],
            "missing_skills": scoring_result["missing_skills"],
            "experience_match": scoring_result["experience_match"],
            "skill_coverage": scoring_result["skill_coverage"],
            "confidence": scoring_result["confidence"],
            "skills": candidate_skills,
            "applied_at": app.get("applied_at", "")
        })
    
    # Apply fairness adjustments
    candidates = apply_fairness_adjustment(candidates)
    fairness_report = generate_fairness_report(candidates)
    
    # Generate explanations
    for c in candidates:
        c["explanation"] = generate_explanation(
            {
                "total_score": c["total_score"],
                "skill_breakdown": c["skill_breakdown"],
                "strengths": c["strengths"],
                "missing_skills": c["missing_skills"],
                "partial_matches": [],
                "experience_match": c["experience_match"],
                "skill_coverage": c["skill_coverage"],
                "confidence": c["confidence"]
            },
            fairness_adj=c.get("fairness_adjustment", 0)
        )
    
    return {
        "job": {
            "id": str(job["_id"]),
            "title": job["title"],
            "required_skills": job["required_skills"]
        },
        "candidates": candidates,
        "fairness_report": fairness_report,
        "total": len(candidates)
    }


@router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    status_update: ApplicationStatusUpdate,
    user: dict = Depends(require_recruiter)
):
    db = get_db()
    app = await db.applications.find_one({"_id": ObjectId(app_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Verify job ownership
    job = await db.jobs.find_one({"_id": ObjectId(app["job_id"])})
    if not job or str(job["recruiter_id"]) != user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": status_update.status}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "action": f"application_{status_update.status}",
        "user_id": user["_id"],
        "details": {
            "application_id": app_id,
            "applicant_id": app["applicant_id"],
            "job_id": app["job_id"],
            "new_status": status_update.status
        },
        "category": "access",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": f"Application {status_update.status}"}


@router.get("/analytics")
async def get_analytics(user: dict = Depends(require_recruiter)):
    db = get_db()
    
    # Get recruiter's jobs
    jobs = await db.jobs.find({"recruiter_id": user["_id"]}).to_list(100)
    job_ids = [str(j["_id"]) for j in jobs]
    
    # Get all applications for these jobs
    applications = await db.applications.find({"job_id": {"$in": job_ids}}).to_list(1000)
    
    # Compute analytics
    total_jobs = len(jobs)
    total_applications = len(applications)
    
    status_counts = {"pending": 0, "reviewed": 0, "shortlisted": 0, "rejected": 0}
    score_distribution = []
    jobs_stats = []
    
    for app in applications:
        status = app.get("status", "pending")
        status_counts[status] = status_counts.get(status, 0) + 1
        score = app.get("match_score", 0)
        score_distribution.append(score)
    
    for job in jobs:
        job_apps = [a for a in applications if a["job_id"] == str(job["_id"])]
        scores = [a.get("match_score", 0) for a in job_apps]
        jobs_stats.append({
            "job_id": str(job["_id"]),
            "title": job["title"],
            "applicants": len(job_apps),
            "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "max_score": round(max(scores), 1) if scores else 0,
            "shortlisted": sum(1 for a in job_apps if a.get("status") == "shortlisted")
        })
    
    # Score histogram bins
    histogram = [0] * 10
    for s in score_distribution:
        bin_idx = min(int(s / 10), 9)
        histogram[bin_idx] += 1
    
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "status_breakdown": status_counts,
        "score_histogram": [
            {"range": f"{i*10}-{i*10+9}", "count": histogram[i]} for i in range(10)
        ],
        "jobs_stats": jobs_stats,
        "avg_match_score": round(sum(score_distribution) / len(score_distribution), 1) if score_distribution else 0
    }
