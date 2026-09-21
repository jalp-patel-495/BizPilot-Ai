import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  IndianRupee,
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
  Briefcase,
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

  const handleOpenDelete = (cust) => {
    setSelectedCustomer(cust);
    setShowDeleteModal(true);
  };

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

  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalLtv = customers.reduce((sum, c) => sum + (c.ltv || 0), 0);
  const avgLtv = totalCount > 0 ? totalLtv / totalCount : 0;
  const industries = Array.from(new Set(customers.map((c) => c.industry).filter(Boolean)));

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL':
        return <Phone className="w-3.5 h-3.5 text-[#555555]" />;
      case 'MEETING':
        return <Video className="w-3.5 h-3.5 text-[#555555]" />;
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-[#555555]" />;
      case 'SALE':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-700" />;
      case 'CONVERSION':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-[#555555]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              CRM • Customer Directory
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Track account profiles, addresses, industry verticals, historical timeline interactions, and lifetime values.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-customer-btn"
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="btn-secondary"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#111111]' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
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
          subtext="active CRM records"
          icon={Users}
        />
        <StatCard
          label="Active Accounts"
          value={activeCount.toString()}
          change={8.2}
          trend="up"
          subtext={`${totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : 100}% active rate`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Average LTV"
          value={`Rs. ${avgLtv.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={9.5}
          trend="up"
          subtext="account lifetime ARR"
          icon={IndianRupee}
        />
        <StatCard
          label="Industry Verticals"
          value={`${industries.length || 5}`}
          change={14.0}
          trend="up"
          subtext="market sectors served"
          icon={Briefcase}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            id="search-customer-input"
            type="text"
            placeholder="Search company, name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-md bg-[#F3F3F3] border border-[#E5E5E5]">
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
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                  statusFilter === tab.value
                    ? 'bg-white text-[#111111] shadow-subtle border border-[#D9D9D9] font-semibold'
                    : 'text-[#666666] hover:text-[#111111]'
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
            className="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
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
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#F9FAFB] text-[#666666] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="px-5 py-3">Company & Client</th>
                <th className="px-5 py-3">Contact Information</th>
                <th className="px-5 py-3">Address & Industry</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3">Lifetime Value</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8A8A8A]">
                    <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8A8A8A]">
                    No customers found matching search and filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-5 py-3 font-semibold text-[#111111]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-semibold text-xs">
                          {c.company ? c.company.charAt(0) : 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111111] text-xs">{c.company}</p>
                          <p className="text-[11px] text-[#666666] font-normal">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#111111]">
                          <Mail className="w-3.5 h-3.5 text-[#8A8A8A]" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-[#666666] text-[11px]">
                            <Phone className="w-3 h-3 text-[#8A8A8A]" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#666666]">
                          <MapPin className="w-3.5 h-3.5 text-[#8A8A8A]" />
                          <span className="truncate max-w-[180px]">{c.address || 'Address on file'}</span>
                        </div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#F3F3F3] text-[#666666]">
                          {c.industry || 'Technology'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'INACTIVE'
                            ? 'bg-neutral-50 text-neutral-600 border-neutral-200'
                            : c.status === 'PROSPECT'
                            ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#666666]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#8A8A8A]" />
                        <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#111111]">
                      Rs. ${(c.ltv || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-cust-${c.id}`}
                          onClick={() => handleViewCustomer(c)}
                          className="p-1.5 rounded-md hover:bg-[#F3F3F3] text-[#666666] hover:text-[#111111] transition"
                          title="View Profile & History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-cust-${c.id}`}
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-md hover:bg-[#F3F3F3] text-[#666666] hover:text-[#111111] transition"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-cust-${c.id}`}
                          onClick={() => handleOpenDelete(c)}
                          className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#666666] hover:text-[#DC2626] transition"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-in fade-in">
          <div className="w-full max-w-xl bg-white border-l border-[#E5E5E5] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-modal text-[#111111]">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-[#EBEBEB]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9]">
                      {customerDetail.tier} Tier
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        customerDetail.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {customerDetail.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#111111]">{customerDetail.company}</h2>
                  <p className="text-xs text-[#666666]">Primary Contact: {customerDetail.name}</p>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#111111] hover:bg-[#F7F7F7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="grid grid-cols-2 gap-3 my-5 p-4 rounded-md bg-[#F9FAFB] border border-[#E5E5E5] text-xs">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Email Address</p>
                  <p className="text-[#111111] font-medium truncate">{customerDetail.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Phone Number</p>
                  <p className="text-[#111111] font-medium">{customerDetail.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Address</p>
                  <p className="text-[#111111] font-medium truncate">{customerDetail.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Industry Vertical</p>
                  <p className="text-[#111111] font-medium">{customerDetail.industry || 'Technology'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Lifetime Value</p>
                  <p className="text-[#111111] font-semibold">Rs. {(customerDetail.ltv || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Member Since</p>
                  <p className="text-[#111111] font-medium">
                    {customerDetail.created_at ? new Date(customerDetail.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Log Activity Form */}
              <div className="p-4 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-[#111111]" />
                  <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Log Customer Activity</h3>
                </div>

                <form onSubmit={handleLogActivity} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newActivity.activity_type}
                      onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
                      className="col-span-1 px-2.5 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#111111] text-xs focus:border-[#111111] focus:outline-none"
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
                      className="col-span-2 px-2.5 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#111111] text-xs placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows="2"
                    placeholder="Details of interaction or discussion points..."
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#111111] text-xs placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Log Activity
                    </button>
                  </div>
                </form>
              </div>

              {/* History Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8A8A8A]" />
                  <span>Customer Activity History</span>
                </h3>

                {loadingDetail ? (
                  <div className="py-6 text-center text-[#8A8A8A] text-xs">
                    <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading interaction timeline...
                  </div>
                ) : !customerDetail.activities || customerDetail.activities.length === 0 ? (
                  <p className="text-xs text-[#8A8A8A] py-3">No historical activities recorded yet.</p>
                ) : (
                  <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5E5]">
                    {customerDetail.activities.map((act) => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-[23px] top-1 w-5 h-5 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center">
                          {getActivityIcon(act.activity_type)}
                        </div>
                        <div className="p-3 rounded-md bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] transition">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#111111]">{act.title}</span>
                            <span className="text-[10px] text-[#8A8A8A]">
                              {new Date(act.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {act.description && (
                            <p className="text-xs text-[#666666] mt-1 leading-relaxed">{act.description}</p>
                          )}
                          <span className="block text-[10px] text-[#8A8A8A] mt-1.5">
                            By {act.performed_by || 'System'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EBEBEB] flex items-center justify-between">
              <button
                onClick={() => {
                  handleOpenEdit(customerDetail);
                  setShowHistoryDrawer(false);
                }}
                className="btn-secondary"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  handleOpenDelete(customerDetail);
                  setShowHistoryDrawer(false);
                }}
                className="btn-danger"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg border border-[#E5E5E5] shadow-modal relative text-[#111111]">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="absolute top-5 right-5 text-[#8A8A8A] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-[#111111] mb-0.5">
              {showAddModal ? 'Add New Customer Account' : 'Edit Customer Account'}
            </h3>
            <p className="text-xs text-[#666666] mb-5">
              {showAddModal ? 'Register a company in the CRM directory' : `Update records for ${formData.company}`}
            </p>

            <form onSubmit={showAddModal ? handleCreateCustomer : handleUpdateCustomer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Financial Solutions"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sophia Chen"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sophia@apexfin.com"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (415) 882-9012"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 500 Howard St, San Francisco, CA"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Industry Vertical</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Finance, Healthcare, Retail"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PROSPECT">PROSPECT</option>
                    <option value="CHURNED">CHURNED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Account Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="Enterprise">Enterprise AI</option>
                    <option value="Growth">Growth</option>
                    <option value="Starter">Starter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Lifetime Value (LTV Rs.)</label>
                <input
                  type="number"
                  value={formData.ltv}
                  onChange={(e) => setFormData({ ...formData, ltv: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg border border-[#E5E5E5] shadow-modal text-[#111111]">
            <h3 className="text-base font-semibold text-[#111111] mb-2">Delete Customer Account</h3>
            <p className="text-xs text-[#666666] mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-[#111111]">{selectedCustomer.company}</span>? This action will permanently remove the account, past order records, and activity history.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteCustomer}
                className="btn-danger"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
