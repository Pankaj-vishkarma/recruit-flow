import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; RecruitFlowBot/1.0)"}


def web_fetch(url: str):
    """
    Web Fetch Tool

    Fetches webpage content and extracts meaningful text
    from paragraph tags.
    """

    try:

        if not url:
            raise ValueError("URL is empty")

        logger.info(f"Fetching content from: {url}")

        response = requests.get(url, headers=HEADERS, timeout=10)

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")

        if not paragraphs:
            logger.warning("No paragraph content found")
            return ""

        text = " ".join(p.get_text(strip=True) for p in paragraphs[:10])

        logger.info("Web content extracted successfully")

        return text

    except requests.exceptions.Timeout:

        logger.error("Web fetch timeout")

        return ""

    except requests.exceptions.RequestException as e:

        logger.error(f"HTTP error while fetching page: {e}")

        return ""

    except Exception as e:

        logger.error(f"Web fetch failed: {e}")

        return ""
