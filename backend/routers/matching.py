"""Matching routes — trigger and check matching pipeline status."""

from fastapi import APIRouter, HTTPException, Depends

from utils.jwt_utils import require_role
from services.matcher import run_matching

router = APIRouter(prefix="/api/matching", tags=["matching"])


@router.post("/run/{opportunity_id}")
async def trigger_matching(
    opportunity_id: str,
    current_user: dict = Depends(require_role("company")),
):
    """Trigger full matching for an opportunity."""
    try:
        # Try Celery first
        try:
            from tasks.celery_tasks import task_run_matching
            task = task_run_matching.delay(opportunity_id)
            return {
                "message": "Matching pipeline started",
                "task_id": str(task.id),
                "status": "processing",
            }
        except Exception:
            # Fallback to synchronous execution
            result = await run_matching(opportunity_id)
            return {
                "message": "Matching completed",
                "status": "completed",
                "result": result,
            }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{opportunity_id}")
async def matching_status(
    opportunity_id: str,
    current_user: dict = Depends(require_role("company")),
):
    """Check matching run status."""
    try:
        # Check if any applications have been scored
        from models.application_model import Application
        from beanie import PydanticObjectId

        apps = await Application.find(
            Application.opportunity_id == PydanticObjectId(opportunity_id)
        ).to_list()

        total = len(apps)
        scored = sum(1 for a in apps if a.match_score > 0)
        ranked = sum(1 for a in apps if a.rank is not None)

        if ranked == total and total > 0:
            status = "completed"
        elif scored > 0:
            status = "in_progress"
        else:
            status = "pending"

        return {
            "opportunity_id": opportunity_id,
            "status": status,
            "total_applications": total,
            "scored": scored,
            "ranked": ranked,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
