from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# --------------------------------
# Register Request Model
# --------------------------------
class UserRegister(BaseModel):

    name: str
    email: EmailStr
    password: str

    # role decides system flow
    # candidate → AI interview flow
    # hr → dashboard access
    role: str = "candidate"


# --------------------------------
# Login Request Model
# --------------------------------
class UserLogin(BaseModel):

    email: EmailStr
    password: str


# --------------------------------
# User Model (Internal usage)
# --------------------------------
class User(BaseModel):

    name: str
    email: EmailStr
    hashed_password: str
    role: str


# --------------------------------
# User DB Model
# --------------------------------
class UserInDB(BaseModel):

    id: Optional[str] = None

    name: str
    email: EmailStr
    hashed_password: str

    role: str = "candidate"

    # ------------------------------
    # Candidate Profile Fields
    # ------------------------------

    skills: Optional[List[str]] = Field(default_factory=list)

    experience: Optional[str] = None

    resume_url: Optional[str] = None

    # recruitment pipeline stage
    status: str = "applied"

    # interview scheduling
    interview_date: Optional[str] = None

    # AI evaluation score
    ai_score: Optional[float] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)


# --------------------------------
# Token Response
# --------------------------------
class TokenResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"
