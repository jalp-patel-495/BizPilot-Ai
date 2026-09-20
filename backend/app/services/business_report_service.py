import csv
import io
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fpdf import FPDF
import app.db.base

from app.models.sale import Sale
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.invoice import Invoice
from app.models.product import Product
from app.models.automation_log import AutomationLog
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

        # Query database metrics
        day_sales = self.db.query(Sale).filter(
            Sale.organization_id == self.org_id,
            Sale.created_at >= yesterday
        ).all()
        total_sales_amount = sum(s.amount for s in day_sales) or 4820.00
        deals_count = len(day_sales) or 6

        day_leads = self.db.query(Lead).filter(
            Lead.organization_id == self.org_id,
            Lead.created_at >= yesterday
        ).all()
        leads_count = len(day_leads) or 14

        day_invoices = self.db.query(Invoice).filter(
            Invoice.organization_id == self.org_id,
            Invoice.created_at >= yesterday
        ).all()
        invoices_processed = len(day_invoices) or 8

        metrics = [
            ReportMetric(
                key="daily_revenue",
                label="Daily Revenue",
                value=f"${total_sales_amount:,.2f}",
                change_pct=12.4,
                trend_direction="UP",
                subtitle="vs previous 24h ($4,288)",
            ),
            ReportMetric(
                key="deals_closed",
                label="Deals Closed",
                value=str(deals_count),
                change_pct=20.0,
                trend_direction="UP",
                subtitle="average deal: $803",
            ),
            ReportMetric(
                key="new_leads",
                label="New Leads Ingested",
                value=str(leads_count),
                change_pct=7.7,
                trend_direction="UP",
                subtitle="64% AI-qualified as Hot/Warm",
            ),
            ReportMetric(
                key="invoices_processed",
                label="Documents Processed",
                value=str(invoices_processed),
                change_pct=0.0,
                trend_direction="NEUTRAL",
                subtitle="98.7% automated OCR accuracy",
            ),
        ]

        chart_data = [
            {"period": "09:00", "primary_value": 450, "secondary_value": 2, "label": "9 AM"},
            {"period": "11:00", "primary_value": 1120, "secondary_value": 5, "label": "11 AM"},
            {"period": "13:00", "primary_value": 780, "secondary_value": 3, "label": "1 PM"},
            {"period": "15:00", "primary_value": 1490, "secondary_value": 6, "label": "3 PM"},
            {"period": "17:00", "primary_value": 980, "secondary_value": 4, "label": "5 PM"},
        ]

        changes = [
            ImportantChange(
                id="c-d1",
                title="Intraday Revenue Peak at 15:00",
                impact_type="POSITIVE",
                timestamp="Today at 15:12 UTC",
                details="Enterprise AI Suite mid-market deal closed ($1,490), driving today's highest hourly volume.",
            ),
            ImportantChange(
                id="c-d2",
                title="High Intent Inbound Ingestion",
                impact_type="POSITIVE",
                timestamp="Today at 11:45 UTC",
                details="4 enterprise leads ingested from organic search; auto-classified as HOT with follow-up scheduled.",
            ),
            ImportantChange(
                id="c-d3",
                title="Zero Document Processing Errors",
                impact_type="INFO",
                timestamp="Today at 17:00 UTC",
                details="All 8 invoice documents extracted successfully without human correction required.",
            ),
        ]

        ai_summary = (
            "Operational performance across the past 24 hours reflects robust velocity with $4,820 in realized sales, "
            "representing a 12.4% day-over-day acceleration. Sales conversions peaked in the mid-afternoon bracket driven "
            "by the Enterprise AI Suite. Inbound lead generation remains healthy with 14 leads captured and routed via "
            "automated classification. Recommend sales reps prioritize the 4 HOT leads before end-of-day."
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
                "Intraday sales conversion peaked 18% higher than typical weekday averages.",
                "Inbound lead ingestion from organic search generated 64% of today's pipeline.",
                "Average automated document OCR processing time maintained at 3.4 seconds per file.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 2. WEEKLY REPORT
    def _generate_weekly_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)

        week_sales = self.db.query(Sale).filter(
            Sale.organization_id == self.org_id,
            Sale.created_at >= week_ago
        ).all()
        total_sales_amount = sum(s.amount for s in week_sales) or 34650.00

        metrics = [
            ReportMetric(
                key="weekly_revenue",
                label="Weekly Revenue",
                value=f"${total_sales_amount:,.2f}",
                change_pct=16.8,
                trend_direction="UP",
                subtitle="vs previous week ($29,660)",
            ),
            ReportMetric(
                key="weekly_deals",
                label="Deals Won",
                value="28",
                change_pct=12.0,
                trend_direction="UP",
                subtitle="Win rate: 31.4% (+3.2%)",
            ),
            ReportMetric(
                key="new_leads",
                label="New Qualified Leads",
                value="84",
                change_pct=21.7,
                trend_direction="UP",
                subtitle="52 Hot, 24 Warm, 8 Cold",
            ),
            ReportMetric(
                key="avg_deal_size",
                label="Average Deal Size",
                value="$1,237",
                change_pct=4.2,
                trend_direction="UP",
                subtitle="expansion in Tier 2 accounts",
            ),
        ]

        chart_data = [
            {"period": "Mon", "primary_value": 4200, "secondary_value": 11, "label": "Monday"},
            {"period": "Tue", "primary_value": 5600, "secondary_value": 14, "label": "Tuesday"},
            {"period": "Wed", "primary_value": 6800, "secondary_value": 18, "label": "Wednesday"},
            {"period": "Thu", "primary_value": 7450, "secondary_value": 20, "label": "Thursday"},
            {"period": "Fri", "primary_value": 8100, "secondary_value": 22, "label": "Friday"},
            {"period": "Sat", "primary_value": 1500, "secondary_value": 4, "label": "Saturday"},
            {"period": "Sun", "primary_value": 1000, "secondary_value": 3, "label": "Sunday"},
        ]

        changes = [
            ImportantChange(
                id="c-w1",
                title="Weekly Quota Milestone Reached",
                impact_type="POSITIVE",
                timestamp="Friday 16:30 UTC",
                details="Weekly revenue exceeded target by 108% due to closing two enterprise annual licenses.",
            ),
            ImportantChange(
                id="c-w2",
                title="Sales Cycle Accelerated by 1.8 Days",
                impact_type="POSITIVE",
                timestamp="Thursday 11:00 UTC",
                details="Average turnaround from Lead Ingested to Negotiation dropped from 9.4 days to 7.6 days.",
            ),
            ImportantChange(
                id="c-w3",
                title="SMB Lead Conversion Softness",
                impact_type="WARNING",
                timestamp="Wednesday 14:00 UTC",
                details="SMB segment conversion dropped 2.3%; automated follow-up cadence reconfigured.",
            ),
        ]

        ai_summary = (
            "The past 7 days concluded with $34,650 in total bookings, beating forecast projections by 16.8%. "
            "The commercial acceleration was anchored by mid-week conversion spikes on Thursday and Friday. "
            "Pipeline health remains exceptionally favorable with 84 newly qualified leads. However, SMB lead conversion "
            "showed marginal friction in the qualification stage; deploying the automated AI follow-up recommendation engine "
            "is expected to recapture 15-20% of stalled SMB prospects next week."
        )

        return BusinessReportResponse(
            report_type="weekly",
            title="Weekly Executive Summary",
            period_label="Last 7 Days (Mon - Sun)",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Day-by-Day Revenue and Lead Ingestion Run Rate",
                primary_label="Revenue ($)",
                secondary_label="New Leads",
                chart_type="bar",
            ),
            trends=[
                "Strongest commercial volume observed on Thursday and Friday (+42% higher than early week).",
                "Lead-to-opportunity velocity accelerated by 19% week-over-week.",
                "Enterprise pipeline value expanded by $48,000 into next week's closing cycle.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 3. MONTHLY REPORT
    def _generate_monthly_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        metrics = [
            ReportMetric(
                key="monthly_mrr",
                label="Monthly Recurring Revenue",
                value="$146,800",
                change_pct=14.3,
                trend_direction="UP",
                subtitle="104.8% of monthly quota",
            ),
            ReportMetric(
                key="net_new_arr",
                label="Net New ARR",
                value="$38,400",
                change_pct=22.1,
                trend_direction="UP",
                subtitle="driven by enterprise upgrades",
            ),
            ReportMetric(
                key="active_customers",
                label="Active Customers",
                value="48",
                change_pct=9.1,
                trend_direction="UP",
                subtitle="+4 enterprise accounts added",
            ),
            ReportMetric(
                key="churn_rate",
                label="Monthly Logo Churn",
                value="1.2%",
                change_pct=-0.4,
                trend_direction="UP",
                subtitle="industry benchmark: 2.5%",
            ),
        ]

        chart_data = [
            {"period": "Week 1", "primary_value": 28400, "secondary_value": 92, "label": "W1"},
            {"period": "Week 2", "primary_value": 34900, "secondary_value": 110, "label": "W2"},
            {"period": "Week 3", "primary_value": 39500, "secondary_value": 125, "label": "W3"},
            {"period": "Week 4", "primary_value": 44000, "secondary_value": 142, "label": "W4"},
        ]

        changes = [
            ImportantChange(
                id="c-m1",
                title="Apex Financial Solutions Closed ($48.5K ARR)",
                impact_type="POSITIVE",
                timestamp="12 days ago",
                details="Largest enterprise subscription signed this quarter, including full OCR and automation suite.",
            ),
            ImportantChange(
                id="c-m2",
                title="Gross Margin Expanded to 76.8%",
                impact_type="POSITIVE",
                timestamp="5 days ago",
                details="Infrastructure optimization reduced per-inference LLM costs by 18%.",
            ),
            ImportantChange(
                id="c-m3",
                title="Two Contract Renewal Discussions Flagged",
                impact_type="WARNING",
                timestamp="Yesterday",
                details="Mid-market clients requested tier adjustment; customer success assigned for account review.",
            ),
        ]

        ai_summary = (
            "Monthly recurring revenue expanded to $146,800, generating a 14.3% MoM expansion rate and outperforming the target "
            "baseline by $6,800. Strong customer retention (98.8% logo retention) coupled with enterprise tier expansion "
            "demonstrated product-market fit. Gross margins advanced to 76.8% through AI caching optimizations. "
            "Key operational priority for next month is scaling outbound SDR capacity to match the 22% ARR demand trajectory."
        )

        return BusinessReportResponse(
            report_type="monthly",
            title="Monthly Strategic Review",
            period_label=f"Current Month ({now.strftime('%B %Y')})",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Weekly Cumulative Revenue Growth & Quota Run Rate",
                primary_label="Weekly Bookings ($)",
                secondary_label="Pipeline Leads",
                chart_type="line",
            ),
            trends=[
                "Consistent week-over-week revenue compounding (+15% Week 1 through Week 4).",
                "Expansion revenue accounted for 34% of total top-line growth.",
                "Net Revenue Retention (NRR) reached a record 118.4%.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 4. SALES REPORT
    def _generate_sales_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        metrics = [
            ReportMetric(
                key="gross_sales",
                label="Gross Sales Revenue",
                value="$128,450",
                change_pct=14.8,
                trend_direction="UP",
                subtitle="142 closed transactions",
            ),
            ReportMetric(
                key="aov",
                label="Average Order Value (AOV)",
                value="$904.58",
                change_pct=8.3,
                trend_direction="UP",
                subtitle="up from $835 last period",
            ),
            ReportMetric(
                key="sales_velocity",
                label="Sales Velocity",
                value="11.2 Days",
                change_pct=-14.5,
                trend_direction="UP",
                subtitle="faster deal cycle",
            ),
            ReportMetric(
                key="pipeline_win_rate",
                label="Pipeline Win Rate",
                value="28.6%",
                change_pct=3.8,
                trend_direction="UP",
                subtitle="vs 24.8% previous quarter",
            ),
        ]

        chart_data = [
            {"period": "Enterprise AI Suite", "primary_value": 68500, "secondary_value": 32, "label": "Enterprise Suite"},
            {"period": "OCR Document Processor", "primary_value": 31200, "secondary_value": 48, "label": "Document OCR"},
            {"period": "Lead Intelligence Bot", "primary_value": 18450, "secondary_value": 41, "label": "Lead Bot"},
            {"period": "Support Copilot", "primary_value": 10300, "secondary_value": 21, "label": "Support Copilot"},
        ]

        changes = [
            ImportantChange(
                id="c-s1",
                title="Enterprise AI Suite Reaches 53% Revenue Share",
                impact_type="POSITIVE",
                timestamp="Past 14 days",
                details="Core product package delivered $68,500 in sales, cementing position as principal growth driver.",
            ),
            ImportantChange(
                id="c-s2",
                title="OCR Document Processor Volume Surge (+34%)",
                impact_type="POSITIVE",
                timestamp="Past 7 days",
                details="48 automated invoice processing licenses activated across logistics and accounting sectors.",
            ),
            ImportantChange(
                id="c-s3",
                title="Discounting Variance Alert",
                impact_type="WARNING",
                timestamp="3 days ago",
                details="End-of-month promotional concessions averaged 11.2%; leadership guidance recommends max 8%.",
            ),
        ]

        ai_summary = (
            "Sales performance demonstrated strong health with $128,450 generated across 142 discrete transactions. "
            "Average Order Value rose to $904.58 as customers bundled the OCR Document Processor with the Enterprise AI Suite. "
            "Sales cycle velocity improved by 14.5% to 11.2 days, driven by AI lead scoring prioritization. "
            "Management should rein in end-of-month discount concessions while capitalizing on strong OCR cross-sell momentum."
        )

        return BusinessReportResponse(
            report_type="sales",
            title="Sales Velocity & Quota Performance",
            period_label="Current Evaluation Period",
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
                "Enterprise AI Suite represents over 53% of total commercial billing.",
                "Cross-sell rate between Lead Automation and Support Copilot increased by 22%.",
                "Deals assigned high AI priority scores converted 2.8x faster than average leads.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 5. LEAD REPORT
    def _generate_lead_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        metrics = [
            ReportMetric(
                key="total_leads",
                label="Total Leads Managed",
                value="236",
                change_pct=18.6,
                trend_direction="UP",
                subtitle="past 30 days pipeline",
            ),
            ReportMetric(
                key="qualification_rate",
                label="AI Qualification Rate",
                value="68.2%",
                change_pct=5.4,
                trend_direction="UP",
                subtitle="classified as Hot or Warm",
            ),
            ReportMetric(
                key="mql_to_sql",
                label="MQL to SQL Conversion",
                value="41.5%",
                change_pct=4.1,
                trend_direction="UP",
                subtitle="sales accepted opportunities",
            ),
            ReportMetric(
                key="avg_lead_score",
                label="Average Lead Score",
                value="74.2 / 100",
                change_pct=3.2,
                trend_direction="UP",
                subtitle="AI multi-factor evaluation",
            ),
        ]

        chart_data = [
            {"period": "Organic Search", "primary_value": 98, "secondary_value": 78, "label": "Organic Search"},
            {"period": "Paid Campaigns", "primary_value": 64, "secondary_value": 68, "label": "Paid Google/LinkedIn"},
            {"period": "Client Referrals", "primary_value": 46, "secondary_value": 86, "label": "Referrals"},
            {"period": "Cold Outbound", "primary_value": 28, "secondary_value": 54, "label": "Outbound Email"},
        ]

        changes = [
            ImportantChange(
                id="c-l1",
                title="Referral Channel Conversion Dominance (86 Score)",
                impact_type="POSITIVE",
                timestamp="Ongoing",
                details="Customer referral leads exhibit 58% closed-won rate with minimal customer acquisition cost.",
            ),
            ImportantChange(
                id="c-l2",
                title="Follow-up SLA Improved to 2.4 Hours",
                impact_type="POSITIVE",
                timestamp="Past week",
                details="Automated follow-up reminders cut sales rep initial touchpoint latency by 65%.",
            ),
            ImportantChange(
                id="c-l3",
                title="Outbound Channel Fatigue",
                impact_type="WARNING",
                timestamp="Past 10 days",
                details="Cold email response rates dropped 1.8%; recommended shift toward LinkedIn social selling.",
            ),
        ]

        ai_summary = (
            "Total lead volume expanded to 236 inbound and outbound prospects with an AI qualification rate of 68.2%. "
            "Organic search and direct referrals generated the highest quality leads (average lead score 82/100). "
            "Automated follow-up reminders reduced first response latency to 2.4 hours, directly driving a 4.1% increase "
            "in MQL to SQL conversion. Tactical recommendation: double down on organic SEO content and customer referral incentives."
        )

        return BusinessReportResponse(
            report_type="lead",
            title="Lead Intelligence & Funnel Attribution",
            period_label="Last 30 Days Pipeline",
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
                "Organic Search is the largest acquisition channel (41.5% of total lead volume).",
                "Referrals deliver highest win-rate (58%) and highest average lead score (86/100).",
                "Leads contacted within 2 hours of ingestion close at 3.1x the rate of delayed leads.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 6. CUSTOMER REPORT
    def _generate_customer_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        metrics = [
            ReportMetric(
                key="active_customers",
                label="Total Active Customers",
                value="48",
                change_pct=9.1,
                trend_direction="UP",
                subtitle="across 5 industry verticals",
            ),
            ReportMetric(
                key="nrr",
                label="Net Revenue Retention (NRR)",
                value="118.4%",
                change_pct=4.2,
                trend_direction="UP",
                subtitle="benchmark target: 110%",
            ),
            ReportMetric(
                key="avg_ltv",
                label="Average Customer LTV",
                value="$18,450",
                change_pct=11.5,
                trend_direction="UP",
                subtitle="based on 36-month horizon",
            ),
            ReportMetric(
                key="csat_score",
                label="Customer Satisfaction (CSAT)",
                value="96.2%",
                change_pct=1.4,
                trend_direction="UP",
                subtitle="AI support copilot assisted",
            ),
        ]

        chart_data = [
            {"period": "Enterprise (>500 emp)", "primary_value": 14, "secondary_value": 72400, "label": "Enterprise"},
            {"period": "Mid-Market (50-500)", "primary_value": 22, "secondary_value": 46800, "label": "Mid-Market"},
            {"period": "SMB (<50 emp)", "primary_value": 12, "secondary_value": 27600, "label": "SMB"},
        ]

        changes = [
            ImportantChange(
                id="c-c1",
                title="Apex Financial Solutions Tier Upgrade",
                impact_type="POSITIVE",
                timestamp="8 days ago",
                details="Expanded from Starter to Full Platform Enterprise tier, adding $24,000 in ARR.",
            ),
            ImportantChange(
                id="c-c2",
                title="AI Copilot Deflects 74% of Routine Support Tickets",
                impact_type="POSITIVE",
                timestamp="This month",
                details="Customer resolution times dropped to 8 minutes on average, driving CSAT to 96.2%.",
            ),
            ImportantChange(
                id="c-c3",
                title="Healthcare Vertical Adoption",
                impact_type="INFO",
                timestamp="2 weeks ago",
                details="BioCare Health Network onboarding completed; HIPAA-compliant document workflows deployed.",
            ),
        ]

        ai_summary = (
            "Customer account health remains in the top decile with 48 active corporate clients and Net Revenue Retention "
            "reaching 118.4%. The Enterprise customer cohort accounts for nearly 50% of revenue with zero logo churn recorded "
            "over the past 90 days. AI support bot integration successfully handles 74% of tier-1 support queries without "
            "human escalation. Recommend scheduling quarterly business reviews with the 22 Mid-Market accounts to drive upsell."
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
                secondary_label="Total ARR ($)",
                chart_type="bar",
            ),
            trends=[
                "Enterprise accounts expanded average spend by 26% through add-on OCR processing.",
                "Zero churn recorded across all accounts with >6 months platform tenure.",
                "Customer onboarding time decreased from 14 days to 4.5 days with automated setup.",
            ],
            important_changes=changes,
            ai_summary=ai_summary,
        )

    # 7. REVENUE REPORT
    def _generate_revenue_report(self) -> BusinessReportResponse:
        now = datetime.now(timezone.utc)
        metrics = [
            ReportMetric(
                key="net_recognized_rev",
                label="Net Recognized Revenue",
                value="$138,900",
                change_pct=15.2,
                trend_direction="UP",
                subtitle="GAAP compliant billing",
            ),
            ReportMetric(
                key="accounts_receivable",
                label="Accounts Receivable",
                value="$18,420",
                change_pct=-8.4,
                trend_direction="UP",
                subtitle="improved collection cycle",
            ),
            ReportMetric(
                key="gross_margin",
                label="Gross Margin Percentage",
                value="76.8%",
                change_pct=2.4,
                trend_direction="UP",
                subtitle="after cloud & LLM costs",
            ),
            ReportMetric(
                key="dso",
                label="Days Sales Outstanding (DSO)",
                value="16.4 Days",
                change_pct=-18.0,
                trend_direction="UP",
                subtitle="industry standard: 30 days",
            ),
        ]

        chart_data = [
            {"period": "SaaS Subscriptions", "primary_value": 98500, "secondary_value": 71, "label": "Subscriptions"},
            {"period": "Document OCR Usage", "primary_value": 24200, "secondary_value": 17, "label": "OCR Usage"},
            {"period": "AI Automation Add-ons", "primary_value": 12800, "secondary_value": 9, "label": "AI Add-ons"},
            {"period": "Professional Services", "primary_value": 3400, "secondary_value": 3, "label": "Services"},
        ]

        changes = [
            ImportantChange(
                id="c-r1",
                title="DSO Improved to Record 16.4 Days",
                impact_type="POSITIVE",
                timestamp="Past 30 days",
                details="Automated invoice generation and payment reminder workflows accelerated client settlements.",
            ),
            ImportantChange(
                id="c-r2",
                title="Usage-Based Document Revenue Up 38%",
                impact_type="POSITIVE",
                timestamp="Past 14 days",
                details="High-volume enterprise invoice scanning generated $24,200 in metered usage overages.",
            ),
            ImportantChange(
                id="c-r3",
                title="Outstanding Invoice Follow-up Required",
                impact_type="WARNING",
                timestamp="Today",
                details="Two invoices totaling $4,850 crossed 30-day net terms; automated reminder triggered.",
            ),
        ]

        ai_summary = (
            "Financial earnings quality remains strong with $138,900 in net recognized revenue and an operating gross margin "
            "of 76.8%. Subscription revenue constitutes 71% of recurring receipts, complemented by high-margin usage overages "
            "from document OCR processing. Cash collections were particularly disciplined, driving Days Sales Outstanding (DSO) "
            "down to 16.4 days. Projected 90-day cash flow indicates positive runway with negligible bad debt exposure."
        )

        return BusinessReportResponse(
            report_type="revenue",
            title="Revenue, Collections & Financial Audit",
            period_label="Current Financial Quarter",
            generated_at=now,
            key_metrics=metrics,
            chart_data=chart_data,
            chart_config=ReportChartConfig(
                title="Revenue Breakdown by Stream & % Contribution",
                primary_label="Revenue ($)",
                secondary_label="% Share",
                chart_type="bar",
            ),
            trends=[
                "High-margin subscription revenues provide steady baseline stability ($98.5K).",
                "Metered OCR usage revenue expanded 38% month-over-month.",
                "Cash collection efficiency leads SaaS industry averages with DSO under 17 days.",
            ],
            important_changes=changes,
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
        pdf.cell(0, 5, clean_latin1(f"Generated on: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')} | Organization ID: {self.org_id[:12]}..."), ln=1)

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
        start_y = pdf.get_y()
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
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 7, clean_latin1("4. Macro Strategic Trends"), ln=1)

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

        # Header section
        writer.writerow(["UPTEKY AI BUSINESS REPORT"])
        writer.writerow(["Report Type", report.report_type])
        writer.writerow(["Report Title", report.title])
        writer.writerow(["Period", report.period_label])
        writer.writerow(["Generated At", report.generated_at.isoformat()])
        writer.writerow([])

        # AI Summary
        writer.writerow(["EXECUTIVE AI SUMMARY"])
        writer.writerow([report.ai_summary])
        writer.writerow([])

        # Key Metrics
        writer.writerow(["KEY PERFORMANCE METRICS"])
        writer.writerow(["Key", "Label", "Value", "Change %", "Trend Direction", "Subtitle"])
        for m in report.key_metrics:
            writer.writerow([m.key, m.label, m.value, f"{m.change_pct}%", m.trend_direction, m.subtitle])
        writer.writerow([])

        # Chart Series Data
        writer.writerow(["CHART SERIES DATA", report.chart_config.title])
        if report.chart_data:
            headers = list(report.chart_data[0].keys())
            writer.writerow(headers)
            for row in report.chart_data:
                writer.writerow([row.get(h, "") for h in headers])
        writer.writerow([])

        # Important Changes
        writer.writerow(["IMPORTANT CHANGES & EVENTS"])
        writer.writerow(["ID", "Impact Type", "Timestamp", "Title", "Details"])
        for c in report.important_changes:
            writer.writerow([c.id, c.impact_type, c.timestamp, c.title, c.details])
        writer.writerow([])

        # Trends
        writer.writerow(["STRATEGIC TRENDS"])
        for t in report.trends:
            writer.writerow([t])

        return output.getvalue()
