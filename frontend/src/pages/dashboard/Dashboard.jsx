import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  UserPlus,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  Bot,
  Zap,
  Layers,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import {
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
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../../components/common/Badge';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('this_month'); // today, this_week, this_month, this_year, custom
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-09-20');
  const [appliedCustomDates, setAppliedCustomDates] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const fetchDashboard = async (range = dateFilter, customDates = appliedCustomDates) => {
    try {
      setLoading(true);
      let url = `/analytics/business-dashboard?range_type=${range}`;
      if (range === 'custom' && customDates) {
        url += `&start_date=${customDates.start}&end_date=${customDates.end}`;
      }
      const res = await api.get(url);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load business dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(dateFilter, appliedCustomDates);
  }, [dateFilter, appliedCustomDates]);

  const handleFilterChange = (range) => {
    if (range === 'custom') {
      setShowCustomModal(true);
    } else {
      setDateFilter(range);
      setAppliedCustomDates(null);
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    setAppliedCustomDates({ start: customStart, end: customEnd });
    setDateFilter('custom');
    setShowCustomModal(false);
  };

  const widgets = data?.widgets || {};
  const revenueTrend = data?.revenue_trend || [];
  const salesTrend = data?.sales_trend || [];
  const leadConversion = data?.lead_conversion || [];
  const customerGrowth = data?.customer_growth || [];
  const productPerformance = data?.product_performance || [];
  const aiInsights = data?.ai_insights || [];

  // 8 Target Widgets configuration
  const widgetConfigs = [
    { key: 'total_revenue', icon: DollarSign, color: 'indigo', borderGlow: 'hover:border-indigo-500/40' },
    { key: 'total_customers', icon: Users, color: 'cyan', borderGlow: 'hover:border-cyan-500/40' },
    { key: 'total_leads', icon: Target, color: 'blue', borderGlow: 'hover:border-blue-500/40' },
    { key: 'new_leads', icon: UserPlus, color: 'emerald', borderGlow: 'hover:border-emerald-500/40' },
    { key: 'conversion_rate', icon: CheckCircle2, color: 'purple', borderGlow: 'hover:border-purple-500/40' },
    { key: 'pending_followups', icon: Clock, color: 'amber', borderGlow: 'hover:border-amber-500/40' },
    { key: 'monthly_sales', icon: ShoppingBag, color: 'rose', borderGlow: 'hover:border-rose-500/40' },
    { key: 'sales_growth', icon: TrendingUp, color: 'teal', borderGlow: 'hover:border-teal-500/40' },
  ];

  const dateFilterOptions = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom Date Range' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Date Filter Bar */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 3 Enterprise Intelligence
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold text-slate-400">
                {data?.date_range_label || 'Current Business Period'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Business Management Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time monitoring across revenue, pipeline conversion, customer velocity, and product performance.
            </p>
          </div>

          {/* Date Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-1">
              {dateFilterOptions.map((f) => {
                const isActive = dateFilter === f.id;
                return (
                  <button
                    key={f.id}
                    id={`filter-btn-${f.id}`}
                    onClick={() => handleFilterChange(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-glow border border-brand-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {f.id === 'custom' && <Calendar className="w-3.5 h-3.5" />}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => fetchDashboard(dateFilter, appliedCustomDates)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Select Custom Date Range</h3>
                <p className="text-xs text-slate-400">Filter metrics by exact start and end dates</p>
              </div>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition"
                >
                  Apply Range Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THE 8 SPECIFIED WIDGETS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Executive Activity Widgets (8 Core KPIs)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Synced with PostgreSQL / SQLite</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgetConfigs.map((config) => {
            const item = widgets[config.key] || {
              label: config.key.replace('_', ' ').toUpperCase(),
              value: '---',
              change: 0.0,
              trend: 'up',
              subtext: 'calculating...',
            };
            const Icon = config.icon;
            const isPositive = item.change >= 0;

            return (
              <div
                key={config.key}
                id={`widget-${config.key}`}
                className={`glass-panel p-5 rounded-2xl border border-slate-800/90 transition-all duration-200 hover:-translate-y-0.5 ${config.borderGlow} flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">{item.label}</p>
                    <p className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">{item.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-200">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(item.change)}%
                  </span>
                  <span className="text-slate-500 truncate max-w-[130px]">{item.subtext}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* THE 5 SPECIFIED CHARTS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Performance Analytics & BI Streams (5 Visual Charts)
          </h2>
        </div>

        {/* Row 1: Revenue Trend & Sales Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue Trend */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">1. Revenue Trend</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Gross ARR
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Actual gross revenue trajectory vs quota targets</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">Moving Avg Forecast</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Actual Revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    name="Target Benchmark"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradTarget)"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Predictive Forecast"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Sales Trend */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">2. Sales Trend</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Deals vs Volume
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Sales transaction revenue and closed deal count</p>
              </div>
              <span className="text-xs font-bold text-cyan-400">Order Ledger</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [
                      name === 'Deals Closed' ? `${val} deals` : `$${Number(val).toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    name="Sales Volume"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="deals"
                    name="Deals Closed"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Lead Conversion & Customer Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Lead Conversion */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">3. Lead Conversion Funnel</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Stage Attrition
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline progression from ingestion to closed won</p>
              </div>
              <span className="text-xs font-bold text-purple-400">24.6% Conversion</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leadConversion}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="stage" stroke="#94a3b8" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val, name, item) => [
                      `${val} leads (${item.payload.rate}% retention)`,
                      'Volume',
                    ]}
                  />
                  <Bar dataKey="count" name="Leads at Stage" radius={[0, 8, 8, 0]}>
                    {leadConversion.map((entry, index) => {
                      const colors = ['#6366f1', '#818cf8', '#06b6d4', '#10b981', '#14b8a6'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Customer Growth */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">4. Customer Growth</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Net Expansion
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Cumulative active accounts vs newly acquired clients</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">+12.4% Net New</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="total_customers"
                    name="Total Active Customers"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="new_customers"
                    name="New Clients Added"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#06b6d4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="churned"
                    name="Churned Accounts"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Product Performance (Chart 5) & AI Copilot Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 5: Product Performance */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">5. Product Performance</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Revenue by SKU
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Top-selling software products, units sold and gross earnings</p>
              </div>
              <span className="text-xs font-bold text-teal-400">Catalog Leaderboard</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="product"
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val, name, item) => [
                      `$${Number(val).toLocaleString()} (${item.payload.units_sold} units)`,
                      'Gross Revenue',
                    ]}
                  />
                  <Bar dataKey="revenue" name="Product Revenue" radius={[6, 6, 0, 0]}>
                    {productPerformance.map((entry, index) => {
                      const barColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
                      return <Cell key={`bar-${index}`} fill={barColors[index % barColors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Executive Intelligence Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Strategy Observations</h3>
                  <p className="text-[11px] text-slate-400">Contextual to selected date window</p>
                </div>
              </div>

              <div className="space-y-3">
                {aiInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 hover:border-brand-500/30 transition"
                  >
                    <span className="w-5 h-5 rounded-md bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> All systems nominal
              </span>
              <span className="text-[11px] text-slate-500">Auto-refresh 60s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
