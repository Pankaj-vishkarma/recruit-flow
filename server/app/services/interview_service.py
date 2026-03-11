import logging
from typing import List

logger = logging.getLogger(__name__)

# Supported skills dictionary
SUPPORTED_SKILLS = {
    "python": ["python", "flask", "fastapi"],
    "django": ["django"],
    "javascript": ["javascript", "node", "nodejs"],
    "react": ["react", "reactjs"],
}

# Interview questions mapped to primary skill
SKILL_QUESTIONS = {
    "python": "Can you explain Python decorators?",
    "django": "What is Django ORM?",
    "javascript": "What is the difference between var, let, and const?",
    "react": "Explain React hooks.",
}


def detect_skills(message: str) -> List[str]:
    """
    Detect technical skills from candidate message.

    Args:
        message (str): Candidate message

    Returns:
        List[str]: List of detected skills
    """

    if not message:
        return []

    message = message.lower()

    detected_skills = set()

    for skill, keywords in SUPPORTED_SKILLS.items():

        for keyword in keywords:

            if keyword in message:
                detected_skills.add(skill)

    skills = list(detected_skills)

    logger.info(f"Detected skills: {skills}")

    return skills


def generate_followup_question(skills: List[str]) -> str:
    """
    Generate a technical interview question based on detected skills.

    Args:
        skills (List[str]): Candidate skills

    Returns:
        str: Interview question
    """

    if not skills:
        logger.info("No skills detected, using fallback question")
        return "Tell me more about your technical experience."

    for skill in skills:

        if skill in SKILL_QUESTIONS:

            question = SKILL_QUESTIONS[skill]

            logger.info(f"Generated question for skill: {skill}")

            return question

    logger.info("No mapped question found, using fallback")

    return "Tell me more about your technical experience."
