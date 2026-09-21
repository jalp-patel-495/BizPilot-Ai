from typing import Any, Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_roles
from app.core.rbac import UserRole
from app.schemas.analytics import BusinessDashboardResponse
from app.schemas.common import APIResponse
from app.schemas.sales_analytics import (
    SalesForecastResponse,
    ProductPerformanceItem,
    CustomerTrendsResponse,
    ConversionFunnelStage,
    FullSalesAnalyticsResponse,
)
from app.models.user import User
from app.services.data_service import data_service
from app.services.sales_forecasting_service import sales_forecasting_service

router = APIRouter()


# ==============================================================================
# Phase 8: AI Sales Analytics & ML Forecasting Endpoints (Admins + Sales Managers)
# ==============================================================================

@router.get("/sales-forecast", response_model=APIResponse[SalesForecastResponse])
def get_sales_forecast(
    horizon_days: int = Query(90, description="Forecast horizon in days: 30, 60, 90, 180"),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Generate scikit-learn machine learning sales forecast with actual vs predicted values,
    growth percentages, 95% confidence intervals, and algorithmic disclaimer.
    """
    forecast = sales_forecasting_service.generate_sales_forecast(
        db=db,
        org_id=current_user.organization_id,
        horizon_days=horizon_days,
    )
    return APIResponse(data=forecast)


@router.get("/product-performance", response_model=APIResponse[List[ProductPerformanceItem]])
def get_product_performance(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Analyze historical product performance, revenue contribution, and volume breakdown."""
    products = sales_forecasting_service.analyze_product_performance(
        db=db,
        org_id=current_user.organization_id,
    )
    return APIResponse(data=products)


@router.get("/customer-trends", response_model=APIResponse[CustomerTrendsResponse])
def get_customer_trends(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Analyze new vs repeat customer volume, repeat rate %, and average order values."""
    trends = sales_forecasting_service.analyze_customer_trends(
        db=db,
        org_id=current_user.organization_id,
    )
    return APIResponse(data=trends)


@router.get("/conversion-analysis", response_model=APIResponse[List[ConversionFunnelStage]])
def get_conversion_analysis(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Analyze sales conversion funnel stages from new inbound leads to closed-won deals."""
    funnel = sales_forecasting_service.analyze_conversion_funnel(
        db=db,
        org_id=current_user.organization_id,
    )
    return APIResponse(data=funnel)


@router.get("/ai-insights", response_model=APIResponse[List[str]])
def get_ai_business_insights(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Synthesize plain-language executive business insights explaining sales trends."""
    full_analytics = sales_forecasting_service.generate_full_sales_analytics(
        db=db,
        org_id=current_user.organization_id,
    )
    return APIResponse(data=full_analytics.ai_narrative_insights)


@router.get("/comprehensive-sales-analytics", response_model=APIResponse[FullSalesAnalyticsResponse])
def get_comprehensive_sales_analytics(
    horizon_days: int = Query(90, description="Forecast horizon in days: 30, 60, 90, 180"),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Consolidated endpoint returning ML sales forecasting, product performance,
    customer trends, conversion funnel, and plain-language AI insights.
    """
    data = sales_forecasting_service.generate_full_sales_analytics(
        db=db,
        org_id=current_user.organization_id,
        horizon_days=horizon_days,
    )
    return APIResponse(data=data)


# ==============================================================================
# Phase 3 & Foundational Dashboard Endpoints (Role-Protected)
# ==============================================================================

@router.get("/business-dashboard", response_model=APIResponse[BusinessDashboardResponse])
async def get_business_dashboard(
    range_type: str = Query("this_month", description="today, this_week, this_month, this_year, custom"),
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD for custom range"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD for custom range"),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve Business Management Dashboard metrics.
    Includes the 8 core widgets, 5 Recharts data streams, and dynamic date filtering.
    Restricted to Super Admin and Business Admin.
    """
    data = data_service.get_business_dashboard(
        range_type=range_type,
        start_date=start_date,
        end_date=end_date,
        db=db,
        org_id=current_user.organization_id,
    )
    return APIResponse(data=data)


@router.get("/sales-manager-dashboard", response_model=APIResponse[dict])
def get_sales_manager_dashboard(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve comprehensive sales pipeline, team performance, and lead KPIs."""
    data = data_service.get_sales_manager_dashboard(
        db=db,
        org_id=current_user.organization_id,
    )
    return APIResponse(data=data)


@router.get("/employee-dashboard", response_model=APIResponse[dict])
def get_employee_dashboard(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER, UserRole.EMPLOYEE])),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve personal operational workspace data for the authenticated employee."""
    data = data_service.get_employee_dashboard(
        db=db,
        org_id=current_user.organization_id,
        user_id=current_user.id,
    )
    return APIResponse(data=data)
