import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "recruit_flow")

if not MONGO_URI:
    raise RuntimeError("❌ MONGO_URI is missing in .env configuration")


# --------------------------------------------------
# MongoDB Client Factory
# --------------------------------------------------
def create_mongo_client(retries: int = 3) -> MongoClient:
    """
    Create MongoDB connection with retry logic.
    Production safe configuration.
    """

    for attempt in range(retries):

        try:

            client = MongoClient(
                MONGO_URI,
                # Connection tuning
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                # Pool tuning
                maxPoolSize=50,
                minPoolSize=5,
                # Prevent idle disconnections
                retryWrites=True,
                retryReads=True,
            )

            # Force connection test
            client.admin.command("ping")

            logger.info("✅ MongoDB connection established")

            return client

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:

            logger.warning(f"MongoDB connection attempt {attempt + 1} failed: {e}")

            if attempt == retries - 1:

                logger.error("❌ MongoDB connection failed after retries")

                raise RuntimeError("Database connection failed") from e


# --------------------------------------------------
# Create single global client
# --------------------------------------------------
client = create_mongo_client()

# --------------------------------------------------
# Database
# --------------------------------------------------
db = client[DB_NAME]

# --------------------------------------------------
# Collections
# --------------------------------------------------
candidates_collection = db["candidates"]


# --------------------------------------------------
# Create indexes for performance
# --------------------------------------------------
def initialize_indexes():
    """
    Create required database indexes.
    Improves dashboard queries and search performance.
    """

    try:

        candidates_collection.create_index("name", unique=True)

        candidates_collection.create_index("skills")

        candidates_collection.create_index("scheduled_time")

        candidates_collection.create_index("status")

        # --------------------------------------------------
        # STEP 9 PERFORMANCE INDEXES
        # --------------------------------------------------

        # Faster onboarding status queries
        candidates_collection.create_index("onboarding_complete")

        # Compound index for HR dashboard filtering
        candidates_collection.create_index([("status", 1), ("scheduled_time", 1)])

        logger.info("✅ MongoDB indexes initialized")

    except Exception as e:

        logger.warning(f"Index initialization failed: {e}")


# Initialize indexes on startup
initialize_indexes()


# --------------------------------------------------
# Health Check Utility
# --------------------------------------------------
def check_database_health() -> bool:
    """
    Used by health endpoint to verify DB connectivity.
    """

    try:

        client.admin.command("ping")

        return True

    except Exception as e:

        logger.error(f"Database health check failed: {e}")

        return False
