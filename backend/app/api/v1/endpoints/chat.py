import json
import logging
from typing import List, Optional, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.api.deps import get_db, get_current_user_optional, get_current_user
from app.models.conversation import Conversation
from app.models.chat_message import ChatMessage
from app.models.knowledge_item import KnowledgeItem
from app.models.user import User
from app.models.organization import Organization
from app.schemas.common import APIResponse
from app.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    ConversationResponse,
    ConversationDetailResponse,
    ChatMessageResponse,
    HumanReplyRequest,
    KnowledgeItemCreate,
    KnowledgeItemUpdate,
    KnowledgeItemResponse,
    SourceCitation,
)
from app.services.knowledge_service import knowledge_service

logger = logging.getLogger("upteky.chat_api")

router = APIRouter()


def get_default_organization_id(db: Session) -> str:
    """Helper to get default active organization ID for public chatbot interactions."""
    org = db.query(Organization).first()
    if org:
        return org.id
    return "default-org-id"


# ==============================================================================
# 1. Core Chatbot Interaction Endpoint (POST /api/chat & POST /api/v1/chat)
# ==============================================================================

@router.post("/chat", response_model=ChatQueryResponse, status_code=status.HTTP_200_OK)
def handle_chat_message(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """
    Public and authenticated customer chat query endpoint.
    Retrieves or starts a conversation, queries business knowledge base,
    and returns a grounded AI response with confidence scoring and citations.
    """
    org_id = current_user.organization_id if current_user else get_default_organization_id(db)

    # Check and increment AI subscription quota
    from app.services.usage_service import usage_service
    usage_service.check_and_increment_ai_usage(db, org_id, tokens=120)

    # 1. Retrieve or Create Conversation
    conversation = None
    if payload.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == payload.conversation_id).first()

    if not conversation:
        subject_preview = payload.message[:60] + ("..." if len(payload.message) > 60 else "")
        conversation = Conversation(
            organization_id=org_id,
            customer_name=payload.customer_name or "Guest Customer",
            customer_email=payload.customer_email or "guest@example.com",
            subject=subject_preview,
            status="ACTIVE",
            channel="web_chat",
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Record User Message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        sender="user",
        content=payload.message,
        confidence=1.0,
    )
    db.add(user_msg)
    db.commit()

    # 3. Generate Grounded AI Response
    ai_result = knowledge_service.answer_query(db, org_id, payload.message)

    # Update conversation status if handoff is triggered
    if ai_result.get("status") == "HANDOFF_REQUESTED":
        conversation.status = "HANDOFF_REQUESTED"

    conversation.updated_at = datetime.now(timezone.utc)

    # 4. Record Assistant Message
    sources_json = json.dumps(ai_result.get("sources", []))
    asst_msg = ChatMessage(
        conversation_id=conversation.id,
        sender="assistant",
        content=ai_result["message"],
        confidence=ai_result["confidence"],
        source_kb_ids=sources_json,
        needs_handoff=ai_result.get("needs_handoff", False),
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    parsed_sources = [
        SourceCitation(id=s["id"], title=s["title"], category=s["category"])
        for s in ai_result.get("sources", [])
    ]

    return ChatQueryResponse(
        conversation_id=conversation.id,
        message=ai_result["message"],
        confidence=ai_result["confidence"],
        sources=parsed_sources,
        handoff_offered=ai_result.get("handoff_offered", False),
        status=conversation.status,
        created_at=asst_msg.created_at,
    )


# ==============================================================================
# 2. Conversation Management & Search (GET /api/conversations)
# ==============================================================================

@router.get("/conversations", response_model=APIResponse[List[ConversationResponse]])
def list_conversations(
    search: Optional[str] = Query(None, description="Search term for customer name, email, subject, or message"),
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, HANDOFF_REQUESTED, RESOLVED, CLOSED"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Retrieve customer support conversations with full-text search and status filtering."""
    org_id = current_user.organization_id if current_user else get_default_organization_id(db)

    query = db.query(Conversation).filter(Conversation.organization_id == org_id)

    if status and status.upper() != "ALL":
        query = query.filter(Conversation.status == status.upper())

    if search:
        search_term = f"%{search.strip()}%"
        # Search conversation fields OR matching message content
        matching_conv_ids = [
            r[0]
            for r in db.query(ChatMessage.conversation_id)
            .filter(ChatMessage.content.ilike(search_term))
            .distinct()
            .all()
        ]

        query = query.filter(
            or_(
                Conversation.customer_name.ilike(search_term),
                Conversation.customer_email.ilike(search_term),
                Conversation.subject.ilike(search_term),
                Conversation.id.in_(matching_conv_ids) if matching_conv_ids else False,
            )
        )


    conversations = query.order_by(desc(Conversation.updated_at)).offset(offset).limit(limit).all()

    result = []
    for conv in conversations:
        # Compute count and last message
        last_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conv.id)
            .order_by(desc(ChatMessage.created_at))
            .first()
        )
        msg_count = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv.id).count()

        result.append(
            ConversationResponse(
                id=conv.id,
                organization_id=conv.organization_id,
                customer_name=conv.customer_name,
                customer_email=conv.customer_email,
                customer_phone=conv.customer_phone,
                status=conv.status,
                subject=conv.subject or "General Inquiry",
                channel=conv.channel,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=msg_count,
                last_message=last_msg.content if last_msg else None,
            )
        )

    return APIResponse(data=result)


@router.get("/conversations/{conversation_id}", response_model=APIResponse[ConversationDetailResponse])
def get_conversation_details(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Retrieve full conversation transcript with all messages in chronological order."""
    org_id = current_user.organization_id if current_user else get_default_organization_id(db)

    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == org_id,
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{conversation_id}' not found.",
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    msg_responses = [
        ChatMessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            content=m.content,
            confidence=m.confidence,
            source_kb_ids=m.source_kb_ids,
            needs_handoff=m.needs_handoff,
            created_at=m.created_at,
        )
        for m in messages
    ]

    detail = ConversationDetailResponse(
        id=conv.id,
        organization_id=conv.organization_id,
        customer_name=conv.customer_name,
        customer_email=conv.customer_email,
        customer_phone=conv.customer_phone,
        status=conv.status,
        subject=conv.subject or "General Inquiry",
        channel=conv.channel,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=len(messages),
        last_message=messages[-1].content if messages else None,
        messages=msg_responses,
    )

    return APIResponse(data=detail)


@router.post("/conversations/{conversation_id}/handoff", response_model=APIResponse[dict])
def request_human_handoff(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Trigger explicit human support handoff for an ongoing conversation."""
    org_id = current_user.organization_id if current_user else get_default_organization_id(db)

    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == org_id,
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{conversation_id}' not found.",
        )

    conv.status = "HANDOFF_REQUESTED"
    conv.updated_at = datetime.now(timezone.utc)

    # Append system log message
    sys_msg = ChatMessage(
        conversation_id=conv.id,
        sender="system",
        content="[System Alert] Customer requested escalation to a human support representative. Queue priority elevated.",
        confidence=1.0,
        needs_handoff=True,
    )
    db.add(sys_msg)
    db.commit()

    return APIResponse(
        message="Human support handoff requested successfully.",
        data={"conversation_id": conv.id, "status": conv.status},
    )


@router.post("/conversations/{conversation_id}/reply", response_model=APIResponse[ChatMessageResponse])
def send_human_agent_reply(
    conversation_id: str,
    payload: HumanReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Allow a support agent to reply directly to a customer conversation."""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == current_user.organization_id,
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{conversation_id}' not found.",
        )

    # Add message
    agent_msg = ChatMessage(
        conversation_id=conv.id,
        sender="human_agent",
        content=payload.message,
        confidence=1.0,
    )
    conv.assigned_agent_id = current_user.id
    conv.status = "ACTIVE"
    conv.updated_at = datetime.now(timezone.utc)

    db.add(agent_msg)
    db.commit()
    db.refresh(agent_msg)

    return APIResponse(
        message="Agent reply posted successfully.",
        data=ChatMessageResponse.model_validate(agent_msg),
    )


@router.post("/conversations/{conversation_id}/resolve", response_model=APIResponse[dict])
def resolve_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Mark a customer support conversation as resolved."""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == current_user.organization_id,
    ).first()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{conversation_id}' not found.",
        )

    conv.status = "RESOLVED"
    conv.updated_at = datetime.now(timezone.utc)

    sys_msg = ChatMessage(
        conversation_id=conv.id,
        sender="system",
        content=f"[Resolution] Ticket resolved by {current_user.full_name} ({current_user.email}).",
        confidence=1.0,
    )
    db.add(sys_msg)
    db.commit()

    return APIResponse(
        message="Conversation marked as resolved.",
        data={"conversation_id": conv.id, "status": conv.status},
    )


# ==============================================================================
# 3. Knowledge Base Management Endpoints
# ==============================================================================

@router.get("/knowledge-base", response_model=APIResponse[List[KnowledgeItemResponse]])
def list_knowledge_items(
    category: Optional[str] = Query(None, description="Filter by category: faq, product, service, company, policy, contact"),
    search: Optional[str] = Query(None, description="Search keyword in title, keywords, or content"),
    is_active: Optional[bool] = Query(None, description="Filter active status"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """List business knowledge base items."""
    org_id = current_user.organization_id if current_user else get_default_organization_id(db)

    query = db.query(KnowledgeItem).filter(KnowledgeItem.organization_id == org_id)

    if category and category.lower() != "all":
        query = query.filter(KnowledgeItem.category == category.lower())

    if is_active is not None:
        query = query.filter(KnowledgeItem.is_active == is_active)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                KnowledgeItem.title.ilike(term),
                KnowledgeItem.content.ilike(term),
                KnowledgeItem.keywords.ilike(term),
            )
        )

    items = query.order_by(KnowledgeItem.category.asc(), KnowledgeItem.title.asc()).all()
    return APIResponse(data=[KnowledgeItemResponse.model_validate(item) for item in items])


@router.post("/knowledge-base", response_model=APIResponse[KnowledgeItemResponse], status_code=status.HTTP_201_CREATED)
def create_knowledge_item(
    payload: KnowledgeItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Add a new business knowledge base article."""
    item = KnowledgeItem(
        organization_id=current_user.organization_id,
        category=payload.category.lower(),
        title=payload.title.strip(),
        content=payload.content.strip(),
        keywords=payload.keywords.strip() if payload.keywords else "",
        is_active=payload.is_active if payload.is_active is not None else True,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return APIResponse(
        message="Knowledge item created successfully.",
        data=KnowledgeItemResponse.model_validate(item),
    )


@router.get("/knowledge-base/{item_id}", response_model=APIResponse[KnowledgeItemResponse])
def get_knowledge_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Retrieve details of a specific knowledge item."""
    org_id = current_user.organization_id if current_user else get_default_organization_id(db)

    item = db.query(KnowledgeItem).filter(
        KnowledgeItem.id == item_id,
        KnowledgeItem.organization_id == org_id,
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge item with ID '{item_id}' not found.",
        )

    return APIResponse(data=KnowledgeItemResponse.model_validate(item))


@router.put("/knowledge-base/{item_id}", response_model=APIResponse[KnowledgeItemResponse])
def update_knowledge_item(
    item_id: str,
    payload: KnowledgeItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update an existing knowledge base article."""
    item = db.query(KnowledgeItem).filter(
        KnowledgeItem.id == item_id,
        KnowledgeItem.organization_id == current_user.organization_id,
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge item with ID '{item_id}' not found.",
        )

    if payload.category is not None:
        item.category = payload.category.lower()
    if payload.title is not None:
        item.title = payload.title.strip()
    if payload.content is not None:
        item.content = payload.content.strip()
    if payload.keywords is not None:
        item.keywords = payload.keywords.strip()
    if payload.is_active is not None:
        item.is_active = payload.is_active

    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)

    return APIResponse(
        message="Knowledge item updated successfully.",
        data=KnowledgeItemResponse.model_validate(item),
    )


@router.delete("/knowledge-base/{item_id}", response_model=APIResponse[dict])
def delete_knowledge_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete a knowledge item."""
    item = db.query(KnowledgeItem).filter(
        KnowledgeItem.id == item_id,
        KnowledgeItem.organization_id == current_user.organization_id,
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge item with ID '{item_id}' not found.",
        )

    db.delete(item)
    db.commit()

    return APIResponse(message=f"Knowledge item '{item.title}' deleted successfully.")
