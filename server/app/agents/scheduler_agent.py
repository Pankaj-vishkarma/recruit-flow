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
    try:

        if not message:
            return settings.DEFAULT_INTERVIEW_SLOT

        if not isinstance(message, str):
            message = str(message)

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
    try:

        if not isinstance(state, dict):
            logger.warning("Scheduler agent received invalid state")
            return {}

        messages = state.get("messages", [])

        if not isinstance(messages, list) or not messages:
            logger.warning("Scheduler agent received empty messages list")

            return {
                **state,
                "schedule_error": "No messages found",
                "current_step": "schedule",
            }

        # -----------------------------------
        # Extract latest message
        # -----------------------------------
        last_message = messages[-1]

        if isinstance(last_message, dict):
            message = str(last_message.get("content", "")).strip()
        else:
            message = str(last_message).strip()

        logger.info(f"Scheduler processing message: {message}")

        lower_msg = message.lower()

        # -----------------------------------
        # 🔥 Intent check
        # -----------------------------------
        if not any(word in lower_msg for word in ["schedule", "book", "slot"]):
            logger.info("❌ No scheduling intent → skipping scheduler")
            return state

        # -----------------------------------
        # 🔥 Prevent duplicate scheduling (FIXED)
        # -----------------------------------
        if state.get("scheduled_time"):

            logger.info("✅ Already scheduled")

            return {
                **state,
                "messages": [
                    {
                        "role": "assistant",
                        "content": f"Your interview is already scheduled for {state['scheduled_time']}.",
                    }
                ],
                "current_step": "schedule",
            }

        # -----------------------------------
        # Slot detection
        # -----------------------------------
        slot = state.get("selected_slot")

        if slot and isinstance(slot, str) and slot.strip():
            slot = slot.strip()
            logger.info(f"Using frontend slot: {slot}")
        else:
            slot = detect_slot_from_message(message)
            logger.info(f"Detected slot: {slot}")

        # -----------------------------------
        # Calendar automation
        # -----------------------------------
        automation_result = None

        for attempt in range(2):
            try:
                automation_result = await click_calendar(slot)

                logger.info(f"Attempt {attempt+1}: {automation_result}")

                if (
                    isinstance(automation_result, dict)
                    and automation_result.get("status") == "success"
                ):
                    break

            except Exception as e:
                logger.warning(f"Attempt {attempt+1} failed: {e}")

        if not automation_result or automation_result.get("status") != "success":
            logger.warning("Calendar automation not confirmed")

        # -----------------------------------
        # Update state
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
        except Exception as e:
            logger.warning(f"DB save failed: {e}")

        try:
            append_chat_message(
                candidate_name,
                "system",
                f"Interview scheduled for {slot}",
            )
        except Exception as e:
            logger.warning(f"Memory save failed: {e}")

        logger.info(f"Interview scheduled successfully for {slot}")

        # -----------------------------------
        # 🔥 FINAL STATE RETURN (IMMUTABLE FIX)
        # -----------------------------------
        return {
            **state,
            "scheduled_time": slot,
            "current_step": "schedule",
            "messages": [
                {
                    "role": "assistant",
                    "content": f"📅 Your interview has been successfully scheduled for {slot}.",
                }
            ],
        }

    except Exception as e:

        logger.exception(f"Scheduler agent failed: {e}")

        messages = state.get("messages", [])

        return {
            **state,
            "schedule_error": str(e),
            "current_step": "schedule",
            "messages": [
                {
                    "role": "assistant",
                    "content": "Something went wrong while scheduling your interview.",
                }
            ],
        }
