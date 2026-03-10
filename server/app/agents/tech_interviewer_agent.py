from app.services.interview_service import generate_followup_question


def tech_interviewer(state):

    skills = state["candidate_data"].get("skills", [])

    question = generate_followup_question(skills)

    print("Tech Interview Question:", question)

    state["messages"].append(question)

    return state
