import subprocess
import logging
import sys
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
    - cross-platform compatibility
    """

    try:

        if not command or not command.strip():
            raise ValueError("Command cannot be empty")

        command = command.strip()

        logger.info(f"Executing command: {command}")

        # --------------------------------
        # Windows compatibility
        # --------------------------------
        if sys.platform.startswith("win"):

            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                shell=True,  # REQUIRED for Windows commands
            )

        else:

            # Linux / Mac safe execution
            command_list: List[str] = command.split()

            result = subprocess.run(
                command_list,
                capture_output=True,
                text=True,
                timeout=timeout,
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

    except FileNotFoundError:

        logger.error("Command not found")

        return {"status": "error", "message": "Command not found on system"}

    except Exception as e:

        logger.exception("Command execution failed")

        return {"status": "error", "message": str(e)}


def run_bash_command(command: str, timeout: int = 10) -> Dict[str, Any]:
    """
    Wrapper function for compatibility with agents.

    Some agents import `run_bash_command`, so this function
    simply calls run_command internally.
    """

    return run_command(command, timeout)
