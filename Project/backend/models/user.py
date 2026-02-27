from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class SkillProficiency(BaseModel):
    name: str
    proficiency: int = Field(ge=1, le=10, description="Skill proficiency level 1-10")


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    role: str = Field(pattern="^(applicant|recruiter)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ApplicantProfile(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    education: Optional[List[dict]] = []
    experience: Optional[List[dict]] = []
    projects: Optional[List[dict]] = []
    skills: Optional[List[SkillProficiency]] = []
    certifications: Optional[List[str]] = []
    portfolio_links: Optional[List[str]] = []
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    resume_text: Optional[str] = None


class RecruiterProfile(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
