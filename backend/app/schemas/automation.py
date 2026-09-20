from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class AutomationRuleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    trigger_event: str = Field(..., description="LEAD_CREATED, FOLLOW_UP_DUE, INACTIVITY_DETECTED, CUSTOM")
    condition_expression: Optional[str] = "Always Run"
    action_type: str = Field(..., description="Action to execute")
    action_description: Optional[str] = None
    category: Optional[str] = "Sales AI"


class AutomationRuleResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    trigger_event: str
    condition_expression: str
    action_type: str
    action_description: Optional[str] = None
    is_active: bool
    execution_count: int
    hours_saved: str
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AutomationTaskResponse(BaseModel):
    id: str
    organization_id: str
    lead_id: Optional[str] = None
    lead_company: Optional[str] = None
    lead_contact: Optional[str] = None
    title: str
    description: Optional[str] = None
    priority: str
    due_date: Optional[datetime] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AutomationLogResponse(BaseModel):
    id: str
    organization_id: str
    rule_name: str
    trigger_event: str
    target_entity: Optional[str] = None
    status: str
    latency_ms: int
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    message: str
    type: str
    is_read: bool
    link_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AutomationDashboardMetrics(BaseModel):
    active_automations: int
    completed_automations: int
    failed_automations: int
    pending_tasks_count: int
    total_executions: int
    estimated_hours_saved: str
    execution_accuracy: float
    rules: List[AutomationRuleResponse] = []
    recent_tasks: List[AutomationTaskResponse] = []
    recent_logs: List[AutomationLogResponse] = []


class LeadAIAnalysisResponse(BaseModel):
    lead_id: str
    lead_score: float
    lead_category: str
    reason_for_score: str
    recommended_next_action: str
    suggested_follow_up_date: datetime
    sales_priority: str
    ai_summary: str
    suggested_follow_up_message: Optional[str] = None


class GenerateMessageRequest(BaseModel):
    tone: Optional[str] = Field("professional", description="Tone: professional, urgent, consultative, concise")
