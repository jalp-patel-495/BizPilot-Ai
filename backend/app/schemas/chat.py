from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class SourceCitation(BaseModel):
    id: str
    title: str
    category: str


class ChatQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Customer question or message")
    conversation_id: Optional[str] = Field(None, description="Optional ID of existing conversation")
    customer_name: Optional[str] = Field("Guest Customer", description="Customer full name")
    customer_email: Optional[str] = Field("guest@example.com", description="Customer email address")


class ChatQueryResponse(BaseModel):
    conversation_id: str
    message: str
    confidence: float
    sources: List[SourceCitation] = []
    handoff_offered: bool = False
    status: str = "ACTIVE"
    created_at: datetime


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    confidence: float
    source_kb_ids: Optional[str] = None
    needs_handoff: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: str
    organization_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    status: str
    subject: Optional[str] = "General Inquiry"
    channel: str = "web_chat"
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ConversationDetailResponse(ConversationResponse):
    messages: List[ChatMessageResponse] = []


class HumanReplyRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Message from human support representative")


class KnowledgeItemCreate(BaseModel):
    category: str = Field(..., description="Category: faq, product, service, company, policy, contact")
    title: str = Field(..., min_length=2, max_length=255)
    content: str = Field(..., min_length=5)
    keywords: Optional[str] = ""
    is_active: Optional[bool] = True


class KnowledgeItemUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
    is_active: Optional[bool] = None


class KnowledgeItemResponse(BaseModel):
    id: str
    organization_id: str
    category: str
    title: str
    content: str
    keywords: Optional[str] = ""
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
