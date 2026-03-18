import asyncio
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Request, Depends

from slowapi.util import get_remote_address
from slowapi import Limiter

from app.graph.langgraph_builder import build_graph
from app.tools.memory_tool import append_chat_message, get_chat_history

from app.models.chat_model import ChatRequest, ChatResponse

from app.utils.logger import get_logger
from app.utils.auth_dependency import get_current_candidate_user

from app.services.interview_service import detect_skills


router = APIRouter()
logger = get_logger()

limiter = Limiter(key_func=get_remote_address)

graph = build_graph()


# --------------------------------------------------
# Response Formatter
# --------------------------------------------------


def format_response(state: Dict[str, Any]) -> str:
    try:
        messages = state.get("messages", []) or []

        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "assistant":
                content = str(msg.get("content", "")).strip()
                if content:
                    return content

        if state.get("scheduled_time"):
            return f"📅 Interview scheduled for {state['scheduled_time']}."

        if state.get("onboarding_complete"):
            return "🎉 Congratulations! Your onboarding has been completed."

        return "No response from AI"

    except Exception as e:
        logger.exception(f"Response formatting failed: {e}")
        return "Something went wrong"


# --------------------------------------------------
# Chat Endpoint
# --------------------------------------------------


@router.post("/chat/", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(
    request: Request,
    payload: ChatRequest,
    user: dict = Depends(get_current_candidate_user),
) -> Dict[str, Any]:

    try:

        message = str(payload.message).strip()
        candidate_name = user["email"]

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        logger.info(f"Chat message received from {candidate_name}")

        # --------------------------------------------------
        # 🔥 SKILLS DETECTION
        # --------------------------------------------------

        detected_skills = detect_skills(message)

        existing_skills = []
        try:
            history = get_chat_history(candidate_name)

            for msg in history or []:
                content = str(msg.get("content", "")).lower()
                existing_skills.extend(detect_skills(content))

        except Exception:
            pass

        candidate_data = {"skills": list(set(existing_skills + detected_skills))}

        # --------------------------------------------------
        # 🔥 ONLY CURRENT MESSAGE (IMPORTANT FIX)
        # --------------------------------------------------

        messages = [
            {
                "role": "user",
                "content": message,
            }
        ]

        # --------------------------------------------------
        # 🔥 SAVE USER MESSAGE
        # --------------------------------------------------

        try:
            append_chat_message(candidate_name, "user", message)
        except Exception:
            pass

        # --------------------------------------------------
        # 🔥 CLEAN STATE (NO HISTORY INFERENCE)
        # --------------------------------------------------

        state: Dict[str, Any] = {
            "messages": messages,
            "candidate_name": candidate_name,
            "candidate_data": candidate_data,
            "current_step": "screen",  # always start clean
            "scheduled_time": None,
            "onboarding_complete": False,
        }

        # --------------------------------------------------
        # 🔥 EXECUTE GRAPH
        # --------------------------------------------------

        try:
            result = await asyncio.wait_for(graph.ainvoke(state), timeout=30)

        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="AI timeout")

        except Exception as e:
            logger.exception(f"Graph error: {e}")
            raise HTTPException(status_code=500, detail="AI failed")

        final_state = result if isinstance(result, dict) else {}

        # --------------------------------------------------
        # 🔥 REMOVE DUPLICATES (SAFETY FIX)
        # --------------------------------------------------

        unique_messages = []
        seen = set()

        for msg in final_state.get("messages", []):
            key = (msg.get("role"), msg.get("content"))
            if key not in seen:
                seen.add(key)
                unique_messages.append(msg)

        final_state["messages"] = unique_messages

        logger.info(f"FINAL STATE: {final_state}")

        # --------------------------------------------------
        # 🔥 RESPONSE
        # --------------------------------------------------

        reply = format_response(final_state)

        if not reply:
            reply = "Tell me about your skills or ask to schedule an interview."

        try:
            append_chat_message(candidate_name, "assistant", reply)
        except Exception:
            pass

        return ChatResponse(status="success", reply=reply)

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
