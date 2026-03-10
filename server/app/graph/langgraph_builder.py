from langgraph.graph import StateGraph, END

from app.graph.state_schema import AgentState

from app.agents.research_agent import research_agent
from app.agents.screener_agent import screener_agent
from app.agents.tech_interviewer_agent import tech_interviewer
from app.agents.scheduler_agent import scheduler_agent
from app.agents.onboarding_agent import onboarding_agent


def build_graph():

    workflow = StateGraph(AgentState)

    # nodes
    workflow.add_node("research", research_agent)
    workflow.add_node("screen", screener_agent)
    workflow.add_node("tech", tech_interviewer)
    workflow.add_node("schedule", scheduler_agent)
    workflow.add_node("onboard", onboarding_agent)

    # starting node
    workflow.set_entry_point("research")

    # edges
    workflow.add_edge("research", "screen")
    workflow.add_edge("screen", "tech")
    workflow.add_edge("tech", "schedule")
    workflow.add_edge("schedule", "onboard")
    workflow.add_edge("onboard", END)

    # compile graph
    graph = workflow.compile()

    return graph
