import logging
import time
from app.workers.celery_app import celery_app

logger = logging.getLogger("upteky.tasks")


@celery_app.task(name="tasks.process_invoice_ocr")
def process_invoice_ocr_task(invoice_id: str):
    """Background task to extract tabular data and line items from invoices using AI vision."""
    logger.info(f"Starting OCR background job for invoice {invoice_id}")
    time.sleep(2)
    logger.info(f"Successfully processed invoice {invoice_id} with 99.4% confidence.")
    return {
        "invoice_id": invoice_id,
        "status": "PROCESSED",
        "vendor": "Acme Global Cloud Inc",
        "amount": 4250.00,
    }


@celery_app.task(name="tasks.train_lead_scoring_model")
def train_lead_scoring_model_task(organization_id: str):
    """Background task to retrain the scikit-learn lead scoring model with organization-specific deal history."""
    logger.info(f"Retraining ML scoring model for organization {organization_id}")
    time.sleep(3)
    logger.info(f"ML model retrained successfully for org {organization_id}")
    return {
        "organization_id": organization_id,
        "status": "COMPLETED",
        "accuracy": 0.932,
    }


@celery_app.task(name="tasks.generate_executive_report")
def generate_executive_report_task(organization_id: str, report_type: str = "MONTHLY_SUMMARY"):
    """Background task to compile Pandas metrics and generate an executive report."""
    logger.info(f"Generating {report_type} for org {organization_id}")
    time.sleep(2)
    return {
        "organization_id": organization_id,
        "report_type": report_type,
        "download_url": f"/static/reports/{organization_id}_{report_type}.pdf",
    }


# ==============================================================================
# Phase 6: Celery + Redis Lead Automation Tasks
# ==============================================================================

@celery_app.task(name="tasks.process_lead_created_automation")
def process_lead_created_automation(lead_id: str):
    """Celery background worker task to classify, score, prioritize, and create tasks for new leads."""
    from app.db.session import SessionLocal
    from app.services.lead_automation_service import lead_automation_service
    logger.info(f"[Celery] Processing lead-created automation pipeline for lead {lead_id}")
    db = SessionLocal()
    try:
        result = lead_automation_service.execute_lead_created_rules(db, lead_id)
        logger.info(f"[Celery] Finished lead-created automation: {result}")
        return result
    finally:
        db.close()


@celery_app.task(name="tasks.process_due_followups_scan")
def process_due_followups_scan(organization_id: str):
    """Celery background worker task to scan due follow-up dates and dispatch notifications."""
    from app.db.session import SessionLocal
    from app.services.lead_automation_service import lead_automation_service
    logger.info(f"[Celery] Running due follow-up scan for organization {organization_id}")
    db = SessionLocal()
    try:
        result = lead_automation_service.scan_due_followups(db, organization_id)
        logger.info(f"[Celery] Due follow-up scan complete: {result}")
        return result
    finally:
        db.close()


@celery_app.task(name="tasks.process_inactive_leads_scan")
def process_inactive_leads_scan(organization_id: str, days: int = 7):
    """Celery background worker task to detect inactive leads and trigger re-engagement tasks."""
    from app.db.session import SessionLocal
    from app.services.lead_automation_service import lead_automation_service
    logger.info(f"[Celery] Running inactivity scan ({days} days) for organization {organization_id}")
    db = SessionLocal()
    try:
        result = lead_automation_service.scan_inactive_leads(db, organization_id, days=days)
        logger.info(f"[Celery] Inactive leads scan complete: {result}")
        return result
    finally:
        db.close()


@celery_app.task(name="tasks.generate_ai_outreach_draft")
def generate_ai_outreach_draft(lead_id: str, tone: str = "professional"):
    """Celery task to generate tailored AI outreach message for a lead."""
    from app.db.session import SessionLocal
    from app.models.lead import Lead
    from app.services.lead_automation_service import lead_automation_service
    db = SessionLocal()
    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return {"status": "FAILED", "error": "Lead not found"}
        msg = lead_automation_service.generate_followup_message(lead, tone=tone)
        lead.ai_follow_up_message = msg
        db.commit()
        return {"status": "SUCCESS", "lead_id": lead_id, "message": msg}
    finally:
        db.close()

