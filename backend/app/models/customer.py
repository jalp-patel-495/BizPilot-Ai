import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True, default="")
    industry = Column(String(100), default="Technology")
    status = Column(String(50), default="ACTIVE")  # ACTIVE, INACTIVE, PROSPECT, CHURNED
    tier = Column(String(50), default="Enterprise")
    ltv = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    last_order_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    sales = relationship("Sale", back_populates="customer", cascade="all, delete-orphan")
    activities = relationship(
        "CustomerActivity",
        back_populates="customer",
        cascade="all, delete-orphan",
        order_by="desc(CustomerActivity.created_at)",
    )
