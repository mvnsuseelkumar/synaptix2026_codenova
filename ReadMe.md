You are a senior full-stack engineer. Build a complete, production-ready
Internship Matching Platform with the following specifications. Every component
must be fully functional, properly styled, and meet industry standards.

═══════════════════════════════════════════════════════════
PART 1 — PROJECT OVERVIEW
═══════════════════════════════════════════════════════════

Build a smart internship/job matching platform with three roles:

- Students: Upload resume, apply to opportunities, view match scores & explanations
- Companies: Post opportunities, configure skill weights, view ranked applicants
- Admin: Monitor fairness flags, manage users

The core differentiator is an AI-powered matching engine that:

1. Parses resumes and scores skills by evidence source
2. Applies company-defined weighted scoring
3. Boosts scores using semantic similarity (SBERT)
4. Audits results for demographic fairness
5. Generates human-readable explanations for every score

═══════════════════════════════════════════════════════════
PART 2 — TECH STACK (STRICT — DO NOT DEVIATE)
═══════════════════════════════════════════════════════════

FRONTEND:

- React 18 + Vite
- TailwindCSS (utility classes only)
- Recharts (score visualizations)
- React Query v5 (server state)
- React Router v6 (role-based routing)
- Axios (API calls)
- React Hook Form + Zod (form validation)
- Lucide React (icons)
- React Hot Toast (notifications)

BACKEND:

- Python 3.11+
- FastAPI (async)
- Motor (async MongoDB driver)
- Beanie (ODM for MongoDB)
- Local MongoDB on mongodb://localhost:27017
- Database name: internship_platform
- Redis (localhost:6379) for caching rankings
- Celery + Redis as broker for async resume parsing
- JWT (python-jose) for auth
- bcrypt (passlib) for password hashing
- python-multipart for file uploads
- CORS middleware enabled for localhost:5173

NLP / AI:

- pdfplumber (PDF text extraction)
- spaCy en_core_web_lg (NER)
- pyresparser (resume section parsing)
- sentence-transformers all-MiniLM-L6-v2 (semantic similarity)
- NLTK + wordnet (synonym expansion)
- dateparser (duration extraction)

═══════════════════════════════════════════════════════════
PART 3 — MONGODB COLLECTIONS & EXACT SCHEMAS
═══════════════════════════════════════════════════════════

Collection: students
{
"\_id": ObjectId,
"name": str,
"email": str (unique),
"password_hash": str,
"role": "student",
"resume_url": str | None,
"resume_parse_status": "pending" | "processing" | "done" | "failed",
"skill_profile": {
"<skill_name>": {
"score": float, // 0.0 - 5.0
"evidence": {
"work_experience": int,
"projects": int,
"certifications": int,
"courses": int
},
"source_breakdown": {
"work_experience_score": float,
"projects_score": float,
"certifications_score": float,
"courses_score": float
}
}
},
"resume_sections": {
"education": str,
"projects": [str],
"experience": [str],
"certifications": [str],
"raw_text": str
},
"profile_meta": {
"domain_preference": [str],
"availability": str,
"location": str,
"institution": str
},
"created_at": datetime,
"updated_at": datetime
}

Collection: companies
{
"\_id": ObjectId,
"name": str,
"email": str (unique),
"password_hash": str,
"role": "company",
"industry": str,
"website": str,
"description": str,
"logo_url": str | None,
"created_at": datetime
}

Collection: opportunities
{
"\_id": ObjectId,
"company_id": ObjectId,
"company_name": str,
"title": str,
"description": str,
"domain": str,
"mode": "remote" | "onsite" | "hybrid",
"duration": str,
"location": str,
"stipend": str,
"must_have_skills": [str],
"skill_weights": { "<skill>": int }, // weights sum to 100
"min_score_threshold": float,
"total_applicants": int,
"status": "open" | "closed" | "draft",
"posted_at": datetime,
"deadline": datetime | None
}

Collection: applications
{
"\_id": ObjectId,
"student_id": ObjectId,
"student_name": str,
"student_email": str,
"student_institution": str,
"opportunity_id": ObjectId,
"company_id": ObjectId,
"status": "applied" | "under_review" | "shortlisted" | "rejected",
"match_score": float,
"rank": int | None,
"knockout_passed": bool,
"knockout_fail_reason": str | None,
"score_breakdown": {
"<skill>": {
"weight": int,
"student_score": float,
"weighted_contribution": float
},
"semantic_similarity_bonus": float
},
"explanation": {
"rank_reason": str,
"improvement_tips": [str],
"strong_areas": [str]
},
"fairness_flags": [str],
"applied_at": datetime,
"shortlisted_at": datetime | None
}

Collection: fairness_logs
{
"\_id": ObjectId,
"opportunity_id": ObjectId,
"flag_type": str,
"detail": str,
"top10_breakdown": { "<institution>": int },
"flagged_at": datetime,
"resolved": bool
}

Collection: notifications
{
"\_id": ObjectId,
"user_id": ObjectId,
"type": "shortlisted" | "rejected" | "new_application" | "score_ready",
"title": str,
"message": str,
"read": bool,
"created_at": datetime
}

═══════════════════════════════════════════════════════════
PART 4 — BACKEND API ROUTES (COMPLETE)
═══════════════════════════════════════════════════════════

AUTH ROUTES — /api/auth
POST /register/student → Register student account
POST /register/company → Register company account
POST /login → Login (returns JWT + role)
GET /me → Get current user from token
POST /logout → Invalidate token

STUDENT ROUTES — /api/student
GET /profile → Get full profile + skill_profile
PUT /profile → Update profile_meta
POST /resume/upload → Upload PDF, trigger Celery parse task
GET /resume/status → Check parse status
GET /opportunities → Browse open opportunities (paginated)
GET /opportunities/:id → View single opportunity detail
POST /opportunities/:id/apply → Apply to opportunity
GET /applications → List all my applications + status
GET /applications/:id → Full application detail with explanation
GET /notifications → Get all notifications
PUT /notifications/:id/read → Mark notification as read

COMPANY ROUTES — /api/company
GET /profile → Get company profile
PUT /profile → Update company details
POST /opportunities → Create new opportunity
GET /opportunities → List my posted opportunities
GET /opportunities/:id → Get opportunity detail
PUT /opportunities/:id → Edit opportunity
DELETE /opportunities/:id → Delete/close opportunity
GET /opportunities/:id/rankings → Get ranked applicants list
PUT /applications/:id/status → Update applicant status (shortlist/reject)
GET /applications/:id → View specific applicant full breakdown
GET /notifications → Get company notifications

MATCHING ROUTES — /api/matching (internal)
POST /run/:opportunity_id → Trigger full matching for opportunity
GET /status/:opportunity_id → Check matching run status

ADMIN ROUTES — /api/admin
GET /fairness-logs → All fairness flags
PUT /fairness-logs/:id/resolve → Resolve a flag
GET /users → All users list
GET /stats → Platform statistics

═══════════════════════════════════════════════════════════
PART 5 — MATCHING ENGINE LOGIC (EXACT IMPLEMENTATION)
═══════════════════════════════════════════════════════════

File: backend/services/matcher.py

def run_matching(opportunity_id):

Step 1 — KNOCKOUT FILTER
For each applicant: - Check if student.skill_profile has ALL must_have_skills - Check if score for each must_have skill >= min_score_threshold - If fails: mark application as rejected, store knockout_fail_reason - If passes: proceed to scoring

Step 2 — WEIGHTED COMPETENCY SCORE
match*score = 0
for skill, weight in opportunity.skill_weights.items():
student_score = student.skill_profile.get(skill, {}).get("score", 0)
contribution = (weight / 100) * (student*score / 5) * 100
match_score += contribution
store in score_breakdown[skill]

Step 3 — SEMANTIC SIMILARITY BOOST (max +10 points)

- Concatenate student's resume_sections.projects list into one string
- Compare against opportunity.description
- Use sentence-transformers all-MiniLM-L6-v2
- similarity = model.encode([student_text, job_text]) → cosine_similarity
- bonus = similarity \* 10 (capped at 10)
- match_score += bonus
- store as score_breakdown.semantic_similarity_bonus

Step 4 — FAIRNESS AUDIT
After scoring all applicants, look at top 10:

- Group by student.profile_meta.institution
- If any single institution has > 5 of top 10:
  Create fairness_log entry with institution_concentration flag
  Normalize: apply -0.5 point penalty per student beyond the 5th
  from same institution
- Re-sort after normalization

Step 5 — RANK ASSIGNMENT

- Sort all passing applicants by final match_score descending
- Assign rank 1, 2, 3...
- Update each application document in MongoDB

Step 6 — EXPLANATION GENERATION (File: explainer.py)
For each ranked applicant: - rank_reason: Compare their scores to rank-1 applicant
"Candidate #1 had higher {skill} score ({top_score} vs your {your_score})" - improvement_tips: For each skill where student < 3.0:
"Improve your {skill} score — it carries {weight}% weight in this role" - strong_areas: Skills where student_score > 3.5

Step 7 — CACHE IN REDIS

- Cache ranked list for opportunity_id with 1hr TTL
- Invalidate cache when new application arrives

═══════════════════════════════════════════════════════════
PART 6 — RESUME PARSER LOGIC (EXACT IMPLEMENTATION)
═══════════════════════════════════════════════════════════

File: backend/services/resume_parser.py

def parse_resume(file_path, student_id):

Step 1 — EXTRACT TEXT
Use pdfplumber to extract full raw text from PDF

Step 2 — SECTION DETECTION (rule-based regex)
Detect headers: EDUCATION, EXPERIENCE, PROJECTS,
CERTIFICATIONS, COURSES, SKILLS
Split text into sections dict

Step 3 — NER WITH spaCy
Load en_core_web_lg
For each section, run NLP pipeline
Extract: ORG entities (companies/universities),
DATE entities (durations), skill tokens

Step 4 — SKILL EXTRACTION
Use pyresparser to extract skills list
Normalize skill names using skills-ml taxonomy:
"JS" → "JavaScript"
"ML" → "Machine Learning"
"Postgres" → "PostgreSQL"
Expand synonyms using NLTK wordnet

Step 5 — SKILL SCORING PER SECTION
For each detected skill, score by where it appears:

base*score = 0
if skill in work_experience_section:
count = occurrences
base_score += (count * 0.4) _ 40% // 40% weight
if skill in projects_section:
count = occurrences  
 base_score += (count _ 0.35) _ 35% // 35% weight
if skill in certifications_section:
base_score += 0.15 _ 15% // 15% weight
if skill in education*section:
base_score += 0.10 * 10% // 10% weight

// Normalize to 0-5 scale
final_score = min(base_score, 5.0)

Step 6 — DURATION BOOST
Use dateparser to extract employment durations
For each skill in work*experience:
If duration > 6 months: score *= 1.1
If duration > 12 months: score \_= 1.2
Cap at 5.0

Step 7 — STORE IN MONGODB
Update student document:

- skill_profile: { skill: { score, evidence, source_breakdown } }
- resume_sections: { education, projects, experience, certifications, raw_text }
- resume_parse_status: "done"

═══════════════════════════════════════════════════════════
PART 7 — FRONTEND PAGES & COMPONENTS (COMPLETE UI SPEC)
═══════════════════════════════════════════════════════════

DESIGN SYSTEM:

- Color palette:
  Primary: #6366F1 (indigo-500)
  Secondary: #8B5CF6 (violet-500)  
   Success: #10B981 (emerald-500)
  Warning: #F59E0B (amber-500)
  Danger: #EF4444 (red-500)
  Background: #0F172A (slate-900) — dark theme
  Surface: #1E293B (slate-800)
  Surface2: #334155 (slate-700)
  Text: #F1F5F9 (slate-100)
  Muted: #94A3B8 (slate-400)
- Font: Inter (Google Fonts)
- Border radius: rounded-xl for cards, rounded-lg for buttons
- Shadows: shadow-lg with subtle indigo glow on hover
- All cards: bg-slate-800 border border-slate-700
- Transitions: transition-all duration-200

─────────────────────────────────────
PAGE: / (Landing Page)
─────────────────────────────────────

- Full-screen hero with gradient background (indigo to violet)
- Headline: "Get Matched. Not Just Applied."
- Subtext explaining AI-powered matching
- Two CTA buttons: "I'm a Student" and "I'm a Company"
- Features section with 3 cards: Resume AI, Fair Matching, Transparent Scores
- How it works section with 4 numbered steps
- Footer with links

─────────────────────────────────────
PAGE: /login and /register
─────────────────────────────────────

- Clean centered card with logo
- Toggle between Student / Company registration
- Student register: name, email, password, confirm password, domain preference
- Company register: company name, email, password, industry
- Validation with Zod + React Hook Form
- Show/hide password toggle
- Loading state on submit button
- Redirect to appropriate dashboard after login

─────────────────────────────────────
PAGE: /student/dashboard
─────────────────────────────────────
Layout: Sidebar + Main content area

Sidebar contains:

- App logo
- Navigation: Dashboard, My Profile, Browse Opportunities, My Applications, Notifications
- User avatar + name at bottom
- Logout button

Dashboard Main:

- Welcome header: "Welcome back, {name}"
- Stats row (4 cards):
  Total Applications | Shortlisted | Under Review | Match Avg Score
- Resume Status Banner:
  If not uploaded: orange warning "Upload your resume to start matching"
  If processing: blue "Parsing your resume..." with spinner  
   If done: green "Resume parsed — {N} skills detected"
- Skill Profile Section:
  Horizontal bar chart (Recharts) showing top 10 skills with scores 0-5
  Each bar colored by score: red(<2), yellow(2-3.5), green(>3.5)
  Evidence badges under each skill showing source counts
- Recent Applications table:
  Columns: Role, Company, Applied, Status badge, Match Score, Action
  Status badges: applied(gray), under_review(blue), shortlisted(green), rejected(red)
  Action: "View Details" button

─────────────────────────────────────
PAGE: /student/profile
─────────────────────────────────────

- Editable profile form: name, location, availability, domain preferences
- Resume Upload section:
  Drag-and-drop zone with dashed border
  File type restriction: PDF only, max 5MB
  Upload progress bar
  After upload: show filename + "Parsing..." status
  After parse: "✓ Parsed successfully — view your skills below"
- Full Skill Profile table:
  Columns: Skill | Score | Work Exp | Projects | Certs | Courses
  Score shown as colored progress bar
  Expandable rows showing source_breakdown

─────────────────────────────────────
PAGE: /student/opportunities
─────────────────────────────────────

- Search bar + filters: Domain, Mode (remote/onsite), Duration
- Opportunity cards grid (3 columns desktop, 1 mobile):
  Each card shows: Title, Company, Domain badge, Mode badge,
  Duration, Stipend, Must-have skills as chips,
  "View & Apply" button
- Pagination controls
- Empty state with illustration if no results

─────────────────────────────────────
PAGE: /student/opportunities/:id
─────────────────────────────────────

- Full opportunity detail view
- Left column: Full description, requirements, company info
- Right column sticky:
  Required skills checklist (green check if student has it, red X if not)
  Estimated match preview (if resume parsed)
  "Apply Now" button → confirms application modal
- Skills you're missing section (if any must_have not met)

─────────────────────────────────────
PAGE: /student/applications
─────────────────────────────────────

- Table of all applications with:
  Opportunity title, Company, Date applied, Status badge,
  Match score (shown only if scoring is complete),
  Rank badge (shown only if shortlisted)
  "View Details" button
- Filter by status tabs: All | Applied | Under Review | Shortlisted | Rejected

─────────────────────────────────────
PAGE: /student/applications/:id (EXPLANATION PAGE)
─────────────────────────────────────
This is the most important student page. Build it beautifully.

- Header banner:
  If shortlisted: green gradient "🎉 Shortlisted for {role} at {company}"
  If rejected: gray "Application reviewed for {role} at {company}"
  If under_review: blue "Under Review — {role} at {company}"

- Score card (prominent):
  Large circular score display: "82.1" with ring chart
  Rank badge: "#2 of {N} applicants"
  Applied date and shortlisted date

- Score Breakdown section:
  For each skill in score_breakdown:
  Skill name | Weight % | Your Score /5 | Points Contributed
  Horizontal stacked bar showing contribution
  Semantic similarity bonus row at bottom
  Total row with final score

- Radar chart (Recharts):
  Compare student's skill scores against the top-ranked candidate
  Two overlapping polygons: "Your Profile" vs "Top Candidate"

- Explanation section:
  "Why you ranked #{rank}" — render rank_reason text
  "Your Strong Areas" — green chips for strong_areas
  "Areas to Improve" — bulleted list of improvement_tips with action icons

- Skill Evidence breakdown (expandable accordion):
  For each skill: show how score was calculated
  "Found 3 times in Projects, 1 time in Work Experience"

─────────────────────────────────────
PAGE: /company/dashboard
─────────────────────────────────────
Layout: Same sidebar pattern as student but company nav

Dashboard Main:

- Stats row: Total Opportunities | Total Applicants | Shortlisted | Fairness Flags
- Active Opportunities list:
  Card per opportunity: Title, Status badge, Applicant count,
  "View Rankings" button, Edit/Delete actions
- Recent Activity feed:
  "New application from {name} for {role}"
  "Matching completed for {role} — {N} candidates ranked"
  "Fairness flag raised for {role}"
- Fairness Alerts panel (if any unresolved flags):
  Orange warning cards per flag

─────────────────────────────────────
PAGE: /company/opportunities/new
─────────────────────────────────────
Multi-step form (wizard with step indicator):

Step 1 — Basic Info:
Title, Description (rich textarea), Domain dropdown,
Mode (toggle: Remote/Onsite/Hybrid), Duration, Location, Stipend

Step 2 — Skills Configuration:
Must-have skills:
Searchable tag input — type skill name, press enter to add
Red "required" badge on each tag
Skill Weights:
For each skill added (must-have + nice-to-have):
Skill name + weight slider (0-100)
Live validation: weights must sum to exactly 100
Visual weight bar showing proportion
Min score threshold slider: 1.0 - 3.0 with label

Step 3 — Review & Post:
Summary of all entered details
Preview how the opportunity card will look
"Post Opportunity" button → triggers async matching for existing applicants

─────────────────────────────────────
PAGE: /company/opportunities/:id/rankings
─────────────────────────────────────
This is the most important company page. Build it beautifully.

- Opportunity header: title, company, status, applicant count
- Fairness Alert banner (if flag exists):
  Orange banner "⚠️ {N}/10 top candidates from same institution"
  "View Details" link to fairness log

- Rankings table:
  Columns: Rank | Candidate | Institution | Score | [Skill columns] | Status | Actions
  Dynamic skill columns based on opportunity.skill_weights keys
  Score shown as colored badge (green >70, yellow 50-70, red <50)
  Each skill cell shows student's score /5 with mini bar
  Status dropdown per row: Applied → Under Review → Shortlisted → Rejected
  "View Full Profile" button opens side panel

- Side panel (slide-in from right) on "View Full Profile":
  Student name, institution, domain preferences
  Full score breakdown for this application
  Explanation text
  Shortlist / Reject buttons

- Filter controls above table:
  Filter by status | Sort by score/rank | Search by name

- Export CSV button (downloads ranked list)

─────────────────────────────────────
PAGE: /admin/dashboard
─────────────────────────────────────

- Platform stats: total users, opportunities, applications, flags
- Fairness Flags table: opportunity, flag type, detail, date, resolved status
- Resolve button per flag
- User management table

─────────────────────────────────────
SHARED COMPONENTS
─────────────────────────────────────
components/ScoreRing.jsx → Circular score display with SVG ring
components/SkillBar.jsx → Horizontal bar with score + color coding
components/StatusBadge.jsx → Colored badge by status type
components/SkillChip.jsx → Rounded pill for skill tags
components/FairnessAlert.jsx → Orange warning banner component
components/NotificationBell.jsx → Bell icon with unread count badge
components/EmptyState.jsx → Illustration + message for empty lists
components/LoadingSpinner.jsx → Centered spinner with text
components/ConfirmModal.jsx → Reusable confirm/cancel modal
components/Sidebar.jsx → Shared sidebar (role-aware nav items)
components/PageHeader.jsx → Consistent page title + breadcrumb

═══════════════════════════════════════════════════════════
PART 8 — FILE & FOLDER STRUCTURE (EXACT)
═══════════════════════════════════════════════════════════

/project
├── frontend/
│ ├── index.html
│ ├── vite.config.js
│ ├── tailwind.config.js
│ ├── package.json
│ └── src/
│ ├── main.jsx
│ ├── App.jsx ← Routes + auth guard
│ ├── index.css
│ ├── api/
│ │ ├── axios.js ← Axios instance with interceptors
│ │ ├── auth.js
│ │ ├── student.js
│ │ ├── company.js
│ │ └── matching.js
│ ├── hooks/
│ │ ├── useAuth.js ← Auth context hook
│ │ └── useNotifications.js
│ ├── pages/
│ │ ├── Landing.jsx
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ ├── student/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Profile.jsx
│ │ │ ├── Opportunities.jsx
│ │ │ ├── OpportunityDetail.jsx
│ │ │ ├── Applications.jsx
│ │ │ └── ApplicationDetail.jsx
│ │ ├── company/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── NewOpportunity.jsx
│ │ │ ├── EditOpportunity.jsx
│ │ │ └── Rankings.jsx
│ │ └── admin/
│ │ └── Dashboard.jsx
│ └── components/
│ ├── ScoreRing.jsx
│ ├── SkillBar.jsx
│ ├── StatusBadge.jsx
│ ├── SkillChip.jsx
│ ├── FairnessAlert.jsx
│ ├── NotificationBell.jsx
│ ├── EmptyState.jsx
│ ├── LoadingSpinner.jsx
│ ├── ConfirmModal.jsx
│ ├── Sidebar.jsx
│ └── PageHeader.jsx
│
├── backend/
│ ├── requirements.txt
│ ├── .env
│ ├── main.py
│ ├── database.py
│ ├── config.py
│ ├── routers/
│ │ ├── auth.py
│ │ ├── student.py
│ │ ├── company.py
│ │ ├── matching.py
│ │ └── admin.py
│ ├── services/
│ │ ├── resume_parser.py
│ │ ├── skill_scorer.py
│ │ ├── matcher.py
│ │ ├── fairness.py
│ │ ├── explainer.py
│ │ └── notification_service.py
│ ├── models/
│ │ ├── student_model.py
│ │ ├── company_model.py
│ │ ├── opportunity_model.py
│ │ ├── application_model.py
│ │ ├── fairness_model.py
│ │ └── notification_model.py
│ ├── tasks/
│ │ └── celery_tasks.py
│ └── utils/
│ ├── jwt_utils.py
│ ├── skill_normalizer.py ← JS→JavaScript mappings
│ └── constants.py

═══════════════════════════════════════════════════════════
PART 9 — ENVIRONMENT & CONFIGURATION
═══════════════════════════════════════════════════════════

backend/.env:
MONGO_URI=mongodb://localhost:27017
MONGO_DB=internship_platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
CELERY_BROKER=redis://localhost:6379/0
CELERY_BACKEND=redis://localhost:6379/1

frontend/.env:
VITE_API_BASE_URL=http://localhost:8000/api

backend/requirements.txt:
fastapi==0.111.0
uvicorn[standard]==0.30.0
motor==3.4.0
beanie==1.26.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
pdfplumber==0.11.0
spacy==3.7.4
pyresparser==1.0.6
sentence-transformers==3.0.0
celery==5.4.0
redis==5.0.6
python-dotenv==1.0.1
dateparser==1.2.0
nltk==3.8.1
Pillow==10.3.0
aiofiles==23.2.1

═══════════════════════════════════════════════════════════
PART 10 — KEY IMPLEMENTATION RULES
═══════════════════════════════════════════════════════════

SECURITY:

- Never return password_hash in any API response
- All student routes require JWT with role=student
- All company routes require JWT with role=company
- File upload: validate PDF mimetype server-side, reject all other types
- Sanitize all text inputs before NLP processing

PERFORMANCE:

- Resume parsing MUST run in Celery background task — never block the HTTP request
- Cache company rankings in Redis (key: rankings:{opportunity_id}) with 1hr TTL
- Invalidate Redis cache when new application is submitted
- Use MongoDB indexes on: email (unique), student_id, opportunity_id, status

ERROR HANDLING:

- Every API endpoint wrapped in try/except
- Return structured errors: { "error": "message", "code": "ERROR_CODE" }
- Frontend: global error boundary + toast notifications for API errors
- If resume parse fails: set status="failed" and notify student

DATA INTEGRITY:

- skill_weights must sum to 100 — validate in Pydantic model
- match_score must be between 0-100
- skill scores must be between 0.0-5.0
- Rank 1 = highest score (ascending rank = descending score)

UX RULES:

- All loading states must show spinners or skeletons
- Empty states must show helpful messages with action CTAs
- All forms must have proper validation with field-level error messages
- Mobile responsive: sidebar collapses to hamburger on mobile
- All data tables must be sortable and filterable
- Toasts for: successful application, resume upload, status changes
- Confirm modal before: deleting opportunity, rejecting applicant

═══════════════════════════════════════════════════════════
PART 11 — STARTUP INSTRUCTIONS TO INCLUDE IN README
═══════════════════════════════════════════════════════════

Generate a README.md with these exact setup commands:

# Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local install — brew install mongodb-community OR apt install mongodb)
- Redis (brew install redis OR apt install redis-server)

# Backend Setup

cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_lg
python -c "import nltk; nltk.download('wordnet'); nltk.download('stopwords')"

# Start MongoDB: mongod

# Start Redis: redis-server

# Start Celery: celery -A tasks.celery_tasks worker --loglevel=info

uvicorn main:app --reload --port 8000

# Frontend Setup

cd frontend
npm install
npm run dev

# Runs at http://localhost:5173

═══════════════════════════════════════════════════════════
DELIVERABLE REQUIREMENTS
═══════════════════════════════════════════════════════════

Produce ALL of the following files completely — no placeholders,
no "// TODO", no truncated code:

BACKEND (complete, working Python code):

1. main.py
2. database.py
3. config.py
4. models/ — all 6 model files
5. routers/ — all 5 router files
6. services/ — all 6 service files
7. utils/ — all 3 utility files
8. tasks/celery_tasks.py
9. requirements.txt
10. .env.example

FRONTEND (complete, working React code):

1. src/main.jsx
2. src/App.jsx
3. src/index.css
4. src/api/ — all 4 API files
5. src/hooks/ — both hooks
6. src/pages/ — all 11 page files
7. src/components/ — all 11 components
8. vite.config.js
9. tailwind.config.js
10. package.json

DOCS:

1. README.md with full setup instructions

Write production-quality code throughout.
No shortcuts. No mock data (use real DB queries).
Every page must be fully styled and functional.
Start with the backend models and database connection,
then services, then routes, then frontend.
