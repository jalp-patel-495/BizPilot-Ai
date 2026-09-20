import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_tier = Column(String(50), default="starter", nullable=False)  # free, starter, business, enterprise
    billing_cycle = Column(String(20), default="monthly", nullable=False)  # monthly, annual
    monthly_price = Column(Float, default=49.0, nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, TRIALING, PAST_DUE, CANCELLED
    current_period_start = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    current_period_end = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(days=30))
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization")
