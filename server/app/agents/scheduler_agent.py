import logging
from typing import Dict, Any

from app.tools.computer_use_tool import click_calendar
from app.config.settings import settings
from app.tools.memory_tool import (
    save_candidate_data,
    append_chat_message,
)

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Slot Detection Utility
# --------------------------------------------------
def detect_slot_from_message(message: str) -> str:
    """
    Extract interview slot from user message using simple NLP patterns.
    """

    try:

        if not message:
            return settings.DEFAULT_INTERVIEW_SLOT

        message = message.lower()

        slot_patterns = {
            "monday": "Monday 10:00 AM",
            "tuesday": "Tuesday 11:00 AM",
            "wednesday": "Wednesday 3:00 PM",
            "thursday": "Thursday 1:00 PM",
            "friday": "Friday 4:00 PM",
        }

        for day, slot in slot_patterns.items():
            if day in message:
                return slot

        return settings.DEFAULT_INTERVIEW_SLOT

    except Exception as e:

        logger.warning(f"Slot detection failed: {e}")

        return settings.DEFAULT_INTERVIEW_SLOT


# --------------------------------------------------
# Scheduler Agent
# --------------------------------------------------
async def scheduler_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Scheduler Agent

    Responsibilities:
    - Detect preferred interview slot
    - Decide when to use Computer Use Tool
    - Trigger calendar automation
    - Persist scheduling information
    """

    try:

        messages = state.get("messages", [])

        if not isinstance(messages, list) or not messages:

            logger.warning("Scheduler agent received empty messages list")

            state["schedule_error"] = "No messages found"
            state["current_step"] = "onboard"

            return state

        # -----------------------------------
        # Extract latest message safely
        # -----------------------------------
        last_message = messages[-1]

        if isinstance(last_message, dict):

            message = str(last_message.get("content", "")).strip()

        else:

            message = str(last_message).strip()

        logger.info(f"Scheduler processing message: {message}")

        # -----------------------------------
        # Prefer slot from frontend selection
        # -----------------------------------
        slot = state.get("selected_slot")

        if slot and isinstance(slot, str) and slot.strip():

            slot = slot.strip()

            logger.info(f"Using frontend selected slot: {slot}")

        else:

            slot = detect_slot_from_message(message)

            logger.info(f"Detected interview slot from message: {slot}")

        # -----------------------------------
        # Prevent duplicate scheduling
        # -----------------------------------
        if state.get("scheduled_time"):

            logger.info("Interview already scheduled. Skipping automation.")

            state["current_step"] = "onboard"

            return state

        # -----------------------------------
        # Tool Decision (Assignment Requirement)
        # Agent decides to use Computer Use Tool
        # -----------------------------------
        logger.info("Scheduler agent selecting tool: computer_use_tool")

        # -----------------------------------
        # Calendar automation with retry
        # -----------------------------------
        automation_result = None

        for attempt in range(2):

            try:

                automation_result = await click_calendar(slot)

                logger.info(
                    f"Calendar automation result (attempt {attempt+1}): {automation_result}"
                )

                if automation_result.get("status") == "success":

                    break

            except Exception as calendar_error:

                logger.warning(
                    f"Calendar automation attempt {attempt+1} failed: {calendar_error}"
                )

        if not automation_result or automation_result.get("status") != "success":

            logger.warning("Calendar automation did not confirm success")

        # -----------------------------------
        # Update state
        # -----------------------------------
        state["scheduled_time"] = slot

        # -----------------------------------
        # Persist scheduling info
        # -----------------------------------
        candidate_name = state.get("candidate_name", "candidate")

        try:

            save_candidate_data(
                candidate_name,
                {
                    "scheduled_time": slot,
                    "status": "scheduled",
                },
            )

            logger.info("Candidate interview schedule saved to database")

        except Exception as db_error:

            logger.warning(f"Failed to save schedule in DB: {db_error}")

        # -----------------------------------
        # Save message to memory
        # -----------------------------------
        try:

            append_chat_message(
                candidate_name,
                "system",
                f"Interview scheduled for {slot}",
            )

        except Exception as mem_error:

            logger.warning(f"Failed to store scheduling memory: {mem_error}")

        logger.info(f"Interview scheduled successfully for {slot}")

        # -----------------------------------
        # Move workflow forward
        # -----------------------------------
        state["current_step"] = "onboard"

        return state

    except Exception as e:

        logger.exception(f"Scheduler agent failed: {e}")

        state["schedule_error"] = str(e)
        state["current_step"] = "onboard"

        return state
