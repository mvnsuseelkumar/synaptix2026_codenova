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

    # --- 10 New Recruiters ---
    rec3 = await db.users.insert_one({
        "email": "talent@cloudnine.dev",
        "password": hashed,
        "name": "Emily Rodriguez",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "CloudNine Solutions",
            "designation": "Head of Engineering Recruitment",
            "company_website": "https://cloudnine.dev",
            "company_description": "Cloud infrastructure and DevOps automation startup",
            "location": "Austin, TX"
        }
    })

    rec4 = await db.users.insert_one({
        "email": "careers@greentech.eco",
        "password": hashed,
        "name": "Michael Patel",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "GreenTech Innovations",
            "designation": "People Operations Lead",
            "company_website": "https://greentech.eco",
            "company_description": "Sustainable energy solutions powered by AI",
            "location": "Portland, OR"
        }
    })

    rec5 = await db.users.insert_one({
        "email": "hiring@finedge.com",
        "password": hashed,
        "name": "Anita Desai",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "FinEdge Capital",
            "designation": "Technical Recruiter",
            "company_website": "https://finedge.com",
            "company_description": "Fintech platform for algorithmic trading and portfolio management",
            "location": "Chicago, IL"
        }
    })

    rec6 = await db.users.insert_one({
        "email": "jobs@cybershield.io",
        "password": hashed,
        "name": "David Kim",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "CyberShield Security",
            "designation": "Talent Acquisition Manager",
            "company_website": "https://cybershield.io",
            "company_description": "Enterprise cybersecurity and threat intelligence platform",
            "location": "Washington, DC"
        }
    })

    rec7 = await db.users.insert_one({
        "email": "recruit@healthbyte.med",
        "password": hashed,
        "name": "Dr. Lisa Chang",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "HealthByte",
            "designation": "Director of Engineering",
            "company_website": "https://healthbyte.med",
            "company_description": "AI-powered healthcare diagnostics and telemedicine",
            "location": "Boston, MA"
        }
    })

    rec8 = await db.users.insert_one({
        "email": "hr@eduspark.learn",
        "password": hashed,
        "name": "Nathan Brooks",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "EduSpark",
            "designation": "HR Business Partner",
            "company_website": "https://eduspark.learn",
            "company_description": "EdTech platform for personalized adaptive learning",
            "location": "Seattle, WA"
        }
    })

    rec9 = await db.users.insert_one({
        "email": "talent@gameforge.gg",
        "password": hashed,
        "name": "Samantha Lee",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "GameForge Studios",
            "designation": "Studio Recruiter",
            "company_website": "https://gameforge.gg",
            "company_description": "Indie game development studio specializing in multiplayer games",
            "location": "Los Angeles, CA"
        }
    })

    rec10 = await db.users.insert_one({
        "email": "careers@logicore.tech",
        "password": hashed,
        "name": "Robert Nguyen",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "LogiCore Systems",
            "designation": "VP of Talent",
            "company_website": "https://logicore.tech",
            "company_description": "Supply chain optimization and logistics intelligence platform",
            "location": "Dallas, TX"
        }
    })

    rec11 = await db.users.insert_one({
        "email": "hiring@designpulse.co",
        "password": hashed,
        "name": "Maya Thompson",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "DesignPulse",
            "designation": "Creative Talent Lead",
            "company_website": "https://designpulse.co",
            "company_description": "UI/UX design agency and design system consultancy",
            "location": "Denver, CO"
        }
    })

    rec12 = await db.users.insert_one({
        "email": "jobs@quantumleap.ai",
        "password": hashed,
        "name": "Dr. Alan Foster",
        "role": "recruiter",
        "created_at": now,
        "profile": {
            "company": "QuantumLeap AI",
            "designation": "Chief People Officer",
            "company_website": "https://quantumleap.ai",
            "company_description": "Quantum computing research and AI hardware accelerators",
            "location": "Cambridge, MA"
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
                {"title": "ML Intern", "company": "Google", "duration": "3 months", "description": "Worked on NLP models using Python and TensorFlow"},
                {"title": "Web Dev Intern", "company": "Startup XYZ", "duration": "2 months", "description": "Built React dashboards with SQL databases"}
            ],
            "projects": [
                {"name": "Sentiment Analyzer", "description": "NLP sentiment analysis tool", "skills_used": ["Python", "Machine Learning", "TensorFlow"], "duration_months": 4, "complexity": "high"},
                {"name": "Portfolio Website", "description": "Personal site with React", "skills_used": ["React", "Git"], "duration_months": 1, "complexity": "low"},
                {"name": "Data Pipeline", "description": "ETL pipeline for analytics", "skills_used": ["Python", "SQL", "Docker"], "duration_months": 3, "complexity": "medium"}
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
                {"title": "Data Analyst Intern", "company": "Analytics Co", "duration": "6 months", "description": "Built dashboards using SQL and Tableau"}
            ],
            "projects": [
                {"name": "Sales Dashboard", "description": "Interactive Tableau dashboard", "skills_used": ["Tableau", "SQL", "Statistics"], "duration_months": 2, "complexity": "medium"},
                {"name": "Census Data Analysis", "description": "Statistical analysis with R", "skills_used": ["R", "Statistics", "Python"], "duration_months": 3, "complexity": "high"}
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
            "projects": [
                {"name": "E-Commerce App", "description": "Full-stack online store", "skills_used": ["React", "Node.js", "MongoDB"], "duration_months": 5, "complexity": "high"},
                {"name": "Chat App", "description": "Real-time chat with WebSockets", "skills_used": ["React", "Node.js", "TypeScript"], "duration_months": 2, "complexity": "medium"},
                {"name": "CI/CD Pipeline", "description": "Docker deployment automation", "skills_used": ["Docker", "Python"], "duration_months": 1, "complexity": "medium"}
            ],
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

    # Create jobs (original 3)
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

    # --- 10 New Jobs (one per new recruiter) ---

    job4 = await db.jobs.insert_one({
        "title": "Cloud Infrastructure Intern",
        "description": "Help design and manage scalable cloud architectures on AWS and GCP. You'll work with Kubernetes, Terraform, and CI/CD pipelines to automate deployments and ensure 99.9% uptime for our SaaS products.",
        "company": "CloudNine Solutions",
        "location": "Austin, TX (Hybrid)",
        "job_type": "internship",
        "required_skills": [
            {"name": "AWS", "weight": 30, "min_proficiency": 5},
            {"name": "Docker", "weight": 25, "min_proficiency": 5},
            {"name": "Python", "weight": 20, "min_proficiency": 6},
            {"name": "Git", "weight": 15, "min_proficiency": 5},
            {"name": "SQL", "weight": 10, "min_proficiency": 4}
        ],
        "experience_level": "intermediate",
        "complexity": "high",
        "duration": "6 months",
        "stipend": "$3500/month",
        "recruiter_id": str(rec3.inserted_id),
        "recruiter_name": "Emily Rodriguez",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job5 = await db.jobs.insert_one({
        "title": "Sustainability Data Analyst",
        "description": "Analyze energy consumption patterns and carbon footprint data to drive actionable insights for renewable energy optimization. Work with large IoT sensor datasets and create compelling visualizations for stakeholders.",
        "company": "GreenTech Innovations",
        "location": "Portland, OR (Remote OK)",
        "job_type": "project",
        "required_skills": [
            {"name": "Python", "weight": 30, "min_proficiency": 7},
            {"name": "SQL", "weight": 25, "min_proficiency": 6},
            {"name": "Statistics", "weight": 20, "min_proficiency": 5},
            {"name": "Tableau", "weight": 15, "min_proficiency": 4},
            {"name": "R", "weight": 10, "min_proficiency": 3}
        ],
        "experience_level": "beginner",
        "complexity": "medium",
        "duration": "4 months",
        "stipend": "$2200/month",
        "recruiter_id": str(rec4.inserted_id),
        "recruiter_name": "Michael Patel",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job6 = await db.jobs.insert_one({
        "title": "Quantitative Developer Intern",
        "description": "Build high-performance trading algorithms and risk analysis tools. You'll work closely with quants to implement backtesting frameworks, optimize execution strategies, and develop real-time market data pipelines.",
        "company": "FinEdge Capital",
        "location": "Chicago, IL",
        "job_type": "internship",
        "required_skills": [
            {"name": "Python", "weight": 35, "min_proficiency": 8},
            {"name": "SQL", "weight": 20, "min_proficiency": 6},
            {"name": "Statistics", "weight": 20, "min_proficiency": 6},
            {"name": "Machine Learning", "weight": 15, "min_proficiency": 5},
            {"name": "Git", "weight": 10, "min_proficiency": 5}
        ],
        "experience_level": "advanced",
        "complexity": "high",
        "duration": "6 months",
        "stipend": "$5000/month",
        "recruiter_id": str(rec5.inserted_id),
        "recruiter_name": "Anita Desai",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job7 = await db.jobs.insert_one({
        "title": "Cybersecurity Analyst Intern",
        "description": "Join our security operations center to monitor threats, perform vulnerability assessments, and develop automated incident response tools. Gain hands-on experience with penetration testing and SIEM platforms.",
        "company": "CyberShield Security",
        "location": "Washington, DC (Hybrid)",
        "job_type": "internship",
        "required_skills": [
            {"name": "Python", "weight": 30, "min_proficiency": 6},
            {"name": "Docker", "weight": 20, "min_proficiency": 4},
            {"name": "SQL", "weight": 20, "min_proficiency": 5},
            {"name": "Git", "weight": 15, "min_proficiency": 5},
            {"name": "AWS", "weight": 15, "min_proficiency": 3}
        ],
        "experience_level": "intermediate",
        "complexity": "high",
        "duration": "5 months",
        "stipend": "$3200/month",
        "recruiter_id": str(rec6.inserted_id),
        "recruiter_name": "David Kim",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job8 = await db.jobs.insert_one({
        "title": "Healthcare AI Research Intern",
        "description": "Work on deep learning models for medical image analysis and patient outcome prediction. Collaborate with clinicians to validate model accuracy and integrate ML pipelines into our diagnostic platform.",
        "company": "HealthByte",
        "location": "Boston, MA",
        "job_type": "internship",
        "required_skills": [
            {"name": "Python", "weight": 30, "min_proficiency": 7},
            {"name": "Machine Learning", "weight": 30, "min_proficiency": 7},
            {"name": "TensorFlow", "weight": 20, "min_proficiency": 5},
            {"name": "Statistics", "weight": 10, "min_proficiency": 5},
            {"name": "Docker", "weight": 10, "min_proficiency": 3}
        ],
        "experience_level": "advanced",
        "complexity": "high",
        "duration": "6 months",
        "stipend": "$4000/month",
        "recruiter_id": str(rec7.inserted_id),
        "recruiter_name": "Dr. Lisa Chang",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job9 = await db.jobs.insert_one({
        "title": "EdTech Frontend Developer",
        "description": "Design and build interactive learning modules, gamified quizzes, and student dashboards. You'll use React and TypeScript to create accessible, responsive interfaces that make learning fun and engaging.",
        "company": "EduSpark",
        "location": "Seattle, WA (Remote OK)",
        "job_type": "project",
        "required_skills": [
            {"name": "React", "weight": 35, "min_proficiency": 7},
            {"name": "TypeScript", "weight": 25, "min_proficiency": 6},
            {"name": "Node.js", "weight": 20, "min_proficiency": 5},
            {"name": "MongoDB", "weight": 10, "min_proficiency": 4},
            {"name": "Git", "weight": 10, "min_proficiency": 5}
        ],
        "experience_level": "intermediate",
        "complexity": "medium",
        "duration": "3 months",
        "stipend": "$2800/month",
        "recruiter_id": str(rec8.inserted_id),
        "recruiter_name": "Nathan Brooks",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job10 = await db.jobs.insert_one({
        "title": "Game Backend Developer Intern",
        "description": "Build scalable multiplayer game servers, matchmaking systems, and real-time leaderboards. You'll work with Node.js, Redis, and WebSockets to deliver low-latency experiences for thousands of concurrent players.",
        "company": "GameForge Studios",
        "location": "Los Angeles, CA",
        "job_type": "internship",
        "required_skills": [
            {"name": "Node.js", "weight": 30, "min_proficiency": 6},
            {"name": "TypeScript", "weight": 25, "min_proficiency": 5},
            {"name": "MongoDB", "weight": 20, "min_proficiency": 5},
            {"name": "Docker", "weight": 15, "min_proficiency": 4},
            {"name": "Git", "weight": 10, "min_proficiency": 5}
        ],
        "experience_level": "intermediate",
        "complexity": "high",
        "duration": "5 months",
        "stipend": "$3000/month",
        "recruiter_id": str(rec9.inserted_id),
        "recruiter_name": "Samantha Lee",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job11 = await db.jobs.insert_one({
        "title": "Supply Chain ML Engineer",
        "description": "Develop predictive models for demand forecasting, route optimization, and inventory management. Apply machine learning to real-world logistics problems and work with massive transactional datasets.",
        "company": "LogiCore Systems",
        "location": "Dallas, TX (Hybrid)",
        "job_type": "project",
        "required_skills": [
            {"name": "Python", "weight": 30, "min_proficiency": 7},
            {"name": "Machine Learning", "weight": 25, "min_proficiency": 6},
            {"name": "SQL", "weight": 20, "min_proficiency": 6},
            {"name": "Statistics", "weight": 15, "min_proficiency": 5},
            {"name": "Docker", "weight": 10, "min_proficiency": 3}
        ],
        "experience_level": "intermediate",
        "complexity": "high",
        "duration": "4 months",
        "stipend": "$3500/month",
        "recruiter_id": str(rec10.inserted_id),
        "recruiter_name": "Robert Nguyen",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job12 = await db.jobs.insert_one({
        "title": "UI/UX Design System Intern",
        "description": "Help build and maintain a comprehensive design system with reusable components, design tokens, and accessibility guidelines. You'll bridge design and engineering by creating React component libraries with Storybook documentation.",
        "company": "DesignPulse",
        "location": "Denver, CO (Remote OK)",
        "job_type": "internship",
        "required_skills": [
            {"name": "React", "weight": 35, "min_proficiency": 6},
            {"name": "TypeScript", "weight": 25, "min_proficiency": 5},
            {"name": "Git", "weight": 20, "min_proficiency": 5},
            {"name": "Node.js", "weight": 10, "min_proficiency": 3},
            {"name": "Docker", "weight": 10, "min_proficiency": 2}
        ],
        "experience_level": "beginner",
        "complexity": "medium",
        "duration": "3 months",
        "stipend": "$2500/month",
        "recruiter_id": str(rec11.inserted_id),
        "recruiter_name": "Maya Thompson",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    job13 = await db.jobs.insert_one({
        "title": "Quantum Computing Research Intern",
        "description": "Explore quantum algorithm implementations, benchmark quantum circuits, and contribute to our open-source quantum simulation toolkit. Work at the intersection of physics, mathematics, and computer science.",
        "company": "QuantumLeap AI",
        "location": "Cambridge, MA",
        "job_type": "internship",
        "required_skills": [
            {"name": "Python", "weight": 35, "min_proficiency": 8},
            {"name": "Machine Learning", "weight": 25, "min_proficiency": 6},
            {"name": "Statistics", "weight": 20, "min_proficiency": 7},
            {"name": "Git", "weight": 10, "min_proficiency": 5},
            {"name": "Docker", "weight": 10, "min_proficiency": 3}
        ],
        "experience_level": "advanced",
        "complexity": "high",
        "duration": "6 months",
        "stipend": "$4500/month",
        "recruiter_id": str(rec12.inserted_id),
        "recruiter_name": "Dr. Alan Foster",
        "status": "active",
        "created_at": now,
        "applicant_count": 0
    })

    print("✅ Database seeded successfully!")
    print(f"  Recruiters: 12")
    print(f"    Original: recruiter@techcorp.com, hr@dataflow.io")
    print(f"    New: talent@cloudnine.dev, careers@greentech.eco, hiring@finedge.com,")
    print(f"         jobs@cybershield.io, recruit@healthbyte.med, hr@eduspark.learn,")
    print(f"         talent@gameforge.gg, careers@logicore.tech, hiring@designpulse.co,")
    print(f"         jobs@quantumleap.ai")
    print(f"  Applicants: 3 (alex@student.edu, priya@student.edu, rahul@student.edu)")
    print(f"  Jobs: 13")
    print(f"  Password for all: password123")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
