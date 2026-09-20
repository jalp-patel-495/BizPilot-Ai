from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class ReportMetric(BaseModel):
    key: str
    label: str
    value: str
    change_pct: float
    trend_direction: Literal["UP", "DOWN", "NEUTRAL"]
    subtitle: str


class ReportChartConfig(BaseModel):
    title: str
    primary_label: str
    secondary_label: Optional[str] = None
    chart_type: Literal["area", "bar", "line"] = "area"


class ImportantChange(BaseModel):
    id: str
    title: str
    impact_type: Literal["POSITIVE", "WARNING", "INFO"]
    timestamp: str
    details: str


class BusinessReportResponse(BaseModel):
    report_type: str  # daily, weekly, monthly, sales, lead, customer, revenue
    title: str
    period_label: str
    generated_at: datetime
    key_metrics: List[ReportMetric]
    chart_data: List[Dict[str, Any]]
    chart_config: ReportChartConfig
    trends: List[str]
    important_changes: List[ImportantChange]
    ai_summary: str


class ReportCatalogItem(BaseModel):
    report_type: str
    title: str
    description: str
    cadence: str
    icon: str


class ReportMetadata(BaseModel):
    id: str
    title: str
    report_type: str
    date_range: str
    generated_at: datetime
    record_count: int
    status: str
    file_size: str
    download_url: Optional[str] = None


class ExportReportRequest(BaseModel):
    report_type: str  # daily, weekly, monthly, sales, lead, customer, revenue, or legacy
    date_range: Optional[str] = "this_month"
    format: str = "csv"  # csv, pdf
    filters: Optional[Dict[str, Any]] = None
