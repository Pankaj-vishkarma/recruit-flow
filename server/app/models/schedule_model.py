from pydantic import BaseModel, Field
from typing import Optional


class ScheduleRequest(BaseModel):

    slot: str = Field(..., min_length=3)
    candidate_name: Optional[str] = Field(default="candidate")


class ScheduleResponse(BaseModel):

    status: str
    message: str
