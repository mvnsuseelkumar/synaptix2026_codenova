"""Generate a sample resume PDF that will score well with the platform's parser."""

from fpdf import FPDF
import os


pdf = FPDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

def section(title):
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 30, 120)
    pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(30, 30, 120)
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
pdf.set_font("Helvetica", "B", 20)
pdf.set_text_color(30, 30, 80)
pdf.cell(0, 12, "Bhavana Sharma", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Helvetica", "", 9)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 5, "bhavana@gmail.com | +91-9876543210 | Hyderabad | github.com/bhavanasharma", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(4)

# Summary
section("PROFESSIONAL SUMMARY")
text("Full-stack developer with 2+ years experience building web applications using React, Node.js, Python and cloud technologies. Strong in HTML, CSS, JavaScript, TypeScript with AI/ML knowledge.")

# Skills
section("TECHNICAL SKILLS")
text("Languages: Python, JavaScript, TypeScript, HTML, CSS, SQL, Java, C++")
text("Frontend: React.js, Next.js, TailwindCSS, Redux, HTML5, CSS3, Responsive Design")
text("Backend: Node.js, Express.js, FastAPI, Django, REST APIs, GraphQL")
text("Databases: MongoDB, PostgreSQL, MySQL, Redis, Firebase")
text("Cloud/DevOps: AWS (EC2, S3, Lambda), Docker, Git, CI/CD, Vercel")
text("AI/ML: TensorFlow, scikit-learn, NLP, Pandas, NumPy")

# Experience
section("WORK EXPERIENCE")
bold("Full Stack Developer - TechCorp Solutions (Jun 2024 - Present)")
text("- Built 5+ production React apps with Redux, serving 10,000+ daily users\n- Developed REST APIs with Node.js, Express.js and MongoDB, 99.9% uptime\n- Implemented responsive UI with HTML, CSS, TailwindCSS, Lighthouse 95+\n- Integrated AI search using Python and TensorFlow, +40% engagement\n- Led JavaScript to TypeScript migration, -60% runtime errors")

bold("Frontend Developer Intern - StartupXYZ (Jan 2024 - May 2024)")
text("- Built interactive dashboards with React.js, Chart.js and CSS animations\n- Created 30+ reusable UI components using HTML, CSS and React\n- Implemented JWT and OAuth2 authentication flows\n- Optimized web performance, -50% page load time via code splitting")

bold("Web Developer Intern - Digital Agency (Jun 2023 - Dec 2023)")
text("- Built 10+ client websites using HTML, CSS, JavaScript and WordPress\n- Developed e-commerce platform with Python Django and PostgreSQL\n- Achieved 100% mobile compatibility using CSS Grid and Flexbox")

# Projects
section("PROJECTS")
bold("AI Resume Analyzer (Python, React, FastAPI)")
text("- Full-stack app using NLP for resume parsing and ML for candidate ranking\n- React + TailwindCSS frontend, Python FastAPI + MongoDB backend\n- Semantic search with sentence-transformers and cosine similarity")

bold("E-Commerce Platform (React, Node.js, MongoDB)")
text("- Complete e-commerce with React frontend, Node.js/Express backend\n- Stripe payments, order management, real-time notifications\n- Redux state management, deployed on AWS with Docker")

bold("Real-Time Chat App (React, Socket.io, Redis)")
text("- WebSocket messaging supporting 1000+ concurrent users\n- MongoDB persistence and Redis caching layer")

# Education
section("EDUCATION")
bold("B.Tech Computer Science - IIT Hyderabad (2020-2024)")
text("CGPA: 8.9/10 | DSA, Algorithms, Web Dev, Machine Learning, DBMS")

# Certifications
section("CERTIFICATIONS")
text("- AWS Certified Cloud Practitioner (2024)\n- Meta Front-End Developer Certificate (2023)\n- Python for Data Science - IBM (2023)\n- Full Stack Web Development - Udemy (2022)")

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_resume_bhavana.pdf")
pdf.output(output_path)
print(f"Resume saved to: {output_path}")
