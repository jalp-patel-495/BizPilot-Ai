import json
import logging
from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.core.exceptions import ForbiddenException, APIException
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.organization import Organization
from app.models.user import User
from app.models.system_usage import SystemUsage
from app.models.audit_log import AuditLog
from app.schemas.subscription import UsageSummary, UsageMeter

logger = logging.getLogger("upteky.usage_service")


class UsageLimitService:
    @staticmethod
    def get_current_period_month() -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m")

    @classmethod
    def get_plan_for_organization(cls, db: Session, org_id: str) -> Plan:
        """Retrieve active plan configuration for a given organization."""
        subscription = (
            db.query(Subscription)
            .filter(Subscription.organization_id == org_id)
            .order_by(Subscription.created_at.desc())
            .first()
        )

        plan_slug = "starter"
        if subscription and subscription.plan_tier:
            plan_slug = subscription.plan_tier.lower().strip()
        else:
            # Fallback to organization plan column
            org = db.query(Organization).filter(Organization.id == org_id).first()
            if org and org.plan:
                p = org.plan.lower()
                if "free" in p:
                    plan_slug = "free"
                elif "enterprise" in p:
                    plan_slug = "enterprise"
                elif "business" in p:
                    plan_slug = "business"
                else:
                    plan_slug = "starter"

        plan = db.query(Plan).filter(Plan.id == plan_slug).first()
        if not plan:
            # Fallback default plan in memory if db row missing
            plan = Plan(
                id=plan_slug,
                name=plan_slug.capitalize(),
                max_users=10,
                max_ai_requests=500,
                max_api_requests=5000,
                features_json=json.dumps(["basic_analytics", "ai_chatbot", "lead_automation", "advanced_analytics"]),
            )
        return plan

    @classmethod
    def get_or_create_monthly_usage(cls, db: Session, org_id: str) -> SystemUsage:
        """Get or initialize monthly SystemUsage record for an organization."""
        period_month = cls.get_current_period_month()
        usage = (
            db.query(SystemUsage)
            .filter(
                SystemUsage.organization_id == org_id,
                SystemUsage.period_month == period_month,
            )
            .first()
        )
        if not usage:
            usage = SystemUsage(
                organization_id=org_id,
                period_month=period_month,
                api_requests_count=0,
                ai_requests_count=0,
                ai_tokens_count=0,
                ocr_documents_count=0,
                storage_bytes=10485760,  # 10 MB base storage
            )
            db.add(usage)
            db.commit()
            db.refresh(usage)
        return usage

    @classmethod
    def check_user_creation_limit(cls, db: Session, org_id: Optional[str]) -> None:
        """
        Verify that adding a new user does not exceed the organization's subscription plan seat limit.
        Raises 403 ForbiddenException if limit reached.
        """
        if not org_id:
            return

        plan = cls.get_plan_for_organization(db, org_id)
        if plan.max_users >= 999999:
            return  # Unlimited

        current_active_users = (
            db.query(User)
            .filter(User.organization_id == org_id, User.is_active == True)
            .count()
        )

        if current_active_users >= plan.max_users:
            raise ForbiddenException(
                f"Subscription plan limit reached: Your current '{plan.name}' plan allows up to "
                f"{plan.max_users} active users ({current_active_users}/{plan.max_users} seats currently occupied). "
                f"Please upgrade your subscription to add additional team members."
            )

    @classmethod
    def check_and_increment_ai_usage(
        cls, db: Session, org_id: Optional[str], tokens: int = 150
    ) -> None:
        """
        Verify that an AI request is permitted within the monthly quota and record consumption.
        Raises 429 APIException if monthly quota exceeded.
        """
        if not org_id:
            return

        plan = cls.get_plan_for_organization(db, org_id)
        usage = cls.get_or_create_monthly_usage(db, org_id)

        if plan.max_ai_requests < 999999 and usage.ai_requests_count >= plan.max_ai_requests:
            raise APIException(
                message=(
                    f"Monthly AI request quota exceeded: Your '{plan.name}' plan allows "
                    f"{plan.max_ai_requests} AI requests/month (Current: {usage.ai_requests_count}). "
                    f"Please upgrade your subscription tier to continue utilizing AI capabilities."
                ),
                status_code=429,
            )

        # Increment usage
        usage.ai_requests_count += 1
        usage.ai_tokens_count += max(1, tokens)
        usage.last_activity_at = datetime.now(timezone.utc)
        db.commit()

    @classmethod
    def record_api_call(cls, db: Session, org_id: Optional[str]) -> None:
        """Record an incoming API call for the organization."""
        if not org_id:
            return
        try:
            usage = cls.get_or_create_monthly_usage(db, org_id)
            usage.api_requests_count += 1
            db.commit()
        except Exception as e:
            logger.debug(f"Could not record API call: {e}")

    @classmethod
    def check_feature_access(cls, db: Session, org_id: Optional[str], feature_key: str) -> bool:
        """Check if organization's active plan includes a specific feature."""
        if not org_id:
            return True
        plan = cls.get_plan_for_organization(db, org_id)
        return feature_key in plan.features

    @classmethod
    def get_org_usage_summary(cls, db: Session, org_id: str) -> UsageSummary:
        """Build structured UsageSummary with meters for an organization."""
        plan = cls.get_plan_for_organization(db, org_id)
        usage = cls.get_or_create_monthly_usage(db, org_id)

        current_users = (
            db.query(User)
            .filter(User.organization_id == org_id, User.is_active == True)
            .count()
        )

        # Users meter
        user_pct = round((current_users / max(1, plan.max_users)) * 100, 1)
        users_meter = UsageMeter(
            current=current_users,
            limit=plan.max_users,
            percent=min(100.0, user_pct),
            is_unlimited=plan.max_users >= 999999,
            warning=user_pct >= 80.0,
            exceeded=current_users >= plan.max_users,
        )

        # AI requests meter
        ai_pct = round((usage.ai_requests_count / max(1, plan.max_ai_requests)) * 100, 1)
        ai_meter = UsageMeter(
            current=usage.ai_requests_count,
            limit=plan.max_ai_requests,
            percent=min(100.0, ai_pct),
            is_unlimited=plan.max_ai_requests >= 999999,
            warning=ai_pct >= 80.0,
            exceeded=usage.ai_requests_count >= plan.max_ai_requests,
        )

        # API requests meter
        api_pct = round((usage.api_requests_count / max(1, plan.max_api_requests)) * 100, 1)
        api_meter = UsageMeter(
            current=usage.api_requests_count,
            limit=plan.max_api_requests,
            percent=min(100.0, api_pct),
            is_unlimited=plan.max_api_requests >= 999999,
            warning=api_pct >= 80.0,
            exceeded=usage.api_requests_count >= plan.max_api_requests,
        )

        return UsageSummary(
            period_month=usage.period_month,
            users=users_meter,
            ai_requests=ai_meter,
            api_requests=api_meter,
            ai_tokens=usage.ai_tokens_count,
            storage_mb=round((usage.storage_bytes or 0) / (1024 * 1024), 2),
            plan_name=plan.name,
            plan_tier=plan.id,
            features=plan.features,
        )

    @classmethod
    def record_audit_log(
        cls,
        db: Session,
        action: str,
        resource: str,
        details: str,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        ip_address: str = "127.0.0.1",
    ) -> AuditLog:
        """Create and persist a platform activity audit log."""
        log = AuditLog(
            user_id=user_id,
            organization_id=organization_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address,
            created_at=datetime.now(timezone.utc),
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log


usage_service = UsageLimitService()
