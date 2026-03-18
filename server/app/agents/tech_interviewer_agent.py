import logging
from typing import Dict, Any

from app.services.interview_service import generate_followup_question

logger = logging.getLogger(__name__)


def tech_interviewer(state: Dict[str, Any]) -> Dict[str, Any]:
    try:

        messages = state.get("messages", [])
        candidate_data = state.get("candidate_data", {})
        skills = candidate_data.get("skills", [])

        last_message = messages[-1]["content"].lower()
        asked_questions = state.get("interview_questions", [])

        question = ""

        # --------------------------------
        # 🔥 FIX 1: Handle short answers
        # --------------------------------
        if last_message in ["yes", "yeah", "ok", "okay"]:
            question = "Can you explain your previous answer in more detail?"

        # --------------------------------
        # 🔥 FIX 2: Explicit skill request
        # --------------------------------
        elif "javascript" in last_message:
            question = "Explain closures in JavaScript and give a real-world example."

        elif "react" in last_message:
            question = "Explain React hooks and their use cases."

        elif "python" in last_message:
            question = "Can you explain Python decorators?"

        # --------------------------------
        # 🔥 FIX 3: Start interview intent
        # --------------------------------
        elif "start" in last_message and "interview" in last_message:

            if "javascript" in skills:
                question = (
                    "What is the difference between var, let, and const in JavaScript?"
                )

            elif "python" in skills:
                question = "Explain Python decorators."

            elif "react" in skills:
                question = "What are React hooks and why are they used?"

            else:
                question = (
                    "Which technology would you like to start your interview with?"
                )

        # --------------------------------
        # 🔥 FIX 4: Smart follow-up from skills
        # --------------------------------
        elif skills:
            question = generate_followup_question(skills)

        # --------------------------------
        # 🔥 FIX 5: Default fallback
        # --------------------------------
        else:
            question = "Which technologies are you most comfortable with?"

        # --------------------------------
        # 🔥 FIX 6: Prevent repetition
        # --------------------------------
        if question in asked_questions:
            question = "Can you describe a real-world project where you used these technologies?"

        # --------------------------------
        # 🔥 FIX 7: Track questions properly
        # --------------------------------
        updated_questions = asked_questions + [question]

        return {
            **state,
            "messages": [
                {
                    "role": "assistant",
                    "content": question,
                }
            ],
            "interview_questions": updated_questions,
            "current_step": "tech",
        }

    except Exception as e:

        logger.exception(f"Tech interviewer agent failed: {e}")

        return {
            **state,
            "messages": [
                {
                    "role": "assistant",
                    "content": "Tell me about your technical experience.",
                }
            ],
        }
