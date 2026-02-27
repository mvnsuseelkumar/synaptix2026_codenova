"""Celery tasks for async background processing."""

import asyncio
import logging
from celery import Celery
from config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "internship_platform",
    broker=settings.CELERY_BROKER,
    backend=settings.CELERY_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)


def _run_async(coro):
    """Helper to run async functions in Celery sync tasks."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _init_and_parse(file_path: str, student_id: str):
    """Initialize DB and run resume parsing."""
    from database import init_db
    from services.resume_parser import parse_resume

    await init_db()
    result = await parse_resume(file_path, student_id)
    return result


async def _init_and_match(opportunity_id: str):
    """Initialize DB and run matching."""
    from database import init_db
    from services.matcher import run_matching

    await init_db()
    result = await run_matching(opportunity_id)
    return result


@celery_app.task(bind=True, name="tasks.parse_resume")
def task_parse_resume(self, file_path: str, student_id: str):
    """Celery task for async resume parsing."""
    logger.info(f"Starting resume parse for student {student_id}")
    try:
        result = _run_async(_init_and_parse(file_path, student_id))
        logger.info(f"Resume parse completed for student {student_id}: {result}")
        return result
    except Exception as e:
        logger.error(f"Resume parse task failed: {e}")
        raise


@celery_app.task(bind=True, name="tasks.run_matching")
def task_run_matching(self, opportunity_id: str):
    """Celery task for async matching pipeline."""
    logger.info(f"Starting matching for opportunity {opportunity_id}")
    try:
        result = _run_async(_init_and_match(opportunity_id))
        logger.info(f"Matching completed for opportunity {opportunity_id}: {result}")
        return result
    except Exception as e:
        logger.error(f"Matching task failed: {e}")
        raise
