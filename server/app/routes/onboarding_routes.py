from fastapi import APIRouter

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("/")
def onboarding():
    return {"message": "Onboarding agent endpoint"}