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

_graph_instance = None
_graph_lock = threading.Lock()


# --------------------------------------------------
# Safe node wrapper
# --------------------------------------------------


def safe_node(node_name: str, func: Callable):

    async def wrapper(state: AgentState):

        try:
            logger.debug(f"[LangGraph] Running node: {node_name}")

            result = func(state)

            if asyncio.iscoroutine(result):
                result = await asyncio.wait_for(result, timeout=20)

            if result is None:
                result = {}

            if not isinstance(result, dict):
                logger.warning(f"[LangGraph] Node {node_name} returned invalid result")
                result = {}

            merged_state = {**state, **result}

            # 🔥 FIX: append messages safely
            prev_messages = state.get("messages", [])
            new_messages = result.get("messages", [])

            if new_messages and isinstance(new_messages, list):
                merged_state["messages"] = prev_messages + new_messages
            else:
                merged_state["messages"] = prev_messages

            return merged_state

        except Exception as e:
            logger.exception(f"[LangGraph] Node failed: {node_name} | {e}")
            return state

    return wrapper


# --------------------------------------------------
# Build Graph
# --------------------------------------------------


def build_graph():

    global _graph_instance

    if _graph_instance:
        return _graph_instance

    with _graph_lock:

        if _graph_instance:
            return _graph_instance

        try:
            logger.info("Initializing LangGraph workflow...")

            workflow = StateGraph(AgentState)

            # --------------------------------------------------
            # Nodes
            # --------------------------------------------------

            workflow.add_node("screen", safe_node("screen", screener_agent))
            workflow.add_node("tech", safe_node("tech", tech_interviewer))
            workflow.add_node("schedule", safe_node("schedule", scheduler_agent))
            workflow.add_node("onboard", safe_node("onboard", onboarding_agent))

            # --------------------------------------------------
            # 🔥 FINAL SMART ROUTER
            # --------------------------------------------------

            def router_node(state: AgentState):

                messages = state.get("messages", [])
                last_msg = ""

                if messages and isinstance(messages[-1], dict):
                    last_msg = str(messages[-1].get("content", "")).lower()

                step = state.get("current_step", "screen")

                logger.info(f"[ROUTER] step: {step} | msg: {last_msg}")

                # ----------------------------------------
                # 🔥 INTENT PRIORITY
                # ----------------------------------------

                # schedule intent
                if any(
                    word in last_msg for word in ["schedule", "schedul", "book", "slot"]
                ):
                    state["current_step"] = "schedule"
                    return {"next": "schedule"}

                # onboarding intent (manual only)
                if any(word in last_msg for word in ["onboard", "join", "start job"]):
                    state["current_step"] = "onboard"
                    return {"next": "onboard"}

                # start interview
                if "start" in last_msg and "interview" in last_msg:
                    state["current_step"] = "tech"
                    return {"next": "tech"}

                # greeting (ONLY if no prior flow)
                if any(word in last_msg for word in ["hi", "hello", "hey"]):
                    return {"next": step}

                # ----------------------------------------
                # 🔥 STAGE BASED ROUTING
                # ----------------------------------------

                if step == "screen":
                    return {"next": "screen"}

                elif step == "tech":
                    return {"next": "tech"}

                elif step == "schedule":
                    return {"next": "schedule"}

                elif step == "onboard":
                    return {"next": "onboard"}

                return {"next": "screen"}

            workflow.add_node("router", router_node)

            # --------------------------------------------------
            # ENTRY
            # --------------------------------------------------

            workflow.set_entry_point("router")

            # --------------------------------------------------
            # ROUTES
            # --------------------------------------------------

            def route_from_router(state):
                return state.get("next", "screen")

            def route_from_screen(state):
                state["current_step"] = "tech"
                return "tech"

            def route_from_tech(state):
                return END

            # 🔥 FIXED: NO AUTO ONBOARDING
            def route_from_schedule(state):
                logger.info("[ROUTE] schedule → END")
                return END

            def route_from_onboard(state):
                return END

            # --------------------------------------------------
            # EDGES
            # --------------------------------------------------

            workflow.add_conditional_edges("router", route_from_router)
            workflow.add_conditional_edges("screen", route_from_screen)
            workflow.add_conditional_edges("tech", route_from_tech)
            workflow.add_conditional_edges("schedule", route_from_schedule)
            workflow.add_conditional_edges("onboard", route_from_onboard)

            graph = workflow.compile()

            _graph_instance = graph

            logger.info("LangGraph workflow compiled successfully")

            return graph

        except Exception as e:
            logger.exception(f"LangGraph build failed: {e}")
            raise RuntimeError("LangGraph initialization failed")
