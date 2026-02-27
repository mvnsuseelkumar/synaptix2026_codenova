"""Database connection and initialization using Motor + Beanie."""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from config import settings
from models.student_model import Student
from models.company_model import Company
from models.opportunity_model import Opportunity
from models.application_model import Application
from models.fairness_model import FairnessLog
from models.notification_model import Notification


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]

    await init_beanie(
        database=db,
        document_models=[
            Student,
            Company,
            Opportunity,
            Application,
            FairnessLog,
            Notification,
        ],
    )

    # Create indexes
    await Student.get_motor_collection().create_index("email", unique=True)
    await Company.get_motor_collection().create_index("email", unique=True)
    await Application.get_motor_collection().create_index("student_id")
    await Application.get_motor_collection().create_index("opportunity_id")
    await Application.get_motor_collection().create_index("status")
    await Notification.get_motor_collection().create_index("user_id")

    return client
