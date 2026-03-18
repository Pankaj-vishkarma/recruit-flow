from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from datetime import datetime
import os

from app.utils.helpers import extract_text_from_pdf
from app.services.interview_service import parse_resume_text

from app.config.database import users_collection, candidates_collection
from app.utils.auth_dependency import get_current_candidate_user
from app.utils.logger import get_logger

from bson import ObjectId


router = APIRouter(
    prefix="/candidate",
    tags=["Candidate"],
)

logger = get_logger()


# --------------------------------
# Helper: Mongo serialize (SAFE)
# --------------------------------
def serialize(obj):
    if isinstance(obj, list):
        return [serialize(i) for i in obj]

    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if isinstance(v, ObjectId):
                new_obj[k] = str(v)
            else:
                new_obj[k] = serialize(v)
        return new_obj

    return obj


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

        candidate.pop("hashed_password", None)

        return {
            "success": True,
            "data": serialize(candidate),
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

        print("🔥 RAW REQUEST DATA:", data)  # ✅ DEBUG 1

        update_data = {}

        allowed_fields = [
            "name",
            "skills",
            "experience",
            "resume_url",
        ]

        for field in allowed_fields:

            if field not in data:
                continue

            value = data[field]

            print(f"➡️ Processing field: {field} = {value}")  # ✅ DEBUG 2

            # 🔥 FIX: skills safe handling
            if field == "skills":

                if not value or not isinstance(value, list):
                    print("❌ Invalid skills format, skipping")
                    continue

                value = [s.strip() for s in value if s and isinstance(s, str)]

                if not value:
                    print("❌ Skills empty after cleaning, skipping")
                    continue

            update_data[field] = value

        print("✅ FINAL UPDATE DATA:", update_data)  # ✅ DEBUG 3

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

        print("🧠 Mongo Update Result:", result.raw_result)  # ✅ DEBUG 4

        # 🔥 FIX: check modified_count also
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate not found",
            )

        if result.modified_count == 0:
            print("⚠️ Data matched but not modified (same values)")

        # 🔥 Sync candidates collection
        candidate_update = {"updated_at": datetime.utcnow()}

        if "experience" in update_data:
            candidate_update["experience"] = update_data["experience"]

        if "skills" in update_data:
            candidate_update["skills"] = update_data["skills"]

        candidates_collection.update_one(
            {"email": user["email"]},
            {"$set": candidate_update},
            upsert=True,
        )

        updated_user = users_collection.find_one({"email": user["email"]})

        updated_user.pop("hashed_password", None)

        logger.info(f"Candidate profile updated: {user['email']}")

        return {
            "success": True,
            "message": "Profile updated",
            "data": serialize(updated_user),
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

        user_record = users_collection.find_one({"email": email})

        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

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

        # 🔥 always source of truth
        dashboard_data["skills"] = user_record.get("skills", [])

        return {
            "success": True,
            "data": serialize(dashboard_data),
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

        resume_text = extract_text_from_pdf(file_path)
        parsed_data = parse_resume_text(resume_text)

        skills = parsed_data.get("skills", [])
        experience = parsed_data.get("experience")

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

        candidates_collection.update_one(
            {"email": user["email"]},
            {
                "$set": {
                    "skills": skills,
                    "experience": experience,
                    "updated_at": datetime.utcnow(),
                }
            },
            upsert=True,
        )

        logger.info(f"Resume uploaded and parsed: {user['email']} | skills={skills}")

        return {
            "success": True,
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


# --------------------------------
# 🔥 GET ALL CANDIDATES (PAGINATION)
# --------------------------------
@router.get("/all")
async def get_all_candidates(page: int = 1, limit: int = 5):

    try:

        skip = (page - 1) * limit

        candidates_cursor = candidates_collection.find().skip(skip).limit(limit)
        candidates = list(candidates_cursor)

        total = candidates_collection.count_documents({})

        return {
            "success": True,
            "data": serialize(candidates),
            "page": page,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        logger.exception(f"Fetch candidates failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch candidates",
        )


# --------------------------------
# 🔥 UPDATE CANDIDATE STATUS (HR)
# --------------------------------
@router.put("/status/{candidate_id}")
async def update_candidate_status(candidate_id: str, data: dict):

    try:

        status_value = data.get("status")

        if not status_value:
            raise HTTPException(
                status_code=400,
                detail="Status is required",
            )

        result = candidates_collection.update_one(
            {"_id": ObjectId(candidate_id)},
            {
                "$set": {
                    "status": status_value,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found",
            )

        return {
            "success": True,
            "message": f"Status updated to {status_value}",
        }

    except Exception as e:

        logger.exception(f"Update status failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to update status",
        )
