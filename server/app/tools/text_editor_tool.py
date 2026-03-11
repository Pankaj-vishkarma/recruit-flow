import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def create_file(path: str, content: str, overwrite: bool = True) -> Dict[str, Any]:
    """
    Text Editor Tool

    Safely creates or writes files.

    Production features:
    - directory auto creation
    - crash protection
    - optional overwrite protection
    - UTF-8 safe writing
    - structured response
    - logging
    """

    try:

        if not path or not isinstance(path, str):
            raise ValueError("Invalid file path")

        directory = os.path.dirname(path)

        if directory:
            os.makedirs(directory, exist_ok=True)

        # Prevent accidental overwrite
        if not overwrite and os.path.exists(path):

            logger.warning(f"File already exists, skipping creation: {path}")

            return {"status": "skipped", "message": "File already exists", "path": path}

        logger.info(f"Creating file: {path}")

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

        return {
            "status": "success",
            "message": "File created successfully",
            "path": path,
        }

    except Exception as e:

        logger.exception("File creation failed")

        return {"status": "error", "message": str(e), "path": path}
