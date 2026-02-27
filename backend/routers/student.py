"""Student routes — profile, resume upload, opportunities, applications, notifications."""

import os
import shutil
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from pydantic import BaseModel
from beanie import PydanticObjectId

from models.student_model import Student, ProfileMeta
from models.opportunity_model import Opportunity
from models.application_model import Application
from models.notification_model import Notification
from utils.jwt_utils import require_role
from utils.constants import ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, STATUS_APPLIED
from services.notification_service import notify_company_new_application
from services.matcher import invalidate_rankings_cache
from config import settings

router = APIRouter(prefix="/api/student", tags=["student"])


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    domain_preference: Optional[list] = None
    institution: Optional[str] = None


# ── Profile ─────────────────────────────────────────────

@router.get("/profile")
async def get_profile(current_user: dict = Depends(require_role("student"))):
    """Get full student profile including skill_profile."""
    try:
        student = await Student.get(current_user["user_id"])
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        skill_profile_dict = {}
        for skill, detail in student.skill_profile.items():
            skill_profile_dict[skill] = {
                "score": detail.score,
                "evidence": detail.evidence.model_dump(),
                "source_breakdown": detail.source_breakdown.model_dump(),
            }

        return {
            "id": str(student.id),
            "name": student.name,
            "email": student.email,
            "resume_url": student.resume_url,
            "resume_parse_status": student.resume_parse_status,
            "skill_profile": skill_profile_dict,
            "resume_sections": student.resume_sections.model_dump(),
            "profile_meta": student.profile_meta.model_dump(),
            "created_at": student.created_at.isoformat(),
            "updated_at": student.updated_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile")
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: dict = Depends(require_role("student")),
):
    """Update student profile_meta."""
    try:
        student = await Student.get(current_user["user_id"])
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        if req.name:
            student.name = req.name
        if req.location is not None:
            student.profile_meta.location = req.location
        if req.availability is not None:
            student.profile_meta.availability = req.availability
        if req.domain_preference is not None:
            student.profile_meta.domain_preference = req.domain_preference
        if req.institution is not None:
            student.profile_meta.institution = req.institution

        student.updated_at = datetime.utcnow()
        await student.save()
        return {"message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Resume ──────────────────────────────────────────────

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("student")),
):
    """Upload PDF resume and trigger Celery parse task."""
    try:
        # Validate file type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Read and check size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

        # Save file
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)

        file_name = f"{current_user['user_id']}_{file.filename}"
        file_path = os.path.join(upload_dir, file_name)

        with open(file_path, "wb") as f:
            f.write(contents)

        # Update student record
        student = await Student.get(current_user["user_id"])
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        student.resume_url = file_path
        student.resume_parse_status = "processing"
        student.updated_at = datetime.utcnow()
        await student.save()

        # Trigger Celery task
        try:
            from tasks.celery_tasks import task_parse_resume
            task_parse_resume.delay(file_path, current_user["user_id"])
        except Exception as e:
            # If Celery is not available, parse synchronously
            from services.resume_parser import parse_resume
            await parse_resume(file_path, current_user["user_id"])

        return {
            "message": "Resume uploaded successfully. Parsing in progress.",
            "file_name": file.filename,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resume/status")
async def get_resume_status(current_user: dict = Depends(require_role("student"))):
    """Check resume parse status."""
    try:
        student = await Student.get(current_user["user_id"])
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "status": student.resume_parse_status,
            "skills_count": len(student.skill_profile),
            "resume_url": student.resume_url,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Opportunities ───────────────────────────────────────

@router.get("/opportunities")
async def browse_opportunities(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    domain: Optional[str] = None,
    mode: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(require_role("student")),
):
    """Browse open opportunities with pagination & filters."""
    try:
        query = Opportunity.find(Opportunity.status == "open")

        if domain:
            query = Opportunity.find(
                Opportunity.status == "open",
                Opportunity.domain == domain,
            )
        if mode:
            query = Opportunity.find(
                Opportunity.status == "open",
                Opportunity.mode == mode,
            )

        total = await query.count()
        skip = (page - 1) * limit
        opps = await query.skip(skip).limit(limit).to_list()

        results = []
        for opp in opps:
            if search and search.lower() not in opp.title.lower() and search.lower() not in opp.description.lower():
                continue
            results.append({
                "id": str(opp.id),
                "company_id": str(opp.company_id),
                "company_name": opp.company_name,
                "title": opp.title,
                "description": opp.description[:200] + "..." if len(opp.description) > 200 else opp.description,
                "domain": opp.domain,
                "mode": opp.mode,
                "duration": opp.duration,
                "location": opp.location,
                "stipend": opp.stipend,
                "must_have_skills": opp.must_have_skills,
                "total_applicants": opp.total_applicants,
                "posted_at": opp.posted_at.isoformat(),
                "deadline": opp.deadline.isoformat() if opp.deadline else None,
            })

        return {
            "opportunities": results,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit if total > 0 else 1,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/opportunities/{opp_id}")
async def get_opportunity_detail(
    opp_id: str,
    current_user: dict = Depends(require_role("student")),
):
    """View single opportunity detail."""
    try:
        opp = await Opportunity.get(PydanticObjectId(opp_id))
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")

        # Check if student has applied
        existing_app = await Application.find_one(
            Application.student_id == PydanticObjectId(current_user["user_id"]),
            Application.opportunity_id == opp.id,
        )

        # Get student's matching skills
        student = await Student.get(current_user["user_id"])
        matching_skills = []
        missing_skills = []
        if student and student.skill_profile:
            for skill in opp.must_have_skills:
                if skill in student.skill_profile:
                    matching_skills.append(skill)
                else:
                    missing_skills.append(skill)

        return {
            "id": str(opp.id),
            "company_id": str(opp.company_id),
            "company_name": opp.company_name,
            "title": opp.title,
            "description": opp.description,
            "domain": opp.domain,
            "mode": opp.mode,
            "duration": opp.duration,
            "location": opp.location,
            "stipend": opp.stipend,
            "must_have_skills": opp.must_have_skills,
            "skill_weights": opp.skill_weights,
            "min_score_threshold": opp.min_score_threshold,
            "total_applicants": opp.total_applicants,
            "status": opp.status,
            "posted_at": opp.posted_at.isoformat(),
            "deadline": opp.deadline.isoformat() if opp.deadline else None,
            "has_applied": existing_app is not None,
            "application_id": str(existing_app.id) if existing_app else None,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/opportunities/{opp_id}/apply")
async def apply_to_opportunity(
    opp_id: str,
    current_user: dict = Depends(require_role("student")),
):
    """Apply to an opportunity."""
    try:
        opp = await Opportunity.get(PydanticObjectId(opp_id))
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        if opp.status != "open":
            raise HTTPException(status_code=400, detail="Opportunity is not open")

        student = await Student.get(current_user["user_id"])
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Check if already applied
        existing = await Application.find_one(
            Application.student_id == student.id,
            Application.opportunity_id == opp.id,
        )
        if existing:
            raise HTTPException(status_code=400, detail="Already applied to this opportunity")

        # Create application
        app = Application(
            student_id=student.id,
            student_name=student.name,
            student_email=student.email,
            student_institution=student.profile_meta.institution,
            opportunity_id=opp.id,
            company_id=opp.company_id,
            status=STATUS_APPLIED,
            applied_at=datetime.utcnow(),
        )
        await app.insert()

        # Update applicant count
        opp.total_applicants += 1
        await opp.save()

        # Invalidate rankings cache
        invalidate_rankings_cache(str(opp.id))

        # Notify company
        await notify_company_new_application(
            str(opp.company_id), student.name, opp.title
        )

        return {
            "message": "Application submitted successfully",
            "application_id": str(app.id),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Applications ────────────────────────────────────────

@router.get("/applications")
async def list_applications(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(require_role("student")),
):
    """List all applications for current student."""
    try:
        query_filters = [Application.student_id == PydanticObjectId(current_user["user_id"])]
        if status_filter:
            query_filters.append(Application.status == status_filter)

        apps = await Application.find(*query_filters).sort("-applied_at").to_list()

        results = []
        for app in apps:
            opp = await Opportunity.get(app.opportunity_id)
            results.append({
                "id": str(app.id),
                "opportunity_id": str(app.opportunity_id),
                "company_id": str(app.company_id),
                "opportunity_title": opp.title if opp else "N/A",
                "company_name": opp.company_name if opp else "N/A",
                "status": app.status,
                "match_score": app.match_score,
                "rank": app.rank,
                "applied_at": app.applied_at.isoformat(),
                "shortlisted_at": app.shortlisted_at.isoformat() if app.shortlisted_at else None,
            })

        return {"applications": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/applications/{app_id}")
async def get_application_detail(
    app_id: str,
    current_user: dict = Depends(require_role("student")),
):
    """Get full application detail with explanation."""
    try:
        app = await Application.get(PydanticObjectId(app_id))
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        if str(app.student_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        opp = await Opportunity.get(app.opportunity_id)

        # Get total applicants for this opportunity
        total_apps = await Application.find(
            Application.opportunity_id == app.opportunity_id
        ).count()

        # Build score breakdown
        breakdown = {}
        for skill, sb in app.score_breakdown.items():
            breakdown[skill] = {
                "weight": sb.weight,
                "student_score": sb.student_score,
                "weighted_contribution": sb.weighted_contribution,
            }

        return {
            "id": str(app.id),
            "opportunity_id": str(app.opportunity_id),
            "company_id": str(app.company_id),
            "opportunity_title": opp.title if opp else "N/A",
            "company_name": opp.company_name if opp else "N/A",
            "domain": opp.domain if opp else "",
            "status": app.status,
            "match_score": app.match_score,
            "rank": app.rank,
            "total_applicants": total_apps,
            "knockout_passed": app.knockout_passed,
            "knockout_fail_reason": app.knockout_fail_reason,
            "score_breakdown": breakdown,
            "semantic_similarity_bonus": app.semantic_similarity_bonus,
            "explanation": {
                "rank_reason": app.explanation.rank_reason,
                "improvement_tips": app.explanation.improvement_tips,
                "strong_areas": app.explanation.strong_areas,
            },
            "fairness_flags": app.fairness_flags,
            "applied_at": app.applied_at.isoformat(),
            "shortlisted_at": app.shortlisted_at.isoformat() if app.shortlisted_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Notifications ───────────────────────────────────────

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(require_role("student"))):
    """Get all notifications for current student."""
    try:
        notifs = await Notification.find(
            Notification.user_id == PydanticObjectId(current_user["user_id"])
        ).sort("-created_at").to_list()

        return {
            "notifications": [
                {
                    "id": str(n.id),
                    "type": n.type,
                    "title": n.title,
                    "message": n.message,
                    "read": n.read,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notifs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: str,
    current_user: dict = Depends(require_role("student")),
):
    """Mark a notification as read."""
    try:
        notif = await Notification.get(PydanticObjectId(notif_id))
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        if str(notif.user_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        notif.read = True
        await notif.save()
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
