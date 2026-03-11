from app.config.celery_config import celery_app
from app.graph.langgraph_builder import build_graph

graph = build_graph()


@celery_app.task
def run_chat_workflow(state):

    result = graph.invoke(state)

    return result
