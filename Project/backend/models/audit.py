from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLog(BaseModel):
    action: str
    user_id: str
    details: dict
    timestamp: Optional[str] = None
    category: str = "general"  # general, fairness, scoring, access
