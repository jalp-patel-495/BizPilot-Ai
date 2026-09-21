from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class MetricStat(BaseModel):
    label: str
    value: str
    numeric_value: float = 0.0
    change: float = 0.0
    trend: str = "up"  # up, down, neutral
    subtext: str = ""


class RevenueTrend(BaseModel):
    period: str
    revenue: float
    target: float
    forecast: float


class SalesTrend(BaseModel):
    period: str
    sales: float
    deals: int
    target: float


class LeadConversionStage(BaseModel):
    stage: str
    count: int
    rate: float
    dropoff: float = 0.0


class CustomerGrowthPoint(BaseModel):
    period: str
    total_customers: int
    new_customers: int
    churned: int = 0


class ProductPerformanceItem(BaseModel):
    product: str
    units_sold: int
    revenue: float
    category: str = "Software"
    growth: float = 0.0


class BusinessDashboardResponse(BaseModel):
    range_type: str  # today, this_week, this_month, this_year, custom
    date_range_label: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    # The 8 Specified Widgets
    widgets: Dict[str, MetricStat]

    # The 5 Specified Charts
    revenue_trend: List[RevenueTrend]
    sales_trend: List[SalesTrend]
    lead_conversion: List[LeadConversionStage]
    customer_growth: List[CustomerGrowthPoint]
    product_performance: List[ProductPerformanceItem]

    # Strategic AI copilot summaries
    ai_insights: List[str] = []



