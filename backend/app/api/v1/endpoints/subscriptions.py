import logging
from typing import Any, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_roles
from app.core.rbac import UserRole
from app.core.exceptions import NotFoundException, APIException
from app.models.user import User
from app.models.organization import Organization
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.schemas.common import APIResponse
from app.schemas.plan import PlanOut
from app.schemas.subscription import (
    SubscriptionOut,
    CurrentSubscriptionResponse,
    SubscriptionUpdate,
)
from app.services.usage_service import usage_service

logger = logging.getLogger("upteky.subscriptions_api")

router = APIRouter()


@router.get("/current", response_model=APIResponse[CurrentSubscriptionResponse])
def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve current active subscription, plan entitlements, and real-time usage meters."""
    if not current_user.organization_id:
        raise NotFoundException("User is not assigned to an active business organization")

    sub = (
        db.query(Subscription)
        .filter(Subscription.organization_id == current_user.organization_id)
        .order_by(Subscription.created_at.desc())
        .first()
    )

    plan = usage_service.get_plan_for_organization(db, current_user.organization_id)
    usage = usage_service.get_org_usage_summary(db, current_user.organization_id)

    sub_out = None
    if sub:
        sub_out = SubscriptionOut(
            id=sub.id,
            organization_id=sub.organization_id,
            plan_tier=sub.plan_tier,
            billing_cycle=sub.billing_cycle,
            monthly_price=sub.monthly_price,
            status=sub.status,
            current_period_start=sub.current_period_start,
            current_period_end=sub.current_period_end,
            auto_renew=sub.auto_renew,
            created_at=sub.created_at,
            updated_at=sub.updated_at,
            organization_name=current_user.organization.name if current_user.organization else None,
        )

    return APIResponse(
        data=CurrentSubscriptionResponse(
            subscription=sub_out,
            plan=PlanOut.model_validate(plan),
            usage=usage,
        )
    )


@router.get("/plans", response_model=APIResponse[List[PlanOut]])
def list_available_plans(
    db: Session = Depends(get_db),
) -> Any:
    """List available SaaS subscription tiers for plan comparisons and self-service upgrades."""
    plans = db.query(Plan).filter(Plan.is_active == True).order_by(Plan.monthly_price.asc()).all()
    return APIResponse(data=[PlanOut.model_validate(p) for p in plans])


@router.post("/upgrade", response_model=APIResponse[CurrentSubscriptionResponse])
def upgrade_subscription_tier(
    payload: SubscriptionUpdate,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Upgrade or switch organization subscription tier (Business Admin & Super Admin)."""
    if not current_user.organization_id:
        raise NotFoundException("User has no affiliated organization")

    target_plan_slug = (payload.plan_tier or "starter").lower().strip()
    target_plan = db.query(Plan).filter(Plan.id == target_plan_slug).first()
    if not target_plan:
        raise NotFoundException(f"Subscription plan tier '{target_plan_slug}' does not exist")

    sub = (
        db.query(Subscription)
        .filter(Subscription.organization_id == current_user.organization_id)
        .first()
    )

    price = target_plan.monthly_price
    cycle = payload.billing_cycle or (sub.billing_cycle if sub else "monthly")
    if cycle == "annual" and target_plan.annual_price:
        price = target_plan.annual_price / 12.0

    if sub:
        sub.plan_tier = target_plan.id
        sub.monthly_price = round(price, 2)
        sub.billing_cycle = cycle
        sub.status = "ACTIVE"
    else:
        sub = Subscription(
            organization_id=current_user.organization_id,
            plan_tier=target_plan.id,
            billing_cycle=cycle,
            monthly_price=round(price, 2),
            status="ACTIVE",
        )
        db.add(sub)

    # Sync Organization.plan
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if org:
        org.plan = target_plan.name

    db.commit()

    usage_service.record_audit_log(
        db,
        action="PLAN_UPGRADED",
        resource=f"Organization:{current_user.organization_id}",
        details=f"Organization changed plan to '{target_plan.name}'",
        user_id=current_user.id,
        organization_id=current_user.organization_id,
    )

    usage = usage_service.get_org_usage_summary(db, current_user.organization_id)

    sub_out = SubscriptionOut(
        id=sub.id,
        organization_id=sub.organization_id,
        plan_tier=sub.plan_tier,
        billing_cycle=sub.billing_cycle,
        monthly_price=sub.monthly_price,
        status=sub.status,
        current_period_start=sub.current_period_start,
        current_period_end=sub.current_period_end,
        auto_renew=sub.auto_renew,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        organization_name=org.name if org else None,
    )

    return APIResponse(
        message=f"Subscription successfully updated to '{target_plan.name}'",
        data=CurrentSubscriptionResponse(
            subscription=sub_out,
            plan=PlanOut.model_validate(target_plan),
            usage=usage,
        ),
    )
