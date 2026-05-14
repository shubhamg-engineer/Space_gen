from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.groq_ai import generate_explanation

router = APIRouter()

class ExplanationRequest(BaseModel):
    topic: str
    context: str = ""
    level: str = "general"

class QnARequest(BaseModel):
    question: str
    context: str = ""

@router.post("/explain")
def explain_topic(req: ExplanationRequest):
    """Generate an AI explanation using Groq."""
    result = generate_explanation(topic=req.topic, context=req.context, level=req.level)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate explanation")
    return result


@router.post("/ask")
def ask_question(req: QnARequest):
    """Conversational Q&A endpoint using Groq."""
    topic = f"Answer this specific question: {req.question}"
    result = generate_explanation(topic=topic, context=req.context, level="general")
    if not result:
        raise HTTPException(status_code=500, detail="Failed to answer question")
    return result
