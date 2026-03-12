import logging
import re
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


def detect_skills(message) -> List[str]:
    """
    Detect technical skills from candidate message.

    Args:
        message (str | dict | any): Candidate message

    Returns:
        List[str]: List of detected skills
    """

    if not message:
        return []

    # -------------------------------------------------
    # Handle LangGraph message structures
    # -------------------------------------------------
    if isinstance(message, dict):
        message = message.get("content", "")

    if isinstance(message, list):
        message = " ".join([str(m) for m in message])

    if not isinstance(message, str):
        message = str(message)

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

    return "Tell me more about your technical experience"


# --------------------------------
# Extract Experience From Resume
# --------------------------------
def extract_experience(text: str) -> str:
    """
    Extract years of experience from resume text.
    """

    if not text:
        return None

    if not isinstance(text, str):
        text = str(text)

    pattern = r"(\d+)\s*(?:\+)?\s*(?:years|year)"

    match = re.search(pattern, text.lower())

    if match:
        return f"{match.group(1)} years"

    return None


# --------------------------------
# Parse Resume Text
# --------------------------------
def parse_resume_text(resume_text: str) -> dict:
    """
    Parse resume text to extract candidate information.
    """

    if not resume_text:
        return {"skills": [], "experience": None}

    if not isinstance(resume_text, str):
        resume_text = str(resume_text)

    skills = detect_skills(resume_text)

    experience = extract_experience(resume_text)

    logger.info(f"Resume parsed | skills={skills} | experience={experience}")

    return {"skills": skills, "experience": experience}


# --------------------------------
# Evaluate Candidate Answer
# --------------------------------
def evaluate_candidate_answer(answer: str, expected_skill: str) -> int:
    """
    Evaluate candidate answer and return a simple score.
    """

    if not answer:
        return 0

    if not isinstance(answer, str):
        answer = str(answer)

    answer = answer.lower()

    keywords = SUPPORTED_SKILLS.get(expected_skill, [])

    score = 0

    for keyword in keywords:

        if keyword in answer:
            score += 1

    logger.info(f"Answer evaluated | skill={expected_skill} | score={score}")

    return score


# --------------------------------
# Generate Interview Score
# --------------------------------
def generate_interview_score(scores: List[int]) -> int:
    """
    Calculate overall interview score.
    """

    if not scores:
        return 0

    total_score = sum(scores)

    logger.info(f"Final interview score: {total_score}")

    return total_score
