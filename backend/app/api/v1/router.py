from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    organizations,
    leads,
    analytics,
    invoices,
    support,
    health,
    customers,
    products,
    sales,
    reports,
    chat,
    automations,
    notifications,
    admin,
    subscriptions,
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & RBAC"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads & Sales Automation"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & BI"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices & Operations"])
api_router.include_router(support.router, prefix="/support", tags=["Customer Support AI"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(products.router, prefix="/products", tags=["Products & Catalog"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales & Transactions"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & BI"])
api_router.include_router(chat.router, tags=["AI Customer Support & Knowledge Base"])
api_router.include_router(automations.router, prefix="/automations", tags=["AI Lead Automation & Rules"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications & Alerts"])
api_router.include_router(admin.router, prefix="/admin", tags=["Super Admin & SaaS Administration"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions & Usage"])
