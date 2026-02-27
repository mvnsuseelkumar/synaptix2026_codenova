# ⚡ Synaptix — Explainable Skill-Based Internship & Project Matching Platform

> An AI-powered, fairness-aware platform that matches candidates to internships and projects using **weighted competency scoring**, provides **transparent explanations** for every ranking decision, and ensures **equitable, unbiased opportunity allocation**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Demo Users](#-demo-users)
- [User Roles & Permissions](#-user-roles--permissions)
- [Platform Workflow](#-platform-workflow)
- [AI Matching Engine](#-ai-matching-engine)
  - [Weighted Competency Scoring](#1-weighted-competency-scoring-engine)
  - [Fairness-Aware Ranking](#2-fairness-aware-ranking-engine)
  - [Explainability Layer](#3-explainability-layer)
  - [Skill Gap Analyzer](#4-skill-gap-analyzer)
- [API Reference](#-api-reference)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Screenshots](#-screenshots)

---

## 🎯 Overview

Traditional hiring platforms rely on **keyword-based filtering** that eliminates qualified candidates who don't use exact buzzwords. Synaptix takes a fundamentally different approach:

| Traditional Platforms | Synaptix |
|---|---|
| Keyword matching | Weighted competency scoring |
| Black-box decisions | Transparent, explainable match scores |
| No fairness controls | Fairness-aware bias detection & correction |
| Binary pass/fail | Granular proficiency assessment (1–10 scale) |
| No learning guidance | Skill gap analysis with improvement roadmap |

### What Makes Synaptix Different?

1. **Every decision is explainable** — candidates and recruiters see exactly WHY a score was given
2. **Fairness is built-in** — statistical bias detection prevents systemic discrimination
3. **Skills are weighted** — recruiters define how important each skill is (weights must sum to 100%)
4. **Proficiency matters** — a candidate with Python at level 9 scores higher than one at level 3
5. **Audit trail** — every action (apply, shortlist, reject) is logged with timestamps

---

## ✨ Key Features

### For Applicants
| Feature | Description |
|---|---|
| 📝 **Profile Builder** | Dynamic forms for education, experience, certifications, and social links |
| 🎯 **Skill Manager** | Add skills with proficiency sliders (1–10), autocomplete, live radar chart |
| 💼 **Job Browser** | Search & filter jobs by type, view required skills with weights |
| ⚡ **One-Click Apply** | Apply and instantly see your match score + detailed explanation |
| 📊 **Application Tracker** | Track status (pending → reviewed → shortlisted/rejected) with score breakdowns |
| 🤖 **AI Recommendations** | Personalized job suggestions ranked by compatibility score |
| 🔍 **Skill Gap Analysis** | See exactly what to learn for any target job, sorted by impact priority |

### For Recruiters
| Feature | Description |
|---|---|
| 📋 **Post Jobs** | Define required skills with weights (must sum to 100%) and minimum proficiency |
| 👥 **Candidate Rankings** | See all applicants ranked by AI score, expandable for full explanation |
| ⚖️ **Fairness Reports** | Pool statistics, bias detection, adjustment transparency |
| ✅ **Shortlist / Reject** | One-click actions with full audit logging |
| 📈 **Analytics Dashboard** | Score histograms, status funnels, per-job statistics |
| 🗂️ **Manage Listings** | View, monitor, and delete job postings |

### Platform-Wide
| Feature | Description |
|---|---|
| 🌙 **Dark/Light Mode** | Toggle with smooth transitions and localStorage persistence |
| 📱 **Responsive Design** | Mobile-friendly with collapsible sidebar and hamburger menu |
| 🔒 **JWT Authentication** | Secure token-based auth with role guards |
| 🎨 **Glassmorphism UI** | Modern premium design with gradients, blur effects, micro-animations |
| 📝 **Complete Audit Trail** | Every status change, application, and action logged |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework (JavaScript, not TypeScript) |
| **Vite 7** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling with dark/light themes |
| **React Router v7** | Client-side routing with nested layouts |
| **Recharts** | Data visualization (bar charts, pie charts, radar charts) |
| **Lucide React** | Icon library |
| **Axios** | HTTP client with JWT interceptors |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Python async web framework |
| **Uvicorn** | ASGI server |
| **Motor** | Async MongoDB driver |
| **Pydantic v2** | Data validation and serialization |
| **python-jose** | JWT token creation and verification |
| **passlib + bcrypt** | Password hashing |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database for flexible schemas |

### AI Engine (Custom Built)
| Module | Purpose |
|---|---|
| **scoring.py** | Weighted competency scoring algorithm |
| **fairness.py** | Bias detection and normalization |
| **explainer.py** | Human-readable explanation generation |
| **skill_gap.py** | Gap analysis with improvement recommendations |

---

## 📁 Project Structure

```
Project/
├── README.md
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Environment configuration
│   ├── database.py                # MongoDB connection manager
│   ├── auth.py                    # JWT auth + password hashing
│   ├── seed.py                    # Demo data seeding script
│   ├── requirements.txt           # Python dependencies
│   ├── models/
│   │   ├── user.py                # User, Profile, Auth schemas
│   │   ├── job.py                 # Job posting schemas
│   │   ├── application.py         # Application schemas
│   │   └── audit.py               # Audit log schemas
│   ├── routes/
│   │   ├── auth_routes.py         # /api/auth/* endpoints
│   │   ├── job_routes.py          # /api/jobs/* endpoints
│   │   ├── applicant_routes.py    # /api/applicant/* endpoints
│   │   ├── recruiter_routes.py    # /api/recruiter/* endpoints
│   │   └── matching_routes.py     # /api/match/* endpoints
│   └── engine/
│       ├── scoring.py             # Weighted competency scoring
│       ├── fairness.py            # Fairness-aware adjustments
│       ├── explainer.py           # Explanation generator
│       └── skill_gap.py           # Skill gap analyzer
├── frontend/
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite + Tailwind + API proxy
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Router + providers
│       ├── index.css              # Global styles + themes
│       ├── services/
│       │   └── api.js             # Axios client + JWT interceptor
│       ├── contexts/
│       │   ├── AuthContext.jsx     # Authentication state
│       │   └── ThemeContext.jsx    # Dark/light theme state
│       ├── components/
│       │   ├── Navbar.jsx         # Top navigation bar
│       │   ├── Sidebar.jsx        # Role-based side navigation
│       │   ├── ProtectedRoute.jsx # Auth + role guard
│       │   ├── ThemeToggle.jsx    # Dark/light toggle button
│       │   └── MatchScoreCard.jsx # Score visualization component
│       └── pages/
│           ├── public/            # Home, About, Features, HowItWorks, FAQ, Contact
│           ├── auth/              # Login, Register
│           ├── applicant/         # Dashboard, Profile, Skills, Jobs, Applications, Recommendations
│           └── recruiter/         # Dashboard, PostJob, Listings, Rankings, Analytics
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **MongoDB** (local or Atlas cloud — default: `localhost:27017`)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Seed Demo Data (Optional)

```bash
cd backend
python seed.py
```

This creates 5 demo users, 3 job listings, and all necessary collections.

---

## ▶️ Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Connected to MongoDB: synaptix_db
INFO:     Application startup complete.
INFO:     Uvicorn running on http://localhost:8000
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v7.3.1 ready in 400ms
➜  Local:   http://localhost:5173/
```

### Access the Platform

Open **http://localhost:5173** in your browser.

---

## 👤 Demo Users

All demo accounts use password: **`password123`**

| Role | Name | Email | Skills |
|---|---|---|---|
| 🔵 Recruiter | Sarah Chen | `recruiter@techcorp.com` | TechCorp AI — Sr. Talent Acquisition |
| 🔵 Recruiter | James Wilson | `hr@dataflow.io` | DataFlow — HR Manager |
| 🟢 Applicant | Alex Kumar | `alex@student.edu` | Python(9), ML(8), React(7), SQL(6), TensorFlow(7), Docker(5), Git(8) |
| 🟢 Applicant | Priya Sharma | `priya@student.edu` | Python(8), ML(6), SQL(9), Tableau(8), R(7), Statistics(9) |
| 🟢 Applicant | Rahul Verma | `rahul@student.edu` | React(9), Node.js(8), TypeScript(7), MongoDB(7), Docker(6), Python(5) |

### Demo Jobs

| Job | Company | Key Skills (Weight) |
|---|---|---|
| ML Engineering Intern | TechCorp AI | Python(30%), ML(25%), TensorFlow(15%), SQL(10%), Docker(10%), Git(10%) |
| Data Analytics Associate | DataFlow | SQL(30%), Python(25%), Tableau(20%), Statistics(15%), R(10%) |
| Full Stack Web Dev Intern | TechCorp AI | React(30%), Node.js(25%), TypeScript(15%), MongoDB(15%), Docker(10%), Git(5%) |

---

## 🔐 User Roles & Permissions

### Applicant
```
✅ View/edit own profile          ✅ Add/manage skills with proficiency
✅ Browse all active jobs          ✅ Apply to jobs (one-click)
✅ View own applications           ✅ Get AI recommendations
✅ View skill gap analysis         ❌ Cannot view other applicants
❌ Cannot post jobs                ❌ Cannot access recruiter features
```

### Recruiter
```
✅ Post jobs with skill weights    ✅ View/delete own job listings
✅ View ranked candidates          ✅ Shortlist/reject candidates
✅ View fairness reports           ✅ Access analytics dashboard
❌ Cannot apply to jobs            ❌ Cannot access applicant features
```

---

## 🔄 Platform Workflow

### Applicant Journey

```
1. Register → Select "Applicant" role
2. Build Profile → Add education, experience, certifications
3. Manage Skills → Add skills with proficiency levels (1-10)
4. Browse Jobs → Search and filter available positions
5. Apply → Click "Apply Now" → Instantly see match score + explanation
6. Track → Monitor application status (pending → reviewed → shortlisted/rejected)
7. Recommendations → View AI-ranked job suggestions with compatibility scores
```

### Recruiter Journey

```
1. Register → Select "Recruiter" role
2. Post Job → Define title, description, required skills with weights (sum to 100%)
3. Wait for Applications → Candidates apply and get scored automatically
4. View Rankings → See candidates sorted by match score
5. Review Fairness → Check bias report for the candidate pool
6. Decide → Shortlist or reject candidates with one click
7. Analyze → View score distributions, funnels, per-job statistics
```

### Matching Pipeline (Automated)

```
Applicant clicks "Apply" →
  1. Scoring Engine computes weighted match score
  2. Explainer Engine generates human-readable explanation
  3. Application stored with score + explanation
  4. Audit log records the event

Recruiter views "Rankings" →
  1. All applications re-scored against latest profiles
  2. Fairness Engine normalizes scores across pool
  3. Fairness Report generated (mean, std dev, status)
  4. Explainer Engine generates explanations with fairness notes
  5. Candidates returned sorted by final (fairness-adjusted) score
```

---

## 🤖 AI Matching Engine

### 1. Weighted Competency Scoring Engine

**File:** `backend/engine/scoring.py`

#### Formula

```
Match Score = Σ (Normalized_Weight_i × Candidate_Proficiency_i / Max_Proficiency) × 100
```

Where:
- `Normalized_Weight_i` = skill weight / total weights (ensures weights sum to 1.0)
- `Candidate_Proficiency_i` = candidate's self-rated proficiency (0–10)
- `Max_Proficiency` = 10

#### Worked Example

**Job:** ML Engineering Intern  
**Candidate:** Alex Kumar

| Skill | Weight | Normalized | Alex's Prof. | Contribution |
|---|---|---|---|---|
| Python | 30% | 0.30 | 9/10 | 0.30 × 0.9 = 0.270 |
| Machine Learning | 25% | 0.25 | 8/10 | 0.25 × 0.8 = 0.200 |
| TensorFlow | 15% | 0.15 | 7/10 | 0.15 × 0.7 = 0.105 |
| SQL | 10% | 0.10 | 6/10 | 0.10 × 0.6 = 0.060 |
| Docker | 10% | 0.10 | 5/10 | 0.10 × 0.5 = 0.050 |
| Git | 10% | 0.10 | 8/10 | 0.10 × 0.8 = 0.080 |
| **Total** | | | | **0.765 → 76.5%** |

#### Skill Classification

```python
if proficiency == 0:                  → "missing"    # Candidate doesn't have it
elif proficiency < min_proficiency:   → "partial"    # Has it but below requirement
elif proficiency >= 7:                → "matched" + strength  # Strong skill
else:                                 → "matched"    # Meets requirement
```

#### Additional Metrics

- **Experience Match:** Compares candidate's experience count vs. job level requirement
- **Skill Coverage:** `matched_skills / total_required × 100%`
- **Confidence:** `min(95%, coverage × 80% + 15%)` — how reliable the score is

---

### 2. Fairness-Aware Ranking Engine

**File:** `backend/engine/fairness.py`

#### Purpose

Prevents systemic bias by detecting and correcting score distribution outliers across the candidate pool.

#### Algorithm

```
Step 1: Calculate pool statistics (mean, standard deviation)
Step 2: Compute Z-score for each candidate: Z = (score - mean) / stdev
Step 3: Apply corrections:
  - Z < -1.5 (far below average):  boost = +min(3.0, |Z| × 1.0)
  - Z > +1.5 (far above average):  reduce = -min(2.0, Z × 0.5)
  - -1.5 ≤ Z ≤ +1.5:              no adjustment
Step 4: Final Score = clamp(0, Raw Score + Adjustment, 100)
Step 5: Re-sort by Final Score descending
```

#### Fairness Report Output

| Metric | Description |
|---|---|
| Pool Size | Number of candidates evaluated |
| Mean Score | Average score across pool |
| Median Score | Middle value in sorted scores |
| Std Dev | Score spread indicator |
| Min/Max Score | Score range |
| Adjustments Applied | Count of candidates who received corrections |
| Fairness Status | "balanced" (range < 50) or "review_recommended" |

---

### 3. Explainability Layer

**File:** `backend/engine/explainer.py`

#### Purpose

Converts raw numerical scores into **human-readable narratives** that both candidates and recruiters can understand.

#### Assessment Classification

| Score Range | Assessment |
|---|---|
| 80–100% | Excellent match |
| 60–79% | Good match |
| 40–59% | Moderate match |
| 0–39% | Low match |

#### Narrative Construction

The engine builds a paragraph from these components:

```
1. Overall:     "This candidate is a good match with a score of 76.5%."
2. Strengths:   "Strong performance in: Python, Machine Learning, Git."
3. Missing:     "Missing required skills: TensorFlow."  (if any)
4. Partial:     "Partial skill match in: SQL — could improve with training."  (if any)
5. Fairness:    "A fairness boost of +2.5% was applied to ensure equitable evaluation."  (if adjusted)
6. Experience:  "Experience level is a strong match for this role."
```

#### Visual Data

Each skill gets chart-ready data:

```json
{
  "skill": "Python",
  "weight": 30.0,
  "contribution": 27.0,
  "proficiency": 9,
  "maxProficiency": 10,
  "status": "matched"
}
```

---

### 4. Skill Gap Analyzer

**File:** `backend/engine/skill_gap.py`

#### Purpose

Helps applicants understand exactly **what to learn** to qualify for any target job.

#### Analysis Process

```
For each required skill:
  gap = max(0, required_proficiency - candidate_proficiency)

  Status classification:
    proficiency == 0         → "missing"             (never learned)
    proficiency < required   → "below_required"      (needs improvement)
    proficiency == required  → "meets_requirement"    (exactly at threshold)
    proficiency > required   → "exceeds_requirement"  (strong area)
```

#### Recommendations (sorted by weight/impact)

```
1. "Start learning Machine Learning — required skill with 25% weight."
2. "Improve Python from level 5 to at least 7."
3. "Start learning TensorFlow — required skill with 15% weight."
```

#### Readiness Score

```
Readiness = (skills_meeting_or_exceeding / total_required) × 100%
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create new account (name, email, password, role) |
| `POST` | `/api/auth/login` | — | Login and receive JWT token |
| `GET` | `/api/auth/me` | 🔒 JWT | Get current authenticated user |

### Jobs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | 🔒 JWT | List all active jobs (search, filter) |
| `POST` | `/api/jobs` | 🔒 Recruiter | Create new job posting |
| `DELETE` | `/api/jobs/:id` | 🔒 Recruiter | Delete a job posting |

### Applicant

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/applicant/profile` | 🔒 Applicant | Get own profile |
| `PUT` | `/api/applicant/profile` | 🔒 Applicant | Update profile (skills, education, etc.) |
| `POST` | `/api/applicant/apply/:jobId` | 🔒 Applicant | Apply to job + get instant match score |
| `GET` | `/api/applicant/applications` | 🔒 Applicant | List own applications with scores |
| `GET` | `/api/applicant/recommendations` | 🔒 Applicant | Get AI-ranked job suggestions |
| `GET` | `/api/applicant/skill-gap/:jobId` | 🔒 Applicant | Skill gap analysis for a job |

### Recruiter

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/recruiter/jobs` | 🔒 Recruiter | List own job postings |
| `GET` | `/api/recruiter/jobs/:id/candidates` | 🔒 Recruiter | Ranked candidates with fairness report |
| `PUT` | `/api/recruiter/applications/:id/status` | 🔒 Recruiter | Update status (shortlist/reject) |
| `GET` | `/api/recruiter/analytics` | 🔒 Recruiter | Analytics dashboard data |

### Matching

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/match/:jobId/:applicantId` | 🔒 JWT | Detailed match analysis |

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.jsx
├── ThemeProvider (dark/light mode)
├── AuthProvider (JWT auth state)
├── BrowserRouter
│   ├── Navbar (always visible)
│   │   ├── Logo + Navigation Links
│   │   ├── ThemeToggle
│   │   └── User Menu / Auth Links
│   ├── Public Routes
│   │   ├── / → Home (hero, features, stats, CTA)
│   │   ├── /about → About (mission, values)
│   │   ├── /features → Features (capability showcase)
│   │   ├── /how-it-works → HowItWorks (4-step process)
│   │   ├── /faq → FAQ (accordion Q&A)
│   │   └── /contact → Contact (form + info cards)
│   ├── Auth Routes
│   │   ├── /login → Login (glassmorphism form)
│   │   └── /register → Register (role selection)
│   ├── /applicant/* → ProtectedRoute(role="applicant")
│   │   └── DashboardLayout (Sidebar + content)
│   │       ├── /dashboard → Stats, radar chart, recent apps
│   │       ├── /profile → Dynamic profile builder
│   │       ├── /skills → Skill manager with live radar
│   │       ├── /jobs → Job browser with search/filter
│   │       ├── /applications → Application tracker
│   │       └── /recommendations → AI job suggestions
│   └── /recruiter/* → ProtectedRoute(role="recruiter")
│       └── DashboardLayout (Sidebar + content)
│           ├── /dashboard → Analytics overview
│           ├── /post-job → Job creation form
│           ├── /listings → Manage job posts
│           ├── /rankings → Candidate rankings
│           └── /analytics → Charts and statistics
```

### State Management

| Context | Purpose |
|---|---|
| **AuthContext** | JWT token, user object, login/register/logout actions |
| **ThemeContext** | Dark/light mode toggle with localStorage persistence |

### API Layer

```javascript
// services/api.js — Axios instance with interceptors
// Request: Automatically attaches JWT token from localStorage
// Response: Auto-logout on 401 (token expired)
```

---

## ⚙️ Backend Architecture

### Request Flow

```
HTTP Request → FastAPI Router → Auth Middleware → Route Handler → Database → Response
```

### Module Responsibilities

| Module | Files | Responsibility |
|---|---|---|
| **Core** | `main.py`, `config.py`, `database.py`, `auth.py` | App bootstrap, config, DB connection, JWT |
| **Models** | `models/*.py` | Pydantic schemas for request/response validation |
| **Routes** | `routes/*.py` | API endpoint handlers with role-based guards |
| **Engine** | `engine/*.py` | AI scoring, fairness, explanation, skill gap |

### Middleware Stack

```
CORSMiddleware → JWT Verification → Role Guard → Route Handler
```

---

## 🗃️ Database Schema

### users Collection

```json
{
  "_id": "ObjectId",
  "email": "alex@student.edu",
  "password": "$2b$12$...",
  "name": "Alex Kumar",
  "role": "applicant | recruiter",
  "created_at": "2025-01-01T00:00:00Z",
  "profile": {
    "title": "Computer Science Student",
    "bio": "Passionate about ML...",
    "location": "Bangalore, India",
    "skills": [
      { "name": "Python", "proficiency": 9 }
    ],
    "education": [
      { "degree": "B.Tech CS", "institution": "IIT Delhi", "year": "2026", "gpa": "8.9" }
    ],
    "experience": [
      { "title": "ML Intern", "company": "Google", "duration": "3 months", "description": "..." }
    ],
    "certifications": ["AWS Cloud Practitioner"],
    "github_url": "https://github.com/alexkumar",
    "linkedin_url": "https://linkedin.com/in/alexkumar"
  }
}
```

### jobs Collection

```json
{
  "_id": "ObjectId",
  "title": "ML Engineering Intern",
  "description": "Work on cutting-edge NLP...",
  "company": "TechCorp AI",
  "location": "San Francisco, CA",
  "job_type": "internship | project | full-time | part-time",
  "required_skills": [
    { "name": "Python", "weight": 30, "min_proficiency": 7 },
    { "name": "Machine Learning", "weight": 25, "min_proficiency": 6 }
  ],
  "experience_level": "beginner | intermediate | advanced | expert",
  "complexity": "low | medium | high",
  "duration": "6 months",
  "stipend": "$3000/month",
  "recruiter_id": "ObjectId",
  "recruiter_name": "Sarah Chen",
  "status": "active | closed",
  "applicant_count": 12,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### applications Collection

```json
{
  "_id": "ObjectId",
  "job_id": "ObjectId",
  "applicant_id": "ObjectId",
  "applicant_name": "Alex Kumar",
  "applicant_email": "alex@student.edu",
  "job_title": "ML Engineering Intern",
  "company": "TechCorp AI",
  "status": "pending | reviewed | shortlisted | rejected",
  "match_score": 76.5,
  "explanation": {
    "overall_assessment": "Good match",
    "total_score": 76.5,
    "final_score": 76.5,
    "narrative": "This candidate is a good match...",
    "skill_breakdown": [...],
    "strengths": ["Python", "Machine Learning"],
    "missing_skills": [],
    "confidence": 95.0
  },
  "applied_at": "2025-01-15T10:30:00Z"
}
```

### audit_logs Collection

```json
{
  "_id": "ObjectId",
  "action": "application_submitted | application_shortlisted | application_rejected",
  "user_id": "ObjectId",
  "details": {
    "job_id": "ObjectId",
    "applicant_id": "ObjectId",
    "match_score": 76.5,
    "new_status": "shortlisted"
  },
  "category": "scoring | access",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **Password Storage** | bcrypt hashing (never stored in plaintext) |
| **Authentication** | JWT tokens with configurable expiry |
| **Authorization** | Role-based middleware (`require_applicant`, `require_recruiter`) |
| **API Protection** | All data endpoints require valid JWT |
| **CORS** | Configured per-origin allow list |
| **Input Validation** | Pydantic v2 schemas on all request bodies |
| **Audit Logging** | Every status change recorded with timestamp |

---

## 📸 Screenshots

### Landing Page
The platform features a modern dark theme with glassmorphism design, animated hero section, feature showcases, and clear calls-to-action.

### Applicant Dashboard
Displays stat cards, skill radar chart preview, recent applications with match scores, and quick action links.

### Recruiter Rankings
Shows ranked candidates with expandable match explanations, fairness report banner, shortlist/reject buttons, and score metrics.

### Job Application
One-click apply with instant match score visualization including animated score ring, skill contribution bar chart, and narrative explanation.

---

## 🧪 Testing the Application

### Quick Test Flow

1. **Login** as recruiter (`recruiter@techcorp.com` / `password123`)
2. **View Rankings** for any posted job — see the matching engine in action
3. **Logout** and login as applicant (`alex@student.edu` / `password123`)
4. **Browse Jobs** and apply to one — see instant match score
5. **View Recommendations** — see AI-ranked job suggestions
6. **Check Applications** — see your application status and score breakdown

### API Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@student.edu","password":"password123"}'

# Get profile (use token from login response)
curl http://localhost:8000/api/applicant/profile \
  -H "Authorization: Bearer <your-token>"
```

---

## 📄 License

This project is developed for educational and demonstration purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ⚡ by the Synaptix Team
</p>
