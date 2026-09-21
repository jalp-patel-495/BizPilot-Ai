import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  Activity,
  ShieldCheck,
  Server,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  Search,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DashboardHeader } from './components/DashboardHeader';
import { KPICard } from './components/KPICard';
import { EmptyState } from './components/EmptyState';
import api from '../../services/api';
import { adminService } from '../../services/adminService';

export const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchSuperAdminData = async () => {
    try {
      setRefreshing(true);
      const [dashRes, bizRes] = await Promise.all([
        adminService.getDashboardMetrics().catch(() => null),
        adminService.getBusinesses().catch(() => []),
      ]);

      if (dashRes) setData(dashRes);
      if (bizRes) setBusinesses(bizRes);
    } catch (err) {
      console.error('Failed to load Super Admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const health = data?.system_health || {
    status: 'UNAVAILABLE',
    uptime: 'Unavailable',
    active_db_connections: 0,
    redis_broker: 'UNAVAILABLE',
    ai_engine: 'UNAVAILABLE',
    avg_response_time_ms: 0,
  };

  const planDist = data?.plan_distribution || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Platform Overview"
          subtitle="Manage your entire platform, multi-tenant organizations, and infrastructure health."
          role="SUPER_ADMIN"
          onRefresh={fetchSuperAdminData}
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
        title="Platform Overview"
        subtitle="Manage your entire platform, multi-tenant organizations, and infrastructure health."
        role="SUPER_ADMIN"
        onRefresh={fetchSuperAdminData}
        refreshing={refreshing}
      >
        <button
          onClick={() => navigate('/admin?tab=businesses')}
          className="px-3 py-1.5 rounded-md bg-[#111111] text-white text-xs font-medium hover:bg-[#262626] transition shadow-xs flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Manage Tenants</span>
        </button>
      </DashboardHeader>

      {/* 7 Super Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Organizations"
          value={data?.total_businesses ?? businesses.length ?? 0}
          change={data?.business_growth ?? 0.0}
          trend={data?.business_growth >= 0 ? "up" : "down"}
          subtext="across platform"
          icon={Building2}
          onClick={() => navigate('/admin?tab=businesses')}
        />
        <KPICard
          label="Active Organizations"
          value={data?.active_businesses ?? businesses.filter(b => b.is_active).length ?? 0}
          change={0.0}
          trend="neutral"
          subtext="healthy enterprise tenants"
          icon={Activity}
          onClick={() => navigate('/admin?tab=businesses')}
        />
        <KPICard
          label="Total Global Users"
          value={(data?.total_users ?? 0).toLocaleString()}
          change={data?.user_growth ?? 0.0}
          trend={data?.user_growth >= 0 ? "up" : "down"}
          subtext="across all organizations"
          icon={Users}
          onClick={() => navigate('/admin?tab=users')}
        />
        <KPICard
          label="Platform Revenue (MRR)"
          value={`Rs. ${(data?.mrr ?? 0).toLocaleString()}`}
          change={data?.mrr_growth ?? 0.0}
          trend={data?.mrr_growth >= 0 ? "up" : "down"}
          subtext="recurring subscription volume"
          icon={CreditCard}
          onClick={() => navigate('/admin?tab=subscriptions')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="System Activity (Monthly Requests)"
          value={(data?.monthly_api_requests ?? 0).toLocaleString()}
          change={0.0}
          trend="neutral"
          subtext="API requests processed"
          icon={Cpu}
          onClick={() => navigate('/admin?tab=system_usage')}
        />
        <KPICard
          label="New Organizations"
          value={data?.new_businesses ?? 0}
          change={0.0}
          trend="neutral"
          subtext="onboarded this period"
          icon={Building2}
        />
        <KPICard
          label="Platform Uptime"
          value={data?.system_uptime || 'Unavailable'}
          change={0.0}
          trend="neutral"
          subtext={data?.system_uptime && data.system_uptime !== 'Unavailable' ? 'healthy telemetry' : 'telemetry offline'}
          icon={Server}
        />
      </div>

      {/* System Infrastructure Health Bar */}
      <div className="bg-[#111111] text-white p-5 rounded-lg shadow-sm border border-[#222222]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wide">Platform Infrastructure & Service Status</h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Response Time: {health.avg_response_time_ms}ms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E]">
            <p className="text-[11px] text-neutral-400">Database Engine</p>
            <p className="font-semibold text-emerald-400 mt-0.5">PostgreSQL 16 (Online)</p>
          </div>
          <div className="p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E]">
            <p className="text-[11px] text-neutral-400">Task Broker</p>
            <p className="font-semibold text-emerald-400 mt-0.5">Redis + Celery Worker</p>
          </div>
          <div className="p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E]">
            <p className="text-[11px] text-neutral-400">AI Automation Core</p>
            <p className="font-semibold text-emerald-400 mt-0.5">LLM Provider (Active)</p>
          </div>
          <div className="p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E]">
            <p className="text-[11px] text-neutral-400">Security & RBAC</p>
            <p className="font-semibold text-emerald-400 mt-0.5">JWT Enforced Guard</p>
          </div>
        </div>
      </div>

      {/* Tenant Organizations & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#555555]" />
                Tenant Organizations Directory
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">Provisioned organizations across the platform</p>
            </div>
            <button
              onClick={() => navigate('/admin?tab=businesses')}
              className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
            >
              Manage All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {businesses.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No organizations yet"
              description="Organizations will appear here when they are created."
              actionText="Create Organization"
              onAction={() => navigate('/admin?tab=businesses')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[#8A8A8A] font-medium">
                    <th className="pb-2.5 font-medium">Organization Name</th>
                    <th className="pb-2.5 font-medium">Plan Tier</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {businesses.slice(0, 5).map((biz) => (
                    <tr key={biz.id} className="hover:bg-[#FAFAFA] transition">
                      <td className="py-3">
                        <div className="font-semibold text-[#111111]">{biz.name}</div>
                        <div className="text-[11px] text-[#8A8A8A] font-mono">{biz.slug}</div>
                      </td>
                      <td className="py-3">
                        <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
                          {biz.plan || 'Starter'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${
                            biz.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${biz.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {biz.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate('/admin?tab=businesses')}
                          className="px-2.5 py-1 rounded bg-white hover:bg-[#111111] hover:text-white border border-[#D9D9D9] text-xs font-medium transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Plan Distribution Chart */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-[#555555]" />
              Subscription Tiers
            </h3>
            <p className="text-xs text-[#666666] mb-4">Plan distribution across active tenants</p>

            {planDist.length === 0 ? (
              <div className="h-44 w-full flex items-center justify-center text-xs text-[#8A8A8A]">
                No subscription data yet
              </div>
            ) : (
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {planDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#111111'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5E5',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#F0F0F0] text-xs">
            {planDist.length === 0 ? (
              <p className="text-[11px] text-[#8A8A8A] text-center">0 active plans recorded</p>
            ) : (
              planDist.map((p) => (
                <div key={p.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#111111' }} />
                    <span className="font-medium text-[#444444]">{p.tier}</span>
                  </div>
                  <span className="font-semibold text-[#111111]">{p.count} tenants</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Audit Activity Log */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#555555]" />
              System Activity & Audit Logs
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">Real-time security and administrative audit trail</p>
          </div>
          <button
            onClick={() => navigate('/admin?tab=audit_logs')}
            className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
          >
            View Full Audit Log
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {(data?.recent_activities || []).slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-md border border-[#F0F0F0] bg-[#FAFAFA] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-[#111111] border border-[#E5E5E5] shrink-0">
                  {log.action}
                </span>
                <span className="text-[#333333] font-medium truncate">{log.details || log.resource}</span>
              </div>
              <div className="flex items-center gap-3 text-[#8A8A8A] text-[11px] shrink-0">
                <span>By: {log.user_name || 'System'}</span>
                <span>•</span>
                <span>{log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
