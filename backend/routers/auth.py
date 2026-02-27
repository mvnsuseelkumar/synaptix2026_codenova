"""Authentication routes — registration, login, and user info."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, List
import bcrypt

from models.student_model import Student, ProfileMeta
from models.company_model import Company
from utils.jwt_utils import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    """Hash password using bcrypt directly (avoids passlib/bcrypt version conflicts)."""
    pw_bytes = password.encode("utf-8")[:72]  # bcrypt 72-byte limit
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    pw_bytes = password.encode("utf-8")[:72]
    return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))


# ── Request / Response schemas ──────────────────────────

class StudentRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    domain_preference: List[str] = []


class CompanyRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    industry: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str


# ── Routes ──────────────────────────────────────────────

@router.post("/register/student", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_student(req: StudentRegisterRequest):
    """Register a new student account."""
    try:
        existing = await Student.find_one(Student.email == req.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        student = Student(
            name=req.name,
            email=req.email,
            password_hash=hash_password(req.password),
            role="student",
            profile_meta=ProfileMeta(domain_preference=req.domain_preference),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        await student.insert()

        token = create_access_token({"sub": str(student.id), "role": "student"})
        return TokenResponse(
            access_token=token, role="student",
            user_id=str(student.id), name=student.name,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register/company", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_company(req: CompanyRegisterRequest):
    """Register a new company account."""
    try:
        existing = await Company.find_one(Company.email == req.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        company = Company(
            name=req.name,
            email=req.email,
            password_hash=hash_password(req.password),
            role="company",
            industry=req.industry,
            created_at=datetime.utcnow(),
        )
        await company.insert()

        token = create_access_token({"sub": str(company.id), "role": "company"})
        return TokenResponse(
            access_token=token, role="company",
            user_id=str(company.id), name=company.name,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login with email and password. Returns JWT + role."""
    try:
        # Try student first
        student = await Student.find_one(Student.email == req.email)
        if student and verify_password(req.password, student.password_hash):
            token = create_access_token({"sub": str(student.id), "role": "student"})
            return TokenResponse(
                access_token=token, role="student",
                user_id=str(student.id), name=student.name,
            )

        # Try company
        company = await Company.find_one(Company.email == req.email)
        if company and verify_password(req.password, company.password_hash):
            token = create_access_token({"sub": str(company.id), "role": "company"})
            return TokenResponse(
                access_token=token, role="company",
                user_id=str(company.id), name=company.name,
            )

        # Check for admin (simple hardcoded admin for demo)
        if req.email == "admin@platform.com" and req.password == "admin123":
            token = create_access_token({"sub": "admin", "role": "admin"})
            return TokenResponse(
                access_token=token, role="admin",
                user_id="admin", name="Admin",
            )

        raise HTTPException(status_code=401, detail="Invalid email or password")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info from token."""
    try:
        if current_user["role"] == "student":
            student = await Student.get(current_user["user_id"])
            if not student:
                raise HTTPException(status_code=404, detail="User not found")
            return {
                "id": str(student.id),
                "name": student.name,
                "email": student.email,
                "role": "student",
                "resume_parse_status": student.resume_parse_status,
                "skills_count": len(student.skill_profile),
            }
        elif current_user["role"] == "company":
            company = await Company.get(current_user["user_id"])
            if not company:
                raise HTTPException(status_code=404, detail="User not found")
            return {
                "id": str(company.id),
                "name": company.name,
                "email": company.email,
                "role": "company",
                "industry": company.industry,
            }
        elif current_user["role"] == "admin":
            return {
                "id": "admin",
                "name": "Admin",
                "email": "admin@platform.com",
                "role": "admin",
            }
        raise HTTPException(status_code=400, detail="Unknown role")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout — client should discard token."""
    return {"message": "Logged out successfully"}
