import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)


def summarize_text(text: str) -> str:
    """
    Summarize large text content safely.

    This is a lightweight summarizer that trims the text
    to a configurable number of words to avoid token overflow.
    """

    try:

        if not text:
            logger.warning("Summarizer received empty text")
            return ""

        # Clean whitespace
        text = " ".join(text.split())

        words = text.split()

        max_words = settings.SUMMARY_MAX_WORDS

        if len(words) <= max_words:
            return text

        summary = " ".join(words[:max_words])

        logger.info(f"Text summarized to {max_words} words")

        return summary

    except Exception as e:

        logger.error(f"Summarization failed: {e}")

        # Fail safe return
        return text[:500]
