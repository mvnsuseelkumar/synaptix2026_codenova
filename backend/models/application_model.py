"""Application document model for Beanie ODM."""

from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field


class SkillScoreBreakdown(BaseModel):
    weight: int = 0
    student_score: float = 0.0
    weighted_contribution: float = 0.0


class Explanation(BaseModel):
    rank_reason: str = ""
    improvement_tips: List[str] = []
    strong_areas: List[str] = []


class Application(Document):
    student_id: PydanticObjectId
    student_name: str
    student_email: str
    student_institution: str = ""
    opportunity_id: PydanticObjectId
    company_id: PydanticObjectId
    status: str = "applied"  # applied | under_review | shortlisted | rejected
    match_score: float = 0.0
    rank: Optional[int] = None
    knockout_passed: bool = True
    knockout_fail_reason: Optional[str] = None
    score_breakdown: Dict[str, SkillScoreBreakdown] = {}
    semantic_similarity_bonus: float = 0.0
    explanation: Explanation = Explanation()
    fairness_flags: List[str] = []
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    shortlisted_at: Optional[datetime] = None

    class Settings:
        name = "applications"
