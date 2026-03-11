from app.config.celery_config import celery_app

# worker file just imports tasks
import app.tasks.chat_task
