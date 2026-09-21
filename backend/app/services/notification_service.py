import logging
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    org_id: str,
    notif_type: str,
    title: str,
    message: str,
    link_url: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Notification:
    """Create and persist a notification in PostgreSQL."""
    notification = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        organization_id=org_id,
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        is_read=False,
        link_url=link_url,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    logger.info("Notification created [%s] for org %s: %s", notif_type, org_id, title)
    return notification


def dispatch_new_lead(
    db: Session,
    org_id: str,
    lead_name: str,
    company: str,
    estimated_value: float = 0.0,
    lead_id: Optional[str] = None,
) -> Notification:
    """Trigger notification for New Lead event."""
    val_str = f" (${estimated_value:,.2f})" if estimated_value > 0 else ""
    return create_notification(
        db=db,
        org_id=org_id,
        notif_type="NEW_LEAD",
        title=f"New Lead: {company or lead_name}",
        message=f"{lead_name} from {company or 'Inbound'} added to pipeline{val_str}. Automated qualification initiated.",
        link_url=f"/leads?lead_id={lead_id}" if lead_id else "/leads",
    )


def dispatch_follow_up_due(
    db: Session,
    org_id: str,
    contact_name: str,
    company: str,
    lead_id: Optional[str] = None,
) -> Notification:
    """Trigger notification for Follow-up Due event."""
    return create_notification(
        db=db,
        org_id=org_id,
        notif_type="FOLLOW_UP_DUE",
        title=f"Follow-up Due: {company or contact_name}",
        message=f"Scheduled touchpoint with {contact_name} is now due. Review recommended action and send email template.",
        link_url=f"/leads?lead_id={lead_id}" if lead_id else "/leads",
    )


def dispatch_low_conversion(
    db: Session,
    org_id: str,
    funnel_stage: str = "SMB Qualification",
    current_rate: float = 11.4,
    threshold_rate: float = 15.0,
) -> Notification:
    """Trigger notification for Low Conversion alert."""
    return create_notification(
        db=db,
        org_id=org_id,
        notif_type="LOW_CONVERSION",
        title=f"Low Conversion Alert: {funnel_stage}",
        message=f"Conversion rate fell to {current_rate:.1f}% (threshold: {threshold_rate:.1f}%). Lead drop-off detected in proposal stage.",
        link_url="/analytics",
    )


def dispatch_sales_change(
    db: Session,
    org_id: str,
    change_description: str = "Surge in Enterprise AI Suite closed deals",
    growth_pct: float = 28.5,
    amount: float = 48500.0,
) -> Notification:
    """Trigger notification for Important Sales Change."""
    return create_notification(
        db=db,
        org_id=org_id,
        notif_type="SALES_CHANGE",
        title="Important Sales Velocity Change",
        message=f"{change_description}. Weekly volume shifted by +{growth_pct:.1f}% ($ {amount:,.2f} recorded).",
        link_url="/sales",
    )


def dispatch_invoice_processed(
    db: Session,
    org_id: str,
    invoice_number: str,
    customer_name: str,
    total_amount: float,
    confidence: Optional[float] = None,
    invoice_id: Optional[str] = None,
) -> Notification:
    """Trigger notification for Invoice Processing Completed."""
    conf_str = f" with {confidence:.1f}% OCR confidence" if confidence is not None else ""
    return create_notification(
        db=db,
        org_id=org_id,
        notif_type="INVOICE_PROCESSED",
        title=f"Invoice Processed: {invoice_number}",
        message=f"Document parsed for {customer_name}. Total: ${total_amount:,.2f} extracted{conf_str}.",
        link_url=f"/invoices?invoice_id={invoice_id}" if invoice_id else "/invoices",
    )


def dispatch_automation_failure(
    db: Session,
    org_id: str,
    rule_name: str = "Lead Webhook Ingestion Sync",
    error_reason: str = "External CRM webhook timeout after 3 retry attempts",
) -> Notification:
    """Trigger notification for Automation Failure."""
    return create_notification(
        db=db,
        org_id=org_id,
        notif_type="AUTOMATION_FAILURE",
        title=f"Automation Failure: {rule_name}",
        message=f"Rule execution halted: {error_reason}. Action moved to dead-letter review queue.",
        link_url="/automation",
    )
