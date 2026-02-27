"""Explanation generator — produces human-readable reasons for matching scores."""

from typing import List

from models.application_model import Application, Explanation
from models.opportunity_model import Opportunity


def generate_explanations(
    scored_apps: List[Application],
    opportunity: Opportunity,
) -> List[Application]:
    """Step 6 — Generate explanations for each ranked applicant.

    For each ranked applicant:
    - rank_reason: Compare their scores to rank-1 applicant
    - improvement_tips: For each skill where student < 3.0
    - strong_areas: Skills where student_score > 3.5
    """
    if not scored_apps:
        return scored_apps

    # Top candidate for comparison
    top_app = scored_apps[0] if scored_apps else None

    for app in scored_apps:
        rank_reason = ""
        improvement_tips = []
        strong_areas = []

        # Generate rank reason
        if app.rank == 1:
            rank_reason = (
                f"You are the top-ranked candidate with a score of {app.match_score}. "
                f"Your profile best matches the requirements for this position."
            )
        elif top_app:
            # Find the biggest skill gap vs top candidate
            biggest_gap_skill = ""
            biggest_gap = 0

            for skill, breakdown in app.score_breakdown.items():
                if hasattr(breakdown, "student_score"):
                    my_score = breakdown.student_score
                elif isinstance(breakdown, dict):
                    my_score = breakdown.get("student_score", 0)
                else:
                    continue

                top_breakdown = top_app.score_breakdown.get(skill)
                if top_breakdown:
                    top_score = (
                        top_breakdown.student_score
                        if hasattr(top_breakdown, "student_score")
                        else top_breakdown.get("student_score", 0)
                    )
                    gap = top_score - my_score
                    if gap > biggest_gap:
                        biggest_gap = gap
                        biggest_gap_skill = skill

            if biggest_gap_skill and biggest_gap > 0:
                top_bd = top_app.score_breakdown.get(biggest_gap_skill)
                my_bd = app.score_breakdown.get(biggest_gap_skill)
                top_s = top_bd.student_score if hasattr(top_bd, "student_score") else top_bd.get("student_score", 0)
                my_s = my_bd.student_score if hasattr(my_bd, "student_score") else my_bd.get("student_score", 0)
                rank_reason = (
                    f"You ranked #{app.rank} with a score of {app.match_score}. "
                    f"The top candidate scored {top_app.match_score}. "
                    f"The biggest gap was in {biggest_gap_skill} "
                    f"({top_s} vs your {my_s})."
                )
            else:
                score_diff = round(top_app.match_score - app.match_score, 2)
                rank_reason = (
                    f"You ranked #{app.rank} with a score of {app.match_score}, "
                    f"which is {score_diff} points below the top candidate."
                )

        # Generate improvement tips
        for skill, breakdown in app.score_breakdown.items():
            score = (
                breakdown.student_score
                if hasattr(breakdown, "student_score")
                else breakdown.get("student_score", 0)
            )
            weight = (
                breakdown.weight
                if hasattr(breakdown, "weight")
                else breakdown.get("weight", 0)
            )
            if score < 3.0:
                improvement_tips.append(
                    f"Improve your {skill} score (currently {score}/5.0) — "
                    f"it carries {weight}% weight in this role."
                )

        # Identify strong areas
        for skill, breakdown in app.score_breakdown.items():
            score = (
                breakdown.student_score
                if hasattr(breakdown, "student_score")
                else breakdown.get("student_score", 0)
            )
            if score > 3.5:
                strong_areas.append(skill)

        # Add semantic similarity note
        if app.semantic_similarity_bonus > 5:
            strong_areas.append("Strong project relevance to this role")

        app.explanation = Explanation(
            rank_reason=rank_reason,
            improvement_tips=improvement_tips,
            strong_areas=strong_areas,
        )

    return scored_apps
