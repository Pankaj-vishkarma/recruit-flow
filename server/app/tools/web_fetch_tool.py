import logging
from typing import Optional
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RecruitFlowBot/1.0",
    "Accept-Language": "en-US,en;q=0.9",
}


def clean_text(text: str) -> str:
    """
    Utility function to clean extracted text.
    Removes extra whitespace and newlines.
    """

    return " ".join(text.split())


def web_fetch(url: str) -> Optional[str]:
    """
    Web Fetch Tool

    Fetches webpage content and extracts meaningful text
    from paragraph tags.

    Production features:
    - crash protection
    - anti-bot headers
    - timeout handling
    - safe HTML parsing
    - content cleaning
    """

    try:

        if not url or not url.strip():
            raise ValueError("URL is empty")

        logger.info(f"Fetching content from: {url}")

        response = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # -----------------------------
        # Extract paragraphs safely
        # -----------------------------
        paragraphs = soup.find_all("p")

        if not paragraphs:
            logger.warning("No paragraph content found")
            return ""

        extracted_text = []

        for p in paragraphs[:15]:  # limit extraction
            text = p.get_text(strip=True)

            if text and len(text) > 40:  # avoid small fragments
                extracted_text.append(text)

        if not extracted_text:
            logger.warning("Extracted paragraphs are empty")
            return ""

        combined_text = " ".join(extracted_text)

        # Clean text
        cleaned = clean_text(combined_text)

        # Limit text size to avoid huge LLM input
        cleaned = cleaned[:3000]

        logger.info("Web content extracted successfully")

        return cleaned

    except requests.exceptions.Timeout:

        logger.error("Web fetch timeout")

        return ""

    except requests.exceptions.RequestException as e:

        logger.error(f"HTTP error while fetching page: {e}")

        return ""

    except Exception as e:

        logger.exception(f"Web fetch failed: {e}")

        return ""
