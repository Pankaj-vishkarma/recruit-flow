import logging
from typing import Dict, Any, List

from app.tools.memory_tool import save_candidate_data
from app.services.interview_service import detect_skills

logger = logging.getLogger(__name__)


def screener_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Screener Agent

    Responsibilities:
    - Extract candidate skills from message
    - Store skills in state
    - Persist candidate data in MongoDB
    - Move workflow to technical interview step
    """

    try:
        # Safe message extraction
        messages: List[str] = state.get("messages", [])

        if not messages:
            logger.warning("No messages found in state.")
            return state

        message = messages[-1]

        # Candidate name
        name = state.get("candidate_name", "candidate")

        # Ensure candidate_data exists
        if "candidate_data" not in state:
            state["candidate_data"] = {}

        # Detect skills using NLP service
        skills = detect_skills(message)

        # Remove duplicates and normalize
        if skills:
            skills = list(set([skill.lower() for skill in skills]))
        else:
            skills = []

        # Update state
        state["candidate_data"]["skills"] = skills

        # Save to database
        save_candidate_data(
            name, {"name": name, "skills": skills, "status": "technical_interview"}
        )

        # Move workflow forward
        state["current_step"] = "tech"

        logger.info(f"Screener Agent processed candidate: {name} | Skills: {skills}")

        return state

    except Exception as e:
        logger.exception(f"Screener agent failed: {e}")

        # Fail-safe fallback
        state["current_step"] = "tech"

        return state
