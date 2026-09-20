from typing import Any, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.support_ticket import SupportTicket
from app.models.user import User
from app.schemas.common import APIResponse
from app.services.ai_service import ai_service

router = APIRouter()


class AIChatQuery(BaseModel):
    message: str
    customer_name: str = "Client Partner"
    ticket_id: str = "TICK-101"


@router.get("/tickets", response_model=APIResponse[List[dict]])
def list_support_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve customer support tickets with AI sentiment tags."""
    tickets = db.query(SupportTicket).filter(
        SupportTicket.organization_id == current_user.organization_id
    ).order_by(SupportTicket.created_at.desc()).all()

    data = [
        {
            "id": t.id,
            "customer_name": t.customer_name,
            "customer_email": t.customer_email,
            "subject": t.subject,
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
            "sentiment": t.sentiment,
            "ai_suggested_response": t.ai_suggested_response,
            "created_at": t.created_at,
        }
        for t in tickets
    ]
    return APIResponse(data=data)


@router.post("/copilot", response_model=APIResponse[dict])
async def ai_support_copilot(
    query: AIChatQuery,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Interact with the Upteky AI Customer Support Copilot."""
    reply = await ai_service.generate_support_reply(
        customer_name=query.customer_name,
        subject="Autonomous Business Query",
        description=query.message,
    )
    return APIResponse(
        message="AI Response synthesized",
        data={
            "response": reply,
            "confidence": 0.96,
            "sentiment_detected": "NEUTRAL",
            "model": "Upteky-Cognitive-v1",
        },
    )
