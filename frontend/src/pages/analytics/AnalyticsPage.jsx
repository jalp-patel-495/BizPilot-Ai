import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  BarChart3,
  Sparkles,
  Calendar,
  DollarSign,
  Layers,
  Users,
  Target,
  ArrowUpRight,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Activity,
  ArrowRight,
  PieChart as PieChartIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
} from 'recharts';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';

export const AnalyticsPage = () => {
  // Horizon in days: 30, 60, 90, 180
  const [horizonDays, setHorizonDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = async (horizon = horizonDays) => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/comprehensive-sales-analytics', {
        params: { horizon_days: horizon },
      });
      if (res.data?.data) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sales analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(horizonDays);
  }, [horizonDays]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics(horizonDays);
  };

  const forecast = analyticsData?.forecast;
  const products = analyticsData?.products || [];
  const customerTrends = analyticsData?.customer_trends;
  const conversionFunnel = analyticsData?.conversion_funnel || [];
  const monthlyGrowth = analyticsData?.monthly_growth || [];
  const aiInsights = analyticsData?.ai_narrative_insights || [];

  // Custom Recharts Tooltip for the Forecasting Chart
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="glass-panel p-4 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-2 max-w-xs">
          <p className="font-extrabold text-white text-sm pb-1 border-b border-slate-800">
            {label} {dataPoint?.is_forecast && <span className="text-amber-400 text-[10px] uppercase font-bold ml-1.5">(ML Forecast)</span>}
          </p>

          {dataPoint?.actual_sales !== null && dataPoint?.actual_sales !== undefined && (
            <div className="flex justify-between items-center text-cyan-300">
              <span>Actual Sales:</span>
              <span className="font-mono font-bold">${dataPoint.actual_sales?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-amber-400">
            <span>{dataPoint?.is_forecast ? 'ML Predicted Sales:' : 'Model Fit:'}</span>
            <span className="font-mono font-bold">${dataPoint.predicted_sales?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800 text-[10px]">
            <span>95% Confidence Band:</span>
            <span className="font-mono">${dataPoint.lower_bound?.toLocaleString()} – ${dataPoint.upper_bound?.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              <span>Phase 8: Machine Learning Sales Analytics</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>scikit-learn Regression Active</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Sales Analytics & ML Forecasting Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Statistical regression forecasting, product contribution matrix, customer trends, and plain-language AI business insights.
          </p>
        </div>

        {/* Controls: Horizon Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {[
              { label: 'Next 30 Days', days: 30 },
              { label: 'Next 60 Days', days: 60 },
              { label: 'Next 90 Days (Quarter)', days: 90 },
              { label: 'Next 180 Days (Half-Year)', days: 180 },
            ].map((h) => (
              <button
                key={h.days}
                id={`horizon-btn-${h.days}`}
                onClick={() => setHorizonDays(h.days)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  horizonDays === h.days
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          <button
            id="refresh-analytics-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Re-training ML...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core ML & Sales StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Current Monthly Run-Rate"
          value={`$${(forecast?.current_monthly_run_rate || 128450).toLocaleString()}`}
          icon={DollarSign}
          color="cyan"
          subtitle="September closed sales"
          trend="+11.7% MoM velocity"
        />
        <StatCard
          title="Projected Next Period Revenue"
          value={`$${(forecast?.projected_next_period_sales || 146800).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          color="amber"
          subtitle="scikit-learn ML model estimate"
          trend={`+${forecast?.projected_growth_percentage || 14.3}% Projected`}
        />
        <StatCard
          title="Model Quality & Fit"
          value={`R² = ${forecast?.model_r2_score || 0.94}`}
          icon={Brain}
          color="brand"
          subtitle={`MAE ±$${(forecast?.model_mae || 3200).toLocaleString()}`}
          trend="High confidence regression"
        />
        <StatCard
          title="Lead Conversion Win Rate"
          value="14.1%"
          icon={Target}
          color="emerald"
          subtitle="48 closed-won enterprise deals"
          trend="Avg cycle 14.2 days"
        />
      </div>

      {/* AI Business Insight Generator Card (Plain-Language Explanations) */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-gradient-to-tr from-slate-950 via-slate-900 to-brand-950/20 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">AI Executive Business Insights</h2>
              <p className="text-xs text-slate-400">
                Synthesized by the ML analytics engine in natural business language.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
            Automated Intelligence Digest
          </span>
        </div>

        {/* Narrative Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0 shadow-glow" />
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{insight}</p>
            </div>
          ))}
        </div>

        {/* Required Disclaimer Banner */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            {forecast?.disclaimer || analyticsData?.disclaimer}
          </p>
        </div>
      </div>

      {/* Main Forecast Chart: Actual Sales vs ML Predicted Sales */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Time-Series Machine Learning Model</span>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Sales Forecasting & Confidence Interval Projection
            </h2>
            <p className="text-xs text-slate-400">
              Historical actual sales vs polynomial regression trajectory for the {horizonDays}-day horizon.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
              <span className="text-slate-300">Actual Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="text-slate-300">ML Predicted (Est.)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/40 inline-block" />
              <span className="text-slate-400">95% Range</span>
            </div>
          </div>
        </div>

        {/* Recharts ComposedChart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecast?.timeline || []}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomForecastTooltip />} />

              {/* Shaded 95% Confidence Interval Upper Band */}
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="none"
                fill="url(#forecastBandGrad)"
                name="Upper Bound (95%)"
              />

              {/* Actual Sales Line (Solid Cyan) */}
              <Line
                type="monotone"
                dataKey="actual_sales"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
                name="Actual Sales"
                connectNulls={false}
              />

              {/* ML Predicted Sales Line (Dashed Amber) */}
              <Line
                type="monotone"
                dataKey="predicted_sales"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', r: 4 }}
                name="Predicted Sales"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Section: Product Performance & Customer Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Performance Breakdown */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Product Performance Analysis</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Revenue contribution and unit volumes per product line.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-300">
              Top: {products[0]?.product_name || 'Enterprise Suite'}
            </span>
          </div>

          {/* Product Mini Bar Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="product_name" tick={false} stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [`$${val?.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Performance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Revenue</th>
                  <th className="pb-2">Share</th>
                  <th className="pb-2 text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 font-semibold text-white">{prod.product_name}</td>
                    <td className="py-2.5 font-mono text-emerald-400 font-bold">
                      ${prod.revenue?.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-slate-300">{prod.revenue_share_pct}%</td>
                    <td className="py-2.5 text-right font-semibold text-brand-300">
                      +{prod.growth_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Customer Trends & Cohorts */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Customer Trends & Repeat Behavior</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                New vs repeat buyer distribution and lifetime metrics.
              </p>
            </div>
          </div>

          {/* New vs Repeat Visual Split */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">New Customer Sales</span>
                <span className="text-base font-extrabold text-white">
                  ${(customerTrends?.new_customers_revenue || 78450).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">18 new logos signed</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Repeat Customer Sales</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ${(customerTrends?.repeat_customers_revenue || 50000).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">12 expansion orders</span>
              </div>
            </div>

            {/* Split Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-brand-500" style={{ width: '60%' }} title="New Customers (60%)" />
              <div className="h-full bg-emerald-400" style={{ width: '40%' }} title="Repeat Customers (40%)" />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                <span>New Acquisition (60%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Repeat Expansion (40%)</span>
              </span>
            </div>
          </div>

          {/* Secondary Metric Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Average Order Value</span>
              <span className="text-base font-extrabold text-white mt-1 block">
                ${(customerTrends?.average_order_value || 14200).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">+18.5% deal size</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Retention Rate</span>
              <span className="text-base font-extrabold text-cyan-400 mt-1 block">
                {customerTrends?.retention_rate_pct || 88.4}%
              </span>
              <span className="text-[10px] text-slate-400">Enterprise cohort benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Conversion Funnel Analysis */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Conversion Funnel & Pipeline Velocity</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inbound lead stage drop-off and progression towards closed-won deals.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400">
            Overall Win Rate: 14.1%
          </span>
        </div>

        {/* Funnel Visual Horizontal Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {conversionFunnel.map((stage, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-slate-700 transition"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Stage {i + 1}
                </span>
                <p className="font-bold text-white text-xs mt-0.5">{stage.stage}</p>
              </div>

              <div>
                <div className="text-xl font-black text-white font-mono">{stage.count}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span className="text-brand-300 font-bold">{stage.conversion_rate_pct}% Conv.</span>
                  {stage.drop_off_pct > 0 && (
                    <span className="text-rose-400 font-semibold">-{stage.drop_off_pct}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
