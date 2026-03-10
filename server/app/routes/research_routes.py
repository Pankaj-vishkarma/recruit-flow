from fastapi import APIRouter

router = APIRouter(prefix="/research", tags=["Research"])


@router.get("/")
def research():
    return {"message": "Research agent endpoint"}