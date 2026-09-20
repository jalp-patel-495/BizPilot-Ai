from typing import Any, List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.report import (
    BusinessReportResponse,
    ReportCatalogItem,
    ReportMetadata,
    ExportReportRequest,
)
from app.schemas.common import APIResponse
from app.services.business_report_service import BusinessReportService

router = APIRouter()

# Static library of pre-generated reports for archive view
MOCK_REPORTS = [
    ReportMetadata(
        id="rep-101",
        title="Executive Business Health & Revenue Summary",
        report_type="Executive Summary",
        date_range="This Month",
        generated_at=datetime.now(timezone.utc),
        record_count=1420,
        status="READY",
        file_size="2.4 MB",
        download_url="/api/v1/reports/monthly/export?format=pdf",
    ),
    ReportMetadata(
        id="rep-102",
        title="Sales Velocity & Quota Performance Report",
        report_type="Sales Performance",
        date_range="Last 30 Days",
        generated_at=datetime.now(timezone.utc),
        record_count=384,
        status="READY",
        file_size="1.1 MB",
        download_url="/api/v1/reports/sales/export?format=pdf",
    ),
    ReportMetadata(
        id="rep-103",
        title="Lead Conversion Funnel & Channel Attribution",
        report_type="Lead Analytics",
        date_range="Quarter to Date",
        generated_at=datetime.now(timezone.utc),
        record_count=892,
        status="READY",
        file_size="3.8 MB",
        download_url="/api/v1/reports/lead/export?format=pdf",
    ),
    ReportMetadata(
        id="rep-104",
        title="Customer Cohort Retention & Churn Analysis",
        report_type="Customer Intelligence",
        date_range="Year to Date",
        generated_at=datetime.now(timezone.utc),
        record_count=650,
        status="READY",
        file_size="4.2 MB",
        download_url="/api/v1/reports/customer/export?format=pdf",
    ),
]


@router.get("/catalog", response_model=APIResponse[List[ReportCatalogItem]])
def get_report_catalog(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List the 7 available automated business report modules."""
    service = BusinessReportService(db=db, org_id=current_user.organization_id)
    catalog = service.get_catalog()
    return APIResponse(data=catalog)


@router.get("/data/{report_type}", response_model=APIResponse[BusinessReportResponse])
def get_business_report(
    report_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Generate dynamic business report with metrics, charts, trends, changes, and AI summary."""
    valid_types = {"daily", "weekly", "monthly", "sales", "lead", "customer", "revenue"}
    clean_type = report_type.lower().strip()
    if clean_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid report type '{report_type}'. Must be one of: {', '.join(sorted(valid_types))}",
        )

    service = BusinessReportService(db=db, org_id=current_user.organization_id)
    report = service.generate_report(clean_type)
    return APIResponse(data=report)


@router.get("/{report_type}/export")
def export_business_report(
    report_type: str,
    format: str = Query("pdf", description="Export format: pdf or csv"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Export any of the 7 business reports as a genuine PDF binary or structured CSV."""
    valid_types = {"daily", "weekly", "monthly", "sales", "lead", "customer", "revenue"}
    clean_type = report_type.lower().strip()
    if clean_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid report type '{report_type}'. Must be one of: {', '.join(sorted(valid_types))}",
        )

    clean_format = format.lower().strip()
    if clean_format not in {"pdf", "csv"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Export format must be either 'pdf' or 'csv'",
        )

    service = BusinessReportService(db=db, org_id=current_user.organization_id)
    report = service.generate_report(clean_type)
    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    if clean_format == "pdf":
        pdf_bytes = service.export_pdf(report)
        filename = f"upteky_{clean_type}_report_{timestamp_str}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf",
            },
        )
    else:
        csv_content = service.export_csv(report)
        filename = f"upteky_{clean_type}_report_{timestamp_str}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "text/csv; charset=utf-8",
            },
        )


# Legacy endpoints for backward compatibility
@router.get("", response_model=APIResponse[List[ReportMetadata]])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List available business and executive report library."""
    return APIResponse(data=MOCK_REPORTS)


@router.post("/export", response_model=APIResponse[ReportMetadata], status_code=status.HTTP_201_CREATED)
def trigger_report_export(
    export_req: ExportReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Generate and export on-demand analytics report record."""
    clean_type = export_req.report_type.lower()
    if clean_type in {"daily", "weekly", "monthly", "sales", "lead", "customer", "revenue"}:
        download_url = f"/api/v1/reports/{clean_type}/export?format={export_req.format}"
    else:
        download_url = f"/api/v1/reports/monthly/export?format={export_req.format}"

    new_report = ReportMetadata(
        id=f"rep-{str(uuid.uuid4())[:8]}",
        title=f"{export_req.report_type.replace('_', ' ').title()} ({export_req.date_range.replace('_', ' ').title()})",
        report_type=export_req.report_type.replace('_', ' ').title(),
        date_range=export_req.date_range.replace('_', ' ').title(),
        generated_at=datetime.now(timezone.utc),
        record_count=524,
        status="READY",
        file_size="2.8 MB" if export_req.format == "pdf" else "48 KB",
        download_url=download_url,
    )
    return APIResponse(message="Report compiled successfully", data=new_report)
