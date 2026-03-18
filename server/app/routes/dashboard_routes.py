import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Path
from bson import ObjectId

from app.config.database import candidates_collection, users_collection  # ✅ FIX
from app.utils.auth_dependency import get_current_hr_user
from datetime import datetime  # ✅ FIX

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Dashboard Stats API
# ---------------------------------------------------------
@router.get("/stats")
async def get_dashboard_stats(
    user: dict = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Fetch HR dashboard statistics.
    """

    try:

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

        logger.info(f"Dashboard statistics fetched by {user['email']}")

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
    user: dict = Depends(get_current_hr_user),
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

        logger.info(f"Candidate pipeline fetched by {user['email']}")

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


# ---------------------------------------------------------
# Get All Candidates (HR Management)
# ---------------------------------------------------------
@router.get("/candidates")
async def get_all_candidates(
    user: dict = Depends(get_current_hr_user),
) -> Dict[str, Any]:

    try:

        candidates = list(candidates_collection.find({}))

        for c in candidates:
            c["_id"] = str(c["_id"])

        logger.info(f"Candidate list fetched by {user['email']}")

        return {
            "status": "success",
            "data": candidates,
        }

    except Exception as e:

        logger.exception(f"Failed fetching candidates: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch candidates",
        )


# ---------------------------------------------------------
# Update Candidate Status or Score
# ---------------------------------------------------------
@router.put("/candidate/{candidate_id}")
async def update_candidate_status(
    candidate_id: str = Path(...),
    payload: Dict[str, Any] = {},
    user: dict = Depends(get_current_hr_user),
) -> Dict[str, Any]:

    try:

        update_fields = {}

        if "status" in payload:
            update_fields["status"] = payload["status"]

        if "interview_score" in payload:
            update_fields["interview_score"] = payload["interview_score"]

        if not update_fields:
            raise HTTPException(
                status_code=400,
                detail="No fields provided for update",
            )

        # ✅ ADD timestamp (important)
        update_fields["updated_at"] = datetime.utcnow()

        # -----------------------------------
        # Update candidates_collection
        # -----------------------------------
        result = candidates_collection.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": update_fields},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found",
            )

        # -----------------------------------
        # 🔥 Sync with users_collection (FINAL FIX)
        # -----------------------------------
        candidate = candidates_collection.find_one({"_id": ObjectId(candidate_id)})

        if candidate and "email" in candidate:

            users_collection.update_one(
                {"email": candidate["email"]},
                {"$set": update_fields},
            )

        logger.info(f"Candidate updated by {user['email']}")

        return {
            "status": "success",
            "message": "Candidate updated successfully",
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Candidate update failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to update candidate",
        )


# ---------------------------------------------------------
# Delete Candidate
# ---------------------------------------------------------
@router.delete("/candidate/{candidate_id}")
async def delete_candidate(
    candidate_id: str,
    user: dict = Depends(get_current_hr_user),
):

    try:

        result = candidates_collection.delete_one({"_id": ObjectId(candidate_id)})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found",
            )

        logger.info(f"Candidate deleted by {user['email']}")

        return {
            "status": "success",
            "message": "Candidate deleted",
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Candidate deletion failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to delete candidate",
        )
