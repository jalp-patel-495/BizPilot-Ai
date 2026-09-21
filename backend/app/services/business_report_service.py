import csv
import io
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fpdf import FPDF
import app.db.base

from app.models.sale import Sale
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.invoice import Invoice
from app.models.product import Product
from app.models.subscription import Subscription
from app.schemas.report import (
    BusinessReportResponse,
    ReportMetric,
    ReportChartConfig,
    ImportantChange,
    ReportCatalogItem,
)

logger = logging.getLogger(__name__)


REPORT_CATALOG: List[ReportCatalogItem] = [
    ReportCatalogItem(
        report_type="daily",
        title="Daily Operational Briefing",
        description="24-hour snapshot of intraday sales, new leads, automated tasks, and active support tickets.",
        cadence="Every 24 Hours",
        icon="Calendar",
    ),
    ReportCatalogItem(
        report_type="weekly",
        title="Weekly Executive Summary",
        description="7-day cross-functional analysis covering weekly bookings, lead pacing, and team velocity.",
        cadence="Every Monday 08:00 AM",
        icon="BarChart3",
    ),
    ReportCatalogItem(
        report_type="monthly",
        title="Monthly Strategic Review",
        description="Comprehensive 30-day review tracking MRR growth, sales targets, customer churn, and pipeline ROI.",
        cadence="1st of Every Month",
        icon="TrendingUp",
    ),
    ReportCatalogItem(
        report_type="sales",
        title="Sales Velocity & Quota Performance",
        description="Deep dive into transaction volumes, average order value, rep productivity, and product mix.",
        cadence="On Demand / Bi-Weekly",
        icon="DollarSign",
    ),
    ReportCatalogItem(
        report_type="lead",
        title="Lead Intelligence & Funnel Attribution",
        description="Inbound lead qualification, channel ROI (Organic vs Paid vs Referral), and conversion velocity.",
        cadence="On Demand / Weekly",
        icon="Target",
    ),
    ReportCatalogItem(
        report_type="customer",
        title="Customer Health & Retention Ledger",
        description="Account health tiers, cohort retention, Net Revenue Retention (NRR), and churn risk mitigation.",
        cadence="On Demand / Monthly",
        icon="Users",
    ),
    ReportCatalogItem(
        report_type="revenue",
        title="Revenue, Collections & Financial Audit",
        description="Recognized revenues, receivables aging, gross margin trajectory, and 90-day cash projections.",
        cadence="On Demand / End of Month",
        icon="PieChart",
    ),
]


def clean_latin1(text: str) -> str:
    """Sanitize string for FPDF latin-1 encoding."""
    if not text:
        return ""
    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\u2022": "*",
        "\u2026": "...",
        "\u00a0": " ",
        "€": "EUR ",
        "£": "GBP ",
        "₹": "INR ",
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    return text.encode("latin-1", "replace").decode("latin-1")


class BusinessReportService:
    def __init__(self, db: Session, org_id: str):
        self.db = db
        self.org_id = org_id

    def get_catalog(self) -> List[ReportCatalogItem]:
        return REPORT_CATALOG

    def generate_report(self, report_type: str) -> BusinessReportResponse:
        report_type = report_type.lower().strip()
        generator_map = {
            "daily": self._generate_daily_report,
            "weekly": self._generate_weekly_report,
            "monthly": self._generate_monthly_report,
            "sales": self._generate_sales_report,
            "lead": self._generate_lead_report,
            "customer": self._generate_customer_report,
            "revenue": self._generate_revenue_report,
        }
        generator = generator_map.get(report_type)
        if not generator:
            logger.warning("Unknown report type '%s', defaulting to daily report", report_type)
            generator = self._generate_daily_report
        return generator()

    # 1. DAILY REPORT
    def _generate_daily_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)

        query_sales = self.db.query(Sale).filter(Sale.created_at >= yesterday)
        query_leads = self.db.query(Lead).filter(Lead.created_at >= yesterday)
        query_invs = self.db.query(Invoice).filter(Invoice.created_at >= yesterday)
        if self.org_id:
            query_sales = query_sales.filter(Sale.organization_id == self.org_id)
            query_leads = query_leads.filter(Lead.organization_id == self.org_id)
            query_invs = query_invs.filter(Invoice.organization_id == self.org_id)

        day_sales = query_sales.all()
        total_sales_amount = sum(s.amount for s in day_sales)
        deals_count = len(day_sales)

        day_leads = query_leads.all()
        leads_count = len(day_leads)

        day_invoices = query_invs.all()
        invoices_processed = len(day_invoices)

        metrics = [
            ReportMetric(
                key="daily_revenue",
                label="Daily Revenue",
                value=f"${total_sales_amount:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if total_sales_amount > 0 else "NEUTRAL",
                subtitle="past 24 hours recognized sales",
            ),
            ReportMetric(
                key="deals_closed",
                label="Deals Closed",
                value=str(deals_count),
                change_pct=0.0,
                trend_direction="UP" if deals_count > 0 else "NEUTRAL",
                subtitle=f"average deal: ${total_sales_amount / max(1, deals_count):,.2f}" if deals_count > 0 else "no deals closed",
            ),
            ReportMetric(
                key="new_leads",
                label="New Leads Ingested",
                value=str(leads_count),
                change_pct=0.0,
                trend_direction="UP" if leads_count > 0 else "NEUTRAL",
                subtitle="inbound pipeline entries",
            ),
            ReportMetric(
                key="invoices_processed",
                label="Documents Processed",
                value=str(invoices_processed),
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="automated OCR intake",
            ),
        ]

        chart_data = []
        if deals_count > 0 or leads_count > 0:
            chart_data = [
                {"period": "Past 24h", "primary_value": round(total_sales_amount, 2), "secondary_value": deals_count + leads_count, "label": "Past 24h"}
            ]

        changes = []
        if deals_count > 0:
            changes.append(
                ImportantChange(
                    id="c-d1",
                    title="Daily Transactions Recorded",
                    impact_type="POSITIVE",
                    timestamp="Past 24h",
                    details=f"{deals_count} sales transactions completed totaling ${total_sales_amount:,.2f}.",
                )
            )

        ai_summary = (
            f"Operational briefing for the past 24 hours: {deals_count} transactions completed totaling ${total_sales_amount:,.2f}, "
            f"with {leads_count} new leads ingested and {invoices_processed} documents processed."
            if (deals_count > 0 or leads_count > 0)
            else "No sales or operational transactions recorded in the past 24 hours. Activity will appear as records are processed."
        )

        return BusinessReportResponse(
            report_type="daily",
            title="Daily Operational Briefing",
            period_label=f"Past 24 Hours ({now.strftime('%b %d, %Y')})",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Hourly Intraday Revenue & Activity Velocity",
                primary_label="Revenue ($)",
                secondary_label="Leads & Deals",
                chart_type="area",
            ),
            trends=[
                f"Recorded daily commercial sales: ${total_sales_amount:,.2f}.",
                f"Active pipeline intake: {leads_count} leads.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 2. WEEKLY REPORT
    def _generate_weekly_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)

        query_sales = self.db.query(Sale).filter(Sale.created_at >= week_ago)
        query_leads = self.db.query(Lead).filter(Lead.created_at >= week_ago)
        if self.org_id:
            query_sales = query_sales.filter(Sale.organization_id == self.org_id)
            query_leads = query_leads.filter(Lead.organization_id == self.org_id)

        week_sales = query_sales.all()
        total_sales_amount = sum(s.amount for s in week_sales)
        deals_count = len(week_sales)
        week_leads = query_leads.all()
        leads_count = len(week_leads)
        avg_deal = total_sales_amount / max(1, deals_count) if deals_count > 0 else 0.0

        metrics = [
            ReportMetric(
                key="weekly_revenue",
                label="Weekly Revenue",
                value=f"${total_sales_amount:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if total_sales_amount > 0 else "NEUTRAL",
                subtitle="last 7 days total volume",
            ),
            ReportMetric(
                key="weekly_deals",
                label="Deals Won",
                value=str(deals_count),
                change_pct=0.0,
                trend_direction="UP" if deals_count > 0 else "NEUTRAL",
                subtitle="closed won transactions",
            ),
            ReportMetric(
                key="new_leads",
                label="New Qualified Leads",
                value=str(leads_count),
                change_pct=0.0,
                trend_direction="UP" if leads_count > 0 else "NEUTRAL",
                subtitle="new opportunities",
            ),
            ReportMetric(
                key="avg_deal_size",
                label="Average Deal Size",
                value=f"${avg_deal:,.2f}",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="mean realized deal value",
            ),
        ]

        chart_data = []
        if deals_count > 0:
            by_day = defaultdict(float)
            for s in week_sales:
                day_name = s.created_at.strftime("%a") if s.created_at else "Other"
                by_day[day_name] += s.amount
            chart_data = [
                {"period": d, "primary_value": round(amt, 2), "secondary_value": 0, "label": d}
                for d, amt in by_day.items()
            ]

        ai_summary = (
            f"The past 7 days concluded with ${total_sales_amount:,.2f} in total bookings across {deals_count} transactions, "
            f"with {leads_count} inbound leads registered."
            if (deals_count > 0 or leads_count > 0)
            else "No sales or lead acquisitions recorded over the past 7 days."
        )

        return BusinessReportResponse(
            report_type="weekly",
            title="Weekly Executive Summary",
            period_label="Last 7 Days",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Day-by-Day Revenue Run Rate",
                primary_label="Revenue ($)",
                secondary_label="Deals",
                chart_type="bar",
            ),
            trends=[
                f"7-day total revenue: ${total_sales_amount:,.2f}.",
                f"Average deal size: ${avg_deal:,.2f}.",
            ],
            important_changes=[],
            ai_summary=ai_summary,
        )

    # 3. MONTHLY REPORT
    def _generate_monthly_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        query_sales = self.db.query(Sale).filter(Sale.created_at >= first_day_this_month)
        query_cust = self.db.query(Customer)
        query_sub = self.db.query(Subscription).filter(Subscription.status == "ACTIVE")
        if self.org_id:
            query_sales = query_sales.filter(Sale.organization_id == self.org_id)
            query_cust = query_cust.filter(Customer.organization_id == self.org_id)
            query_sub = query_sub.filter(Subscription.organization_id == self.org_id)

        sales = query_sales.all()
        month_revenue = sum(s.amount for s in sales)
        active_customers = query_cust.filter(Customer.status == "ACTIVE").count()
        subs = query_sub.all()
        mrr = sum(sub.monthly_price for sub in subs)

        metrics = [
            ReportMetric(
                key="monthly_mrr",
                label="Monthly Recurring Revenue",
                value=f"${mrr:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if mrr > 0 else "NEUTRAL",
                subtitle="active subscription run rate",
            ),
            ReportMetric(
                key="monthly_sales",
                label="Month-to-Date Sales",
                value=f"${month_revenue:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if month_revenue > 0 else "NEUTRAL",
                subtitle="actual booked volume",
            ),
            ReportMetric(
                key="active_customers",
                label="Active Customers",
                value=str(active_customers),
                change_pct=0.0,
                trend_direction="UP" if active_customers > 0 else "NEUTRAL",
                subtitle="accounts in good standing",
            ),
            ReportMetric(
                key="churn_rate",
                label="Monthly Logo Churn",
                value="0.0%",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="customer retention metric",
            ),
        ]

        chart_data = []
        if len(sales) > 0:
            chart_data = [
                {"period": now.strftime("%b %Y"), "primary_value": round(month_revenue, 2), "secondary_value": len(sales), "label": now.strftime("%b")}
            ]

        ai_summary = (
            f"Monthly strategic review: Month-to-date sales reached ${month_revenue:,.2f} with ${mrr:,.2f} in active MRR "
            f"supporting {active_customers} active client accounts."
            if (month_revenue > 0 or mrr > 0)
            else "No sales or subscriptions recorded for the current month."
        )

        return BusinessReportResponse(
            report_type="monthly",
            title="Monthly Strategic Review",
            period_label=f"Current Month ({now.strftime('%B %Y')})",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Monthly Cumulative Revenue Growth",
                primary_label="Bookings ($)",
                secondary_label="Transactions",
                chart_type="line",
            ),
            trends=[
                f"Current month gross sales: ${month_revenue:,.2f}.",
                f"Platform subscription MRR: ${mrr:,.2f}.",
            ],
            important_changes=[],
            ai_summary=ai_summary,
        )

    # 4. SALES REPORT
    def _generate_sales_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        query = self.db.query(Sale).filter(Sale.status == "COMPLETED")
        if self.org_id:
            query = query.filter(Sale.organization_id == self.org_id)
        sales = query.all()

        total_rev = sum(s.amount for s in sales)
        tx_count = len(sales)
        aov = total_rev / max(1, tx_count) if tx_count > 0 else 0.0

        lead_query = self.db.query(Lead)
        if self.org_id:
            lead_query = lead_query.filter(Lead.organization_id == self.org_id)
        total_leads = lead_query.count()
        won_leads = lead_query.filter(Lead.status.in_(["WON", "CONVERTED"])).count()
        win_rate = round((won_leads / max(1, total_leads)) * 100.0, 1) if total_leads > 0 else 0.0

        metrics = [
            ReportMetric(
                key="gross_sales",
                label="Gross Sales Revenue",
                value=f"${total_rev:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if total_rev > 0 else "NEUTRAL",
                subtitle=f"{tx_count} closed transactions",
            ),
            ReportMetric(
                key="aov",
                label="Average Order Value (AOV)",
                value=f"${aov:,.2f}",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="mean transaction value",
            ),
            ReportMetric(
                key="sales_velocity",
                label="Total Orders",
                value=str(tx_count),
                change_pct=0.0,
                trend_direction="UP" if tx_count > 0 else "NEUTRAL",
                subtitle="completed transactions",
            ),
            ReportMetric(
                key="pipeline_win_rate",
                label="Pipeline Win Rate",
                value=f"{win_rate}%",
                change_pct=0.0,
                trend_direction="UP" if win_rate > 0 else "NEUTRAL",
                subtitle="lead-to-win ratio",
            ),
        ]

        chart_data = []
        if sales:
            by_prod = defaultdict(lambda: {"revenue": 0.0, "units": 0})
            for s in sales:
                pname = s.product_name or "Enterprise AI Suite"
                by_prod[pname]["revenue"] += s.amount
                by_prod[pname]["units"] += 1
            chart_data = [
                {"period": p, "primary_value": round(info["revenue"], 2), "secondary_value": info["units"], "label": p}
                for p, info in by_prod.items()
            ]

        ai_summary = (
            f"Sales velocity summary: Generated ${total_rev:,.2f} across {tx_count} completed orders, with an Average Order Value of ${aov:,.2f} and a {win_rate}% lead win rate."
            if tx_count > 0
            else "No completed sales transactions found in the database. Transactions will automatically populate this performance report."
        )

        return BusinessReportResponse(
            report_type="sales",
            title="Sales Velocity & Quota Performance",
            period_label="All Recorded Sales",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Product Line Revenue Performance & Units Sold",
                primary_label="Revenue ($)",
                secondary_label="Units Sold",
                chart_type="bar",
            ),
            trends=[
                f"Cumulative gross sales: ${total_rev:,.2f}.",
                f"Total completed orders: {tx_count}.",
            ],
            important_changes=[],
            ai_summary=ai_summary,
        )

    # 5. LEAD REPORT
    def _generate_lead_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        query = self.db.query(Lead)
        if self.org_id:
            query = query.filter(Lead.organization_id == self.org_id)
        leads = query.all()

        total = len(leads)
        hot_warm = sum(1 for l in leads if (l.classification or "").upper() in ("HOT", "WARM"))
        qual_rate = round((hot_warm / max(1, total)) * 100.0, 1) if total > 0 else 0.0
        won_count = sum(1 for l in leads if (l.status or "").upper() in ("WON", "CONVERTED"))
        mql_sql = round((won_count / max(1, total)) * 100.0, 1) if total > 0 else 0.0
        avg_score = round(sum(l.ai_score or 0.0 for l in leads) / max(1, total), 1) if total > 0 else 0.0

        metrics = [
            ReportMetric(
                key="total_leads",
                label="Total Leads Managed",
                value=str(total),
                change_pct=0.0,
                trend_direction="UP" if total > 0 else "NEUTRAL",
                subtitle="inbound and outbound prospects",
            ),
            ReportMetric(
                key="qualification_rate",
                label="AI Qualification Rate",
                value=f"{qual_rate}%",
                change_pct=0.0,
                trend_direction="UP" if qual_rate > 0 else "NEUTRAL",
                subtitle="classified as Hot or Warm",
            ),
            ReportMetric(
                key="mql_to_sql",
                label="Win Conversion Rate",
                value=f"{mql_sql}%",
                change_pct=0.0,
                trend_direction="UP" if mql_sql > 0 else "NEUTRAL",
                subtitle="won customer conversion",
            ),
            ReportMetric(
                key="avg_lead_score",
                label="Average Lead Score",
                value=f"{avg_score} / 100",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="mean algorithmic score",
            ),
        ]

        chart_data = []
        if leads:
            by_src = defaultdict(lambda: {"count": 0, "score": 0.0})
            for l in leads:
                src = l.source or "Direct"
                by_src[src]["count"] += 1
                by_src[src]["score"] += l.ai_score or 0.0
            chart_data = [
                {"period": s, "primary_value": info["count"], "secondary_value": round(info["score"] / max(1, info["count"]), 1), "label": s}
                for s, info in by_src.items()
            ]

        ai_summary = (
            f"Lead intelligence review: Total pipeline volume stands at {total} leads with an AI qualification rate of {qual_rate}% and average score of {avg_score}/100."
            if total > 0
            else "No leads registered in the pipeline. Ingest inbound leads to generate attribution analytics."
        )

        return BusinessReportResponse(
            report_type="lead",
            title="Lead Intelligence & Funnel Attribution",
            period_label="Pipeline Overview",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Lead Acquisition by Channel & Average Lead Score",
                primary_label="Lead Volume",
                secondary_label="Average Score",
                chart_type="bar",
            ),
            trends=[
                f"Total pipeline records: {total}.",
                f"AI qualified prospects: {hot_warm}.",
            ],
            important_changes=[],
            ai_summary=ai_summary,
        )

    # 6. CUSTOMER REPORT
    def _generate_customer_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        query = self.db.query(Customer)
        if self.org_id:
            query = query.filter(Customer.organization_id == self.org_id)
        customers = query.all()

        total = len(customers)
        active_count = sum(1 for c in customers if c.status == "ACTIVE")
        total_ltv = sum(c.ltv or 0.0 for c in customers)
        avg_ltv = total_ltv / max(1, total) if total > 0 else 0.0

        metrics = [
            ReportMetric(
                key="active_customers",
                label="Total Active Customers",
                value=str(active_count),
                change_pct=0.0,
                trend_direction="UP" if active_count > 0 else "NEUTRAL",
                subtitle=f"out of {total} total accounts",
            ),
            ReportMetric(
                key="nrr",
                label="Total Customer LTV",
                value=f"${total_ltv:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if total_ltv > 0 else "NEUTRAL",
                subtitle="aggregate account value",
            ),
            ReportMetric(
                key="avg_ltv",
                label="Average Customer LTV",
                value=f"${avg_ltv:,.2f}",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="mean value per customer",
            ),
            ReportMetric(
                key="csat_score",
                label="Account Health",
                value="Good" if active_count > 0 else "Neutral",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="portfolio status",
            ),
        ]

        chart_data = []
        if customers:
            by_tier = defaultdict(lambda: {"count": 0, "ltv": 0.0})
            for c in customers:
                tier = c.tier or "Standard"
                by_tier[tier]["count"] += 1
                by_tier[tier]["ltv"] += c.ltv or 0.0
            chart_data = [
                {"period": t, "primary_value": info["count"], "secondary_value": round(info["ltv"], 2), "label": t}
                for t, info in by_tier.items()
            ]

        ai_summary = (
            f"Customer health report: Portfolio encompasses {total} registered accounts ({active_count} active) with an aggregate realized LTV of ${total_ltv:,.2f}."
            if total > 0
            else "No customer accounts registered in directory. Add customers to monitor retention."
        )

        return BusinessReportResponse(
            report_type="customer",
            title="Customer Health & Retention Ledger",
            period_label="Current Account Portfolio",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Customer Segment Distribution & Contract Value ($)",
                primary_label="Account Count",
                secondary_label="Total LTV ($)",
                chart_type="bar",
            ),
            trends=[
                f"Registered accounts: {total}.",
                f"Aggregate customer LTV: ${total_ltv:,.2f}.",
            ],
            important_changes=[],
            ai_summary=ai_summary,
        )

    # 7. REVENUE REPORT
    def _generate_revenue_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        query_sales = self.db.query(Sale).filter(Sale.status == "COMPLETED")
        query_invs = self.db.query(Invoice).filter(Invoice.status != "PAID")
        if self.org_id:
            query_sales = query_sales.filter(Sale.organization_id == self.org_id)
            query_invs = query_invs.filter(Invoice.organization_id == self.org_id)

        sales = query_sales.all()
        invoices = query_invs.all()

        net_rev = sum(s.amount for s in sales)
        ar_total = sum(i.total_amount or 0.0 for i in invoices)

        metrics = [
            ReportMetric(
                key="net_recognized_rev",
                label="Net Recognized Revenue",
                value=f"${net_rev:,.2f}",
                change_pct=0.0,
                trend_direction="UP" if net_rev > 0 else "NEUTRAL",
                subtitle="completed sales receipts",
            ),
            ReportMetric(
                key="accounts_receivable",
                label="Accounts Receivable",
                value=f"${ar_total:,.2f}",
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle=f"{len(invoices)} pending/unsettled invoices",
            ),
            ReportMetric(
                key="gross_margin",
                label="Realized Transactions",
                value=str(len(sales)),
                change_pct=0.0,
                trend_direction="UP" if len(sales) > 0 else "NEUTRAL",
                subtitle="total billed events",
            ),
            ReportMetric(
                key="dso",
                label="Outstanding Invoices",
                value=str(len(invoices)),
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="awaiting verification/payment",
            ),
        ]

        chart_data = []
        if net_rev > 0 or ar_total > 0:
            chart_data = [
                {"period": "Recognized Revenue", "primary_value": round(net_rev, 2), "secondary_value": len(sales), "label": "Revenue"},
                {"period": "Accounts Receivable", "primary_value": round(ar_total, 2), "secondary_value": len(invoices), "label": "Receivables"},
            ]

        ai_summary = (
            f"Financial audit: Net recognized revenue is ${net_rev:,.2f} across {len(sales)} transactions, with ${ar_total:,.2f} currently in pending accounts receivable across {len(invoices)} invoices."
            if (net_rev > 0 or ar_total > 0)
            else "No sales revenue or invoices recorded for financial audit."
        )

        return BusinessReportResponse(
            report_type="revenue",
            title="Revenue, Collections & Financial Audit",
            period_label="Current Financial Status",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Revenue Breakdown vs Receivables",
                primary_label="Amount ($)",
                secondary_label="Count",
                chart_type="bar",
            ),
            trends=[
                f"Recognized revenue total: ${net_rev:,.2f}.",
                f"Accounts receivable total: ${ar_total:,.2f}.",
            ],
            important_changes=[],
            ai_summary=ai_summary,
        )

    # EXPORT AS PDF
    def export_pdf(self, report: BusinessReportResponse) -> bytes:
        """Render a clean, professional corporate PDF report using FPDF."""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Corporate Header Banner
        pdf.set_fill_color(30, 41, 59)  # Slate-800
        pdf.rect(0, 0, 210, 32, "F")

        # Title in Banner
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_text_color(255, 255, 255)
        pdf.set_xy(15, 8)
        pdf.cell(180, 8, clean_latin1("UPTEKY AI - BUSINESS INTELLIGENCE REPORT"), ln=1)

        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(148, 163, 184)  # Slate-400
        pdf.set_x(15)
        pdf.cell(180, 6, clean_latin1(f"{report.title.upper()} | {report.period_label}"), ln=1)

        # Metadata Row
        pdf.set_y(36)
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(100, 116, 139)
        org_label = f"Organization ID: {self.org_id[:12]}..." if self.org_id else "Platform Wide"
        pdf.cell(0, 5, clean_latin1(f"Generated on: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')} | {org_label}"), ln=1)

        # Section 1: AI-Generated Executive Summary
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(15, 23, 42)  # Slate-900
        pdf.cell(0, 7, clean_latin1("1. AI Executive Summary"), ln=1)

        pdf.set_fill_color(241, 245, 249)  # Slate-100
        pdf.set_draw_color(203, 213, 225)
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(51, 65, 85)

        # Summary Box
        pdf.multi_cell(180, 5.5, clean_latin1(report.ai_summary), border=1, fill=True)
        pdf.ln(4)

        # Section 2: Key Metrics Table
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 7, clean_latin1("2. Key Performance Indicators (KPIs)"), ln=1)

        # Table Header
        pdf.set_fill_color(79, 70, 229)  # Indigo-600
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(50, 7, clean_latin1("Metric Name"), border=1, fill=True)
        pdf.cell(35, 7, clean_latin1("Current Value"), border=1, fill=True, align="R")
        pdf.cell(35, 7, clean_latin1("Change %"), border=1, fill=True, align="C")
        pdf.cell(60, 7, clean_latin1("Context & Benchmark"), border=1, fill=True)
        pdf.ln()

        # Table Rows
        pdf.set_font("Helvetica", "", 8.5)
        pdf.set_text_color(30, 41, 59)
        fill = False
        for m in report.key_metrics:
            pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(255, 255, 255)
            chg_sign = "+" if m.change_pct > 0 else ""
            pdf.cell(50, 6.5, clean_latin1(m.label), border=1, fill=fill)
            pdf.cell(35, 6.5, clean_latin1(m.value), border=1, fill=fill, align="R")
            pdf.cell(35, 6.5, clean_latin1(f"{chg_sign}{m.change_pct:.1f}% ({m.trend_direction})"), border=1, fill=fill, align="C")
            pdf.cell(60, 6.5, clean_latin1(m.subtitle), border=1, fill=fill)
            pdf.ln()
            fill = not fill

        pdf.ln(5)

        # Section 3: Important Changes & Notable Events
        if report.important_changes:
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 7, clean_latin1("3. Important Changes & Operational Events"), ln=1)

            pdf.set_font("Helvetica", "", 8.5)
            for c in report.important_changes:
                pdf.set_font("Helvetica", "B", 9)
                pdf.set_text_color(79, 70, 229) if c.impact_type == "POSITIVE" else pdf.set_text_color(225, 29, 72)
                pdf.cell(0, 5, clean_latin1(f"[{c.impact_type}] {c.title} ({c.timestamp})"), ln=1)
                pdf.set_font("Helvetica", "", 8.5)
                pdf.set_text_color(71, 85, 105)
                pdf.multi_cell(180, 4.5, clean_latin1(f"  * {c.details}"))
                pdf.ln(1)
            pdf.ln(4)

        # Section 4: Macro Trend Observations
        if report.trends:
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 7, clean_latin1("4. Strategic Observations"), ln=1)

            pdf.set_font("Helvetica", "", 8.5)
            pdf.set_text_color(51, 65, 85)
            for t in report.trends:
                pdf.multi_cell(180, 5, clean_latin1(f"- {t}"))

        # Footer note
        pdf.ln(8)
        pdf.set_draw_color(226, 232, 240)
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.ln(2)
        pdf.set_font("Helvetica", "I", 7.5)
        pdf.set_text_color(148, 163, 184)
        pdf.cell(0, 5, clean_latin1("Upteky AI Platform - Confidential & Proprietary Business Intelligence. Generated automatically."), ln=1, align="C")

        raw_str = pdf.output(dest="S")
        return raw_str.encode("latin-1")

    # EXPORT AS CSV
    def export_csv(self, report: BusinessReportResponse) -> str:
        """Render a structured CSV file containing all report sections."""
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["UPTEKY AI BUSINESS REPORT"])
        writer.writerow(["Report Type", report.report_type])
        writer.writerow(["Report Title", report.title])
        writer.writerow(["Period", report.period_label])
        writer.writerow(["Generated At", report.generated_at.isoformat()])
        writer.writerow([])

        writer.writerow(["EXECUTIVE AI SUMMARY"])
        writer.writerow([report.ai_summary])
        writer.writerow([])

        writer.writerow(["KEY PERFORMANCE METRICS"])
        writer.writerow(["Key", "Label", "Value", "Change %", "Trend Direction", "Subtitle"])
        for m in report.key_metrics:
            writer.writerow([m.key, m.label, m.value, f"{m.change_pct}%", m.trend_direction, m.subtitle])
        writer.writerow([])

        writer.writerow(["CHART SERIES DATA", report.chart_config.title])
        if report.chart_data:
            headers = list(report.chart_data[0].keys())
            writer.writerow(headers)
            for row in report.chart_data:
                writer.writerow([row.get(h, "") for h in headers])
        writer.writerow([])

        writer.writerow(["IMPORTANT CHANGES & EVENTS"])
        writer.writerow(["ID", "Impact Type", "Timestamp", "Title", "Details"])
        for c in report.important_changes:
            writer.writerow([c.id, c.impact_type, c.timestamp, c.title, c.details])
        writer.writerow([])

        writer.writerow(["STRATEGIC TRENDS"])
        for t in report.trends:
            writer.writerow([t])

        return output.getvalue()
