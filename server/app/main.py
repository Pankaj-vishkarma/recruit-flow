import asyncio
import sys
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.routes.dashboard_routes import router as dashboard_router


# --------------------------------------------------
# Windows asyncio fix for Playwright subprocess
# --------------------------------------------------
if sys.platform.startswith("win"):
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception as e:
        from app.utils.logger import get_logger

        logger = get_logger()
        logger.warning(f"Event loop policy already set: {e}")


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()


# -----------------------------
# Logging setup
# -----------------------------
from app.utils.logger import get_logger

logger = get_logger()


# -----------------------------
# Environment config
# -----------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

logger.info(f"Frontend URL allowed for CORS: {FRONTEND_URL}")


# -----------------------------
# Initialize FastAPI app
# -----------------------------
app = FastAPI(
    title="Recruit Flow AI System",
    description="Autonomous HR System powered by LangGraph",
    version="1.0.0",
)


# -----------------------------
# Request logging middleware
# -----------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):

    logger.info(f"Incoming request: {request.method} {request.url}")

    response = await call_next(request)

    logger.info(
        f"Completed request: {request.method} {request.url} -> {response.status_code}"
    )

    return response


# -----------------------------
# Rate Limiter Setup
# -----------------------------
limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SlowAPIMiddleware)


# -----------------------------
# CORS Configuration
# -----------------------------
origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Import routes
# -----------------------------
from app.routes.auth_routes import router as auth_router
from app.routes.chat_routes import router as chat_router
from app.routes.research_routes import router as research_router
from app.routes.schedule_routes import router as schedule_router
from app.routes.onboarding_routes import router as onboarding_router
from app.routes.candidate_routes import router as candidate_router


# -----------------------------
# Register routes
# -----------------------------
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(research_router)
app.include_router(schedule_router)
app.include_router(onboarding_router)
app.include_router(dashboard_router)
app.include_router(candidate_router)

logger.info("All API routes registered successfully")


# --------------------------------------------------
# Background startup tasks (Production safe)
# --------------------------------------------------
async def background_startup_tasks():

    try:

        # Lazy import to avoid blocking startup
        from app.config.database import initialize_indexes

        initialize_indexes()

        logger.info("Database indexes initialized successfully")

    except Exception as e:

        logger.error(f"Index initialization failed: {e}")


# -----------------------------
# Startup Event
# -----------------------------
@app.on_event("startup")
async def startup_event():

    logger.info("Recruit Flow backend starting...")

    # Run heavy startup tasks in background
    asyncio.create_task(background_startup_tasks())

    logger.info("Registered routes:")

    for route in app.routes:
        logger.info(f"{route.path} -> {route.methods}")


# -----------------------------
# Health Check (for load balancers / Render)
# -----------------------------
@app.get("/health")
def health_check():

    return {
        "status": "ok",
        "service": "Recruit Flow Backend",
        "version": "1.0.0",
    }


# -----------------------------
# Readiness Check (DB ping)
# -----------------------------
@app.get("/ready")
def readiness_check():

    try:

        from app.config.database import db

        db.command("ping")

        return {"status": "ready", "database": "connected"}

    except Exception as e:

        logger.error(f"Database readiness check failed: {e}")

        return JSONResponse(
            status_code=503, content={"status": "not_ready", "database": "disconnected"}
        )


# ==================================================
# TEST ROUTES (FOR DEBUGGING - REMOVE LATER)
# ==================================================


@app.get("/")
def root():

    return {
        "status": "ok",
        "service": "Recruit Flow Backend",
        "version": "1.0.0",
    }


@app.get("/test")
def test_route():

    return {"status": "success", "message": "Backend test route working"}


@app.get("/test-async")
async def async_test():

    await asyncio.sleep(0.1)

    return {"status": "success", "message": "Async route working"}


@app.get("/debug/env")
def debug_env():

    return {
        "frontend_url": FRONTEND_URL,
        "python_version": sys.version,
        "working_directory": os.getcwd(),
    }


# ==================================================
# Global Error Handler
# ==================================================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    logger.exception(f"Unhandled error: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc),
        },
    )
