import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Depends

from app.config.database import candidates_collection
from app.utils.auth_dependency import get_current_hr_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Dashboard Stats API
# ---------------------------------------------------------
@router.get("/stats")
async def get_dashboard_stats(
    user: str = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Fetch HR dashboard statistics.
    """

    try:

        # ---------------------------------------------------------
        # STEP 9 PERFORMANCE OPTIMIZATION
        # Use MongoDB aggregation for single-query stats
        # ---------------------------------------------------------
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_candidates": {"$sum": 1},
                    "shortlisted": {
                        "$sum": {"$cond": [{"$eq": ["$status", "shortlisted"]}, 1, 0]}
                    },
                    "rejected": {
                        "$sum": {"$cond": [{"$eq": ["$status", "rejected"]}, 1, 0]}
                    },
                    "hired": {"$sum": {"$cond": [{"$eq": ["$status", "hired"]}, 1, 0]}},
                    "scheduled_interviews": {
                        "$sum": {"$cond": [{"$ne": ["$scheduled_time", None]}, 1, 0]}
                    },
                    "onboarding_complete": {
                        "$sum": {
                            "$cond": [{"$eq": ["$onboarding_complete", True]}, 1, 0]
                        }
                    },
                }
            }
        ]

        result = list(candidates_collection.aggregate(pipeline))

        if result:
            stats = {
                "total_candidates": result[0].get("total_candidates", 0),
                "shortlisted": result[0].get("shortlisted", 0),
                "rejected": result[0].get("rejected", 0),
                "hired": result[0].get("hired", 0),
                "scheduled_interviews": result[0].get("scheduled_interviews", 0),
                "onboarding_complete": result[0].get("onboarding_complete", 0),
            }
        else:
            stats = {
                "total_candidates": 0,
                "shortlisted": 0,
                "rejected": 0,
                "hired": 0,
                "scheduled_interviews": 0,
                "onboarding_complete": 0,
            }

        logger.info("Dashboard statistics fetched")

        return {
            "status": "success",
            "data": stats,
        }

    except Exception as e:

        logger.exception(f"Failed fetching dashboard stats: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve dashboard statistics",
        )


# ---------------------------------------------------------
# Candidate Pipeline API
# ---------------------------------------------------------
@router.get("/pipeline")
async def get_candidate_pipeline(
    user: str = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Fetch candidate pipeline breakdown.
    """

    try:

        pipeline = {
            "pending": candidates_collection.count_documents({"status": "pending"}),
            "shortlisted": candidates_collection.count_documents(
                {"status": "shortlisted"}
            ),
            "rejected": candidates_collection.count_documents({"status": "rejected"}),
            "hired": candidates_collection.count_documents({"status": "hired"}),
        }

        logger.info("Candidate pipeline fetched")

        return {
            "status": "success",
            "data": pipeline,
        }

    except Exception as e:

        logger.exception(f"Failed fetching pipeline data: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve pipeline data",
        )
