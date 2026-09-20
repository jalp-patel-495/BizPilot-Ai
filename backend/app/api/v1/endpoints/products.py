from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[ProductResponse]])
def list_products(
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List all products in catalog."""
    query = db.query(Product).filter(Product.organization_id == current_user.organization_id)
    if category:
        query = query.filter(Product.category == category)
    if status_filter:
        query = query.filter(Product.status == status_filter.upper())
    products = query.order_by(Product.units_sold.desc()).all()
    return APIResponse(data=products)


@router.post("", response_model=APIResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new product or tier in catalog."""
    existing = (
        db.query(Product)
        .filter(
            Product.organization_id == current_user.organization_id,
            Product.sku == product_in.sku,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A product with this SKU already exists in your organization",
        )

    product = Product(
        organization_id=current_user.organization_id,
        name=product_in.name,
        sku=product_in.sku,
        category=product_in.category or "Software",
        price=product_in.price,
        cost=product_in.cost or 0.0,
        units_sold=0,
        revenue=0.0,
        status=product_in.status or "ACTIVE",
        description=product_in.description,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return APIResponse(message="Product created successfully", data=product)
