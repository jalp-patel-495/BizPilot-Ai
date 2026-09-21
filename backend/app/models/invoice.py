import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    # Core Extracted Fields
    invoice_number = Column(String(100), nullable=False)
    vendor_name = Column(String(255), nullable=True)  # Backward compatible alias for company_name
    company_name = Column(String(255), nullable=False, default="")
    customer_name = Column(String(255), nullable=False, default="")
    invoice_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    gst_number = Column(String(100), nullable=True, default="")
    
    # Financials
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    
    # Line Items & Raw JSON
    items_json = Column(Text, nullable=True)  # JSON array of {description, quantity, unit_price, amount}
    extracted_data = Column(Text, nullable=True)  # Full raw extraction payload
    
    # Processing Metadata
    status = Column(String(50), default="EXTRACTED")  # EXTRACTED, VERIFIED, REJECTED, PAID
    ocr_confidence = Column(Float, default=98.5)
    file_path = Column(String(500), nullable=True)
    file_format = Column(String(20), nullable=True)  # PDF, JPG, PNG
    original_filename = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="invoices")

