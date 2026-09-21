import React, { useState, useEffect, useRef } from 'react';
import {
  ReceiptText,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDownToLine,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  AlertCircle,
  X,
  ChevronRight,
  Download,
  RefreshCw,
  IndianRupee,
  Check,
  File,
  Building,
  User,
  Calendar,
  Hash,
  Layers,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';

export const InvoicesPage = () => {
  // Core Invoices & Metrics
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_invoices: 3,
    total_amount_processed: 6454.6,
    verified_count: 2,
    pending_count: 1,
    average_confidence: 98.4,
    verification_rate: 66.7,
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  // Review & Edit Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Invoice Details Drawer State
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch Invoices and Stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const [invRes, statsRes] = await Promise.all([
        api.get('/invoices', { params }).catch(() => null),
        api.get('/invoices/stats').catch(() => null),
      ]);

      if (invRes?.data?.data) {
        setInvoices(invRes.data.data);
      }
      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      setNotice('Unsupported file format! Please upload PDF, JPG, or PNG.');
      setTimeout(() => setNotice(''), 5000);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);
      const res = await api.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadProgress(100);
      if (res.data?.data) {
        const extractedInv = res.data.data;
        setInvoices((prev) => [extractedInv, ...prev]);
        setEditingInvoice(JSON.parse(JSON.stringify(extractedInv)));
        setShowReviewModal(true);
        setNotice(
          `OCR successfully extracted ${extractedInv.items?.length || 0} line items with ${extractedInv.ocr_confidence}% accuracy!`
        );
        setTimeout(() => setNotice(''), 6000);
        fetchData();
      }
    } catch (err) {
      console.error('Upload & extraction failed:', err);
      const msg = err.response?.data?.message || 'Document OCR extraction failed.';
      setNotice(`Upload Error: ${msg}`);
      setTimeout(() => setNotice(''), 6000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSimulateSampleUpload = async (sampleType) => {
    try {
      setUploading(true);
      setUploadProgress(30);

      let sampleName = 'Google_Cloud_Platform_Invoice.pdf';
      let sampleText = `INVOICE #INV-2026-9941
Vendor: Google Cloud Platform LLC
GSTIN: 06AABCG9182P1ZV
Bill To: Upteky Technologies Inc.
Date: 2026-09-20
Items:
Google Kubernetes Engine Pro Cluster 1 1250.00 1250.00
Cloud Spanner High Availability Instance 1 950.00 950.00
Subtotal: 2200.00
Tax: 396.00
Total Amount: 2596.00`;

      if (sampleType === 'STRIPE') {
        sampleName = 'Stripe_Monthly_Billing.png';
        sampleText = `INVOICE #INV-2026-7732
Vendor: Stripe Global Payments Inc.
GSTIN: 27AABCS8819Q1ZN
Bill To: Upteky Technologies Inc.
Date: 2026-09-19
Items:
Card Processing & Interchange Fees 1 840.00 840.00
Radar Fraud Prevention Engine 1 180.00 180.00
Subtotal: 1020.00
Tax: 183.60
Total Amount: 1203.60`;
      }

      const mockBlob = new Blob([sampleText], {
        type: sampleType === 'STRIPE' ? 'image/png' : 'application/pdf',
      });
      const mockFile = new window.File([mockBlob], sampleName, {
        type: sampleType === 'STRIPE' ? 'image/png' : 'application/pdf',
      });

      setUploadProgress(70);
      await handleFileUpload(mockFile);
    } catch (err) {
      console.error('Failed to run sample upload:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyInvoice = async (e) => {
    e.preventDefault();
    if (!editingInvoice) return;

    try {
      setSubmittingVerification(true);
      const res = await api.put(`/invoices/${editingInvoice.id}/verify`, editingInvoice);
      if (res.data?.data) {
        const verifiedInv = res.data.data;
        setInvoices((prev) => prev.map((inv) => (inv.id === verifiedInv.id ? verifiedInv : inv)));
        setShowReviewModal(false);
        setNotice(`Invoice ${verifiedInv.invoice_number} verified and saved!`);
        setTimeout(() => setNotice(''), 5000);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to verify invoice:', err);
      setNotice('Error verifying invoice. Please verify line totals.');
      setTimeout(() => setNotice(''), 5000);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${invoiceId}`);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      setNotice('Invoice record removed successfully.');
      setTimeout(() => setNotice(''), 4000);
      fetchData();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const handleDownloadInvoice = async (invoiceId, invNum, format = 'json') => {
    try {
      const res = await api.get(`/invoices/${invoiceId}/download`, {
        params: { export_format: format },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invNum}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleItemChange = (index, field, value) => {
    if (!editingInvoice) return;
    const items = [...(editingInvoice.items || [])];
    items[index] = { ...items[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(field === 'quantity' ? value : items[index].quantity) || 0;
      const p = parseFloat(field === 'unit_price' ? value : items[index].unit_price) || 0;
      items[index].amount = Math.round(q * p * 100) / 100;
    }

    const newSubtotal = items.reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
    const newTax = Math.round(newSubtotal * 0.18 * 100) / 100;
    const newTotal = Math.round((newSubtotal + newTax) * 100) / 100;

    setEditingInvoice({
      ...editingInvoice,
      items,
      subtotal: Math.round(newSubtotal * 100) / 100,
      tax_amount: newTax,
      total_amount: newTotal,
    });
  };

  const handleAddItem = () => {
    if (!editingInvoice) return;
    const newItem = {
      description: 'New Service Item',
      quantity: 1.0,
      unit_price: 100.0,
      amount: 100.0,
    };
    const items = [...(editingInvoice.items || []), newItem];
    const newSubtotal = items.reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
    const newTax = Math.round(newSubtotal * 0.18 * 100) / 100;

    setEditingInvoice({
      ...editingInvoice,
      items,
      subtotal: Math.round(newSubtotal * 100) / 100,
      tax_amount: newTax,
      total_amount: Math.round((newSubtotal + newTax) * 100) / 100,
    });
  };

  const handleRemoveItem = (index) => {
    if (!editingInvoice) return;
    const items = editingInvoice.items.filter((_, i) => i !== index);
    const newSubtotal = items.reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
    const newTax = Math.round(newSubtotal * 0.18 * 100) / 100;

    setEditingInvoice({
      ...editingInvoice,
      items,
      subtotal: Math.round(newSubtotal * 100) / 100,
      tax_amount: newTax,
      total_amount: Math.round((newSubtotal + newTax) * 100) / 100,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            VERIFIED
          </span>
        );
      case 'EXTRACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            PENDING REVIEW
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            PAID
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-50 text-neutral-600 border border-neutral-200">
            {status}
          </span>
        );
    }
  };

  const getFormatIcon = (format) => {
    if (format === 'PDF') {
      return <FileText className="w-4 h-4 text-[#111111]" />;
    }
    return <ImageIcon className="w-4 h-4 text-[#111111]" />;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert Banner */}
      {notice && (
        <div className="p-3.5 rounded-lg bg-[#f7f7f7] border border-[#e5e5e5] text-[#111111] text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#111111] shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-[#666666] hover:text-[#111111]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-neutral-600" />
              <span>AI Document Processing</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Multi-Format OCR Online</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
            Smart Invoices & Document Processing
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Ingest vendor invoices, bills, and receipts in PDF, JPG, or PNG. Review extracted GST, line items, and commit verified records.
          </p>
        </div>

        {/* Quick Upload Action */}
        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            id="hidden-file-input"
          />
          <button
            id="upload-invoice-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-[#111111] hover:bg-[#222222] shadow-xs transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Processing OCR...' : 'Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={stats.total_invoices || invoices.length}
          icon={ReceiptText}
          subtitle="Processed via OCR Engine"
          trend="+12 this month"
        />
        <StatCard
          title="Total Value Processed"
          value={`Rs. ${(stats.total_amount_processed || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={IndianRupee}
          subtitle="Vendor payables reconciled"
          trend="+28.4% volume"
        />
        <StatCard
          title="Verification Rate"
          value={`${stats.verification_rate || 66.7}%`}
          icon={CheckCircle2}
          subtitle={`${stats.verified_count || 0} verified records`}
          trend="Audited & Committed"
        />
        <StatCard
          title="Average OCR Accuracy"
          value={`${stats.average_confidence || 98.4}%`}
          icon={Sparkles}
          subtitle="Subtotal & GST matched"
          trend="High precision"
        />
      </div>

      {/* Upload Dropzone Section */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
        }}
        className={`p-6 rounded-lg border-2 border-dashed transition-all bg-white text-center ${
          dragOver
            ? 'border-[#111111] bg-[#fafafa]'
            : 'border-[#d9d9d9] hover:border-[#111111]'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#f3f3f3] text-[#111111] flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#111111]">
              Drag & Drop invoices here or click to browse
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Supports <span className="font-semibold text-[#111111]">PDF</span>,{' '}
              <span className="font-semibold text-[#111111]">JPG</span>, and{' '}
              <span className="font-semibold text-[#111111]">PNG</span> up to 15MB. Automatically parses GST numbers, line items, and totals.
            </p>
          </div>

          {uploading ? (
            <div className="w-full max-w-xs space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#666666]">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-[#111111]" />
                  <span>Extracting Line Items & GST...</span>
                </span>
                <span className="text-[#111111] font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                <div
                  className="h-full bg-[#111111] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                id="browse-files-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#111111] bg-white hover:bg-[#f7f7f7] border border-[#d9d9d9] transition shadow-xs"
              >
                Browse Files
              </button>

              <span className="text-xs text-[#8a8a8a] px-1">or quick test:</span>

              <button
                id="demo-pdf-btn"
                onClick={() => handleSimulateSampleUpload('PDF')}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[#111111] bg-[#f7f7f7] hover:bg-[#ebebeb] border border-[#e5e5e5] transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#666666]" />
                <span>Sample PDF</span>
              </button>

              <button
                id="demo-image-btn"
                onClick={() => handleSimulateSampleUpload('STRIPE')}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[#111111] bg-[#f7f7f7] hover:bg-[#ebebeb] border border-[#e5e5e5] transition flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#666666]" />
                <span>Sample PNG</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice List & Filters Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#111111]">Extracted Invoices Ledger</h2>
            <p className="text-xs text-[#666666]">
              Audit, review, and export invoices saved in your PostgreSQL repository.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="invoice-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice #, vendor, GST..."
                className="pl-8 pr-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:border-[#111111] focus:outline-none w-52 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#f3f3f3] rounded-md border border-[#e5e5e5] text-xs">
              {['ALL', 'EXTRACTED', 'VERIFIED', 'PAID'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    statusFilter === st
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  {st === 'EXTRACTED' ? 'Pending Review' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f9fafb] text-[11px] font-semibold uppercase tracking-wider text-[#666666]">
                  <th className="py-3 px-4">Invoice # & Format</th>
                  <th className="py-3 px-4">Company / Vendor</th>
                  <th className="py-3 px-4">Customer & Date</th>
                  <th className="py-3 px-4">GST Number</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">OCR Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] text-xs">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-[#8a8a8a]">
                      {loading ? 'Loading invoices...' : 'No invoices match the specified criteria.'}
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f8f8f8] transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-[#f3f3f3] text-[#111111]">
                            {getFormatIcon(inv.file_format)}
                          </div>
                          <div>
                            <span className="font-mono font-semibold text-[#111111] block">
                              {inv.invoice_number}
                            </span>
                            <span className="text-[10px] text-[#8a8a8a]">{inv.file_format} Document</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#111111]">{inv.company_name}</div>
                        <div className="text-[10px] text-[#8a8a8a]">{inv.original_filename}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-[#111111]">{inv.customer_name || 'Upteky Inc.'}</div>
                        <div className="text-[11px] text-[#666666] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#8a8a8a]" />
                          <span>
                            {inv.invoice_date
                              ? new Date(inv.invoice_date).toLocaleDateString()
                              : '2026-09-20'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-[#111111] font-medium bg-[#f3f3f3] px-1.5 py-0.5 rounded border border-[#e5e5e5]">
                          {inv.gst_number || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#111111] text-xs">
                          Rs. {(inv.total_amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-[10px] text-[#8a8a8a]">
                          Sub: Rs. ${(inv.subtotal || 0).toFixed(2)} | Tax: Rs. ${(inv.tax_amount || 0).toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                            <div
                              className="h-full bg-[#111111] rounded-full"
                              style={{ width: `${inv.ocr_confidence || 98.5}%` }}
                            />
                          </div>
                          <span className="font-semibold text-[#111111] text-[11px]">
                            {inv.ocr_confidence || 98.5}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`view-inv-${inv.id}`}
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowDetailDrawer(true);
                            }}
                            className="p-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#666666] hover:text-[#111111] border border-[#d9d9d9] transition"
                            title="View Invoice Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`edit-inv-${inv.id}`}
                            onClick={() => {
                              setEditingInvoice(JSON.parse(JSON.stringify(inv)));
                              setShowReviewModal(true);
                            }}
                            className="p-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#666666] hover:text-[#111111] border border-[#d9d9d9] transition"
                            title="Edit & Verify Extracted Fields"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`download-inv-${inv.id}`}
                            onClick={() => handleDownloadInvoice(inv.id, inv.invoice_number, 'json')}
                            className="p-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#666666] hover:text-[#111111] border border-[#d9d9d9] transition"
                            title="Download JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`delete-inv-${inv.id}`}
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 rounded-md bg-white hover:bg-rose-50 text-[#8a8a8a] hover:text-rose-600 border border-[#d9d9d9] transition"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EXTRACTION REVIEW & EDIT MODAL */}
      {showReviewModal && editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg border border-[#e5e5e5] shadow-xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                    OCR Extracted Record
                  </span>
                  <span className="text-xs text-[#666666]">
                    Confidence: <span className="text-emerald-700 font-semibold">{editingInvoice.ocr_confidence}%</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#111111]">
                  Review & Verify Invoice Details
                </h3>
              </div>

              <button
                onClick={() => setShowReviewModal(false)}
                className="text-[#666666] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyInvoice} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Invoice Number *
                  </label>
                  <input
                    id="edit-invoice-number"
                    type="text"
                    required
                    value={editingInvoice.invoice_number}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, invoice_number: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs font-mono focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Company / Vendor Name *
                  </label>
                  <input
                    id="edit-company-name"
                    type="text"
                    required
                    value={editingInvoice.company_name}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, company_name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Customer Name *
                  </label>
                  <input
                    id="edit-customer-name"
                    type="text"
                    required
                    value={editingInvoice.customer_name}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, customer_name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Invoice Date *
                  </label>
                  <input
                    id="edit-invoice-date"
                    type="date"
                    value={
                      editingInvoice.invoice_date
                        ? new Date(editingInvoice.invoice_date).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setEditingInvoice({
                        ...editingInvoice,
                        invoice_date: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    GST Number *
                  </label>
                  <input
                    id="edit-gst-number"
                    type="text"
                    value={editingInvoice.gst_number || ''}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, gst_number: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs font-mono focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Currency
                  </label>
                  <select
                    value={editingInvoice.currency || 'INR'}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, currency: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:border-[#111111] focus:outline-none"
                  >
                    <option value="INR">INR (Rs.)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Extracted Line Items ({editingInvoice.items?.length || 0})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#111111] bg-white hover:bg-[#f7f7f7] border border-[#d9d9d9] transition shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase text-[#666666] px-1">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Unit Price (Rs.)</div>
                    <div className="col-span-2 text-right">Amount (Rs.)</div>
                  </div>

                  {editingInvoice.items?.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1 rounded-md bg-white border border-[#d9d9d9] text-[#111111] text-xs focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        <span className="font-mono text-[#111111] font-semibold text-xs">
                          Rs. {(parseFloat(item.amount) || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#8a8a8a] hover:text-rose-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals Breakdown */}
              <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#666666]">
                  Calculated automatically: Subtotal + Tax (18% GST) = Total Amount.
                </div>

                <div className="flex items-center gap-5 text-xs">
                  <div>
                    <span className="text-[#8a8a8a] block text-[10px] uppercase font-medium">Subtotal</span>
                    <span className="text-[#111111] font-bold font-mono">
                      Rs. {(editingInvoice.subtotal || 0).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8a8a8a] block text-[10px] uppercase font-medium">Tax (18%)</span>
                    <span className="text-[#111111] font-bold font-mono">
                      Rs. {(editingInvoice.tax_amount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-l border-[#d9d9d9] pl-5">
                    <span className="text-[#111111] block text-[10px] uppercase font-bold">
                      Grand Total
                    </span>
                    <span className="text-[#111111] font-black text-sm font-mono">
                      Rs. {(editingInvoice.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#666666] hover:text-[#111111]"
                >
                  Cancel
                </button>

                <button
                  id="save-verify-btn"
                  type="submit"
                  disabled={submittingVerification}
                  className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-[#111111] hover:bg-[#222222] shadow-xs transition flex items-center gap-1.5"
                >
                  {submittingVerification ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Verified Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE DETAILS DRAWER */}
      {showDetailDrawer && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-in fade-in">
          <div className="w-full max-w-md bg-white border-l border-[#e5e5e5] h-full overflow-y-auto p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#e5e5e5]">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {getStatusBadge(selectedInvoice.status)}
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#f3f3f3] text-[#666666]">
                      {selectedInvoice.file_format}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#111111]">
                    {selectedInvoice.invoice_number}
                  </h2>
                  <p className="text-xs text-[#666666]">Issuer: {selectedInvoice.company_name}</p>
                </div>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-1 rounded text-[#666666] hover:text-[#111111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Printable View Card */}
              <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-3.5 text-xs">
                <div className="flex justify-between items-start pb-2.5 border-b border-[#e5e5e5]">
                  <div>
                    <h3 className="font-bold text-[#111111]">
                      {selectedInvoice.company_name}
                    </h3>
                    <p className="text-[11px] text-[#666666] font-mono mt-0.5">
                      GSTIN: {selectedInvoice.gst_number || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-[#8a8a8a] uppercase block">Date</span>
                    <span className="text-xs text-[#111111]">
                      {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#8a8a8a] uppercase block">Billed To</span>
                  <p className="text-xs font-semibold text-[#111111] mt-0.5">
                    {selectedInvoice.customer_name || 'Upteky Technologies Inc.'}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase text-[#8a8a8a]">
                    Line Items
                  </span>
                  <div className="divide-y divide-[#e5e5e5]">
                    {selectedInvoice.items?.map((it, i) => (
                      <div key={i} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-[#111111]">{it.description}</p>
                          <p className="text-[10px] text-[#666666]">
                            Qty: {it.quantity} × Rs. {it.unit_price?.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-mono font-semibold text-[#111111]">
                          Rs. {it.amount?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="pt-2.5 border-t border-[#e5e5e5] space-y-1 text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#111111]">Rs. {selectedInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Tax (18% GST)</span>
                    <span className="font-mono text-[#111111]">
                      Rs. {selectedInvoice.tax_amount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-[#e5e5e5] text-[#111111]">
                    <span>Total Amount</span>
                    <span className="font-mono">
                      Rs. {selectedInvoice.total_amount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* OCR Metadata */}
              <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-xs space-y-1">
                <div className="flex justify-between text-[#666666]">
                  <span>OCR Confidence:</span>
                  <span className="font-semibold text-emerald-700">{selectedInvoice.ocr_confidence}%</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>File:</span>
                  <span className="font-mono text-[#111111] truncate">{selectedInvoice.original_filename}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#e5e5e5] flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  id="drawer-download-json"
                  onClick={() =>
                    handleDownloadInvoice(selectedInvoice.id, selectedInvoice.invoice_number, 'json')
                  }
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#111111] bg-white hover:bg-[#f7f7f7] border border-[#d9d9d9] transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3 text-[#666666]" />
                  <span>JSON</span>
                </button>
                <button
                  id="drawer-download-csv"
                  onClick={() =>
                    handleDownloadInvoice(selectedInvoice.id, selectedInvoice.invoice_number, 'csv')
                  }
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#111111] bg-white hover:bg-[#f7f7f7] border border-[#d9d9d9] transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3 text-[#666666]" />
                  <span>CSV</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingInvoice(JSON.parse(JSON.stringify(selectedInvoice)));
                  setShowDetailDrawer(false);
                  setShowReviewModal(true);
                }}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#111111] hover:bg-[#222222] shadow-xs transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Fields</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
