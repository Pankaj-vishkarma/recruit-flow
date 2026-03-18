from datetime import datetime
from typing import Dict, Any, Optional, List
import logging

from app.config.database import candidates_collection

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Save or Update Candidate Data
# --------------------------------------------------
def save_candidate_data(name: str, data: Dict[str, Any]) -> bool:
    """
    Save or update candidate data in MongoDB.

    Args:
        name (str): Candidate name
        data (dict): Candidate information to store

    Returns:
        bool: True if successful, False otherwise
    """

    if not name:
        logger.warning("Attempted to save candidate data with empty name.")
        return False

    if not isinstance(data, dict):
        logger.error("Candidate data must be a dictionary.")
        return False

    try:

        payload = {**data}

        # --------------------------------
        # Prevent skills conflict
        # --------------------------------
        if "skills" in payload and isinstance(payload["skills"], list):

            # skills handled separately via add_candidate_skills
            skills = payload.pop("skills")

            add_candidate_skills(name, skills)

        payload["updated_at"] = datetime.utcnow()

        candidates_collection.update_one(
            {"email": name},
            {
                "$set": payload,
                "$setOnInsert": {
                    "created_at": datetime.utcnow(),
                    "chat_history": [],
                    "skills": [],
                    "interview_history": [],
                },
            },
            upsert=True,
        )

        logger.info(f"Candidate data saved/updated successfully for: {name} (email)")
        return True

    except Exception as e:
        logger.exception(f"Error saving candidate data for {name}: {e}")
        return False


# --------------------------------------------------
# Get Candidate Data
# --------------------------------------------------
def get_candidate_data(name: str) -> Dict[str, Any]:
    """
    Retrieve candidate data from MongoDB.
    """

    if not name:
        logger.warning("Attempted to fetch candidate data with empty name.")
        return {}

    try:

        candidate = candidates_collection.find_one({"email": name}, {"_id": 0})

        if candidate:
            logger.info(f"Candidate data fetched for: {name}")
            return candidate

        logger.info(f"No candidate found for name: {name}")
        return {}

    except Exception as e:
        logger.exception(f"Error retrieving candidate data for {name}: {e}")
        return {}


# --------------------------------------------------
# Update Specific Fields
# --------------------------------------------------
def update_candidate_fields(name: str, fields: Dict[str, Any]) -> bool:
    """
    Update specific fields for a candidate.
    """

    if not name or not isinstance(fields, dict):
        logger.error("Invalid parameters passed to update_candidate_fields.")
        return False

    try:

        if "skills" in fields:
            skills = fields.pop("skills")
            add_candidate_skills(name, skills)

        candidates_collection.update_one(
            {"email": name}, {"$set": {**fields, "updated_at": datetime.utcnow()}}
        )

        logger.info(f"Candidate fields updated for: {name}")
        return True

    except Exception as e:
        logger.exception(f"Error updating candidate fields for {name}: {e}")
        return False


# --------------------------------------------------
# Check Candidate Exists
# --------------------------------------------------
def candidate_exists(name: str) -> bool:
    """
    Check if candidate exists in database.
    """

    if not name:
        return False

    try:

        candidate = candidates_collection.find_one({"email": name}, {"_id": 1})

        return candidate is not None

    except Exception as e:
        logger.exception(f"Error checking candidate existence for {name}: {e}")
        return False


# --------------------------------------------------
# Append Chat Message
# --------------------------------------------------
def append_chat_message(name: str, role: str, content: str) -> bool:
    """
    Store chat message in candidate memory.
    """

    if not name or not content:
        return False

    try:

        message = {"role": role, "content": content, "timestamp": datetime.utcnow()}

        candidates_collection.update_one(
            {"email": name},
            {
                "$push": {"chat_history": message},
                "$set": {"updated_at": datetime.utcnow()},
                "$setOnInsert": {
                    "created_at": datetime.utcnow(),
                    "skills": [],
                    "interview_history": [],
                },
            },
            upsert=True,
        )

        logger.info(f"Chat message stored for {name}")

        return True

    except Exception as e:
        logger.exception(f"Error storing chat message: {e}")
        return False


# --------------------------------------------------
# Get Chat History
# --------------------------------------------------
def get_chat_history(name: str) -> List[Dict[str, Any]]:
    """
    Retrieve conversation history.
    """

    try:

        candidate = candidates_collection.find_one(
            {"email": name}, {"chat_history": 1, "_id": 0}
        )

        if candidate and "chat_history" in candidate:
            return candidate["chat_history"]

        return []

    except Exception as e:
        logger.exception(f"Error fetching chat history: {e}")
        return []


# --------------------------------------------------
# Store Skills Memory
# --------------------------------------------------
def add_candidate_skills(name: str, skills: List[str]) -> bool:
    """
    Add detected skills to candidate profile.
    """

    if not name or not skills:
        return False

    try:

        if not isinstance(skills, list):
            skills = [skills]

        candidates_collection.update_one(
            {"email": name},
            {
                "$addToSet": {"skills": {"$each": skills}},
                "$set": {"updated_at": datetime.utcnow()},
                "$setOnInsert": {
                    "created_at": datetime.utcnow(),
                    "chat_history": [],
                    "interview_history": [],
                },
            },
            upsert=True,
        )

        logger.info(f"Skills updated for candidate: {name}")

        return True

    except Exception as e:
        logger.exception(f"Error updating candidate skills: {e}")
        return False


# --------------------------------------------------
# Save Interview History
# --------------------------------------------------
def add_interview_record(
    name: str, question: str, answer: str, score: Optional[int] = None
) -> bool:
    """
    Save technical interview question & answer.
    """

    if not name:
        return False

    try:

        record = {
            "question": question,
            "answer": answer,
            "score": score,
            "timestamp": datetime.utcnow(),
        }

        candidates_collection.update_one(
            {"email": name},
            {
                "$push": {"interview_history": record},
                "$set": {"updated_at": datetime.utcnow()},
                "$setOnInsert": {
                    "created_at": datetime.utcnow(),
                    "chat_history": [],
                    "skills": [],
                },
            },
            upsert=True,
        )

        logger.info(f"Interview record stored for {name}")

        return True

    except Exception as e:
        logger.exception(f"Error saving interview history: {e}")
        return False
