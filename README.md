# Upteky AI – Intelligent Business Automation & Analytics Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Celery](https://img.shields.io/badge/Tasks-Celery%20%2B%20Redis-37814A?logo=celery&logoColor=white)](https://docs.celeryq.dev)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Pandas](https://img.shields.io/badge/Analytics-Pandas-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org)

**Upteky AI** is a production-grade multi-tenant SaaS platform engineered for small and medium-sized businesses (SMBs) to automate customer support, lead management, sales analytics, invoice processing, and business reporting using AI, machine learning, background workers, and real-time data analytics.

---

## 🏗 System Architecture

```
                          ┌────────────────────────────────────────┐
                          │          Client Layer (React)          │
                          │   Vite + Tailwind CSS + Recharts       │
                          └───────────────────┬────────────────────┘
                                              │ HTTPS / JWT Bearer
                                              ▼
                          ┌────────────────────────────────────────┐
                          │         API Gateway / FastAPI          │
                          │   Pydantic v2 | JWT Auth | RBAC Guard  │
                          └─────┬──────────────┬──────────────┬────┘
                                │              │              │
           ┌────────────────────┴──┐           │           ┌──┴─────────────────────┐
           │                       │           │           │                        │
           ▼                       ▼           │           ▼                        ▼
┌────────────────────┐  ┌───────────────────┐  │  ┌───────────────────┐  ┌───────────────────┐
│ Database Layer     │  │ AI & ML Services  │  │  │ Async Task Queue  │  │ Analytics Engine  │
│ PostgreSQL 16      │  │ - LLM Provider    │  │  │ Celery Worker     │  │ - Pandas          │
│ (SQLAlchemy ORM)   │  │ - Scikit-Learn    │  │  │ + Redis Broker    │  │ - Aggregations    │
└────────────────────┘  └───────────────────┘  │  └───────────────────┘  └───────────────────┘
```

---

## 👥 Role-Based Access Control (RBAC) Matrix

| User Role | Dashboard & KPIs | Team & RBAC (`/users`) | AI Leads Pipeline (`/leads`) | Deep Analytics (`/analytics`) | Smart Invoices (`/invoices`) | AI Support Copilot (`/support`) | Org Settings (`/settings`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | Platform-Wide | Full Control | Full Control | Full Control | Full Control | Full Control | Global Config |
| **Business Admin** | Org Executive | Org Members | Org Leads | Full Analytics | Org Invoices | Org Tickets | Org Config |
| **Sales Manager** | Sales Trajectory | Read Only | Edit & Re-Score | Sales Forecasts | - | View | - |
| **Employee** | Personal Tasks | - | Assigned Leads | - | Submit & View | Reply & Chat | - |

---

## 🔑 Pre-Seeded Instant Demo Accounts

| Role | Email | Password | Persona Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@upteky.ai` | `Admin@12345` | Global Platform Chief Architect |
| **Business Admin** | `businessadmin@upteky.ai` | `Admin@12345` | VP of Operations & Tenant Admin |
| **Sales Manager** | `salesmanager@upteky.ai` | `Sales@12345` | Director of Sales & Pipeline Lead |
| **Employee** | `employee@upteky.ai` | `Emp@12345` | Operations & Support Specialist |

> **Pro Tip**: The login screen and top bar include **1-Click Demo Role Switchers** to immediately evaluate any persona without manual credential entry.

---

## 🚀 Getting Started

### Option 1: Full Docker Compose Orchestration (Recommended for Production)

Run the entire platform (PostgreSQL, Redis, Celery Worker, FastAPI API, and React Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Option 2: Local Standalone Development

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m app.db.init_db      # Seeds initial demo tables and users
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🧪 Automated Testing

To run the automated API verification test suite (tests healthcheck, 4-tier JWT authentication, RBAC restrictions, and Scikit-learn + AI lead scoring):

```bash
cd backend
python -m pytest tests/test_api.py -v
```

---

## 🗺 Multi-Phase Development Roadmap

- [x] **Phase 1: Architecture & Foundation (Current)**:
  - Clean layered FastAPI backend with Pydantic v2 validation.
  - Multi-tenant PostgreSQL / SQLAlchemy data models & auto-seeding.
  - JWT Access & Refresh token authentication with strict RBAC guards.
  - Celery background job and Redis broker scaffolding.
  - Scikit-learn predictive lead scoring baseline & Pandas analytics engine.
  - Modern React + Vite + Tailwind CSS dashboard with Recharts visualizations.
  - 1-Click Role Persona Simulator and Team Management table.
  - Docker Compose containerization.
- [ ] **Phase 2: AI Lead Automation & RAG Support Engine**:
  - Webhook ingest for inbound leads from external CRMs (HubSpot, Salesforce).
  - Vector embeddings (FAISS / pgvector) for autonomous document knowledge base.
- [ ] **Phase 3: OCR Computer Vision & Financial Reconciliation**:
  - Tesseract / Cloud Vision deep invoice line-item extraction.
  - Two-way bank ledger reconciliation and anomaly detection.
- [ ] **Phase 4: Cloud Native & Kubernetes**:
  - Helm charts for AWS EKS / Google Cloud GKE.
  - Multi-region read replicas and Stripe subscription billing.
