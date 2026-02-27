"""Notification document model for Beanie ODM."""

from datetime import datetime
from beanie import Document, PydanticObjectId
from pydantic import Field


class Notification(Document):
    user_id: PydanticObjectId
    type: str  # shortlisted | rejected | new_application | score_ready
    title: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
