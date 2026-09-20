from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from app.schemas.organization import OrganizationOut
from app.schemas.user import UserOut
from app.schemas.plan import PlanOut
from app.schemas.subscription import SubscriptionOut, UsageSummary


class AdminDashboardMetrics(BaseModel):
    mrr: float
    mrr_growth: float
    active_businesses: int
    total_users: int
    monthly_api_requests: int
    monthly_ai_requests: int
    total_ai_tokens: int
    system_uptime: str
    plan_distribution: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]
    system_health: Dict[str, Any]


class BusinessDetailOut(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    users_count: int = 0
    leads_count: int = 0
    invoices_count: int = 0
    subscription_status: str = "ACTIVE"
    subscription_cycle: str = "monthly"
    monthly_price: float = 0.0
    current_month_api_requests: int = 0
    current_month_ai_requests: int = 0

    model_config = ConfigDict(from_attributes=True)


class BusinessCreate(BaseModel):
    name: str
    slug: str
    plan_tier: str = "starter"  # free, starter, business, enterprise
    billing_cycle: str = "monthly"
    admin_email: EmailStr
    admin_name: str
    admin_password: str = "Admin@12345"


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class UserAdminOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    title: str
    is_active: bool
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None
    organization_id: Optional[str] = None


class UserAdminCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    title: Optional[str] = "Specialist"
    organization_id: Optional[str] = None


class PasswordResetAdmin(BaseModel):
    new_password: str


class ApiUsageMetrics(BaseModel):
    period_month: str
    total_requests: int
    requests_per_minute: float
    avg_latency_ms: float
    status_distribution: Dict[str, int]  # "2xx": count, "4xx": count, "5xx": count
    top_endpoints: List[Dict[str, Any]]
    daily_trends: List[Dict[str, Any]]
    tenant_breakdown: List[Dict[str, Any]]


class AiUsageMetrics(BaseModel):
    period_month: str
    total_requests: int
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost_usd: float
    feature_distribution: List[Dict[str, Any]]  # Chatbot, Lead Scoring, Reports AI, Forecasting
    model_distribution: List[Dict[str, Any]]  # Mock, Gemini 1.5, GPT-4o
    daily_trends: List[Dict[str, Any]]
    tenant_breakdown: List[Dict[str, Any]]


class TenantSystemUsageRow(BaseModel):
    organization_id: str
    organization_name: str
    plan_tier: str
    api_requests: int
    api_limit: int
    api_percent: float
    ai_requests: int
    ai_limit: int
    ai_percent: float
    ai_tokens: int
    users_count: int
    users_limit: int
    storage_mb: float
    last_activity: Optional[datetime] = None


class SystemUsageMetrics(BaseModel):
    period_month: str
    total_storage_gb: float
    total_tenants: int
    active_tenants: int
    total_users: int
    total_api_requests: int
    total_ai_requests: int
    total_ai_tokens: int
    server_metrics: Dict[str, Any]
    tenants: List[TenantSystemUsageRow]


class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    action: str
    resource: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
