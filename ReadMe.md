C:\Users\YourName\projects\internship-platform\
│
├── frontend\ ← React app
│ ├── src\
│ │ ├── pages\
│ │ │ ├── StudentDashboard.jsx
│ │ │ ├── CompanyDashboard.jsx
│ │ │ ├── ApplicationStatus.jsx
│ │ │ └── Explanation.jsx
│ │ ├── components\
│ │ │ ├── ScoreBar.jsx
│ │ │ ├── RankCard.jsx
│ │ │ └── FairnessAlert.jsx
│ │ └── api\
│ │ └── axios.js
│
├── backend\ ← FastAPI app
│ ├── main.py
│ ├── database.py
│ ├── uploads\
│ │ └── resumes\ ← PDFs stored here
│ ├── routers\
│ │ ├── auth.py
│ │ ├── student.py
│ │ ├── company.py
│ │ └── matching.py
│ ├── services\
│ │ ├── resume_parser.py
│ │ ├── skill_scorer.py
│ │ ├── matcher.py
│ │ ├── fairness.py
│ │ └── explainer.py
│ ├── models\
│ │ ├── student_model.py
│ │ ├── company_model.py
│ │ ├── opportunity_model.py
│ │ └── application_model.py
│ ├── tasks\
│ │ └── celery_tasks.py
│ ├── venv\ ← virtual environment
│ └── requirements.txt
│
└── README.md
