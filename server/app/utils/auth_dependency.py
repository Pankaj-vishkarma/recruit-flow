from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.jwt_handler import verify_token

security = HTTPBearer()


def get_current_hr_user(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials

    try:

        payload = verify_token(token)

        email = payload.get("sub")

        if not email:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token",
            )

        return email

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )
