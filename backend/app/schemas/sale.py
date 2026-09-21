from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


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

    model_config = ConfigDict(from_attributes=True)

