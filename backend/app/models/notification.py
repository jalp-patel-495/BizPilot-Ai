import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    # Supported types: NEW_LEAD, FOLLOW_UP_DUE, LOW_CONVERSION, SALES_CHANGE, INVOICE_PROCESSED, AUTOMATION_FAILURE
    type = Column(String(50), default="NEW_LEAD", index=True)
    is_read = Column(Boolean, default=False, index=True)
    link_url = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    organization = relationship("Organization")
    user = relationship("User")
