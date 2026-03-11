from fastapi import APIRouter, HTTPException
from app.models.user_model import UserLogin, TokenResponse
from app.services.auth_service import verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# Temporary HR credentials
HR_USER = {"email": "hr@company.com", "password": "admin123"}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):

    if data.email != HR_USER["email"]:

        raise HTTPException(status_code=401, detail="Invalid credentials")

    if data.password != HR_USER["password"]:

        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": data.email})

    return TokenResponse(access_token=token)
