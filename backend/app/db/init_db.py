import sys
from pathlib import Path

# Ensure backend root is in sys.path for direct script execution
_backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base

import app.db.base  # Ensures all models are loaded
from app.core.security import get_password_hash
from app.core.rbac import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.models.lead import Lead
from app.models.invoice import Invoice
from app.models.support_ticket import SupportTicket
from app.models.audit_log import AuditLog
from app.models.customer import Customer
from sqlalchemy import inspect, text
from app.models.product import Product
from app.models.sale import Sale
from app.models.customer_activity import CustomerActivity
from app.models.conversation import Conversation
from app.models.chat_message import ChatMessage
from app.models.knowledge_item import KnowledgeItem
from app.models.automation_rule import AutomationRule
from app.models.automation_task import AutomationTask
from app.models.automation_log import AutomationLog
from app.models.notification import Notification
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.system_usage import SystemUsage
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("upteky.init_db")


def ensure_schema_columns(bind_engine):
    inspector = inspect(bind_engine)
    with bind_engine.connect() as conn:
        if "leads" in inspector.get_table_names():
            lead_cols = [c["name"] for c in inspector.get_columns("leads")]
            if "address" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN address VARCHAR(255) DEFAULT ''"))
            if "source" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN source VARCHAR(100) DEFAULT 'Website'"))
            if "follow_up_date" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN follow_up_date DATETIME"))
            if "classification" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN classification VARCHAR(50) DEFAULT 'WARM'"))
            if "classification_reason" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN classification_reason VARCHAR(255)"))
            if "sales_priority" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN sales_priority VARCHAR(50) DEFAULT 'HIGH_P1'"))
            if "recommended_action" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN recommended_action TEXT"))
            if "suggested_follow_up_date" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN suggested_follow_up_date DATETIME"))
            if "ai_follow_up_message" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN ai_follow_up_message TEXT"))
            if "last_activity_date" not in lead_cols:
                conn.execute(text("ALTER TABLE leads ADD COLUMN last_activity_date DATETIME"))
            conn.commit()


        if "customers" in inspector.get_table_names():
            cust_cols = [c["name"] for c in inspector.get_columns("customers")]
            if "address" not in cust_cols:
                conn.execute(text("ALTER TABLE customers ADD COLUMN address VARCHAR(255) DEFAULT ''"))
            if "industry" not in cust_cols:
                conn.execute(text("ALTER TABLE customers ADD COLUMN industry VARCHAR(100) DEFAULT 'Technology'"))
            conn.commit()

        if "invoices" in inspector.get_table_names():
            inv_cols = [c["name"] for c in inspector.get_columns("invoices")]
            if "company_name" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN company_name VARCHAR(255) DEFAULT ''"))
            if "customer_name" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN customer_name VARCHAR(255) DEFAULT ''"))
            if "invoice_date" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN invoice_date DATETIME"))
            if "gst_number" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN gst_number VARCHAR(100) DEFAULT ''"))
            if "subtotal" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN subtotal FLOAT DEFAULT 0.0"))
            if "items_json" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN items_json TEXT"))
            if "file_format" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN file_format VARCHAR(20) DEFAULT 'PDF'"))
            if "original_filename" not in inv_cols:
                conn.execute(text("ALTER TABLE invoices ADD COLUMN original_filename VARCHAR(255)"))
            conn.commit()

        if "audit_logs" in inspector.get_table_names():
            audit_cols = [c["name"] for c in inspector.get_columns("audit_logs")]
            if "organization_id" not in audit_cols:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN organization_id VARCHAR(36)"))
            conn.commit()


def init_db(db: Session) -> None:
    """Initialize database tables and seed foundational data."""
    logger.info("Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_columns(engine)

    # 1. Check or Create Default Organization
    org = db.query(Organization).filter(Organization.slug == "upteky-corp").first()
    if not org:
        logger.info("Seeding default organization: Upteky Technologies...")
        org = Organization(
            name="Upteky Technologies Inc.",
            slug="upteky-corp",
            plan="Enterprise AI Suite",
            status="ACTIVE",
            is_active=True,
        )
        db.add(org)
        db.commit()
        db.refresh(org)

    # 2. Seed Default Users for all 4 Roles
    default_users = [
        {
            "email": "superadmin@upteky.ai",
            "password": "Admin@12345",
            "full_name": "Eleanor Vance (Super Admin)",
            "role": UserRole.SUPER_ADMIN.value,
            "title": "Platform Chief Architect",
        },
        {
            "email": "businessadmin@upteky.ai",
            "password": "Admin@12345",
            "full_name": "Marcus Sterling (Business Admin)",
            "role": UserRole.BUSINESS_ADMIN.value,
            "title": "VP of Operations",
        },
        {
            "email": "salesmanager@upteky.ai",
            "password": "Sales@12345",
            "full_name": "Sarah Jenkins (Sales Manager)",
            "role": UserRole.SALES_MANAGER.value,
            "title": "Director of Sales",
        },
        {
            "email": "employee@upteky.ai",
            "password": "Emp@12345",
            "full_name": "Alex Rivera (Employee)",
            "role": UserRole.EMPLOYEE.value,
            "title": "Account Operations Specialist",
        },
    ]

    for user_info in default_users:
        existing = db.query(User).filter(User.email == user_info["email"]).first()
        if not existing:
            logger.info(f"Creating default role user: {user_info['email']} [{user_info['role']}]")
            user = User(
                organization_id=org.id,
                email=user_info["email"],
                hashed_password=get_password_hash(user_info["password"]),
                full_name=user_info["full_name"],
                role=user_info["role"],
                title=user_info["title"],
                is_active=True,
            )
            db.add(user)
    db.commit()

    # Retrieve sales manager and employee for lead assignment
    sales_rep = db.query(User).filter(User.email == "salesmanager@upteky.ai").first()
    rep_id = sales_rep.id if sales_rep else None
    employee_rep = db.query(User).filter(User.email == "employee@upteky.ai").first()
    emp_id = employee_rep.id if employee_rep else rep_id

    # 3. Seed Sample Leads
    if db.query(Lead).count() == 0:
        logger.info("Seeding intelligent business leads...")
        sample_leads = [
            Lead(
                organization_id=org.id,
                assigned_to=rep_id,
                contact_name="Sophia Chen",
                email="sophia.chen@apexfin.com",
                phone="+1 (415) 882-9012",
                company="Apex Financial Solutions",
                industry="Finance",
                deal_value=48500.0,
                status="QUALIFIED",
                ai_score=94.2,
                ai_summary="High ARR potential. Looking to automate 20k monthly invoice matching cycles.",
                notes="Urgent Q4 procurement timeline.",
            ),
            Lead(
                organization_id=org.id,
                assigned_to=rep_id,
                contact_name="David Ross",
                email="d.ross@nexustech.io",
                phone="+1 (212) 555-0144",
                company="NexusTech Cloud Systems",
                industry="Technology",
                deal_value=32000.0,
                status="PROPOSAL",
                ai_score=87.5,
                ai_summary="Proposal sent for 150 user seats. AI copilot POC completed with 98% satisfaction.",
                notes="Decision board meeting next Tuesday.",
            ),
            Lead(
                organization_id=org.id,
                assigned_to=rep_id,
                contact_name="Hannah Meyer",
                email="hmeyer@biocaremed.org",
                phone="+1 (617) 344-9981",
                company="BioCare Health Network",
                industry="Healthcare",
                deal_value=65000.0,
                status="CONTACTED",
                ai_score=91.0,
                ai_summary="HIPAA-compliant document parsing and customer triage workflow requirement.",
                notes="Requested security audit checklist.",
            ),
            Lead(
                organization_id=org.id,
                assigned_to=emp_id,
                contact_name="Lucas Gomez",
                email="lgomez@omnistore.net",
                phone="+1 (305) 771-4200",
                company="OmniStore Logistics",
                industry="Retail",
                deal_value=18500.0,
                status="NEW",
                ai_score=68.4,
                ai_summary="Evaluating automated ticketing to reduce holiday season backlog.",
                notes="Inbound demo request from website.",
            ),
            Lead(
                organization_id=org.id,
                assigned_to=emp_id,
                contact_name="Emily Watson",
                email="emily@vertexai.co",
                phone="+1 (206) 881-2299",
                company="Vertex Digital Media",
                industry="Media",
                deal_value=24000.0,
                status="WON",
                ai_score=96.0,
                ai_summary="Contract signed for Annual Enterprise plan.",
                notes="Onboarding scheduled for Oct 1st.",
            ),
        ]
        db.add_all(sample_leads)
        db.commit()

    # 4. Seed Sample Invoices
    if db.query(Invoice).count() == 0:
        logger.info("Seeding processed invoices...")
        sample_invoices = [
            Invoice(
                organization_id=org.id,
                invoice_number="INV-2026-0891",
                vendor_name="AWS Cloud Hosting Inc",
                total_amount=5420.50,
                tax_amount=480.00,
                currency="USD",
                status="PAID",
                ocr_confidence=99.8,
                due_date=datetime.now(timezone.utc) + timedelta(days=15),
            ),
            Invoice(
                organization_id=org.id,
                invoice_number="INV-2026-0892",
                vendor_name="Snowflake Data Cloud",
                total_amount=8950.00,
                tax_amount=790.00,
                currency="USD",
                status="PROCESSED",
                ocr_confidence=98.9,
                due_date=datetime.now(timezone.utc) + timedelta(days=22),
            ),
            Invoice(
                organization_id=org.id,
                invoice_number="INV-2026-0893",
                vendor_name="Datadog APM & Logs",
                total_amount=3120.00,
                tax_amount=270.00,
                currency="USD",
                status="PENDING",
                ocr_confidence=97.4,
                due_date=datetime.now(timezone.utc) + timedelta(days=30),
            ),
        ]
        db.add_all(sample_invoices)
        db.commit()

    # 5. Seed Support Tickets
    if db.query(SupportTicket).count() == 0:
        logger.info("Seeding customer support tickets...")
        sample_tickets = [
            SupportTicket(
                organization_id=org.id,
                customer_name="Robert Vance",
                customer_email="robert@apexfin.com",
                subject="Need assistance with webhook delivery for invoice notifications",
                description="Our webhook receiver intermittently receives 504 gateway timeouts when processing batch payloads.",
                priority="HIGH",
                status="OPEN",
                sentiment="NEGATIVE",
                ai_suggested_response="Investigating webhook endpoint latency and retry queue mechanism.",
            ),
            SupportTicket(
                organization_id=org.id,
                customer_name="Clara Oswald",
                customer_email="clara@nexustech.io",
                subject="Inquiry regarding additional API seat allocation",
                description="We are loving the autonomous lead scoring engine and wish to add 5 more team seats for our SDR team.",
                priority="LOW",
                status="IN_PROGRESS",
                sentiment="POSITIVE",
                ai_suggested_response="Seat upgrades can be performed instantly via Organization Billing settings.",
            ),
        ]
        db.add_all(sample_tickets)
        db.commit()

    # 6. Seed Customers
    if db.query(Customer).count() == 0:
        logger.info("Seeding enterprise customers...")
        sample_customers = [
            Customer(
                organization_id=org.id,
                name="Sophia Chen",
                email="sophia.chen@apexfin.com",
                phone="+1 (415) 882-9012",
                company="Apex Financial Solutions",
                status="ACTIVE",
                tier="Enterprise",
                ltv=145000.0,
                total_orders=8,
                notes="Primary financial sector champion.",
            ),
            Customer(
                organization_id=org.id,
                name="David Ross",
                email="d.ross@nexustech.io",
                phone="+1 (212) 555-0144",
                company="NexusTech Cloud Systems",
                status="ACTIVE",
                tier="Enterprise",
                ltv=96000.0,
                total_orders=5,
                notes="Cloud migration and automation customer.",
            ),
            Customer(
                organization_id=org.id,
                name="Hannah Meyer",
                email="hmeyer@biocaremed.org",
                phone="+1 (617) 344-9981",
                company="BioCare Health Network",
                status="ACTIVE",
                tier="Growth",
                ltv=65000.0,
                total_orders=3,
                notes="Healthcare compliance tier.",
            ),
            Customer(
                organization_id=org.id,
                name="Lucas Gomez",
                email="lgomez@omnistore.net",
                phone="+1 (305) 771-4200",
                company="OmniStore Logistics",
                status="ACTIVE",
                tier="Growth",
                ltv=42000.0,
                total_orders=4,
                notes="Retail operations and logistics client.",
            ),
            Customer(
                organization_id=org.id,
                name="Emily Watson",
                email="emily@vertexai.co",
                phone="+1 (206) 881-2299",
                company="Vertex Digital Media",
                status="ACTIVE",
                tier="Starter",
                ltv=38000.0,
                total_orders=2,
                notes="Digital marketing automation.",
            ),
            Customer(
                organization_id=org.id,
                name="Arthur Vance",
                email="a.vance@helios-aero.com",
                phone="+1 (310) 902-8411",
                company="Helios Aerospace",
                status="ACTIVE",
                tier="Enterprise",
                ltv=210000.0,
                total_orders=11,
                notes="High security aerospace enterprise contract.",
            ),
            Customer(
                organization_id=org.id,
                name="Elena Rostova",
                email="e.rostova@quantixbot.com",
                phone="+1 (650) 412-9088",
                company="Quantix Robotics",
                status="PROSPECT",
                tier="Growth",
                ltv=18500.0,
                total_orders=1,
                notes="Evaluating enterprise expansion.",
            ),
        ]
        db.add_all(sample_customers)
        db.commit()

    # 7. Seed Products Catalog
    if db.query(Product).count() == 0:
        logger.info("Seeding products and AI subscription tiers...")
        sample_products = [
            Product(
                organization_id=org.id,
                name="Upteky AI Enterprise Suite",
                sku="UPT-ENT-01",
                category="Subscription",
                price=2499.00,
                cost=450.00,
                units_sold=142,
                revenue=354858.00,
                status="ACTIVE",
                description="Comprehensive multi-agent autonomous enterprise business operations platform.",
            ),
            Product(
                organization_id=org.id,
                name="Smart Invoicing Pro",
                sku="UPT-INV-02",
                category="Operations",
                price=499.00,
                cost=80.00,
                units_sold=284,
                revenue=141716.00,
                status="ACTIVE",
                description="Intelligent OCR document parsing and automated two-way payment reconciliation.",
            ),
            Product(
                organization_id=org.id,
                name="AI Lead Pipeline Intelligence",
                sku="UPT-LEAD-03",
                category="Sales AI",
                price=899.00,
                cost=120.00,
                units_sold=195,
                revenue=175305.00,
                status="ACTIVE",
                description="Predictive qualification scoring and automated multichannel sales outreach.",
            ),
            Product(
                organization_id=org.id,
                name="Customer Support Copilot",
                sku="UPT-SUP-04",
                category="Support",
                price=699.00,
                cost=95.00,
                units_sold=164,
                revenue=114636.00,
                status="ACTIVE",
                description="24/7 autonomous ticket resolution and omnichannel customer support triage.",
            ),
            Product(
                organization_id=org.id,
                name="Predictive BI & ML Forecasting",
                sku="UPT-ANL-05",
                category="Analytics",
                price=1299.00,
                cost=210.00,
                units_sold=88,
                revenue=114312.00,
                status="ACTIVE",
                description="Real-time revenue forecast models, customer churn detection, and BI dashboarding.",
            ),
        ]
        db.add_all(sample_products)
        db.commit()

    # 8. Seed Sales Transactions
    if db.query(Sale).count() == 0:
        logger.info("Seeding sales transaction records...")
        sample_sales = [
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-901",
                customer_name="Apex Financial Solutions",
                product_name="Upteky AI Enterprise Suite",
                amount=24990.00,
                payment_method="Wire Transfer",
                status="COMPLETED",
            ),
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-902",
                customer_name="NexusTech Cloud Systems",
                product_name="AI Lead Pipeline Intelligence",
                amount=8990.00,
                payment_method="Corporate Card (Stripe)",
                status="COMPLETED",
            ),
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-903",
                customer_name="BioCare Health Network",
                product_name="Smart Invoicing Pro",
                amount=14500.00,
                payment_method="ACH Debit",
                status="COMPLETED",
            ),
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-904",
                customer_name="OmniStore Logistics",
                product_name="Customer Support Copilot",
                amount=4990.00,
                payment_method="Corporate Card (Stripe)",
                status="COMPLETED",
            ),
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-905",
                customer_name="Vertex Digital Media",
                product_name="Predictive BI & ML Forecasting",
                amount=12990.00,
                payment_method="ACH Debit",
                status="COMPLETED",
            ),
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-906",
                customer_name="Helios Aerospace",
                product_name="Upteky AI Enterprise Suite",
                amount=34500.00,
                payment_method="Wire Transfer",
                status="COMPLETED",
            ),
            Sale(
                organization_id=org.id,
                order_number="ORD-2026-907",
                customer_name="Quantix Robotics",
                product_name="Customer Support Copilot",
                amount=6990.00,
                payment_method="Corporate Card (Stripe)",
                status="PENDING",
            ),
        ]
        db.add_all(sample_sales)
        db.commit()

    # 9. Ensure Customer Activity logs exist
    if db.query(CustomerActivity).count() == 0:
        logger.info("Seeding customer activity timeline records...")
        first_cust = db.query(Customer).first()
        if first_cust:
            sample_activities = [
                CustomerActivity(
                    customer_id=first_cust.id,
                    organization_id=org.id,
                    activity_type="MEETING",
                    title="Quarterly Executive Alignment Call",
                    description="Discussed platform expansion across 3 additional business units and API rate limits.",
                    performed_by="Marcus Sterling",
                    created_at=datetime.now(timezone.utc) - timedelta(days=2),
                ),
                CustomerActivity(
                    customer_id=first_cust.id,
                    organization_id=org.id,
                    activity_type="SALE",
                    title="Enterprise Renewal Contract Executed",
                    description="Annual enterprise subscription renewed for $24,990.",
                    performed_by="Sarah Jenkins",
                    created_at=datetime.now(timezone.utc) - timedelta(days=12),
                ),
                CustomerActivity(
                    customer_id=first_cust.id,
                    organization_id=org.id,
                    activity_type="NOTE",
                    title="Security Audit Documentation Sent",
                    description="Dispatched SOC2 Type II compliance audit packet requested by procurement.",
                    performed_by="Eleanor Vance",
                    created_at=datetime.now(timezone.utc) - timedelta(days=20),
                ),
            ]
            db.add_all(sample_activities)
            db.commit()

    # 10. Classify existing leads
    from app.services.lead_classifier import lead_classifier
    leads_to_update = db.query(Lead).all()
    for ld in leads_to_update:
        if not ld.source:
            ld.source = "Inbound Demo" if ld.deal_value > 30000 else "Website"
        if not ld.follow_up_date:
            ld.follow_up_date = datetime.now(timezone.utc) + timedelta(days=2)
        clf = lead_classifier.classify_lead(
            deal_value=ld.deal_value,
            status=ld.status,
            source=ld.source,
            ai_score=ld.ai_score,
            follow_up_date=ld.follow_up_date,
        )
        ld.classification = clf["classification"]
        ld.classification_reason = clf["reason"]
    # 11. Seed Knowledge Base Items across all 6 categories
    if db.query(KnowledgeItem).count() == 0:
        logger.info("Seeding business knowledge base items...")
        sample_kb_items = [
            # FAQs
            KnowledgeItem(
                organization_id=org.id,
                category="faq",
                title="How do I reset my password or update user profile credentials?",
                content="To reset your password or modify your account profile, navigate to the Profile & Security settings at /profile or use the 'Forgot Password' link on the login portal. You will receive an automated verification email with an encrypted OTP token.",
                keywords="password, reset, credentials, login, forgot password, profile",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="faq",
                title="How do I connect external CRM and ERP systems via Webhooks?",
                content="Upteky AI provides RESTful Webhooks and OpenAPI endpoints. Go to Settings > Integrations, generate an API Bearer token, and configure endpoint webhooks for events like lead.created, invoice.processed, and support.handoff.",
                keywords="crm, erp, webhook, integrations, api, export, connect",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="faq",
                title="How do I export sales data, analytics, and financial reports?",
                content="Navigate to the Reports module (/reports). You can generate executive summaries, sales ledgers, or conversion funnel analytics and export them immediately in CSV, PDF, or XLSX formats.",
                keywords="export, reports, csv, pdf, download, sales data, analytics",
                is_active=True,
            ),
            # Product Information
            KnowledgeItem(
                organization_id=org.id,
                category="product",
                title="Upteky AI Core Suite Features & Pricing",
                content="Upteky AI Pro Tier is $499/month for up to 25 seats. It includes full Autonomous CRM, AI Lead Classification, Automated OCR Invoicing, Real-Time Business Analytics, and 24/7 AI Customer Support.",
                keywords="pricing, plans, tier, subscription, core suite, features, cost",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="product",
                title="Intelligent OCR Document & Invoice Parsing Engine",
                content="Our neural document processor automatically extracts line items, tax numbers, vendor names, and totals with 99.4% confidence across PDF, JPG, and PNG documents with multi-currency support.",
                keywords="ocr, invoice, parsing, document, scan, extraction, receipt",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="product",
                title="Autonomous Lead Scoring & Routing Agent",
                content="The Upteky AI Lead Classifier evaluates inbound opportunities across deal size, engagement source, velocity, and industry to score conversion probability (0-100) and automatically route Hot leads to top account executives.",
                keywords="lead, scoring, classification, hot lead, routing, sales",
                is_active=True,
            ),
            # Services
            KnowledgeItem(
                organization_id=org.id,
                category="service",
                title="24/7 Managed Cloud AI Operations & SLA",
                content="We provide an enterprise 99.99% uptime guarantee with 24/7 automated health monitoring and a guaranteed 15-minute response SLA for critical priority incidents.",
                keywords="service, sla, uptime, 24/7, cloud, operations, incident, guarantee",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="service",
                title="Custom AI Model Fine-Tuning & Enterprise Consulting",
                content="Upteky AI provides dedicated solution architects for enterprise clients to train domain-specific models, integrate proprietary ERP databases, and build custom workflow triggers.",
                keywords="consulting, custom models, fine-tuning, training, enterprise integration",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="service",
                title="Concierge Migration & Onboarding Services",
                content="Our onboarding engineering team handles complete data ingestion from Salesforce, HubSpot, or legacy SQL databases with zero downtime within 48 hours.",
                keywords="onboarding, migration, data transfer, setup, concierge, transition",
                is_active=True,
            ),
            # Company Information
            KnowledgeItem(
                organization_id=org.id,
                category="company",
                title="About Upteky Technologies Inc.",
                content="Upteky Technologies Inc. is a SaaS enterprise platform founded to bring intelligent business automation, AI copilots, and predictive analytics to small and medium enterprises worldwide. Our headquarters are located in San Francisco, California.",
                keywords="about, company, mission, founder, headquarters, san francisco, background",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="company",
                title="Security Certifications & Compliance Standards",
                content="Upteky AI maintains SOC-2 Type II certification, ISO 27001 compliance, GDPR adherence, and HIPAA-compliant data pipeline options. All data is encrypted with AES-256 at rest and TLS 1.3 in transit.",
                keywords="security, soc2, compliance, gdpr, hipaa, encryption, safety, certs",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="company",
                title="Business Hours & Global Support Coverage",
                content="Our autonomous AI support copilot is active 24/7/365. Human enterprise support representatives and technical engineers are available Monday through Friday from 8:00 AM to 8:00 PM EST, with 24/7 on-call dispatch for severe outages.",
                keywords="hours, business hours, schedule, availability, open, time",
                is_active=True,
            ),
            # Policies
            KnowledgeItem(
                organization_id=org.id,
                category="policy",
                title="Official 30-Day Satisfaction & Refund Policy",
                content="Upteky AI offers a 100% no-questions-asked money-back guarantee within the first 30 days of any new subscription tier. If you are not satisfied with our autonomous automation tools, contact billing@upteky.ai for a full refund.",
                keywords="refund, money back, cancellation, satisfaction, guarantee, return, policy",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="policy",
                title="Data Privacy, Model Training & Isolation Policy",
                content="We enforce strict tenant data isolation. Customer data and conversation logs are NEVER used to train shared public foundation models. Your business data belongs strictly to your organization.",
                keywords="privacy, data policy, model training, tenant isolation, confidentiality",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="policy",
                title="Terms of Service & Usage Policies",
                content="Use of Upteky AI platforms must comply with acceptable use guidelines, prohibiting spamming, malicious payload generation, and unauthorized scraping. Subscription terms renew automatically unless cancelled prior to the billing date.",
                keywords="terms, tos, agreement, legal, acceptable use, cancellation policy",
                is_active=True,
            ),
            # Contact Information
            KnowledgeItem(
                organization_id=org.id,
                category="contact",
                title="Customer Support Hotline & Phone Numbers",
                content="You can reach our global support center toll-free at +1 (800) 555-0199 or direct line at +1 (415) 555-0188. For urgent technical escalations, press 1 to reach our duty engineer.",
                keywords="phone, call, hotline, contact, telephone, customer service, support number",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="contact",
                title="Official Support Email Addresses & Inquiries",
                content="For general customer assistance: support@upteky.ai. For billing, invoicing, and refunds: billing@upteky.ai. For enterprise sales and custom demos: sales@upteky.ai. For security vulnerabilities: security@upteky.ai.",
                keywords="email, contact, address, billing email, write, help desk",
                is_active=True,
            ),
            KnowledgeItem(
                organization_id=org.id,
                category="contact",
                title="Headquarters Location & Mailing Address",
                content="Upteky Technologies Inc., 500 Silicon Ave, Suite 400, San Francisco, CA 94107, United States.",
                keywords="address, office, location, headquarters, visit, map, mail",
                is_active=True,
            ),
        ]
        db.add_all(sample_kb_items)
        db.commit()

    # 12. Seed Sample Customer Conversations
    if db.query(Conversation).count() == 0:
        logger.info("Seeding customer support conversations...")
        conv1 = Conversation(
            organization_id=org.id,
            customer_name="Claire Redfield",
            customer_email="claire@terrasave.org",
            subject="Inquiry about 30-day money back guarantee and invoice OCR",
            status="ACTIVE",
            channel="web_chat",
            created_at=datetime.now(timezone.utc) - timedelta(hours=3),
            updated_at=datetime.now(timezone.utc) - timedelta(hours=2),
        )
        db.add(conv1)
        db.commit()
        db.refresh(conv1)

        msg1 = ChatMessage(
            conversation_id=conv1.id,
            sender="user",
            content="Hello, what is your refund policy if our team wants to test the platform for a few weeks?",
            confidence=1.0,
            created_at=datetime.now(timezone.utc) - timedelta(hours=3),
        )
        msg2 = ChatMessage(
            conversation_id=conv1.id,
            sender="assistant",
            content="According to our official 30-Day Satisfaction & Refund Policy: Upteky AI offers a 100% no-questions-asked money-back guarantee within the first 30 days of any new subscription tier.",
            confidence=0.96,
            source_kb_ids='[{"title": "Official 30-Day Satisfaction & Refund Policy", "category": "policy"}]',
            created_at=datetime.now(timezone.utc) - timedelta(hours=2, minutes=58),
        )
        db.add_all([msg1, msg2])

        conv2 = Conversation(
            organization_id=org.id,
            customer_name="Leon Kennedy",
            customer_email="leon.k@dsgovexec.gov",
            subject="Technical escalation regarding custom ERP integration",
            status="HANDOFF_REQUESTED",
            channel="web_chat",
            created_at=datetime.now(timezone.utc) - timedelta(hours=1),
            updated_at=datetime.now(timezone.utc) - timedelta(minutes=10),
        )
        db.add(conv2)
        db.commit()
        db.refresh(conv2)

        msg3 = ChatMessage(
            conversation_id=conv2.id,
            sender="user",
            content="Can I speak with a human support specialist about high-security air-gapped deployments?",
            confidence=1.0,
            created_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        msg4 = ChatMessage(
            conversation_id=conv2.id,
            sender="assistant",
            content="Certainly! I am escalating your conversation to our human support team right away. A support specialist has been alerted and will join this thread.",
            confidence=1.0,
            needs_handoff=True,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=59),
        )
        db.add_all([msg3, msg4])
        db.commit()

    # 13. Seed Core Automation Rules
    if db.query(AutomationRule).count() == 0:
        logger.info("Seeding core AI automation rules...")
        sample_rules = [
            AutomationRule(
                organization_id=org.id,
                name="Intelligent Lead Scoring & Sales Priority Task",
                trigger_event="LEAD_CREATED",
                condition_expression="All New Inbound Leads",
                action_type="CLASSIFY_SCORE_PRIORITY_TASK",
                action_description="Classify lead, calculate ML score, assign sales priority, and create follow-up task",
                category="Sales AI",
                is_active=True,
                execution_count=184,
                hours_saved="46.0h",
            ),
            AutomationRule(
                organization_id=org.id,
                name="Scheduled Follow-up Arrival Alert",
                trigger_event="FOLLOW_UP_DUE",
                condition_expression="Follow-up Date <= Today",
                action_type="CREATE_NOTIFICATION",
                action_description="Dispatch priority alert to assigned sales executive when outreach date arrives",
                category="Executive Alerts",
                is_active=True,
                execution_count=68,
                hours_saved="14.2h",
            ),
            AutomationRule(
                organization_id=org.id,
                name="Lead Inactivity & Re-engagement Warning",
                trigger_event="INACTIVITY_DETECTED",
                condition_expression="Lead Inactive >= 7 Days",
                action_type="RECOMMEND_FOLLOWUP",
                action_description="Recommend tailored outreach action and queue consultative re-engagement task",
                category="Retention AI",
                is_active=True,
                execution_count=42,
                hours_saved="10.5h",
            ),
            AutomationRule(
                organization_id=org.id,
                name="Enterprise High-ARR Pipeline Alert",
                trigger_event="CUSTOM",
                condition_expression="Deal Estimated Value >= $25,000",
                action_type="DISPATCH_EXECUTIVE_ALERT",
                action_description="Dispatch instant executive webhook alert to Slack #exec-deals",
                category="Sales AI",
                is_active=True,
                execution_count=29,
                hours_saved="6.0h",
            ),
        ]
        db.add_all(sample_rules)
        db.commit()

    # 14. Analyze Existing Leads & Seed Automation Tasks
    if db.query(AutomationTask).count() == 0:
        logger.info("Generating initial automation tasks from existing leads...")
        from app.services.lead_automation_service import lead_automation_service
        existing_leads = db.query(Lead).all()
        for ld in existing_leads:
            analysis = lead_automation_service.analyze_and_score_lead(ld)
            ld.ai_score = analysis["lead_score"]
            ld.classification = analysis["lead_category"]
            ld.classification_reason = analysis["reason_for_score"]
            ld.sales_priority = analysis["sales_priority"]
            ld.recommended_action = analysis["recommended_next_action"]
            ld.suggested_follow_up_date = analysis["suggested_follow_up_date"]
            ld.ai_summary = analysis["ai_summary"]
            ld.ai_follow_up_message = analysis["suggested_follow_up_message"]
            ld.last_activity_date = datetime.now(timezone.utc) - timedelta(days=2)

            task = AutomationTask(
                organization_id=org.id,
                lead_id=ld.id,
                title=f"Outreach: {ld.contact_name} ({ld.company})",
                description=f"{analysis['recommended_next_action']} Priority: {analysis['sales_priority']}.",
                priority=analysis["sales_priority"],
                due_date=analysis["suggested_follow_up_date"],
                status="PENDING",
                assigned_to=ld.assigned_to,
                created_at=datetime.now(timezone.utc) - timedelta(hours=4),
            )
            db.add(task)
        db.commit()

    # 15. Seed Initial Automation Execution Logs
    if db.query(AutomationLog).count() == 0:
        logger.info("Seeding automation execution audit logs...")
        sample_logs = [
            AutomationLog(
                organization_id=org.id,
                rule_name="Intelligent Lead Scoring & Sales Priority Task",
                trigger_event="LEAD_CREATED",
                target_entity="Lead: Sophia Chen (Apex Financial Solutions)",
                status="SUCCESS",
                latency_ms=74,
                details="Classified as HOT. Score: 94.2. Priority: URGENT_P0. Task generated.",
                created_at=datetime.now(timezone.utc) - timedelta(hours=3),
            ),
            AutomationLog(
                organization_id=org.id,
                rule_name="Scheduled Follow-up Arrival Alert",
                trigger_event="FOLLOW_UP_DUE",
                target_entity="Lead: David Ross (NexusTech Cloud Systems)",
                status="SUCCESS",
                latency_ms=48,
                details="Follow-up due date verified. Notification dispatched to sales manager.",
                created_at=datetime.now(timezone.utc) - timedelta(hours=2),
            ),
            AutomationLog(
                organization_id=org.id,
                rule_name="Lead Inactivity & Re-engagement Warning",
                trigger_event="INACTIVITY_DETECTED",
                target_entity="Lead: Lucas Gomez (OmniStore Logistics)",
                status="SUCCESS",
                latency_ms=62,
                details="Inactivity >7 days identified. Re-engagement task and reminder queued.",
                created_at=datetime.now(timezone.utc) - timedelta(hours=1),
            ),
            AutomationLog(
                organization_id=org.id,
                rule_name="Enterprise High-ARR Pipeline Alert",
                trigger_event="CUSTOM",
                target_entity="Lead: BioCare Health Network",
                status="SUCCESS",
                latency_ms=55,
                details="High-ARR deal ($65,000) triggered executive channel dispatch.",
                created_at=datetime.now(timezone.utc) - timedelta(minutes=30),
            ),
        ]
        db.add_all(sample_logs)
        db.commit()

    # 16. Seed Initial Notifications
    if db.query(Notification).count() < 6:
        logger.info("Seeding initial system notifications for all Phase 9 event types...")
        # Clean existing sample notifs if low count to refresh full set
        db.query(Notification).filter(Notification.organization_id == org.id).delete()
        sample_notifs = [
            Notification(
                organization_id=org.id,
                title="New Lead: Summit Health Partners",
                message="Summit Health Partners ($38,500 potential ARR) ingested from Organic Search. Automated classification complete.",
                type="NEW_LEAD",
                is_read=False,
                link_url="/leads",
                created_at=datetime.now(timezone.utc) - timedelta(minutes=25),
            ),
            Notification(
                organization_id=org.id,
                title="Follow-up Due: NexusTech Cloud Systems",
                message="Scheduled proposal walkthrough for David Ross is now due. Review recommended action and email template.",
                type="FOLLOW_UP_DUE",
                is_read=False,
                link_url="/leads",
                created_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=10),
            ),
            Notification(
                organization_id=org.id,
                title="Low Conversion Alert: SMB Mid-Funnel",
                message="SMB lead conversion rate dipped to 11.8% (threshold: 15.0%). Drop-off detected at proposal review stage.",
                type="LOW_CONVERSION",
                is_read=False,
                link_url="/analytics",
                created_at=datetime.now(timezone.utc) - timedelta(hours=3),
            ),
            Notification(
                organization_id=org.id,
                title="Important Sales Velocity Change",
                message="Surge in Enterprise AI Suite closed deals (+32.4% week-over-week). $54,800 recorded in billing.",
                type="SALES_CHANGE",
                is_read=False,
                link_url="/sales",
                created_at=datetime.now(timezone.utc) - timedelta(hours=4, minutes=30),
            ),
            Notification(
                organization_id=org.id,
                title="Invoice Processing Completed: INV-2024-001",
                message="CloudScale Technologies document parsed ($4,942.50). 9 fields and 2 line items verified at 98.5% confidence.",
                type="INVOICE_PROCESSED",
                is_read=True,
                link_url="/invoices",
                created_at=datetime.now(timezone.utc) - timedelta(hours=8),
            ),
            Notification(
                organization_id=org.id,
                title="Automation Failure: Salesforce Webhook Sync",
                message="Rule execution halted: External CRM webhook timeout after 3 retries. Dispatched to dead-letter queue.",
                type="AUTOMATION_FAILURE",
                is_read=False,
                link_url="/automation",
                created_at=datetime.now(timezone.utc) - timedelta(hours=12),
            ),
        ]
        db.add_all(sample_notifs)
        db.commit()

    # 17. Seed Initial Invoices
    if db.query(Invoice).count() == 0:
        logger.info("Seeding initial processed invoices...")
        import json
        sample_invoices = [
            Invoice(
                organization_id=org.id,
                invoice_number="INV-2026-0901",
                company_name="AWS Cloud Infrastructure Inc.",
                vendor_name="AWS Cloud Infrastructure Inc.",
                customer_name="Upteky Technologies Inc.",
                invoice_date=datetime(2026, 9, 12, tzinfo=timezone.utc),
                due_date=datetime(2026, 10, 12, tzinfo=timezone.utc),
                gst_number="27AAACW8341M1Z5",
                subtotal=3200.0,
                tax_amount=576.0,
                total_amount=3776.0,
                currency="USD",
                status="VERIFIED",
                ocr_confidence=99.4,
                file_format="PDF",
                original_filename="AWS_Invoice_Sept2026.pdf",
                items_json=json.dumps([
                    {"description": "AWS EC2 Production Compute Cluster (c6g.4xlarge)", "quantity": 4, "unit_price": 450.0, "amount": 1800.0},
                    {"description": "Amazon Aurora PostgreSQL Multi-AZ Storage (500GB)", "quantity": 1, "unit_price": 900.0, "amount": 900.0},
                    {"description": "CloudFront CDN Global Ingress & Data Transfer", "quantity": 1, "unit_price": 500.0, "amount": 500.0},
                ]),
                created_at=datetime.now(timezone.utc) - timedelta(days=8),
            ),
            Invoice(
                organization_id=org.id,
                invoice_number="INV-2026-0944",
                company_name="Stripe Global Payments Inc.",
                vendor_name="Stripe Global Payments Inc.",
                customer_name="Upteky Technologies Inc.",
                invoice_date=datetime(2026, 9, 15, tzinfo=timezone.utc),
                due_date=datetime(2026, 10, 15, tzinfo=timezone.utc),
                gst_number="07AAGCS1298N1ZK",
                subtotal=1420.0,
                tax_amount=255.6,
                total_amount=1675.6,
                currency="USD",
                status="VERIFIED",
                ocr_confidence=98.7,
                file_format="PNG",
                original_filename="Stripe_Merchant_Receipt.png",
                items_json=json.dumps([
                    {"description": "Monthly Enterprise Gateway SaaS Fee", "quantity": 1, "unit_price": 500.0, "amount": 500.0},
                    {"description": "Cross-border Interchange Settlement Fees", "quantity": 1, "unit_price": 920.0, "amount": 920.0},
                ]),
                created_at=datetime.now(timezone.utc) - timedelta(days=5),
            ),
            Invoice(
                organization_id=org.id,
                invoice_number="INV-2026-0988",
                company_name="Datadog Observability & APM Corp.",
                vendor_name="Datadog Observability & APM Corp.",
                customer_name="Upteky Technologies Inc.",
                invoice_date=datetime(2026, 9, 18, tzinfo=timezone.utc),
                due_date=datetime(2026, 10, 18, tzinfo=timezone.utc),
                gst_number="33AABTD4521R1ZT",
                subtotal=850.0,
                tax_amount=153.0,
                total_amount=1003.0,
                currency="USD",
                status="EXTRACTED",
                ocr_confidence=97.2,
                file_format="PDF",
                original_filename="Datadog_Billing_Statement.pdf",
                items_json=json.dumps([
                    {"description": "Infrastructure Host Monitoring Pro (20 Hosts)", "quantity": 20, "unit_price": 25.0, "amount": 500.0},
                    {"description": "APM & Continuous Distributed Tracing", "quantity": 1, "unit_price": 350.0, "amount": 350.0},
                ]),
                created_at=datetime.now(timezone.utc) - timedelta(days=2),
            ),
        ]
        db.add_all(sample_invoices)
        db.commit()

    # 18. Seed Multi-Month Historical Sales Data for ML Forecasting
    if db.query(Sale).count() < 15:
        logger.info("Seeding multi-month historical sales transactions for ML training...")
        customers = db.query(Customer).filter(Customer.organization_id == org.id).all()
        cust_map = {c.company: c.id for c in customers}

        # Multi-month distribution from Jan 2026 to Sep 2026
        historical_sales_seeds = [
            # Jan 2026 (~$45,000)
            {"order_number": "ORD-2026-101", "customer_name": "Apex Financial Solutions", "company": "Apex Financial Solutions", "product_name": "Upteky AI Enterprise Suite", "amount": 25000.0, "days_ago": 260},
            {"order_number": "ORD-2026-102", "customer_name": "Horizon Global Logistics", "company": "Horizon Global Logistics", "product_name": "Smart Document OCR Processor", "amount": 12000.0, "days_ago": 255},
            {"order_number": "ORD-2026-103", "customer_name": "NexusTech Cloud Systems", "company": "NexusTech Cloud Systems", "product_name": "Autonomous Lead Bot Pro", "amount": 8000.0, "days_ago": 250},
            # Feb 2026 (~$52,000)
            {"order_number": "ORD-2026-104", "customer_name": "BioHealth Diagnostics", "company": "BioHealth Diagnostics", "product_name": "Upteky AI Enterprise Suite", "amount": 28000.0, "days_ago": 230},
            {"order_number": "ORD-2026-105", "customer_name": "Vertex Media Group", "company": "Vertex Media Group", "product_name": "Omnichannel Support Copilot", "amount": 14000.0, "days_ago": 224},
            {"order_number": "ORD-2026-106", "customer_name": "Stellar Retail Partners", "company": "Stellar Retail Partners", "product_name": "Smart Document OCR Processor", "amount": 10000.0, "days_ago": 218},
            # Mar 2026 (~$61,000)
            {"order_number": "ORD-2026-107", "customer_name": "Apex Financial Solutions", "company": "Apex Financial Solutions", "product_name": "Upteky AI Enterprise Suite", "amount": 32000.0, "days_ago": 200},
            {"order_number": "ORD-2026-108", "customer_name": "NexusTech Cloud Systems", "company": "NexusTech Cloud Systems", "product_name": "Autonomous Lead Bot Pro", "amount": 15000.0, "days_ago": 195},
            {"order_number": "ORD-2026-109", "customer_name": "Horizon Global Logistics", "company": "Horizon Global Logistics", "product_name": "Smart Document OCR Processor", "amount": 14000.0, "days_ago": 188},
            # Apr 2026 (~$68,000)
            {"order_number": "ORD-2026-110", "customer_name": "BioHealth Diagnostics", "company": "BioHealth Diagnostics", "product_name": "Upteky AI Enterprise Suite", "amount": 35000.0, "days_ago": 170},
            {"order_number": "ORD-2026-111", "customer_name": "Vertex Media Group", "company": "Vertex Media Group", "product_name": "Omnichannel Support Copilot", "amount": 18000.0, "days_ago": 162},
            {"order_number": "ORD-2026-112", "customer_name": "Stellar Retail Partners", "company": "Stellar Retail Partners", "product_name": "Autonomous Lead Bot Pro", "amount": 15000.0, "days_ago": 155},
            # May 2026 (~$79,000)
            {"order_number": "ORD-2026-113", "customer_name": "Apex Financial Solutions", "company": "Apex Financial Solutions", "product_name": "Upteky AI Enterprise Suite", "amount": 42000.0, "days_ago": 138},
            {"order_number": "ORD-2026-114", "customer_name": "Horizon Global Logistics", "company": "Horizon Global Logistics", "product_name": "Smart Document OCR Processor", "amount": 22000.0, "days_ago": 130},
            {"order_number": "ORD-2026-115", "customer_name": "NexusTech Cloud Systems", "company": "NexusTech Cloud Systems", "product_name": "Omnichannel Support Copilot", "amount": 15000.0, "days_ago": 125},
            # Jun 2026 (~$88,000)
            {"order_number": "ORD-2026-116", "customer_name": "BioHealth Diagnostics", "company": "BioHealth Diagnostics", "product_name": "Upteky AI Enterprise Suite", "amount": 46000.0, "days_ago": 105},
            {"order_number": "ORD-2026-117", "customer_name": "Vertex Media Group", "company": "Vertex Media Group", "product_name": "Smart Document OCR Processor", "amount": 24000.0, "days_ago": 98},
            {"order_number": "ORD-2026-118", "customer_name": "Stellar Retail Partners", "company": "Stellar Retail Partners", "product_name": "Autonomous Lead Bot Pro", "amount": 18000.0, "days_ago": 92},
            # Jul 2026 (~$99,000)
            {"order_number": "ORD-2026-119", "customer_name": "Apex Financial Solutions", "company": "Apex Financial Solutions", "product_name": "Upteky AI Enterprise Suite", "amount": 54000.0, "days_ago": 75},
            {"order_number": "ORD-2026-120", "customer_name": "Horizon Global Logistics", "company": "Horizon Global Logistics", "product_name": "Smart Document OCR Processor", "amount": 26000.0, "days_ago": 68},
            {"order_number": "ORD-2026-121", "customer_name": "NexusTech Cloud Systems", "company": "NexusTech Cloud Systems", "product_name": "Omnichannel Support Copilot", "amount": 19000.0, "days_ago": 62},
            # Aug 2026 (~$115,000)
            {"order_number": "ORD-2026-122", "customer_name": "BioHealth Diagnostics", "company": "BioHealth Diagnostics", "product_name": "Upteky AI Enterprise Suite", "amount": 62000.0, "days_ago": 45},
            {"order_number": "ORD-2026-123", "customer_name": "Vertex Media Group", "company": "Vertex Media Group", "product_name": "Smart Document OCR Processor", "amount": 31000.0, "days_ago": 38},
            {"order_number": "ORD-2026-124", "customer_name": "Stellar Retail Partners", "company": "Stellar Retail Partners", "product_name": "Autonomous Lead Bot Pro", "amount": 22000.0, "days_ago": 32},
            # Sep 2026 (~$128,450)
            {"order_number": "ORD-2026-125", "customer_name": "Apex Financial Solutions", "company": "Apex Financial Solutions", "product_name": "Upteky AI Enterprise Suite", "amount": 68500.0, "days_ago": 15},
            {"order_number": "ORD-2026-126", "customer_name": "NexusTech Cloud Systems", "company": "NexusTech Cloud Systems", "product_name": "Smart Document OCR Processor", "amount": 34950.0, "days_ago": 10},
            {"order_number": "ORD-2026-127", "customer_name": "Horizon Global Logistics", "company": "Horizon Global Logistics", "product_name": "Omnichannel Support Copilot", "amount": 25000.0, "days_ago": 4},
        ]

        sales_to_insert = []
        for s in historical_sales_seeds:
            created_dt = datetime.now(timezone.utc) - timedelta(days=s["days_ago"])
            sales_to_insert.append(
                Sale(
                    organization_id=org.id,
                    customer_id=cust_map.get(s["company"]),
                    order_number=s["order_number"],
                    customer_name=s["customer_name"],
                    product_name=s["product_name"],
                    amount=s["amount"],
                    payment_method="Stripe / Wire",
                    status="COMPLETED",
                    created_at=created_dt,
                    updated_at=created_dt,
                )
            )

        db.add_all(sales_to_insert)
        db.commit()

    # Seed SaaS Administration (Plans, Multi-Tenant Orgs, Subscriptions, Usage, and Audit Logs)
    seed_saas_administration(db)

    logger.info("Database initial setup and demo seeds completed successfully.")


def seed_saas_administration(db: Session) -> None:
    """Seed subscription plans, multi-tenant organizations, subscriptions, usage, and logs."""
    logger.info("Seeding SaaS subscription plans and multi-tenant administration data...")

    # 1. Seed the 4 standard subscription plans
    plans_data = [
        {
            "id": "free",
            "name": "Free Tier",
            "description": "Essential sandbox for solo founders and micro-teams starting with Upteky AI.",
            "monthly_price": 0.0,
            "annual_price": 0.0,
            "max_users": 2,
            "max_ai_requests": 50,
            "max_api_requests": 500,
            "features": ["basic_analytics"],
            "is_popular": False,
            "badge": "Free Forever",
        },
        {
            "id": "starter",
            "name": "Starter Plan",
            "description": "Power-up early revenue operations with AI chatbot support and automated lead capture.",
            "monthly_price": 49.0,
            "annual_price": 490.0,
            "max_users": 10,
            "max_ai_requests": 500,
            "max_api_requests": 5000,
            "features": ["basic_analytics", "ai_chatbot", "lead_automation", "advanced_analytics"],
            "is_popular": False,
            "badge": "Startup Choice",
        },
        {
            "id": "business",
            "name": "Business Pro",
            "description": "Complete intelligent automation suite with deep BI reports, forecasting, and full automation.",
            "monthly_price": 199.0,
            "annual_price": 1990.0,
            "max_users": 30,
            "max_ai_requests": 2500,
            "max_api_requests": 50000,
            "features": [
                "basic_analytics",
                "ai_chatbot",
                "lead_automation",
                "advanced_analytics",
                "advanced_ai",
                "automation",
                "reports",
                "forecasting",
            ],
            "is_popular": True,
            "badge": "Most Popular",
        },
        {
            "id": "enterprise",
            "name": "Enterprise Suite",
            "description": "Unlimited enterprise scalability with custom integrations, dedicated compute, and priority SLA.",
            "monthly_price": 499.0,
            "annual_price": 4990.0,
            "max_users": 500,
            "max_ai_requests": 50000,
            "max_api_requests": 1000000,
            "features": [
                "basic_analytics",
                "ai_chatbot",
                "lead_automation",
                "advanced_analytics",
                "advanced_ai",
                "automation",
                "reports",
                "forecasting",
                "custom_limits",
                "custom_integrations",
                "priority_support",
            ],
            "is_popular": False,
            "badge": "Unlimited Scale",
        },
    ]

    for p in plans_data:
        existing = db.query(Plan).filter(Plan.id == p["id"]).first()
        if not existing:
            plan = Plan(
                id=p["id"],
                name=p["name"],
                description=p["description"],
                monthly_price=p["monthly_price"],
                annual_price=p["annual_price"],
                max_users=p["max_users"],
                max_ai_requests=p["max_ai_requests"],
                max_api_requests=p["max_api_requests"],
                features_json=json.dumps(p["features"]),
                is_popular=p["is_popular"],
                badge=p["badge"],
            )
            db.add(plan)
        else:
            existing.name = p["name"]
            existing.description = p["description"]
            existing.monthly_price = p["monthly_price"]
            existing.annual_price = p["annual_price"]
            existing.features_json = json.dumps(p["features"])
            existing.max_users = p["max_users"]
            existing.max_ai_requests = p["max_ai_requests"]
            existing.max_api_requests = p["max_api_requests"]
            existing.badge = p["badge"]
    db.commit()

    # 2. Seed Diverse Businesses (Organizations)
    demo_businesses = [
        {
            "name": "Upteky Technologies Inc.",
            "slug": "upteky-corp",
            "plan_tier": "business",
            "plan_name": "Business Pro",
            "status": "ACTIVE",
            "monthly_price": 199.0,
            "api_count": 48250,
            "ai_count": 1840,
            "tokens": 820000,
        },
        {
            "name": "Apex Global Logistics",
            "slug": "apex-logistics",
            "plan_tier": "starter",
            "plan_name": "Starter Plan",
            "status": "ACTIVE",
            "monthly_price": 49.0,
            "api_count": 3420,
            "ai_count": 310,
            "tokens": 125000,
        },
        {
            "name": "BioHealth Medical Systems",
            "slug": "biohealth-sys",
            "plan_tier": "enterprise",
            "plan_name": "Enterprise Suite",
            "status": "ACTIVE",
            "monthly_price": 499.0,
            "api_count": 124800,
            "ai_count": 4200,
            "tokens": 1840000,
        },
        {
            "name": "NovaCraft Creative Studios",
            "slug": "novacraft-studios",
            "plan_tier": "free",
            "plan_name": "Free Tier",
            "status": "ACTIVE",
            "monthly_price": 0.0,
            "api_count": 340,
            "ai_count": 38,
            "tokens": 18000,
        },
        {
            "name": "Quantum Cloud Financial",
            "slug": "quantum-fintech",
            "plan_tier": "starter",
            "plan_name": "Starter Plan",
            "status": "TRIALING",
            "monthly_price": 49.0,
            "api_count": 1280,
            "ai_count": 140,
            "tokens": 62000,
        },
    ]

    current_month = datetime.now(timezone.utc).strftime("%Y-%m")

    for b in demo_businesses:
        org = db.query(Organization).filter(Organization.slug == b["slug"]).first()
        if not org:
            org = Organization(
                name=b["name"],
                slug=b["slug"],
                plan=b["plan_name"],
                status=b["status"],
                is_active=True,
            )
            db.add(org)
            db.commit()
            db.refresh(org)
        else:
            org.plan = b["plan_name"]
            org.status = b["status"]
            db.commit()

        # Seed or sync Subscription
        sub = db.query(Subscription).filter(Subscription.organization_id == org.id).first()
        if not sub:
            sub = Subscription(
                organization_id=org.id,
                plan_tier=b["plan_tier"],
                billing_cycle="monthly",
                monthly_price=b["monthly_price"],
                status=b["status"],
                current_period_start=datetime.now(timezone.utc),
                current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
                auto_renew=True,
            )
            db.add(sub)
            db.commit()

        # Seed or sync SystemUsage
        usage = db.query(SystemUsage).filter(
            SystemUsage.organization_id == org.id,
            SystemUsage.period_month == current_month,
        ).first()
        if not usage:
            usage = SystemUsage(
                organization_id=org.id,
                period_month=current_month,
                api_requests_count=b["api_count"],
                ai_requests_count=b["ai_count"],
                ai_tokens_count=b["tokens"],
                ocr_documents_count=45,
                storage_bytes=24 * 1024 * 1024,
            )
            db.add(usage)
            db.commit()

    # 3. Seed Users across businesses
    external_users = [
        {
            "org_slug": "apex-logistics",
            "email": "operations@apexlogistics.com",
            "name": "David Sterling",
            "role": UserRole.BUSINESS_ADMIN.value,
            "title": "Logistics Operations Lead",
        },
        {
            "org_slug": "apex-logistics",
            "email": "dispatch@apexlogistics.com",
            "name": "Maria Gonzalez",
            "role": UserRole.EMPLOYEE.value,
            "title": "Dispatch Specialist",
        },
        {
            "org_slug": "biohealth-sys",
            "email": "cio@biohealthsystems.com",
            "name": "Dr. Aris Thorne",
            "role": UserRole.BUSINESS_ADMIN.value,
            "title": "Chief Information Officer",
        },
        {
            "org_slug": "biohealth-sys",
            "email": "analytics@biohealthsystems.com",
            "name": "Elena Rostova",
            "role": UserRole.SALES_MANAGER.value,
            "title": "Healthcare Systems Analyst",
        },
        {
            "org_slug": "novacraft-studios",
            "email": "founder@novacraft.io",
            "name": "Liam Vance",
            "role": UserRole.BUSINESS_ADMIN.value,
            "title": "Design Principal & Founder",
        },
    ]

    for u in external_users:
        existing_u = db.query(User).filter(User.email == u["email"]).first()
        if not existing_u:
            org = db.query(Organization).filter(Organization.slug == u["org_slug"]).first()
            if org:
                new_u = User(
                    organization_id=org.id,
                    email=u["email"],
                    hashed_password=get_password_hash("Admin@12345"),
                    full_name=u["name"],
                    role=u["role"],
                    title=u["title"],
                    is_active=True,
                )
                db.add(new_u)
    db.commit()

    # 4. Seed Audit Logs for realistic Platform Activity
    super_admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN.value).first()
    admin_id = super_admin.id if super_admin else None

    if db.query(AuditLog).count() < 10:
        logs_seed = [
            {"action": "USER_LOGIN", "resource": "Auth:Session", "details": "Super Admin authenticated via MFA portal", "ip": "192.168.1.104", "minutes_ago": 12},
            {"action": "PLAN_CONFIG_UPDATED", "resource": "Plan:business", "details": "Super Admin adjusted AI request quota to 2,500/month", "ip": "192.168.1.104", "minutes_ago": 34},
            {"action": "BUSINESS_PROVISIONED", "resource": "Organization:apex-logistics", "details": "Provisioned tenant 'Apex Global Logistics' on Starter Plan", "ip": "192.168.1.104", "minutes_ago": 85},
            {"action": "SUBSCRIPTION_RENEWED", "resource": "Subscription:biohealth-sys", "details": "Enterprise billing cycle verified and auto-renewed ($499/mo)", "ip": "10.0.4.12", "minutes_ago": 160},
            {"action": "AI_QUOTA_CHECK", "resource": "SystemUsage:2026-09", "details": "Monthly usage threshold validation passed for all 5 active tenants", "ip": "127.0.0.1", "minutes_ago": 240},
            {"action": "USER_ROLE_CHANGED", "resource": "User:dispatch@apexlogistics.com", "details": "Assigned EMPLOYEE role with scoped lead views", "ip": "192.168.1.104", "minutes_ago": 410},
            {"action": "SECURITY_SCAN", "resource": "System:Vulnerability", "details": "Automated SOC-2 compliance check passed: zero high CVE vulnerabilities", "ip": "127.0.0.1", "minutes_ago": 600},
            {"action": "API_RATE_LIMIT_ADJUSTED", "resource": "System:Gateway", "details": "Increased burst threshold for Enterprise Suite tenant BioHealth", "ip": "192.168.1.104", "minutes_ago": 850},
        ]
        for l in logs_seed:
            created_dt = datetime.now(timezone.utc) - timedelta(minutes=l["minutes_ago"])
            al = AuditLog(
                user_id=admin_id,
                action=l["action"],
                resource=l["resource"],
                details=l["details"],
                ip_address=l["ip"],
                created_at=created_dt,
            )
            db.add(al)
        db.commit()



if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
