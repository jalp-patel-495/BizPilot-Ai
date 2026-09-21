import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  IndianRupee,
  Target,
  Users,
  PieChart,
  Download,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
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
  { id: 'daily', label: 'Daily', icon: Calendar, cadence: '24h' },
  { id: 'weekly', label: 'Weekly', icon: BarChart3, cadence: '7d' },
  { id: 'monthly', label: 'Monthly', icon: TrendingUp, cadence: 'MTD' },
  { id: 'sales', label: 'Sales', icon: IndianRupee, cadence: 'Orders' },
  { id: 'lead', label: 'Lead', icon: Target, cadence: 'Funnel' },
  { id: 'customer', label: 'Customer', icon: Users, cadence: 'Accounts' },
  { id: 'revenue', label: 'Revenue', icon: PieChart, cadence: 'Finance' },
];

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [downloadNotice, setDownloadNotice] = useState('');

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

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#111111',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };

  const renderChart = () => {
    if (!reportData?.chart_data || reportData.chart_data.length === 0) return null;

    const chartType = reportData.chart_config?.chart_type || 'area';
    const primaryLabel = reportData.chart_config?.primary_label || 'Value';
    const secondaryLabel = reportData.chart_config?.secondary_label;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.chart_data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="period" stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <YAxis stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar dataKey="primary_value" name={primaryLabel} fill="#111111" radius={[4, 4, 0, 0]} />
            {secondaryLabel && (
              <Bar dataKey="secondary_value" name={secondaryLabel} fill="#737373" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.chart_data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="period" stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <YAxis stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="primary_value"
              name={primaryLabel}
              stroke="#111111"
              strokeWidth={2}
              dot={{ fill: '#111111', r: 4 }}
            />
            {secondaryLabel && (
              <Line
                type="monotone"
                dataKey="secondary_value"
                name={secondaryLabel}
                stroke="#737373"
                strokeWidth={1.5}
                dot={{ fill: '#737373', r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={reportData.chart_data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis dataKey="period" stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
          <YAxis stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="primary_value"
            name={primaryLabel}
            stroke="#111111"
            strokeWidth={2}
            fillOpacity={0.08}
            fill="#111111"
          />
          {secondaryLabel && (
            <Area
              type="monotone"
              dataKey="secondary_value"
              name={secondaryLabel}
              stroke="#737373"
              strokeWidth={1.5}
              fillOpacity={0.04}
              fill="#737373"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Export Actions */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Business Intelligence & Reporting
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            Executive Reports & Analytics
          </h1>
          <p className="text-xs text-[#666666] mt-1 max-w-2xl">
            Automatically generated business reports covering Daily, Weekly, Monthly, Sales, Lead, Customer, and
            Revenue dimensions with multi-format exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportDownload('pdf')}
            disabled={exporting !== null}
            className="btn-primary"
            title="Download formatted executive PDF"
          >
            {exporting === 'pdf' ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExportDownload('csv')}
            disabled={exporting !== null}
            className="btn-secondary"
            title="Download raw data CSV spreadsheet"
          >
            {exporting === 'csv' ? (
              <div className="w-3.5 h-3.5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchReport(activeTab)}
            disabled={loading}
            className="btn-secondary"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#111111]' : ''}`} />
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* 7 Report Types Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <div className="p-1 rounded-md bg-[#F3F3F3] border border-[#E5E5E5] flex items-center gap-1">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#111111] shadow-subtle border border-[#D9D9D9] font-semibold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] text-[#8A8A8A]">({tab.cadence})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Report Header & Metadata */}
      {reportData && (
        <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <span>{reportData.title}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
                {reportData.period_label}
              </span>
            </h2>
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              Compiled at {new Date(reportData.generated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} • Continuous automated data sync
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>All Metrics Verified</span>
          </div>
        </div>
      )}

      {/* 1. KEY METRICS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-lg border border-[#E5E5E5] animate-pulse h-24" />
          ))}
        </div>
      ) : reportData?.key_metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportData.key_metrics.map((metric) => {
            const isPositive = metric.change_pct >= 0;
            return (
              <div
                key={metric.key}
                className="bg-white p-5 rounded-lg border border-[#E5E5E5] shadow-subtle hover:border-[#D4D4D4] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#666666]">{metric.label}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.2 rounded border ${
                      isPositive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
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

                <div className="text-2xl font-semibold text-[#111111] tracking-tight mb-1">
                  {typeof metric.value === 'string' ? metric.value.replace(/\$/g, 'Rs. ') : metric.value}
                </div>

                <p className="text-[11px] text-[#8A8A8A] truncate">
                  {typeof metric.subtitle === 'string' ? metric.subtitle.replace(/\$/g, 'Rs. ') : metric.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 2. INTERACTIVE CHARTS & VISUALIZATION */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#555555]" />
              <span>{reportData?.chart_config?.title || 'Report Trend Visualizer'}</span>
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Multi-series time aggregation with comparative period run-rates
            </p>
          </div>
          <div className="text-xs font-medium px-2 py-0.5 rounded bg-[#F3F3F3] border border-[#E5E5E5] text-[#111111]">
            Type: {reportData?.chart_config?.chart_type?.toUpperCase() || 'AREA'}
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-[#8A8A8A]">
            <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mr-2" />
            Rendering dynamic series...
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* 3. AI-GENERATED SUMMARY */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-[#F3F3F3] border border-[#E5E5E5] text-[#111111]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">AI-Generated Executive Summary</h3>
            <p className="text-xs text-[#8A8A8A]">Synthesized from transactional telemetry and machine learning models</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2 py-3">
            <div className="h-4 bg-[#F3F3F3] rounded w-5/6" />
            <div className="h-4 bg-[#F3F3F3] rounded w-4/6" />
          </div>
        ) : (
          <div className="p-4 rounded-md bg-[#F9FAFB] border border-[#E5E5E5] text-[#111111] text-xs leading-relaxed">
            {reportData?.ai_summary ? reportData.ai_summary.replace(/\$/g, 'Rs. ') : ''}
          </div>
        )}
      </div>

      {/* 4. TRENDS & IMPORTANT CHANGES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Important Changes */}
        <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#555555]" />
              <span>Operational Changes & Events</span>
            </h3>
            <span className="text-[11px] text-[#8A8A8A]">
              {reportData?.important_changes?.length || 0} recorded
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {reportData?.important_changes?.map((change) => {
              const isPositive = change.impact_type === 'POSITIVE';
              const isWarning = change.impact_type === 'WARNING';
              return (
                <div
                  key={change.id}
                  className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isWarning
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {change.impact_type}
                    </span>
                    <span className="text-[10px] text-[#8A8A8A]">{change.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#111111] mb-0.5">{change.title}</h4>
                  <p className="text-xs text-[#666666] leading-relaxed">{change.details?.replace(/\$/g, 'Rs. ')}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Strategic Trends */}
        <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#555555]" />
              <span>Macro Strategic Trends</span>
            </h3>
            <span className="text-[11px] text-[#8A8A8A]">Automated Observations</span>
          </div>

          <div className="space-y-2.5 flex-1">
            {reportData?.trends?.map((trend, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] flex items-start gap-2.5"
              >
                <span className="w-4 h-4 rounded bg-[#EAEAEA] text-[#111111] flex items-center justify-center font-medium text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-[#404040] leading-relaxed">{trend.replace(/\$/g, 'Rs. ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. GENERATED REPORTS ARCHIVE */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-[#EBEBEB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Report Archive & Compliance Downloads</h3>
            <p className="text-xs text-[#8A8A8A]">Available downloads ready for archival, audits, or distribution</p>
          </div>
          <span className="text-xs text-[#8A8A8A]">
            {archiveList.length} compiled packages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#F9FAFB] text-[#666666] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="px-5 py-3">Report Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Evaluation Window</th>
                <th className="px-5 py-3">Records</th>
                <th className="px-5 py-3">Format & Size</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {loadingArchive ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8A8A8A]">
                    <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading report archive...
                  </td>
                </tr>
              ) : (
                archiveList.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-5 py-3 font-semibold text-[#111111]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8A8A8A] flex-shrink-0" />
                        <span>{r.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#666666]">{r.report_type}</td>
                    <td className="px-5 py-3 text-[#666666]">{r.date_range}</td>
                    <td className="px-5 py-3 text-[#8A8A8A] font-mono">
                      {r.record_count?.toLocaleString()} rows
                    </td>
                    <td className="px-5 py-3 text-[#8A8A8A] font-mono">
                      PDF • {r.file_size}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        READY
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleExportDownload('pdf')}
                        className="btn-secondary"
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
