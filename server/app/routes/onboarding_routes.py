from fastapi import APIRouter, Depends
from app.utils.auth_dependency import get_current_hr_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

logger = get_logger()


@router.get("/")
def onboarding(user: dict = Depends(get_current_hr_user)):
    """
    Onboarding endpoint.

    Accessible only by HR users.
    """

    logger.info(f"Onboarding endpoint accessed by {user['email']}")

    return {
        "status": "success",
        "message": "Onboarding agent endpoint",
    }
