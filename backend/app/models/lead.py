import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    contact_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True, default="")
    industry = Column(String(100), default="Technology")
    deal_value = Column(Float, default=0.0)
    source = Column(String(100), default="Website")  # Website, Referral, LinkedIn, Cold Outreach, Trade Show, Inbound Demo
    status = Column(String(50), default="NEW")  # NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CONVERTED, LOST
    follow_up_date = Column(DateTime, nullable=True)
    classification = Column(String(50), default="WARM")  # HOT, WARM, COLD
    classification_reason = Column(String(255), nullable=True)
    ai_score = Column(Float, default=75.0)  # Machine learning predicted score (0-100)
    ai_summary = Column(Text, nullable=True)
    sales_priority = Column(String(50), default="HIGH_P1")  # URGENT_P0, HIGH_P1, MEDIUM_P2, LOW_P3
    recommended_action = Column(Text, nullable=True)
    suggested_follow_up_date = Column(DateTime, nullable=True)
    ai_follow_up_message = Column(Text, nullable=True)
    last_activity_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="leads")
    assignee = relationship("User", back_populates="assigned_leads")
    tasks = relationship("AutomationTask", back_populates="lead", cascade="all, delete-orphan")

