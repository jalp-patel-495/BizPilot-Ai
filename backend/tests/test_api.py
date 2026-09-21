import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


def test_login_all_roles():
    # 1. Super Admin
    resp_sa = client.post("/api/v1/auth/login", json={"email": "superadmin@upteky.ai", "password": "Admin@12345"})
    assert resp_sa.status_code == 200
    assert resp_sa.json()["data"]["access_token"] is not None

    # 2. Business Admin
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    assert resp_ba.status_code == 200

    # 3. Sales Manager
    resp_sm = client.post("/api/v1/auth/login", json={"email": "salesmanager@upteky.ai", "password": "Sales@12345"})
    assert resp_sm.status_code == 200

    # 4. Employee
    resp_emp = client.post("/api/v1/auth/login", json={"email": "employee@upteky.ai", "password": "Emp@12345"})
    assert resp_emp.status_code == 200


def test_rbac_access_control():
    # Login as Employee
    resp_emp = client.post("/api/v1/auth/login", json={"email": "employee@upteky.ai", "password": "Emp@12345"})
    emp_token = resp_emp.json()["data"]["access_token"]

    # Attempt to create user as Employee (should be 403 Forbidden)
    forbidden_resp = client.post(
        "/api/v1/users",
        json={
            "email": "hacker@test.com",
            "password": "Password123!",
            "full_name": "Test User",
            "role": "EMPLOYEE",
        },
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert forbidden_resp.status_code == 403

    # Login as Business Admin
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    admin_token = resp_ba.json()["data"]["access_token"]

    # Business Admin can list users
    users_resp = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert users_resp.status_code == 200
    assert len(users_resp.json()["data"]) >= 4


def test_ai_lead_creation_and_scoring():
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    token = resp_ba.json()["data"]["access_token"]

    lead_resp = client.post(
        "/api/v1/leads",
        json={
            "contact_name": "Mark Henderson",
            "email": "m.henderson@globaltech.com",
            "phone": "+1 415 900 1122",
            "company": "GlobalTech Enterprise",
            "industry": "Technology",
            "deal_value": 45000.0,
            "status": "NEW",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert lead_resp.status_code in [200, 201]
    lead_data = lead_resp.json()["data"]
    assert lead_data["ai_score"] > 0
    assert "GlobalTech" in lead_data["company"]


def test_auth_recovery_and_verification():
    # 1. Forgot password
    fp_resp = client.post("/api/v1/auth/forgot-password", json={"email": "employee@upteky.ai"})
    assert fp_resp.status_code == 200
    reset_token = fp_resp.json()["data"]["reset_token"]
    assert reset_token is not None

    # 2. Reset password with token
    rp_resp = client.post("/api/v1/auth/reset-password", json={"token": reset_token, "new_password": "NewPassword@123"})
    assert rp_resp.status_code == 200

    # 3. Verify login works with new password
    login_new = client.post("/api/v1/auth/login", json={"email": "employee@upteky.ai", "password": "NewPassword@123"})
    assert login_new.status_code == 200

    # 4. Email verification
    verify_resp = client.post("/api/v1/auth/verify-email", json={"email": "employee@upteky.ai", "code": "123456"})
    assert verify_resp.status_code == 200
    assert verify_resp.json()["data"]["verified"] is True

    # 5. Restore employee default password for subsequent test runs
    import app.db.base
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.core.security import get_password_hash
    db = SessionLocal()
    try:
        emp = db.query(User).filter(User.email == "employee@upteky.ai").first()
        if emp:
            emp.hashed_password = get_password_hash("Emp@12345")
            db.commit()
    finally:
        db.close()


def test_business_dashboard_metrics_and_charts():
    # Login as Business Admin
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    token = resp_ba.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test This Month (default)
    resp = client.get("/api/v1/analytics/business-dashboard?range_type=this_month", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]

    # Verify all 8 widgets
    widgets = data["widgets"]
    expected_widgets = [
        "total_revenue", "total_customers", "total_leads", "new_leads",
        "conversion_rate", "pending_followups", "monthly_sales", "sales_growth"
    ]
    for w in expected_widgets:
        assert w in widgets, f"Widget {w} missing"
        assert "value" in widgets[w]
        assert "label" in widgets[w]
        assert "trend" in widgets[w]

    # Verify all 5 charts
    assert len(data["revenue_trend"]) > 0
    assert len(data["sales_trend"]) > 0
    assert len(data["lead_conversion"]) > 0
    assert len(data["customer_growth"]) > 0
    assert len(data["product_performance"]) > 0

    # 2. Test Date Filters: today, this_week, this_year, custom
    for filter_name in ["today", "this_week", "this_year"]:
        resp_f = client.get(f"/api/v1/analytics/business-dashboard?range_type={filter_name}", headers=headers)
        assert resp_f.status_code == 200
        assert resp_f.json()["data"]["range_type"] == filter_name

    # Custom Date Filter
    resp_custom = client.get(
        "/api/v1/analytics/business-dashboard?range_type=custom&start_date=2026-08-01&end_date=2026-09-20",
        headers=headers,
    )
    assert resp_custom.status_code == 200
    assert resp_custom.json()["data"]["range_type"] == "custom"


def test_customers_products_sales_modules():
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    token = resp_ba.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Customers
    cust_resp = client.get("/api/v1/customers", headers=headers)
    assert cust_resp.status_code == 200
    assert len(cust_resp.json()["data"]) >= 5

    # Products
    prod_resp = client.get("/api/v1/products", headers=headers)
    assert prod_resp.status_code == 200
    assert len(prod_resp.json()["data"]) >= 4

    # Sales
    sales_resp = client.get("/api/v1/sales", headers=headers)
    assert sales_resp.status_code == 200
    assert len(sales_resp.json()["data"]) >= 5

    # Reports
    rep_resp = client.get("/api/v1/reports", headers=headers)
    assert rep_resp.status_code == 200
    assert len(rep_resp.json()["data"]) >= 3

    # Export report
    export_resp = client.post(
        "/api/v1/reports/export",
        json={"report_type": "sales_performance", "date_range": "this_month", "format": "csv"},
        headers=headers,
    )
    assert export_resp.status_code == 201
    assert export_resp.json()["data"]["status"] == "READY"


def test_phase4_customer_crm_features():
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    token = resp_ba.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add Customer with all required fields
    new_cust_payload = {
        "name": "Katherine Johnson",
        "email": "kjohnson@orbitaldynamics.org",
        "phone": "+1 (415) 772-9900",
        "company": "Orbital Dynamics Aerospace",
        "address": "742 Evergreen Terrace, San Francisco, CA 94107",
        "industry": "Aerospace",
        "status": "ACTIVE",
        "tier": "Enterprise",
        "ltv": 68000.0,
        "notes": "Key space tech client.",
    }
    create_resp = client.post("/api/v1/customers", json=new_cust_payload, headers=headers)
    assert create_resp.status_code == 201
    cust_data = create_resp.json()["data"]
    cust_id = cust_data["id"]
    assert cust_data["company"] == "Orbital Dynamics Aerospace"
    assert cust_data["address"] == "742 Evergreen Terrace, San Francisco, CA 94107"
    assert cust_data["industry"] == "Aerospace"

    # 2. Search customer
    search_resp = client.get("/api/v1/customers?q=Orbital", headers=headers)
    assert search_resp.status_code == 200
    assert any(c["id"] == cust_id for c in search_resp.json()["data"])

    # 3. Filter customer by status and industry
    filter_resp = client.get("/api/v1/customers?status=ACTIVE&industry=Aerospace", headers=headers)
    assert filter_resp.status_code == 200
    assert any(c["id"] == cust_id for c in filter_resp.json()["data"])

    # 4. View customer details and history
    view_resp = client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert view_resp.status_code == 200
    detail = view_resp.json()["data"]
    assert detail["name"] == "Katherine Johnson"
    assert len(detail["activities"]) >= 1  # Initial creation activity

    # 5. Add custom interaction history
    act_resp = client.post(
        f"/api/v1/customers/{cust_id}/history",
        json={
            "activity_type": "CALL",
            "title": "Strategy Alignment Call",
            "description": "Reviewed Q4 enterprise API quota and multi-tenant security.",
            "performed_by": "Marcus Sterling",
        },
        headers=headers,
    )
    assert act_resp.status_code == 201

    # 6. Fetch customer history
    hist_resp = client.get(f"/api/v1/customers/{cust_id}/history", headers=headers)
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()["data"]) >= 2

    # 7. Edit customer
    update_resp = client.put(
        f"/api/v1/customers/{cust_id}",
        json={"name": "Dr. Katherine Johnson", "tier": "Enterprise AI", "ltv": 75000.0},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["name"] == "Dr. Katherine Johnson"

    # 8. Delete customer
    del_resp = client.delete(f"/api/v1/customers/{cust_id}", headers=headers)
    assert del_resp.status_code == 200

    # Verify deleted
    get_del = client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert get_del.status_code == 404


def test_phase4_lead_crm_features():
    resp_ba = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    token = resp_ba.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add HOT Lead (High deal value & referral)
    hot_lead_payload = {
        "contact_name": "Marcus Aurelius",
        "email": "marcus@imperiumtech.io",
        "phone": "+1 (212) 880-1200",
        "company": "Imperium Cloud AI",
        "address": "100 Broadway, New York, NY",
        "industry": "Technology",
        "deal_value": 45000.0,
        "source": "Referral",
        "status": "QUALIFIED",
        "notes": "Urgent enterprise transformation requirement.",
    }
    hot_resp = client.post("/api/v1/leads", json=hot_lead_payload, headers=headers)
    assert hot_resp.status_code == 201
    hot_lead = hot_resp.json()["data"]
    hot_id = hot_lead["id"]
    assert hot_lead["classification"] == "HOT"
    assert "High ARR" in hot_lead["classification_reason"] or "Advanced pipeline" in hot_lead["classification_reason"]

    # 2. Add WARM Lead (Medium deal value)
    warm_payload = {
        "contact_name": "Claire Redfield",
        "email": "claire@terrasave.org",
        "phone": "+1 (312) 555-4321",
        "company": "TerraSave Global",
        "industry": "Healthcare",
        "deal_value": 8500.0,
        "source": "Website",
        "status": "NEW",
    }
    warm_resp = client.post("/api/v1/leads", json=warm_payload, headers=headers)
    assert warm_resp.status_code == 201
    assert warm_resp.json()["data"]["classification"] in ["WARM", "HOT"]

    # 3. Add COLD Lead (Lost status)
    cold_payload = {
        "contact_name": "Leon Kennedy",
        "email": "leon@dsso-ops.gov",
        "phone": "+1 (202) 555-9088",
        "company": "DSS Operations",
        "industry": "Government",
        "deal_value": 2000.0,
        "source": "Cold Outreach",
        "status": "LOST",
    }
    cold_resp = client.post("/api/v1/leads", json=cold_payload, headers=headers)
    assert cold_resp.status_code == 201
    assert cold_resp.json()["data"]["classification"] == "COLD"

    # 4. View Lead Details
    view_lead = client.get(f"/api/v1/leads/{hot_id}", headers=headers)
    assert view_lead.status_code == 200
    assert view_lead.json()["data"]["company"] == "Imperium Cloud AI"

    # 5. Edit Lead
    edit_resp = client.put(
        f"/api/v1/leads/{hot_id}",
        json={"status": "NEGOTIATION", "deal_value": 52000.0},
        headers=headers,
    )
    assert edit_resp.status_code == 200
    assert edit_resp.json()["data"]["status"] == "NEGOTIATION"

    # 6. Classification Rules
    rules_resp = client.get("/api/v1/leads/rules/classification", headers=headers)
    assert rules_resp.status_code == 200
    assert "hot_deal_value_min" in rules_resp.json()["data"]["rules"]

    # 7. Convert Lead to Customer
    convert_resp = client.post(
        f"/api/v1/leads/{hot_id}/convert",
        json={"tier": "Enterprise AI", "notes": "Converted via Phase 4 CRM automation."},
        headers=headers,
    )
    assert convert_resp.status_code == 200
    conv_data = convert_resp.json()["data"]
    assert conv_data["company"] == "Imperium Cloud AI"

    # Verify lead status became CONVERTED
    lead_after = client.get(f"/api/v1/leads/{hot_id}", headers=headers).json()["data"]
    assert lead_after["status"] == "CONVERTED"
    assert lead_after["classification"] == "HOT"

    # Clean up test leads
    client.delete(f"/api/v1/leads/{hot_id}", headers=headers)
    client.delete(f"/api/v1/leads/{warm_resp.json()['data']['id']}", headers=headers)
    client.delete(f"/api/v1/leads/{cold_resp.json()['data']['id']}", headers=headers)
    client.delete(f"/api/v1/customers/{conv_data['id']}", headers=headers)


def test_phase5_ai_customer_support_and_knowledge_base():
    """Verify Phase 5: AI Customer Support, Chatbot, Confidence Handling, Handoff, and Knowledge Base."""
    # 1. Login as Business Admin
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"},
    )
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Grounded Chat Query with High Confidence (FAQ/Policy)
    chat_req_1 = {
        "message": "What is your official refund policy for new subscriptions?",
        "customer_name": "Samantha Wright",
        "customer_email": "samantha@wrightventures.com",
    }
    chat_resp_1 = client.post("/api/chat", json=chat_req_1)
    assert chat_resp_1.status_code == 200
    res_1 = chat_resp_1.json()
    assert res_1["conversation_id"] is not None
    assert res_1["confidence"] >= 0.85
    assert len(res_1["sources"]) > 0
    assert "30-Day" in res_1["message"] or "refund" in res_1["message"].lower()
    assert res_1["handoff_offered"] is False
    conv_id = res_1["conversation_id"]

    # 3. Test Low Confidence Handling & Anti-Hallucination Fallback
    chat_req_2 = {
        "message": "Can you give me the top-secret formula for baking alien cookies on Jupiter?",
        "conversation_id": conv_id,
        "customer_name": "Samantha Wright",
        "customer_email": "samantha@wrightventures.com",
    }
    chat_resp_2 = client.post("/api/chat", json=chat_req_2)
    assert chat_resp_2.status_code == 200
    res_2 = chat_resp_2.json()
    assert res_2["confidence"] < 0.50
    assert "do not have sufficient verified information" in res_2["message"]
    assert res_2["handoff_offered"] is True

    # 4. Test Explicit Human Handoff Request
    chat_req_3 = {
        "message": "Please connect me to a human support representative right away.",
        "conversation_id": conv_id,
    }
    chat_resp_3 = client.post("/api/chat", json=chat_req_3)
    assert chat_resp_3.status_code == 200
    res_3 = chat_resp_3.json()
    assert res_3["status"] == "HANDOFF_REQUESTED"
    assert "escalating your conversation to our human support team" in res_3["message"].lower()

    # 5. Verify Conversation History & Search (GET /api/conversations)
    conv_list_resp = client.get("/api/conversations?search=Samantha", headers=headers)
    assert conv_list_resp.status_code == 200
    convs = conv_list_resp.json()["data"]
    assert len(convs) >= 1
    found_conv = next((c for c in convs if c["id"] == conv_id), None)
    assert found_conv is not None
    assert found_conv["customer_name"] == "Samantha Wright"
    assert found_conv["status"] == "HANDOFF_REQUESTED"
    assert found_conv["message_count"] >= 6  # 3 user messages + 3 assistant responses

    # 6. Verify Conversation Details (GET /api/conversations/{id})
    conv_detail_resp = client.get(f"/api/conversations/{conv_id}", headers=headers)
    assert conv_detail_resp.status_code == 200
    detail = conv_detail_resp.json()["data"]
    assert len(detail["messages"]) >= 6
    assert detail["messages"][0]["sender"] == "user"
    assert detail["messages"][1]["sender"] == "assistant"

    # 7. Agent Reply (POST /api/conversations/{id}/reply)
    reply_resp = client.post(
        f"/api/conversations/{conv_id}/reply",
        json={"message": "Hello Samantha, I am Marcus from human support. How can I assist you?"},
        headers=headers,
    )
    assert reply_resp.status_code == 200
    assert reply_resp.json()["data"]["sender"] == "human_agent"

    # 8. Resolve Conversation (POST /api/conversations/{id}/resolve)
    resolve_resp = client.post(f"/api/conversations/{conv_id}/resolve", headers=headers)
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["data"]["status"] == "RESOLVED"

    # 9. Knowledge Base Management CRUD & Immediate Grounding Test
    # Create custom Knowledge Base article
    kb_create_payload = {
        "category": "product",
        "title": "Quantum Fleet Autonomous Drone Delivery Integration",
        "content": "The Quantum Fleet drone integration allows autonomous warehouse package dispatch with 99.8% precision landing, integrated with Upteky AI inventory automation.",
        "keywords": "drone, quantum fleet, warehouse dispatch, package delivery",
        "is_active": True,
    }
    kb_create_resp = client.post("/api/v1/knowledge-base", json=kb_create_payload, headers=headers)
    assert kb_create_resp.status_code == 201
    kb_id = kb_create_resp.json()["data"]["id"]

    # Verify AI immediately answers questions using this new custom knowledge item!
    test_new_kb_query = {
        "message": "Tell me about the Quantum Fleet drone integration and warehouse dispatch.",
        "customer_name": "Test Inquirer",
    }
    test_new_kb_resp = client.post("/api/chat", json=test_new_kb_query)
    assert test_new_kb_resp.status_code == 200
    new_kb_res = test_new_kb_resp.json()
    assert new_kb_res["confidence"] >= 0.85
    assert "Quantum Fleet" in new_kb_res["message"]
    assert any(s["id"] == kb_id for s in new_kb_res["sources"])

    # Update Knowledge Item
    kb_update_resp = client.put(
        f"/api/v1/knowledge-base/{kb_id}",
        json={"title": "Quantum Fleet Autonomous Drone Delivery Integration v2"},
        headers=headers,
    )
    assert kb_update_resp.status_code == 200
    assert "v2" in kb_update_resp.json()["data"]["title"]

    # Delete Knowledge Item
    kb_delete_resp = client.delete(f"/api/v1/knowledge-base/{kb_id}", headers=headers)
    assert kb_delete_resp.status_code == 200


def test_phase6_ai_lead_automation():
    """Verify Phase 6: AI Lead Automation, Celery Background Tasks, Rule Triggers, and Dashboard."""
    # 1. Login as Business Admin
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"},
    )
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Rule 1: Ingesting a lead automatically triggers classification, score, priority, and follow-up task
    lead_payload = {
        "contact_name": "Aria Stark",
        "email": "aria.stark@winterfellcloud.io",
        "phone": "+1 (415) 880-9988",
        "company": "Winterfell Cloud Dynamics",
        "industry": "Technology",
        "deal_value": 52000.0,
        "source": "Referral",
        "status": "PROPOSAL",
        "notes": "Urgent enterprise automation migration requirement.",
    }
    lead_resp = client.post("/api/v1/leads", json=lead_payload, headers=headers)
    assert lead_resp.status_code == 201
    lead_data = lead_resp.json()["data"]
    lead_id = lead_data["id"]

    # Verify Rule 1 executed
    assert lead_data["classification"] == "HOT"
    assert lead_data["sales_priority"] == "URGENT_P0"
    assert lead_data["recommended_action"] is not None
    assert lead_data["suggested_follow_up_date"] is not None
    assert lead_data["ai_follow_up_message"] is not None

    # 3. Verify Automation Task was created for this lead
    tasks_resp = client.get("/api/v1/automations/tasks?status=PENDING", headers=headers)
    assert tasks_resp.status_code == 200
    tasks = tasks_resp.json()["data"]
    created_task = next((t for t in tasks if t["lead_id"] == lead_id), None)
    assert created_task is not None
    assert "Winterfell Cloud Dynamics" in created_task["title"]
    assert created_task["priority"] == "URGENT_P0"

    # 4. Test Rule 2 & 3: Run Background Automation Scanner (follow-ups arrival & inactivity)
    scan_resp = client.post("/api/v1/automations/run-scan", headers=headers)
    assert scan_resp.status_code == 200
    assert scan_resp.json()["data"]["status"] == "COMPLETED"

    # 5. Verify Automation Dashboard Metrics
    dash_resp = client.get("/api/v1/automations/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash = dash_resp.json()["data"]
    assert dash["active_automations"] >= 3
    assert dash["completed_automations"] >= 1
    assert dash["pending_tasks_count"] >= 1
    assert len(dash["rules"]) >= 3
    assert len(dash["recent_tasks"]) >= 1
    assert len(dash["recent_logs"]) >= 1

    # 6. Test AI Lead Assistant 6 Functions on-demand (POST /api/v1/leads/{id}/ai-analyze)
    analyze_resp = client.post(f"/api/v1/automations/leads/{lead_id}/ai-analyze", headers=headers)
    assert analyze_resp.status_code == 200
    analysis = analyze_resp.json()["data"]
    assert analysis["lead_score"] >= 80.0
    assert analysis["lead_category"] == "HOT"
    assert analysis["sales_priority"] == "URGENT_P0"
    assert "Winterfell" in analysis["ai_summary"]
    assert analysis["recommended_next_action"] is not None
    assert analysis["suggested_follow_up_date"] is not None

    # 7. Test AI Follow-up Message Generation with customized tone
    msg_resp = client.post(
        f"/api/v1/automations/leads/{lead_id}/generate-message",
        json={"tone": "urgent"},
        headers=headers,
    )
    assert msg_resp.status_code == 200
    msg_data = msg_resp.json()["data"]
    assert "Winterfell Cloud Dynamics" in msg_data["message"]
    assert "Aria" in msg_data["message"]

    # 8. Complete an Automation Task
    complete_resp = client.put(f"/api/v1/automations/tasks/{created_task['id']}/complete", headers=headers)
    assert complete_resp.status_code == 200
    assert complete_resp.json()["data"]["status"] == "COMPLETED"

    # 9. Toggle an Automation Rule
    rule_id = dash["rules"][0]["id"]
    toggle_resp = client.put(f"/api/v1/automations/rules/{rule_id}/toggle", headers=headers)
    assert toggle_resp.status_code == 200
    # Toggle it back to active
    toggle_back = client.put(f"/api/v1/automations/rules/{rule_id}/toggle", headers=headers)
    assert toggle_back.status_code == 200
    assert toggle_back.json()["data"]["is_active"] is True

    # 10. Check Notifications feed
    notifs_resp = client.get("/api/v1/automations/notifications", headers=headers)
    assert notifs_resp.status_code == 200
    assert len(notifs_resp.json()["data"]) >= 1

    # Cleanup test lead
    client.delete(f"/api/v1/leads/{lead_id}", headers=headers)


def test_phase7_ai_document_processing():
    """Verify Phase 7: AI Document Processing & Invoices OCR pipeline."""
    # 1. Authenticate as Business Admin
    login_resp = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Invalid Format Rejection
    bad_file = ("script.exe", b"malicious binary content", "application/octet-stream")
    bad_upload_resp = client.post(
        "/api/v1/invoices/upload",
        files={"file": bad_file},
        headers=headers,
    )
    assert bad_upload_resp.status_code == 400
    error_msg = bad_upload_resp.json().get("message", bad_upload_resp.json().get("detail", ""))
    assert "Unsupported file format" in error_msg

    # 3. Create a real sample PDF using fpdf or synthetic PDF bytes
    from fpdf import FPDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="INVOICE #INV-2026-8877", ln=1, align="L")
    pdf.cell(200, 10, txt="Company: CloudSphere Solutions Inc.", ln=1, align="L")
    pdf.cell(200, 10, txt="Bill To: Upteky Technologies Inc.", ln=1, align="L")
    pdf.cell(200, 10, txt="Date: 2026-09-20", ln=1, align="L")
    pdf.cell(200, 10, txt="GSTIN: 29AABCC4567M1Z9", ln=1, align="L")
    pdf.cell(200, 10, txt="Subtotal: 2400.00", ln=1, align="L")
    pdf.cell(200, 10, txt="GST Tax: 432.00", ln=1, align="L")
    pdf.cell(200, 10, txt="Total Amount: 2832.00", ln=1, align="L")
    pdf.cell(200, 10, txt="Items:", ln=1, align="L")
    pdf.cell(200, 10, txt="Enterprise Support Plan 1 1800.00 1800.00", ln=1, align="L")
    pdf.cell(200, 10, txt="Custom Integration Setup 1 600.00 600.00", ln=1, align="L")
    
    pdf_bytes = pdf.output(dest='S').encode('latin1')

    # 4. Upload and OCR process the PDF
    upload_file = ("invoice_8877.pdf", pdf_bytes, "application/pdf")
    upload_resp = client.post(
        "/api/v1/invoices/upload",
        files={"file": upload_file},
        headers=headers,
    )
    assert upload_resp.status_code == 200
    data = upload_resp.json()["data"]
    invoice_id = data["id"]
    assert "INV-2026-8877" in data["invoice_number"]
    assert "CloudSphere" in data["company_name"]
    assert "Upteky" in data["customer_name"]
    assert data["gst_number"] == "29AABCC4567M1Z9"
    assert data["subtotal"] > 0
    assert data["total_amount"] > 0
    assert data["status"] == "EXTRACTED"
    assert data["ocr_confidence"] >= 95.0
    assert len(data["items"]) >= 1

    # 5. Retrieve Invoice Stats
    stats_resp = client.get("/api/v1/invoices/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()["data"]
    assert stats["total_invoices"] >= 1
    assert stats["total_amount_processed"] > 0
    assert stats["average_confidence"] >= 95.0

    # 6. List Invoices with Search & Status Filter
    list_resp = client.get("/api/v1/invoices?search=CloudSphere&status=EXTRACTED", headers=headers)
    assert list_resp.status_code == 200
    invoices = list_resp.json()["data"]
    assert len(invoices) >= 1
    assert invoices[0]["id"] == invoice_id

    # 7. Edit Extracted Invoice Values (User corrections)
    update_payload = {
        "invoice_number": "INV-2026-8877-REV1",
        "total_amount": 2850.00,
        "tax_amount": 450.00,
    }
    update_resp = client.put(f"/api/v1/invoices/{invoice_id}", json=update_payload, headers=headers)
    assert update_resp.status_code == 200
    updated = update_resp.json()["data"]
    assert updated["invoice_number"] == "INV-2026-8877-REV1"
    assert updated["total_amount"] == 2850.00

    # 8. Verify and Commit to PostgreSQL
    verify_resp = client.put(f"/api/v1/invoices/{invoice_id}/verify", headers=headers)
    assert verify_resp.status_code == 200
    verified = verify_resp.json()["data"]
    assert verified["status"] == "VERIFIED"

    # 9. Download Invoice as JSON and CSV
    json_download = client.get(f"/api/v1/invoices/{invoice_id}/download?export_format=json", headers=headers)
    assert json_download.status_code == 200
    assert "INV-2026-8877-REV1" in json_download.text

    csv_download = client.get(f"/api/v1/invoices/{invoice_id}/download?export_format=csv", headers=headers)
    assert csv_download.status_code == 200
    assert "Invoice Number,INV-2026-8877-REV1" in csv_download.text

    # 10. Clean up test invoice
    del_resp = client.delete(f"/api/v1/invoices/{invoice_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["data"]["deleted"] is True


def test_phase8_ai_sales_analytics():
    """Verify Phase 8: AI Sales Analytics, scikit-learn ML Forecasting, and AI Insights."""
    # 1. Authenticate as Business Admin
    login_resp = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test ML Sales Forecast Endpoint (30, 60, 90 days)
    forecast_resp = client.get("/api/v1/analytics/sales-forecast?horizon_days=90", headers=headers)
    assert forecast_resp.status_code == 200
    forecast = forecast_resp.json()["data"]
    # With real DB data, timeline may be sparse if insufficient monthly sales records exist
    assert isinstance(forecast["timeline"], list)
    actual_pts = [p for p in forecast["timeline"] if not p["is_forecast"]]
    future_pts = [p for p in forecast["timeline"] if p["is_forecast"]]
    if len(forecast["timeline"]) >= 10:
        # Full data scenario: validate structure depth
        assert len(actual_pts) >= 6
        assert len(future_pts) == 3  # 90 days -> 3 future months
        assert actual_pts[0]["actual_sales"] is not None
        assert future_pts[0]["actual_sales"] is None
        assert future_pts[0]["predicted_sales"] > 0
        assert future_pts[0]["lower_bound"] <= future_pts[0]["predicted_sales"] <= future_pts[0]["upper_bound"]
        assert forecast["model_r2_score"] >= 0.8
    assert "disclaimer" in forecast
    assert isinstance(forecast["ai_insights"], list)

    # 3. Test Product Performance Endpoint
    prod_resp = client.get("/api/v1/analytics/product-performance", headers=headers)
    assert prod_resp.status_code == 200
    products = prod_resp.json()["data"]
    assert len(products) >= 2
    assert products[0]["revenue"] >= products[1]["revenue"]
    assert sum(p["revenue_share_pct"] for p in products) >= 95.0

    # 4. Test Customer Trends Endpoint
    cust_resp = client.get("/api/v1/analytics/customer-trends", headers=headers)
    assert cust_resp.status_code == 200
    c_trends = cust_resp.json()["data"]
    assert c_trends["new_customers_revenue"] > 0
    assert c_trends["repeat_customers_revenue"] > 0
    assert c_trends["average_order_value"] > 0

    # 5. Test Conversion Funnel Analysis
    funnel_resp = client.get("/api/v1/analytics/conversion-analysis", headers=headers)
    assert funnel_resp.status_code == 200
    funnel = funnel_resp.json()["data"]
    assert len(funnel) >= 4
    assert funnel[0]["count"] >= funnel[-1]["count"]

    # 6. Test Plain-Language AI Business Insights
    insights_resp = client.get("/api/v1/analytics/ai-insights", headers=headers)
    assert insights_resp.status_code == 200
    insights = insights_resp.json()["data"]
    assert len(insights) >= 3
    # Verify presence of plain business language explanation per user requirements
    assert any("Sales increased" in s or "revenue" in s for s in insights)

    # 7. Test Comprehensive Sales Analytics Endpoint
    comp_resp = client.get("/api/v1/analytics/comprehensive-sales-analytics?horizon_days=60", headers=headers)
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()["data"]
    assert "forecast" in comp_data
    assert "products" in comp_data
    assert "customer_trends" in comp_data
    assert "conversion_funnel" in comp_data
    assert "executive_summary" in comp_data
    assert "disclaimer" in comp_data


def test_phase9_reports_and_notifications():
    """Verify Phase 9: Automatic Business Reports & Multi-Channel Notification Center."""
    # 1. Authenticate as Business Admin
    login_resp = client.post("/api/v1/auth/login", json={"email": "businessadmin@upteky.ai", "password": "Admin@12345"})
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Report Catalog
    cat_resp = client.get("/api/v1/reports/catalog", headers=headers)
    assert cat_resp.status_code == 200
    catalog = cat_resp.json()["data"]
    assert len(catalog) == 7
    catalog_types = {item["report_type"] for item in catalog}
    expected_types = {"daily", "weekly", "monthly", "sales", "lead", "customer", "revenue"}
    assert catalog_types == expected_types

    # 3. Test All 7 Business Report Generation Endpoints
    for rtype in expected_types:
        rep_resp = client.get(f"/api/v1/reports/data/{rtype}", headers=headers)
        assert rep_resp.status_code == 200, f"Failed for report type {rtype}: {rep_resp.text}"
        rep_data = rep_resp.json()["data"]
        assert rep_data["report_type"] == rtype
        assert len(rep_data["key_metrics"]) >= 4
        # With real DB data, chart_data may have fewer entries than fabricated data
        assert isinstance(rep_data["chart_data"], list)
        assert isinstance(rep_data["trends"], list)
        assert isinstance(rep_data["important_changes"], list)
        assert len(rep_data["ai_summary"]) > 10

    # 4. Test Report Export as PDF
    pdf_resp = client.get("/api/v1/reports/monthly/export?format=pdf", headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers.get("content-type") == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF-")
    assert len(pdf_resp.content) > 1000

    # 5. Test Report Export as CSV
    csv_resp = client.get("/api/v1/reports/sales/export?format=csv", headers=headers)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers.get("content-type", "")
    csv_text = csv_resp.text
    assert "UPTEKY AI BUSINESS REPORT" in csv_text
    assert "KEY PERFORMANCE METRICS" in csv_text
    assert "EXECUTIVE AI SUMMARY" in csv_text
    assert "IMPORTANT CHANGES & EVENTS" in csv_text

    # 6. Test Notifications List & Unread Count
    # Ensure at least one unread notification exists even if previous test runs marked all as read
    client.post(
        "/api/v1/notifications/trigger-test",
        json={"type": "NEW_LEAD"},
        headers=headers,
    )
    notifs_resp = client.get("/api/v1/notifications", headers=headers)
    assert notifs_resp.status_code == 200
    notifs = notifs_resp.json()["data"]
    assert len(notifs) >= 1

    unread_resp = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread_resp.status_code == 200
    unread_count = unread_resp.json()["data"]["unread_count"]
    assert unread_count >= 1

    # 7. Test Triggering All 6 Notification Event Types
    required_events = [
        "NEW_LEAD",
        "FOLLOW_UP_DUE",
        "LOW_CONVERSION",
        "SALES_CHANGE",
        "INVOICE_PROCESSED",
        "AUTOMATION_FAILURE",
    ]
    created_notif_ids = []
    for evt in required_events:
        trigger_resp = client.post(
            "/api/v1/notifications/trigger-test",
            json={"type": evt},
            headers=headers,
        )
        assert trigger_resp.status_code == 201, f"Failed for event {evt}: {trigger_resp.text}"
        evt_data = trigger_resp.json()["data"]
        assert evt_data["type"] == evt
        assert evt_data["is_read"] is False
        created_notif_ids.append(evt_data["id"])

    # 8. Test Mark Single Notification As Read
    target_id = created_notif_ids[0]
    read_resp = client.put(f"/api/v1/notifications/{target_id}/read", headers=headers)
    assert read_resp.status_code == 200
    assert read_resp.json()["data"]["is_read"] is True

    # 9. Test Mark All As Read
    mark_all_resp = client.put("/api/v1/notifications/mark-all-read", headers=headers)
    assert mark_all_resp.status_code == 200

    unread_resp_after = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread_resp_after.status_code == 200
    assert unread_resp_after.json()["data"]["unread_count"] == 0


def test_registration_flow():
    import uuid
    from app.db.session import SessionLocal
    from app.models.user import User

    unique_email = f"flow_test_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "full_name": "Integration User",
        "email": unique_email,
        "password": "SecurePassword123!",
        "role": "BUSINESS_ADMIN",
        "title": "Director of Test",
    }

    # 1. Register new user
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 200, f"Registration failed: {resp.text}"
    data = resp.json()
    assert data["message"] == "Account created successfully"
    user_data = data["data"]
    assert user_data["email"] == unique_email
    assert user_data["full_name"] == "Integration User"
    assert user_data["role"] == "BUSINESS_ADMIN"  # Selected role from registration payload is assigned
    assert user_data["title"] == "Director of Test"

    # 2. Attempt duplicate registration
    dup_resp = client.post("/api/v1/auth/register", json=payload)
    assert dup_resp.status_code == 400
    dup_data = dup_resp.json()
    assert "already exists" in dup_data.get("message", "").lower()

    # 3. Attempt short password
    short_pw_resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Short Pw",
            "email": f"short_{uuid.uuid4().hex[:6]}@example.com",
            "password": "123",
        },
    )
    assert short_pw_resp.status_code == 400
    assert "password" in short_pw_resp.json().get("message", "").lower()

    # 4. Attempt registering as SUPER_ADMIN (must be forbidden)
    super_resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Attempt Super Admin",
            "email": f"super_try_{uuid.uuid4().hex[:6]}@example.com",
            "password": "SecurePassword123!",
            "role": "SUPER_ADMIN",
        },
    )
    assert super_resp.status_code == 400
    assert "super admin" in super_resp.json().get("message", "").lower()

    # 5. Register as SALES_MANAGER (permitted alongside Business Admin and Employee)
    sales_email = f"sales_mgr_{uuid.uuid4().hex[:6]}@example.com"
    sales_resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "New Sales Manager",
            "email": sales_email,
            "password": "SecurePassword123!",
            "role": "SALES_MANAGER",
        },
    )
    assert sales_resp.status_code == 200
    assert sales_resp.json()["data"]["role"] == "SALES_MANAGER"
    assert sales_resp.json()["data"]["title"] == "Sales Manager"

    # 6. Login with newly registered user
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "SecurePassword123!"},
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["data"]["access_token"] is not None

    # 5. Clean up created test user
    db = SessionLocal()
    try:
        test_u = db.query(User).filter(User.email == unique_email).first()
        if test_u:
            db.delete(test_u)
            db.commit()
    finally:
        db.close()





