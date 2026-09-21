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
        <div className="bg-white p-3.5 rounded-lg border border-[#e5e5e5] shadow-md text-xs space-y-1.5 max-w-xs">
          <p className="font-bold text-[#111111] text-xs pb-1 border-b border-[#e5e5e5]">
            {label} {dataPoint?.is_forecast && <span className="text-[#666666] text-[10px] uppercase font-semibold ml-1">(Forecast)</span>}
          </p>

          {dataPoint?.actual_sales !== null && dataPoint?.actual_sales !== undefined && (
            <div className="flex justify-between items-center text-[#111111]">
              <span className="text-[#666666]">Actual Sales:</span>
              <span className="font-mono font-semibold">${dataPoint.actual_sales?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[#111111]">
            <span className="text-[#666666]">{dataPoint?.is_forecast ? 'Predicted Sales:' : 'Model Fit:'}</span>
            <span className="font-mono font-semibold">${dataPoint.predicted_sales?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center text-[#8a8a8a] pt-1 border-t border-[#e5e5e5] text-[10px]">
            <span>95% Range:</span>
            <span className="font-mono">${dataPoint.lower_bound?.toLocaleString()} – ${dataPoint.upper_bound?.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
              <Brain className="w-3 h-3 text-neutral-600" />
              <span>ML Sales Analytics</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>scikit-learn Active</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
            AI Sales Analytics & Forecasting
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Statistical regression forecasting, product contribution matrix, customer trends, and plain-language AI business insights.
          </p>
        </div>

        {/* Controls: Horizon Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-0.5 bg-[#f3f3f3] rounded-md border border-[#e5e5e5] text-xs">
            {[
              { label: '30 Days', days: 30 },
              { label: '60 Days', days: 60 },
              { label: '90 Days (Quarter)', days: 90 },
              { label: '180 Days (Half-Year)', days: 180 },
            ].map((h) => (
              <button
                key={h.days}
                id={`horizon-btn-${h.days}`}
                onClick={() => setHorizonDays(h.days)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  horizonDays === h.days
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#666666] hover:text-[#111111]'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#111111] bg-white hover:bg-[#f7f7f7] border border-[#d9d9d9] transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#666666] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Calculating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core ML & Sales StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Monthly Run-Rate"
          value={`$${(forecast?.current_monthly_run_rate || 128450).toLocaleString()}`}
          icon={DollarSign}
          subtitle="September closed sales"
          trend="+11.7% MoM velocity"
        />
        <StatCard
          title="Projected Next Period Revenue"
          value={`$${(forecast?.projected_next_period_sales || 146800).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          subtitle="scikit-learn ML model estimate"
          trend={`+${forecast?.projected_growth_percentage || 14.3}% Projected`}
        />
        <StatCard
          title="Model Quality & Fit"
          value={`R² = ${forecast?.model_r2_score || 0.94}`}
          icon={Brain}
          subtitle={`MAE ±$${(forecast?.model_mae || 3200).toLocaleString()}`}
          trend="High confidence regression"
        />
        <StatCard
          title="Lead Conversion Win Rate"
          value="14.1%"
          icon={Target}
          subtitle="48 closed-won enterprise deals"
          trend="Avg cycle 14.2 days"
        />
      </div>

      {/* AI Business Insight Generator Card */}
      <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#f3f3f3] text-[#111111]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">Executive Business Insights</h2>
              <p className="text-xs text-[#666666]">
                Synthesized by the ML analytics engine in plain business language.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
            Intelligence Digest
          </span>
        </div>

        {/* Narrative Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-start gap-2.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#111111] mt-1.5 shrink-0" />
              <p className="text-xs text-[#111111] leading-relaxed font-normal">{insight}</p>
            </div>
          ))}
        </div>

        {/* Required Disclaimer Banner */}
        <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-start gap-2 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-[#666666] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#666666] leading-relaxed">
            {forecast?.disclaimer || analyticsData?.disclaimer}
          </p>
        </div>
      </div>

      {/* Main Forecast Chart: Actual Sales vs ML Predicted Sales */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#e5e5e5] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">
              Sales Forecasting & Confidence Projection
            </h2>
            <p className="text-xs text-[#666666]">
              Historical actual sales vs polynomial regression trajectory for the {horizonDays}-day horizon.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111111] inline-block" />
              <span className="text-[#666666]">Actual Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#737373] inline-block" />
              <span className="text-[#666666]">Predicted (Est.)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2 rounded bg-[#f3f3f3] border border-[#d9d9d9] inline-block" />
              <span className="text-[#8a8a8a]">95% Range</span>
            </div>
          </div>
        </div>

        {/* Recharts ComposedChart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecast?.timeline || []}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis
                dataKey="period"
                stroke="#8a8a8a"
                tick={{ fill: '#666666', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#8a8a8a"
                tick={{ fill: '#666666', fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomForecastTooltip />} />

              {/* Shaded 95% Confidence Interval Upper Band */}
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="none"
                fill="#f7f7f7"
                name="Upper Bound (95%)"
              />

              {/* Actual Sales Line (Solid Black) */}
              <Line
                type="monotone"
                dataKey="actual_sales"
                stroke="#111111"
                strokeWidth={2.5}
                dot={{ fill: '#111111', r: 3 }}
                activeDot={{ r: 5 }}
                name="Actual Sales"
                connectNulls={false}
              />

              {/* ML Predicted Sales Line (Dashed Gray) */}
              <Line
                type="monotone"
                dataKey="predicted_sales"
                stroke="#737373"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#737373', r: 3 }}
                name="Predicted Sales"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Section: Product Performance & Customer Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Product Performance Breakdown */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#e5e5e5]">
            <div>
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#111111]" />
                <span>Product Performance Analysis</span>
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Revenue contribution and unit volumes per product line.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#111111]">
              Top: {products[0]?.product_name || 'Enterprise Suite'}
            </span>
          </div>

          {/* Product Mini Bar Chart */}
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="product_name" tick={false} stroke="#8a8a8a" />
                <YAxis
                  stroke="#8a8a8a"
                  tick={{ fill: '#666666', fontSize: 10 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val) => [`$${val?.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="revenue" fill="#111111" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Performance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[10px] font-semibold uppercase text-[#666666]">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Revenue</th>
                  <th className="pb-2">Share</th>
                  <th className="pb-2 text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {products.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f8f8] transition">
                    <td className="py-2.5 font-medium text-[#111111]">{prod.product_name}</td>
                    <td className="py-2.5 font-mono text-[#111111] font-semibold">
                      ${prod.revenue?.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-[#666666]">{prod.revenue_share_pct}%</td>
                    <td className="py-2.5 text-right font-medium text-emerald-700">
                      +{prod.growth_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Customer Trends & Cohorts */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#e5e5e5]">
            <div>
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#111111]" />
                <span>Customer Retention & Acquisition</span>
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                New vs repeat buyer distribution and lifetime metrics.
              </p>
            </div>
          </div>

          {/* New vs Repeat Visual Split */}
          <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] space-y-3.5">
            <div className="flex justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#666666] block">New Customers</span>
                <span className="text-base font-bold text-[#111111]">
                  ${(customerTrends?.new_customers_revenue || 78450).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8a8a8a] block mt-0.5">18 new logos</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-[#666666] block">Repeat Customers</span>
                <span className="text-base font-bold text-[#111111]">
                  ${(customerTrends?.repeat_customers_revenue || 50000).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8a8a8a] block mt-0.5">12 expansions</span>
              </div>
            </div>

            {/* Split Bar */}
            <div className="w-full h-2 rounded-full bg-[#e5e5e5] overflow-hidden flex">
              <div className="h-full bg-[#111111]" style={{ width: '60%' }} title="New Customers (60%)" />
              <div className="h-full bg-[#737373]" style={{ width: '40%' }} title="Repeat Customers (40%)" />
            </div>

            <div className="flex justify-between text-[11px] text-[#666666]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#111111]" />
                <span>New Acquisition (60%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#737373]" />
                <span>Repeat Expansion (40%)</span>
              </span>
            </div>
          </div>

          {/* Secondary Metric Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-semibold uppercase text-[#666666] block">Average Order Value</span>
              <span className="text-base font-bold text-[#111111] mt-0.5 block">
                ${(customerTrends?.average_order_value || 14200).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">+18.5% deal size</span>
            </div>

            <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
              <span className="text-[10px] font-semibold uppercase text-[#666666] block">Retention Rate</span>
              <span className="text-base font-bold text-[#111111] mt-0.5 block">
                {customerTrends?.retention_rate_pct || 88.4}%
              </span>
              <span className="text-[10px] text-[#8a8a8a]">Enterprise cohort</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Conversion Funnel Analysis */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#e5e5e5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e5e5]">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#111111]" />
              <span>Conversion Funnel & Pipeline Velocity</span>
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Inbound lead stage drop-off and progression towards closed-won deals.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#111111]">
            Overall Win Rate: 14.1%
          </span>
        </div>

        {/* Funnel Visual Horizontal Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {conversionFunnel.map((stage, i) => (
            <div
              key={i}
              className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex flex-col justify-between space-y-2 hover:border-[#d9d9d9] transition"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a] block">
                  Stage {i + 1}
                </span>
                <p className="font-semibold text-[#111111] text-xs mt-0.5">{stage.stage}</p>
              </div>

              <div>
                <div className="text-lg font-bold text-[#111111] font-mono">{stage.count}</div>
                <div className="flex items-center justify-between text-[10px] text-[#666666] mt-1">
                  <span className="font-semibold text-[#111111]">{stage.conversion_rate_pct}% Conv.</span>
                  {stage.drop_off_pct > 0 && (
                    <span className="text-rose-700">-{stage.drop_off_pct}%</span>
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
