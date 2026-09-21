from typing import Any, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_roles, get_current_user
from app.core.rbac import UserRole
from app.core.security import get_password_hash
from app.core.exceptions import APIException, NotFoundException, ForbiddenException
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[UserOut]])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List team members within the organization. Accessible to all authenticated users; Super Admin sees all."""
    query = db.query(User)
    if current_user.role != UserRole.SUPER_ADMIN.value:
        query = query.filter(User.organization_id == current_user.organization_id)

    users = query.offset(skip).limit(limit).all()
    return APIResponse(data=[UserOut.model_validate(u) for u in users])


@router.post("", response_model=APIResponse[UserOut])
def create_user(
    user_in: UserCreate,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Create a new user with an assigned role. Requires Admin privileges."""
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise APIException("A user with this email address already exists", status_code=400)

    # Business Admin cannot create Super Admin
    if current_user.role == UserRole.BUSINESS_ADMIN.value and user_in.role == UserRole.SUPER_ADMIN:
        raise ForbiddenException("Business Admins cannot create Super Admin accounts")

    org_id = current_user.organization_id if current_user.role != UserRole.SUPER_ADMIN.value else (user_in.organization_id or current_user.organization_id)

    # Enforce subscription plan seat limits
    if org_id:
        from app.services.usage_service import usage_service
        usage_service.check_user_creation_limit(db, org_id)

    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.value if hasattr(user_in.role, "value") else str(user_in.role),
        title=user_in.title or "Specialist",
        organization_id=org_id,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    from app.services.usage_service import usage_service
    usage_service.record_audit_log(
        db,
        action="USER_CREATED",
        resource=f"User:{new_user.id}",
        details=f"User '{new_user.email}' created with role '{new_user.role}' in organization '{org_id}'",
        user_id=current_user.id,
        organization_id=org_id,
    )

    return APIResponse(
        message=f"User {new_user.full_name} created successfully",
        data=UserOut.model_validate(new_user),
    )


@router.get("/{user_id}", response_model=APIResponse[UserOut])
def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get single user profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with ID {user_id} not found")

    if current_user.role != UserRole.SUPER_ADMIN.value and user.organization_id != current_user.organization_id:
        raise ForbiddenException("Cannot access users outside your organization")

    return APIResponse(data=UserOut.model_validate(user))


@router.put("/{user_id}", response_model=APIResponse[UserOut])
def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Update user role, status, or title. Requires Admin privileges."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with ID {user_id} not found")

    if current_user.role != UserRole.SUPER_ADMIN.value and user.organization_id != current_user.organization_id:
        raise ForbiddenException("Cannot update users outside your organization")

    if user_update.email is not None:
        user.email = user_update.email.lower().strip()
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.role is not None:
        user.role = user_update.role.value if hasattr(user_update.role, "value") else str(user_update.role)
    if user_update.title is not None:
        user.title = user_update.title
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.password:
        user.hashed_password = get_password_hash(user_update.password)

    db.commit()
    db.refresh(user)
    return APIResponse(message="User updated successfully", data=UserOut.model_validate(user))


@router.delete("/{user_id}", response_model=APIResponse[dict])
def delete_user(
    user_id: str,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Delete a user account. Requires Admin privileges."""
    if current_user.id == user_id:
        raise APIException("You cannot delete your own active account", status_code=400)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with ID {user_id} not found")

    if current_user.role != UserRole.SUPER_ADMIN.value and user.organization_id != current_user.organization_id:
        raise ForbiddenException("Cannot delete users outside your organization")

    db.delete(user)
    db.commit()
    return APIResponse(message=f"User {user.full_name} deleted successfully", data={"deleted_id": user_id})
