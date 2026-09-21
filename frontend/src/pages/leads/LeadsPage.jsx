import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Search,
  DollarSign,
  Clock,
  Flame,
  Sun,
  Snowflake,
  Columns,
  Table as TableIcon,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  HelpCircle,
  User,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../contexts/AuthContext';

export const LeadsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'kanban';

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(initialView);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClassification, setFilterClassification] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && (viewParam === 'kanban' || viewParam === 'table')) {
      setViewMode(viewParam);
    }
  }, [searchParams]);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeRules, setActiveRules] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    contact_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    industry: 'Technology',
    deal_value: 25000,
    source: 'Website',
    status: 'NEW',
    follow_up_date: '',
    assigned_to: '',
    notes: '',
  });

  const leadStatuses = [
    { id: 'NEW', label: 'New', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
    { id: 'CONTACTED', label: 'Contacted', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'CONVERTED', label: 'Converted', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { id: 'LOST', label: 'Lost', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  ];

  const leadSources = [
    'Website',
    'Referral',
    'LinkedIn',
    'Cold Outreach',
    'Trade Show',
    'Inbound Demo',
  ];

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterClassification) params.classification = filterClassification;
      if (filterSource) params.source = filterSource;
      if (filterAssignee) params.assigned_to = filterAssignee;

      const res = await api.get('/leads', { params });
      if (res.data?.data) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      // restricted permission
    }
  };

  const fetchRules = async () => {
    try {
      const res = await api.get('/leads/rules/classification');
      if (res.data?.data?.rules) {
        setActiveRules(res.data.data.rules);
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchRules();
  }, [search, filterStatus, filterClassification, filterSource, filterAssignee]);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailDrawer(true);
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setFormData({
      contact_name: lead.contact_name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company,
      address: lead.address || '',
      industry: lead.industry || 'Technology',
      deal_value: lead.deal_value || 0,
      source: lead.source || 'Website',
      status: lead.status || 'NEW',
      follow_up_date: lead.follow_up_date ? lead.follow_up_date.split('T')[0] : '',
      assigned_to: lead.assigned_to || '',
      notes: lead.notes || '',
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  const handleOpenConvert = (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        deal_value: parseFloat(formData.deal_value) || 0,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null,
      };
      const res = await api.post('/leads', payload);
      setShowAddModal(false);
      setMessage(
        `Lead created for ${formData.company}! Classified as "${res.data?.data?.classification}".`
      );
      setTimeout(() => setMessage(''), 5000);
      setFormData({
        contact_name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        industry: 'Technology',
        deal_value: 25000,
        source: 'Website',
        status: 'NEW',
        follow_up_date: '',
        assigned_to: '',
        notes: '',
      });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        deal_value: parseFloat(formData.deal_value) || 0,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null,
      };
      const res = await api.put(`/leads/${selectedLead.id}`, payload);
      setShowEditModal(false);
      if (showDetailDrawer && selectedLead.id === res.data?.data?.id) {
        setSelectedLead(res.data.data);
      }
      setMessage(`Lead '${formData.company}' updated successfully!`);
      setTimeout(() => setMessage(''), 4000);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    try {
      setSubmitting(true);
      await api.delete(`/leads/${selectedLead.id}`);
      setShowDeleteModal(false);
      if (showDetailDrawer && selectedLead.id === selectedLead?.id) {
        setShowDetailDrawer(false);
      }
      setMessage(`Lead '${selectedLead.company}' removed from pipeline.`);
      setTimeout(() => setMessage(''), 4000);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLead) return;
    try {
      setSubmitting(true);
      await api.post(`/leads/${selectedLead.id}/convert`, {
        tier: 'Enterprise',
        notes: `Converted from lead pipeline. Deal: $${selectedLead.deal_value?.toLocaleString()}`,
      });
      setShowConvertModal(false);
      if (showDetailDrawer) setShowDetailDrawer(false);
      setMessage(`Successfully converted '${selectedLead.company}' to active Customer!`);
      setTimeout(() => setMessage(''), 5000);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to convert lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveStatus = async (lead, newStatus) => {
    try {
      await api.put(`/leads/${lead.id}`, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error('Failed to move lead stage:', err);
    }
  };

  const totalPipeline = leads.reduce((sum, l) => sum + (l.deal_value || 0), 0);
  const hotLeads = leads.filter((l) => l.classification === 'HOT');
  const warmLeads = leads.filter((l) => l.classification === 'WARM');
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;
  const winRate = leads.length > 0 ? ((convertedCount / leads.length) * 100).toFixed(1) : '24.6';

  const getClassificationBadge = (cls) => {
    switch (cls) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            HOT
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Sun className="w-3 h-3 text-amber-600" />
            WARM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300">
            <Snowflake className="w-3 h-3 text-neutral-600" />
            COLD
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              {user?.role === 'EMPLOYEE'
                ? 'My Workspace • Assigned Leads'
                : user?.role === 'SALES_MANAGER'
                ? 'Sales Operations • Pipeline Funnel'
                : 'CRM • Lead Pipeline'}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            {user?.role === 'EMPLOYEE'
              ? 'My Assigned Leads'
              : user?.role === 'SALES_MANAGER' && viewMode === 'kanban'
              ? 'Sales Pipeline & Kanban Board'
              : 'Leads Pipeline & Scoring'}
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            {user?.role === 'EMPLOYEE'
              ? 'Leads assigned to your portfolio for qualification, follow-ups, and deal progression.'
              : 'Automated lead qualification into Hot, Warm, and Cold tiers with follow-up scheduling and conversion.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user?.role !== 'EMPLOYEE' && (
            <button
              id="view-rules-btn"
              onClick={() => setShowRulesModal(true)}
              className="btn-secondary"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Rules</span>
            </button>
          )}

          <button
            id="add-lead-btn"
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>

          <button
            onClick={fetchLeads}
            className="btn-secondary"
            title="Refresh Leads"
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
          label="Total Pipeline Value"
          value={`$${totalPipeline.toLocaleString()}`}
          change={18.5}
          trend="up"
          subtext="estimated active ARR"
          icon={DollarSign}
        />
        <StatCard
          label="Hot Opportunities"
          value={hotLeads.length.toString()}
          change={24.0}
          trend="up"
          subtext="priority high-value leads"
          icon={Flame}
        />
        <StatCard
          label="Warm Opportunities"
          value={warmLeads.length.toString()}
          change={11.2}
          trend="up"
          subtext="active engagement cycle"
          icon={Sun}
        />
        <StatCard
          label="Pipeline Win Rate"
          value={`${winRate}%`}
          change={3.8}
          trend="up"
          subtext="lead-to-deal ratio"
          icon={TrendingUp}
        />
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            id="search-lead-input"
            type="text"
            placeholder="Search leads, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Classification Filter */}
          <select
            id="filter-classification-select"
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
          >
            <option value="">All Tiers (Hot/Warm/Cold)</option>
            <option value="HOT">Hot Leads</option>
            <option value="WARM">Warm Leads</option>
            <option value="COLD">Cold Leads</option>
          </select>

          {/* Source Filter */}
          <select
            id="filter-source-select"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
          >
            <option value="">All Sources</option>
            {leadSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="filter-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
          >
            <option value="">All Statuses</option>
            {leadStatuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-md bg-[#F3F3F3] border border-[#E5E5E5]">
            <button
              id="view-toggle-kanban"
              onClick={() => {
                setViewMode('kanban');
                setSearchParams({ view: 'kanban' });
              }}
              className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#111111] shadow-subtle border border-[#D9D9D9]'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              id="view-toggle-table"
              onClick={() => {
                setViewMode('table');
                setSearchParams({ view: 'table' });
              }}
              className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-white text-[#111111] shadow-subtle border border-[#D9D9D9]'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
              title="Table Ledger View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1300px]">
            {leadStatuses.map((st) => {
              const columnLeads = leads.filter((l) => l.status === st.id);
              const colValue = columnLeads.reduce((sum, l) => sum + (l.deal_value || 0), 0);

              return (
                <div
                  key={st.id}
                  id={`kanban-col-${st.id.toLowerCase()}`}
                  className="w-72 flex-shrink-0 flex flex-col rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] p-3"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#EBEBEB]">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-xs font-medium text-[#8A8A8A]">({columnLeads.length})</span>
                    </div>
                    <span className="text-[11px] text-[#666666] font-medium">
                      ${(colValue / 1000).toFixed(0)}k
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {columnLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[#8A8A8A] border border-dashed border-[#E5E5E5] rounded-md bg-white">
                        No leads in {st.label}
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          id={`lead-card-${lead.id}`}
                          onClick={() => handleViewLead(lead)}
                          className="p-3.5 rounded-md bg-white border border-[#E5E5E5] hover:border-[#D4D4D4] cursor-pointer transition shadow-subtle space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-[#111111] line-clamp-1">
                              {lead.company}
                            </span>
                            {getClassificationBadge(lead.classification)}
                          </div>

                          <div className="text-[11px] text-[#666666] space-y-0.5">
                            <p className="font-normal text-[#111111]">{lead.contact_name}</p>
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A]">
                              <span>{lead.source || 'Website'}</span>
                              <span className="font-semibold text-[#111111] text-xs">
                                ${(lead.deal_value || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {lead.follow_up_date && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-700 font-medium pt-1.5 border-t border-[#F0F0F0]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between text-[10px]">
                            <span className="text-[#8A8A8A] flex items-center gap-1 truncate max-w-[120px]">
                              <User className="w-3 h-3 text-[#8A8A8A]" />
                              {lead.assignee_name || 'Unassigned'}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {lead.status !== 'CONVERTED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenConvert(lead);
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-semibold hover:bg-emerald-100"
                                  title="Convert to Customer"
                                >
                                  Convert
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(lead);
                                }}
                                className="p-0.5 text-[#666666] hover:text-[#111111]"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TABLE LEDGER VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F9FAFB] text-[#666666] font-medium border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-3">Lead & Contact</th>
                  <th className="px-5 py-3">Classification</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Deal Value</th>
                  <th className="px-5 py-3">Follow-Up</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#8A8A8A]">
                      <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading pipeline...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#8A8A8A]">
                      No leads match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-5 py-3 font-semibold text-[#111111]">
                        <div>
                          <p className="font-semibold text-[#111111] text-xs">{lead.company}</p>
                          <p className="text-[11px] text-[#666666] font-normal">{lead.contact_name} • {lead.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {getClassificationBadge(lead.classification)}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleMoveStatus(lead, e.target.value)}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-[#D9D9D9] text-[#111111] focus:outline-none cursor-pointer"
                        >
                          {leadStatuses.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-[#666666]">
                        {lead.source || 'Website'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111111]">
                        ${(lead.deal_value || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-[#666666]">
                        {lead.follow_up_date ? (
                          <span className="flex items-center gap-1 text-amber-700 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            {new Date(lead.follow_up_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[#8A8A8A]">None</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#666666]">
                        {lead.assignee_name || 'Unassigned'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {lead.status !== 'CONVERTED' && (
                            <button
                              id={`convert-lead-btn-${lead.id}`}
                              onClick={() => handleOpenConvert(lead)}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-medium transition"
                              title="Convert to Customer"
                            >
                              Convert
                            </button>
                          )}
                          <button
                            id={`view-lead-btn-${lead.id}`}
                            onClick={() => handleViewLead(lead)}
                            className="p-1.5 rounded-md hover:bg-[#F3F3F3] text-[#666666] hover:text-[#111111]"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`edit-lead-btn-${lead.id}`}
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-md hover:bg-[#F3F3F3] text-[#666666] hover:text-[#111111]"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user?.role !== 'EMPLOYEE' && (
                            <button
                              id={`delete-lead-btn-${lead.id}`}
                              onClick={() => handleOpenDelete(lead)}
                              className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#666666] hover:text-[#DC2626]"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Details Drawer */}
      {showDetailDrawer && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-in fade-in">
          <div className="w-full max-w-xl bg-white border-l border-[#E5E5E5] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-modal text-[#111111]">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-[#EBEBEB]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getClassificationBadge(selectedLead.classification)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9]">
                      Status: {selectedLead.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#111111]">{selectedLead.company}</h2>
                  <p className="text-xs text-[#666666]">Primary Contact: {selectedLead.contact_name}</p>
                </div>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#111111] hover:bg-[#F7F7F7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Automatic Classification & AI Card */}
              <div className="my-5 p-4 rounded-md bg-[#F9FAFB] border border-[#E5E5E5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111111]">
                    AI Lead Intelligence
                  </span>
                  {selectedLead.sales_priority && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-[#111111] border border-[#D9D9D9]">
                      {selectedLead.sales_priority}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#666666]">
                  Reason: <span className="font-medium text-[#111111]">{selectedLead.classification_reason || 'Evaluated against configurable business rules.'}</span>
                </p>
                {selectedLead.recommended_action && (
                  <div className="p-2.5 rounded-md bg-white border border-[#E5E5E5] text-xs">
                    <span className="text-[10px] uppercase font-semibold text-[#8A8A8A] block mb-0.5">Recommended Next Action:</span>
                    <span className="text-[#111111] font-medium">{selectedLead.recommended_action}</span>
                  </div>
                )}
                {selectedLead.ai_score !== undefined && (
                  <div className="flex items-center justify-between text-xs text-[#666666] pt-2 border-t border-[#EBEBEB]">
                    <span>AI Conversion Probability:</span>
                    <span className="font-semibold text-[#111111] text-sm">{selectedLead.ai_score}/100</span>
                  </div>
                )}
              </div>

              {/* Fields Matrix */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-md bg-[#FAFAFA] border border-[#E5E5E5] text-xs mb-5">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Email Address</p>
                  <p className="text-[#111111] font-medium truncate">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Phone Number</p>
                  <p className="text-[#111111] font-medium">{selectedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Deal Estimated Value</p>
                  <p className="text-[#111111] font-semibold">${(selectedLead.deal_value || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Lead Source</p>
                  <p className="text-[#111111] font-medium">{selectedLead.source || 'Website'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Scheduled Follow-up</p>
                  <p className="text-amber-700 font-medium">
                    {selectedLead.follow_up_date ? new Date(selectedLead.follow_up_date).toLocaleDateString() : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A]">Assigned Employee</p>
                  <p className="text-[#111111] font-medium">{selectedLead.assignee_name || 'Unassigned'}</p>
                </div>
              </div>

              {/* AI Strategic Summary */}
              {selectedLead.ai_summary && (
                <div className="p-3.5 rounded-md bg-white border border-[#E5E5E5] mb-4">
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A] mb-1">AI Intent Analysis</p>
                  <p className="text-xs text-[#666666] leading-relaxed">{selectedLead.ai_summary}</p>
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="p-3.5 rounded-md bg-white border border-[#E5E5E5]">
                  <p className="text-[10px] uppercase font-semibold text-[#8A8A8A] mb-1">Conversation Notes</p>
                  <p className="text-xs text-[#666666] leading-relaxed">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#EBEBEB] flex items-center justify-between gap-2">
              {selectedLead.status !== 'CONVERTED' && (
                <button
                  onClick={() => handleOpenConvert(selectedLead)}
                  className="btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Convert to Customer</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedLead);
                    setShowDetailDrawer(false);
                  }}
                  className="btn-secondary"
                  title="Edit Lead"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenDelete(selectedLead);
                    setShowDetailDrawer(false);
                  }}
                  className="btn-danger"
                  title="Delete Lead"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg border border-[#E5E5E5] shadow-modal relative max-h-[90vh] overflow-y-auto text-[#111111]">
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
              {showAddModal ? 'Add New Business Lead' : 'Edit Lead Details'}
            </h3>
            <p className="text-xs text-[#666666] mb-5">
              Automatic classification (Hot/Warm/Cold) will run upon saving.
            </p>

            <form onSubmit={showAddModal ? handleCreateLead : handleUpdateLead} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
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
                    placeholder="e.g. jane@acme.com"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Deal Value ($) *</label>
                  <input
                    type="number"
                    required
                    value={formData.deal_value}
                    onChange={(e) => setFormData({ ...formData, deal_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    {leadSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Pipeline Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    {leadStatuses.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Assigned Employee</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Notes & Context</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key discovery notes or requirements..."
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
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
                  <span>{showAddModal ? 'Save & Classify Lead' : 'Update Lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg border border-[#E5E5E5] shadow-modal text-[#111111]">
            <h3 className="text-base font-semibold text-[#111111] mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Convert Lead to Customer</span>
            </h3>
            <p className="text-xs text-[#666666] mb-5 leading-relaxed">
              This will convert <span className="font-semibold text-[#111111]">{selectedLead.company}</span> into an active customer account with lifetime value of <span className="font-semibold text-[#111111]">${(selectedLead.deal_value || 0).toLocaleString()}</span> and log the conversion event in the customer timeline.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConvertLead}
                className="btn-primary"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Conversion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg border border-[#E5E5E5] shadow-modal text-[#111111]">
            <h3 className="text-base font-semibold text-[#111111] mb-2">Delete Lead Opportunity</h3>
            <p className="text-xs text-[#666666] mb-5 leading-relaxed">
              Are you sure you want to delete lead <span className="font-semibold text-[#111111]">{selectedLead.company}</span>? This action cannot be undone.
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
                onClick={handleDeleteLead}
                className="btn-danger"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classification Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg border border-[#E5E5E5] shadow-modal relative text-[#111111]">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-5 right-5 text-[#8A8A8A] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-[#111111] mb-1">Configurable Classification Rules</h3>
            <p className="text-xs text-[#666666] mb-5">
              How the engine automatically determines Hot, Warm, and Cold tiers:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-1.5 text-rose-800 font-semibold mb-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>HOT Tier Conditions</span>
                </div>
                <ul className="list-disc list-inside text-rose-900 space-y-0.5 text-[11px]">
                  <li>Estimated Deal Value &ge; ${activeRules?.hot_deal_value_min?.toLocaleString() || '20,000'}</li>
                  <li>Status in Qualified / Proposal / Negotiation with Deal &ge; $10,000</li>
                  <li>Referral, Partner, or Inbound Demo with AI Score &ge; 75</li>
                  <li>ML Conversion Probability &ge; {activeRules?.hot_ai_score_min || '85'}%</li>
                </ul>
              </div>

              <div className="p-3 rounded-md bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>WARM Tier Conditions</span>
                </div>
                <ul className="list-disc list-inside text-amber-900 space-y-0.5 text-[11px]">
                  <li>Scheduled follow-up outreach within {activeRules?.follow_up_window_days || '7'} days</li>
                  <li>Deal Value between $5,000 and $20,000</li>
                  <li>Active pipeline stage (New, Contacted, Qualified, Proposal)</li>
                  <li>ML Conversion Probability &ge; 55%</li>
                </ul>
              </div>

              <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-1.5 text-neutral-800 font-semibold mb-1">
                  <Snowflake className="w-3.5 h-3.5 text-neutral-600" />
                  <span>COLD Tier Conditions</span>
                </div>
                <ul className="list-disc list-inside text-neutral-700 space-y-0.5 text-[11px]">
                  <li>Opportunity status marked as Lost</li>
                  <li>Deal Value &lt; $5,000 with no imminent follow-up outreach</li>
                  <li>Low engagement profile and score &lt; 55%</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-[#EBEBEB]">
              <button
                onClick={() => setShowRulesModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
