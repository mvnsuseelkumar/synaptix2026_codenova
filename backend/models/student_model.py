"""Student document model for Beanie ODM."""

from datetime import datetime
from typing import Optional, Dict, List
from beanie import Document
from pydantic import BaseModel, EmailStr, Field


class SkillEvidence(BaseModel):
    work_experience: int = 0
    projects: int = 0
    certifications: int = 0
    courses: int = 0


class SkillSourceBreakdown(BaseModel):
    work_experience_score: float = 0.0
    projects_score: float = 0.0
    certifications_score: float = 0.0
    courses_score: float = 0.0


class SkillDetail(BaseModel):
    score: float = Field(0.0, ge=0.0, le=5.0)
    evidence: SkillEvidence = SkillEvidence()
    source_breakdown: SkillSourceBreakdown = SkillSourceBreakdown()


class ResumeSections(BaseModel):
    education: str = ""
    projects: List[str] = []
    experience: List[str] = []
    certifications: List[str] = []
    raw_text: str = ""


class ProfileMeta(BaseModel):
    domain_preference: List[str] = []
    availability: str = ""
    location: str = ""
    institution: str = ""


class Student(Document):
    name: str
    email: str
    password_hash: str
    role: str = "student"
    resume_url: Optional[str] = None
    resume_parse_status: str = "pending"  # pending | processing | done | failed
    skill_profile: Dict[str, SkillDetail] = {}
    resume_sections: ResumeSections = ResumeSections()
    profile_meta: ProfileMeta = ProfileMeta()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "students"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "role": "student",
            }
        }
