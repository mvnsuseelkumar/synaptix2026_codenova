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
    skill_weights: Dict[str, int] = {}
    min_score_threshold: float = 2.0
    total_applicants: int = 0
    status: str = "open"  # open | closed | draft
    posted_at: datetime = Field(default_factory=datetime.utcnow)
    deadline: Optional[datetime] = None

    class Settings:
        name = "opportunities"
