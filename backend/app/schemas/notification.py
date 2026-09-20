from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict


NotificationType = Literal[
    "NEW_LEAD",
    "FOLLOW_UP_DUE",
    "LOW_CONVERSION",
    "SALES_CHANGE",
    "INVOICE_PROCESSED",
    "AUTOMATION_FAILURE",
]


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "NEW_LEAD"
    link_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    organization_id: str
    user_id: Optional[str] = None


class NotificationResponse(NotificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    organization_id: str
    user_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime


class NotificationUnreadCountResponse(BaseModel):
    unread_count: int


class TriggerTestNotificationRequest(BaseModel):
    type: NotificationType
    title: Optional[str] = None
    message: Optional[str] = None
    link_url: Optional[str] = None
