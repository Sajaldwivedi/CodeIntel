import logging

from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest, ChatResponse
from services.rag_service import answer_question

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    try:
        result = answer_question(payload.question)
        return ChatResponse(answer=result["answer"], sources=result["sources"])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        logger.exception("Chat request failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
