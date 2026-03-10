from app.tools.memory_tool import save_candidate_data
from app.services.interview_service import detect_skills


def screener_agent(state):

    message = state["messages"][-1]

    name = state.get("candidate_name", "candidate")

    skills = detect_skills(message)

    state["candidate_data"]["skills"] = skills

    save_candidate_data(name, {"skills": skills})

    state["current_step"] = "tech"

    return state
