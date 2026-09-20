import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(150), nullable=False, default="Guest Customer")
    customer_email = Column(String(150), nullable=False, default="guest@example.com")
    customer_phone = Column(String(50), nullable=True)
    status = Column(String(50), default="ACTIVE", index=True)  # ACTIVE, HANDOFF_REQUESTED, RESOLVED, CLOSED
    subject = Column(String(255), nullable=True, default="General Inquiry")
    channel = Column(String(50), default="web_chat")
    assigned_agent_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id])
