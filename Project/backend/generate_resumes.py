"""
Generate PDF resumes for demo applicants and attach them to their MongoDB profiles.
"""
import os
import re
import uuid
import asyncio
from datetime import datetime, timezone
from fpdf import FPDF
from motor.motor_asyncio import AsyncIOMotorClient


def sanitize(text):
    """Replace non-ASCII characters with ASCII equivalents."""
    return text.encode('ascii', 'replace').decode('ascii').replace('?', ' ')

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

APPLICANTS = [
    {
        "email": "alex@student.edu",
        "name": "Alex Kumar",
        "title": "Computer Science Student",
        "phone": "+91 9876543210",
        "location": "Bangalore, India",
        "bio": "Passionate about ML and full-stack development. Seeking internship opportunities in AI/ML and software engineering.",
        "education": [
            {"degree": "B.Tech Computer Science", "institution": "IIT Delhi", "year": "2026", "gpa": "8.9/10"}
        ],
        "experience": [
            {"title": "ML Intern", "company": "Google", "duration": "3 months", "desc": "Developed NLP models for sentiment analysis using Python and TensorFlow. Improved model accuracy by 12%."},
            {"title": "Web Dev Intern", "company": "Startup XYZ", "duration": "2 months", "desc": "Built interactive React dashboards with SQL backend. Deployed via Docker."}
        ],
        "projects": [
            {"name": "Sentiment Analyzer", "desc": "Built an NLP sentiment analysis tool using Python, LSTM networks, and TensorFlow. Trained on 50K tweets.", "skills": "Python, Machine Learning, TensorFlow"},
            {"name": "Data Pipeline", "desc": "ETL pipeline for analytics using Python, SQL, and Docker. Processed 1M+ records daily.", "skills": "Python, SQL, Docker"},
            {"name": "Portfolio Website", "desc": "Personal portfolio built with React and deployed on Vercel.", "skills": "React, Git"}
        ],
        "skills": [
            ("Python", "9/10"), ("Machine Learning", "8/10"), ("React", "7/10"),
            ("SQL", "6/10"), ("TensorFlow", "7/10"), ("Docker", "5/10"), ("Git", "8/10")
        ],
        "certs": ["AWS Cloud Practitioner", "Google ML Crash Course"],
        "links": {"github": "github.com/alexkumar", "linkedin": "linkedin.com/in/alexkumar"}
    },
    {
        "email": "priya@student.edu",
        "name": "Priya Sharma",
        "title": "Data Science Graduate",
        "phone": "+91 9123456780",
        "location": "Bangalore, India",
        "bio": "Data science enthusiast with strong statistical foundations. Experienced in building dashboards and performing advanced analytics.",
        "education": [
            {"degree": "M.Sc Data Science", "institution": "IISc Bangalore", "year": "2025", "gpa": "9.2/10"}
        ],
        "experience": [
            {"title": "Data Analyst Intern", "company": "Analytics Co", "duration": "6 months", "desc": "Built interactive Tableau dashboards for sales analytics. Wrote complex SQL queries for data extraction."}
        ],
        "projects": [
            {"name": "Sales Dashboard", "desc": "Interactive Tableau dashboard for real-time sales monitoring with SQL-driven data pipeline.", "skills": "Tableau, SQL, Statistics"},
            {"name": "Census Data Analysis", "desc": "Statistical analysis of census data using R and Python. Published findings in college journal.", "skills": "R, Statistics, Python"}
        ],
        "skills": [
            ("Python", "8/10"), ("Machine Learning", "6/10"), ("SQL", "9/10"),
            ("Tableau", "8/10"), ("R", "7/10"), ("Statistics", "9/10")
        ],
        "certs": ["IBM Data Science Professional"],
        "links": {"github": "github.com/priyasharma", "linkedin": "linkedin.com/in/priyasharma"}
    },
    {
        "email": "rahul@student.edu",
        "name": "Rahul Verma",
        "title": "Full Stack Developer",
        "phone": "+91 9012345678",
        "location": "Hyderabad, India",
        "bio": "Full-stack web developer specializing in React, Node.js, and MongoDB. Passionate about building scalable web applications.",
        "education": [
            {"degree": "B.Tech IT", "institution": "NIT Warangal", "year": "2026", "gpa": "8.5/10"}
        ],
        "experience": [],
        "projects": [
            {"name": "E-Commerce App", "desc": "Full-stack online store with React frontend, Node.js backend, MongoDB database. Payment integration with Razorpay.", "skills": "React, Node.js, MongoDB"},
            {"name": "Chat App", "desc": "Real-time chat application using React, Node.js, TypeScript, and WebSockets.", "skills": "React, Node.js, TypeScript"},
            {"name": "CI/CD Pipeline", "desc": "Docker-based deployment automation for Node.js applications.", "skills": "Docker, Python"}
        ],
        "skills": [
            ("React", "9/10"), ("Node.js", "8/10"), ("TypeScript", "7/10"),
            ("MongoDB", "7/10"), ("Docker", "6/10"), ("Python", "5/10"), ("AWS", "4/10")
        ],
        "certs": ["Meta React Developer"],
        "links": {"github": "github.com/rahulverma", "linkedin": "linkedin.com/in/rahulverma"}
    }
]


def generate_resume_pdf(data):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    # -- Header --
    pdf.set_fill_color(88, 80, 200)
    pdf.rect(0, 0, 210, 40, 'F')
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_y(8)
    pdf.cell(0, 10, sanitize(data["name"]), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, sanitize(data["title"]), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 5, sanitize(f"{data['email']}  |  {data['phone']}  |  {data['location']}"), new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.ln(8)
    pdf.set_text_color(40, 40, 40)

    # -- Summary --
    _section_header(pdf, "PROFESSIONAL SUMMARY")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, sanitize(data["bio"]))
    pdf.ln(3)

    # -- Education --
    _section_header(pdf, "EDUCATION")
    for ed in data["education"]:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, sanitize(ed['degree']), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 5, sanitize(f"{ed['institution']}  |  Expected: {ed['year']}  |  GPA: {ed['gpa']}"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(40, 40, 40)
    pdf.ln(3)

    # -- Experience --
    if data["experience"]:
        _section_header(pdf, "EXPERIENCE")
        for exp in data["experience"]:
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(0, 6, sanitize(f"{exp['title']} - {exp['company']}"), new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 5, sanitize(exp["duration"]), new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(40, 40, 40)
            pdf.set_font("Helvetica", "", 9)
            pdf.multi_cell(0, 5, sanitize(f"  * {exp['desc']}"))
            pdf.ln(1)
        pdf.ln(2)

    # -- Projects --
    _section_header(pdf, "PROJECTS")
    for proj in data["projects"]:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, sanitize(proj["name"]), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5, sanitize(f"  {proj['desc']}"))
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(88, 80, 200)
        pdf.cell(0, 5, sanitize(f"  Skills: {proj['skills']}"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(40, 40, 40)
        pdf.ln(1)
    pdf.ln(2)

    # -- Skills --
    _section_header(pdf, "TECHNICAL SKILLS")
    pdf.set_font("Helvetica", "", 10)
    skills_text = "  |  ".join(f"{s[0]}: {s[1]}" for s in data["skills"])
    pdf.multi_cell(0, 6, sanitize(skills_text))
    pdf.ln(3)

    # -- Certifications --
    if data["certs"]:
        _section_header(pdf, "CERTIFICATIONS")
        pdf.set_font("Helvetica", "", 10)
        for cert in data["certs"]:
            pdf.cell(0, 6, sanitize(f"  * {cert}"), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

    # -- Links --
    _section_header(pdf, "LINKS")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(88, 80, 200)
    pdf.cell(0, 6, sanitize(f"GitHub: {data['links']['github']}  |  LinkedIn: {data['links']['linkedin']}"), new_x="LMARGIN", new_y="NEXT")

    # Save
    secure_name = f"{uuid.uuid4().hex}.pdf"
    file_path = os.path.join(UPLOAD_DIR, secure_name)
    pdf.output(file_path)
    file_size = os.path.getsize(file_path)

    return {
        "file_path": file_path,
        "original_name": f"{data['name'].replace(' ', '_')}_Resume.pdf",
        "stored_name": secure_name,
        "file_size": file_size
    }


def _section_header(pdf, title):
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(88, 80, 200)
    pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(88, 80, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)
    pdf.set_text_color(40, 40, 40)


async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["synaptix_db"]

    for data in APPLICANTS:
        result = generate_resume_pdf(data)
        print(f"Generated: {result['original_name']} ({result['file_size']} bytes)")

        resume_doc = {
            "original_name": result["original_name"],
            "stored_name": result["stored_name"],
            "file_type": "PDF",
            "file_size": result["file_size"],
            "mime_type": "application/pdf",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }

        await db.users.update_one(
            {"email": data["email"]},
            {"$set": {"resume": resume_doc}}
        )
        print(f"  Attached to {data['email']}")

    client.close()
    print("\nAll resumes generated and attached!")


if __name__ == "__main__":
    asyncio.run(main())
