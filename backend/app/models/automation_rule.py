import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import relationship
from app.db.session import Base


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    trigger_event = Column(String(100), nullable=False)  # LEAD_CREATED, FOLLOW_UP_DUE, INACTIVITY_DETECTED, CUSTOM
    condition_expression = Column(String(255), nullable=False, default="Always Run")
    action_type = Column(String(100), nullable=False)  # CLASSIFY_SCORE_PRIORITY_TASK, CREATE_NOTIFICATION, RECOMMEND_FOLLOWUP
    action_description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    execution_count = Column(Integer, default=0)
    hours_saved = Column(String(50), default="0.0h")
    category = Column(String(100), default="Sales AI")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization")
