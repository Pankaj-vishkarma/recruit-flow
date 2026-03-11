import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Request, Depends

from slowapi.util import get_remote_address
from slowapi import Limiter

from app.agents.scheduler_agent import scheduler_agent
from app.utils.auth_dependency import get_current_hr_user

router = APIRouter(prefix="/schedule", tags=["Schedule"])

from app.utils.logger import get_logger

logger = get_logger()

# --------------------------------------------------
# Rate limiter setup
# --------------------------------------------------
limiter = Limiter(key_func=get_remote_address)


@router.post("/")
@limiter.limit("5/minute")
async def schedule_interview(
    request: Request, data: Dict[str, Any], user: str = Depends(get_current_hr_user)
) -> Dict[str, Any]:
    """
    Schedule interview endpoint.

    Called by frontend calendar UI.
    """

    try:

        slot = data.get("slot")
        candidate_name = data.get("candidate_name", "candidate")

        if not slot or not isinstance(slot, str) or not slot.strip():
            raise HTTPException(status_code=400, detail="Slot is required")

        slot = slot.strip()

        logger.info(f"Scheduling interview for {candidate_name} at {slot}")

        # ------------------------------------
        # Build workflow state
        # ------------------------------------
        state = {
            "messages": [f"Schedule interview at {slot}"],
            "candidate_name": candidate_name,
            "candidate_data": {},
            "current_step": "schedule",
            "selected_slot": slot,  # IMPORTANT: pass frontend slot
        }

        # ------------------------------------
        # Run scheduler agent
        # ------------------------------------
        result = await scheduler_agent(state)

        logger.info("Interview scheduling completed")

        return {
            "status": "success",
            "scheduled_slot": slot,
            "data": result,
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Schedule endpoint failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to schedule interview",
        )
