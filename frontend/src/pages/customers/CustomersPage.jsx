import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Video,
  FileText,
  Briefcase,
  SlidersHorizontal,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [message, setMessage] = useState('');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Activity form in customer history drawer
  const [newActivity, setNewActivity] = useState({
    activity_type: 'CALL',
    title: '',
    description: '',
  });

  // Add / Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    industry: 'Technology',
    status: 'ACTIVE',
    tier: 'Enterprise',
    ltv: 25000,
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let url = '/customers';
      const params = [];
      if (search) params.push(`q=${encodeURIComponent(search)}`);
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (industryFilter) params.push(`industry=${encodeURIComponent(industryFilter)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res.data?.data) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, industryFilter]);

  // View Customer Details & History
  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setShowHistoryDrawer(true);
    try {
      setLoadingDetail(true);
      const res = await api.get(`/customers/${cust.id}`);
      if (res.data?.data) {
        setCustomerDetail(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      name: cust.name,
      email: cust.email,
      phone: cust.phone || '',
      company: cust.company,
      address: cust.address || '',
      industry: cust.industry || 'Technology',
      status: cust.status || 'ACTIVE',
      tier: cust.tier || 'Enterprise',
      ltv: cust.ltv || 0,
      notes: cust.notes || '',
    });
    setShowEditModal(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (cust) => {
    setSelectedCustomer(cust);
    setShowDeleteModal(true);
  };

  // Submit Add Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/customers', formData);
      setShowAddModal(false);
      setMessage(`Customer '${formData.company}' added successfully!`);
      setTimeout(() => setMessage(''), 4000);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        industry: 'Technology',
        status: 'ACTIVE',
        tier: 'Enterprise',
        ltv: 25000,
        notes: '',
      });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      setSubmitting(true);
      await api.put(`/customers/${selectedCustomer.id}`, formData);
      setShowEditModal(false);
      setMessage(`Customer '${formData.company}' updated successfully!`);
      setTimeout(() => setMessage(''), 4000);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete Customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      setSubmitting(true);
      await api.delete(`/customers/${selectedCustomer.id}`);
      setShowDeleteModal(false);
      if (showHistoryDrawer && selectedCustomer.id === customerDetail?.id) {
        setShowHistoryDrawer(false);
      }
      setMessage(`Customer '${selectedCustomer.company}' deleted.`);
      setTimeout(() => setMessage(''), 4000);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete customer');
    } finally {
      setSubmitting(false);
    }
  };

  // Log Activity in Customer History
  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!customerDetail || !newActivity.title.trim()) return;
    try {
      const res = await api.post(`/customers/${customerDetail.id}/history`, newActivity);
      if (res.data?.data) {
        setCustomerDetail((prev) => ({
          ...prev,
          activities: [res.data.data, ...(prev.activities || [])],
        }));
        setNewActivity({ activity_type: 'CALL', title: '', description: '' });
      }
    } catch (err) {
      alert('Failed to log activity');
    }
  };

  // Stats calculation
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalLtv = customers.reduce((sum, c) => sum + (c.ltv || 0), 0);
  const avgLtv = totalCount > 0 ? totalLtv / totalCount : 0;
  const industries = Array.from(new Set(customers.map((c) => c.industry).filter(Boolean)));

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL':
        return <Phone className="w-4 h-4 text-cyan-400" />;
      case 'MEETING':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'SALE':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'CONVERSION':
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Phase 4 CRM • Customer Lifecycle Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track account profiles, addresses, industry verticals, historical timeline interactions, and lifetime values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="add-customer-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 shadow-glow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Accounts"
          value={totalCount.toString()}
          change={12.4}
          trend="up"
          subtext="active CRM database records"
          icon={Users}
          color="cyan"
        />
        <StatCard
          label="Active Accounts"
          value={activeCount.toString()}
          change={8.2}
          trend="up"
          subtext={`${totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : 100}% active customer rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Average LTV"
          value={`$${avgLtv.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={9.5}
          trend="up"
          subtext="account lifetime ARR"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          label="Industry Verticals"
          value={`${industries.length || 5}`}
          change={14.0}
          trend="up"
          subtext="market sectors served"
          icon={Briefcase}
          color="teal"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-customer-input"
            type="text"
            placeholder="Search company, name, email, phone, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {[
              { label: 'All', value: '' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
              { label: 'Prospect', value: 'PROSPECT' },
              { label: 'Churned', value: 'CHURNED' },
            ].map((tab) => (
              <button
                key={tab.value}
                id={`status-filter-${tab.value || 'all'}`}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === tab.value
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Industry Filter Dropdown */}
          <select
            id="industry-filter-select"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Company & Client</th>
                <th className="px-6 py-4">Contact Information</th>
                <th className="px-6 py-4">Address & Industry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Lifetime Value (LTV)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No customers found matching search and filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold">
                          {c.company ? c.company.charAt(0) : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{c.company}</p>
                          <p className="text-[11px] text-slate-400">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[180px]">{c.address || 'Address on file'}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                          {c.industry || 'Technology'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.status === 'INACTIVE'
                            ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            : c.status === 'PROSPECT'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-400 text-sm">
                      ${(c.ltv || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`view-cust-${c.id}`}
                          onClick={() => handleViewCustomer(c)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Profile & History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-cust-${c.id}`}
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-cust-${c.id}`}
                          onClick={() => handleOpenDelete(c)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer View & History Drawer */}
      {showHistoryDrawer && customerDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {customerDetail.tier} Tier
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        customerDetail.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {customerDetail.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{customerDetail.company}</h2>
                  <p className="text-xs text-slate-400">Primary Contact: {customerDetail.name}</p>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Email Address</p>
                  <p className="text-slate-200 font-medium truncate">{customerDetail.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Phone Number</p>
                  <p className="text-slate-200 font-medium">{customerDetail.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Address</p>
                  <p className="text-slate-200 font-medium truncate">{customerDetail.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Industry Vertical</p>
                  <p className="text-slate-200 font-medium">{customerDetail.industry || 'Technology'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Total Lifetime Value</p>
                  <p className="text-emerald-400 font-bold text-sm">${(customerDetail.ltv || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Member Since</p>
                  <p className="text-slate-200 font-medium">
                    {customerDetail.created_at ? new Date(customerDetail.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Log Activity Form */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-brand-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log Customer Activity</h3>
                </div>

                <form onSubmit={handleLogActivity} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newActivity.activity_type}
                      onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
                      className="col-span-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="CALL">Phone Call</option>
                      <option value="MEETING">Meeting</option>
                      <option value="EMAIL">Email</option>
                      <option value="NOTE">General Note</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Title / Summary..."
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                      className="col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <textarea
                    rows="2"
                    placeholder="Details of interaction or discussion points..."
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition shadow-glow"
                    >
                      Log Activity
                    </button>
                  </div>
                </form>
              </div>

              {/* History Timeline */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Customer Activity History</span>
                </h3>

                {loadingDetail ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading interaction timeline...
                  </div>
                ) : !customerDetail.activities || customerDetail.activities.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No historical activities recorded yet.</p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {customerDetail.activities.map((act) => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-[23px] top-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                          {getActivityIcon(act.activity_type)}
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white">{act.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(act.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {act.description && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.description}</p>
                          )}
                          <span className="block text-[10px] text-slate-500 mt-2">
                            By {act.performed_by || 'System'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  handleOpenEdit(customerDetail);
                  setShowHistoryDrawer(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  handleOpenDelete(customerDetail);
                  setShowHistoryDrawer(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">
              {showAddModal ? 'Add New Customer Account' : 'Edit Customer Account'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {showAddModal ? 'Register a company in the CRM directory' : `Update records for ${formData.company}`}
            </p>

            <form onSubmit={showAddModal ? handleCreateCustomer : handleUpdateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Financial Solutions"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sophia Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sophia@apexfin.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (415) 882-9012"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 500 Howard St, San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry Vertical</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Finance, Healthcare, Retail"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PROSPECT">PROSPECT</option>
                    <option value="CHURNED">CHURNED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Enterprise">Enterprise AI</option>
                    <option value="Growth">Growth</option>
                    <option value="Starter">Starter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lifetime Value (LTV $)</label>
                <input
                  type="number"
                  value={formData.ltv}
                  onChange={(e) => setFormData({ ...formData, ltv: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition flex items-center gap-2"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{showAddModal ? 'Save Customer' : 'Update Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-rose-500/30 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Delete Customer Account</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">{selectedCustomer.company}</span>? This action will permanently remove the account, past order records, and activity history.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteCustomer}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-glow transition flex items-center gap-2"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
