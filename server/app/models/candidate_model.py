from pydantic import BaseModel
from typing import List, Optional


class Candidate(BaseModel):
    name: str
    email: Optional[str] = None
    skills: List[str] = []
    status: str = "screening"