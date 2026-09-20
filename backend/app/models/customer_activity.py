import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class CustomerActivity(Base):
    __tablename__ = "customer_activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

    activity_type = Column(String(50), default="NOTE")  # CALL, MEETING, EMAIL, NOTE, STATUS_CHANGE, SALE, CONVERSION
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    performed_by = Column(String(255), default="System")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    customer = relationship("Customer", back_populates="activities")
