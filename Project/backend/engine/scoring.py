"""
Enhanced Weighted Competency Scoring Engine with Match-Based Bonus

Formula:
  Step 1: Manual Score = proficiency * 10 (scale to 0-100)
  Step 2: Project Bonus + Experience Bonus = Base Bonus
  Step 3: Adjusted Bonus = Base Bonus × Job Skill Weight (only if skill in job requirements)
  Step 4: Final Skill Score = (0.6 × Manual) + (0.4 × Adjusted Bonus), cap at 100
  Step 5: Match Score = Σ (Final Skill Score × Normalized Job Weight)
"""
from typing import List, Dict, Optional


COMPLEXITY_BONUS = {"low": 2, "medium": 5, "high": 10}


def normalize_weights(skills: List[dict]) -> List[dict]:
    """Normalize skill weights to sum to 1.0"""
    total_weight = sum(s.get("weight", 0) for s in skills)
    if total_weight == 0:
        return skills
    normalized = []
    for s in skills:
        ns = dict(s)
        ns["weight"] = s.get("weight", 0) / total_weight
        normalized.append(ns)
    return normalized


def _compute_project_bonus(skill_name: str, projects: List[dict]) -> dict:
    """
    Project Bonus = (projects_using_skill × 5) + (total_duration × 0.5) + complexity_bonus
    """
    skill_lower = skill_name.lower().strip()
    matching_projects = 0
    total_duration = 0
    total_complexity_bonus = 0

    for proj in projects:
        skills_used = [s.lower().strip() for s in proj.get("skills_used", [])]
        if skill_lower in skills_used:
            matching_projects += 1
            total_duration += proj.get("duration_months", 0)
            complexity = proj.get("complexity", "low").lower()
            total_complexity_bonus += COMPLEXITY_BONUS.get(complexity, 0)

    bonus = (matching_projects * 5) + (total_duration * 0.5) + total_complexity_bonus
    return {
        "project_bonus": round(min(bonus, 30), 1),
        "matching_projects": matching_projects,
        "total_duration": total_duration
    }


def _compute_experience_bonus(skill_name: str, experience: List[dict]) -> dict:
    """
    Experience Bonus = (relevant_months × 0.8) + role_relevance_bonus
    """
    skill_lower = skill_name.lower().strip()
    total_months = 0
    role_relevance_bonus = 0

    for exp in experience:
        desc = (exp.get("description", "") + " " + exp.get("title", "")).lower()
        duration_str = exp.get("duration", "")

        # Parse months from duration string like "3 months", "6 months", "1 year"
        months = 0
        if duration_str:
            dur_lower = duration_str.lower()
            try:
                num = int(''.join(filter(str.isdigit, dur_lower)) or '0')
                if "year" in dur_lower:
                    months = num * 12
                else:
                    months = num
            except ValueError:
                months = 0

        if skill_lower in desc:
            total_months += months
            role_relevance_bonus += 3

    bonus = (total_months * 0.8) + role_relevance_bonus
    return {
        "experience_bonus": round(min(bonus, 20), 1),
        "relevant_months": total_months
    }


def compute_match_score(
    required_skills: List[dict],
    candidate_skills: List[dict],
    experience_level: str = "beginner",
    candidate_experience: List[dict] = None,
    candidate_projects: List[dict] = None
) -> dict:
    """
    Compute enhanced weighted competency match score with project + experience bonus.

    required_skills: [{"name": "Python", "weight": 30, "min_proficiency": 5}]
    candidate_skills: [{"name": "Python", "proficiency": 8}]
    candidate_projects: [{"name": "ML App", "skills_used": ["Python", "ML"], "duration_months": 3, "complexity": "high"}]

    Returns detailed scoring breakdown with bonus information.
    """
    normalized = normalize_weights(required_skills)
    candidate_skill_map = {}
    for cs in candidate_skills:
        candidate_skill_map[cs["name"].lower().strip()] = cs.get("proficiency", 0)

    if candidate_experience is None:
        candidate_experience = []
    if candidate_projects is None:
        candidate_projects = []

    skill_breakdown = []
    total_score = 0.0
    strengths = []
    missing_skills = []
    partial_matches = []
    max_proficiency = 10

    for req in normalized:
        skill_name = req["name"]
        weight = req["weight"]
        min_prof = req.get("min_proficiency", 1)
        candidate_prof = candidate_skill_map.get(skill_name.lower().strip(), 0)

        # Step 1: Manual Score (0-100)
        manual_score = candidate_prof * 10

        # Step 2: Compute bonuses
        proj_bonus_data = _compute_project_bonus(skill_name, candidate_projects)
        exp_bonus_data = _compute_experience_bonus(skill_name, candidate_experience)
        base_bonus = min(proj_bonus_data["project_bonus"] + exp_bonus_data["experience_bonus"], 40)

        # Step 3: Apply job skill weight to bonus
        adjusted_bonus = base_bonus * weight if candidate_prof > 0 else 0.0

        # Step 4: Final Skill Score
        if candidate_prof > 0:
            final_skill_score = min(100, (0.6 * manual_score) + (0.4 * adjusted_bonus * 100))
            # Normalize contribution: how much this skill adds to final match score
            contribution = weight * (final_skill_score / 100)
            total_score += contribution

            if candidate_prof >= min_prof:
                status = "matched"
                if candidate_prof >= 7:
                    strengths.append(skill_name)
            else:
                status = "partial"
                partial_matches.append(skill_name)
        else:
            final_skill_score = 0.0
            contribution = 0.0
            status = "missing"
            missing_skills.append(skill_name)

        skill_breakdown.append({
            "skill": skill_name,
            "weight": round(weight * 100, 1),
            "candidate_proficiency": candidate_prof,
            "max_proficiency": max_proficiency,
            "manual_score": round(manual_score, 1),
            "project_bonus": proj_bonus_data["project_bonus"],
            "experience_bonus": exp_bonus_data["experience_bonus"],
            "base_bonus": round(base_bonus, 1),
            "adjusted_bonus": round(adjusted_bonus, 1),
            "final_skill_score": round(final_skill_score, 1),
            "contribution": round(contribution * 100, 1),
            "status": status,
            "matching_projects": proj_bonus_data["matching_projects"]
        })

    # Experience match factor
    exp_levels = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}
    required_exp = exp_levels.get(experience_level, 1)
    candidate_exp_count = len(candidate_experience)
    if candidate_exp_count >= required_exp:
        experience_match = "strong"
    elif candidate_exp_count >= required_exp - 1:
        experience_match = "moderate"
    else:
        experience_match = "weak"

    # Skill coverage
    total_required = len(normalized)
    matched_count = total_required - len(missing_skills)
    skill_coverage = matched_count / total_required if total_required > 0 else 0

    # Confidence
    confidence = min(0.95, skill_coverage * 0.8 + 0.15)

    return {
        "total_score": round(total_score * 100, 1),
        "skill_breakdown": skill_breakdown,
        "strengths": strengths,
        "missing_skills": missing_skills,
        "partial_matches": partial_matches,
        "experience_match": experience_match,
        "skill_coverage": round(skill_coverage * 100, 1),
        "confidence": round(confidence * 100, 1)
    }
