"""
Skill Gap Analysis Module
Identifies gaps between candidate skills and job requirements,
suggests improvement areas.
"""
from typing import List, Dict


def analyze_skill_gaps(
    required_skills: List[dict],
    candidate_skills: List[dict]
) -> dict:
    """
    Compare candidate skills against job requirements.
    
    Returns gap analysis with improvement suggestions.
    """
    candidate_map = {}
    for cs in candidate_skills:
        candidate_map[cs["name"].lower().strip()] = cs.get("proficiency", 0)

    gaps = []
    matched = []
    exceeded = []

    for req in required_skills:
        skill_name = req["name"]
        min_prof = req.get("min_proficiency", 5)
        weight = req.get("weight", 0)
        current = candidate_map.get(skill_name.lower().strip(), 0)

        entry = {
            "skill": skill_name,
            "required_proficiency": min_prof,
            "current_proficiency": current,
            "weight": weight,
            "gap": max(0, min_prof - current)
        }

        if current == 0:
            entry["status"] = "missing"
            entry["recommendation"] = f"Start learning {skill_name} — this is a required skill with {weight}% weight."
            gaps.append(entry)
        elif current < min_prof:
            entry["status"] = "below_required"
            entry["recommendation"] = f"Improve {skill_name} from level {current} to at least {min_prof}."
            gaps.append(entry)
        elif current == min_prof:
            entry["status"] = "meets_requirement"
            matched.append(entry)
        else:
            entry["status"] = "exceeds_requirement"
            exceeded.append(entry)

    # Sort gaps by weight (highest impact first)
    gaps.sort(key=lambda x: x["weight"], reverse=True)

    # Calculate overall readiness
    total_skills = len(required_skills)
    ready_count = len(matched) + len(exceeded)
    readiness = (ready_count / total_skills * 100) if total_skills > 0 else 0

    return {
        "gaps": gaps,
        "matched": matched,
        "exceeded": exceeded,
        "total_required": total_skills,
        "skills_ready": ready_count,
        "readiness_percentage": round(readiness, 1),
        "priority_improvements": [g["skill"] for g in gaps[:3]],
        "summary": _generate_gap_summary(readiness, gaps, exceeded)
    }


def _generate_gap_summary(readiness: float, gaps: list, exceeded: list) -> str:
    if readiness >= 90:
        return "You're highly prepared for this role! Minor improvements could make you an even stronger candidate."
    elif readiness >= 70:
        return f"Good foundation! Focus on bridging {len(gaps)} skill gap(s) to strengthen your application."
    elif readiness >= 50:
        return f"Moderate readiness. You need to develop {len(gaps)} skills to be competitive for this position."
    else:
        return f"Significant skill development needed. Consider courses in {', '.join(g['skill'] for g in gaps[:3])}."
