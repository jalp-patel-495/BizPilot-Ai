import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.organization import Organization
from app.models.user import User
from app.models.subscription import Subscription
from app.core.security import get_password_hash

client = TestClient(app)


def get_token(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["data"]["access_token"]


def test_admin_endpoints_require_super_admin():
    # 1. Non-super admin (Employee)
    emp_token = get_token("employee@upteky.ai", "Emp@12345")
    res = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 403

    # 2. Non-super admin (Business Admin)
    ba_token = get_token("businessadmin@upteky.ai", "Admin@12345")
    res = client.get("/api/v1/admin/businesses", headers={"Authorization": f"Bearer {ba_token}"})
    assert res.status_code == 403

    # 3. Super Admin
    sa_token = get_token("superadmin@upteky.ai", "Admin@12345")
    res = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {sa_token}"})
    assert res.status_code == 200
    data = res.json()["data"]
    assert "mrr" in data
    assert "active_businesses" in data
    assert "plan_distribution" in data
    assert data["system_health"]["status"] == "HEALTHY"


def test_admin_manage_businesses():
    sa_token = get_token("superadmin@upteky.ai", "Admin@12345")

    # List businesses
    res = client.get("/api/v1/admin/businesses", headers={"Authorization": f"Bearer {sa_token}"})
    assert res.status_code == 200
    businesses = res.json()["data"]
    assert len(businesses) >= 5
    slugs = [b["slug"] for b in businesses]
    assert "upteky-corp" in slugs
    assert "apex-logistics" in slugs

    # Cleanup: delete test-fintech-co if it exists from a previous run
    db = SessionLocal()
    try:
        existing_org = db.query(Organization).filter(Organization.slug == "test-fintech-co").first()
        if existing_org:
            db.query(User).filter(User.organization_id == existing_org.id).delete()
            db.query(Subscription).filter(Subscription.organization_id == existing_org.id).delete()
            db.delete(existing_org)
            db.commit()
        existing_user = db.query(User).filter(User.email == "admin@testfintech.com").first()
        if existing_user:
            db.delete(existing_user)
            db.commit()
    finally:
        db.close()

    # Create new business
    new_slug = "test-fintech-co"
    create_res = client.post(
        "/api/v1/admin/businesses",
        json={
            "name": "Test Fintech Co",
            "slug": new_slug,
            "plan_tier": "starter",
            "billing_cycle": "monthly",
            "admin_email": "admin@testfintech.com",
            "admin_name": "Fintech Director",
            "admin_password": "Admin@12345",
        },
        headers={"Authorization": f"Bearer {sa_token}"},
    )
    assert create_res.status_code == 200
    created_biz = create_res.json()["data"]
    assert created_biz["slug"] == new_slug
    assert created_biz["plan"] == "Starter Plan"

    # Update business
    update_res = client.put(
        f"/api/v1/admin/businesses/{created_biz['id']}",
        json={"name": "Test Fintech Co (Global)", "plan": "business"},
        headers={"Authorization": f"Bearer {sa_token}"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "Test Fintech Co (Global)"
    assert update_res.json()["data"]["plan"] == "Business Pro"

    # Toggle status
    toggle_res = client.delete(
        f"/api/v1/admin/businesses/{created_biz['id']}",
        headers={"Authorization": f"Bearer {sa_token}"},
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["data"]["status"] == "SUSPENDED"


def test_admin_manage_users_and_subscriptions():
    sa_token = get_token("superadmin@upteky.ai", "Admin@12345")

    # List cross-org users
    res = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {sa_token}"})
    assert res.status_code == 200
    users = res.json()["data"]
    assert len(users) >= 8

    # Filter users by role
    res_filtered = client.get("/api/v1/admin/users?role=BUSINESS_ADMIN", headers={"Authorization": f"Bearer {sa_token}"})
    assert res_filtered.status_code == 200
    for u in res_filtered.json()["data"]:
        assert u["role"] == "BUSINESS_ADMIN"

    # List subscriptions
    subs_res = client.get("/api/v1/admin/subscriptions", headers={"Authorization": f"Bearer {sa_token}"})
    assert subs_res.status_code == 200
    subs = subs_res.json()["data"]
    assert len(subs) >= 5
    first_sub = subs[0]

    # Modify subscription
    sub_update = client.put(
        f"/api/v1/admin/subscriptions/{first_sub['id']}",
        json={"auto_renew": False, "billing_cycle": "annual"},
        headers={"Authorization": f"Bearer {sa_token}"},
    )
    assert sub_update.status_code == 200
    assert sub_update.json()["data"]["auto_renew"] is False
    assert sub_update.json()["data"]["billing_cycle"] == "annual"


def test_admin_plans_and_observability():
    sa_token = get_token("superadmin@upteky.ai", "Admin@12345")

    # 1. Manage Plans
    plans_res = client.get("/api/v1/admin/plans", headers={"Authorization": f"Bearer {sa_token}"})
    assert plans_res.status_code == 200
    plans = plans_res.json()["data"]
    plan_ids = [p["id"] for p in plans]
    assert "free" in plan_ids
    assert "starter" in plan_ids
    assert "business" in plan_ids
    assert "enterprise" in plan_ids

    # Update Starter plan pricing
    update_plan_res = client.put(
        "/api/v1/admin/plans/starter",
        json={"monthly_price": 59.0, "max_ai_requests": 600},
        headers={"Authorization": f"Bearer {sa_token}"},
    )
    assert update_plan_res.status_code == 200
    assert update_plan_res.json()["data"]["monthly_price"] == 59.0
    assert update_plan_res.json()["data"]["max_ai_requests"] == 600

    # 2. System Usage
    usage_res = client.get("/api/v1/admin/system-usage", headers={"Authorization": f"Bearer {sa_token}"})
    assert usage_res.status_code == 200
    usage_data = usage_res.json()["data"]
    assert "total_storage_gb" in usage_data
    assert "tenants" in usage_data
    assert len(usage_data["tenants"]) >= 5

    # 3. API Usage
    api_usage_res = client.get("/api/v1/admin/api-usage", headers={"Authorization": f"Bearer {sa_token}"})
    assert api_usage_res.status_code == 200
    api_data = api_usage_res.json()["data"]
    assert "top_endpoints" in api_data
    assert "status_distribution" in api_data
    assert "avg_latency_ms" in api_data

    # 4. AI Usage
    ai_usage_res = client.get("/api/v1/admin/ai-usage", headers={"Authorization": f"Bearer {sa_token}"})
    assert ai_usage_res.status_code == 200
    ai_data = ai_usage_res.json()["data"]
    assert "feature_distribution" in ai_data
    assert "model_distribution" in ai_data
    assert "total_tokens" in ai_data

    # 5. System Activity Logs
    logs_res = client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {sa_token}"})
    assert logs_res.status_code == 200
    logs = logs_res.json()["data"]
    assert len(logs) >= 5


def test_usage_limit_enforcement_and_tenant_subscription():
    # 1. Login as Business Admin of NovaCraft Studios (Free Plan, max 2 users)
    novacraft_token = get_token("founder@novacraft.io", "Admin@12345")

    # Cleanup: reset NovaCraft subscription back to free plan if upgraded in a previous run,
    # and remove test designer users
    db = SessionLocal()
    try:
        novacraft_org = db.query(Organization).filter(Organization.slug == "novacraft-studios").first()
        if novacraft_org:
            # Reset subscription to free
            sub = db.query(Subscription).filter(
                Subscription.organization_id == novacraft_org.id
            ).order_by(Subscription.created_at.desc()).first()
            if sub and sub.plan_tier != "free":
                sub.plan_tier = "free"
                sub.monthly_price = 0.0
                db.commit()
            # Remove test users from previous runs
            db.query(User).filter(
                User.organization_id == novacraft_org.id,
                User.email.in_([
                    "designer2@novacraft.io",
                    "designer3@novacraft.io",
                ])
            ).delete(synchronize_session=False)
            db.commit()
    finally:
        db.close()

    # Current subscription & usage meters
    sub_res = client.get("/api/v1/subscriptions/current", headers={"Authorization": f"Bearer {novacraft_token}"})
    assert sub_res.status_code == 200
    sub_data = sub_res.json()["data"]
    assert sub_data["plan"]["id"] == "free"
    assert sub_data["usage"]["users"]["limit"] == 2
    assert sub_data["usage"]["ai_requests"]["limit"] == 50

    # Add 1 user (now 2 users in NovaCraft: founder + member2)
    create_u1 = client.post(
        "/api/v1/users",
        json={
            "email": "designer2@novacraft.io",
            "password": "Password@123",
            "full_name": "Second Designer",
            "role": "EMPLOYEE",
        },
        headers={"Authorization": f"Bearer {novacraft_token}"},
    )
    assert create_u1.status_code == 200

    # Attempt to add 3rd user to NovaCraft Studios (Limit is 2 on Free Plan -> should be rejected with 403)
    create_u2 = client.post(
        "/api/v1/users",
        json={
            "email": "designer3@novacraft.io",
            "password": "Password@123",
            "full_name": "Third Designer",
            "role": "EMPLOYEE",
        },
        headers={"Authorization": f"Bearer {novacraft_token}"},
    )
    assert create_u2.status_code == 403
    assert "Subscription plan limit reached" in create_u2.text

    # Upgrade to Starter Plan
    upgrade_res = client.post(
        "/api/v1/subscriptions/upgrade",
        json={"plan_tier": "starter", "billing_cycle": "monthly"},
        headers={"Authorization": f"Bearer {novacraft_token}"},
    )
    assert upgrade_res.status_code == 200
    assert upgrade_res.json()["data"]["plan"]["id"] == "starter"
    assert upgrade_res.json()["data"]["usage"]["users"]["limit"] == 10

    # Now adding 3rd user succeeds!
    create_u3 = client.post(
        "/api/v1/users",
        json={
            "email": "designer3@novacraft.io",
            "password": "Password@123",
            "full_name": "Third Designer",
            "role": "EMPLOYEE",
        },
        headers={"Authorization": f"Bearer {novacraft_token}"},
    )
    assert create_u3.status_code == 200
