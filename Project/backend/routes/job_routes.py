from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional
from models.job import JobCreate, JobUpdate, JobResponse
from auth import get_current_user, require_recruiter
from database import get_db

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("", response_model=dict)
async def create_job(job_data: JobCreate, user: dict = Depends(require_recruiter)):
    db = get_db()
    job_doc = {
        **job_data.model_dump(),
        "required_skills": [s.model_dump() for s in job_data.required_skills],
        "recruiter_id": user["_id"],
        "recruiter_name": user["name"],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "applicant_count": 0
    }
    result = await db.jobs.insert_one(job_doc)
    return {"id": str(result.inserted_id), "message": "Job posted successfully"}


@router.get("")
async def list_jobs(
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    db = get_db()
    query = {"status": "active"}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}}
        ]
    if job_type:
        query["job_type"] = job_type
    if experience_level:
        query["experience_level"] = experience_level

    cursor = db.jobs.find(query).skip(skip).limit(limit).sort("created_at", -1)
    jobs = []
    async for job in cursor:
        job["id"] = str(job.pop("_id"))
        job["recruiter_id"] = str(job["recruiter_id"])
        jobs.append(job)
    
    total = await db.jobs.count_documents(query)
    return {"jobs": jobs, "total": total}


@router.get("/{job_id}")
async def get_job(job_id: str):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["id"] = str(job.pop("_id"))
    job["recruiter_id"] = str(job["recruiter_id"])
    return job


@router.put("/{job_id}")
async def update_job(job_id: str, updates: JobUpdate, user: dict = Depends(require_recruiter)):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job["recruiter_id"]) != user["_id"]:
        raise HTTPException(status_code=403, detail="Not your job posting")

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if "required_skills" in update_data and update_data["required_skills"]:
        update_data["required_skills"] = [s.model_dump() if hasattr(s, 'model_dump') else s for s in update_data["required_skills"]]
    
    await db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_data})
    return {"message": "Job updated successfully"}


@router.delete("/{job_id}")
async def delete_job(job_id: str, user: dict = Depends(require_recruiter)):
    db = get_db()
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job["recruiter_id"]) != user["_id"]:
        raise HTTPException(status_code=403, detail="Not your job posting")

    await db.jobs.delete_one({"_id": ObjectId(job_id)})
    return {"message": "Job deleted successfully"}
