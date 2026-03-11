from loguru import logger
import sys
import os


LOG_DIR = "logs"

os.makedirs(LOG_DIR, exist_ok=True)


logger.remove()

# Console logging
logger.add(
    sys.stdout,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name} | {message}",
    level="INFO",
)

# File logging with rotation
logger.add(
    f"{LOG_DIR}/app.log",
    rotation="10 MB",
    retention="10 days",
    compression="zip",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
    level="INFO",
)

# Error log
logger.add(
    f"{LOG_DIR}/error.log",
    rotation="10 MB",
    retention="30 days",
    level="ERROR",
)


def get_logger():
    return logger
