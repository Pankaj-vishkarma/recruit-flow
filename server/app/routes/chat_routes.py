from fastapi import APIRouter, Request
from app.graph.langgraph_builder import build_graph

router = APIRouter()

graph = build_graph()


@router.post("/chat/")
async def chat(request: Request):

    body = await request.json()

    message = body.get("message")

    state = {
        "messages": [message],
        "candidate_name": "candidate",
        "candidate_data": {},
        "current_step": "research",
    }

    # async graph execution
    result = await graph.ainvoke(state)

    return result
