from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    sku: str
    category: Optional[str] = "Software"
    price: float
    cost: Optional[float] = 0.0
    status: Optional[str] = "ACTIVE"
    description: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    units_sold: Optional[int] = None
    revenue: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    organization_id: str
    units_sold: int
    revenue: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
