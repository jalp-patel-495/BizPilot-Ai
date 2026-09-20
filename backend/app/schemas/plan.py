from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PlanBase(BaseModel):
    id: str = Field(..., description="Plan identifier key (e.g. free, starter, business, enterprise)")
    name: str = Field(..., description="Display title for the plan")
    description: Optional[str] = None
    monthly_price: float = 0.0
    annual_price: float = 0.0
    max_users: int = 2
    max_ai_requests: int = 50
    max_api_requests: int = 500
    features: List[str] = []
    is_active: bool = True
    is_popular: bool = False
    badge: Optional[str] = None


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    monthly_price: Optional[float] = None
    annual_price: Optional[float] = None
    max_users: Optional[int] = None
    max_ai_requests: Optional[int] = None
    max_api_requests: Optional[int] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_popular: Optional[bool] = None
    badge: Optional[str] = None


class PlanOut(PlanBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
