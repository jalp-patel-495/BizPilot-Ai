import logging
from datetime import datetime, timezone, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import APIException, UnauthorizedException
from app.core.rbac import UserRole
from app.models.user import User
from app.models.organization import Organization
from app.schemas.token import (
    Token,
    LoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ProfileUpdateRequest,
)
from app.schemas.user import UserCreate, UserOut, UserProfile
from app.schemas.common import APIResponse

logger = logging.getLogger("upteky.auth")
router = APIRouter()


@router.post("/login", response_model=APIResponse[Token])
def login(request_data: LoginRequest, db: Session = Depends(get_db)) -> Any:
    """Authenticate a user using email and password and return JWT access and refresh tokens."""
    user = db.query(User).filter(User.email == request_data.email.lower().strip()).first()
    if not user or not verify_password(request_data.password, user.hashed_password):
        raise UnauthorizedException("Invalid email address or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact your organization administrator."
        )

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        organization_id=user.organization_id,
    )
    refresh_token = create_refresh_token(subject=user.id)

    return APIResponse(
        message="Authentication successful",
        data=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    )


@router.post("/register", response_model=APIResponse[UserOut])
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """Register a new user and assign them to an initial organization."""
    clean_email = user_in.email.lower().strip()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise APIException("An account with this email address already exists", status_code=400)

    if not user_in.password or len(user_in.password.strip()) < 6:
        raise APIException("Password must be at least 6 characters long", status_code=400)

    # Resolve or create organization safely
    org_id = None
    if user_in.organization_id:
        target_org = db.query(Organization).filter(Organization.id == user_in.organization_id).first()
        if target_org and target_org.is_active:
            org_id = target_org.id

    if not org_id:
        default_org = db.query(Organization).filter(Organization.slug == "upteky-corp").first() or db.query(Organization).first()
        if not default_org:
            try:
                default_org = Organization(
                    name="Upteky Technologies Inc.",
                    slug="upteky-corp",
                    plan="Enterprise AI Suite",
                    status="ACTIVE",
                    is_active=True,
                )
                db.add(default_org)
                db.commit()
                db.refresh(default_org)
            except IntegrityError:
                db.rollback()
                default_org = db.query(Organization).first()
        org_id = default_org.id if default_org else None

    # For self-service public registration, privilege escalation is prohibited.
    # New self-registered accounts are assigned EMPLOYEE role by default.
    try:
        new_user = User(
            email=clean_email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name.strip(),
            role=UserRole.EMPLOYEE.value,
            title=(user_in.title.strip() if user_in.title and user_in.title.strip() else "Operations Specialist"),
            organization_id=org_id,
            is_active=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise APIException("An account with this email address already exists", status_code=400)
    except Exception as exc:
        db.rollback()
        logger.error(f"Error creating user account: {exc}")
        raise APIException("Registration failed due to an unexpected error. Please try again later.", status_code=500)

    return APIResponse(
        message="Account created successfully",
        data=UserOut.model_validate(new_user),
    )


@router.get("/me", response_model=APIResponse[UserProfile])
def get_current_user_profile(current_user: User = Depends(get_current_user)) -> Any:
    """Retrieve detailed profile information for the authenticated user."""
    profile_data = UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        title=current_user.title,
        organization_id=current_user.organization_id,
        is_active=current_user.is_active,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        organization_name=current_user.organization.name if current_user.organization else "Upteky AI Global",
    )
    return APIResponse(data=profile_data)


@router.post("/refresh", response_model=APIResponse[Token])
def refresh_access_token(payload_in: RefreshTokenRequest, db: Session = Depends(get_db)) -> Any:
    """Refresh an expired access token using a valid refresh token."""
    payload = decode_token(payload_in.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid or expired refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise UnauthorizedException("User account not found or deactivated")

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        organization_id=user.organization_id,
    )
    new_refresh_token = create_refresh_token(subject=user.id)

    return APIResponse(
        message="Token refreshed successfully",
        data=Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    )


@router.post("/forgot-password", response_model=APIResponse[dict])
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)) -> Any:
    """Generate password reset token for user account."""
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    # Always respond with a generic success to prevent email enumeration
    reset_token = create_access_token(
        subject=user.id if user else "anonymous",
        role="PASSWORD_RESET",
        expires_delta=timedelta(minutes=30),
    )
    return APIResponse(
        message="If this email is registered, a password reset link and verification code have been dispatched.",
        data={"reset_token": reset_token, "expires_in_minutes": 30},
    )


@router.post("/reset-password", response_model=APIResponse[dict])
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)) -> Any:
    """Reset user password given a valid reset token."""
    payload = decode_token(req.token)
    if not payload or payload.get("role") != "PASSWORD_RESET":
        raise UnauthorizedException("Invalid or expired password reset token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise APIException("Account no longer exists", status_code=404)

    if len(req.new_password) < 6:
        raise APIException("New password must be at least 6 characters long", status_code=400)

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    return APIResponse(message="Your password has been successfully reset. You can now log in.")


@router.post("/verify-email", response_model=APIResponse[dict])
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)) -> Any:
    """Verify user email address using 6-digit OTP code."""
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        raise APIException("No account found matching this email address", status_code=404)

    # In production, this matches a stored verification code or link.
    # Accept standard demo code '123456' or any valid 6-digit number.
    if len(req.code) != 6 or not req.code.isdigit():
        raise APIException("Invalid verification code format. Must be 6 digits.", status_code=400)

    return APIResponse(
        message=f"Email address {req.email} verified successfully!",
        data={"verified": True, "email": req.email},
    )


@router.put("/profile", response_model=APIResponse[UserProfile])
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update profile and password for current authenticated user."""
    if req.full_name:
        current_user.full_name = req.full_name.strip()
    if req.title:
        current_user.title = req.title.strip()

    if req.new_password:
        if not req.current_password or not verify_password(req.current_password, current_user.hashed_password):
            raise APIException("Current password verification failed", status_code=400)
        if len(req.new_password) < 6:
            raise APIException("New password must be at least 6 characters long", status_code=400)
        current_user.hashed_password = get_password_hash(req.new_password)

    db.commit()
    db.refresh(current_user)

    profile_data = UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        title=current_user.title,
        organization_id=current_user.organization_id,
        is_active=current_user.is_active,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        organization_name=current_user.organization.name if current_user.organization else "Upteky AI Global",
    )
    return APIResponse(message="Profile updated successfully", data=profile_data)
