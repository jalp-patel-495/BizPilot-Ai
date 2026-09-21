import io
import csv
import json
import logging
from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.api.deps import get_db, get_current_user, require_roles
from app.core.rbac import UserRole
from app.models.user import User
from app.models.invoice import Invoice
from app.schemas.common import APIResponse
from app.schemas.invoice import (
    InvoiceResponse,
    InvoiceUpdate,
    InvoiceItem,
    InvoiceStatsResponse,
)
from app.services.document_processor import document_processor

logger = logging.getLogger("upteky.invoices_api")

router = APIRouter()


def _format_invoice_response(inv: Invoice) -> InvoiceResponse:
    """Helper to convert database Invoice model into Pydantic InvoiceResponse with parsed items."""
    items: List[InvoiceItem] = []
    if inv.items_json:
        try:
            raw_items = json.loads(inv.items_json)
            if isinstance(raw_items, list):
                items = [InvoiceItem(**it) for it in raw_items]
        except Exception as e:
            logger.warning(f"Error parsing items_json for invoice {inv.id}: {e}")

    return InvoiceResponse(
        id=inv.id,
        organization_id=inv.organization_id,
        invoice_number=inv.invoice_number,
        company_name=inv.company_name or inv.vendor_name or "",
        customer_name=inv.customer_name or "",
        invoice_date=inv.invoice_date or inv.created_at,
        due_date=inv.due_date,
        gst_number=inv.gst_number or "",
        subtotal=inv.subtotal or 0.0,
        tax_amount=inv.tax_amount or 0.0,
        total_amount=inv.total_amount or 0.0,
        currency=inv.currency or "INR",
        items=items,
        status=inv.status,
        ocr_confidence=inv.ocr_confidence or 98.5,
        file_path=inv.file_path,
        file_format=inv.file_format or "PDF",
        original_filename=inv.original_filename or f"invoice_{inv.invoice_number}.pdf",
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )


# ==============================================================================
# 1. Upload & OCR Extraction Endpoint
# ==============================================================================

@router.post("/upload", response_model=APIResponse[InvoiceResponse])
async def upload_and_process_invoice(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Upload an invoice or business document in PDF, JPG, or PNG format.
    Runs automated OCR extraction, generates structured fields, and saves record to PostgreSQL.
    """
    # 1. Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    # 2. Validate format and save to disk
    try:
        file_path, file_format, saved_name = document_processor.save_uploaded_file(
            file_bytes, file.filename or "invoice.pdf"
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )

    # 3. Perform OCR and structured information extraction
    try:
        extracted = document_processor.parse_invoice_document(
            file_path=file_path,
            file_format=file_format,
            original_filename=file.filename or saved_name,
        )
    except Exception as ocr_err:
        logger.error(f"OCR extraction error: {ocr_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR engine encountered an error while parsing document: {str(ocr_err)}",
        )

    # 4. Save Extracted Invoice in PostgreSQL
    new_invoice = Invoice(
        organization_id=current_user.organization_id,
        invoice_number=extracted["invoice_number"],
        company_name=extracted["company_name"],
        vendor_name=extracted["company_name"],
        customer_name=extracted["customer_name"],
        invoice_date=extracted["invoice_date"],
        due_date=extracted["due_date"],
        gst_number=extracted["gst_number"],
        subtotal=extracted["subtotal"],
        tax_amount=extracted["tax_amount"],
        total_amount=extracted["total_amount"],
        currency=extracted["currency"],
        items_json=json.dumps(extracted["items"]),
        extracted_data=json.dumps(extracted, default=str),
        status="EXTRACTED",
        ocr_confidence=extracted["ocr_confidence"],
        file_path=file_path,
        file_format=file_format,
        original_filename=file.filename or saved_name,
        created_at=datetime.now(timezone.utc),
    )

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    logger.info(
        f"Uploaded & extracted invoice {new_invoice.invoice_number} ({new_invoice.company_name}) "
        f"with confidence {new_invoice.ocr_confidence}%"
    )

    return APIResponse(
        data=_format_invoice_response(new_invoice),
        message="Invoice uploaded and OCR fields extracted successfully.",
    )


# ==============================================================================
# 2. Invoices List with Search & Filtering
# ==============================================================================

@router.get("", response_model=APIResponse[List[InvoiceResponse]])
def list_invoices(
    search: Optional[str] = Query(None, description="Search by invoice number, company, customer, or GST"),
    status: Optional[str] = Query(None, description="Filter by status: EXTRACTED, VERIFIED, REJECTED, PAID"),
    date_from: Optional[datetime] = Query(None, description="Filter invoices created after date"),
    date_to: Optional[datetime] = Query(None, description="Filter invoices created before date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve filtered list of invoices for the current organization."""
    query = db.query(Invoice).filter(Invoice.organization_id == current_user.organization_id)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Invoice.invoice_number.ilike(pattern),
                Invoice.company_name.ilike(pattern),
                Invoice.vendor_name.ilike(pattern),
                Invoice.customer_name.ilike(pattern),
                Invoice.gst_number.ilike(pattern),
            )
        )

    if status and status.upper() != "ALL":
        query = query.filter(Invoice.status == status.upper())

    if date_from:
        query = query.filter(Invoice.invoice_date >= date_from)
    if date_to:
        query = query.filter(Invoice.invoice_date <= date_to)

    invoices = query.order_by(desc(Invoice.created_at)).offset(skip).limit(limit).all()
    data = [_format_invoice_response(inv) for inv in invoices]
    return APIResponse(data=data)


# ==============================================================================
# 3. Aggregated Invoice Dashboard Stats
# ==============================================================================

@router.get("/stats", response_model=APIResponse[InvoiceStatsResponse])
def get_invoice_stats(
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Get aggregated metrics and OCR accuracy statistics."""
    invoices = db.query(Invoice).filter(Invoice.organization_id == current_user.organization_id).all()

    total_invoices = len(invoices)
    total_amount = sum(inv.total_amount or 0.0 for inv in invoices)
    verified_count = sum(1 for inv in invoices if inv.status in ("VERIFIED", "PAID"))
    pending_count = sum(1 for inv in invoices if inv.status == "EXTRACTED")
    avg_confidence = (
        round(sum(inv.ocr_confidence or 0.0 for inv in invoices) / total_invoices, 1)
        if total_invoices > 0
        else 0.0
    )
    verification_rate = (
        round((verified_count / total_invoices) * 100.0, 1) if total_invoices > 0 else 0.0
    )

    stats = InvoiceStatsResponse(
        total_invoices=total_invoices,
        total_amount_processed=round(total_amount, 2),
        verified_count=verified_count,
        pending_count=pending_count,
        average_confidence=avg_confidence,
        verification_rate=verification_rate,
    )
    return APIResponse(data=stats)


# ==============================================================================
# 4. Get Invoice by ID
# ==============================================================================

@router.get("/{invoice_id}", response_model=APIResponse[InvoiceResponse])
def get_invoice(
    invoice_id: str,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve full structured invoice details by ID."""
    inv = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == current_user.organization_id)
        .first()
    )
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )
    return APIResponse(data=_format_invoice_response(inv))


# ==============================================================================
# 5. Edit Extracted Invoice Values
# ==============================================================================

@router.put("/{invoice_id}", response_model=APIResponse[InvoiceResponse])
def update_invoice(
    invoice_id: str,
    payload: InvoiceUpdate,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Edit any incorrect OCR values on an existing invoice record."""
    inv = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == current_user.organization_id)
        .first()
    )
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )

    if payload.invoice_number is not None:
        inv.invoice_number = payload.invoice_number
    if payload.company_name is not None:
        inv.company_name = payload.company_name
        inv.vendor_name = payload.company_name
    if payload.customer_name is not None:
        inv.customer_name = payload.customer_name
    if payload.invoice_date is not None:
        inv.invoice_date = payload.invoice_date
    if payload.due_date is not None:
        inv.due_date = payload.due_date
    if payload.gst_number is not None:
        inv.gst_number = payload.gst_number
    if payload.subtotal is not None:
        inv.subtotal = payload.subtotal
    if payload.tax_amount is not None:
        inv.tax_amount = payload.tax_amount
    if payload.total_amount is not None:
        inv.total_amount = payload.total_amount
    if payload.currency is not None:
        inv.currency = payload.currency
    if payload.status is not None:
        inv.status = payload.status
    if payload.items is not None:
        inv.items_json = json.dumps([it.model_dump() for it in payload.items])

    inv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(inv)

    return APIResponse(
        data=_format_invoice_response(inv),
        message="Invoice updated successfully.",
    )


# ==============================================================================
# 6. Verify and Save Invoice to PostgreSQL
# ==============================================================================

@router.put("/{invoice_id}/verify", response_model=APIResponse[InvoiceResponse])
def verify_invoice(
    invoice_id: str,
    payload: Optional[InvoiceUpdate] = None,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Save verified invoice data to PostgreSQL and transition status to VERIFIED.
    Applies any edits submitted alongside the verification action.
    """
    inv = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == current_user.organization_id)
        .first()
    )
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )

    # Apply optional corrections
    if payload:
        if payload.invoice_number is not None:
            inv.invoice_number = payload.invoice_number
        if payload.company_name is not None:
            inv.company_name = payload.company_name
            inv.vendor_name = payload.company_name
        if payload.customer_name is not None:
            inv.customer_name = payload.customer_name
        if payload.invoice_date is not None:
            inv.invoice_date = payload.invoice_date
        if payload.due_date is not None:
            inv.due_date = payload.due_date
        if payload.gst_number is not None:
            inv.gst_number = payload.gst_number
        if payload.subtotal is not None:
            inv.subtotal = payload.subtotal
        if payload.tax_amount is not None:
            inv.tax_amount = payload.tax_amount
        if payload.total_amount is not None:
            inv.total_amount = payload.total_amount
        if payload.items is not None:
            inv.items_json = json.dumps([it.model_dump() for it in payload.items])

    inv.status = "VERIFIED"
    inv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(inv)

    return APIResponse(
        data=_format_invoice_response(inv),
        message="Invoice verified and committed to PostgreSQL database.",
    )


# ==============================================================================
# 7. Delete Invoice
# ==============================================================================

@router.delete("/{invoice_id}", response_model=APIResponse[dict])
def delete_invoice(
    invoice_id: str,
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN])),
    db: Session = Depends(get_db),
) -> Any:
    """Delete an invoice record."""
    inv = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == current_user.organization_id)
        .first()
    )
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )

    db.delete(inv)
    db.commit()

    return APIResponse(
        data={"id": invoice_id, "deleted": True},
        message="Invoice deleted successfully.",
    )


# ==============================================================================
# 8. Download Structured Invoice Record (JSON / CSV)
# ==============================================================================

@router.get("/{invoice_id}/download")
def download_invoice(
    invoice_id: str,
    export_format: str = Query("json", description="Export format: json or csv"),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN, UserRole.SALES_MANAGER])),
    db: Session = Depends(get_db),
) -> Any:
    """Download invoice record in structured JSON or CSV format."""
    inv = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == current_user.organization_id)
        .first()
    )
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )

    formatted = _format_invoice_response(inv)

    if export_format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Invoice Number", formatted.invoice_number])
        writer.writerow(["Company Name", formatted.company_name])
        writer.writerow(["Customer Name", formatted.customer_name])
        writer.writerow(["Invoice Date", formatted.invoice_date.strftime("%Y-%m-%d") if formatted.invoice_date else ""])
        writer.writerow(["GST Number", formatted.gst_number])
        writer.writerow(["Subtotal", f"{formatted.subtotal:.2f}"])
        writer.writerow(["Tax Amount", f"{formatted.tax_amount:.2f}"])
        writer.writerow(["Total Amount", f"{formatted.total_amount:.2f}"])
        writer.writerow(["Status", formatted.status])
        writer.writerow([])
        writer.writerow(["Item Description", "Quantity", "Unit Price", "Amount"])
        for item in formatted.items:
            writer.writerow([item.description, item.quantity, item.unit_price, item.amount])

        output.seek(0)
        filename = f"{formatted.invoice_number}.csv"
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    else:
        # JSON format
        filename = f"{formatted.invoice_number}.json"
        json_content = json.dumps(formatted.model_dump(), default=str, indent=2)
        return Response(
            content=json_content,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

