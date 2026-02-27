"""Opportunity document model for Beanie ODM."""

from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import Field, field_validator


class Opportunity(Document):
    company_id: PydanticObjectId
    company_name: str
    title: str
    description: str
    domain: str = ""
    mode: str = "remote"  # remote | onsite | hybrid
    duration: str = ""
    location: str = ""
    stipend: str = ""
    must_have_skills: List[str] = []
    skill_weights: Dict[str, int] = {}  # weights sum to 100
    min_score_threshold: float = 2.0
    total_applicants: int = 0
    status: str = "open"  # open | closed | draft
    posted_at: datetime = Field(default_factory=datetime.utcnow)
    deadline: Optional[datetime] = None

    @field_validator("skill_weights")
    @classmethod
    def validate_skill_weights(cls, v):
        if v and sum(v.values()) != 100:
            raise ValueError("Skill weights must sum to 100")
        return v

    class Settings:
        name = "opportunities"
