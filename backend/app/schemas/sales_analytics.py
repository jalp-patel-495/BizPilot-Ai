from typing import List, Optional
from pydantic import BaseModel, Field


class SalesForecastPoint(BaseModel):
    period: str = Field(..., description="Timeline label (e.g. 'Jan 2026' or 'Oct 2026 (Est.)')")
    actual_sales: Optional[float] = Field(None, description="Actual historical sales volume")
    predicted_sales: float = Field(..., description="ML model regression estimate")
    lower_bound: float = Field(..., description="Lower 95% confidence estimate")
    upper_bound: float = Field(..., description="Upper 95% confidence estimate")
    is_forecast: bool = Field(False, description="True if point is a future ML projection")


class ProductPerformanceItem(BaseModel):
    product_name: str
    revenue: float
    units_sold: int
    revenue_share_pct: float
    growth_pct: float
    trend: str = "up"


class CustomerTrendsResponse(BaseModel):
    new_customers_revenue: float
    repeat_customers_revenue: float
    new_customers_count: int
    repeat_customers_count: int
    repeat_rate_pct: float
    average_order_value: float
    retention_rate_pct: float


class ConversionFunnelStage(BaseModel):
    stage: str
    count: int
    conversion_rate_pct: float
    drop_off_pct: float


class MonthlyGrowthItem(BaseModel):
    month: str
    revenue: float
    growth_pct: float
    target: float


class SalesForecastResponse(BaseModel):
    timeline: List[SalesForecastPoint]
    forecast_horizon_days: int
    current_monthly_run_rate: float
    projected_next_period_sales: float
    projected_growth_percentage: float
    model_r2_score: float
    model_mae: float
    model_type: str
    disclaimer: str
    ai_insights: List[str]


class FullSalesAnalyticsResponse(BaseModel):
    forecast: SalesForecastResponse
    monthly_growth: List[MonthlyGrowthItem]
    products: List[ProductPerformanceItem]
    customer_trends: CustomerTrendsResponse
    conversion_funnel: List[ConversionFunnelStage]
    executive_summary: str
    ai_narrative_insights: List[str]
    disclaimer: str

