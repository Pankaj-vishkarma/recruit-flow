import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Initialize FastAPI app
app = FastAPI(
    title="Recruit Flow AI System",
    description="Autonomous HR System powered by LangGraph",
    version="1.0.0",
)

# CORS Configuration (Production Safe)
origins = [FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes.chat_routes import router as chat_router
from app.routes.research_routes import router as research_router
from app.routes.schedule_routes import router as schedule_router
from app.routes.onboarding_routes import router as onboarding_router


# Register routes
app.include_router(chat_router)
app.include_router(research_router)
app.include_router(schedule_router)
app.include_router(onboarding_router)


# Health Check (important for Render)
@app.get("/")
def health_check():
    return {"status": "ok", "service": "Recruit Flow Backend"}


# Global Error Handler (Crash Safe)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")

    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": str(exc)},
    )
