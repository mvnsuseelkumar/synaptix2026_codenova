from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import get_current_user
from database import get_db
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# In-memory conversation history (per user)
conversations = {}


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


SYSTEM_PROMPT = """You are SkillNova AI Assistant — a friendly, helpful career advisor built into the SkillNova platform.

You have access to the user's profile data below. Use it to give personalized, actionable advice.

RULES:
- Be concise and friendly. Use emojis sparingly.
- Always reference the user's actual data when answering.
- If asked about jobs, compare their skills to job requirements.
- If asked about improving, suggest specific skills based on gaps.
- Never make up data — only use what's provided below.
- If a question is unrelated to career/jobs/skills, politely redirect.
- Keep responses under 200 words unless the user asks for detail.

USER PROFILE:
{profile_data}

USER'S SKILLS:
{skills_data}

USER'S APPLICATIONS:
{applications_data}

AVAILABLE JOBS:
{jobs_data}
"""


async def build_user_context(user_id: str):
    """Load all user data to inject into the AI context."""
    db = get_db()

    # Get user profile
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    profile = user.get("profile", {}) if user else {}

    profile_data = f"""
- Name: {user.get('name', 'Unknown')}
- Email: {user.get('email', '')}
- Title: {profile.get('title', 'Not set')}
- Location: {profile.get('location', 'Not set')}
- Bio: {profile.get('bio', 'Not set')}
- Phone: {profile.get('phone', 'Not set')}
- GitHub: {profile.get('github', 'Not set')}
- LinkedIn: {profile.get('linkedin', 'Not set')}
""".strip()

    # Education
    education = profile.get("education", [])
    if education:
        edu_lines = []
        for e in education:
            edu_lines.append(f"  - {e.get('degree', '')} at {e.get('institution', '')} ({e.get('year', '')}), GPA: {e.get('gpa', 'N/A')}")
        profile_data += "\n- Education:\n" + "\n".join(edu_lines)

    # Experience
    experience = profile.get("experience", [])
    if experience:
        exp_lines = []
        for e in experience:
            exp_lines.append(f"  - {e.get('role', '')} at {e.get('company', '')} ({e.get('duration', '')})")
        profile_data += "\n- Experience:\n" + "\n".join(exp_lines)

    # Projects
    projects = profile.get("projects", [])
    if projects:
        proj_lines = []
        for p in projects:
            skills_used = ", ".join(p.get("skills", []))
            proj_lines.append(f"  - {p.get('name', '')}: {p.get('description', '')} [Skills: {skills_used}]")
        profile_data += "\n- Projects:\n" + "\n".join(proj_lines)

    # Skills
    skills = profile.get("skills", [])
    if skills:
        skills_data = "\n".join([f"- {s.get('name', '')}: {s.get('proficiency', 0)}/10" for s in skills])
    else:
        skills_data = "No skills added yet."

    # Applications
    apps = await db.applications.find({"applicant_id": user_id}).to_list(20)
    if apps:
        app_lines = []
        for a in apps:
            job = await db.jobs.find_one({"_id": ObjectId(a.get("job_id", ""))})
            job_title = job.get("title", "Unknown") if job else "Unknown"
            company = job.get("company", "") if job else ""
            app_lines.append(f"- {job_title} at {company} — Status: {a.get('status', 'pending')}, Score: {a.get('match_score', 'N/A')}%")
        applications_data = "\n".join(app_lines)
    else:
        applications_data = "No applications yet."

    # Available jobs
    jobs = await db.jobs.find({"status": "active"}).to_list(20)
    if jobs:
        job_lines = []
        for j in jobs:
            req_skills = ", ".join([f"{s.get('name', '')}({s.get('weight', 0)}%)" for s in j.get("required_skills", [])])
            job_lines.append(f"- {j.get('title', '')} at {j.get('company', '')} | Location: {j.get('location', '')} | Skills: {req_skills}")
        jobs_data = "\n".join(job_lines)
    else:
        jobs_data = "No jobs currently available."

    return profile_data, skills_data, applications_data, jobs_data


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, user=Depends(get_current_user)):
    if user.get("role") != "applicant":
        raise HTTPException(403, "Chat is only available for job seekers")

    if not GEMINI_API_KEY:
        raise HTTPException(500, "Gemini API key not configured")

    user_id = str(user["_id"])

    # Build context
    profile_data, skills_data, applications_data, jobs_data = await build_user_context(user_id)

    system_prompt = SYSTEM_PROMPT.format(
        profile_data=profile_data,
        skills_data=skills_data,
        applications_data=applications_data,
        jobs_data=jobs_data
    )

    # Get or create conversation history
    if user_id not in conversations:
        conversations[user_id] = []

    history = conversations[user_id]

    # Build messages for Gemini
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=system_prompt
    )

    # Convert history to Gemini format
    gemini_history = []
    for msg in history[-10:]:  # Keep last 10 exchanges
        gemini_history.append({"role": msg["role"], "parts": [msg["text"]]})

    try:
        chat_session = model.start_chat(history=gemini_history)
        response = chat_session.send_message(req.message)
        reply = response.text

        # Save to history
        history.append({"role": "user", "text": req.message})
        history.append({"role": "model", "text": reply})

        # Trim history to last 20 messages
        if len(history) > 20:
            conversations[user_id] = history[-20:]

        return ChatResponse(reply=reply)

    except Exception as e:
        raise HTTPException(500, f"AI error: {str(e)}")


@router.delete("/history")
async def clear_history(user=Depends(get_current_user)):
    user_id = str(user["_id"])
    conversations.pop(user_id, None)
    return {"message": "Chat history cleared"}
