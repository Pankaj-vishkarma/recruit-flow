import asyncio
from typing import Dict, Any, List

from fastapi import APIRouter, HTTPException, Request, Depends

from slowapi.util import get_remote_address
from slowapi import Limiter

from app.graph.langgraph_builder import build_graph
from app.tools.memory_tool import (
    append_chat_message,
    get_chat_history,
)

from app.models.chat_model import ChatRequest, ChatResponse

from app.utils.logger import get_logger
from app.utils.auth_dependency import get_current_candidate_user

from app.services.interview_service import detect_skills

router = APIRouter()

logger = get_logger()

# --------------------------------------------------
# Rate limiter setup
# --------------------------------------------------
limiter = Limiter(key_func=get_remote_address)

# --------------------------------------------------
# Build LangGraph once at startup
# --------------------------------------------------
graph = build_graph()


# --------------------------------------------------
# Response Formatter
# --------------------------------------------------
def format_response(state: Dict[str, Any]) -> str:
    """
    Convert agent state into human friendly chat message.
    """

    try:

        candidate_data = state.get("candidate_data", {}) or {}
        skills = candidate_data.get("skills", []) or []

        scheduled = state.get("scheduled_time")
        onboarding = state.get("onboarding_complete")

        messages = state.get("messages", []) or []

        # -----------------------------
        # Skills detected
        # -----------------------------
        if skills:

            skills_text = ", ".join(skills)

            return (
                f"✅ Skills detected: {skills_text}.\n\n"
                f"Next step: Technical Interview."
            )

        # -----------------------------
        # Interview question
        # -----------------------------
        if messages:

            last_msg = messages[-1]

            if isinstance(last_msg, dict):

                content = str(last_msg.get("content", ""))

            else:

                content = str(last_msg)

            if "?" in content:

                return content

        # -----------------------------
        # Interview scheduled
        # -----------------------------
        if scheduled:

            return f"📅 Interview scheduled for {scheduled}."

        # -----------------------------
        # Onboarding completed
        # -----------------------------
        if onboarding:

            return "🎉 Congratulations! Your onboarding has been completed."

        return "Processing your request..."

    except Exception as e:

        logger.exception(f"Response formatting failed: {e}")

        return "Something went wrong while processing the request."


# --------------------------------------------------
# Chat Endpoint (Candidate Only)
# --------------------------------------------------
@router.post("/chat/", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(
    request: Request,
    payload: ChatRequest,
    user: dict = Depends(get_current_candidate_user),
) -> Dict[str, Any]:
    """
    Chat endpoint

    Accepts user message and triggers the LangGraph workflow.
    """

    try:

        message = payload.message

        # --------------------------------------------------
        # Candidate identity from JWT
        # --------------------------------------------------
        candidate_name = user["email"]

        # -----------------------------
        # Validate request
        # -----------------------------
        if not message or not str(message).strip():

            raise HTTPException(status_code=400, detail="Message is required")

        message = str(message).strip()

        # --------------------------------
        # Detect candidate skills from message
        # --------------------------------
        detected_skills = detect_skills(message)

        candidate_data = {}

        if detected_skills:
            candidate_data["skills"] = detected_skills

        logger.info(f"Received message from candidate: {candidate_name}")

        # --------------------------------------------------
        # Retrieve chat history (memory recall)
        # --------------------------------------------------
        history = get_chat_history(candidate_name)

        messages: List[Dict[str, Any]] = []

        for msg in (history or [])[-10:]:

            messages.append(
                {
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                }
            )

        # Append latest user message
        messages.append(
            {
                "role": "user",
                "content": message,
            }
        )

        # Save message to memory
        try:

            append_chat_message(candidate_name, "user", message)

        except Exception as mem_error:

            logger.warning(f"Failed storing user message: {mem_error}")

        # -----------------------------
        # Initialize workflow state
        # -----------------------------
        state: Dict[str, Any] = {
            "messages": messages,
            "candidate_name": candidate_name,
            "candidate_data": candidate_data,
            "current_step": "research",
        }

        # -----------------------------
        # Execute LangGraph pipeline
        # -----------------------------
        try:

            result = await asyncio.wait_for(graph.ainvoke(state), timeout=60)

        except Exception as graph_error:

            logger.exception(f"LangGraph execution failed: {graph_error}")

            raise HTTPException(
                status_code=500,
                detail="AI workflow execution failed",
            )

        logger.info(f"LangGraph workflow completed for {candidate_name}")

        # -----------------------------
        # Format response
        # -----------------------------
        reply = format_response(result)

        # Save assistant reply to memory
        try:

            append_chat_message(candidate_name, "assistant", reply.strip())

        except Exception as mem_error:

            logger.warning(f"Failed storing assistant message: {mem_error}")

        return ChatResponse(
            status="success",
            reply=reply,
            data=result,
        )

    except HTTPException as http_error:

        raise http_error

    except Exception as e:

        logger.exception(f"Chat endpoint failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Internal server error during chat processing",
        )
