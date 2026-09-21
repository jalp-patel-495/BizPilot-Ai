import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Bot,
  TrendingUp,
  ArrowRight,
  Mail,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
import { KPICard } from './components/KPICard';
import { EmployeeTasksCard } from './components/EmployeeTasksCard';
import { EmployeeLeadsCard } from './components/EmployeeLeadsCard';
import { EmptyState } from './components/EmptyState';
import api from '../../services/api';

export const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchEmployeeData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/analytics/employee-dashboard');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load Employee dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const handleTaskCompleted = (completedTaskId) => {
    if (data) {
      setData({
        ...data,
        my_tasks: data.my_tasks.filter((t) => t.id !== completedTaskId),
        kpis: {
          ...data.kpis,
          my_tasks: {
            ...data.kpis.my_tasks,
            value: `${Math.max(0, parseInt(data.kpis.my_tasks.value) - 1)}`,
          },
        },
      });
    }
  };

  const kpis = data?.kpis || {};
  const myTasks = data?.my_tasks || [];
  const myLeads = data?.my_leads || [];
  const upcomingFollowups = data?.upcoming_followups || [];
  const recentActivities = data?.recent_activity || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="My Workspace"
          subtitle="Manage your assigned work, tasks, leads, and daily activities."
          role="EMPLOYEE"
          onRefresh={fetchEmployeeData}
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
        title="My Workspace"
        subtitle="Manage your assigned work, tasks, leads, and daily activities."
        role="EMPLOYEE"
        onRefresh={fetchEmployeeData}
        refreshing={refreshing}
      />

      {/* 7 Employee-Specific "My" KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="My Leads"
          value={kpis.my_leads?.value ?? '0'}
          change={kpis.my_leads?.change ?? 0.0}
          trend={kpis.my_leads?.trend || 'neutral'}
          subtext={kpis.my_leads?.subtext || 'Active assigned accounts'}
          icon={Target}
          onClick={() => navigate('/leads')}
        />
        <KPICard
          label="My Customers"
          value={kpis.my_customers?.value ?? '0'}
          change={kpis.my_customers?.change ?? 0.0}
          trend={kpis.my_customers?.trend || 'neutral'}
          subtext={kpis.my_customers?.subtext || 'Direct client accounts'}
          icon={Users}
          onClick={() => navigate('/customers')}
        />
        <KPICard
          label="My Tasks"
          value={kpis.my_tasks?.value ?? '0'}
          change={kpis.my_tasks?.change ?? 0.0}
          trend={kpis.my_tasks?.trend || 'neutral'}
          subtext={kpis.my_tasks?.subtext || 'Pending action items'}
          icon={CheckCircle2}
          onClick={() => navigate('/automation')}
        />
        <KPICard
          label="Pending Follow-ups"
          value={kpis.pending_followups?.value ?? '0'}
          change={0.0}
          trend="neutral"
          subtext={kpis.pending_followups?.subtext || 'Scheduled client outreach'}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="My Sales"
          value={kpis.my_sales?.value ? (typeof kpis.my_sales.value === 'number' ? `Rs. ${kpis.my_sales.value.toLocaleString()}` : String(kpis.my_sales.value).replace(/\$/g, 'Rs. ')) : 'Rs. 0'}
          change={kpis.my_sales?.change ?? 0.0}
          trend={kpis.my_sales?.trend || 'neutral'}
          subtext={kpis.my_sales?.subtext || 'Closed deals revenue'}
          icon={IndianRupee}
          onClick={() => navigate('/sales')}
        />
        <KPICard
          label="Open Support Items"
          value={kpis.open_support?.value ?? '0'}
          change={kpis.open_support?.change ?? 0.0}
          trend={kpis.open_support?.trend || 'neutral'}
          subtext={kpis.open_support?.subtext || 'Assigned inquiries'}
          icon={Bot}
          onClick={() => navigate('/support')}
        />
        <KPICard
          label="Personal Win Rate"
          value={kpis.personal_performance?.value ?? '0%'}
          change={kpis.personal_performance?.change ?? 0.0}
          trend={kpis.personal_performance?.trend || 'neutral'}
          subtext={kpis.personal_performance?.subtext || 'Lead-to-win conversion'}
          icon={TrendingUp}
        />
      </div>

      {/* Main Employee Sections: My Tasks & My Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeTasksCard tasks={myTasks} onTaskCompleted={handleTaskCompleted} />
        <EmployeeLeadsCard leads={myLeads} />
      </div>

      {/* Bottom Section: Upcoming Follow-ups & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Follow-ups */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#555555]" />
                Upcoming Follow-ups
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">Scheduled customer touches with AI generated outreach suggestions</p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
            >
              Open Schedule
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingFollowups.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No upcoming follow-ups"
              description="You have no follow-ups scheduled at this time. Follow-up reminders will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingFollowups.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-md border border-[#EBEBEB] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-[#111111]">{item.contact_name}</span>
                      <span className="text-[#8A8A8A]">({item.company})</span>
                    </div>
                    {item.ai_message && (
                      <p className="text-[11px] text-[#555555] italic truncate">
                        "{item.ai_message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-medium text-[#666666] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#8A8A8A]" />
                      {item.follow_up_date ? new Date(item.follow_up_date).toLocaleDateString() : 'Next 48h'}
                    </span>
                    <button
                      onClick={() => navigate('/leads')}
                      className="px-2.5 py-1 rounded bg-white hover:bg-[#111111] hover:text-white border border-[#D9D9D9] text-xs font-medium transition"
                    >
                      Follow Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#555555]" />
              Recent Activity
            </h3>
            <p className="text-xs text-[#666666] mb-4">Latest client and ticket updates</p>

            {recentActivities.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No recent activity"
                description="Your recent actions and events will be tracked here."
              />
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="text-xs border-b border-[#F0F0F0] pb-2.5 last:border-b-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-[#111111]">{act.title}</span>
                      <span className="text-[10px] text-[#8A8A8A]">
                        {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666] line-clamp-1">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F0F0F0] mt-3">
            <button
              onClick={() => navigate('/support')}
              className="w-full py-1.5 text-center text-xs font-semibold text-[#111111] bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#E5E5E5] rounded-md transition"
            >
              Open Support Copilot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
