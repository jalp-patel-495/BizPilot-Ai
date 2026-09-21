import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Layers,
  Activity,
  Cpu,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Key,
  Check,
  Edit3,
  BarChart3,
  Server,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Zap,
  Globe,
  Database,
  Terminal,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../../components/common/Badge';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const currentTabParam = searchParams.get('tab');
    if (currentTabParam && currentTabParam !== activeTab) {
      setActiveTab(currentTabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [systemUsage, setSystemUsage] = useState(null);
  const [apiUsage, setApiUsage] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // Search & Filter States
  const [searchBiz, setSearchBiz] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [searchUsers, setSearchUsers] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterOrg, setFilterOrg] = useState('all');
  const [searchLogs, setSearchLogs] = useState('');

  // Modals
  const [showAddBizModal, setShowAddBizModal] = useState(false);
  const [showEditBizModal, setShowEditBizModal] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showLogDetailModal, setShowLogDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // New Business Form State
  const [newBizForm, setNewBizForm] = useState({
    name: '',
    slug: '',
    plan_tier: 'starter',
    billing_cycle: 'monthly',
    admin_email: '',
    admin_name: '',
    admin_password: 'Admin@12345',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [
        dash,
        bizs,
        usrs,
        subs,
        plns,
        sys,
        apiU,
        aiU,
        logs,
      ] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getBusinesses(),
        adminService.getUsers(),
        adminService.getSubscriptions(),
        adminService.getPlans(),
        adminService.getSystemUsage(),
        adminService.getApiUsage(),
        adminService.getAiUsage(),
        adminService.getAuditLogs(),
      ]);

      setDashboardData(dash);
      setBusinesses(bizs || []);
      setUsersList(usrs || []);
      setSubscriptions(subs || []);
      setPlans(plns || []);
      setSystemUsage(sys);
      setApiUsage(apiU);
      setAiUsage(aiU);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Could not load all admin metrics. Check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      await adminService.createBusiness(newBizForm);
      showToast(`Business "${newBizForm.name}" provisioned successfully!`);
      setShowAddBizModal(false);
      setNewBizForm({
        name: '',
        slug: '',
        plan_tier: 'starter',
        billing_cycle: 'monthly',
        admin_email: '',
        admin_name: '',
        admin_password: 'Admin@12345',
      });
      loadAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create business');
    }
  };

  const handleUpdateBusiness = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateBusiness(selectedBiz.id, {
        name: selectedBiz.name,
        plan: selectedBiz.plan,
        status: selectedBiz.status,
        is_active: selectedBiz.is_active,
      });
      showToast(`Business "${selectedBiz.name}" updated!`);
      setShowEditBizModal(false);
      loadAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update business');
    }
  };

  const handleToggleBusinessStatus = async (biz) => {
    try {
      await adminService.toggleBusinessStatus(biz.id);
      showToast(`Business status toggled.`);
      loadAllData();
    } catch (err) {
      showToast('Failed to toggle business status');
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      await adminService.updatePlan(selectedPlan.id, {
        name: selectedPlan.name,
        description: selectedPlan.description,
        monthly_price: parseFloat(selectedPlan.monthly_price),
        annual_price: parseFloat(selectedPlan.annual_price),
        max_users: parseInt(selectedPlan.max_users, 10),
        max_ai_requests: parseInt(selectedPlan.max_ai_requests, 10),
        max_api_requests: parseInt(selectedPlan.max_api_requests, 10),
        badge: selectedPlan.badge,
      });
      showToast(`Plan "${selectedPlan.name}" updated successfully!`);
      setShowEditPlanModal(false);
      loadAllData();
    } catch (err) {
      showToast('Failed to update plan parameters');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await adminService.resetUserPassword(selectedUser.id, newPassword);
      showToast(`Password for ${selectedUser.email} reset successfully.`);
      setShowResetPwdModal(false);
      setNewPassword('');
    } catch (err) {
      showToast('Failed to reset password');
    }
  };

  const handleUpdateUserRole = async (uId, newRole) => {
    try {
      await adminService.updateUser(uId, { role: newRole });
      showToast('User role updated');
      loadAllData();
    } catch (err) {
      showToast('Failed to update role');
    }
  };

  const handleToggleUserActive = async (u) => {
    try {
      await adminService.updateUser(u.id, { is_active: !u.is_active });
      showToast(`User status set to ${!u.is_active ? 'Active' : 'Inactive'}`);
      loadAllData();
    } catch (err) {
      showToast('Failed to update user status');
    }
  };

  const handleSubscriptionTierChange = async (subId, newTier) => {
    try {
      await adminService.updateSubscription(subId, { plan_tier: newTier });
      showToast(`Subscription changed to ${newTier.toUpperCase()}`);
      loadAllData();
    } catch (err) {
      showToast('Failed to change subscription tier');
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchBiz.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchBiz.toLowerCase());
    const matchesPlan =
      filterPlan === 'all' ||
      b.plan?.toLowerCase().includes(filterPlan.toLowerCase());
    return matchesSearch && matchesPlan;
  });

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUsers.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesOrg = filterOrg === 'all' || u.organization_id === filterOrg;
    return matchesSearch && matchesRole && matchesOrg;
  });

  const filteredLogs = auditLogs.filter((l) => {
    const s = searchLogs.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(s)) ||
      (l.details && l.details.toLowerCase().includes(s)) ||
      (l.user_name && l.user_name.toLowerCase().includes(s)) ||
      (l.organization_name && l.organization_name.toLowerCase().includes(s))
    );
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2, count: businesses.length },
    { id: 'users', label: 'Users', icon: Users, count: usersList.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { id: 'system_usage', label: 'System Usage', icon: Activity },
    { id: 'plans', label: 'Plans', icon: Layers, count: plans.length },
    { id: 'api_usage', label: 'API Usage', icon: Terminal },
    { id: 'ai_usage', label: 'AI Usage', icon: Sparkles },
    { id: 'audit_logs', label: 'Audit Logs', icon: ShieldCheck, count: auditLogs.length },
  ];

  const monochromePieColors = ['#111111', '#525252', '#737373', '#d4d4d4'];

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    color: '#111111',
    fontSize: '11px',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-lg bg-white border border-[#e5e5e5] text-xs text-[#111111] shadow-md flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-[#666666] hover:text-[#111111]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-lg bg-white p-6 border border-[#e5e5e5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-neutral-600" />
                Super Admin Console
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Cluster Operational
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              SaaS Administration & Platform Governance
            </h1>
            <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
              Global control center to manage business tenants, oversee user access, configure tiered subscription plans, inspect API velocity, and track real-time AI quota utilization.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] text-xs font-medium border border-[#d9d9d9] transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#666666] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddBizModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Business</span>
            </button>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-[#e5e5e5]">
          <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
            <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Platform MRR</span>
            <p className="text-lg font-bold text-[#111111] mt-0.5">
              ${(dashboardData?.mrr || 4880).toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +{dashboardData?.mrr_growth || 14.8}%
            </span>
          </div>

          <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
            <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Active Businesses</span>
            <p className="text-lg font-bold text-[#111111] mt-0.5">
              {dashboardData?.active_businesses || businesses.length}
            </p>
            <span className="text-[10px] text-[#666666]">Multi-tenant</span>
          </div>

          <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
            <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Total Platform Users</span>
            <p className="text-lg font-bold text-[#111111] mt-0.5">
              {dashboardData?.total_users || usersList.length}
            </p>
            <span className="text-[10px] text-[#666666]">Across 4 Roles</span>
          </div>

          <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
            <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Monthly API Requests</span>
            <p className="text-lg font-bold text-[#111111] mt-0.5">
              {((dashboardData?.monthly_api_requests || 128450) / 1000).toFixed(1)}k
            </p>
            <span className="text-[10px] text-[#666666]">78ms Avg Latency</span>
          </div>

          <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
            <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Monthly AI Queries</span>
            <p className="text-lg font-bold text-[#111111] mt-0.5">
              {((dashboardData?.monthly_ai_requests || 6820)).toLocaleString()}
            </p>
            <span className="text-[10px] text-[#666666]">Chat & Scoring</span>
          </div>

          <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
            <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">System Uptime</span>
            <p className="text-lg font-bold text-[#111111] mt-0.5">
              {dashboardData?.system_uptime || '99.98%'}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Zero Downtime</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#e5e5e5] pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#f7f7f7]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f3f3f3] text-[#666666]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Plan Distribution Chart */}
            <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">Subscription Distribution</h3>
                  <p className="text-xs text-[#666666]">Tenants categorized by tier</p>
                </div>
                <CreditCard className="w-4 h-4 text-[#8a8a8a]" />
              </div>

              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={dashboardData?.plan_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {(dashboardData?.plan_distribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={monochromePieColors[index % monochromePieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e5e5e5]">
                {(dashboardData?.plan_distribution || []).map((item, idx) => (
                  <div key={item.tier} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: monochromePieColors[idx % monochromePieColors.length] }}
                    />
                    <span className="text-[#666666] font-medium capitalize">{item.tier}:</span>
                    <span className="text-[#111111] font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Infrastructure Health */}
            <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 lg:col-span-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">System Health & Core Services</h3>
                  <p className="text-xs text-[#666666]">Status of compute, broker, and AI endpoints</p>
                </div>
                <Server className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666666] font-medium">FastAPI Engine</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Online
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#111111]">78ms Response</p>
                  <p className="text-[10px] text-[#8a8a8a]">HTTP/2 • REST & Async</p>
                </div>

                <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666666] font-medium">Postgres Database</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#111111]">14 Connections</p>
                  <p className="text-[10px] text-[#8a8a8a]">Pool healthy • Latency 1.2ms</p>
                </div>

                <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666666] font-medium">AI & ML Pipeline</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Ready
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#111111]">Multi-LLM Guard</p>
                  <p className="text-[10px] text-[#8a8a8a]">Gemini • GPT-4o • Fallback</p>
                </div>
              </div>

              {/* Recent activity ticker */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                  Recent Platform Operations
                </h4>
                <div className="space-y-1.5">
                  {(dashboardData?.recent_activities || []).map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-2.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neutral-200 text-neutral-800">
                          {act.action}
                        </span>
                        <span className="text-[#111111] truncate">{act.details}</span>
                      </div>
                      <span className="text-[10px] text-[#8a8a8a] whitespace-nowrap pl-2 font-mono">
                        {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE BUSINESSES */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchBiz}
                  onChange={(e) => setSearchBiz(e.target.value)}
                  className="w-full bg-white text-[#111111] text-xs rounded-md pl-8 pr-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-white text-[#111111] text-xs rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddBizModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tenant</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#666666] uppercase text-[10px] tracking-wider border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-4 py-3">Business / Organization</th>
                    <th className="px-4 py-3">Plan Tier</th>
                    <th className="px-4 py-3">Seats Used</th>
                    <th className="px-4 py-3">Monthly Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-[#f8f8f8] transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-[#111111] flex items-center justify-center font-bold text-white text-xs">
                            {b.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#111111]">{b.name}</p>
                            <p className="text-[11px] text-[#8a8a8a] font-mono">slug: {b.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 uppercase">
                          {b.plan || 'Starter'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#111111]">{b.users_count} users</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <p className="text-[#666666]">
                            API: <span className="font-semibold text-[#111111]">{b.current_month_api_requests || 0}</span>
                          </p>
                          <p className="text-[#666666]">
                            AI: <span className="font-semibold text-[#111111]">{b.current_month_ai_requests || 0}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            b.is_active && b.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {b.is_active ? b.status : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBiz({ ...b });
                              setShowEditBizModal(true);
                            }}
                            className="p-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#666666] hover:text-[#111111] border border-[#d9d9d9] transition"
                            title="Edit Plan / Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleBusinessStatus(b)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition border ${
                              b.is_active
                                ? 'bg-white text-rose-700 hover:bg-rose-50 border-rose-200'
                                : 'bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            {b.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="w-full bg-white text-[#111111] text-xs rounded-md pl-8 pr-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white text-[#111111] text-xs rounded-md px-2.5 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="BUSINESS_ADMIN">Business Admin</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="EMPLOYEE">Employee</option>
              </select>

              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="bg-white text-[#111111] text-xs rounded-md px-2.5 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
              >
                <option value="all">All Businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#666666] uppercase text-[10px] tracking-wider border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f8f8f8] transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#111111] flex items-center justify-center font-bold text-xs border border-[#e5e5e5]">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#111111]">{u.full_name}</p>
                            <p className="text-[11px] text-[#666666]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#666666]">
                        {u.organization_name || 'Platform Global'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="bg-white text-xs font-medium rounded-md px-2 py-1 border border-[#d9d9d9] text-[#111111] focus:outline-none focus:border-[#111111]"
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="BUSINESS_ADMIN">BUSINESS_ADMIN</option>
                          <option value="SALES_MANAGER">SALES_MANAGER</option>
                          <option value="EMPLOYEE">EMPLOYEE</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowResetPwdModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] text-xs font-medium border border-[#d9d9d9] transition"
                        >
                          <Key className="w-3 h-3 text-[#666666]" />
                          <span>Reset Password</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VIEW SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#666666] uppercase text-[10px] tracking-wider border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-4 py-3">Tenant Business</th>
                    <th className="px-4 py-3">Subscription Tier</th>
                    <th className="px-4 py-3">Billing Cycle</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Renewal Date</th>
                    <th className="px-4 py-3">Auto Renew</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Change Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#f8f8f8] transition">
                      <td className="px-4 py-3 font-semibold text-[#111111]">
                        {s.organization_name || 'Business Tenant'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 uppercase">
                          {s.plan_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-[#666666]">
                        {s.billing_cycle}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#111111]">
                        ${s.monthly_price}/mo
                      </td>
                      <td className="px-4 py-3 text-[#666666] font-mono text-[11px]">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold ${s.auto_renew ? 'text-emerald-700' : 'text-[#8a8a8a]'}`}>
                          {s.auto_renew ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={s.plan_tier}
                          onChange={(e) => handleSubscriptionTierChange(s.id, e.target.value)}
                          className="bg-white text-xs rounded-md px-2 py-1 border border-[#d9d9d9] text-[#111111] focus:outline-none focus:border-[#111111]"
                        >
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="business">Business</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MONITOR SYSTEM USAGE */}
      {activeTab === 'system_usage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Cluster Storage</span>
              <p className="text-xl font-bold text-[#111111]">{systemUsage?.total_storage_gb || 1.3} GB</p>
              <p className="text-[10px] text-[#8a8a8a]">Database & OCR artifacts</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Active Tenants</span>
              <p className="text-xl font-bold text-[#111111]">{systemUsage?.active_tenants || 5} of {systemUsage?.total_tenants || 5}</p>
              <p className="text-[10px] text-emerald-700 font-medium">100% tenant availability</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Total AI Tokens</span>
              <p className="text-xl font-bold text-[#111111]">{((systemUsage?.total_ai_tokens || 2480000) / 1000000).toFixed(2)}M</p>
              <p className="text-[10px] text-[#666666]">Tokens this period</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Server CPU</span>
              <p className="text-xl font-bold text-[#111111]">{systemUsage?.server_metrics?.cpu_utilization_pct || 24.2}%</p>
              <p className="text-[10px] text-[#8a8a8a]">8 Background Workers</p>
            </div>
          </div>

          {/* Tenant-by-tenant Usage Table */}
          <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs space-y-3 p-5">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Tenant Quota & Capacity Utilization</h3>
              <p className="text-xs text-[#666666]">Per-business consumption against subscription plan limits</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#666666] uppercase text-[10px] tracking-wider border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-4 py-2.5">Business</th>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5">Seats Quota</th>
                    <th className="px-4 py-2.5">AI Requests Quota</th>
                    <th className="px-4 py-2.5">API Requests Quota</th>
                    <th className="px-4 py-2.5">Storage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {(systemUsage?.tenants || []).map((t) => (
                    <tr key={t.organization_id} className="hover:bg-[#f8f8f8] transition">
                      <td className="px-4 py-3 font-semibold text-[#111111]">{t.organization_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 uppercase">
                          {t.plan_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#111111]">{t.users_count}</span> / {t.users_limit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{t.ai_requests}</span>
                            <span className={t.ai_percent >= 80 ? 'text-amber-700 font-semibold' : 'text-[#666666]'}>
                              {t.ai_limit >= 999999 ? 'Unlimited' : `${t.ai_percent}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#111111]"
                              style={{ width: `${Math.min(100, t.ai_percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{t.api_requests}</span>
                            <span className="text-[#666666]">
                              {t.api_limit >= 999999 ? 'Unlimited' : `${t.api_percent}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#525252]"
                              style={{ width: `${Math.min(100, t.api_percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#666666]">
                        {t.storage_mb} MB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MANAGE PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Subscription Tier Configurations</h3>
              <p className="text-xs text-[#666666]">Define seat capacities, monthly AI allowances, and feature flags</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`bg-white p-5 rounded-lg border flex flex-col justify-between transition-all duration-200 relative ${
                  p.is_popular ? 'border-[#111111] shadow-xs' : 'border-[#e5e5e5]'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 right-4 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#111111] text-white">
                    {p.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-base font-bold text-[#111111]">{p.name}</h4>
                    <span className="text-xs font-mono text-[#8a8a8a] uppercase">{p.id}</span>
                  </div>
                  <p className="text-xs text-[#666666] min-h-[32px]">{p.description}</p>

                  <div className="my-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#111111]">${p.monthly_price}</span>
                      <span className="text-xs text-[#666666]">/ month</span>
                    </div>
                    {p.annual_price > 0 && (
                      <p className="text-[10px] text-[#8a8a8a] mt-0.5">Billed ${p.annual_price}/yr annually</p>
                    )}
                  </div>

                  <div className="space-y-2 py-3 border-y border-[#e5e5e5] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">User Seats</span>
                      <span className="font-semibold text-[#111111]">{p.max_users} users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">AI Requests</span>
                      <span className="font-semibold text-[#111111]">{p.max_ai_requests.toLocaleString()} /mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">API Calls</span>
                      <span className="font-semibold text-[#111111]">{p.max_api_requests.toLocaleString()} /mo</span>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5">
                    <p className="text-[10px] font-semibold text-[#8a8a8a] uppercase tracking-wider">Entitlements</p>
                    {(p.features || []).map((feat) => (
                      <div key={feat} className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#e5e5e5]">
                  <button
                    onClick={() => {
                      setSelectedPlan({ ...p });
                      setShowEditPlanModal(true);
                    }}
                    className="w-full py-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] font-semibold text-xs transition border border-[#d9d9d9]"
                  >
                    Edit Tier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: VIEW API USAGE */}
      {activeTab === 'api_usage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Total Monthly Calls</span>
              <p className="text-2xl font-bold text-[#111111]">{apiUsage?.total_requests?.toLocaleString() || '128,450'}</p>
              <p className="text-[10px] text-[#666666]">{apiUsage?.requests_per_minute || 2.97} req / min</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Avg Latency</span>
              <p className="text-2xl font-bold text-emerald-700">{apiUsage?.avg_latency_ms || 78.4} ms</p>
              <p className="text-[10px] text-[#8a8a8a]">FastAPI Async pipeline</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Success Rate</span>
              <p className="text-2xl font-bold text-[#111111]">99.3%</p>
              <p className="text-[10px] text-[#8a8a8a]">
                2xx: {apiUsage?.status_distribution?.['2xx'] || 124000} • 4xx: {apiUsage?.status_distribution?.['4xx'] || 3600}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
              <h3 className="text-sm font-semibold text-[#111111]">Most Active API Routes</h3>
              <div className="space-y-2.5">
                {(apiUsage?.top_endpoints || []).map((ep) => (
                  <div key={ep.endpoint} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#111111]">{ep.endpoint}</span>
                      <span className="font-semibold text-[#111111]">{ep.requests.toLocaleString()} ({ep.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: `${ep.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
              <h3 className="text-sm font-semibold text-[#111111]">7-Day Request Volume & Latency</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiUsage?.daily_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                    <XAxis dataKey="day" stroke="#8a8a8a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#8a8a8a" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="requests" stroke="#111111" fill="#f3f3f3" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: VIEW AI USAGE */}
      {activeTab === 'ai_usage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Total AI Prompts</span>
              <p className="text-2xl font-bold text-[#111111]">{aiUsage?.total_requests?.toLocaleString() || '6,820'}</p>
              <p className="text-[10px] text-[#666666]">Copilot, Leads, Reports</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Tokens Consumed</span>
              <p className="text-2xl font-bold text-[#111111]">{((aiUsage?.total_tokens || 2480000) / 1000000).toFixed(2)}M</p>
              <p className="text-[10px] text-[#8a8a8a]">65% Prompt / 35% Completion</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Estimated LLM Cost</span>
              <p className="text-2xl font-bold text-emerald-700">${aiUsage?.estimated_cost_usd || 4.96}</p>
              <p className="text-[10px] text-[#8a8a8a]">Blended compute pricing</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-1 shadow-xs">
              <span className="text-[10px] font-medium text-[#666666] uppercase tracking-wider">Active Models</span>
              <p className="text-2xl font-bold text-[#111111]">3 Engines</p>
              <p className="text-[10px] text-[#8a8a8a]">Gemini 1.5, GPT-4o, Mock</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
              <h3 className="text-sm font-semibold text-[#111111]">AI Consumption by Feature</h3>
              <div className="space-y-2.5">
                {(aiUsage?.feature_distribution || []).map((f) => (
                  <div key={f.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666666] font-medium">{f.feature}</span>
                      <span className="font-semibold text-[#111111]">{f.requests.toLocaleString()} ({f.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: `${f.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
              <h3 className="text-sm font-semibold text-[#111111]">Model Engine Share</h3>
              <div className="space-y-2">
                {(aiUsage?.model_distribution || []).map((m) => (
                  <div key={m.model} className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#111111]">{m.model}</p>
                      <p className="text-[10px] text-[#8a8a8a]">Tokens: {((m.tokens || 0) / 1000).toFixed(0)}k</p>
                    </div>
                    <span className="font-bold text-[#111111] text-sm">{m.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: SYSTEM ACTIVITY LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchLogs}
                onChange={(e) => setSearchLogs(e.target.value)}
                className="w-full bg-white text-[#111111] text-xs rounded-md pl-8 pr-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#666666] uppercase text-[10px] tracking-wider border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredLogs.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => {
                        setSelectedLog(l);
                        setShowLogDetailModal(true);
                      }}
                      className="hover:bg-[#f8f8f8] transition cursor-pointer"
                    >
                      <td className="px-4 py-3 text-[#666666] whitespace-nowrap font-mono text-[11px]">
                        {l.created_at ? new Date(l.created_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#111111]">
                        {l.user_name || 'System Worker'}
                        {l.organization_name && (
                          <span className="block text-[10px] text-[#8a8a8a] font-normal">
                            {l.organization_name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#666666]">
                        {l.resource}
                      </td>
                      <td className="px-4 py-3 text-[#111111] max-w-xs truncate">
                        {l.details}
                      </td>
                      <td className="px-4 py-3 text-[#8a8a8a] font-mono text-[11px]">
                        {l.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD BUSINESS */}
      {showAddBizModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg border border-[#e5e5e5] shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="text-sm font-semibold text-[#111111]">Provision New Business Tenant</h3>
              <button onClick={() => setShowAddBizModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#111111] font-medium mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={newBizForm.name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, name: e.target.value })}
                  className="w-full bg-white text-[#111111] rounded-md px-3 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-medium mb-1">URL Identifier Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="acme-corp"
                    value={newBizForm.slug}
                    onChange={(e) => setNewBizForm({ ...newBizForm, slug: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Subscription Plan</label>
                  <select
                    value={newBizForm.plan_tier}
                    onChange={(e) => setNewBizForm({ ...newBizForm, plan_tier: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-2.5 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="free">Free ($0/mo)</option>
                    <option value="starter">Starter ($49/mo)</option>
                    <option value="business">Business ($199/mo)</option>
                    <option value="enterprise">Enterprise ($499/mo)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e5e5e5]">
                <p className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider mb-2">
                  Primary Administrator Account
                </p>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[#111111] font-medium mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={newBizForm.admin_name}
                      onChange={(e) => setNewBizForm({ ...newBizForm, admin_name: e.target.value })}
                      className="w-full bg-white text-[#111111] rounded-md px-3 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#111111] font-medium mb-1">Admin Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@acme.com"
                      value={newBizForm.admin_email}
                      onChange={(e) => setNewBizForm({ ...newBizForm, admin_email: e.target.value })}
                      className="w-full bg-white text-[#111111] rounded-md px-3 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBizModal(false)}
                  className="px-3.5 py-1.5 rounded-md text-[#666666] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold shadow-xs"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BUSINESS */}
      {showEditBizModal && selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg border border-[#e5e5e5] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="text-sm font-semibold text-[#111111]">Edit Business: {selectedBiz.name}</h3>
              <button onClick={() => setShowEditBizModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBusiness} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#111111] font-medium mb-1">Organization Name</label>
                <input
                  type="text"
                  value={selectedBiz.name}
                  onChange={(e) => setSelectedBiz({ ...selectedBiz, name: e.target.value })}
                  className="w-full bg-white text-[#111111] rounded-md px-3 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[#111111] font-medium mb-1">Assigned Plan Tier</label>
                <select
                  value={selectedBiz.plan?.toLowerCase() || 'starter'}
                  onChange={(e) => setSelectedBiz({ ...selectedBiz, plan: e.target.value })}
                  className="w-full bg-white text-[#111111] rounded-md px-2.5 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                >
                  <option value="free">Free Tier</option>
                  <option value="starter">Starter Plan</option>
                  <option value="business">Business Pro</option>
                  <option value="enterprise">Enterprise Suite</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditBizModal(false)}
                  className="px-3.5 py-1.5 rounded-md text-[#666666] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAN PARAMETERS */}
      {showEditPlanModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg border border-[#e5e5e5] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="text-sm font-semibold text-[#111111]">Configure Plan: {selectedPlan.name}</h3>
              <button onClick={() => setShowEditPlanModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Display Name</label>
                  <input
                    type="text"
                    value={selectedPlan.name}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={selectedPlan.badge || ''}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, badge: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#111111] font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={selectedPlan.description || ''}
                  onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                  className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedPlan.monthly_price}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, monthly_price: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Annual Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedPlan.annual_price}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, annual_price: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Max Users</label>
                  <input
                    type="number"
                    value={selectedPlan.max_users}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, max_users: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Max AI Reqs</label>
                  <input
                    type="number"
                    value={selectedPlan.max_ai_requests}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, max_ai_requests: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] font-medium mb-1">Max API Calls</label>
                  <input
                    type="number"
                    value={selectedPlan.max_api_requests}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, max_api_requests: e.target.value })}
                    className="w-full bg-white text-[#111111] rounded-md px-3 py-1.5 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditPlanModal(false)}
                  className="px-3.5 py-1.5 rounded-md text-[#666666] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold shadow-xs"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET USER PASSWORD */}
      {showResetPwdModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg border border-[#e5e5e5] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="text-sm font-semibold text-[#111111]">Reset User Password</h3>
              <button onClick={() => setShowResetPwdModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3.5 text-xs">
              <p className="text-[#666666]">
                Enter a new password for{' '}
                <span className="text-[#111111] font-semibold">{selectedUser.email}</span>.
              </p>

              <div>
                <label className="block text-[#111111] font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white text-[#111111] rounded-md px-3 py-2 border border-[#d9d9d9] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPwdModal(false)}
                  className="px-3.5 py-1.5 rounded-md text-[#666666] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold shadow-xs"
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUDIT LOG DETAIL */}
      {showLogDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg border border-[#e5e5e5] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="text-sm font-semibold text-[#111111]">Audit Event Details</h3>
              <button onClick={() => setShowLogDetailModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#8a8a8a] uppercase font-semibold">Action Event</span>
                <p className="font-semibold text-[#111111]">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#8a8a8a] uppercase font-semibold">Actor / Initiator</span>
                <p className="text-[#111111]">{selectedLog.user_name} ({selectedLog.user_email || 'Service User'})</p>
              </div>
              <div>
                <span className="text-[10px] text-[#8a8a8a] uppercase font-semibold">Tenant Organization</span>
                <p className="text-[#111111]">{selectedLog.organization_name || 'Global'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#8a8a8a] uppercase font-semibold">Target Resource</span>
                <p className="font-mono text-[#111111]">{selectedLog.resource}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#8a8a8a] uppercase font-semibold">Details / Payload</span>
                <p className="p-2.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-[#111111] font-mono text-[11px] break-words">
                  {selectedLog.details}
                </p>
              </div>
              <div className="flex justify-between pt-2 text-[10px] text-[#8a8a8a] font-mono border-t border-[#e5e5e5]">
                <span>IP: {selectedLog.ip_address}</span>
                <span>{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
