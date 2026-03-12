from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from datetime import datetime
import os

from app.utils.helpers import extract_text_from_pdf
from app.services.interview_service import parse_resume_text

from app.config.database import users_collection, candidates_collection
from app.utils.auth_dependency import get_current_candidate_user
from app.utils.logger import get_logger


router = APIRouter(
    prefix="/candidate",
    tags=["Candidate"],
)

logger = get_logger()


# --------------------------------
# Get Candidate Profile
# --------------------------------
@router.get("/profile")
async def get_candidate_profile(user=Depends(get_current_candidate_user)):

    try:

        candidate = users_collection.find_one({"email": user["email"]})

        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate not found",
            )

        candidate["_id"] = str(candidate["_id"])

        # remove sensitive data
        candidate.pop("hashed_password", None)

        return {
            "status": "success",
            "data": candidate,
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Get candidate profile failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile",
        )


# --------------------------------
# Update Candidate Profile
# --------------------------------
@router.put("/profile")
async def update_candidate_profile(
    data: dict,
    user=Depends(get_current_candidate_user),
):

    try:

        update_data = {}

        allowed_fields = [
            "name",
            "skills",
            "experience",
            "resume_url",
        ]

        for field in allowed_fields:

            if field in data:
                update_data[field] = data[field]

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided",
            )

        update_data["updated_at"] = datetime.utcnow()

        result = users_collection.update_one(
            {"email": user["email"]},
            {"$set": update_data},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate not found",
            )

        updated_user = users_collection.find_one({"email": user["email"]})

        updated_user["_id"] = str(updated_user["_id"])

        updated_user.pop("hashed_password", None)

        logger.info(f"Candidate profile updated: {user['email']}")

        return {
            "status": "success",
            "message": "Profile updated",
            "data": updated_user,
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Update candidate profile failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed",
        )


# --------------------------------
# Candidate Dashboard
# --------------------------------
@router.get("/dashboard")
async def get_candidate_dashboard(user=Depends(get_current_candidate_user)):

    try:

        email = user["email"]

        # fetch user profile
        user_record = users_collection.find_one({"email": email})

        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # fetch pipeline record
        candidate_record = candidates_collection.find_one({"email": email})

        dashboard_data = {
            "name": user_record.get("name"),
            "email": email,
            "skills": user_record.get("skills", []),
            "experience": user_record.get("experience"),
            "status": "applied",
            "interview_score": None,
            "scheduled_time": None,
        }

        if candidate_record:
            dashboard_data["status"] = candidate_record.get("status", "screening")
            dashboard_data["interview_score"] = candidate_record.get("interview_score")
            dashboard_data["scheduled_time"] = candidate_record.get(
                "scheduled_time", None
            )

        return {
            "status": "success",
            "data": dashboard_data,
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Candidate dashboard failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard",
        )


# --------------------------------
# Upload Resume
# --------------------------------
@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    user=Depends(get_current_candidate_user),
):

    try:

        # allow only pdf
        if not file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF resumes are allowed",
            )

        upload_dir = "uploads/resumes"

        os.makedirs(upload_dir, exist_ok=True)

        file_path = f"{upload_dir}/{user['email']}.pdf"

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # --------------------------------
        # Extract resume text
        # --------------------------------
        resume_text = extract_text_from_pdf(file_path)

        # --------------------------------
        # Parse resume
        # --------------------------------
        parsed_data = parse_resume_text(resume_text)

        skills = parsed_data.get("skills", [])
        experience = parsed_data.get("experience")

        # --------------------------------
        # Update user profile with parsed data
        # --------------------------------
        users_collection.update_one(
            {"email": user["email"]},
            {
                "$set": {
                    "resume_url": file_path,
                    "skills": skills,
                    "experience": experience,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        logger.info(f"Resume uploaded and parsed: {user['email']} | skills={skills}")

        return {
            "status": "success",
            "message": "Resume uploaded and parsed successfully",
            "data": {
                "resume_path": file_path,
                "skills": skills,
                "experience": experience,
            },
        }

    except HTTPException as http_error:
        raise http_error

    except Exception as e:

        logger.exception(f"Resume upload failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume upload failed",
        )
