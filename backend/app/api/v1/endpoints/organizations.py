from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_role, require_roles
from app.core.rbac import UserRole
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import OrganizationOut, OrganizationUpdate
from app.schemas.common import APIResponse

router = APIRouter()


@router.get("/current", response_model=APIResponse[OrganizationOut])
def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve details of the user's active organization."""
    if not current_user.organization_id:
        raise NotFoundException("User is not currently assigned to an organization")

    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise NotFoundException("Organization not found")

    return APIResponse(data=OrganizationOut.model_validate(org))


@router.put("/current", response_model=APIResponse[OrganizationOut])
def update_current_organization(
    org_update: OrganizationUpdate,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Update organization settings, tier, or plan. Restricted to Business Admin and Super Admin."""
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise NotFoundException("Organization not found")

    if org_update.name is not None:
        org.name = org_update.name
    if org_update.plan is not None:
        org.plan = org_update.plan
    if org_update.status is not None:
        org.status = org_update.status

    db.commit()
    db.refresh(org)
    return APIResponse(message="Organization updated successfully", data=OrganizationOut.model_validate(org))


@router.get("", response_model=APIResponse[List[OrganizationOut]])
def list_all_organizations(
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db),
) -> Any:
    """List all tenant organizations across the platform. Restricted to Super Admin."""
    orgs = db.query(Organization).all()
    return APIResponse(data=[OrganizationOut.model_validate(o) for o in orgs])
