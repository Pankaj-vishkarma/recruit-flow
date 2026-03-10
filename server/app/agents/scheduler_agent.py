import logging

from app.tools.computer_use_tool import click_calendar
from app.config.settings import settings

logger = logging.getLogger(__name__)


async def scheduler_agent(state):
    """
    Scheduler Agent

    Responsible for scheduling candidate interview by interacting
    with the legacy calendar system.
    """

    try:

        # Validate state
        messages = state.get("messages", [])

        if not messages:
            raise ValueError("No messages found in state")

        message = messages[-1]

        # Default slot from environment config
        slot = settings.DEFAULT_INTERVIEW_SLOT

        # Basic NLP slot detection
        if "monday" in message.lower():
            slot = settings.DEFAULT_INTERVIEW_SLOT

        logger.info(f"Scheduling interview for slot: {slot}")

        # Call calendar automation tool
        result = await click_calendar(slot)

        logger.info(f"Calendar result: {result}")

        # Save schedule info in state
        state["scheduled_slot"] = slot

        # Move workflow to onboarding
        state["current_step"] = "onboard"

        return state

    except Exception as e:

        logger.error(f"Scheduler agent failed: {e}")

        # fallback behaviour so workflow doesn't crash
        state["schedule_error"] = str(e)
        state["current_step"] = "onboard"

        return state
