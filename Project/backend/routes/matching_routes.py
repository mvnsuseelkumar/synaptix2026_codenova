from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from auth import get_current_user
from database import get_db
from engine.scoring import compute_match_score
from engine.explainer import generate_explanation
from engine.skill_gap import analyze_skill_gaps

router = APIRouter(prefix="/api/match", tags=["Matching"])


@router.get("/{job_id}/{applicant_id}")
async def get_detailed_match(job_id: str, applicant_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    applicant = await db.users.find_one({"_id": ObjectId(applicant_id)})
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    
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
    
    explanation = generate_explanation(scoring_result)
    gap_analysis = analyze_skill_gaps(required_skills, candidate_skills)
    
    return {
        "job": {
            "id": str(job["_id"]),
            "title": job["title"],
            "required_skills": required_skills
        },
        "applicant": {
            "id": str(applicant["_id"]),
            "name": applicant["name"],
            "skills": candidate_skills
        },
        "match": explanation,
        "skill_gap": gap_analysis
    }
