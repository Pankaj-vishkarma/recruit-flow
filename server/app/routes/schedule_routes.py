import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Request, Depends

from slowapi.util import get_remote_address
from slowapi import Limiter

from app.agents.scheduler_agent import scheduler_agent
from app.utils.auth_dependency import get_current_candidate_user
from app.config.database import candidates_collection

from app.utils.logger import get_logger

from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/schedule", tags=["Schedule"])

logger = get_logger()

limiter = Limiter(key_func=get_remote_address)


# --------------------------------------------------
# Helper: Mongo serialization
# --------------------------------------------------
def serialize_mongo(obj):
    if isinstance(obj, list):
        return [serialize_mongo(i) for i in obj]

    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if isinstance(v, ObjectId):
                new_obj[k] = str(v)
            else:
                new_obj[k] = serialize_mongo(v)
        return new_obj

    return obj


# --------------------------------------------------
# Schedule Interview Endpoint
# --------------------------------------------------
@router.post("/")
@limiter.limit("5/minute")
async def schedule_interview(
    request: Request,
    data: Dict[str, Any],
    user: dict = Depends(get_current_candidate_user),
) -> Dict[str, Any]:

    try:
        # -----------------------------
        # Validate input
        # -----------------------------
        slot = data.get("slot")

        if not slot or not isinstance(slot, str) or not slot.strip():
            raise HTTPException(status_code=400, detail="Slot is required")

        slot = slot.strip()

        # -----------------------------
        # Get user email from token
        # -----------------------------
        candidate_email = user.get("email")

        if not candidate_email:
            raise HTTPException(
                status_code=401,
                detail="Invalid user token (email missing)",
            )

        logger.info(f"Scheduling interview for {candidate_email} at {slot}")

        # -----------------------------
        # ✅ AUTO CREATE CANDIDATE (FIX)
        # -----------------------------
        existing_candidate = candidates_collection.find_one({"email": candidate_email})

        if not existing_candidate:
            logger.info(f"Creating new candidate for {candidate_email}")

            new_candidate = {
                "email": candidate_email,
                "name": candidate_email.split("@")[0],
                "role": "candidate",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            candidates_collection.insert_one(new_candidate)

            existing_candidate = candidates_collection.find_one(
                {"email": candidate_email}
            )

        # -----------------------------
        # Build workflow state
        # -----------------------------
        state = {
            "messages": [f"Schedule interview at {slot}"],
            "candidate_name": candidate_email,
            "candidate_data": existing_candidate,
            "current_step": "schedule",
            "selected_slot": slot,
        }

        # -----------------------------
        # Run scheduler agent
        # -----------------------------
        try:
            result = await scheduler_agent(state)
        except Exception as agent_error:
            logger.exception(f"Scheduler agent failed: {agent_error}")
            raise HTTPException(
                status_code=500,
                detail="Failed to process scheduling logic",
            )

        # -----------------------------
        # Update DB safely
        # -----------------------------
        candidates_collection.update_one(
            {"email": candidate_email},
            {
                "$set": {
                    "scheduled_time": slot,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        logger.info("Interview scheduling completed successfully")

        # -----------------------------
        # Serialize Mongo result
        # -----------------------------
        safe_result = serialize_mongo(result)

        # -----------------------------
        # Final Response
        # -----------------------------
        return {
            "success": True,
            "message": "Interview scheduled successfully",
            "scheduled_slot": slot,
            "data": safe_result,
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        logger.exception(f"Schedule endpoint failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to schedule interview",
        )
