from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


class Candidate(BaseModel):
    """
    Candidate data model used across the Recruit-Flow system.
    """

    name: str = Field(..., min_length=2, description="Candidate full name")

    email: Optional[EmailStr] = Field(
        default=None, description="Candidate email address"
    )

    skills: List[str] = Field(
        default_factory=list, description="List of candidate technical skills"
    )

    experience: Optional[str] = Field(
        default=None, description="Candidate experience (e.g., '3 years', '5 years')"
    )

    status: str = Field(default="screening", description="Candidate hiring stage")

    interview_score: Optional[int] = Field(
        default=None, description="Technical interview score"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Record creation timestamp"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Record update timestamp"
    )

    class Config:
        schema_extra = {
            "example": {
                "name": "Pankaj Vishwakarma",
                "email": "pankaj@example.com",
                "skills": ["Python", "React", "Node.js"],
                "experience": "3 years",
                "status": "screening",
                "interview_score": None,
            }
        }
