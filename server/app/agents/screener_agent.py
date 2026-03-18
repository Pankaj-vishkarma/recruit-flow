import logging
from typing import Dict, Any, List

from app.tools.memory_tool import save_candidate_data
from app.services.interview_service import detect_skills

logger = logging.getLogger(__name__)


def screener_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Screener Agent
    """

    try:
        # -----------------------------
        # Safe message extraction
        # -----------------------------
        messages: List[Dict[str, Any]] = state.get("messages", [])

        if not messages:
            logger.warning("No messages found in state.")
            return state

        last_msg = messages[-1]

        # 🔥 FIX: extract correct text
        if isinstance(last_msg, dict):
            message = str(last_msg.get("content", "")).strip()
        else:
            message = str(last_msg).strip()

        if not message:
            logger.warning("Empty message received in screener.")
            return state

        # Candidate name
        name = state.get("candidate_name", "candidate")

        # Ensure candidate_data exists
        if "candidate_data" not in state:
            state["candidate_data"] = {}

        # -----------------------------
        # Detect skills
        # -----------------------------
        skills = detect_skills(message)

        if skills:
            skills = list(set([skill.lower() for skill in skills]))
        else:
            skills = []

        # Update state
        state["candidate_data"]["skills"] = skills

        # Save to DB
        save_candidate_data(
            name, {"name": name, "skills": skills, "status": "technical_interview"}
        )

        # Move workflow forward
        state["current_step"] = "screen"

        logger.info(f"Screener processed: {name} | Skills: {skills}")

        # --------------------------------------------------
        # 🔥 CRITICAL FIX: Add AI response (IMMUTABLE)
        # --------------------------------------------------

        if skills:
            response_text = f"Great! I detected your skills: {', '.join(skills)}.\nLet's proceed to the technical interview."
        else:
            response_text = "I couldn't detect specific skills. Could you tell me your technical skills?"

        state["messages"] = messages + [{"role": "assistant", "content": response_text}]

        return state

    except Exception as e:
        logger.exception(f"Screener agent failed: {e}")

        # fallback response
        messages = state.get("messages", [])

        state["messages"] = messages + [
            {
                "role": "assistant",
                "content": "Something went wrong while screening your profile.",
            }
        ]

        state["current_step"] = "tech"

        return state
