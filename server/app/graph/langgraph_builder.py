import logging
import asyncio
from typing import Optional, Callable

from langgraph.graph import StateGraph, END

from app.graph.state_schema import AgentState

from app.agents.research_agent import research_agent
from app.agents.screener_agent import screener_agent
from app.agents.tech_interviewer_agent import tech_interviewer
from app.agents.scheduler_agent import scheduler_agent
from app.agents.onboarding_agent import onboarding_agent


logger = logging.getLogger(__name__)

# --------------------------------------------------
# Global graph instance (singleton)
# Prevents rebuilding graph on every request
# --------------------------------------------------
_graph_instance = None


# --------------------------------------------------
# Safe node wrapper (crash protection)
# Supports both sync and async nodes
# --------------------------------------------------
def safe_node(node_name: str, func: Callable):
    """
    Wrap node execution to prevent system crashes
    and support async agent functions.
    """

    async def wrapper(state: AgentState):

        try:

            logger.info(f"[LangGraph] Executing node: {node_name}")

            result = func(state)

            # --------------------------------------------------
            # If agent returned coroutine → await it
            # --------------------------------------------------
            if asyncio.iscoroutine(result):
                result = await result

            # --------------------------------------------------
            # LangGraph requires dict-like state return
            # --------------------------------------------------
            if result is None:
                result = state

            if not isinstance(result, dict):
                logger.warning(
                    f"[LangGraph] Node {node_name} returned non-dict result. Using state fallback."
                )
                result = state

            logger.info(f"[LangGraph] Completed node: {node_name}")

            return result

        except Exception as e:

            logger.exception(f"[LangGraph] Node failed: {node_name} | Error: {e}")

            # Return state unchanged to prevent workflow crash
            return state

    return wrapper


# --------------------------------------------------
# Build LangGraph workflow
# --------------------------------------------------
def build_graph():
    """
    Build LangGraph workflow for Recruit-Flow HR system.

    Pipeline:
    Research → Screening → Technical Interview → Scheduling → Onboarding
    """

    global _graph_instance

    # Prevent rebuilding graph multiple times
    if _graph_instance is not None:
        logger.info("Returning existing LangGraph instance")
        return _graph_instance

    try:

        logger.info("Initializing LangGraph workflow...")

        workflow = StateGraph(AgentState)

        # -----------------------------
        # Register nodes with safety wrapper
        # -----------------------------

        workflow.add_node("research", safe_node("research", research_agent))

        workflow.add_node("screen", safe_node("screen", screener_agent))

        workflow.add_node("tech", safe_node("tech", tech_interviewer))

        workflow.add_node("schedule", safe_node("schedule", scheduler_agent))

        workflow.add_node("onboard", safe_node("onboard", onboarding_agent))

        # -----------------------------
        # Entry point
        # -----------------------------

        workflow.set_entry_point("research")

        # -----------------------------
        # Workflow edges
        # -----------------------------

        workflow.add_edge("research", "screen")

        workflow.add_edge("screen", "tech")

        workflow.add_edge("tech", "schedule")

        workflow.add_edge("schedule", "onboard")

        workflow.add_edge("onboard", END)

        # -----------------------------
        # Compile graph
        # -----------------------------

        graph = workflow.compile()

        logger.info("LangGraph workflow compiled successfully")

        # Cache instance
        _graph_instance = graph

        return graph

    except Exception as e:

        logger.exception(f"Failed to build LangGraph workflow: {e}")

        raise RuntimeError("LangGraph initialization failed")
