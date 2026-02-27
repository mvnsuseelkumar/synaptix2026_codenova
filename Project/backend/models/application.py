from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class SkillBreakdown(BaseModel):
    skill: str
    weight: float
    candidate_proficiency: int
    max_proficiency: int = 10
    contribution: float
    status: str  # "matched", "missing", "partial"


class MatchExplanation(BaseModel):
    total_score: float
    skill_breakdown: List[SkillBreakdown]
    strengths: List[str]
    missing_skills: List[str]
    partial_matches: List[str]
    fairness_adjustment: float
    final_score: float
    confidence: float
    experience_match: str
    skill_coverage: float


class ApplicationCreate(BaseModel):
    job_id: str


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    applicant_id: str
    status: str = "pending"  # pending, reviewed, shortlisted, rejected
    match_score: Optional[float] = None
    explanation: Optional[dict] = None
    applied_at: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    applicant_name: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(pattern="^(reviewed|shortlisted|rejected)$")
