import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "recruit_flow")

if not MONGO_URI:
    raise RuntimeError("❌ MONGO_URI is missing in .env configuration")


def create_mongo_client():
    """
    Create and validate MongoDB connection.
    Crash safe for production environments.
    """
    try:
        client = MongoClient(
            MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000
        )

        # Force connection test
        client.admin.command("ping")

        logger.info("✅ MongoDB connection established")

        return client

    except ConnectionFailure as e:
        logger.error("❌ MongoDB connection failed")
        raise RuntimeError("Database connection failed") from e


# Create single global client
client = create_mongo_client()

# Database
db = client[DB_NAME]

# Collections
candidates_collection = db["candidates"]
