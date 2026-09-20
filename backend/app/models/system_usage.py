import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class SystemUsage(Base):
    __tablename__ = "system_usage"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    period_month = Column(String(20), nullable=False, index=True)  # e.g. "2026-09"
    api_requests_count = Column(Integer, default=0, nullable=False)
    ai_requests_count = Column(Integer, default=0, nullable=False)
    ai_tokens_count = Column(BigInteger, default=0, nullable=False)
    ocr_documents_count = Column(Integer, default=0, nullable=False)
    storage_bytes = Column(BigInteger, default=0, nullable=False)
    last_activity_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization")
