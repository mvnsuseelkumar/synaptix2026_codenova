"""
Weighted Competency Scoring Engine
Match Score = Σ (Skill Weight × Candidate Proficiency / Max Proficiency)
"""
from typing import List, Dict, Optional


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


def compute_match_score(
    required_skills: List[dict],
    candidate_skills: List[dict],
    experience_level: str = "beginner",
    candidate_experience: List[dict] = None
) -> dict:
    """
    Compute weighted competency match score.
    
    required_skills: [{"name": "Python", "weight": 30, "min_proficiency": 5}]
    candidate_skills: [{"name": "Python", "proficiency": 8}]
    
    Returns detailed scoring breakdown.
    """
    normalized = normalize_weights(required_skills)
    candidate_skill_map = {}
    for cs in candidate_skills:
        candidate_skill_map[cs["name"].lower().strip()] = cs.get("proficiency", 0)

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

        if candidate_prof > 0:
            contribution = weight * (candidate_prof / max_proficiency)
            total_score += contribution

            if candidate_prof >= min_prof:
                status = "matched"
                if candidate_prof >= 7:
                    strengths.append(skill_name)
            else:
                status = "partial"
                partial_matches.append(skill_name)
        else:
            contribution = 0.0
            status = "missing"
            missing_skills.append(skill_name)

        skill_breakdown.append({
            "skill": skill_name,
            "weight": round(weight * 100, 1),
            "candidate_proficiency": candidate_prof,
            "max_proficiency": max_proficiency,
            "contribution": round(contribution * 100, 1),
            "status": status
        })

    # Experience match factor
    exp_levels = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}
    required_exp = exp_levels.get(experience_level, 1)
    candidate_exp_years = len(candidate_experience) if candidate_experience else 0
    if candidate_exp_years >= required_exp:
        experience_match = "strong"
    elif candidate_exp_years >= required_exp - 1:
        experience_match = "moderate"
    else:
        experience_match = "weak"

    # Skill coverage 
    total_required = len(normalized)
    matched_count = total_required - len(missing_skills)
    skill_coverage = matched_count / total_required if total_required > 0 else 0

    # Confidence based on how many skills were assessable
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
