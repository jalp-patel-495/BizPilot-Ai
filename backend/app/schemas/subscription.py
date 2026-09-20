from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.plan import PlanOut


class SubscriptionBase(BaseModel):
    organization_id: str
    plan_tier: str = "starter"  # free, starter, business, enterprise
    billing_cycle: str = "monthly"  # monthly, annual
    monthly_price: float = 49.0
    status: str = "ACTIVE"  # ACTIVE, TRIALING, PAST_DUE, CANCELLED
    auto_renew: bool = True


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    plan_tier: Optional[str] = None
    billing_cycle: Optional[str] = None
    monthly_price: Optional[float] = None
    status: Optional[str] = None
    auto_renew: Optional[bool] = None


class SubscriptionOut(SubscriptionBase):
    id: str
    current_period_start: datetime
    current_period_end: datetime
    created_at: datetime
    updated_at: datetime
    organization_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UsageMeter(BaseModel):
    current: int
    limit: int
    percent: float
    is_unlimited: bool = False
    warning: bool = False
    exceeded: bool = False


class UsageSummary(BaseModel):
    period_month: str
    users: UsageMeter
    ai_requests: UsageMeter
    api_requests: UsageMeter
    ai_tokens: int
    storage_mb: float
    plan_name: str
    plan_tier: str
    features: List[str]


class CurrentSubscriptionResponse(BaseModel):
    subscription: Optional[SubscriptionOut] = None
    plan: PlanOut
    usage: UsageSummary
