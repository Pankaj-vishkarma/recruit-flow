import logging
import os
from typing import Dict, Any

from app.tools.text_editor_tool import create_file
from app.tools.bash_tool import run_bash_command
from app.tools.memory_tool import save_candidate_data

logger = logging.getLogger(__name__)


def onboarding_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Onboarding Agent
    """

    try:

        # --------------------------------------------------
        # 🔥 CRITICAL FIX 1: STRICT GUARD (NO RANDOM ONBOARDING)
        # --------------------------------------------------

        if not state.get("scheduled_time"):
            logger.info("❌ No interview scheduled → onboarding blocked")

            messages = state.get("messages", [])

            return {
                **state,
                "messages": messages
                + [
                    {
                        "role": "assistant",
                        "content": "Please schedule your interview first before onboarding.",
                    }
                ],
            }

        # --------------------------------------------------
        # 🔥 CRITICAL FIX 2: PREVENT REPEATED ONBOARDING MESSAGE
        # --------------------------------------------------

        if state.get("onboarding_complete"):
            logger.info(
                "✅ Onboarding already completed → skipping duplicate execution"
            )

            messages = state.get("messages", [])

            return {
                **state,
                "messages": messages
                + [
                    {
                        "role": "assistant",
                        "content": "Your onboarding is already completed.",
                    }
                ],
            }

        # --------------------------------------------------
        # Validate candidate name
        # --------------------------------------------------

        name = state.get("candidate_name", "candidate")

        if not isinstance(name, str) or not name.strip():
            name = "candidate"

        safe_name = name.replace(" ", "_").lower()

        folder = os.path.join("employees", safe_name)

        logger.info(f"Starting onboarding for candidate: {safe_name}")

        # --------------------------------------------------
        # Create employee directory
        # --------------------------------------------------

        mkdir_command = f"mkdir -p {folder}"
        result = run_bash_command(mkdir_command)

        logger.info(f"Bash mkdir result: {result}")

        # --------------------------------------------------
        # Create welcome file
        # --------------------------------------------------

        welcome_path = os.path.join(folder, "welcome.txt")

        welcome_content = f"""
Welcome {name} to the company!

Your development environment has been created successfully.

You now have access to the company systems and tools required
for your role.

Best Regards,
HR Team
"""

        create_file(welcome_path, welcome_content)

        # --------------------------------------------------
        # Verify onboarding
        # --------------------------------------------------

        try:
            verify_command = f"ls -la {folder}"
            verification_output = run_bash_command(verify_command)
        except Exception:
            verification_output = "verification_failed"

        # --------------------------------------------------
        # Save onboarding status
        # --------------------------------------------------

        save_candidate_data(
            name,
            {
                "onboarding_complete": True,
                "employee_directory": folder,
            },
        )

        logger.info("Onboarding status saved to database")

        # --------------------------------------------------
        # 🔥 CRITICAL FIX 3: UPDATE STATE SAFELY
        # --------------------------------------------------

        updated_state = {
            **state,
            "onboarding_complete": True,
            "employee_directory": folder,
            "onboarding_verification": verification_output,
            "current_step": "completed",
        }

        logger.info("Onboarding process completed successfully")

        # --------------------------------------------------
        # Response
        # --------------------------------------------------

        messages = state.get("messages", [])

        updated_state["messages"] = messages + [
            {
                "role": "assistant",
                "content": f"🎉 Congratulations {name}! Your onboarding is complete.\n\nYour workspace has been set up successfully.",
            }
        ]

        return updated_state

    except Exception as e:

        logger.exception(f"Onboarding agent failed: {e}")

        messages = state.get("messages", [])

        return {
            **state,
            "onboarding_complete": False,
            "onboarding_error": str(e),
            "current_step": "completed",
            "messages": messages
            + [
                {
                    "role": "assistant",
                    "content": "Something went wrong during onboarding. Please try again.",
                }
            ],
        }
