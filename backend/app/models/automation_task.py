import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class AutomationTask(Base):
    __tablename__ = "automation_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(50), default="HIGH_P1")  # URGENT_P0, HIGH_P1, MEDIUM_P2, LOW_P3
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="PENDING", index=True)  # PENDING, COMPLETED, CANCELLED
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("Organization")
    lead = relationship("Lead", back_populates="tasks")
    assignee = relationship("User")
