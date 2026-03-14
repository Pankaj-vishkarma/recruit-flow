import logging
import asyncio
import threading
from typing import Callable

from langgraph.graph import StateGraph, END

from app.graph.state_schema import AgentState

from app.agents.research_agent import research_agent
from app.agents.screener_agent import screener_agent
from app.agents.tech_interviewer_agent import tech_interviewer
from app.agents.scheduler_agent import scheduler_agent
from app.agents.onboarding_agent import onboarding_agent


logger = logging.getLogger(__name__)

# --------------------------------------------------
# Global graph instance (thread-safe singleton)
# --------------------------------------------------

_graph_instance = None
_graph_lock = threading.Lock()


# --------------------------------------------------
# Safe node wrapper (crash protection + timeout)
# --------------------------------------------------


def safe_node(node_name: str, func: Callable):

    async def wrapper(state: AgentState):

        try:

            logger.debug(f"[LangGraph] Running node: {node_name}")

            result = func(state)

            # Await coroutine if needed
            if asyncio.iscoroutine(result):
                result = await asyncio.wait_for(result, timeout=20)

            # Ensure valid state
            if result is None:
                return state

            if not isinstance(result, dict):

                logger.warning(f"[LangGraph] Node {node_name} returned invalid result")

                return state

            return result

        except asyncio.TimeoutError:

            logger.error(f"[LangGraph] Node timeout: {node_name}")

            return state

        except Exception as e:

            logger.exception(f"[LangGraph] Node failed: {node_name} | {e}")

            return state

    return wrapper


# --------------------------------------------------
# Build LangGraph workflow
# --------------------------------------------------


def build_graph():

    global _graph_instance

    if _graph_instance is not None:
        return _graph_instance

    with _graph_lock:

        if _graph_instance is not None:
            return _graph_instance

        try:

            logger.info("Initializing LangGraph workflow...")

            workflow = StateGraph(AgentState)

            # --------------------------------------------------
            # Register nodes
            # --------------------------------------------------

            workflow.add_node("research", safe_node("research", research_agent))

            workflow.add_node("screen", safe_node("screen", screener_agent))

            workflow.add_node("tech", safe_node("tech", tech_interviewer))

            workflow.add_node("schedule", safe_node("schedule", scheduler_agent))

            workflow.add_node("onboard", safe_node("onboard", onboarding_agent))

            # --------------------------------------------------
            # Entry point
            # --------------------------------------------------

            workflow.set_entry_point("research")

            # --------------------------------------------------
            # Workflow edges
            # --------------------------------------------------

            workflow.add_edge("research", "screen")

            workflow.add_edge("screen", "tech")

            workflow.add_edge("tech", "schedule")

            workflow.add_edge("schedule", "onboard")

            workflow.add_edge("onboard", END)

            # --------------------------------------------------
            # Compile workflow
            # --------------------------------------------------

            graph = workflow.compile()

            _graph_instance = graph

            logger.info("LangGraph workflow compiled successfully")

            return graph

        except Exception as e:

            logger.exception(f"LangGraph build failed: {e}")

            raise RuntimeError("LangGraph initialization failed")
