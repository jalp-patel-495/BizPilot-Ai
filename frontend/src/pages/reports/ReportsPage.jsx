import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  PieChart,
  Download,
  FileText,
  FileSpreadsheet,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ArrowDownToLine,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../../services/api';

const REPORT_TABS = [
  { id: 'daily', label: 'Daily Report', icon: Calendar, cadence: 'Past 24 Hours' },
  { id: 'weekly', label: 'Weekly Report', icon: BarChart3, cadence: 'Last 7 Days' },
  { id: 'monthly', label: 'Monthly Report', icon: TrendingUp, cadence: 'Month to Date' },
  { id: 'sales', label: 'Sales Report', icon: DollarSign, cadence: 'Transactions' },
  { id: 'lead', label: 'Lead Report', icon: Target, cadence: 'Funnel & ROI' },
  { id: 'customer', label: 'Customer Report', icon: Users, cadence: 'Health & NRR' },
  { id: 'revenue', label: 'Revenue Report', icon: PieChart, cadence: 'Financial Audit' },
];

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null); // 'pdf' | 'csv' | null
  const [downloadNotice, setDownloadNotice] = useState('');

  // Legacy report archive list
  const [archiveList, setArchiveList] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);

  const fetchReport = async (reportType) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/data/${reportType}`);
      if (res.data?.data) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error(`Failed to load ${reportType} report:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchive = async () => {
    try {
      setLoadingArchive(true);
      const res = await api.get('/reports');
      if (res.data?.data) {
        setArchiveList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load report archive:', err);
    } finally {
      setLoadingArchive(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchArchive();
  }, []);

  const handleExportDownload = async (format) => {
    try {
      setExporting(format);
      const response = await api.get(`/reports/${activeTab}/export?format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `upteky_${activeTab}_report_${new Date().toISOString().slice(0, 10)}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadNotice(
        `Generated and downloaded ${activeTab.toUpperCase()} report as .${format.toUpperCase()}`
      );
      setTimeout(() => setDownloadNotice(''), 5000);
    } catch (err) {
      console.error('Export download failed:', err);
      alert(`Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  const renderChart = () => {
    if (!reportData?.chart_data || reportData.chart_data.length === 0) return null;

    const chartType = reportData.chart_config?.chart_type || 'area';
    const primaryLabel = reportData.chart_config?.primary_label || 'Value';
    const secondaryLabel = reportData.chart_config?.secondary_label;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={reportData.chart_data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="period" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '1rem',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar dataKey="primary_value" name={primaryLabel} fill="#6366f1" radius={[6, 6, 0, 0]} />
            {secondaryLabel && (
              <Bar dataKey="secondary_value" name={secondaryLabel} fill="#38bdf8" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={reportData.chart_data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="period" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '1rem',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="primary_value"
              name={primaryLabel}
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 5 }}
            />
            {secondaryLabel && (
              <Line
                type="monotone"
                dataKey="secondary_value"
                name={secondaryLabel}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default Area Chart
    return (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={reportData.chart_data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="secondaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="period" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '1rem',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="primary_value"
            name={primaryLabel}
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#primaryAreaGrad)"
          />
          {secondaryLabel && (
            <Area
              type="monotone"
              dataKey="secondary_value"
              name={secondaryLabel}
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#secondaryAreaGrad)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Export Actions */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Automated Business Intelligence & Reporting
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Executive Reports & Analytics Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automatically generated business reports covering Daily, Weekly, Monthly, Sales, Lead, Customer, and
            Revenue dimensions with AI summaries and multi-format exports.
          </p>
        </div>

        {/* Dual Export Buttons (PDF & CSV) + Refresh */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Export PDF Button */}
          <button
            onClick={() => handleExportDownload('pdf')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 shadow-glow transition border border-indigo-500/30"
            title="Download formatted executive PDF"
          >
            {exporting === 'pdf' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-indigo-200" />
            )}
            <span>Export as PDF</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={() => handleExportDownload('csv')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-300 transition shadow-sm"
            title="Download raw data CSV spreadsheet"
          >
            {exporting === 'csv' ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            )}
            <span>Export as CSV</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchReport(activeTab)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 shadow-glow animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* 7 Report Types Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-500/50 shadow-glow'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {tab.cadence}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Report Header & Metadata */}
      {reportData && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{reportData.title}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
                {reportData.period_label}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compiled at {new Date(reportData.generated_at).toLocaleString()} • Continuous automated data sync
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">All Metrics Verified</span>
          </div>
        </div>
      )}

      {/* 1. KEY METRICS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800 animate-pulse h-28" />
          ))}
        </div>
      ) : reportData?.key_metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportData.key_metrics.map((metric) => {
            const isPositive = metric.change_pct >= 0;
            return (
              <div
                key={metric.key}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-brand-500/30 transition group shadow-sm hover:shadow-glow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">{metric.label}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {metric.change_pct}%
                    </span>
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 font-mono">
                  {metric.value}
                </div>

                <p className="text-[11px] text-slate-500 truncate">{metric.subtitle}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 2. INTERACTIVE CHARTS & VISUALIZATION */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <span>{reportData?.chart_config?.title || 'Report Trend Visualizer'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-series time aggregation with comparative period run-rates
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            Type: {reportData?.chart_config?.chart_type?.toUpperCase() || 'AREA'}
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
            Rendering dynamic chart series...
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* 3. AI-GENERATED SUMMARY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-950/40 via-slate-900/60 to-purple-950/20 relative overflow-hidden shadow-glow">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>AI-Generated Executive Summary</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Natural Language BI
              </span>
            </h3>
            <p className="text-xs text-slate-400">Synthesized from transactional telemetry and machine learning models</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2 py-4">
            <div className="h-4 bg-slate-800 rounded w-5/6" />
            <div className="h-4 bg-slate-800 rounded w-4/6" />
            <div className="h-4 bg-slate-800 rounded w-full" />
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
            {reportData?.ai_summary}
          </div>
        )}
      </div>

      {/* 4. TRENDS & IMPORTANT CHANGES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Important Changes */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Important Changes & Operational Events</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {reportData?.important_changes?.length || 0} recorded
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {reportData?.important_changes?.map((change) => {
              const isPositive = change.impact_type === 'POSITIVE';
              const isWarning = change.impact_type === 'WARNING';
              return (
                <div
                  key={change.id}
                  className={`p-4 rounded-2xl border transition ${
                    isPositive
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                      : isWarning
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        isPositive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : isWarning
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {change.impact_type}
                    </span>
                    <span className="text-[10px] text-slate-500">{change.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{change.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{change.details}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Strategic Trends */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Macro Strategic Trends</span>
            </h3>
            <span className="text-[11px] text-slate-500">Automated Observations</span>
          </div>

          <div className="space-y-3 flex-1">
            {reportData?.trends?.map((trend, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:border-brand-500/30 transition"
              >
                <span className="w-5 h-5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{trend}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. GENERATED REPORTS LIBRARY ARCHIVE */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-base font-bold text-white">Report Download Library & Compliance Archive</h3>
            <p className="text-xs text-slate-400">Available downloads ready for archival, audits, or distribution</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {archiveList.length} compiled packages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Report Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Evaluation Window</th>
                <th className="px-6 py-4">Records</th>
                <th className="px-6 py-4">Format & Size</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loadingArchive ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading report archive...
                  </td>
                </tr>
              ) : (
                archiveList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
                        <span>{r.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{r.report_type}</td>
                    <td className="px-6 py-4 text-slate-300">{r.date_range}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {r.record_count?.toLocaleString()} rows
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      PDF • {r.file_size}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        READY
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleExportDownload('pdf')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-300 hover:text-white bg-brand-600/20 hover:bg-brand-600 border border-brand-500/30 transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
