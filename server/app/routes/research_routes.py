import logging
from typing import Dict, Any, List

from fastapi import APIRouter, HTTPException, Depends, Body, Query

from app.config.database import candidates_collection
from app.utils.auth_dependency import get_current_hr_user

# ---------------------------------------------------------
# Router (HR namespace added to avoid route conflicts)
# ---------------------------------------------------------
router = APIRouter(prefix="/hr", tags=["Research"])

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Fetch Single Candidate (HR Dashboard)
# ---------------------------------------------------------
@router.get("/candidate/{name}")
async def get_candidate(
    name: str, user: str = Depends(get_current_hr_user)
) -> Dict[str, Any]:
    """
    Fetch candidate information from MongoDB.
    Used by the HR dashboard.
    """

    try:

        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Candidate name required")

        name = name.strip()

        # -----------------------------
        # Fetch candidate from DB
        # -----------------------------
        candidate = candidates_collection.find_one({"name": name}, {"_id": 0})

        if not candidate:

            logger.warning(f"Candidate not found: {name}")

            return {
                "status": "not_found",
                "message": "Candidate data not available",
                "data": {},
            }

        logger.info(f"Candidate data fetched: {name}")

        # -----------------------------
        # Ensure dashboard-safe fields
        # -----------------------------
        candidate_data = {
            "name": candidate.get("name", name),
            "skills": candidate.get("skills", []),
            "scheduled_time": candidate.get("scheduled_time"),
            "status": candidate.get("status", "pending"),
            "onboarding_complete": candidate.get("onboarding_complete", False),
        }

        return {"status": "success", "data": candidate_data}

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Candidate fetch failed: {e}")

        raise HTTPException(status_code=500, detail="Failed to retrieve candidate data")


# ---------------------------------------------------------
# Fetch ALL candidates for HR dashboard list view
# (Pagination added for performance)
# ---------------------------------------------------------
@router.get("/candidates/")
async def get_all_candidates(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user: str = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Fetch candidates with pagination.
    Used for HR candidate management table.
    """

    try:

        skip = (page - 1) * limit

        # -----------------------------
        # Fetch candidates from DB
        # -----------------------------
        cursor = candidates_collection.find({}, {"_id": 0}).skip(skip).limit(limit)

        candidates: List[Dict[str, Any]] = []

        for candidate in cursor:

            candidate_data = {
                "name": candidate.get("name"),
                "skills": candidate.get("skills", []),
                "scheduled_time": candidate.get("scheduled_time"),
                "status": candidate.get("status", "pending"),
                "onboarding_complete": candidate.get("onboarding_complete", False),
            }

            candidates.append(candidate_data)

        total = candidates_collection.count_documents({})

        logger.info(f"Fetched {len(candidates)} candidates from database")

        return {
            "status": "success",
            "page": page,
            "limit": limit,
            "total": total,
            "data": candidates,
        }

    except Exception as e:

        logger.exception(f"Failed to fetch candidates: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve candidates list",
        )


# ---------------------------------------------------------
# Candidate filtering endpoint
# ---------------------------------------------------------
@router.get("/candidates/filter")
async def filter_candidates(
    status: str,
    user: str = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Filter candidates by status.
    Used by HR dashboard filters.
    """

    try:

        cursor = candidates_collection.find(
            {"status": status},
            {"_id": 0},
        )

        candidates: List[Dict[str, Any]] = list(cursor)

        logger.info(f"{len(candidates)} candidates fetched for status {status}")

        return {
            "status": "success",
            "count": len(candidates),
            "data": candidates,
        }

    except Exception as e:

        logger.exception(f"Candidate filtering failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to filter candidates",
        )


# ---------------------------------------------------------
# Update candidate status
# ---------------------------------------------------------
@router.patch("/candidate/{name}/status")
async def update_candidate_status(
    name: str,
    status: str = Body(...),
    user: str = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Update candidate hiring status.
    """

    try:

        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Candidate name required")

        name = name.strip()

        allowed_status = ["pending", "shortlisted", "rejected", "hired"]

        if status not in allowed_status:

            raise HTTPException(
                status_code=400,
                detail=f"Status must be one of {allowed_status}",
            )

        result = candidates_collection.update_one(
            {"name": name},
            {"$set": {"status": status}},
        )

        if result.matched_count == 0:

            raise HTTPException(status_code=404, detail="Candidate not found")

        logger.info(f"Candidate {name} status updated to {status}")

        return {
            "status": "success",
            "message": f"Candidate status updated to {status}",
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Failed updating candidate status: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to update candidate status",
        )


# ---------------------------------------------------------
# Delete candidate
# ---------------------------------------------------------
@router.delete("/candidate/{name}")
async def delete_candidate(
    name: str,
    user: str = Depends(get_current_hr_user),
) -> Dict[str, Any]:
    """
    Delete candidate from database.
    """

    try:

        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Candidate name required")

        name = name.strip()

        result = candidates_collection.delete_one({"name": name})

        if result.deleted_count == 0:

            raise HTTPException(status_code=404, detail="Candidate not found")

        logger.info(f"Candidate deleted: {name}")

        return {
            "status": "success",
            "message": f"Candidate {name} deleted successfully",
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Failed deleting candidate: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to delete candidate",
        )


# ---------------------------------------------------------
# Research service health check
# ---------------------------------------------------------
@router.get("/health")
async def research_health():
    """
    Health check endpoint for research service
    """

    return {"status": "ok", "service": "research-agent"}
