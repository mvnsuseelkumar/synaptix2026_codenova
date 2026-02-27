"""
Explainability Layer
Generates human-readable explanations for every ranking decision.
Includes bonus breakdown from projects and experience.
"""
from typing import List, Dict


def generate_explanation(scoring_result: dict, fairness_adj: float = 0.0) -> dict:
    """
    Generate a comprehensive, human-readable explanation for a match score.

    scoring_result: output from scoring.compute_match_score()
    fairness_adj: fairness adjustment value

    Returns explanation dict with narrative, visual data, and bonus breakdown.
    """
    breakdown = scoring_result["skill_breakdown"]
    total = scoring_result["total_score"]
    final = round(min(100, total + fairness_adj), 1)

    # Build narrative explanation
    narrative_parts = []

    # Overall assessment
    if final >= 80:
        overall = "Excellent match"
        narrative_parts.append(f"This candidate is an excellent match with a score of {final}%.")
    elif final >= 60:
        overall = "Good match"
        narrative_parts.append(f"This candidate is a good match with a score of {final}%.")
    elif final >= 40:
        overall = "Moderate match"
        narrative_parts.append(f"This candidate shows moderate alignment with a score of {final}%.")
    else:
        overall = "Low match"
        narrative_parts.append(f"This candidate has limited skill overlap with a score of {final}%.")

    # Strengths
    if scoring_result["strengths"]:
        strengths_str = ", ".join(scoring_result["strengths"])
        narrative_parts.append(f"Strong performance in: {strengths_str}.")

    # Missing skills
    if scoring_result["missing_skills"]:
        missing_str = ", ".join(scoring_result["missing_skills"])
        narrative_parts.append(f"Missing required skills: {missing_str}.")

    # Partial matches
    if scoring_result["partial_matches"]:
        partial_str = ", ".join(scoring_result["partial_matches"])
        narrative_parts.append(f"Partial skill match in: {partial_str} — could improve with training.")

    # Project & experience bonus note
    has_bonus = any(s.get("project_bonus", 0) > 0 or s.get("experience_bonus", 0) > 0 for s in breakdown)
    if has_bonus:
        bonus_skills = [s["skill"] for s in breakdown if s.get("project_bonus", 0) > 0 or s.get("experience_bonus", 0) > 0]
        narrative_parts.append(f"Project/experience bonuses applied to: {', '.join(bonus_skills)}.")

    # Fairness note
    if fairness_adj != 0:
        direction = "boost" if fairness_adj > 0 else "adjustment"
        narrative_parts.append(
            f"A fairness {direction} of {fairness_adj:+.1f}% was applied to ensure equitable evaluation."
        )

    # Experience
    exp = scoring_result.get("experience_match", "unknown")
    if exp == "strong":
        narrative_parts.append("Experience level is a strong match for this role.")
    elif exp == "moderate":
        narrative_parts.append("Experience level is adequate for this role.")
    else:
        narrative_parts.append("Experience level may need supplementation.")

    # Build chart data for frontend visualization (with bonus details)
    chart_data = []
    for skill in breakdown:
        entry = {
            "skill": skill["skill"],
            "weight": skill["weight"],
            "contribution": skill["contribution"],
            "proficiency": skill["candidate_proficiency"],
            "maxProficiency": skill["max_proficiency"],
            "status": skill["status"],
            # Bonus breakdown fields
            "manual_score": skill.get("manual_score", 0),
            "project_bonus": skill.get("project_bonus", 0),
            "experience_bonus": skill.get("experience_bonus", 0),
            "base_bonus": skill.get("base_bonus", 0),
            "adjusted_bonus": skill.get("adjusted_bonus", 0),
            "final_skill_score": skill.get("final_skill_score", 0),
            "matching_projects": skill.get("matching_projects", 0)
        }
        chart_data.append(entry)

    return {
        "overall_assessment": overall,
        "total_score": total,
        "fairness_adjustment": fairness_adj,
        "final_score": final,
        "narrative": " ".join(narrative_parts),
        "skill_breakdown": chart_data,
        "strengths": scoring_result["strengths"],
        "missing_skills": scoring_result["missing_skills"],
        "partial_matches": scoring_result["partial_matches"],
        "experience_match": exp,
        "skill_coverage": scoring_result["skill_coverage"],
        "confidence": scoring_result["confidence"]
    }
