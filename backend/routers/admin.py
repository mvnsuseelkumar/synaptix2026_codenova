"""Admin routes — fairness monitoring, user management, platform stats."""

from fastapi import APIRouter, HTTPException, Depends
from beanie import PydanticObjectId

from models.student_model import Student
from models.company_model import Company
from models.opportunity_model import Opportunity
from models.application_model import Application
from models.fairness_model import FairnessLog
from utils.jwt_utils import require_role

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/fairness-logs")
async def get_fairness_logs(current_user: dict = Depends(require_role("admin"))):
    """Get all fairness flags."""
    try:
        logs = await FairnessLog.find_all().sort("-flagged_at").to_list()

        results = []
        for log in logs:
            opp = await Opportunity.get(log.opportunity_id)
            results.append({
                "id": str(log.id),
                "opportunity_id": str(log.opportunity_id),
                "opportunity_title": opp.title if opp else "N/A",
                "flag_type": log.flag_type,
                "detail": log.detail,
                "top10_breakdown": log.top10_breakdown,
                "flagged_at": log.flagged_at.isoformat(),
                "resolved": log.resolved,
            })

        return {"fairness_logs": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/fairness-logs/{log_id}/resolve")
async def resolve_fairness_flag(
    log_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    """Resolve a fairness flag."""
    try:
        log = await FairnessLog.get(PydanticObjectId(log_id))
        if not log:
            raise HTTPException(status_code=404, detail="Fairness log not found")

        log.resolved = True
        await log.save()
        return {"message": "Fairness flag resolved"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users")
async def get_all_users(current_user: dict = Depends(require_role("admin"))):
    """Get all platform users."""
    try:
        students = await Student.find_all().to_list()
        companies = await Company.find_all().to_list()

        users = []
        for s in students:
            users.append({
                "id": str(s.id),
                "name": s.name,
                "email": s.email,
                "role": "student",
                "resume_status": s.resume_parse_status,
                "skills_count": len(s.skill_profile),
                "created_at": s.created_at.isoformat(),
            })
        for c in companies:
            users.append({
                "id": str(c.id),
                "name": c.name,
                "email": c.email,
                "role": "company",
                "industry": c.industry,
                "created_at": c.created_at.isoformat(),
            })

        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_platform_stats(current_user: dict = Depends(require_role("admin"))):
    """Get platform-wide statistics."""
    try:
        total_students = await Student.count()
        total_companies = await Company.count()
        total_opportunities = await Opportunity.count()
        total_applications = await Application.count()
        total_flags = await FairnessLog.find(FairnessLog.resolved == False).count()

        open_opportunities = await Opportunity.find(
            Opportunity.status == "open"
        ).count()
        shortlisted = await Application.find(
            Application.status == "shortlisted"
        ).count()

        return {
            "total_students": total_students,
            "total_companies": total_companies,
            "total_users": total_students + total_companies,
            "total_opportunities": total_opportunities,
            "open_opportunities": open_opportunities,
            "total_applications": total_applications,
            "shortlisted": shortlisted,
            "unresolved_flags": total_flags,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
