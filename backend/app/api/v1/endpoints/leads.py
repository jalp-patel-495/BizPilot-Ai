from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_roles
from app.core.rbac import UserRole
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.lead import Lead
from app.models.user import User
from app.models.customer import Customer
from app.models.customer_activity import CustomerActivity
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadOut,
    LeadConvertRequest,
    ClassificationRulesConfig,
)
from app.schemas.customer import CustomerResponse
from app.schemas.common import APIResponse
from app.services.ai_service import ai_service
from app.services.ml_service import ml_service
from app.services.lead_classifier import lead_classifier

router = APIRouter()


def _format_lead_out(lead: Lead) -> LeadOut:
    """Helper to convert Lead model to LeadOut schema with assignee details."""
    assignee_name = lead.assignee.full_name if lead.assignee else None
    assignee_email = lead.assignee.email if lead.assignee else None

    lead_data = LeadOut(
        id=lead.id,
        organization_id=lead.organization_id,
        contact_name=lead.contact_name,
        email=lead.email,
        phone=lead.phone,
        company=lead.company,
        address=lead.address,
        industry=lead.industry,
        deal_value=lead.deal_value,
        source=lead.source,
        status=lead.status,
        follow_up_date=lead.follow_up_date,
        assigned_to=lead.assigned_to,
        classification=lead.classification or "WARM",
        classification_reason=lead.classification_reason,
        ai_score=lead.ai_score,
        ai_summary=lead.ai_summary,
        sales_priority=getattr(lead, "sales_priority", "HIGH_P1") or "HIGH_P1",
        recommended_action=getattr(lead, "recommended_action", None),
        suggested_follow_up_date=getattr(lead, "suggested_follow_up_date", None),
        ai_follow_up_message=getattr(lead, "ai_follow_up_message", None),
        notes=lead.notes,
        assignee_name=assignee_name,
        assignee_email=assignee_email,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )
    return lead_data



@router.get("", response_model=APIResponse[List[LeadOut]])
def list_leads(
    status: Optional[str] = None,
    classification: Optional[str] = None,
    source: Optional[str] = None,
    assigned_to: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List business leads for the organization with search and multi-dimensional filters."""
    if current_user.role == UserRole.SUPER_ADMIN.value and not current_user.organization_id:
        query = db.query(Lead)
    else:
        query = db.query(Lead).filter(Lead.organization_id == current_user.organization_id)
        # Role-based scoping: Employees only see their own assigned leads
        if current_user.role == UserRole.EMPLOYEE.value:
            query = query.filter(Lead.assigned_to == current_user.id)

    if status:
        query = query.filter(Lead.status == status.upper())
    if classification:
        query = query.filter(Lead.classification == classification.upper())
    if source:
        query = query.filter(Lead.source.ilike(f"%{source}%"))
    if assigned_to and current_user.role != UserRole.EMPLOYEE.value:
        query = query.filter(Lead.assigned_to == assigned_to)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Lead.contact_name.ilike(term))
            | (Lead.company.ilike(term))
            | (Lead.email.ilike(term))
            | (Lead.industry.ilike(term))
        )

    leads = query.order_by(Lead.created_at.desc()).all()
    return APIResponse(data=[_format_lead_out(lead) for lead in leads])


@router.post("", response_model=APIResponse[LeadOut], status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_in: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create a new lead.
    Automatically computes ML conversion score, AI intent summary,
    and classifies the lead into HOT, WARM, or COLD using configurable rules.
    """
    org_id = current_user.organization_id

    # If employee creates a lead, default assignment to self
    assigned_to = lead_in.assigned_to
    if current_user.role == UserRole.EMPLOYEE.value or not assigned_to:
        assigned_to = current_user.id if current_user.role == UserRole.EMPLOYEE.value else assigned_to

    # 1. Evaluate Rule-based Classification
    rule_eval = lead_classifier.classify_lead(
        deal_value=lead_in.deal_value,
        status=lead_in.status,
        source=lead_in.source,
        notes=lead_in.notes,
        follow_up_date=lead_in.follow_up_date,
    )

    # 2. Predictive ML Scoring Baseline
    predicted_score = ml_service.predict_lead_score(
        deal_value=lead_in.deal_value,
        industry=lead_in.industry,
        source=lead_in.source,
    )

    # 3. Generate AI Intent & Context Summary
    ai_summary = await ai_service.generate_lead_summary(
        company=lead_in.company,
        notes=lead_in.notes or "New inbound interest received.",
    )

    lead = Lead(
        organization_id=org_id,
        contact_name=lead_in.contact_name,
        email=lead_in.email,
        phone=lead_in.phone,
        company=lead_in.company,
        address=lead_in.address or "",
        industry=lead_in.industry or "Technology",
        deal_value=lead_in.deal_value or 0.0,
        source=lead_in.source or "Website",
        status=lead_in.status or "NEW",
        follow_up_date=lead_in.follow_up_date,
        assigned_to=assigned_to,
        notes=lead_in.notes,
        classification=rule_eval["classification"],
        classification_reason=rule_eval["reason"],
        ai_score=round(predicted_score, 1),
        ai_summary=ai_summary,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # Deep AI automated analysis & task generation
    try:
        from app.services.lead_automation_service import lead_automation_service
        lead_automation_service.execute_lead_created_rules(db, lead.id)
        db.refresh(lead)
    except Exception:
        pass

    return APIResponse(
        message="Lead registered, ML scored, and auto-classified successfully",
        data=_format_lead_out(lead),
    )



@router.get("/rules/classification", response_model=APIResponse[ClassificationRulesConfig])
def get_classification_rules(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Inspect active automated lead classification rules and thresholds."""
    rules = lead_classifier.get_rules()
    return APIResponse(data=ClassificationRulesConfig(rules=rules))


@router.put("/rules/classification", response_model=APIResponse[ClassificationRulesConfig])
def update_classification_rules(
    rules_in: ClassificationRulesConfig,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
) -> Any:
    """Update active automated lead classification thresholds."""
    updated = lead_classifier.update_rules(rules_in.rules)
    return APIResponse(message="Classification rules updated successfully", data=ClassificationRulesConfig(rules=updated))


@router.get("/{lead_id}", response_model=APIResponse[LeadOut])
def get_lead(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Fetch single lead details."""
    query = db.query(Lead).filter(Lead.id == lead_id)
    if current_user.role != UserRole.SUPER_ADMIN.value:
        query = query.filter(Lead.organization_id == current_user.organization_id)
        if current_user.role == UserRole.EMPLOYEE.value:
            query = query.filter(Lead.assigned_to == current_user.id)
    lead = query.first()
    if not lead:
        raise NotFoundException("Lead not found or unauthorized")
    return APIResponse(data=_format_lead_out(lead))


@router.put("/{lead_id}", response_model=APIResponse[LeadOut])
def update_lead(
    lead_id: str,
    lead_update: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Edit lead details with automatic re-classification."""
    query = db.query(Lead).filter(Lead.id == lead_id)
    if current_user.role != UserRole.SUPER_ADMIN.value:
        query = query.filter(Lead.organization_id == current_user.organization_id)
        if current_user.role == UserRole.EMPLOYEE.value:
            query = query.filter(Lead.assigned_to == current_user.id)
    lead = query.first()
    if not lead:
        raise NotFoundException("Lead not found or unauthorized")

    update_dict = lead_update.model_dump(exclude_unset=True)
    # Employee cannot reassign lead to someone else
    if current_user.role == UserRole.EMPLOYEE.value and "assigned_to" in update_dict:
        del update_dict["assigned_to"]

    for field, val in update_dict.items():
        setattr(lead, field, val)

    # Re-evaluate automatic classification if explicit classification was not provided
    if "classification" not in update_dict:
        clf_result = lead_classifier.classify_lead(
            deal_value=lead.deal_value,
            status=lead.status,
            source=lead.source,
            ai_score=lead.ai_score,
            follow_up_date=lead.follow_up_date,
        )
        lead.classification = clf_result["classification"]
        lead.classification_reason = clf_result["reason"]

    db.commit()
    db.refresh(lead)
    return APIResponse(message="Lead updated successfully", data=_format_lead_out(lead))


@router.delete("/{lead_id}", response_model=APIResponse[dict])
def delete_lead(
    lead_id: str,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Delete a lead. Restricted to Admins and Sales Managers."""
    query = db.query(Lead).filter(Lead.id == lead_id)
    if current_user.role != UserRole.SUPER_ADMIN.value:
        query = query.filter(Lead.organization_id == current_user.organization_id)
    lead = query.first()
    if not lead:
        raise NotFoundException("Lead not found")

    db.delete(lead)
    db.commit()
    return APIResponse(message=f"Lead '{lead.company}' deleted successfully", data={"id": lead_id})


@router.post("/{lead_id}/convert", response_model=APIResponse[CustomerResponse])
def convert_lead_to_customer(
    lead_id: str,
    convert_in: LeadConvertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Convert a lead into an active Customer account.
    Auto-populates customer record and creates an initial 'LEAD_CONVERSION' timeline activity.
    """
    lead = db.query(Lead).filter(
        Lead.id == lead_id, Lead.organization_id == current_user.organization_id
    ).first()
    if not lead:
        raise NotFoundException("Lead not found")
    if current_user.role == UserRole.EMPLOYEE.value and lead.assigned_to != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to unassigned lead is restricted")

    # Check if customer already exists for this email
    customer = (
        db.query(Customer)
        .filter(Customer.organization_id == current_user.organization_id, Customer.email == lead.email)
        .first()
    )

    if not customer:
        customer = Customer(
            organization_id=current_user.organization_id,
            name=lead.contact_name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            address=lead.address or "",
            industry=lead.industry or "Technology",
            status="ACTIVE",
            tier=convert_in.tier or "Enterprise",
            ltv=convert_in.initial_ltv or lead.deal_value or 0.0,
            total_orders=1 if lead.deal_value > 0 else 0,
            notes=convert_in.notes or lead.notes,
        )
        db.add(customer)
        db.flush()

    # Log conversion in customer activity timeline
    conversion_activity = CustomerActivity(
        customer_id=customer.id,
        organization_id=current_user.organization_id,
        activity_type="CONVERSION",
        title="Lead Converted to Customer",
        description=f"Lead '{lead.company}' (Rs. {lead.deal_value:,.0f}) converted to customer by {current_user.full_name}.",
        performed_by=current_user.full_name,
    )
    db.add(conversion_activity)

    # Mark lead as CONVERTED and HOT
    lead.status = "CONVERTED"
    lead.classification = "HOT"
    lead.classification_reason = f"Converted to Customer account on {datetime.now(timezone.utc).strftime('%b %d, %Y')}."

    db.commit()
    db.refresh(customer)

    return APIResponse(
        message=f"Lead successfully converted to customer '{customer.company}'",
        data=customer,
    )
