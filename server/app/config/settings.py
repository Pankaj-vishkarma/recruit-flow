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

    # --------------------------------------------------
    # Database
    # --------------------------------------------------
    MONGO_URI: str = os.getenv("MONGO_URI")
    DB_NAME: str = os.getenv("DB_NAME", "recruit_flow")

    # --------------------------------------------------
    # Frontend
    # --------------------------------------------------
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # --------------------------------------------------
    # Calendar automation
    # --------------------------------------------------
    CALENDAR_URL: str = os.getenv("CALENDAR_URL", "http://localhost:3000/calendar")

    # NEW: calendar automation mode
    # options: simulation | playwright | disabled
    CALENDAR_MODE: str = os.getenv("CALENDAR_MODE", "simulation")

    # --------------------------------------------------
    # Interview scheduling
    # --------------------------------------------------
    DEFAULT_INTERVIEW_SLOT: str = os.getenv("DEFAULT_INTERVIEW_SLOT", "Monday 2PM")

    # --------------------------------------------------
    # Summarizer config
    # --------------------------------------------------
    SUMMARY_MAX_WORDS: int = int(os.getenv("SUMMARY_MAX_WORDS", 100))

    # --------------------------------------------------
    # File system paths
    # --------------------------------------------------
    EMPLOYEE_DIR: str = os.getenv("EMPLOYEE_DIR", "./employees")

    # --------------------------------------------------
    # Logging
    # --------------------------------------------------
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    def validate(self):
        """
        Validate required environment variables.
        """

        if not self.MONGO_URI:
            raise RuntimeError("❌ MONGO_URI is missing in environment variables")

        # Validate calendar mode
        allowed_modes = ["simulation", "playwright", "disabled"]

        if self.CALENDAR_MODE not in allowed_modes:
            raise RuntimeError(
                f"❌ Invalid CALENDAR_MODE '{self.CALENDAR_MODE}'. Allowed: {allowed_modes}"
            )

        # Ensure employee directory exists
        try:

            os.makedirs(self.EMPLOYEE_DIR, exist_ok=True)

        except Exception as e:

            logger.warning(f"⚠️ Could not create employee directory: {e}")

        logger.info("✅ Environment configuration loaded successfully")
        logger.info(f"Calendar automation mode: {self.CALENDAR_MODE}")


settings = Settings()

# Validate configuration on startup
settings.validate()
