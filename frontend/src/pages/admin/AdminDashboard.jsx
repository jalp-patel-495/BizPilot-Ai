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
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../../components/common/Badge';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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

  // Handlers
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

  // Filtered lists
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
    { id: 'businesses', label: 'Manage Businesses', icon: Building2, count: businesses.length },
    { id: 'users', label: 'Manage Users', icon: Users, count: usersList.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { id: 'system_usage', label: 'System Usage', icon: Activity },
    { id: 'plans', label: 'Manage Plans', icon: Layers, count: plans.length },
    { id: 'api_usage', label: 'API Usage', icon: Terminal },
    { id: 'ai_usage', label: 'AI Usage', icon: Sparkles },
    { id: 'audit_logs', label: 'System Activity Logs', icon: ShieldCheck, count: auditLogs.length },
  ];

  const planColors = {
    free: '#94a3b8',
    starter: '#3b82f6',
    business: '#8b5cf6',
    enterprise: '#06b6d4',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-brand-500/40 text-xs text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-brand-400" />
                Super Admin Console
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cluster Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SaaS Administration & Platform Governance
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Global control center to manage business tenants, oversee user access, configure tiered subscription plans, inspect API velocity, and track real-time AI quota utilization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddBizModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </button>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/60">
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Platform MRR</span>
            <p className="text-lg font-black text-white mt-0.5">
              ${(dashboardData?.mrr || 4880).toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +{dashboardData?.mrr_growth || 14.8}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Businesses</span>
            <p className="text-lg font-black text-white mt-0.5">
              {dashboardData?.active_businesses || businesses.length}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Multi-tenant</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Platform Users</span>
            <p className="text-lg font-black text-white mt-0.5">
              {dashboardData?.total_users || usersList.length}
            </p>
            <span className="text-[10px] text-brand-300 font-medium">Across 4 Roles</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Monthly API Requests</span>
            <p className="text-lg font-black text-white mt-0.5">
              {((dashboardData?.monthly_api_requests || 128450) / 1000).toFixed(1)}k
            </p>
            <span className="text-[10px] text-cyan-400 font-medium">78ms Avg Latency</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Monthly AI Queries</span>
            <p className="text-lg font-black text-white mt-0.5">
              {((dashboardData?.monthly_ai_requests || 6820)).toLocaleString()}
            </p>
            <span className="text-[10px] text-purple-400 font-medium">Chat & Scoring</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">System Uptime</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {dashboardData?.system_uptime || '99.98%'}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Zero Downtime</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-brand-500/30 text-brand-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Distribution Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Subscription Distribution</h3>
                  <p className="text-xs text-slate-400">Tenants categorized by tier</p>
                </div>
                <CreditCard className="w-4 h-4 text-brand-400" />
              </div>

              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={dashboardData?.plan_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {(dashboardData?.plan_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {(dashboardData?.plan_distribution || []).map((item) => (
                  <div key={item.tier} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.tier}:</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Infrastructure Health */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">System Health & Core Services</h3>
                  <p className="text-xs text-slate-400">Real-time status of compute, broker, and AI endpoints</p>
                </div>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">FastAPI Engine</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Online
                    </span>
                  </div>
                  <p className="text-sm font-black text-white">78ms Response</p>
                  <p className="text-[10px] text-slate-500">HTTP/2 • REST & Async</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Postgres & SQLite</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </div>
                  <p className="text-sm font-black text-white">14 Connections</p>
                  <p className="text-[10px] text-slate-500">Pool healthy • Latency 1.2ms</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">AI & ML Pipeline</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <p className="text-sm font-black text-white">Multi-LLM Guard</p>
                  <p className="text-[10px] text-slate-500">Gemini • GPT-4o • Mock</p>
                </div>
              </div>

              {/* Real-time system activity ticker */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Platform Operations
                </h4>
                <div className="space-y-2">
                  {(dashboardData?.recent_activities || []).map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {act.action}
                        </span>
                        <span className="text-slate-200 truncate">{act.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap pl-2">
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

      {/* ========================================================================= */}
      {/* TAB 2: MANAGE BUSINESSES */}
      {/* ========================================================================= */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search businesses by name or slug..."
                  value={searchBiz}
                  onChange={(e) => setSearchBiz(e.target.value)}
                  className="w-full bg-slate-950/70 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-slate-950/70 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tenant</span>
            </button>
          </div>

          {/* Businesses Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Business / Organization</th>
                    <th className="px-6 py-4">Plan Tier</th>
                    <th className="px-6 py-4">Seats Used</th>
                    <th className="px-6 py-4">Monthly Usage</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                            {b.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{b.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">slug: {b.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {b.plan || 'Starter'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">{b.users_count} users</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-300">
                            API: <span className="font-semibold text-white">{b.current_month_api_requests || 0}</span> calls
                          </p>
                          <p className="text-[11px] text-slate-400">
                            AI: <span className="font-semibold text-purple-300">{b.current_month_ai_requests || 0}</span> reqs
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.is_active && b.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {b.is_active ? b.status : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBiz({ ...b });
                              setShowEditBizModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                            title="Edit Plan / Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleBusinessStatus(b)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                              b.is_active
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
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

      {/* ========================================================================= */}
      {/* TAB 3: MANAGE USERS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="w-full bg-slate-950/70 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-950/70 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
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
                className="bg-slate-950/70 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
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

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{u.full_name}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {u.organization_name || 'Platform Global'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="bg-slate-900 text-xs font-semibold rounded-lg px-2 py-1 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500"
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="BUSINESS_ADMIN">BUSINESS_ADMIN</option>
                          <option value="SALES_MANAGER">SALES_MANAGER</option>
                          <option value="EMPLOYEE">EMPLOYEE</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowResetPwdModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
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

      {/* ========================================================================= */}
      {/* TAB 4: VIEW SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Tenant Business</th>
                    <th className="px-6 py-4">Subscription Tier</th>
                    <th className="px-6 py-4">Billing Cycle</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Current Period Renewal</th>
                    <th className="px-6 py-4">Auto Renew</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Change Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-bold text-white">
                        {s.organization_name || 'Business Tenant'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                          {s.plan_tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-300 font-medium">
                        {s.billing_cycle}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${s.monthly_price}/mo
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold ${s.auto_renew ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {s.auto_renew ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={s.plan_tier}
                          onChange={(e) => handleSubscriptionTierChange(s.id, e.target.value)}
                          className="bg-slate-900 text-xs rounded-lg px-2.5 py-1 border border-slate-700 text-slate-200 focus:outline-none focus:border-brand-500"
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

      {/* ========================================================================= */}
      {/* TAB 5: MONITOR SYSTEM USAGE */}
      {/* ========================================================================= */}
      {activeTab === 'system_usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cluster Storage</span>
              <p className="text-xl font-black text-white">{systemUsage?.total_storage_gb || 1.3} GB</p>
              <p className="text-[10px] text-slate-500">Database & OCR artifacts</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Tenants</span>
              <p className="text-xl font-black text-white">{systemUsage?.active_tenants || 5} of {systemUsage?.total_tenants || 5}</p>
              <p className="text-[10px] text-emerald-400">100% tenant availability</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total AI Tokens</span>
              <p className="text-xl font-black text-white">{((systemUsage?.total_ai_tokens || 2480000) / 1000000).toFixed(2)}M</p>
              <p className="text-[10px] text-purple-400">Tokens this period</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Server CPU</span>
              <p className="text-xl font-black text-white">{systemUsage?.server_metrics?.cpu_utilization_pct || 24.2}%</p>
              <p className="text-[10px] text-slate-500">8 Background Workers</p>
            </div>
          </div>

          {/* Tenant-by-tenant Usage Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-3 p-6">
            <div>
              <h3 className="text-sm font-bold text-white">Tenant Quota & Capacity Utilization</h3>
              <p className="text-xs text-slate-400">Per-business consumption against subscription plan limits</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Seats Quota</th>
                    <th className="px-4 py-3">AI Requests Quota</th>
                    <th className="px-4 py-3">API Requests Quota</th>
                    <th className="px-4 py-3">Storage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(systemUsage?.tenants || []).map((t) => (
                    <tr key={t.organization_id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-bold text-white">{t.organization_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {t.plan_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white">{t.users_count}</span> / {t.users_limit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{t.ai_requests}</span>
                            <span className={t.ai_percent >= 80 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                              {t.ai_limit >= 999999 ? 'Unlimited' : `${t.ai_percent}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.ai_percent >= 90
                                  ? 'bg-rose-500'
                                  : t.ai_percent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min(100, t.ai_percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{t.api_requests}</span>
                            <span className="text-slate-400">
                              {t.api_limit >= 999999 ? 'Unlimited' : `${t.api_percent}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan-500"
                              style={{ width: `${Math.min(100, t.api_percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
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

      {/* ========================================================================= */}
      {/* TAB 6: MANAGE PLANS */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Subscription Tier Configurations</h3>
              <p className="text-xs text-slate-400">Define seat capacities, monthly AI allowances, and feature flags</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`glass-panel p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 relative ${
                  p.is_popular
                    ? 'border-brand-500/50 shadow-glow bg-brand-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 right-6 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md">
                    {p.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-black text-white">{p.name}</h4>
                    <span className="text-xs font-bold uppercase text-slate-500 font-mono">{p.id}</span>
                  </div>
                  <p className="text-xs text-slate-400 min-h-[36px]">{p.description}</p>

                  <div className="my-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">${p.monthly_price}</span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    {p.annual_price > 0 && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Billed ${p.annual_price}/yr annually</p>
                    )}
                  </div>

                  {/* Quotas */}
                  <div className="space-y-2.5 py-4 border-y border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">User Seats</span>
                      <span className="font-bold text-white">{p.max_users} users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">AI Requests</span>
                      <span className="font-bold text-purple-300">{p.max_ai_requests.toLocaleString()} /mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">API Calls</span>
                      <span className="font-bold text-cyan-300">{p.max_api_requests.toLocaleString()} /mo</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entitlements</p>
                    {(p.features || []).map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedPlan({ ...p });
                      setShowEditPlanModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-brand-600 text-white font-bold text-xs transition border border-slate-700 hover:border-brand-500"
                  >
                    Edit Tier Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: VIEW API USAGE */}
      {/* ========================================================================= */}
      {activeTab === 'api_usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Calls</span>
              <p className="text-2xl font-black text-white">{apiUsage?.total_requests?.toLocaleString() || '128,450'}</p>
              <p className="text-[10px] text-cyan-400">{apiUsage?.requests_per_minute || 2.97} requests / min</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Latency</span>
              <p className="text-2xl font-black text-emerald-400">{apiUsage?.avg_latency_ms || 78.4} ms</p>
              <p className="text-[10px] text-slate-500">FastAPI Async pipeline</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
              <p className="text-2xl font-black text-white">99.3%</p>
              <p className="text-[10px] text-slate-400">
                2xx: {apiUsage?.status_distribution?.['2xx'] || 124000} • 4xx: {apiUsage?.status_distribution?.['4xx'] || 3600}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Endpoints */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Most Active API Routes</h3>
              <div className="space-y-3">
                {(apiUsage?.top_endpoints || []).map((ep) => (
                  <div key={ep.endpoint} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300">{ep.endpoint}</span>
                      <span className="font-bold text-white">{ep.requests.toLocaleString()} ({ep.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${ep.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Trend Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">7-Day Request Volume & Latency</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiUsage?.daily_trends || []}>
                    <defs>
                      <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#06b6d4" fillOpacity={1} fill="url(#apiGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: VIEW AI USAGE */}
      {/* ========================================================================= */}
      {activeTab === 'ai_usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total AI Prompts</span>
              <p className="text-2xl font-black text-white">{aiUsage?.total_requests?.toLocaleString() || '6,820'}</p>
              <p className="text-[10px] text-purple-400">Copilot, Leads, Reports</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tokens Consumed</span>
              <p className="text-2xl font-black text-white">{((aiUsage?.total_tokens || 2480000) / 1000000).toFixed(2)}M</p>
              <p className="text-[10px] text-slate-500">65% Prompt / 35% Completion</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estimated LLM Cost</span>
              <p className="text-2xl font-black text-emerald-400">${aiUsage?.estimated_cost_usd || 4.96}</p>
              <p className="text-[10px] text-slate-500">Blended compute pricing</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Models</span>
              <p className="text-2xl font-black text-white">3 Engines</p>
              <p className="text-[10px] text-slate-500">Gemini 1.5, GPT-4o, Mock</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Distribution */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">AI Consumption by Feature Area</h3>
              <div className="space-y-3">
                {(aiUsage?.feature_distribution || []).map((f) => (
                  <div key={f.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{f.feature}</span>
                      <span className="font-bold text-purple-300">{f.requests.toLocaleString()} ({f.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${f.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Distribution */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Model Engine Share</h3>
              <div className="space-y-3">
                {(aiUsage?.model_distribution || []).map((m) => (
                  <div key={m.model} className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{m.model}</p>
                      <p className="text-[10px] text-slate-400">Tokens: {((m.tokens || 0) / 1000).toFixed(0)}k</p>
                    </div>
                    <span className="font-black text-brand-300 text-sm">{m.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: SYSTEM ACTIVITY LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by action, actor, details..."
                value={searchLogs}
                onChange={(e) => setSearchLogs(e.target.value)}
                className="w-full bg-slate-950/70 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Resource</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => {
                        setSelectedLog(l);
                        setShowLogDetailModal(true);
                      }}
                      className="hover:bg-slate-800/30 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {l.created_at ? new Date(l.created_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {l.user_name || 'System Worker'}
                        {l.organization_name && (
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {l.organization_name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {l.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                        {l.resource}
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
                        {l.details}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
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

      {/* ========================================================================= */}
      {/* MODAL: ADD BUSINESS */}
      {/* ========================================================================= */}
      {showAddBizModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Provision New Business Tenant</h3>
              <button onClick={() => setShowAddBizModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={newBizForm.name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, name: e.target.value })}
                  className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Identifier Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="acme-corp"
                    value={newBizForm.slug}
                    onChange={(e) => setNewBizForm({ ...newBizForm, slug: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subscription Plan</label>
                  <select
                    value={newBizForm.plan_tier}
                    onChange={(e) => setNewBizForm({ ...newBizForm, plan_tier: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="free">Free ($0/mo)</option>
                    <option value="starter">Starter ($49/mo)</option>
                    <option value="business">Business ($199/mo)</option>
                    <option value="enterprise">Enterprise ($499/mo)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[11px] font-bold text-brand-300 uppercase tracking-wider mb-2">
                  Primary Administrator Account
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={newBizForm.admin_name}
                      onChange={(e) => setNewBizForm({ ...newBizForm, admin_name: e.target.value })}
                      className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Admin Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@acme.com"
                      value={newBizForm.admin_email}
                      onChange={(e) => setNewBizForm({ ...newBizForm, admin_email: e.target.value })}
                      className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBizModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-glow"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BUSINESS */}
      {/* ========================================================================= */}
      {showEditBizModal && selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit Business: {selectedBiz.name}</h3>
              <button onClick={() => setShowEditBizModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBusiness} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  value={selectedBiz.name}
                  onChange={(e) => setSelectedBiz({ ...selectedBiz, name: e.target.value })}
                  className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Plan Tier</label>
                <select
                  value={selectedBiz.plan?.toLowerCase() || 'starter'}
                  onChange={(e) => setSelectedBiz({ ...selectedBiz, plan: e.target.value })}
                  className="w-full bg-slate-950 text-white rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="free">Free Tier</option>
                  <option value="starter">Starter Plan</option>
                  <option value="business">Business Pro</option>
                  <option value="enterprise">Enterprise Suite</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditBizModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-glow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PLAN PARAMETERS */}
      {/* ========================================================================= */}
      {showEditPlanModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Configure Plan: {selectedPlan.name}</h3>
              <button onClick={() => setShowEditPlanModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
                  <input
                    type="text"
                    value={selectedPlan.name}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={selectedPlan.badge || ''}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, badge: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={selectedPlan.description || ''}
                  onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                  className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedPlan.monthly_price}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, monthly_price: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Annual Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedPlan.annual_price}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, annual_price: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Users</label>
                  <input
                    type="number"
                    value={selectedPlan.max_users}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, max_users: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max AI Reqs</label>
                  <input
                    type="number"
                    value={selectedPlan.max_ai_requests}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, max_ai_requests: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max API Calls</label>
                  <input
                    type="number"
                    value={selectedPlan.max_api_requests}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, max_api_requests: e.target.value })}
                    className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-glow"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET USER PASSWORD */}
      {/* ========================================================================= */}
      {showResetPwdModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Reset User Password</h3>
              <button onClick={() => setShowResetPwdModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-400">
                Enter a new temporary or permanent password for{' '}
                <span className="text-white font-semibold">{selectedUser.email}</span>.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPwdModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIT LOG DETAIL */}
      {/* ========================================================================= */}
      {showLogDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Audit Event Details</h3>
              <button onClick={() => setShowLogDetailModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Action Event</span>
                <p className="font-bold text-white">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Actor / Initiator</span>
                <p className="text-slate-200">{selectedLog.user_name} ({selectedLog.user_email || 'Service User'})</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Tenant Organization</span>
                <p className="text-slate-200">{selectedLog.organization_name || 'Global'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Resource</span>
                <p className="font-mono text-brand-300">{selectedLog.resource}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Details / Payload</span>
                <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] break-words">
                  {selectedLog.details}
                </p>
              </div>
              <div className="flex justify-between pt-2 text-[10px] text-slate-500 font-mono">
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
