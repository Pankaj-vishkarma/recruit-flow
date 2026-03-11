from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ChatRequest(BaseModel):
    """
    Request model for chat endpoint
    """

    message: str = Field(..., min_length=1, max_length=2000)
    candidate_name: Optional[str] = Field(default="candidate", max_length=100)


class ChatResponse(BaseModel):
    """
    Response model for chat endpoint
    """

    status: str
    reply: str
    data: Optional[Dict[str, Any]] = None
