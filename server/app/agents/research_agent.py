import logging
from typing import Dict, Any, List

from app.tools.web_search_tool import web_search
from app.tools.web_fetch_tool import web_fetch
from app.services.summarizer import summarize_text

logger = logging.getLogger(__name__)


def research_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Research Agent

    Responsibilities:
    - Perform web search based on candidate query
    - Fetch content from search results
    - Summarize retrieved information
    - Store research result in workflow state
    """

    try:

        # -----------------------------
        # Validate state
        # -----------------------------
        messages: List[str] = state.get("messages", [])

        if not isinstance(messages, list) or len(messages) == 0:

            logger.warning("Research agent received empty message list")

            state["research_result"] = "No input provided for research."
            return state

        query = str(messages[-1]).strip()

        if not query:

            logger.warning("Research query is empty")

            state["research_result"] = "Empty query provided."
            return state

        logger.info(f"Researching query: {query}")

        # -----------------------------
        # Avoid repeating research
        # -----------------------------
        if state.get("research_result"):

            logger.info("Research already performed, skipping step")
            return state

        # -----------------------------
        # Step 1: Search web links
        # -----------------------------
        links = web_search(query)

        if not links:

            logger.warning("No search results found")

            state["research_result"] = "No relevant information found."
            return state

        logger.info(f"Search returned {len(links)} links")

        # -----------------------------
        # Step 2: Fetch content
        # Try multiple links if needed
        # -----------------------------
        content = None

        for link in links[:3]:

            try:

                logger.info(f"Attempting to fetch content from: {link}")

                fetched = web_fetch(link)

                if fetched and len(fetched) > 50:

                    content = fetched

                    logger.info(f"Content fetched successfully from: {link}")

                    break

                else:

                    logger.warning(f"Content from {link} was empty or too short")

            except Exception as fetch_error:

                logger.warning(f"Failed fetching {link}: {fetch_error}")

        if not content:

            logger.warning("All fetch attempts failed")

            state["research_result"] = "Unable to retrieve content."
            return state

        # -----------------------------
        # Step 3: Summarize content
        # -----------------------------
        try:

            summary = summarize_text(content)

        except Exception as summarize_error:

            logger.error(f"Summarization failed: {summarize_error}")

            summary = None

        if not summary or len(summary.strip()) == 0:

            summary = "Research completed but no summary generated."

        # -----------------------------
        # Store result in state
        # -----------------------------
        state["research_result"] = summary

        logger.info("Research step completed successfully")

        return state

    except Exception as e:

        logger.exception(f"Research agent failed: {e}")

        # Fail-safe response so workflow continues
        state["research_error"] = str(e)
        state["research_result"] = "Research step failed."

        return state
