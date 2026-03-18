from fastapi import APIRouter, HTTPException, Depends, status
from google.oauth2 import id_token
from google.auth.transport import requests
import os

from app.models.user_model import UserRegister, UserLogin
from app.services.auth_service import create_user, get_user, verify_password

from app.utils.jwt_handler import create_access_token
from app.utils.auth_dependency import get_current_user
from app.utils.logger import get_logger

# ✅ NEW IMPORT
from app.config.database import candidates_collection
from datetime import datetime


router = APIRouter(prefix="/auth", tags=["Auth"])

logger = get_logger()


# --------------------------------
# Register
# --------------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):

    try:
        role = data.role if data.role else "candidate"

        if role not in ["candidate", "hr"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role",
            )

        user = create_user(
            name=data.name.strip(),
            email=data.email.lower(),
            password=data.password,
            role=role,
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        logger.info(f"New user registered: {data.email}")

        return {
            "status": "success",
            "message": "User registered successfully",
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        logger.exception(f"Register failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed",
        )


# --------------------------------
# Login
# --------------------------------
@router.post("/login")
async def login(data: UserLogin):

    try:
        email = data.email.lower()

        user = get_user(email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        token = create_access_token(
            {
                "email": user["email"],
                "role": user["role"],
            }
        )

        logger.info(f"User login successful: {user['email']}")

        return {
            "status": "success",
            "token": token,
            "user": {
                "email": user["email"],
                "role": user["role"],
            },
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        logger.exception(f"Login failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed",
        )


# --------------------------------
# Get Current User
# --------------------------------
@router.get("/me")
async def get_me(user=Depends(get_current_user)):

    try:
        return {
            "status": "success",
            "data": {
                "email": user["email"],
                "role": user["role"],
            },
        }

    except Exception as e:
        logger.exception(f"/auth/me failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user info",
        )


# --------------------------------
# Google Login (FINAL FIXED)
# --------------------------------
@router.post("/google")
async def google_login(data: dict):

    try:
        token = data.get("token")

        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token required",
            )

        google_client_id = os.getenv("GOOGLE_CLIENT_ID")

        if not google_client_id:
            raise HTTPException(
                status_code=500,
                detail="Google OAuth not configured",
            )

        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), google_client_id
        )

        if not idinfo.get("email_verified"):
            raise HTTPException(
                status_code=400,
                detail="Google email not verified",
            )

        # ✅ Normalize
        email = idinfo.get("email").lower()
        name = idinfo.get("name") or email

        # --------------------------------
        # Check user
        # --------------------------------
        user = get_user(email)

        # --------------------------------
        # Create user if not exists
        # --------------------------------
        if not user:

            user = create_user(
                name=name,
                email=email,
                password=os.urandom(16).hex(),
                role="candidate",
            )

            if not user:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create user via Google login",
                )

        # --------------------------------
        # ✅ CREATE CANDIDATE (SAFE)
        # --------------------------------
        existing_candidate = candidates_collection.find_one({"email": email})

        if not existing_candidate:
            candidates_collection.insert_one(
                {
                    "email": email,
                    "name": name,
                    "role": "candidate",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
            )

        # --------------------------------
        # JWT
        # --------------------------------
        token = create_access_token(
            {
                "email": email,
                "role": user["role"],
            }
        )

        logger.info(f"Google login successful: {email}")

        return {
            "status": "success",
            "token": token,
            "user": {
                "email": email,
                "role": user["role"],
            },
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        logger.exception(f"Google login failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google login failed",
        )
