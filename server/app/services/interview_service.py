def detect_skills(message: str):

    skills = []

    message = message.lower()

    if "python" in message:
        skills.append("python")

    if "django" in message:
        skills.append("django")

    if "javascript" in message:
        skills.append("javascript")

    if "react" in message:
        skills.append("react")

    return skills


def generate_followup_question(skills):

    if "python" in skills:
        return "Can you explain Python decorators?"

    if "django" in skills:
        return "What is Django ORM?"

    if "react" in skills:
        return "Explain React hooks."

    return "Tell me more about your technical experience."
