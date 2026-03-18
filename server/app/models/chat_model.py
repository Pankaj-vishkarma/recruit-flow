from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class ChatRequest(BaseModel):
    """
    Request model for chat endpoint
    """

    message: str = Field(..., min_length=1, max_length=2000)
    candidate_name: Optional[str] = Field(default="candidate", max_length=100)

    # 🔥 NEW FIELD (CRITICAL FIX)
    history: Optional[List[Dict[str, Any]]] = []


class ChatResponse(BaseModel):
    """
    Response model for chat endpoint
    """

    status: str
    reply: str
    data: Optional[Dict[str, Any]] = None
