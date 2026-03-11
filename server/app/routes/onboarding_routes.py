from fastapi import APIRouter, Depends

from app.utils.auth_dependency import get_current_hr_user

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("/")
def onboarding(user: str = Depends(get_current_hr_user)):
    return {"message": "Onboarding agent endpoint"}
