from typing import TypedDict, List, Dict, Optional, Any
from datetime import datetime


class AgentState(TypedDict, total=False):
    """
    Shared state used across all agents in the Recruit-Flow system.

    This state is passed between LangGraph nodes and allows
    agents to communicate with each other during the workflow.

    Workflow:
    Research → Screening → Technical Interview → Scheduling → Onboarding
    """

    # --------------------------------------------------
    # Conversation history
    # --------------------------------------------------
    messages: List[Dict[str, Any]]
    """
    Example:
    [
        {"role": "user", "content": "Hi I am a React developer"},
        {"role": "assistant", "content": "Tell me about your experience"}
    ]
    """

    # --------------------------------------------------
    # Candidate identity
    # --------------------------------------------------
    candidate_name: str

    candidate_email: Optional[str]

    # --------------------------------------------------
    # Current workflow stage
    # --------------------------------------------------
    current_step: str
    """
    Possible values:
    research
    screening
    technical
    scheduling
    onboarding
    completed
    """

    # --------------------------------------------------
    # Candidate profile data
    # --------------------------------------------------
    candidate_data: Dict[str, Any]
    """
    Example:
    {
        "skills": ["Python", "Django"],
        "experience": "3 years",
        "education": "B.Tech"
    }
    """

    # --------------------------------------------------
    # Detected skills
    # --------------------------------------------------
    skills: List[str]

    # --------------------------------------------------
    # Technical interview questions asked
    # --------------------------------------------------
    interview_questions: List[str]

    # --------------------------------------------------
    # Technical interview answers
    # --------------------------------------------------
    interview_answers: List[str]

    # --------------------------------------------------
    # Calculated interview score
    # --------------------------------------------------
    interview_score: Optional[int]

    # --------------------------------------------------
    # Interview scheduling
    # --------------------------------------------------
    scheduled_time: Optional[str]

    # --------------------------------------------------
    # Onboarding status
    # --------------------------------------------------
    onboarding_complete: Optional[bool]

    # --------------------------------------------------
    # System metadata
    # --------------------------------------------------
    created_at: Optional[str]

    updated_at: Optional[str]

    # --------------------------------------------------
    # Agent logs (useful for debugging & monitoring)
    # --------------------------------------------------
    agent_logs: List[str]

    # --------------------------------------------------
    # Error tracking
    # --------------------------------------------------
    errors: List[str]
