from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.customer_activity import CustomerActivity
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
    CustomerDetailResponse,
    CustomerActivityCreate,
    CustomerActivityResponse,
)
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[CustomerResponse]])
def list_customers(
    q: Optional[str] = Query(None, description="Search by name, company, email, phone, or industry"),
    status_filter: Optional[str] = Query(None, alias="status"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List customer directory for organization with search and filters."""
    query = db.query(Customer).filter(Customer.organization_id == current_user.organization_id)
    
    if status_filter:
        query = query.filter(Customer.status == status_filter.upper())
    if industry:
        query = query.filter(Customer.industry.ilike(f"%{industry}%"))
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (Customer.name.ilike(search_pattern))
            | (Customer.company.ilike(search_pattern))
            | (Customer.email.ilike(search_pattern))
            | (Customer.phone.ilike(search_pattern))
            | (Customer.industry.ilike(search_pattern))
        )
        
    customers = query.order_by(Customer.created_at.desc()).all()
    return APIResponse(data=customers)


@router.post("", response_model=APIResponse[CustomerResponse], status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Add a new customer account."""
    existing = (
        db.query(Customer)
        .filter(
            Customer.organization_id == current_user.organization_id,
            Customer.email == customer_in.email,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A customer with this email already exists in your organization",
        )

    customer = Customer(
        organization_id=current_user.organization_id,
        name=customer_in.name,
        email=customer_in.email,
        phone=customer_in.phone,
        company=customer_in.company,
        address=customer_in.address or "",
        industry=customer_in.industry or "Technology",
        status=customer_in.status or "ACTIVE",
        tier=customer_in.tier or "Enterprise",
        ltv=customer_in.ltv or 0.0,
        total_orders=customer_in.total_orders or 0,
        notes=customer_in.notes,
    )
    db.add(customer)
    db.flush()

    # Log initial customer history activity
    initial_activity = CustomerActivity(
        customer_id=customer.id,
        organization_id=current_user.organization_id,
        activity_type="NOTE",
        title="Customer Account Created",
        description=f"Account registered in CRM directory by {current_user.full_name}.",
        performed_by=current_user.full_name,
    )
    db.add(initial_activity)

    db.commit()
    db.refresh(customer)
    return APIResponse(message="Customer created successfully", data=customer)


@router.get("/{customer_id}", response_model=APIResponse[CustomerDetailResponse])
def get_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """View customer details including activity history."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.organization_id == current_user.organization_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    activities = (
        db.query(CustomerActivity)
        .filter(CustomerActivity.customer_id == customer.id)
        .order_by(CustomerActivity.created_at.desc())
        .all()
    )

    detail_data = CustomerDetailResponse(
        id=customer.id,
        organization_id=customer.organization_id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        company=customer.company,
        address=customer.address,
        industry=customer.industry,
        status=customer.status,
        tier=customer.tier,
        ltv=customer.ltv,
        total_orders=customer.total_orders,
        last_order_date=customer.last_order_date,
        notes=customer.notes,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        activities=[CustomerActivityResponse.model_validate(act) for act in activities],
    )

    return APIResponse(data=detail_data)


@router.put("/{customer_id}", response_model=APIResponse[CustomerResponse])
def update_customer(
    customer_id: str,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Edit existing customer details."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.organization_id == current_user.organization_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    update_dict = customer_update.model_dump(exclude_unset=True)
    changed_fields = []
    for field, val in update_dict.items():
        old_val = getattr(customer, field, None)
        if old_val != val:
            changed_fields.append(field)
            setattr(customer, field, val)

    if changed_fields:
        log_act = CustomerActivity(
            customer_id=customer.id,
            organization_id=current_user.organization_id,
            activity_type="NOTE",
            title="Customer Record Updated",
            description=f"Fields updated: {', '.join(changed_fields)} by {current_user.full_name}.",
            performed_by=current_user.full_name,
        )
        db.add(log_act)

    db.commit()
    db.refresh(customer)
    return APIResponse(message="Customer updated successfully", data=customer)


@router.delete("/{customer_id}", response_model=APIResponse[dict])
def delete_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete customer account."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.organization_id == current_user.organization_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    db.delete(customer)
    db.commit()
    return APIResponse(message=f"Customer '{customer.company}' deleted successfully", data={"id": customer_id})


@router.get("/{customer_id}/history", response_model=APIResponse[List[CustomerActivityResponse]])
def get_customer_history(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Fetch interaction timeline history for a customer."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.organization_id == current_user.organization_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    activities = (
        db.query(CustomerActivity)
        .filter(CustomerActivity.customer_id == customer.id)
        .order_by(CustomerActivity.created_at.desc())
        .all()
    )
    return APIResponse(data=activities)


@router.post("/{customer_id}/history", response_model=APIResponse[CustomerActivityResponse], status_code=status.HTTP_201_CREATED)
def add_customer_activity(
    customer_id: str,
    activity_in: CustomerActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Log an interaction, call, meeting, or note to customer history."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.organization_id == current_user.organization_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    activity = CustomerActivity(
        customer_id=customer.id,
        organization_id=current_user.organization_id,
        activity_type=activity_in.activity_type or "NOTE",
        title=activity_in.title,
        description=activity_in.description,
        performed_by=activity_in.performed_by or current_user.full_name,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return APIResponse(message="Activity logged to customer history", data=activity)
