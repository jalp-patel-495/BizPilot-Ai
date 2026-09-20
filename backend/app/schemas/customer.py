from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class CustomerActivityBase(BaseModel):
    activity_type: str = "NOTE"  # CALL, MEETING, EMAIL, NOTE, STATUS_CHANGE, SALE, CONVERSION
    title: str
    description: Optional[str] = None
    performed_by: Optional[str] = "System"


class CustomerActivityCreate(CustomerActivityBase):
    pass


class CustomerActivityResponse(CustomerActivityBase):
    id: str
    customer_id: str
    organization_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: str
    address: Optional[str] = None
    industry: Optional[str] = "Technology"
    status: Optional[str] = "ACTIVE"  # ACTIVE, INACTIVE, PROSPECT, CHURNED
    tier: Optional[str] = "Enterprise"
    ltv: Optional[float] = 0.0
    total_orders: Optional[int] = 0
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None
    tier: Optional[str] = None
    ltv: Optional[float] = None
    total_orders: Optional[int] = None
    notes: Optional[str] = None


class CustomerResponse(CustomerBase):
    id: str
    organization_id: str
    last_order_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerDetailResponse(CustomerResponse):
    activities: List[CustomerActivityResponse] = []

    model_config = ConfigDict(from_attributes=True)
