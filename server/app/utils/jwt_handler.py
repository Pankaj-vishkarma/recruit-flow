from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError


# --------------------------------
# JWT Config
# --------------------------------
SECRET_KEY = "recruit-flow-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# --------------------------------
# Create Access Token
# --------------------------------
def create_access_token(data: dict):
    """
    Generate JWT token
    """

    to_encode = data.copy()

    # expiration time
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # ensure email stored in sub (JWT standard)
    if "email" in to_encode:
        to_encode["sub"] = to_encode["email"]

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


# --------------------------------
# Verify Token
# --------------------------------
def verify_token(token: str):
    """
    Decode and verify JWT token
    """

    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return payload

    except JWTError:

        return None
