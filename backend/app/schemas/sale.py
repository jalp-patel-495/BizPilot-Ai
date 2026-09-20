from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class SaleBase(BaseModel):
    order_number: str
    customer_name: str
    customer_id: Optional[str] = None
    product_name: Optional[str] = "Enterprise AI Suite"
    amount: float
    payment_method: Optional[str] = "Stripe / Card"
    status: Optional[str] = "COMPLETED"


class SaleCreate(SaleBase):
    pass


class SaleResponse(SaleBase):
    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
