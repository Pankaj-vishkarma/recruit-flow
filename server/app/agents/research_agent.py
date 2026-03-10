import logging

from app.tools.web_search_tool import web_search
from app.tools.web_fetch_tool import web_fetch
from app.services.summarizer import summarize_text

logger = logging.getLogger(__name__)


def research_agent(state):
    """
    Research Agent

    Responsible for gathering information about a company or candidate
    using web search and content summarization.
    """

    try:

        # Validate state
        messages = state.get("messages", [])

        if not messages:
            raise ValueError("No messages found in state")

        query = messages[-1]

        logger.info(f"Researching query: {query}")

        # Step 1: Search links
        links = web_search(query)

        if not links:
            logger.warning("No search results found")

            state["research_result"] = "No relevant information found."

            return state

        # Step 2: Fetch content from first result
        content = web_fetch(links[0])

        if not content:
            logger.warning("Web fetch returned empty content")

            state["research_result"] = "Unable to retrieve content."

            return state

        # Step 3: Summarize content
        summary = summarize_text(content)

        # Store result in state
        state["research_result"] = summary

        return state

    except Exception as e:

        logger.error(f"Research agent failed: {e}")

        # Fail-safe response so workflow continues
        state["research_error"] = str(e)
        state["research_result"] = "Research step failed."

        return state
