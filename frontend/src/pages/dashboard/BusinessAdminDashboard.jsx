import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Users,
  Target,
  ShoppingBag,
  ReceiptText,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardHeader } from './components/DashboardHeader';
import { KPICard } from './components/KPICard';
import { EmptyState } from './components/EmptyState';
import api from '../../services/api';

export const BusinessAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState('this_month');
  const navigate = useNavigate();

  const fetchDashboardData = async (filter = dateFilter) => {
    try {
      setRefreshing(true);
      const res = await api.get(`/analytics/business-dashboard?range_type=${filter}`);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load business dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(dateFilter);
  }, [dateFilter]);

  const widgets = data?.widgets || {};
  const revenueTrend = data?.revenue_trend || [];
  const leadConversion = data?.lead_conversion || [];
  const aiInsights = data?.ai_insights || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Business Overview"
          subtitle="Monitor your organization's performance, team operations, and revenue trajectory."
          role="BUSINESS_ADMIN"
          dateFilter={dateFilter}
          onDateFilterChange={(newFilter) => setDateFilter(newFilter)}
          onRefresh={() => fetchDashboardData(dateFilter)}
          refreshing={refreshing}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-lg border border-[#E5E5E5] p-4 animate-pulse flex flex-col justify-between">
              <div className="h-3 bg-neutral-200 rounded w-1/3" />
              <div className="h-6 bg-neutral-200 rounded w-1/2" />
              <div className="h-3 bg-neutral-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Business Overview"
        subtitle="Monitor your organization's performance, team operations, and revenue trajectory."
        role="BUSINESS_ADMIN"
        dateFilter={dateFilter}
        onDateFilterChange={(newFilter) => setDateFilter(newFilter)}
        onRefresh={() => fetchDashboardData(dateFilter)}
        refreshing={refreshing}
      >
        <button
          onClick={() => navigate('/customers')}
          className="px-3 py-1.5 rounded-md bg-[#111111] text-white text-xs font-medium hover:bg-[#262626] transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Customer</span>
        </button>
      </DashboardHeader>

      {/* 7 Core Business Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Customers"
          value={widgets.total_customers?.value ?? 0}
          change={widgets.total_customers?.change ?? 0.0}
          trend={widgets.total_customers?.trend || 'neutral'}
          subtext={widgets.total_customers?.subtext || 'Active paying accounts'}
          icon={Users}
          onClick={() => navigate('/customers')}
        />
        <KPICard
          label="Total Leads"
          value={widgets.total_leads?.value ?? 0}
          change={widgets.total_leads?.change ?? 0.0}
          trend={widgets.total_leads?.trend || 'neutral'}
          subtext={widgets.total_leads?.subtext || 'Inbound & outbound pipeline'}
          icon={Target}
          onClick={() => navigate('/leads')}
        />
        <KPICard
          label="Active Employees"
          value={widgets.active_employees?.value ?? 0}
          change={widgets.active_employees?.change ?? 0.0}
          trend={widgets.active_employees?.trend || 'neutral'}
          subtext={widgets.active_employees?.subtext || 'Organization team members'}
          icon={Users}
          onClick={() => navigate('/users')}
        />
        <KPICard
          label="Total Sales"
          value={widgets.total_sales?.value ?? 0}
          change={widgets.total_sales?.change ?? 0.0}
          trend={widgets.total_sales?.trend || 'neutral'}
          subtext={widgets.total_sales?.subtext || 'Completed orders'}
          icon={ShoppingBag}
          onClick={() => navigate('/sales')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Revenue"
          value={widgets.total_revenue?.value ? (typeof widgets.total_revenue.value === 'number' ? `Rs. ${widgets.total_revenue.value.toLocaleString()}` : String(widgets.total_revenue.value).replace(/\$/g, 'Rs. ')) : 'Rs. 0'}
          change={widgets.total_revenue?.change ?? 0.0}
          trend={widgets.total_revenue?.trend || 'neutral'}
          subtext={widgets.total_revenue?.subtext || 'Gross business volume'}
          icon={IndianRupee}
        />
        <KPICard
          label="Pending Invoices"
          value={widgets.pending_invoices?.value ?? 0}
          change={widgets.pending_invoices?.change ?? 0.0}
          trend={widgets.pending_invoices?.trend || 'neutral'}
          subtext={widgets.pending_invoices?.subtext || 'Awaiting settlement / review'}
          icon={ReceiptText}
          onClick={() => navigate('/invoices')}
        />
        <KPICard
          label="Conversion Rate"
          value={widgets.conversion_rate?.value ?? '0.0%'}
          change={widgets.conversion_rate?.change ?? 0.0}
          trend={widgets.conversion_rate?.trend || 'neutral'}
          subtext={widgets.conversion_rate?.subtext || 'Lead-to-customer ratio'}
          icon={CheckCircle2}
        />
      </div>

      {/* Revenue & Funnel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#555555]" />
                Revenue Trajectory vs Target
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">Realized income performance with moving average trend</p>
            </div>
          </div>

          {revenueTrend.length === 0 ? (
            <div className="h-64 w-full flex items-center justify-center text-xs text-[#8A8A8A]">
              No revenue trajectory data available yet
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="period" stroke="#8A8A8A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8A8A8A" fontSize={11} tickLine={false} tickFormatter={(val) => `Rs. ${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#111111" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="target" name="Target Quota" stroke="#8A8A8A" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Lead Conversion Funnel */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-[#555555]" />
              Conversion Funnel
            </h3>
            <p className="text-xs text-[#666666] mb-4">Stage conversion rates across leads</p>

            {leadConversion.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8A8A8A]">
                No funnel conversion data yet
              </div>
            ) : (
              <div className="space-y-3">
                {leadConversion.map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#444444]">{stage.stage}</span>
                      <span className="font-semibold text-[#111111]">{stage.rate}%</span>
                    </div>
                    <div className="w-full bg-[#F0F0F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#111111] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, stage.rate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F0F0F0] mt-4">
            <button
              onClick={() => navigate('/analytics')}
              className="w-full py-1.5 text-center text-xs font-semibold text-[#111111] bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#E5E5E5] rounded-md transition"
            >
              Open Full Business Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Bar */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
          <h3 className="text-sm font-semibold text-[#111111] mb-1">Business Management Actions</h3>
          <p className="text-xs text-[#666666] mb-4">Fast-track day to day operational tasks</p>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/leads')}
              className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                <span className="font-semibold text-[#111111]">Review & Assign Leads</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
            </button>

            <button
              onClick={() => navigate('/invoices')}
              className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <ReceiptText className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                <span className="font-semibold text-[#111111]">Process Smart Invoices</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
            </button>

            <button
              onClick={() => navigate('/users')}
              className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                <span className="font-semibold text-[#111111]">Manage Team & Roles</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                <span className="font-semibold text-[#111111]">Export Executive Reports</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
            </button>
          </div>
        </div>

        {/* AI Business Insights */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-800" />
              Executive AI Operational Insights
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
              AI Synthesized
            </span>
          </div>

          <div className="space-y-2.5">
            {aiInsights.length === 0 ? (
              <p className="text-xs text-[#8A8A8A] py-6 text-center">No automated insights available yet for this period.</p>
            ) : (
              aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-[#FAFAFA] border border-[#F0F0F0] text-xs text-[#333333] flex items-start gap-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111111] mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{insight}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
