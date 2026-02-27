from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SkillRequirement(BaseModel):
    name: str
    weight: float = Field(ge=0, le=100, description="Weight percentage for this skill")
    min_proficiency: int = Field(default=1, ge=1, le=10)


class JobCreate(BaseModel):
    title: str
    description: str
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: str = Field(default="internship", pattern="^(internship|project|full-time|part-time)$")
    required_skills: List[SkillRequirement]
    experience_level: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced|expert)$")
    complexity: str = Field(default="medium", pattern="^(low|medium|high|expert)$")
    duration: Optional[str] = None
    stipend: Optional[str] = None
    deadline: Optional[str] = None
    max_applicants: Optional[int] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    required_skills: Optional[List[SkillRequirement]] = None
    experience_level: Optional[str] = None
    complexity: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None


class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: str
    required_skills: List[dict]
    experience_level: str
    complexity: str
    duration: Optional[str] = None
    stipend: Optional[str] = None
    deadline: Optional[str] = None
    recruiter_id: str
    recruiter_name: Optional[str] = None
    status: str = "active"
    created_at: Optional[str] = None
    applicant_count: Optional[int] = 0
