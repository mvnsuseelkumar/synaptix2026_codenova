import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "synaptix_db")
JWT_SECRET = os.getenv("JWT_SECRET", "synaptix-super-secret-key-change-in-production-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60 * 24  # 24 hours
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
