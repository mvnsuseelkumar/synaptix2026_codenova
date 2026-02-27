"""Company document model for Beanie ODM."""

from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class Company(Document):
    name: str
    email: str
    password_hash: str
    role: str = "company"
    industry: str = ""
    website: str = ""
    description: str = ""
    logo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "companies"
