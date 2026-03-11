import logging
from typing import List
import requests
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

DUCKDUCKGO_API = "https://api.duckduckgo.com/"


def web_search(query: str) -> List[str]:
    """
    Web Search Tool

    Performs a DuckDuckGo search and returns a list of relevant URLs.

    Production features:
    - crash protection
    - timeout handling
    - duplicate filtering
    - robust parsing
    """

    try:

        if not query or not query.strip():
            raise ValueError("Search query is empty")

        logger.info(f"Performing web search for query: {query}")

        encoded_query = quote_plus(query)

        params = {"q": encoded_query, "format": "json", "no_redirect": 1, "no_html": 1}

        headers = {"User-Agent": "RecruitFlow-AI-Agent/1.0"}

        response = requests.get(
            DUCKDUCKGO_API, params=params, headers=headers, timeout=10
        )

        response.raise_for_status()

        data = response.json()

        results = []

        related_topics = data.get("RelatedTopics", [])

        # -----------------------------
        # Extract URLs safely
        # -----------------------------
        for item in related_topics:

            if isinstance(item, dict):

                if "FirstURL" in item:
                    results.append(item["FirstURL"])

                elif "Topics" in item:

                    for sub in item.get("Topics", []):

                        if "FirstURL" in sub:
                            results.append(sub["FirstURL"])

            # Stop after enough results
            if len(results) >= 5:
                break

        # -----------------------------
        # Remove duplicates
        # -----------------------------
        results = list(dict.fromkeys(results))

        if not results:

            logger.warning("No search results found")

        else:

            logger.info(f"Search results found: {len(results)}")

        return results

    except requests.exceptions.Timeout:

        logger.error("Web search timeout")

        return []

    except requests.exceptions.RequestException as req_error:

        logger.error(f"Web search request failed: {req_error}")

        return []

    except Exception as e:

        logger.exception(f"Web search failed: {e}")

        return []
