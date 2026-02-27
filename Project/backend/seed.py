"""
Seed script to populate the database with demo data for testing.
Run with: python seed.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
from config import MONGODB_URL, DATABASE_NAME

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Clear existing data
    await db.users.delete_many({})
    await db.jobs.delete_many({})
    await db.applications.delete_many({})
    await db.audit_logs.delete_many({})

    now = datetime.now(timezone.utc).isoformat()
    hashed = pwd_context.hash("password123")

    # Create recruiters
    rec1 = await db.users.insert_one({
        "email": "recruiter@techcorp.com",
        "password": hashed,
        "name": "Sarah Chen",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "TechCorp AI",
            "designation": "Senior Talent Acquisition",
            "company_website": "https://techcorp.ai",
            "company_description": "Leading AI research company",
            "location": "San Francisco, CA"
        }
    })

    rec2 = await db.users.insert_one({
        "email": "hr@dataflow.io",
        "password": hashed,
        "name": "James Wilson",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "DataFlow",
            "designation": "HR Manager",
            "company_website": "https://dataflow.io",
            "company_description": "Data analytics platform",
            "location": "New York, NY"
        }
    })

    # Create applicants
    app1 = await db.users.insert_one({
        "email": "alex@student.edu",
        "password": hashed,
        "name": "Alex Kumar",
        "role": "applicant",
        "created_at": now,
        "profile": {
            "title": "Computer Science Student",
            "bio": "Passionate about ML and full-stack development",
            "location": "Bangalore, India",
            "phone": "+91 9876543210",
            "education": [
                {"degree": "B.Tech Computer Science", "institution": "IIT Delhi", "year": "2026", "gpa": "8.9"}
            ],
            "experience": [
                {"title": "ML Intern", "company": "Google", "duration": "3 months", "description": "Worked on NLP models"},
                {"title": "Web Dev Intern", "company": "Startup XYZ", "duration": "2 months", "description": "Built React dashboards"}
            ],
            "skills": [
                {"name": "Python", "proficiency": 9},
                {"name": "Machine Learning", "proficiency": 8},
                {"name": "React", "proficiency": 7},
                {"name": "SQL", "proficiency": 6},
                {"name": "TensorFlow", "proficiency": 7},
                {"name": "Docker", "proficiency": 5},
                {"name": "Git", "proficiency": 8}
            ],
            "certifications": ["AWS Cloud Practitioner", "Google ML Crash Course"],
            "portfolio_links": ["https://alexkumar.dev"],
            "github_url": "https://github.com/alexkumar",
            "linkedin_url": "https://linkedin.com/in/alexkumar"
        }
    })

    app2 = await db.users.insert_one({
        "email": "priya@student.edu",
        "password": hashed,
        "name": "Priya Sharma",
        "role": "applicant",
        "created_at": now,
        "profile": {
            "title": "Data Science Enthusiast",
            "bio": "Focused on data visualization and statistical analysis",
            "location": "Mumbai, India",
            "education": [
                {"degree": "M.Sc Data Science", "institution": "IISc Bangalore", "year": "2025", "gpa": "9.2"}
            ],
            "experience": [
                {"title": "Data Analyst Intern", "company": "Analytics Co", "duration": "6 months", "description": "Built dashboards"}
            ],
            "skills": [
                {"name": "Python", "proficiency": 8},
                {"name": "Machine Learning", "proficiency": 6},
                {"name": "SQL", "proficiency": 9},
                {"name": "Tableau", "proficiency": 8},
                {"name": "R", "proficiency": 7},
                {"name": "Statistics", "proficiency": 9}
            ],
            "certifications": ["IBM Data Science Professional"],
            "github_url": "https://github.com/priyasharma"
        }
    })

    app3 = await db.users.insert_one({
        "email": "rahul@student.edu",
        "password": hashed,
        "name": "Rahul Verma",
        "role": "applicant",
        "created_at": now,
        "profile": {
            "title": "Full Stack Developer",
            "bio": "Building scalable web applications",
            "location": "Hyderabad, India",
            "education": [
                {"degree": "B.Tech IT", "institution": "NIT Warangal", "year": "2026", "gpa": "8.5"}
            ],
            "experience": [],
            "skills": [
                {"name": "React", "proficiency": 9},
                {"name": "Node.js", "proficiency": 8},
                {"name": "TypeScript", "proficiency": 7},
                {"name": "MongoDB", "proficiency": 7},
                {"name": "Docker", "proficiency": 6},
                {"name": "Python", "proficiency": 5},
                {"name": "AWS", "proficiency": 4}
            ],
            "certifications": ["Meta React Developer"],
            "github_url": "https://github.com/rahulverma"
        }
    })

    # Create jobs
    job1 = await db.jobs.insert_one({
        "title": "Machine Learning Engineering Intern",
        "description": "Work on cutting-edge NLP and computer vision models. You'll join our AI research team to build production-ready ML pipelines, train and deploy models, and contribute to open-source projects.",
        "company": "TechCorp AI",
        "location": "San Francisco, CA (Remote OK)",
        "job_type": "internship",
        "required_skills": [
            {"name": "Python", "weight": 30, "min_proficiency": 7},
            {"name": "Machine Learning", "weight": 25, "min_proficiency": 6},
            {"name": "TensorFlow", "weight": 15, "min_proficiency": 5},
            {"name": "SQL", "weight": 10, "min_proficiency": 4},
            {"name": "Docker", "weight": 10, "min_proficiency": 3},
            {"name": "Git", "weight": 10, "min_proficiency": 5}
        ],
        "experience_level": "intermediate",
        "complexity": "high",
        "duration": "6 months",
        "stipend": "$3000/month",
        "recruiter_id": str(rec1.inserted_id),
        "recruiter_name": "Sarah Chen",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job2 = await db.jobs.insert_one({
        "title": "Data Analytics Project Associate",
        "description": "Join our analytics team to build dashboards, derive insights from large datasets, and present findings to stakeholders. Requires strong SQL, Python, and data visualization skills.",
        "company": "DataFlow",
        "location": "New York, NY",
        "job_type": "project",
        "required_skills": [
            {"name": "SQL", "weight": 30, "min_proficiency": 7},
            {"name": "Python", "weight": 25, "min_proficiency": 6},
            {"name": "Tableau", "weight": 20, "min_proficiency": 5},
            {"name": "Statistics", "weight": 15, "min_proficiency": 5},
            {"name": "R", "weight": 10, "min_proficiency": 3}
        ],
        "experience_level": "beginner",
        "complexity": "medium",
        "duration": "3 months",
        "stipend": "$2000/month",
        "recruiter_id": str(rec2.inserted_id),
        "recruiter_name": "James Wilson",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job3 = await db.jobs.insert_one({
        "title": "Full Stack Web Developer Intern",
        "description": "Build and maintain our customer-facing web platform using React, Node.js, and MongoDB. You'll work on new features, optimize performance, and implement responsive designs.",
        "company": "TechCorp AI",
        "location": "Remote",
        "job_type": "internship",
        "required_skills": [
            {"name": "React", "weight": 30, "min_proficiency": 6},
            {"name": "Node.js", "weight": 25, "min_proficiency": 5},
            {"name": "TypeScript", "weight": 15, "min_proficiency": 4},
            {"name": "MongoDB", "weight": 15, "min_proficiency": 4},
            {"name": "Docker", "weight": 10, "min_proficiency": 3},
            {"name": "Git", "weight": 5, "min_proficiency": 4}
        ],
        "experience_level": "beginner",
        "complexity": "medium",
        "duration": "4 months",
        "stipend": "$2500/month",
        "recruiter_id": str(rec1.inserted_id),
        "recruiter_name": "Sarah Chen",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    print("✅ Database seeded successfully!")
    print(f"  Recruiters: 2 (recruiter@techcorp.com, hr@dataflow.io)")
    print(f"  Applicants: 3 (alex@student.edu, priya@student.edu, rahul@student.edu)")
    print(f"  Jobs: 3")
    print(f"  Password for all: password123")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
