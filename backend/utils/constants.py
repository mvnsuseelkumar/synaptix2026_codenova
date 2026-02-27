"""Application-wide constants."""

# Resume parse statuses
PARSE_PENDING = "pending"
PARSE_PROCESSING = "processing"
PARSE_DONE = "done"
PARSE_FAILED = "failed"

# Application statuses
STATUS_APPLIED = "applied"
STATUS_UNDER_REVIEW = "under_review"
STATUS_SHORTLISTED = "shortlisted"
STATUS_REJECTED = "rejected"

# Opportunity statuses
OPP_OPEN = "open"
OPP_CLOSED = "closed"
OPP_DRAFT = "draft"

# Opportunity modes
MODE_REMOTE = "remote"
MODE_ONSITE = "onsite"
MODE_HYBRID = "hybrid"

# Roles
ROLE_STUDENT = "student"
ROLE_COMPANY = "company"
ROLE_ADMIN = "admin"

# Notification types
NOTIF_SHORTLISTED = "shortlisted"
NOTIF_REJECTED = "rejected"
NOTIF_NEW_APPLICATION = "new_application"
NOTIF_SCORE_READY = "score_ready"

# Scoring constants
MAX_SKILL_SCORE = 5.0
MAX_MATCH_SCORE = 100.0
SEMANTIC_BONUS_CAP = 10.0

# Section weights for skill scoring
WORK_EXP_WEIGHT = 0.40
PROJECTS_WEIGHT = 0.35
CERTIFICATIONS_WEIGHT = 0.15
EDUCATION_WEIGHT = 0.10

# Duration boost thresholds
DURATION_6M_BOOST = 1.1
DURATION_12M_BOOST = 1.2

# Fairness thresholds
FAIRNESS_INSTITUTION_LIMIT = 5
FAIRNESS_PENALTY = 0.5

# Redis cache
RANKINGS_CACHE_TTL = 3600  # 1 hour in seconds

# File upload
ALLOWED_MIME_TYPES = ["application/pdf"]
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Resume section headers for parsing
SECTION_HEADERS = {
    "education": [
        r"education",
        r"academic\s+background",
        r"qualifications",
    ],
    "experience": [
        r"experience",
        r"work\s+experience",
        r"professional\s+experience",
        r"employment",
        r"work\s+history",
    ],
    "projects": [
        r"projects",
        r"personal\s+projects",
        r"academic\s+projects",
        r"key\s+projects",
    ],
    "certifications": [
        r"certifications?",
        r"certificates?",
        r"professional\s+certifications?",
        r"licenses?\s+(?:and|&)\s+certifications?",
    ],
    "courses": [
        r"courses?",
        r"relevant\s+courses?",
        r"coursework",
        r"training",
    ],
    "skills": [
        r"skills?",
        r"technical\s+skills?",
        r"core\s+competencies",
        r"technologies",
    ],
}
