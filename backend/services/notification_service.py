"""Notification service — creates and manages in-app notifications."""

from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId

from models.notification_model import Notification
from utils.constants import (
    NOTIF_SHORTLISTED,
    NOTIF_REJECTED,
    NOTIF_NEW_APPLICATION,
    NOTIF_SCORE_READY,
)


async def create_notification(
    user_id: str,
    notif_type: str,
    title: str,
    message: str,
) -> Notification:
    """Create a new notification for a user."""
    notification = Notification(
        user_id=PydanticObjectId(user_id),
        type=notif_type,
        title=title,
        message=message,
        read=False,
        created_at=datetime.utcnow(),
    )
    await notification.insert()
    return notification


async def notify_student_shortlisted(
    student_id: str,
    role_title: str,
    company_name: str,
):
    """Notify student they have been shortlisted."""
    await create_notification(
        user_id=student_id,
        notif_type=NOTIF_SHORTLISTED,
        title=f"Shortlisted for {role_title}",
        message=f"Congratulations! You've been shortlisted for {role_title} at {company_name}.",
    )


async def notify_student_rejected(
    student_id: str,
    role_title: str,
    company_name: str,
):
    """Notify student their application was rejected."""
    await create_notification(
        user_id=student_id,
        notif_type=NOTIF_REJECTED,
        title=f"Application Update for {role_title}",
        message=f"Your application for {role_title} at {company_name} has been reviewed.",
    )


async def notify_company_new_application(
    company_id: str,
    student_name: str,
    role_title: str,
):
    """Notify company of a new application."""
    await create_notification(
        user_id=company_id,
        notif_type=NOTIF_NEW_APPLICATION,
        title=f"New Application for {role_title}",
        message=f"{student_name} has applied for {role_title}.",
    )


async def notify_student_score_ready(
    student_id: str,
    role_title: str,
    company_name: str,
    match_score: float,
):
    """Notify student their match score is ready."""
    await create_notification(
        user_id=student_id,
        notif_type=NOTIF_SCORE_READY,
        title=f"Match Score Ready for {role_title}",
        message=f"Your match score for {role_title} at {company_name} is {match_score}.",
    )
