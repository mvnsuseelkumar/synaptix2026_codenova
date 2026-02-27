# InternMatch — AI-Powered Internship Matching Platform

An intelligent internship/job matching platform with AI-powered resume parsing, weighted skill scoring, semantic similarity matching, and fairness auditing.

## Features

- **Students**: Upload resume, browse opportunities, apply, view match scores & explanations
- **Companies**: Post opportunities, configure skill weights, view ranked applicants
- **Admin**: Monitor fairness flags, manage users, platform statistics
- **AI Matching Engine**: Resume parsing → skill scoring → weighted matching → semantic similarity → fairness audit → ranking

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Recharts (visualizations)
- React Query v5 (server state)
- React Router v6 (role-based routing)
- React Hook Form + Zod (validation)
- Lucide React (icons)

### Backend
- Python 3.11+ / FastAPI
- MongoDB + Motor + Beanie ODM
- Redis (caching + Celery broker)
- Celery (async task processing)
- JWT authentication (python-jose)
- bcrypt password hashing (passlib)

### AI/NLP
- pdfplumber (PDF extraction)
- spaCy en_core_web_lg (NER)
- pyresparser (resume parsing)
- sentence-transformers all-MiniLM-L6-v2 (semantic similarity)
- NLTK + WordNet (synonym expansion)

---

## Prerequisites

- **Node.js 18+**
- **Python 3.11+**
- **MongoDB** (local install)
  - macOS: `brew install mongodb-community`
  - Linux: `apt install mongodb`
  - Windows: [Download from mongodb.com](https://www.mongodb.com/try/download/community)
- **Redis**
  - macOS: `brew install redis`
  - Linux: `apt install redis-server`
  - Windows: [Download from redis.io](https://redis.io/download)

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_lg

# Download NLTK data
python -c "import nltk; nltk.download('wordnet'); nltk.download('stopwords')"

# Start MongoDB (in a separate terminal)
mongod

# Start Redis (in a separate terminal)
redis-server

# Start Celery worker (in a separate terminal)
celery -A tasks.celery_tasks worker --loglevel=info

# Start the API server
uvicorn main:app --reload --port 8000
```

The API runs at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Runs at **http://localhost:5173**

---

## Environment Variables

### Backend (`backend/.env`)
```
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
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Default Admin Account

```
Email: admin@platform.com
Password: admin123
```

---

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios API layer
│   │   ├── hooks/        # Auth & notification hooks
│   │   ├── components/   # 11 shared UI components
│   │   └── pages/        # Landing, Auth, Student, Company, Admin
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── models/           # 6 Beanie ODM models
│   ├── routers/          # 5 FastAPI route files
│   ├── services/         # 6 service files (matcher, parser, etc.)
│   ├── tasks/            # Celery async tasks
│   ├── utils/            # JWT, skill normalizer, constants
│   ├── main.py           # FastAPI app entry point
│   └── database.py       # MongoDB connection
│
└── README.md
```

---

## API Endpoints

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/auth` | Register, login, user info |
| Student | `/api/student` | Profile, resume, opportunities, applications |
| Company | `/api/company` | Profile, opportunities CRUD, rankings |
| Matching | `/api/matching` | Trigger/check matching pipeline |
| Admin | `/api/admin` | Fairness logs, users, stats |
