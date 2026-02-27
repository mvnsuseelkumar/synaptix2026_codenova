"""Matching engine — orchestrates the full matching pipeline for an opportunity."""

import logging
import json
from typing import List, Dict
from datetime import datetime

import redis
from beanie import PydanticObjectId

from models.student_model import Student
from models.opportunity_model import Opportunity
from models.application_model import Application, SkillScoreBreakdown
from services.skill_scorer import calculate_weighted_score, check_knockout
from services.fairness import run_fairness_audit
from services.explainer import generate_explanations
from utils.constants import (
    SEMANTIC_BONUS_CAP,
    STATUS_REJECTED,
    RANKINGS_CACHE_TTL,
)
from config import settings

logger = logging.getLogger(__name__)

# Redis client for caching
try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None


def compute_semantic_similarity(student_text: str, job_text: str) -> float:
    """Step 3 — Compute semantic similarity bonus using SBERT.

    Skipped entirely if sentence-transformers is not installed or model not cached.
    """
    if not student_text or not job_text:
        return 0.0

    # Quick check: is sentence-transformers even importable?
    import importlib.util
    if importlib.util.find_spec("sentence_transformers") is None:
        return 0.0

    try:
        import os
        # Check if model is cached locally before importing (avoid blocking download)
        cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "torch", "sentence_transformers")
        if not os.path.exists(cache_dir) or not any(
            "MiniLM" in d for d in os.listdir(cache_dir) if os.path.isdir(os.path.join(cache_dir, d))
        ):
            logger.info("SBERT model not cached, skipping semantic similarity")
            return 0.0

        from sentence_transformers import SentenceTransformer, util
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeddings = model.encode([student_text, job_text], convert_to_tensor=True)
        similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
        bonus = min(similarity * 10, SEMANTIC_BONUS_CAP)
        return round(max(bonus, 0), 2)
    except Exception as e:
        logger.warning(f"Semantic similarity skipped: {e}")
        return 0.0


async def run_matching(opportunity_id: str) -> Dict:
    """Run the full matching pipeline for an opportunity.

    Steps: Knockout → Weighted Scoring → Semantic Boost → Fairness Audit → Ranking → Explanations
    """
    opp = await Opportunity.get(PydanticObjectId(opportunity_id))
    if not opp:
        raise ValueError(f"Opportunity {opportunity_id} not found")

    # Get all applications for this opportunity
    applications = await Application.find(
        Application.opportunity_id == opp.id
    ).to_list()

    if not applications:
        return {"status": "no_applications", "count": 0}

    scored_apps = []
    rejected_apps = []

    for app in applications:
        # Load student
        student = await Student.get(app.student_id)
        if not student:
            continue

        skill_profile = student.skill_profile

        # Step 1 — Knockout filter
        passed, fail_reason = check_knockout(
            opp.must_have_skills, skill_profile, opp.min_score_threshold
        )

        if not passed:
            app.knockout_passed = False
            app.knockout_fail_reason = fail_reason
            app.status = STATUS_REJECTED
            app.match_score = 0.0
            await app.save()
            rejected_apps.append(app)
            continue

        app.knockout_passed = True

        # Step 2 — Weighted competency score
        match_score, breakdown = calculate_weighted_score(
            opp.skill_weights, skill_profile
        )

        # Convert breakdown to SkillScoreBreakdown models
        score_breakdown = {}
        for skill, data in breakdown.items():
            score_breakdown[skill] = SkillScoreBreakdown(
                weight=data["weight"],
                student_score=data["student_score"],
                weighted_contribution=data["weighted_contribution"],
            )

        # Step 3 — Semantic similarity boost
        student_text = " ".join(student.resume_sections.projects) if student.resume_sections.projects else ""
        if student.resume_sections.experience:
            student_text += " " + " ".join(student.resume_sections.experience)

        bonus = compute_semantic_similarity(student_text, opp.description)
        match_score += bonus

        # Cap at 100
        match_score = min(round(match_score, 2), 100.0)

        app.match_score = match_score
        app.score_breakdown = score_breakdown
        app.semantic_similarity_bonus = bonus
        app.student_institution = student.profile_meta.institution
        scored_apps.append(app)

    # Step 4 — Fairness audit
    scored_apps = await run_fairness_audit(scored_apps, opp)

    # Step 5 — Rank assignment
    scored_apps.sort(key=lambda a: a.match_score, reverse=True)
    for i, app in enumerate(scored_apps, start=1):
        app.rank = i

    # Step 6 — Explanation generation
    scored_apps = generate_explanations(scored_apps, opp)

    # Save all applications
    for app in scored_apps:
        await app.save()

    # Step 7 — Cache in Redis
    if redis_client:
        try:
            cache_key = f"rankings:{opportunity_id}"
            rankings_data = []
            for app in scored_apps:
                rankings_data.append({
                    "application_id": str(app.id),
                    "student_id": str(app.student_id),
                    "student_name": app.student_name,
                    "rank": app.rank,
                    "match_score": app.match_score,
                    "status": app.status,
                })
            redis_client.setex(cache_key, RANKINGS_CACHE_TTL, json.dumps(rankings_data))
        except Exception as e:
            logger.warning(f"Redis cache set failed: {e}")

    return {
        "status": "completed",
        "total": len(applications),
        "scored": len(scored_apps),
        "rejected_knockout": len(rejected_apps),
    }


def invalidate_rankings_cache(opportunity_id: str):
    """Invalidate cached rankings when new applications arrive."""
    if redis_client:
        try:
            redis_client.delete(f"rankings:{opportunity_id}")
        except Exception as e:
            logger.warning(f"Redis cache invalidation failed: {e}")
