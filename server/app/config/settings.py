import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class Settings:
    """
    Central configuration manager for the Recruit Flow system.
    Loads all environment variables safely.
    """

    # Database
    MONGO_URI: str = os.getenv("MONGO_URI")
    DB_NAME: str = os.getenv("DB_NAME", "recruit_flow")

    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Calendar automation
    CALENDAR_URL: str = os.getenv("CALENDAR_URL", "http://localhost:3000/calendar")

    # Interview scheduling
    DEFAULT_INTERVIEW_SLOT: str = os.getenv("DEFAULT_INTERVIEW_SLOT", "Monday 2PM")

    # Summarizer config
    SUMMARY_MAX_WORDS: int = int(os.getenv("SUMMARY_MAX_WORDS", 100))

    # File system paths
    EMPLOYEE_DIR: str = os.getenv("EMPLOYEE_DIR", "./employees")

    def validate(self):
        """
        Validate required environment variables.
        """

        if not self.MONGO_URI:
            raise RuntimeError("❌ MONGO_URI is missing in environment variables")

        logger.info("✅ Environment configuration loaded successfully")


settings = Settings()

# Validate configuration on startup
settings.validate()
