from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_roles
from app.core.rbac import UserRole
from app.models.user import User
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[ProductResponse]])
def list_products(
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
) -> Any:
    """List all catalog products scoped to organization."""
    query = db.query(Product)
    if current_user.role != UserRole.SUPER_ADMIN.value or current_user.organization_id:
        query = query.filter(Product.organization_id == current_user.organization_id)

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
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
) -> Any:
    """Create a new product or tier in catalog (Admin only)."""
    org_id = current_user.organization_id
    existing = (
        db.query(Product)
        .filter(
            Product.organization_id == org_id,
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
        organization_id=org_id,
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


@router.put("/{product_id}", response_model=APIResponse[ProductResponse])
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
) -> Any:
    """Update a product in catalog (Admin only)."""
    query = db.query(Product).filter(Product.id == product_id)
    if current_user.role != UserRole.SUPER_ADMIN.value or current_user.organization_id:
        query = query.filter(Product.organization_id == current_user.organization_id)

    product = query.first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)
    return APIResponse(message="Product updated successfully", data=product)


@router.delete("/{product_id}", response_model=APIResponse[dict])
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
) -> Any:
    """Delete a product from catalog (Admin only)."""
    query = db.query(Product).filter(Product.id == product_id)
    if current_user.role != UserRole.SUPER_ADMIN.value or current_user.organization_id:
        query = query.filter(Product.organization_id == current_user.organization_id)

    product = query.first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(product)
    db.commit()
    return APIResponse(message=f"Product '{product.name}' deleted successfully", data={"id": product_id})
