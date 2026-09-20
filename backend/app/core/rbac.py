from enum import Enum
from typing import List, Set


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    BUSINESS_ADMIN = "BUSINESS_ADMIN"
    SALES_MANAGER = "SALES_MANAGER"
    EMPLOYEE = "EMPLOYEE"


# Role hierarchy - higher roles inherit permissions from lower roles where appropriate
ROLE_HIERARCHY = {
    UserRole.SUPER_ADMIN: {
        UserRole.SUPER_ADMIN,
        UserRole.BUSINESS_ADMIN,
        UserRole.SALES_MANAGER,
        UserRole.EMPLOYEE,
    },
    UserRole.BUSINESS_ADMIN: {
        UserRole.BUSINESS_ADMIN,
        UserRole.SALES_MANAGER,
        UserRole.EMPLOYEE,
    },
    UserRole.SALES_MANAGER: {
        UserRole.SALES_MANAGER,
        UserRole.EMPLOYEE,
    },
    UserRole.EMPLOYEE: {
        UserRole.EMPLOYEE,
    },
}


class Permission(str, Enum):
    # System
    SYSTEM_CONFIG = "system:config"
    GLOBAL_METRICS = "global:metrics"

    # Organization & Users
    ORG_READ = "org:read"
    ORG_WRITE = "org:write"
    USER_MANAGE = "user:manage"
    USER_READ = "user:read"

    # Leads & Sales
    LEADS_READ = "leads:read"
    LEADS_WRITE = "leads:write"
    LEADS_ASSIGN = "leads:assign"
    SALES_ANALYTICS = "sales:analytics"

    # Invoices & Financials
    INVOICE_READ = "invoice:read"
    INVOICE_WRITE = "invoice:write"
    INVOICE_APPROVE = "invoice:approve"

    # Support & AI
    SUPPORT_TICKETS = "support:tickets"
    AI_AUTOMATION = "ai:automation"


ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    UserRole.SUPER_ADMIN: {p for p in Permission},
    UserRole.BUSINESS_ADMIN: {
        Permission.ORG_READ,
        Permission.ORG_WRITE,
        Permission.USER_MANAGE,
        Permission.USER_READ,
        Permission.LEADS_READ,
        Permission.LEADS_WRITE,
        Permission.LEADS_ASSIGN,
        Permission.SALES_ANALYTICS,
        Permission.INVOICE_READ,
        Permission.INVOICE_WRITE,
        Permission.INVOICE_APPROVE,
        Permission.SUPPORT_TICKETS,
        Permission.AI_AUTOMATION,
    },
    UserRole.SALES_MANAGER: {
        Permission.USER_READ,
        Permission.LEADS_READ,
        Permission.LEADS_WRITE,
        Permission.LEADS_ASSIGN,
        Permission.SALES_ANALYTICS,
        Permission.SUPPORT_TICKETS,
        Permission.AI_AUTOMATION,
    },
    UserRole.EMPLOYEE: {
        Permission.LEADS_READ,
        Permission.LEADS_WRITE,
        Permission.INVOICE_READ,
        Permission.SUPPORT_TICKETS,
        Permission.AI_AUTOMATION,
    },
}


def has_permission(user_role: UserRole, permission: Permission) -> bool:
    """Check whether a user role possesses a specific permission."""
    return permission in ROLE_PERMISSIONS.get(user_role, set())


def has_role(user_role: UserRole, required_roles: List[UserRole]) -> bool:
    """Check if the user has any of the specified roles or a higher role in hierarchy."""
    user_inherited = ROLE_HIERARCHY.get(user_role, {user_role})
    return any(req_role in user_inherited for req_role in required_roles)
