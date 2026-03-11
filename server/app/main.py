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


# -----------------------------
# Register routes
# -----------------------------
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(research_router)
app.include_router(schedule_router)
app.include_router(onboarding_router)
app.include_router(dashboard_router)

logger.info("All API routes registered successfully")


# -----------------------------
# Startup Event (debug + production logging)
# -----------------------------
@app.on_event("startup")
async def startup_event():

    logger.info("Recruit Flow backend starting...")

    logger.info("Registered routes:")

    for route in app.routes:
        logger.info(f"{route.path} -> {route.methods}")


# -----------------------------
# Health Check (important for Render)
# -----------------------------
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Recruit Flow Backend",
        "version": "1.0.0",
    }


# -----------------------------
# Global Error Handler
# -----------------------------
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
