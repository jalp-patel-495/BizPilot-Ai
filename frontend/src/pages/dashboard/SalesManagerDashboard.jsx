import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  UserPlus,
  CheckCircle2,
  Trophy,
  DollarSign,
  Clock,
  Users,
  Layers,
  Flame,
  Sun,
  Snowflake,
  ArrowRight,
  Plus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
import { KPICard } from './components/KPICard';
import { SalesPipelineFunnel } from './components/SalesPipelineFunnel';
import { TeamPerformanceTable } from './components/TeamPerformanceTable';
import { EmptyState } from './components/EmptyState';
import api from '../../services/api';

export const SalesManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchSalesData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/analytics/sales-manager-dashboard');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load Sales Manager dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const kpis = data?.kpis || {};
  const pipelineStages = data?.pipeline_stages || [];
  const teamPerformance = data?.team_performance || [];
  const recentLeads = data?.recent_leads || [];

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT_P0':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Urgent</span>;
      case 'HIGH_P1':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">High</span>;
      default:
        return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">Medium</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Sales Overview"
          subtitle="Track your team's pipeline, lead conversions, and sales representative performance."
          role="SALES_MANAGER"
          onRefresh={fetchSalesData}
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
        title="Sales Overview"
        subtitle="Track your team's pipeline, lead conversions, and sales representative performance."
        role="SALES_MANAGER"
        onRefresh={fetchSalesData}
        refreshing={refreshing}
      >
        <button
          onClick={() => navigate('/leads')}
          className="px-3 py-1.5 rounded-md bg-[#111111] text-white text-xs font-medium hover:bg-[#262626] transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </button>
      </DashboardHeader>

      {/* 8 Sales Manager KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Leads"
          value={kpis.total_leads?.value ?? '0'}
          change={kpis.total_leads?.change ?? 0.0}
          trend={kpis.total_leads?.trend || 'neutral'}
          subtext="Active pipeline volume"
          icon={Target}
          onClick={() => navigate('/leads')}
        />
        <KPICard
          label="New Leads"
          value={kpis.new_leads?.value ?? '0'}
          change={kpis.new_leads?.change ?? 0.0}
          trend={kpis.new_leads?.trend || 'neutral'}
          subtext="Uncontacted inbound"
          icon={UserPlus}
          onClick={() => navigate('/leads?status=NEW')}
        />
        <KPICard
          label="Qualified Leads"
          value={kpis.qualified_leads?.value ?? '0'}
          change={kpis.qualified_leads?.change ?? 0.0}
          trend={kpis.qualified_leads?.trend || 'neutral'}
          subtext="High-value prospects"
          icon={Flame}
          onClick={() => navigate('/leads?status=QUALIFIED')}
        />
        <KPICard
          label="Converted Deals"
          value={kpis.converted_leads?.value ?? '0'}
          change={kpis.converted_leads?.change ?? 0.0}
          trend={kpis.converted_leads?.trend || 'neutral'}
          subtext="Closed won contracts"
          icon={CheckCircle2}
          onClick={() => navigate('/leads?status=WON')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Conversion Rate"
          value={kpis.conversion_rate?.value ?? '0.0%'}
          change={kpis.conversion_rate?.change ?? 0.0}
          trend={kpis.conversion_rate?.trend || 'neutral'}
          subtext="Team win efficiency"
          icon={TrendingUp}
        />
        <KPICard
          label="Sales Revenue"
          value={kpis.sales_revenue?.value ? (typeof kpis.sales_revenue.value === 'number' ? `$${kpis.sales_revenue.value.toLocaleString()}` : kpis.sales_revenue.value) : '$0'}
          change={kpis.sales_revenue?.change ?? 0.0}
          trend={kpis.sales_revenue?.trend || 'neutral'}
          subtext="Booked deal volume"
          icon={DollarSign}
        />
        <KPICard
          label="Pending Follow-ups"
          value={kpis.pending_followups?.value ?? '0'}
          change={kpis.pending_followups?.change ?? 0.0}
          trend={kpis.pending_followups?.trend || 'neutral'}
          subtext="Scheduled customer actions"
          icon={Clock}
          onClick={() => navigate('/automation')}
        />
        <KPICard
          label="Sales Team Members"
          value={kpis.team_members?.value ?? '0'}
          change={0.0}
          trend="neutral"
          subtext="Active representatives"
          icon={Users}
          onClick={() => navigate('/users')}
        />
      </div>

      {/* Main Section 1: Sales Pipeline Funnel */}
      <SalesPipelineFunnel stages={pipelineStages} />

      {/* Main Section 2 & 3: Team Performance & Recent Priority Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance Table */}
        <div className="lg:col-span-2">
          {teamPerformance.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No recent team activity"
              description="Team activity will appear here when your team starts working."
            />
          ) : (
            <TeamPerformanceTable team={teamPerformance} />
          )}
        </div>

        {/* Quick Actions & Pipeline Tools */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] mb-1">Sales Management Actions</h3>
            <p className="text-xs text-[#666666] mb-4">Pipeline tools and representative assignments</p>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/leads?view=kanban')}
                className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                  <span className="font-semibold text-[#111111]">Open Sales Pipeline</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
              </button>

              <button
                onClick={() => navigate('/automation')}
                className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                  <span className="font-semibold text-[#111111]">Manage Follow-up Queue</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
              </button>

              <button
                onClick={() => navigate('/reports')}
                className="w-full p-2.5 rounded-md border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white transition flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-[#555555] group-hover:text-[#111111]" />
                  <span className="font-semibold text-[#111111]">Sales Conversion Reports</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
              </button>
            </div>
          </div>

          <div className="p-3 mt-4 rounded-md bg-[#F9FAFB] border border-[#E5E5E5]">
            <p className="text-[11px] font-semibold text-[#111111]">Sales Director Brief</p>
            <p className="text-[11px] text-[#666666] mt-0.5">
              Ensure all HOT classification leads receive outreach within 48 hours to maintain the 24%+ conversion pace.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Priority Leads Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#555555]" />
              Priority Leads Queue
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">Active opportunities with AI recommendations and assigned representatives</p>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
          >
            Manage All Leads
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLeads.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No leads in queue"
            description="Leads will appear here as they enter the pipeline."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#8A8A8A] font-medium">
                  <th className="pb-2.5 font-medium">Contact & Company</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium">Priority</th>
                  <th className="pb-2.5 font-medium">Assigned Representative</th>
                  <th className="pb-2.5 font-medium">Recommended Next Action</th>
                  <th className="pb-2.5 font-medium text-right">Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {recentLeads.map((ld) => (
                  <tr key={ld.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-3">
                      <p className="font-semibold text-[#111111]">{ld.contact_name}</p>
                      <p className="text-[11px] text-[#8A8A8A]">{ld.company}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
                        {ld.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {getPriorityBadge(ld.sales_priority)}
                    </td>
                    <td className="py-3 text-[#444444] font-medium">
                      {ld.assigned_name}
                    </td>
                    <td className="py-3 text-[#666666] max-w-xs truncate">
                      {ld.recommended_action}
                    </td>
                    <td className="py-3 text-right font-bold text-[#111111]">
                      ${(ld.deal_value || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
