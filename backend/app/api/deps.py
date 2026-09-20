from typing import Generator, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.core.security import decode_token
from app.core.rbac import UserRole, has_role
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2),
) -> User:
    """Validate bearer token and retrieve the current authenticated user."""
    if not token:
        raise UnauthorizedException("Authentication token is required")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired authentication token")

    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token missing subject identifier")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User associated with token not found")

    if not user.is_active:
        raise ForbiddenException("User account is inactive")

    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2),
):
    """Optionally validate token; returns User if valid, else None."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return None
        return user
    except Exception:
        return None



def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verify that current user account is active."""
    if not current_user.is_active:
        raise ForbiddenException("User account has been suspended")
    return current_user


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """Dependency factory that enforces that the user belongs to allowed roles or superior."""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        user_role = UserRole(current_user.role)
        if not has_role(user_role, allowed_roles):
            allowed_names = ", ".join([r.value for r in allowed_roles])
            raise ForbiddenException(
                f"Action restricted to roles: [{allowed_names}]. Current role: {current_user.role}"
            )
        return current_user

    return role_checker


def require_role(allowed_role: UserRole) -> Callable:
    """Dependency factory for checking a single role requirement."""
    return require_roles([allowed_role])
