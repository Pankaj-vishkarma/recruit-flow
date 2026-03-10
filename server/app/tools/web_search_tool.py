import logging
import requests
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)


DUCKDUCKGO_API = "https://api.duckduckgo.com/"


def web_search(query: str):
    """
    Web Search Tool

    Performs a DuckDuckGo search and returns a list of relevant URLs.
    """

    try:

        if not query:
            raise ValueError("Search query is empty")

        encoded_query = quote_plus(query)

        params = {"q": encoded_query, "format": "json", "no_redirect": 1, "no_html": 1}

        response = requests.get(DUCKDUCKGO_API, params=params, timeout=10)

        response.raise_for_status()

        data = response.json()

        results = []

        related_topics = data.get("RelatedTopics", [])

        for item in related_topics[:5]:

            if "FirstURL" in item:
                results.append(item["FirstURL"])

            elif "Topics" in item:
                for sub in item["Topics"]:
                    if "FirstURL" in sub:
                        results.append(sub["FirstURL"])

        logger.info(f"Search results found: {len(results)}")

        return results

    except requests.exceptions.Timeout:

        logger.error("Web search timeout")

        return []

    except Exception as e:

        logger.error(f"Web search failed: {e}")

        return []
