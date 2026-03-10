from fastapi import APIRouter

router = APIRouter(prefix="/schedule", tags=["Scheduler"])


@router.get("/")
def schedule():
    return {"message": "Scheduler agent endpoint"}