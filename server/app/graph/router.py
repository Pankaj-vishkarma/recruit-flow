def route_step(state):

    step = state.get("step")

    if step == "research":
        return "research_agent"

    if step == "screen":
        return "screener_agent"

    if step == "schedule":
        return "scheduler_agent"

    if step == "onboard":
        return "onboarding_agent"

    return "end"