"""
Seed script: Creates demo companies, job opportunities, students, and resume PDFs.
Run with: python seed_demo_data.py
"""

import requests
import os
from fpdf import FPDF

BASE = "http://localhost:8000/api"

# ─── Helper ────────────────────────────────────────────────
def register(role, data):
    r = requests.post(f"{BASE}/auth/register/{role}", json=data, timeout=15)
    if r.status_code == 201:
        j = r.json()
        print(f"  [+] Registered {role}: {data['name']} (id={j['user_id']})")
        return j
    elif r.status_code == 400:
        # Already exists — login instead
        r2 = requests.post(f"{BASE}/auth/login", json={"email": data["email"], "password": data["password"]}, timeout=15)
        if r2.status_code == 200:
            j = r2.json()
            print(f"  [=] Already exists, logged in: {data['name']} (id={j['user_id']})")
            return j
    print(f"  [!] Failed {role} {data['name']}: {r.status_code} {r.text[:100]}")
    return None

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

def create_opportunity(token, opp_data):
    r = requests.post(f"{BASE}/company/opportunities", json=opp_data, headers=auth_header(token), timeout=15)
    if r.status_code == 200:
        print(f"    [+] Created opportunity: {opp_data['title']}")
        return r.json()
    print(f"    [!] Failed: {r.status_code} {r.text[:100]}")
    return None

def make_resume_pdf(name, email, skills, experience, projects, education, certifications, filename):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    def section(title):
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(30, 30, 120)
        pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(3)

    def text(t):
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 5, t)
        pdf.ln(1)

    def bold(t):
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(0, 6, t, new_x="LMARGIN", new_y="NEXT")

    # Header
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(30, 30, 80)
    pdf.cell(0, 10, name, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 5, email, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    section("TECHNICAL SKILLS")
    text(skills)

    section("WORK EXPERIENCE")
    for exp in experience:
        bold(exp["title"])
        text(exp["desc"])

    section("PROJECTS")
    for proj in projects:
        bold(proj["title"])
        text(proj["desc"])

    section("EDUCATION")
    text(education)

    section("CERTIFICATIONS")
    text(certifications)

    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo_resumes", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pdf.output(path)
    return path


# ═══════════════════════════════════════════════════════════
#  1.  DEMO COMPANIES & OPPORTUNITIES
# ═══════════════════════════════════════════════════════════

companies = [
    {
        "reg": {"name": "TechNova Solutions", "email": "hr@technova.com", "password": "Demo@123", "industry": "Technology"},
        "opps": [
            {
                "title": "React Frontend Developer Intern",
                "description": "Join our frontend team to build modern web applications using React, TypeScript and TailwindCSS. You will work on real products used by thousands of users daily.",
                "domain": "Frontend",
                "mode": "remote",
                "duration": "3 months",
                "location": "Bangalore, India",
                "stipend": "25000/month",
                "must_have_skills": ["React", "JavaScript", "HTML", "CSS"],
                "skill_weights": {"React": 35, "JavaScript": 30, "HTML": 20, "CSS": 15},
                "min_score_threshold": 1.5,
            },
            {
                "title": "Full Stack Developer Intern",
                "description": "Work on our SaaS platform building features end-to-end. Backend in Python/FastAPI with MongoDB, frontend in React. Experience with REST APIs and Git required.",
                "domain": "Full Stack",
                "mode": "hybrid",
                "duration": "6 months",
                "location": "Hyderabad, India",
                "stipend": "30000/month",
                "must_have_skills": ["Python", "React", "MongoDB", "REST APIs"],
                "skill_weights": {"Python": 30, "React": 25, "MongoDB": 25, "REST APIs": 20},
                "min_score_threshold": 2.0,
            },
        ],
    },
    {
        "reg": {"name": "DataSphere Analytics", "email": "careers@datasphere.com", "password": "Demo@123", "industry": "Data Science"},
        "opps": [
            {
                "title": "Data Science Intern",
                "description": "Analyze large datasets, build ML models, and create data pipelines. Work with Python, Pandas, scikit-learn, and TensorFlow on real business problems.",
                "domain": "Data Science",
                "mode": "remote",
                "duration": "4 months",
                "location": "Mumbai, India",
                "stipend": "35000/month",
                "must_have_skills": ["Python", "Machine Learning", "SQL", "Pandas"],
                "skill_weights": {"Python": 30, "Machine Learning": 30, "SQL": 20, "Pandas": 20},
                "min_score_threshold": 2.0,
            },
            {
                "title": "AI/ML Engineer Intern",
                "description": "Build and deploy machine learning models for NLP and computer vision. Strong Python, TensorFlow/PyTorch knowledge required.",
                "domain": "AI/ML",
                "mode": "onsite",
                "duration": "6 months",
                "location": "Pune, India",
                "stipend": "40000/month",
                "must_have_skills": ["Python", "TensorFlow", "NLP", "Deep Learning"],
                "skill_weights": {"Python": 25, "TensorFlow": 30, "NLP": 25, "Deep Learning": 20},
                "min_score_threshold": 2.5,
            },
        ],
    },
    {
        "reg": {"name": "CloudBridge Systems", "email": "jobs@cloudbridge.io", "password": "Demo@123", "industry": "Cloud & DevOps"},
        "opps": [
            {
                "title": "Backend Developer Intern",
                "description": "Build scalable microservices using Node.js and Python. Work with Docker, AWS, and CI/CD pipelines in an agile team.",
                "domain": "Backend",
                "mode": "remote",
                "duration": "3 months",
                "location": "Remote",
                "stipend": "20000/month",
                "must_have_skills": ["Node.js", "Python", "Docker", "AWS"],
                "skill_weights": {"Node.js": 30, "Python": 25, "Docker": 25, "AWS": 20},
                "min_score_threshold": 1.8,
            },
            {
                "title": "Web Development Intern",
                "description": "Create responsive websites and web apps using HTML, CSS, JavaScript. Knowledge of React or Vue.js is a plus. Work on real client projects.",
                "domain": "Web Development",
                "mode": "remote",
                "duration": "2 months",
                "location": "Remote",
                "stipend": "15000/month",
                "must_have_skills": ["HTML", "CSS", "JavaScript"],
                "skill_weights": {"HTML": 35, "CSS": 35, "JavaScript": 30},
                "min_score_threshold": 1.2,
            },
        ],
    },
]


# ═══════════════════════════════════════════════════════════
#  2.  DEMO STUDENTS & RESUMES
# ═══════════════════════════════════════════════════════════

students = [
    {
        "reg": {"name": "Bhavana Sharma", "email": "bhavana@gmail.com", "password": "Demo@123", "domain_preference": ["Web Development", "Frontend"]},
        "resume": {
            "name": "Bhavana Sharma", "email": "bhavana@gmail.com",
            "skills": "Languages: Python, JavaScript, TypeScript, HTML, CSS, SQL\nFrontend: React.js, Next.js, TailwindCSS, Redux, HTML5, CSS3\nBackend: Node.js, Express.js, FastAPI, REST APIs\nDatabases: MongoDB, PostgreSQL, Redis\nCloud: AWS, Docker, Git, CI/CD",
            "experience": [
                {"title": "Full Stack Developer - TechCorp (Jun 2024 - Present)", "desc": "- Built 5+ React apps with Redux, 10,000+ users\n- REST APIs with Node.js and MongoDB\n- UI with HTML, CSS, TailwindCSS\n- AI search with Python and TensorFlow"},
                {"title": "Frontend Intern - StartupXYZ (Jan-May 2024)", "desc": "- React dashboards with Chart.js\n- 30+ reusable components in HTML, CSS, React\n- JWT and OAuth2 authentication"},
            ],
            "projects": [
                {"title": "AI Resume Analyzer (Python, React, FastAPI)", "desc": "- NLP resume parsing with ML ranking\n- React + TailwindCSS frontend, FastAPI backend"},
                {"title": "E-Commerce Platform (React, Node.js, MongoDB)", "desc": "- Full e-commerce with Stripe payments\n- Redux state, deployed on AWS with Docker"},
            ],
            "education": "B.Tech CS - IIT Hyderabad (2020-2024) | CGPA: 8.9/10",
            "certifications": "- AWS Cloud Practitioner (2024)\n- Meta Front-End Developer (2023)\n- Full Stack Web Dev - Udemy (2022)",
            "filename": "resume_bhavana.pdf",
        },
    },
    {
        "reg": {"name": "Arjun Patel", "email": "arjun@gmail.com", "password": "Demo@123", "domain_preference": ["Data Science", "AI/ML"]},
        "resume": {
            "name": "Arjun Patel", "email": "arjun@gmail.com",
            "skills": "Languages: Python, R, SQL, Java, C++\nML/AI: TensorFlow, PyTorch, scikit-learn, Keras, NLP, Computer Vision\nData: Pandas, NumPy, Matplotlib, Seaborn, Spark\nDatabases: PostgreSQL, MongoDB, BigQuery\nTools: Jupyter, Docker, Git, Linux, AWS SageMaker",
            "experience": [
                {"title": "ML Engineer Intern - AI Labs (Mar 2024 - Present)", "desc": "- Built NLP sentiment analysis with BERT, 92% accuracy\n- Deployed ML models on AWS SageMaker\n- Created data pipelines with Python and Spark"},
                {"title": "Data Analyst - Analytics Co (Jun-Dec 2023)", "desc": "- Analyzed 1M+ records with Python, Pandas, SQL\n- Built predictive models with scikit-learn\n- Created dashboards with Matplotlib and Tableau"},
            ],
            "projects": [
                {"title": "Image Classification (Python, TensorFlow, CNN)", "desc": "- Deep learning CNN with 95% accuracy\n- Transfer learning with ResNet50\n- Deployed on Flask API"},
                {"title": "Stock Price Predictor (Python, LSTM)", "desc": "- LSTM neural network for time series prediction\n- Feature engineering with Pandas and NumPy"},
            ],
            "education": "M.Tech AI - IIIT Bangalore (2022-2024) | CGPA: 9.1/10",
            "certifications": "- Deep Learning Specialization - Coursera (2024)\n- TensorFlow Developer Certificate (2023)\n- Python for Data Science - IBM (2023)",
            "filename": "resume_arjun.pdf",
        },
    },
    {
        "reg": {"name": "Priya Reddy", "email": "priya@gmail.com", "password": "Demo@123", "domain_preference": ["Backend", "DevOps"]},
        "resume": {
            "name": "Priya Reddy", "email": "priya@gmail.com",
            "skills": "Languages: Python, JavaScript, Go, Java, SQL\nBackend: Node.js, Express.js, Django, FastAPI, gRPC\nCloud: AWS (EC2, S3, Lambda, RDS), GCP, Docker, Kubernetes\nDatabases: PostgreSQL, MongoDB, Redis, DynamoDB\nDevOps: CI/CD, Jenkins, Terraform, GitHub Actions, Linux",
            "experience": [
                {"title": "Backend Developer - CloudFirst (Apr 2024 - Present)", "desc": "- Microservices with Node.js and Python FastAPI\n- Docker + Kubernetes on AWS ECS\n- CI/CD with GitHub Actions, 99.9% uptime\n- Redis caching, reduced latency by 70%"},
                {"title": "DevOps Intern - InfraTech (Jul-Dec 2023)", "desc": "- AWS infrastructure with Terraform\n- Docker containerization for 20+ services\n- Monitoring with Prometheus and Grafana"},
            ],
            "projects": [
                {"title": "Serverless API (Python, AWS Lambda, DynamoDB)", "desc": "- REST API handling 10K+ req/min\n- Auto-scaling with AWS Lambda\n- Infrastructure as Code with Terraform"},
                {"title": "Container Orchestration Platform (Docker, K8s)", "desc": "- Kubernetes cluster management dashboard\n- Automated deployments with Helm charts"},
            ],
            "education": "B.Tech CS - NIT Warangal (2020-2024) | CGPA: 8.5/10",
            "certifications": "- AWS Solutions Architect Associate (2024)\n- Kubernetes Admin (CKA) (2024)\n- Docker Certified Associate (2023)",
            "filename": "resume_priya.pdf",
        },
    },
    {
        "reg": {"name": "Rohan Gupta", "email": "rohan@gmail.com", "password": "Demo@123", "domain_preference": ["Web Development", "Full Stack"]},
        "resume": {
            "name": "Rohan Gupta", "email": "rohan@gmail.com",
            "skills": "Languages: JavaScript, HTML, CSS, Python, TypeScript\nFrontend: React, Angular, Vue.js, Bootstrap, SASS\nBackend: Node.js, Express, Django\nDatabases: MySQL, MongoDB, Firebase\nTools: Git, Figma, Webpack, Vite",
            "experience": [
                {"title": "Web Developer - DigitalCraft (Aug 2024 - Present)", "desc": "- Built responsive websites with HTML, CSS, JavaScript\n- React SPAs with React Router and Context API\n- Node.js backend with Express and MySQL"},
            ],
            "projects": [
                {"title": "Portfolio Website (HTML, CSS, JavaScript)", "desc": "- Responsive portfolio with CSS animations\n- Dark mode toggle, smooth scrolling"},
                {"title": "Task Manager (React, Firebase)", "desc": "- CRUD app with real-time Firebase sync\n- Material UI components, drag-and-drop"},
            ],
            "education": "B.Tech IT - VIT Vellore (2021-2025) | CGPA: 8.2/10",
            "certifications": "- Google UX Design Certificate (2024)\n- JavaScript Algorithms - freeCodeCamp (2023)",
            "filename": "resume_rohan.pdf",
        },
    },
    {
        "reg": {"name": "Sneha Nair", "email": "sneha@gmail.com", "password": "Demo@123", "domain_preference": ["Frontend", "Design"]},
        "resume": {
            "name": "Sneha Nair", "email": "sneha@gmail.com",
            "skills": "Languages: HTML, CSS, JavaScript, TypeScript\nFrontend: React.js, Next.js, TailwindCSS, Framer Motion\nDesign: Figma, Adobe XD, Sketch, UI/UX Design\nTools: Git, Storybook, Jest, Cypress",
            "experience": [
                {"title": "UI Developer - DesignHub (May 2024 - Present)", "desc": "- Built pixel-perfect UI with React and TailwindCSS\n- Component library with Storybook documentation\n- Accessibility (WCAG 2.1) audit and fixes\n- CSS animations and Framer Motion transitions"},
            ],
            "projects": [
                {"title": "Design System (React, TailwindCSS, Storybook)", "desc": "- 50+ accessible components\n- Theming with CSS custom properties\n- Automated visual regression tests"},
                {"title": "Weather App (React, API, CSS)", "desc": "- Real-time weather with animated UI\n- Responsive design with CSS Grid"},
            ],
            "education": "B.Des + B.Tech - IIIT-D (2020-2024) | CGPA: 9.0/10",
            "certifications": "- Google UX Design Professional (2024)\n- Advanced CSS and Sass - Udemy (2023)\n- React Testing Library (2023)",
            "filename": "resume_sneha.pdf",
        },
    },
]


# ═══════════════════════════════════════════════════════════
#  RUN SEED
# ═══════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("  SEEDING DEMO DATA")
print("=" * 60)

# — Companies & Opportunities —
print("\n--- Companies & Opportunities ---")
for comp in companies:
    res = register("company", comp["reg"])
    if res:
        for opp in comp["opps"]:
            create_opportunity(res["access_token"], opp)

# — Students & Resumes —
print("\n--- Students & Resumes ---")
resume_paths = []
for stu in students:
    res = register("student", stu["reg"])
    r = stu["resume"]
    path = make_resume_pdf(r["name"], r["email"], r["skills"], r["experience"], r["projects"], r["education"], r["certifications"], r["filename"])
    resume_paths.append((stu["reg"]["name"], path))
    print(f"    [+] Resume saved: {path}")

    # Upload resume if registered
    if res:
        with open(path, "rb") as f:
            try:
                up = requests.post(
                    f"{BASE}/student/resume/upload",
                    files={"file": (r["filename"], f, "application/pdf")},
                    headers=auth_header(res["access_token"]),
                    timeout=30,
                )
            except requests.exceptions.Timeout:
                print(f"    [!] Upload timed out for {stu['reg']['name']}")
                continue
            if up.status_code == 200:
                print(f"    [+] Resume uploaded for {stu['reg']['name']}")
            else:
                print(f"    [!] Upload failed: {up.status_code} {up.text[:80]}")

print("\n" + "=" * 60)
print("  DONE! Demo data seeded successfully.")
print(f"  - {sum(len(c['opps']) for c in companies)} opportunities created")
print(f"  - {len(students)} students with resumes")
print(f"  - Resume PDFs in: d:\\CodeNova\\backend\\demo_resumes\\")
print("=" * 60)
print("\nLogin credentials (all passwords: Demo@123):")
print("  Companies: hr@technova.com, careers@datasphere.com, jobs@cloudbridge.io")
print("  Students:  bhavana@gmail.com, arjun@gmail.com, priya@gmail.com, rohan@gmail.com, sneha@gmail.com")
print("  Admin:     admin@platform.com / admin123")
