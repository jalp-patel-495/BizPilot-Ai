from typing import Any, List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.sale import Sale
from app.models.customer import Customer
from app.schemas.sale import SaleCreate, SaleResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[SaleResponse]])
def list_sales(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List sales transactions ledger."""
    query = db.query(Sale).filter(Sale.organization_id == current_user.organization_id)
    if status_filter:
        query = query.filter(Sale.status == status_filter.upper())
    sales = query.order_by(Sale.created_at.desc()).all()
    return APIResponse(data=sales)


@router.post("", response_model=APIResponse[SaleResponse], status_code=status.HTTP_201_CREATED)
def create_sale(
    sale_in: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Record a new sale transaction."""
    sale = Sale(
        organization_id=current_user.organization_id,
        customer_id=sale_in.customer_id,
        order_number=sale_in.order_number,
        customer_name=sale_in.customer_name,
        product_name=sale_in.product_name or "Enterprise AI Suite",
        amount=sale_in.amount,
        payment_method=sale_in.payment_method or "Stripe / Card",
        status=sale_in.status or "COMPLETED",
    )
    db.add(sale)

    # If linked to customer, increment customer total orders & ltv
    if sale_in.customer_id:
        cust = db.query(Customer).filter(Customer.id == sale_in.customer_id).first()
        if cust:
            cust.total_orders = (cust.total_orders or 0) + 1
            cust.ltv = (cust.ltv or 0.0) + sale_in.amount
            cust.last_order_date = datetime.now(timezone.utc)

    db.commit()
    db.refresh(sale)
    return APIResponse(message="Sale recorded successfully", data=sale)
