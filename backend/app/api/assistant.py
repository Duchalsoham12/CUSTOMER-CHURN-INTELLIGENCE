from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.ai_assistant import SUGGESTED_PROMPTS, execute_natural_language_query

router = APIRouter(prefix="/assistant", tags=["natural language ai assistant"])


class AssistantQueryRequest(BaseModel):
    question: str = Field(description="Natural language question to ask about customer data")
    history: list[dict[str, Any]] | None = None


@router.get("/suggestions", summary="Get suggested natural language starter prompts")
def get_query_suggestions() -> list[dict[str, str]]:
    return SUGGESTED_PROMPTS


@router.post("/query", summary="Ask the AI Assistant a question about customer intelligence data")
def query_ai_assistant(request: AssistantQueryRequest) -> dict[str, Any]:
    return execute_natural_language_query(
        question=request.question,
        history=request.history,
    )
