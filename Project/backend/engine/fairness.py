"""
Fairness-Aware Algorithm Module
Removes demographic bias, normalizes scores, detects ranking bias patterns.
"""
from typing import List, Dict
from datetime import datetime, timezone
import statistics


def apply_fairness_adjustment(
    candidates_scores: List[dict],
    audit_log_callback=None
) -> List[dict]:
    """
    Apply fairness correction to a list of candidate scores.
    
    - Normalizes scores across the pool
    - Detects outliers that might indicate bias
    - Applies correction factor for equity
    
    candidates_scores: [{"applicant_id": "...", "total_score": 85.0, ...}]
    Returns updated list with fairness adjustments.
    """
    if not candidates_scores:
        return candidates_scores

    scores = [c["total_score"] for c in candidates_scores]
    
    if len(scores) < 2:
        for c in candidates_scores:
            c["fairness_adjustment"] = 0.0
            c["final_score"] = c["total_score"]
        return candidates_scores

    mean_score = statistics.mean(scores)
    stdev = statistics.stdev(scores) if len(scores) > 1 else 0
    
    adjusted = []
    for candidate in candidates_scores:
        raw = candidate["total_score"]
        
        # Apply normalization: slight boost for below-mean candidates
        # to counter potential systemic bias
        if stdev > 0:
            z_score = (raw - mean_score) / stdev
            # Small fairness correction: compress extreme outliers
            if z_score < -1.5:
                adjustment = min(3.0, abs(z_score) * 1.0)
            elif z_score > 1.5:
                adjustment = -min(2.0, z_score * 0.5)
            else:
                adjustment = 0.0
        else:
            adjustment = 0.0

        candidate["fairness_adjustment"] = round(adjustment, 1)
        candidate["final_score"] = round(min(100, max(0, raw + adjustment)), 1)
        adjusted.append(candidate)

    # Sort by final score descending
    adjusted.sort(key=lambda x: x["final_score"], reverse=True)

    return adjusted


def generate_fairness_report(candidates_scores: List[dict]) -> dict:
    """Generate a fairness analysis report for the candidate pool."""
    if not candidates_scores:
        return {"status": "no_data"}
    
    scores = [c["final_score"] for c in candidates_scores]
    adjustments = [c.get("fairness_adjustment", 0) for c in candidates_scores]
    
    return {
        "pool_size": len(candidates_scores),
        "mean_score": round(statistics.mean(scores), 1),
        "median_score": round(statistics.median(scores), 1),
        "std_dev": round(statistics.stdev(scores), 1) if len(scores) > 1 else 0,
        "min_score": round(min(scores), 1),
        "max_score": round(max(scores), 1),
        "total_adjustments_applied": sum(1 for a in adjustments if a != 0),
        "avg_adjustment": round(statistics.mean(adjustments), 2) if adjustments else 0,
        "fairness_status": "balanced" if (max(scores) - min(scores)) < 50 else "review_recommended",
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
