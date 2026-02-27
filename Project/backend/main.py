from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
from database import connect_db, close_db
from routes.auth_routes import router as auth_router
from routes.job_routes import router as job_router
from routes.applicant_routes import router as applicant_router
from routes.recruiter_routes import router as recruiter_router
from routes.matching_routes import router as matching_router
from routes.resume_routes import router as resume_router
from routes.chat_routes import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="SkillNova — Explainable Skill-Based Matching Platform",
    description="AI-powered internship & project matching with transparent scoring",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(job_router)
app.include_router(applicant_router)
app.include_router(recruiter_router)
app.include_router(matching_router)
app.include_router(resume_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    return {"message": "Synaptix API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
