from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.jobs.create_index("recruiter_id")
    await db.applications.create_index([("job_id", 1), ("applicant_id", 1)], unique=True)
    await db.audit_logs.create_index("timestamp")
    print(f"Connected to MongoDB: {DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
