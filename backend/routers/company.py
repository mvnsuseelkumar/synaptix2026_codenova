"""Company routes — profile, opportunities CRUD, rankings, applicant management."""

from datetime import datetime
from typing import Optional, List, Dict

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field, field_validator
from beanie import PydanticObjectId

from models.company_model import Company
from models.opportunity_model import Opportunity
from models.application_model import Application
from models.notification_model import Notification
from models.fairness_model import FairnessLog
from models.student_model import Student
from utils.jwt_utils import require_role
from utils.constants import STATUS_SHORTLISTED, STATUS_REJECTED
from services.notification_service import (
    notify_student_shortlisted,
    notify_student_rejected,
)

router = APIRouter(prefix="/api/company", tags=["company"])


# ── Request schemas ─────────────────────────────────────

class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class OpportunityCreateRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    domain: str = ""
    mode: str = "remote"
    duration: str = ""
    location: str = ""
    stipend: str = ""
    must_have_skills: List[str] = []
    skill_weights: Dict[str, int] = {}
    min_score_threshold: float = 2.0
    deadline: Optional[str] = None

    @field_validator("skill_weights")
    @classmethod
    def validate_weights(cls, v):
        if v and sum(v.values()) != 100:
            raise ValueError("Skill weights must sum to 100")
        return v


class OpportunityUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    mode: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    stipend: Optional[str] = None
    must_have_skills: Optional[List[str]] = None
    skill_weights: Optional[Dict[str, int]] = None
    min_score_threshold: Optional[float] = None
    status: Optional[str] = None
    deadline: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: str  # under_review | shortlisted | rejected


# ── Profile ─────────────────────────────────────────────

@router.get("/profile")
async def get_profile(current_user: dict = Depends(require_role("company"))):
    try:
        company = await Company.get(current_user["user_id"])
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return {
            "id": str(company.id),
            "name": company.name,
            "email": company.email,
            "industry": company.industry,
            "website": company.website,
            "description": company.description,
            "logo_url": company.logo_url,
            "created_at": company.created_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile")
async def update_profile(
    req: CompanyProfileUpdate,
    current_user: dict = Depends(require_role("company")),
):
    try:
        company = await Company.get(current_user["user_id"])
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        if req.name:
            company.name = req.name
        if req.industry is not None:
            company.industry = req.industry
        if req.website is not None:
            company.website = req.website
        if req.description is not None:
            company.description = req.description

        await company.save()
        return {"message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Opportunities ───────────────────────────────────────

@router.post("/opportunities")
async def create_opportunity(
    req: OpportunityCreateRequest,
    current_user: dict = Depends(require_role("company")),
):
    try:
        company = await Company.get(current_user["user_id"])
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        deadline = None
        if req.deadline:
            from dateutil.parser import parse as parse_date
            try:
                deadline = parse_date(req.deadline)
            except Exception:
                pass

        opp = Opportunity(
            company_id=company.id,
            company_name=company.name,
            title=req.title,
            description=req.description,
            domain=req.domain,
            mode=req.mode,
            duration=req.duration,
            location=req.location,
            stipend=req.stipend,
            must_have_skills=req.must_have_skills,
            skill_weights=req.skill_weights,
            min_score_threshold=req.min_score_threshold,
            status="open",
            posted_at=datetime.utcnow(),
            deadline=deadline,
        )
        await opp.insert()

        return {"message": "Opportunity created", "opportunity_id": str(opp.id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/opportunities")
async def list_opportunities(current_user: dict = Depends(require_role("company"))):
    try:
        opps = await Opportunity.find(
            Opportunity.company_id == PydanticObjectId(current_user["user_id"])
        ).sort("-posted_at").to_list()

        results = []
        for opp in opps:
            results.append({
                "id": str(opp.id),
                "title": opp.title,
                "domain": opp.domain,
                "mode": opp.mode,
                "status": opp.status,
                "total_applicants": opp.total_applicants,
                "posted_at": opp.posted_at.isoformat(),
                "deadline": opp.deadline.isoformat() if opp.deadline else None,
            })

        return {"opportunities": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/opportunities/{opp_id}")
async def get_opportunity(
    opp_id: str,
    current_user: dict = Depends(require_role("company")),
):
    try:
        opp = await Opportunity.get(PydanticObjectId(opp_id))
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        if str(opp.company_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        return {
            "id": str(opp.id),
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
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/opportunities/{opp_id}")
async def update_opportunity(
    opp_id: str,
    req: OpportunityUpdateRequest,
    current_user: dict = Depends(require_role("company")),
):
    try:
        opp = await Opportunity.get(PydanticObjectId(opp_id))
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        if str(opp.company_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        update_data = req.model_dump(exclude_none=True)
        for key, value in update_data.items():
            if key == "deadline" and value:
                from dateutil.parser import parse as parse_date
                try:
                    value = parse_date(value)
                except Exception:
                    continue
            setattr(opp, key, value)

        await opp.save()
        return {"message": "Opportunity updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/opportunities/{opp_id}")
async def delete_opportunity(
    opp_id: str,
    current_user: dict = Depends(require_role("company")),
):
    try:
        opp = await Opportunity.get(PydanticObjectId(opp_id))
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        if str(opp.company_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        opp.status = "closed"
        await opp.save()
        return {"message": "Opportunity closed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Rankings & Applicant Management ─────────────────────

@router.get("/opportunities/{opp_id}/rankings")
async def get_rankings(
    opp_id: str,
    status_filter: Optional[str] = None,
    sort_by: str = "rank",
    search: Optional[str] = None,
    current_user: dict = Depends(require_role("company")),
):
    try:
        opp = await Opportunity.get(PydanticObjectId(opp_id))
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        if str(opp.company_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        query_filters = [Application.opportunity_id == PydanticObjectId(opp_id)]
        if status_filter:
            query_filters.append(Application.status == status_filter)

        apps = await Application.find(*query_filters).to_list()

        # Sort
        if sort_by == "score":
            apps.sort(key=lambda a: a.match_score, reverse=True)
        else:
            apps.sort(key=lambda a: (a.rank or 9999))

        # Search filter
        if search:
            apps = [a for a in apps if search.lower() in a.student_name.lower()]

        # Get fairness flags
        flags = await FairnessLog.find(
            FairnessLog.opportunity_id == PydanticObjectId(opp_id),
            FairnessLog.resolved == False,
        ).to_list()

        results = []
        for app in apps:
            breakdown = {}
            for skill, sb in app.score_breakdown.items():
                breakdown[skill] = {
                    "weight": sb.weight,
                    "student_score": sb.student_score,
                    "weighted_contribution": sb.weighted_contribution,
                }

            results.append({
                "id": str(app.id),
                "student_id": str(app.student_id),
                "student_name": app.student_name,
                "student_email": app.student_email,
                "student_institution": app.student_institution,
                "rank": app.rank,
                "match_score": app.match_score,
                "status": app.status,
                "knockout_passed": app.knockout_passed,
                "knockout_fail_reason": app.knockout_fail_reason,
                "score_breakdown": breakdown,
                "semantic_similarity_bonus": app.semantic_similarity_bonus,
                "fairness_flags": app.fairness_flags,
                "applied_at": app.applied_at.isoformat(),
            })

        fairness_alerts = []
        for flag in flags:
            fairness_alerts.append({
                "id": str(flag.id),
                "flag_type": flag.flag_type,
                "detail": flag.detail,
                "top10_breakdown": flag.top10_breakdown,
                "flagged_at": flag.flagged_at.isoformat(),
            })

        return {
            "opportunity": {
                "id": str(opp.id),
                "title": opp.title,
                "status": opp.status,
                "total_applicants": opp.total_applicants,
                "skill_weights": opp.skill_weights,
            },
            "rankings": results,
            "fairness_alerts": fairness_alerts,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    req: StatusUpdateRequest,
    current_user: dict = Depends(require_role("company")),
):
    try:
        app = await Application.get(PydanticObjectId(app_id))
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        if str(app.company_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        app.status = req.status
        if req.status == STATUS_SHORTLISTED:
            app.shortlisted_at = datetime.utcnow()

        await app.save()

        # Get opportunity for notification context
        opp = await Opportunity.get(app.opportunity_id)
        opp_title = opp.title if opp else "Unknown"
        company = await Company.get(PydanticObjectId(current_user["user_id"]))
        company_name = company.name if company else "Unknown"

        # Send notification
        if req.status == STATUS_SHORTLISTED:
            await notify_student_shortlisted(str(app.student_id), opp_title, company_name)
        elif req.status == STATUS_REJECTED:
            await notify_student_rejected(str(app.student_id), opp_title, company_name)

        return {"message": f"Application status updated to {req.status}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/applications/{app_id}")
async def get_applicant_detail(
    app_id: str,
    current_user: dict = Depends(require_role("company")),
):
    try:
        app = await Application.get(PydanticObjectId(app_id))
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        if str(app.company_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        student = await Student.get(app.student_id)

        breakdown = {}
        for skill, sb in app.score_breakdown.items():
            breakdown[skill] = {
                "weight": sb.weight,
                "student_score": sb.student_score,
                "weighted_contribution": sb.weighted_contribution,
            }

        student_data = None
        if student:
            skill_profile = {}
            for skill, detail in student.skill_profile.items():
                skill_profile[skill] = {
                    "score": detail.score,
                    "evidence": detail.evidence.model_dump(),
                    "source_breakdown": detail.source_breakdown.model_dump(),
                }

            student_data = {
                "name": student.name,
                "email": student.email,
                "institution": student.profile_meta.institution,
                "location": student.profile_meta.location,
                "domain_preference": student.profile_meta.domain_preference,
                "skill_profile": skill_profile,
            }

        return {
            "id": str(app.id),
            "student": student_data,
            "rank": app.rank,
            "match_score": app.match_score,
            "status": app.status,
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
async def get_notifications(current_user: dict = Depends(require_role("company"))):
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
