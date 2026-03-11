import logging
from typing import Dict, Any, List

from app.services.interview_service import generate_followup_question

logger = logging.getLogger(__name__)


def tech_interviewer(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Technical Interview Agent

    Responsibilities:
    - Generate technical interview questions based on candidate skills
    - Append question to conversation messages
    - Maintain workflow state for next steps
    """

    try:
        # Ensure state structure exists
        if "candidate_data" not in state:
            state["candidate_data"] = {}

        if "messages" not in state:
            state["messages"] = []

        skills: List[str] = state["candidate_data"].get("skills", [])

        # Generate technical question
        question = generate_followup_question(skills)

        # Fallback question if generation fails
        if not question:
            question = (
                "Can you describe a challenging technical problem you solved recently?"
            )

        # Log question
        logger.info(f"Generated tech interview question based on skills {skills}")

        # Append to conversation history
        state["messages"].append(question)

        # Track interview progress
        state["current_step"] = "tech_interview"

        return state

    except Exception as e:
        logger.exception(f"Tech interviewer agent failed: {e}")

        # Fail-safe fallback
        fallback_question = (
            "Can you explain your experience with your primary programming language?"
        )

        if "messages" not in state:
            state["messages"] = []

        state["messages"].append(fallback_question)
        state["current_step"] = "tech_interview"

        return state
