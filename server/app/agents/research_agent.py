import logging
from typing import Dict, Any, List

from app.tools.web_search_tool import web_search
from app.tools.web_fetch_tool import web_fetch
from app.services.summarizer import summarize_text

logger = logging.getLogger(__name__)


def research_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Research Agent
    """

    try:

        # -----------------------------
        # Validate state
        # -----------------------------
        messages: List[Dict[str, Any]] = state.get("messages", [])

        if not isinstance(messages, list) or len(messages) == 0:

            logger.warning("Research agent received empty message list")

            state["research_result"] = "No input provided for research."
            return state

        # 🔥 FIX: Proper query extraction
        last_msg = messages[-1]

        if isinstance(last_msg, dict):
            query = str(last_msg.get("content", "")).strip()
        else:
            query = str(last_msg).strip()

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

            # 🔥 FIX: immutable update
            state["messages"] = messages + [
                {
                    "role": "assistant",
                    "content": "I couldn't find relevant information for your query.",
                }
            ]

            return state

        logger.info(f"Search returned {len(links)} links")

        # -----------------------------
        # Step 2: Fetch content
        # -----------------------------
        content = None

        for link in links[:3]:

            try:

                logger.info(f"Fetching: {link}")

                fetched = web_fetch(link)

                if fetched and len(fetched) > 50:

                    content = fetched
                    break

            except Exception as fetch_error:

                logger.warning(f"Fetch failed: {fetch_error}")

        if not content:

            logger.warning("All fetch attempts failed")

            state["research_result"] = "Unable to retrieve content."

            # 🔥 FIX: immutable update
            state["messages"] = messages + [
                {
                    "role": "assistant",
                    "content": "I couldn't fetch useful data from the web.",
                }
            ]

            return state

        # -----------------------------
        # Step 3: Summarize
        # -----------------------------
        try:

            summary = summarize_text(content)

        except Exception as summarize_error:

            logger.error(f"Summarization failed: {summarize_error}")
            summary = None

        if not summary or not str(summary).strip():

            summary = f"I found some relevant information about: {query}"

        # -----------------------------
        # Store result
        # -----------------------------
        state["research_result"] = summary

        # 🔥🔥 CRITICAL FIX: immutable update
        state["messages"] = messages + [{"role": "assistant", "content": summary}]

        logger.info("Research step completed successfully")

        return state

    except Exception as e:

        logger.exception(f"Research agent failed: {e}")

        state["research_error"] = str(e)
        state["research_result"] = "Research step failed."

        # 🔥 FIX: immutable update
        messages = state.get("messages", [])

        state["messages"] = messages + [
            {"role": "assistant", "content": "Something went wrong during research."}
        ]

        return state
