"""
Resume / Document Upload Routes
- Upload resume (PDF, DOC, DOCX) - max 5MB
- Download resume (recruiter or owner)
- Delete resume (owner only)
"""
import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from bson import ObjectId
from auth import get_current_user, require_applicant, require_recruiter
from database import get_db

router = APIRouter(prefix="/api/resume", tags=["Resume"])

# Config
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "resumes")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_MIMES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
BLOCKED_EXTENSIONS = {".exe", ".bat", ".cmd", ".sh", ".js", ".py", ".ps1", ".vbs", ".msi"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _validate_file(file: UploadFile):
    """Validate file extension, MIME type, and block dangerous files."""
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    ext = os.path.splitext(file.filename)[1].lower()

    if ext in BLOCKED_EXTENSIONS:
        raise HTTPException(400, f"File type {ext} is not allowed for security reasons")

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Only PDF, DOC, DOCX files are accepted. Got: {ext}")

    if file.content_type and file.content_type not in ALLOWED_MIMES:
        # Some browsers send generic type, allow if extension is valid
        if file.content_type != "application/octet-stream":
            raise HTTPException(400, f"Invalid MIME type: {file.content_type}")


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(require_applicant)
):
    """Upload or replace resume. Max 5MB, PDF/DOC/DOCX only."""
    _validate_file(file)

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, f"File size exceeds 5MB limit ({len(contents) / (1024*1024):.1f}MB)")

    # Generate secure filename
    ext = os.path.splitext(file.filename)[1].lower()
    secure_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, secure_name)

    # Delete old resume file if exists
    db = get_db()
    existing = await db.users.find_one({"_id": ObjectId(user["_id"])})
    if existing and existing.get("resume", {}).get("stored_name"):
        old_path = os.path.join(UPLOAD_DIR, existing["resume"]["stored_name"])
        if os.path.exists(old_path):
            os.remove(old_path)

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Update user record
    resume_doc = {
        "original_name": file.filename,
        "stored_name": secure_name,
        "file_type": ext.replace(".", "").upper(),
        "file_size": len(contents),
        "mime_type": file.content_type or "application/octet-stream",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }

    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"resume": resume_doc}}
    )

    return {
        "message": "Resume uploaded successfully",
        "resume": {
            "file_name": file.filename,
            "file_type": resume_doc["file_type"],
            "file_size": resume_doc["file_size"],
            "uploaded_at": resume_doc["uploaded_at"]
        }
    }


@router.get("/me")
async def get_my_resume_info(user: dict = Depends(require_applicant)):
    """Get current user's resume metadata."""
    resume = user.get("resume")
    if not resume:
        return {"resume": None}
    return {
        "resume": {
            "file_name": resume.get("original_name", ""),
            "file_type": resume.get("file_type", ""),
            "file_size": resume.get("file_size", 0),
            "uploaded_at": resume.get("uploaded_at", "")
        }
    }


@router.get("/download")
async def download_my_resume(user: dict = Depends(require_applicant)):
    """Download own resume."""
    resume = user.get("resume")
    if not resume or not resume.get("stored_name"):
        raise HTTPException(404, "No resume uploaded")

    file_path = os.path.join(UPLOAD_DIR, resume["stored_name"])
    if not os.path.exists(file_path):
        raise HTTPException(404, "Resume file not found on server")

    return FileResponse(
        path=file_path,
        filename=resume.get("original_name", "resume"),
        media_type=resume.get("mime_type", "application/octet-stream")
    )


@router.get("/applicant/{applicant_id}")
async def get_applicant_resume(applicant_id: str, user: dict = Depends(require_recruiter)):
    """Recruiter: download an applicant's resume."""
    db = get_db()
    applicant = await db.users.find_one({"_id": ObjectId(applicant_id), "role": "applicant"})
    if not applicant:
        raise HTTPException(404, "Applicant not found")

    resume = applicant.get("resume")
    if not resume or not resume.get("stored_name"):
        raise HTTPException(404, "Applicant has not uploaded a resume")

    file_path = os.path.join(UPLOAD_DIR, resume["stored_name"])
    if not os.path.exists(file_path):
        raise HTTPException(404, "Resume file not found on server")

    return FileResponse(
        path=file_path,
        filename=resume.get("original_name", "resume"),
        media_type=resume.get("mime_type", "application/octet-stream")
    )


@router.get("/applicant/{applicant_id}/info")
async def get_applicant_resume_info(applicant_id: str, user: dict = Depends(require_recruiter)):
    """Recruiter: get resume metadata for an applicant."""
    db = get_db()
    applicant = await db.users.find_one({"_id": ObjectId(applicant_id), "role": "applicant"})
    if not applicant:
        raise HTTPException(404, "Applicant not found")

    resume = applicant.get("resume")
    if not resume:
        return {"resume": None}

    return {
        "resume": {
            "file_name": resume.get("original_name", ""),
            "file_type": resume.get("file_type", ""),
            "file_size": resume.get("file_size", 0),
            "uploaded_at": resume.get("uploaded_at", "")
        }
    }


@router.delete("/delete")
async def delete_resume(user: dict = Depends(require_applicant)):
    """Delete own resume."""
    db = get_db()
    full_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    resume = full_user.get("resume") if full_user else None

    if not resume or not resume.get("stored_name"):
        raise HTTPException(404, "No resume to delete")

    # Delete file
    file_path = os.path.join(UPLOAD_DIR, resume["stored_name"])
    if os.path.exists(file_path):
        os.remove(file_path)

    # Clear from DB
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$unset": {"resume": ""}}
    )

    return {"message": "Resume deleted successfully"}
