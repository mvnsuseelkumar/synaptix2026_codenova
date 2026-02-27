"""FairnessLog document model for Beanie ODM."""

from datetime import datetime
from typing import Dict
from beanie import Document, PydanticObjectId
from pydantic import Field


class FairnessLog(Document):
    opportunity_id: PydanticObjectId
    flag_type: str
    detail: str
    top10_breakdown: Dict[str, int] = {}
    flagged_at: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False

    class Settings:
        name = "fairness_logs"
