import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.models.lead import Lead
from app.models.automation_rule import AutomationRule
from app.models.automation_task import AutomationTask
from app.models.automation_log import AutomationLog
from app.models.notification import Notification
from app.services.lead_classifier import lead_classifier

logger = logging.getLogger("upteky.lead_automation")


class LeadAutomationService:
    """
    Intelligent Lead Automation & Priority Recommendation Engine.
    Executes event-driven business rules, task generation, and follow-up copy synthesis.
    """

    def analyze_and_score_lead(self, lead: Lead) -> Dict[str, Any]:
        """Generate comprehensive 6-function AI analysis for a lead."""
        deal_val = float(lead.deal_value or 0.0)
        industry = lead.industry or "Technology"
        source = lead.source or "Website"
        status = (lead.status or "NEW").upper()

        # 1. Lead Scoring (0-100)
        score_base = 50.0
        if deal_val >= 50000:
            score_base += 30.0
        elif deal_val >= 25000:
            score_base += 20.0
        elif deal_val >= 10000:
            score_base += 10.0

        if industry in ["Technology", "Finance", "Healthcare"]:
            score_base += 8.0

        if source in ["Referral", "Inbound Demo", "Partner"]:
            score_base += 10.0
        elif source == "Cold Outreach":
            score_base -= 5.0

        if status in ["PROPOSAL", "NEGOTIATION"]:
            score_base += 12.0
        elif status == "LOST":
            score_base = 25.0

        score = min(99.0, max(25.0, score_base))

        # 2. Lead Classification (HOT, WARM, COLD)
        clf = lead_classifier.classify_lead(
            deal_value=deal_val,
            status=status,
            source=source,
            ai_score=score,
            follow_up_date=lead.follow_up_date,
        )
        category = clf["classification"]
        reason = clf["reason"]

        # 3. Sales Priority Recommendation
        now = datetime.now(timezone.utc)
        if deal_val >= 30000 or score >= 85 or status in ["PROPOSAL", "NEGOTIATION"]:
            priority = "URGENT_P0"
            suggested_date = now + timedelta(days=1)
            recommended_action = (
                f"Schedule executive architecture review and prepare tailored enterprise ROI proposal within 24h. "
                f"High conversion probability for {industry} vertical."
            )
        elif deal_val >= 15000 or score >= 70 or status in ["QUALIFIED"]:
            priority = "HIGH_P1"
            suggested_date = now + timedelta(days=3)
            recommended_action = (
                f"Deliver tailored product demonstration showcasing Upteky AI document OCR and automated CRM sync. "
                f"Target decision-makers at {lead.company}."
            )
        elif deal_val >= 5000 or score >= 50:
            priority = "MEDIUM_P2"
            suggested_date = now + timedelta(days=7)
            recommended_action = (
                f"Send case study on {industry} process optimization and schedule initial discovery call."
            )
        else:
            priority = "LOW_P3"
            suggested_date = now + timedelta(days=14)
            recommended_action = (
                f"Enroll contact in automated multi-touch nurture sequence and track email engagement."
            )

        # 4. Lead Summary
        summary = (
            f"Opportunity at {lead.company} ({industry}) valued at Rs. {deal_val:,.0f} via {source}. "
            f"Evaluated as {category} with {priority} priority (Score: {score:.1f}/100). {reason}"
        )

        # 5. Follow-up Message Generation
        follow_up_message = self.generate_followup_message(lead, tone="professional")

        return {
            "lead_score": round(score, 1),
            "lead_category": category,
            "reason_for_score": reason,
            "sales_priority": priority,
            "recommended_next_action": recommended_action,
            "suggested_follow_up_date": suggested_date,
            "ai_summary": summary,
            "suggested_follow_up_message": follow_up_message,
        }

    def generate_followup_message(self, lead: Lead, tone: str = "professional") -> str:
        """Synthesize tailored outreach message based on tone and lead attributes."""
        contact = lead.contact_name or "Partner"
        company = lead.company or "your team"
        industry = lead.industry or "business"
        deal_val = float(lead.deal_value or 0.0)

        if tone == "urgent":
            return (
                f"Subject: Priority follow-up: Upteky AI rollout for {company}\n\n"
                f"Hi {contact},\n\n"
                f"I wanted to follow up promptly regarding your workflow automation goals at {company}. "
                f"Given your Q4 operational targets, our engineering team has reserved onboarding bandwidth "
                f"for an expedited 48-hour deployment.\n\n"
                f"Do you have 15 minutes tomorrow to review the finalized implementation timeline?\n\n"
                f"Best regards,\nUpteky AI Enterprise Solutions"
            )
        elif tone == "consultative":
            return (
                f"Subject: Streamlining {industry} operations at {company}\n\n"
                f"Hi {contact},\n\n"
                f"I've been reviewing how {industry} organizations are tackling manual document reconciliation and lead triage. "
                f"Similar teams using Upteky AI have reduced operational processing latency by over 65%.\n\n"
                f"I would love to share a short benchmark report tailored to {company}'s current stack.\n\n"
                f"Would Thursday or Friday work for a brief 20-minute discussion?\n\n"
                f"Warmly,\nUpteky AI Operations Advisory"
            )
        elif tone == "concise":
            return (
                f"Subject: Quick question regarding {company}\n\n"
                f"Hi {contact},\n\n"
                f"Reaching out to see if you had any questions regarding our AI automation platform. "
                f"We can set up a live sandbox for {company} anytime this week.\n\n"
                f"Let me know what works for you.\n\n"
                f"Thanks,\nUpteky AI Team"
            )
        else:  # professional
            return (
                f"Subject: Exploring AI-driven automation for {company}\n\n"
                f"Dear {contact},\n\n"
                f"Thank you for your interest in Upteky AI's intelligent automation platform. "
                f"Based on your requirements in the {industry} sector, we have prepared a customized demonstration "
                f"highlighting automated OCR invoice parsing, predictive CRM intelligence, and 24/7 AI customer support.\n\n"
                f"We would be delighted to coordinate a 30-minute technical walkthrough with your team.\n\n"
                f"Please let us know your preferred availability over the coming days.\n\n"
                f"Sincerely,\nUpteky AI Executive Sales Team"
            )

    def execute_lead_created_rules(self, db: Session, lead_id: str) -> Dict[str, Any]:
        """
        Rule 1: IF lead is created
        → classify lead
        → calculate lead score
        → assign priority
        → create follow-up task.
        """
        start_time = time.time()
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return {"status": "FAILED", "error": "Lead not found"}

        # Run AI analysis
        analysis = self.analyze_and_score_lead(lead)

        # Update lead with analysis outputs
        lead.ai_score = analysis["lead_score"]
        lead.classification = analysis["lead_category"]
        lead.classification_reason = analysis["reason_for_score"]
        lead.sales_priority = analysis["sales_priority"]
        lead.recommended_action = analysis["recommended_next_action"]
        lead.suggested_follow_up_date = analysis["suggested_follow_up_date"]
        lead.ai_summary = analysis["ai_summary"]
        lead.ai_follow_up_message = analysis["suggested_follow_up_message"]
        lead.last_activity_date = datetime.now(timezone.utc)
        if not lead.follow_up_date:
            lead.follow_up_date = analysis["suggested_follow_up_date"]

        # Create Follow-up Task
        task_title = f"Follow-up: {lead.contact_name} ({lead.company})"
        task_desc = f"{analysis['recommended_next_action']} Priority: {analysis['sales_priority']}."
        new_task = AutomationTask(
            organization_id=lead.organization_id,
            lead_id=lead.id,
            title=task_title,
            description=task_desc,
            priority=analysis["sales_priority"],
            due_date=analysis["suggested_follow_up_date"],
            status="PENDING",
            assigned_to=lead.assigned_to,
        )
        db.add(new_task)

        # Dispatch Notification for high-priority leads
        if analysis["sales_priority"] in ["URGENT_P0", "HIGH_P1"]:
            notif = Notification(
                organization_id=lead.organization_id,
                user_id=lead.assigned_to,
                title=f"New {analysis['sales_priority']} Lead Ingested",
                message=f"{lead.company} (Rs. {lead.deal_value:,.0f}) classified as {analysis['lead_category']}. Action: {analysis['recommended_next_action']}",
                type="HIGH_PRIORITY_LEAD",
                link_url="/automation",
            )
            db.add(notif)

        # Increment rule execution count
        rule = db.query(AutomationRule).filter(
            AutomationRule.organization_id == lead.organization_id,
            AutomationRule.trigger_event == "LEAD_CREATED",
        ).first()
        if rule and rule.is_active:
            rule.execution_count += 1
            rule.updated_at = datetime.now(timezone.utc)

        # Log automation execution
        latency = int((time.time() - start_time) * 1000)
        log = AutomationLog(
            organization_id=lead.organization_id,
            rule_id=rule.id if rule else None,
            rule_name="Intelligent Lead Scoring & Sales Priority Task",
            trigger_event="LEAD_CREATED",
            target_entity=f"Lead: {lead.contact_name} ({lead.company})",
            status="SUCCESS",
            latency_ms=max(35, latency),
            details=f"Calculated Score: {analysis['lead_score']}, Priority: {analysis['sales_priority']}, Task Queued.",
        )
        db.add(log)
        db.commit()

        return {
            "status": "SUCCESS",
            "lead_id": lead.id,
            "lead_score": analysis["lead_score"],
            "classification": analysis["lead_category"],
            "sales_priority": analysis["sales_priority"],
            "task_id": new_task.id,
        }

    def scan_due_followups(self, db: Session, org_id: str) -> Dict[str, Any]:
        """
        Rule 2: IF follow-up date arrives
        → create notification.
        """
        start_time = time.time()
        now = datetime.now(timezone.utc)
        due_leads = (
            db.query(Lead)
            .filter(
                Lead.organization_id == org_id,
                Lead.follow_up_date <= now,
                Lead.status.notin_(["CONVERTED", "LOST"]),
            )
            .all()
        )

        created_notifs = 0
        for ld in due_leads:
            # Check if notification already dispatched in past 24 hours
            recent_notif = (
                db.query(Notification)
                .filter(
                    Notification.organization_id == org_id,
                    Notification.type == "FOLLOW_UP_ALERT",
                    Notification.message.ilike(f"%{ld.company}%"),
                    Notification.created_at >= now - timedelta(hours=24),
                )
                .first()
            )
            if not recent_notif:
                notif = Notification(
                    organization_id=org_id,
                    user_id=ld.assigned_to,
                    title=f"Follow-up Due: {ld.company}",
                    message=f"Scheduled outreach for {ld.contact_name} ({ld.company}) is now due. Deal value: Rs. {ld.deal_value:,.0f}.",
                    type="FOLLOW_UP_ALERT",
                    link_url="/leads",
                )
                db.add(notif)
                created_notifs += 1

        rule = db.query(AutomationRule).filter(
            AutomationRule.organization_id == org_id,
            AutomationRule.trigger_event == "FOLLOW_UP_DUE",
        ).first()
        if rule and rule.is_active:
            rule.execution_count += 1
            rule.updated_at = now

        latency = int((time.time() - start_time) * 1000)
        log = AutomationLog(
            organization_id=org_id,
            rule_id=rule.id if rule else None,
            rule_name="Scheduled Follow-up Arrival Notification",
            trigger_event="FOLLOW_UP_DUE",
            target_entity=f"{len(due_leads)} Due Leads Monitored",
            status="SUCCESS",
            latency_ms=max(25, latency),
            details=f"Scanned {len(due_leads)} due leads. Created {created_notifs} fresh alerts.",
        )
        db.add(log)
        db.commit()

        return {
            "status": "SUCCESS",
            "due_leads_count": len(due_leads),
            "notifications_created": created_notifs,
        }

    def scan_inactive_leads(self, db: Session, org_id: str, days: int = 7) -> Dict[str, Any]:
        """
        Rule 3: IF lead is inactive for X days
        → recommend follow-up & queue re-engagement task.
        """
        start_time = time.time()
        now = datetime.now(timezone.utc)
        threshold_date = now - timedelta(days=days)

        inactive_leads = (
            db.query(Lead)
            .filter(
                Lead.organization_id == org_id,
                Lead.status.notin_(["CONVERTED", "LOST"]),
                or_(
                    Lead.last_activity_date <= threshold_date,
                    and_(Lead.last_activity_date == None, Lead.updated_at <= threshold_date),
                ),
            )
            .all()
        )

        tasks_created = 0
        for ld in inactive_leads:
            # Check if pending task already exists
            existing_task = (
                db.query(AutomationTask)
                .filter(
                    AutomationTask.lead_id == ld.id,
                    AutomationTask.status == "PENDING",
                    AutomationTask.title.ilike("%Re-engagement%"),
                )
                .first()
            )
            if not existing_task:
                reengage_task = AutomationTask(
                    organization_id=org_id,
                    lead_id=ld.id,
                    title=f"Re-engagement: Inactive lead {ld.company}",
                    description=f"Lead has been inactive for >{days} days. Recommended action: Send consultative check-in email.",
                    priority="MEDIUM_P2",
                    due_date=now + timedelta(days=2),
                    status="PENDING",
                    assigned_to=ld.assigned_to,
                )
                db.add(reengage_task)

                notif = Notification(
                    organization_id=org_id,
                    user_id=ld.assigned_to,
                    title=f"Inactivity Warning: {ld.company}",
                    message=f"No activity logged for {days} days on {ld.company}. Follow-up recommended.",
                    type="INACTIVITY_WARNING",
                    link_url="/automation",
                )
                db.add(notif)
                tasks_created += 1

        rule = db.query(AutomationRule).filter(
            AutomationRule.organization_id == org_id,
            AutomationRule.trigger_event == "INACTIVITY_DETECTED",
        ).first()
        if rule and rule.is_active:
            rule.execution_count += 1
            rule.updated_at = now

        latency = int((time.time() - start_time) * 1000)
        log = AutomationLog(
            organization_id=org_id,
            rule_id=rule.id if rule else None,
            rule_name="Lead Inactivity & Churn Prevention Rule",
            trigger_event="INACTIVITY_DETECTED",
            target_entity=f"{len(inactive_leads)} Inactive Leads",
            status="SUCCESS",
            latency_ms=max(30, latency),
            details=f"Detected {len(inactive_leads)} inactive leads. Created {tasks_created} re-engagement tasks.",
        )
        db.add(log)
        db.commit()

        return {
            "status": "SUCCESS",
            "inactive_leads_count": len(inactive_leads),
            "tasks_created": tasks_created,
        }


lead_automation_service = LeadAutomationService()
