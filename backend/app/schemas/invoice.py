from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class InvoiceItem(BaseModel):
    description: str = Field(..., description="Item or service description")
    quantity: float = Field(1.0, description="Item quantity or hours")
    unit_price: float = Field(0.0, description="Unit price per item")
    amount: float = Field(0.0, description="Total amount for item")

    model_config = ConfigDict(from_attributes=True)


class InvoiceBase(BaseModel):
    invoice_number: str
    company_name: str
    customer_name: str
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    gst_number: Optional[str] = ""
    subtotal: float = 0.0
    tax_amount: float = 0.0
    total_amount: float = 0.0
    currency: str = "INR"
    items: List[InvoiceItem] = []


class InvoiceCreate(InvoiceBase):
    file_format: Optional[str] = "PDF"
    original_filename: Optional[str] = None
    ocr_confidence: Optional[float] = 98.5


class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    gst_number: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    items: Optional[List[InvoiceItem]] = None
    status: Optional[str] = None


class InvoiceResponse(InvoiceBase):
    id: str
    organization_id: str
    status: str
    ocr_confidence: float
    file_path: Optional[str] = None
    file_format: Optional[str] = None
    original_filename: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvoiceStatsResponse(BaseModel):
    total_invoices: int
    total_amount_processed: float
    verified_count: int
    pending_count: int
    average_confidence: float
    verification_rate: float
