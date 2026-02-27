"""Fairness audit service — detects institutional concentration bias in rankings."""

import logging
from collections import Counter
from typing import List
from datetime import datetime

from models.application_model import Application
from models.opportunity_model import Opportunity
from models.fairness_model import FairnessLog
from utils.constants import FAIRNESS_INSTITUTION_LIMIT, FAIRNESS_PENALTY

logger = logging.getLogger(__name__)


async def run_fairness_audit(
    scored_apps: List[Application],
    opportunity: Opportunity,
) -> List[Application]:
    """Step 4 — Fairness audit on scored applications.

    Checks top 10 for institutional concentration.
    If any single institution has > 5 of the top 10,
    applies score penalty and creates a fairness flag.
    """
    if len(scored_apps) < 2:
        return scored_apps

    # Sort by score descending
    scored_apps.sort(key=lambda a: a.match_score, reverse=True)

    # Analyze top 10
    top_n = min(10, len(scored_apps))
    top_apps = scored_apps[:top_n]

    # Count institutions in top 10
    institution_counts = Counter()
    for app in top_apps:
        inst = app.student_institution or "Unknown"
        institution_counts[inst] += 1

    # Check for concentration
    flagged = False
    for institution, count in institution_counts.items():
        if count > FAIRNESS_INSTITUTION_LIMIT:
            flagged = True

            # Create fairness log
            log = FairnessLog(
                opportunity_id=opportunity.id,
                flag_type="institution_concentration",
                detail=f"{count}/{top_n} top candidates from {institution}",
                top10_breakdown=dict(institution_counts),
                flagged_at=datetime.utcnow(),
                resolved=False,
            )
            await log.insert()

            # Apply penalty: -0.5 per student beyond the 5th from same institution
            inst_counter = 0
            for app in scored_apps:
                app_inst = app.student_institution or "Unknown"
                if app_inst == institution:
                    inst_counter += 1
                    if inst_counter > FAIRNESS_INSTITUTION_LIMIT:
                        penalty = FAIRNESS_PENALTY
                        app.match_score = max(0, round(app.match_score - penalty, 2))
                        app.fairness_flags.append(
                            f"Score adjusted by -{penalty} due to institutional concentration"
                        )

            logger.info(
                f"Fairness flag: {institution} has {count}/{top_n} in top candidates "
                f"for opportunity {opportunity.id}"
            )

    # Re-sort after penalties
    if flagged:
        scored_apps.sort(key=lambda a: a.match_score, reverse=True)

    return scored_apps
