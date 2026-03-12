from fastapi import APIRouter, HTTPException, Depends, status

from app.models.user_model import UserRegister, UserLogin
from app.services.auth_service import create_user, get_user, verify_password

from app.utils.jwt_handler import create_access_token
from app.utils.auth_dependency import get_current_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/auth", tags=["Auth"])

logger = get_logger()


# --------------------------------
# Register (Candidate / HR)
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
