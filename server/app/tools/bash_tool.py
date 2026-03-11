import subprocess
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


def run_command(command: str, timeout: int = 10) -> Dict[str, Any]:
    """
    Bash Tool

    Safely executes system commands.

    Production features:
    - crash protection
    - timeout safety
    - structured output
    - logging
    - shell injection prevention
    """

    try:

        if not command or not command.strip():
            raise ValueError("Command cannot be empty")

        logger.info(f"Executing command: {command}")

        # Convert command string into list for safety
        command_list: List[str] = command.split()

        result = subprocess.run(
            command_list, capture_output=True, text=True, timeout=timeout
        )

        logger.info(f"Command executed with return code {result.returncode}")

        return {
            "status": "success",
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "return_code": result.returncode,
        }

    except subprocess.TimeoutExpired:

        logger.error("Command execution timed out")

        return {"status": "error", "message": "Command timed out"}

    except Exception as e:

        logger.exception("Command execution failed")

        return {"status": "error", "message": str(e)}
