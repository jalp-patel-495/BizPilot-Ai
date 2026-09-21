from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.api.deps import get_db, get_current_user, require_roles
from app.core.rbac import UserRole
from app.models.user import User
from app.models.notification import Notification
from app.schemas.common import APIResponse
from app.schemas.notification import (
    NotificationResponse,
    NotificationUnreadCountResponse,
    TriggerTestNotificationRequest,
)
from app.services import notification_service

router = APIRouter()


@router.get("", response_model=APIResponse[List[NotificationResponse]])
def get_notifications(
    is_read: Optional[bool] = Query(None, description="Filter by read/unread status"),
    type: Optional[str] = Query(None, description="Filter by notification category"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve notifications feed with optional read/unread and type filtering."""
    query = db.query(Notification).filter(Notification.organization_id == current_user.organization_id)
    if current_user.role == UserRole.EMPLOYEE.value:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id.is_(None)))
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    if type:
        query = query.filter(Notification.type == type)

    notifications = query.order_by(desc(Notification.created_at)).limit(limit).all()
    return APIResponse(data=[NotificationResponse.model_validate(n) for n in notifications])


@router.get("/unread-count", response_model=APIResponse[NotificationUnreadCountResponse])
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get the count of unread notifications for badge indicator."""
    query = db.query(Notification).filter(
        Notification.organization_id == current_user.organization_id,
        Notification.is_read == False,
    )
    if current_user.role == UserRole.EMPLOYEE.value:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id.is_(None)))
    count = query.count()
    return APIResponse(data=NotificationUnreadCountResponse(unread_count=count))


@router.put("/mark-all-read", response_model=APIResponse[dict])
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Mark all unread notifications as read for the user's organization."""
    query = db.query(Notification).filter(
        Notification.organization_id == current_user.organization_id,
        Notification.is_read == False,
    )
    if current_user.role == UserRole.EMPLOYEE.value:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id.is_(None)))
    updated = query.update({"is_read": True}, synchronize_session=False)
    db.commit()
    return APIResponse(message=f"Marked {updated} notifications as read", data={"updated_count": updated})


@router.put("/{notification_id}/read", response_model=APIResponse[NotificationResponse])
def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Mark an individual notification as read."""
    query = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.organization_id == current_user.organization_id,
    )
    if current_user.role == UserRole.EMPLOYEE.value:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id.is_(None)))
    notification = query.first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return APIResponse(message="Notification marked as read", data=NotificationResponse.model_validate(notification))


@router.delete("/{notification_id}", response_model=APIResponse[dict])
def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Dismiss/delete an individual notification."""
    query = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.organization_id == current_user.organization_id,
    )
    if current_user.role == UserRole.EMPLOYEE.value:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id.is_(None)))
    notification = query.first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return APIResponse(message="Notification deleted successfully")


@router.post("/trigger-test", response_model=APIResponse[NotificationResponse], status_code=status.HTTP_201_CREATED)
def trigger_test_notification(
    payload: TriggerTestNotificationRequest,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Trigger one of the 6 notification events for testing and simulation."""
    org_id = current_user.organization_id

    if payload.type == "NEW_LEAD":
        notif = notification_service.dispatch_new_lead(
            db=db,
            org_id=org_id,
            lead_name="Summit Health Partners",
            company="Summit Health",
            estimated_value=38500.0,
        )
    elif payload.type == "FOLLOW_UP_DUE":
        notif = notification_service.dispatch_follow_up_due(
            db=db,
            org_id=org_id,
            contact_name="David Ross",
            company="NexusTech Cloud",
        )
    elif payload.type == "LOW_CONVERSION":
        notif = notification_service.dispatch_low_conversion(
            db=db,
            org_id=org_id,
            funnel_stage="Mid-Market Proposal Stage",
            current_rate=12.2,
            threshold_rate=16.0,
        )
    elif payload.type == "SALES_CHANGE":
        notif = notification_service.dispatch_sales_change(
            db=db,
            org_id=org_id,
            change_description="Enterprise AI Suite volume spike (+32.4%)",
            growth_pct=32.4,
            amount=54800.0,
        )
    elif payload.type == "INVOICE_PROCESSED":
        notif = notification_service.dispatch_invoice_processed(
            db=db,
            org_id=org_id,
            invoice_number="INV-2024-089",
            customer_name="Vanguard Logistics",
            total_amount=6420.00,
        )
    elif payload.type == "AUTOMATION_FAILURE":
        notif = notification_service.dispatch_automation_failure(
            db=db,
            org_id=org_id,
            rule_name="Salesforce Lead Sync Rule",
            error_reason="OAuth token expired during sync dispatch",
        )
    else:
        # Custom fallback
        notif = notification_service.create_notification(
            db=db,
            org_id=org_id,
            notif_type=payload.type,
            title=payload.title or f"Notification: {payload.type}",
            message=payload.message or "Event triggered in system.",
            link_url=payload.link_url or "/dashboard",
        )

    return APIResponse(message=f"Dispatched {payload.type} notification", data=NotificationResponse.model_validate(notif))
