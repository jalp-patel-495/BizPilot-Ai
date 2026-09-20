from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict


class LeadBase(BaseModel):
    contact_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: str
    address: Optional[str] = None
    industry: Optional[str] = "Technology"
    deal_value: float = 0.0
    source: Optional[str] = "Website"
    status: str = "NEW"  # NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CONVERTED, LOST
    follow_up_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    organization_id: Optional[str] = None


class LeadUpdate(BaseModel):
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    deal_value: Optional[float] = None
    source: Optional[str] = None
    status: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    classification: Optional[str] = None
    classification_reason: Optional[str] = None
    ai_score: Optional[float] = None
    ai_summary: Optional[str] = None
    notes: Optional[str] = None


class LeadOut(LeadBase):
    id: str
    organization_id: str
    classification: str = "WARM"  # HOT, WARM, COLD
    classification_reason: Optional[str] = None
    ai_score: float = 75.0
    ai_summary: Optional[str] = None
    sales_priority: Optional[str] = "HIGH_P1"
    recommended_action: Optional[str] = None
    suggested_follow_up_date: Optional[datetime] = None
    ai_follow_up_message: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class LeadConvertRequest(BaseModel):
    tier: Optional[str] = "Enterprise"
    initial_ltv: Optional[float] = None
    notes: Optional[str] = None


class ClassificationRulesConfig(BaseModel):
    rules: Dict[str, Any]
