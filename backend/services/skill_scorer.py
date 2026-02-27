"""Skill scoring service — standalone scoring utilities for skills."""

from typing import Dict, List
from utils.constants import MAX_SKILL_SCORE
from utils.skill_normalizer import normalize_skill


def _find_skill_in_profile(skill: str, skill_profile: Dict):
    """Find a skill in the profile using case-insensitive + normalized matching.

    Tries: exact match → lowercase match → normalized alias match.
    Returns the skill data dict/object or None.
    """
    # 1. Exact match
    if skill in skill_profile:
        return skill_profile[skill]

    # 2. Case-insensitive match
    skill_lower = skill.lower()
    for profile_skill, data in skill_profile.items():
        if profile_skill.lower() == skill_lower:
            return data

    # 3. Normalized alias match (e.g. "React" matches "React.js")
    normalized = normalize_skill(skill).lower()
    for profile_skill, data in skill_profile.items():
        if normalize_skill(profile_skill).lower() == normalized:
            return data

    return None


def calculate_weighted_score(
    skill_weights: Dict[str, int],
    skill_profile: Dict,
) -> tuple:
    """Calculate weighted competency score from skill weights and student profile.

    Returns (total_score, breakdown_dict).
    """
    match_score = 0.0
    breakdown = {}

    for skill, weight in skill_weights.items():
        skill_data = _find_skill_in_profile(skill, skill_profile)
        if skill_data is None:
            student_score = 0.0
        elif hasattr(skill_data, "score"):
            student_score = skill_data.score
        elif isinstance(skill_data, dict):
            student_score = skill_data.get("score", 0.0)
        else:
            student_score = 0.0

        contribution = (weight / 100) * (student_score / MAX_SKILL_SCORE) * 100
        match_score += contribution

        breakdown[skill] = {
            "weight": weight,
            "student_score": round(student_score, 2),
            "weighted_contribution": round(contribution, 2),
        }

    return round(match_score, 2), breakdown


def check_knockout(
    must_have_skills: List[str],
    skill_profile: Dict,
    min_threshold: float,
) -> tuple:
    """Check if student passes the knockout filter.

    Returns (passed: bool, fail_reason: str | None).
    """
    for skill in must_have_skills:
        skill_data = _find_skill_in_profile(skill, skill_profile)
        if not skill_data:
            return False, f"Missing required skill: {skill}"

        score = skill_data.score if hasattr(skill_data, "score") else skill_data.get("score", 0)
        if score < min_threshold:
            return False, f"Skill '{skill}' score ({score}) below minimum threshold ({min_threshold})"

    return True, None
