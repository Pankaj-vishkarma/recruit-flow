from pydantic import BaseModel, EmailStr
from typing import Optional


class UserLogin(BaseModel):

    email: EmailStr
    password: str


class User(BaseModel):

    email: EmailStr
    hashed_password: str
    role: str = "hr"


class TokenResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"
