import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.db.session import Base


class AutomationLog(Base):
    __tablename__ = "automation_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(36), ForeignKey("automation_rules.id", ondelete="SET NULL"), nullable=True)
    rule_name = Column(String(255), nullable=False)
    trigger_event = Column(String(100), nullable=False)
    target_entity = Column(String(255), nullable=True)  # e.g., "Lead: Sophia Chen"
    status = Column(String(50), default="SUCCESS", index=True)  # SUCCESS, FAILED, PENDING
    latency_ms = Column(Integer, default=120)
    details = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    organization = relationship("Organization")
    rule = relationship("AutomationRule")
