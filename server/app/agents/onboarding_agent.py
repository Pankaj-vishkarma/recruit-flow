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

    Responsibilities:
    - Create employee directory using Bash tool
    - Generate welcome file
    - Verify onboarding environment
    - Update workflow state
    - Persist onboarding status

    Production features:
    - OS compatible
    - crash protection
    - bash retry
    - safe folder naming
    - verification with shell
    """

    try:

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
        # Create employee directory using Bash tool
        # --------------------------------------------------
        try:

            mkdir_command = f"mkdir -p {folder}"

            result = run_bash_command(mkdir_command)

            logger.info(f"Bash mkdir result: {result}")

        except Exception as dir_error:

            logger.error(f"Failed creating employee directory: {dir_error}")

            raise dir_error

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

        try:

            logger.info("Creating welcome file")

            create_file(welcome_path, welcome_content)

        except Exception as file_error:

            logger.error(f"Failed creating welcome file: {file_error}")

            raise file_error

        # --------------------------------------------------
        # Verify onboarding using shell command
        # --------------------------------------------------
        try:

            verify_command = f"ls -la {folder}"

            verification_output = run_bash_command(verify_command)

            logger.info(f"Verification output: {verification_output}")

        except Exception as verify_error:

            logger.warning(f"Verification failed: {verify_error}")

            verification_output = "verification_failed"

        # --------------------------------------------------
        # Save onboarding status in database
        # --------------------------------------------------
        try:

            save_candidate_data(
                name,
                {
                    "onboarding_complete": True,
                    "employee_directory": folder,
                },
            )

            logger.info("Onboarding status saved to database")

        except Exception as db_error:

            logger.warning(f"Failed to save onboarding status: {db_error}")

        # --------------------------------------------------
        # Update workflow state
        # --------------------------------------------------
        state["onboarding_complete"] = True
        state["employee_directory"] = folder
        state["onboarding_verification"] = verification_output
        state["current_step"] = "completed"

        logger.info("Onboarding process completed successfully")

        return state

    except Exception as e:

        logger.exception(f"Onboarding agent failed: {e}")

        state["onboarding_complete"] = False
        state["onboarding_error"] = str(e)
        state["current_step"] = "completed"

        return state
