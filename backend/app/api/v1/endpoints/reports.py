from typing import Any, List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.core.rbac import UserRole
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

REPORT_ROLES = [UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER]


@router.get("/catalog", response_model=APIResponse[List[ReportCatalogItem]])
def get_report_catalog(
    current_user: User = Depends(require_roles(REPORT_ROLES)),
    db: Session = Depends(get_db),
) -> Any:
    """List the 7 available automated business report modules."""
    service = BusinessReportService(db=db, org_id=current_user.organization_id)
    catalog = service.get_catalog()
    return APIResponse(data=catalog)


@router.get("/data/{report_type}", response_model=APIResponse[BusinessReportResponse])
def get_business_report(
    report_type: str,
    current_user: User = Depends(require_roles(REPORT_ROLES)),
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
    current_user: User = Depends(require_roles(REPORT_ROLES)),
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


@router.get("", response_model=APIResponse[List[ReportMetadata]])
def list_reports(
    current_user: User = Depends(require_roles(REPORT_ROLES)),
    db: Session = Depends(get_db),
) -> Any:
    """List available business and executive report library dynamically computed from database."""
    service = BusinessReportService(db=db, org_id=current_user.organization_id)
    catalog = service.get_catalog()

    result: List[ReportMetadata] = []
    for item in catalog:
        try:
            rep = service.generate_report(item.report_type)
            rec_count = len(rep.chart_data) + len(rep.key_metrics)
            result.append(
                ReportMetadata(
                    id=f"rep-{item.report_type}",
                    title=item.title,
                    report_type=item.report_type.capitalize(),
                    date_range=item.cadence,
                    generated_at=rep.generated_at,
                    record_count=rec_count,
                    status="READY",
                    file_size="Dynamic",
                    download_url=f"/api/v1/reports/{item.report_type}/export?format=pdf",
                )
            )
        except Exception as e:
            logger.warning("Could not generate metadata for report %s: %s", item.report_type, e)

    return APIResponse(data=result)


@router.post("/export", response_model=APIResponse[ReportMetadata], status_code=status.HTTP_201_CREATED)
def trigger_report_export(
    export_req: ExportReportRequest,
    current_user: User = Depends(require_roles(REPORT_ROLES)),
    db: Session = Depends(get_db),
) -> Any:
    """Generate and export on-demand analytics report record with genuine calculated metadata."""
    clean_type = export_req.report_type.lower().strip()
    valid_types = {"daily", "weekly", "monthly", "sales", "lead", "customer", "revenue"}
    if clean_type not in valid_types:
        clean_type = "monthly"

    service = BusinessReportService(db=db, org_id=current_user.organization_id)
    report = service.generate_report(clean_type)

    if export_req.format.lower() == "pdf":
        raw_bytes = service.export_pdf(report)
        size_bytes = len(raw_bytes)
    else:
        raw_csv = service.export_csv(report)
        size_bytes = len(raw_csv.encode("utf-8"))

    if size_bytes >= 1024 * 1024:
        file_size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        file_size_str = f"{max(1, size_bytes // 1024)} KB"

    record_count = len(report.chart_data) + len(report.key_metrics) + len(report.important_changes)
    download_url = f"/api/v1/reports/{clean_type}/export?format={export_req.format.lower()}"

    new_report = ReportMetadata(
        id=f"rep-{str(uuid.uuid4())[:8]}",
        title=f"{report.title} ({export_req.date_range.replace('_', ' ').title()})",
        report_type=clean_type.capitalize(),
        date_range=export_req.date_range.replace('_', ' ').title(),
        generated_at=datetime.now(timezone.utc),
        record_count=record_count,
        status="READY",
        file_size=file_size_str,
        download_url=download_url,
    )
    return APIResponse(message="Report compiled successfully", data=new_report)
