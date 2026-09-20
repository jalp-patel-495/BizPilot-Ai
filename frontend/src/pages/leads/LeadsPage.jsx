import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Building,
  DollarSign,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  Flame,
  Sun,
  Snowflake,
  Filter,
  Columns,
  Table as TableIcon,
  Eye,
  Edit2,
  Trash2,
  ArrowRight,
  RefreshCw,
  X,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  User,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';

export const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClassification, setFilterClassification] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [message, setMessage] = useState('');

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
    { id: 'NEW', label: 'New', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    { id: 'CONTACTED', label: 'Contacted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { id: 'CONVERTED', label: 'Converted', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { id: 'LOST', label: 'Lost', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
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
      // Non-blocking if employee has restricted users permission
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

  // Open Lead Details
  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailDrawer(true);
  };

  // Open Edit Modal
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

  // Open Delete Modal
  const handleOpenDelete = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  // Open Convert Modal
  const handleOpenConvert = (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  // Submit Add Lead
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

  // Submit Edit Lead
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

  // Submit Delete Lead
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

  // Submit Convert Lead to Customer
  const handleConvertLead = async () => {
    if (!selectedLead) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/leads/${selectedLead.id}/convert`, {
        tier: 'Enterprise',
        notes: `Converted from lead pipeline. Deal: $${selectedLead.deal_value?.toLocaleString()}`,
      });
      setShowConvertModal(false);
      if (showDetailDrawer) setShowDetailDrawer(false);
      setMessage(`🎉 Successfully converted '${selectedLead.company}' to active Customer!`);
      setTimeout(() => setMessage(''), 5000);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to convert lead');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick drag or click status change
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

  // Pipeline Aggregates
  const totalPipeline = leads.reduce((sum, l) => sum + (l.deal_value || 0), 0);
  const hotLeads = leads.filter((l) => l.classification === 'HOT');
  const warmLeads = leads.filter((l) => l.classification === 'WARM');
  const coldLeads = leads.filter((l) => l.classification === 'COLD');
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;
  const winRate = leads.length > 0 ? ((convertedCount / leads.length) * 100).toFixed(1) : '24.6';

  const getClassificationBadge = (cls) => {
    switch (cls) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm">
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
            HOT
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sun className="w-3 h-3 text-amber-400" />
            WARM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Snowflake className="w-3 h-3 text-sky-400" />
            COLD
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Phase 4 CRM • AI Lead Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Leads Pipeline & Automatic Scoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated lead qualification into Hot, Warm, and Cold tiers with follow-up scheduling and conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="view-rules-btn"
            onClick={() => setShowRulesModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 transition"
          >
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <span>Classification Rules</span>
          </button>

          <button
            id="add-lead-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>

          <button
            onClick={fetchLeads}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh Leads"
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
          label="Total Pipeline Value"
          value={`$${totalPipeline.toLocaleString()}`}
          change={18.5}
          trend="up"
          subtext="estimated active ARR"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          label="Hot Opportunities"
          value={hotLeads.length.toString()}
          change={24.0}
          trend="up"
          subtext="priority high-value leads"
          icon={Flame}
          color="rose"
        />
        <StatCard
          label="Warm Opportunities"
          value={warmLeads.length.toString()}
          change={11.2}
          trend="up"
          subtext="active engagement cycle"
          icon={Sun}
          color="amber"
        />
        <StatCard
          label="Pipeline Win Rate"
          value={`${winRate}%`}
          change={3.8}
          trend="up"
          subtext="lead-to-deal ratio"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Search, Filter & View Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-lead-input"
            type="text"
            placeholder="Search leads, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Classification Filter */}
          <select
            id="filter-classification-select"
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Tiers (Hot/Warm/Cold)</option>
            <option value="HOT">🔥 Hot Leads</option>
            <option value="WARM">☀️ Warm Leads</option>
            <option value="COLD">❄️ Cold Leads</option>
          </select>

          {/* Source Filter */}
          <select
            id="filter-source-select"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {leadStatuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              id="view-toggle-kanban"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              id="view-toggle-table"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
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
                  className="w-72 flex-shrink-0 flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800/80 p-3.5"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400">({columnLeads.length})</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      ${(colValue / 1000).toFixed(0)}k
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {columnLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                        No leads in {st.label}
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          id={`lead-card-${lead.id}`}
                          onClick={() => handleViewLead(lead)}
                          className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-brand-500/40 hover:-translate-y-0.5 cursor-pointer transition shadow-sm space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-brand-300 transition line-clamp-1">
                              {lead.company}
                            </span>
                            {getClassificationBadge(lead.classification)}
                          </div>

                          <div className="text-[11px] text-slate-400 space-y-1">
                            <p className="font-medium text-slate-300">{lead.contact_name}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Source: {lead.source || 'Website'}</span>
                              <span className="font-bold text-emerald-400 text-xs">
                                ${(lead.deal_value || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Follow-up date badge */}
                          {lead.follow_up_date && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium pt-1 border-t border-slate-800/60">
                              <Clock className="w-3 h-3" />
                              <span>Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}</span>
                            </div>
                          )}

                          {/* Assignee & Actions */}
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 flex items-center gap-1 truncate max-w-[120px]">
                              <User className="w-3 h-3 text-slate-500" />
                              {lead.assignee_name || 'Unassigned'}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {lead.status !== 'CONVERTED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenConvert(lead);
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[9px] font-bold"
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
                                className="p-1 text-slate-400 hover:text-white"
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
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Lead & Contact</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Deal Value</th>
                  <th className="px-6 py-4">Follow-Up</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading pipeline...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      No leads match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div>
                          <p className="font-bold text-white text-xs">{lead.company}</p>
                          <p className="text-[11px] text-slate-400">{lead.contact_name} • {lead.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getClassificationBadge(lead.classification)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleMoveStatus(lead, e.target.value)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none cursor-pointer"
                        >
                          {leadStatuses.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {lead.source || 'Website'}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-white text-sm">
                        ${(lead.deal_value || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {lead.follow_up_date ? (
                          <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(lead.follow_up_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-600">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {lead.assignee_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.status !== 'CONVERTED' && (
                            <button
                              id={`convert-lead-btn-${lead.id}`}
                              onClick={() => handleOpenConvert(lead)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white transition text-[10px] font-bold"
                              title="Convert to Customer"
                            >
                              Convert
                            </button>
                          )}
                          <button
                            id={`view-lead-btn-${lead.id}`}
                            onClick={() => handleViewLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`edit-lead-btn-${lead.id}`}
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-lead-btn-${lead.id}`}
                            onClick={() => handleOpenDelete(lead)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            title="Delete"
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
      )}

      {/* Lead Details Drawer */}
      {showDetailDrawer && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-start justify-between pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {getClassificationBadge(selectedLead.classification)}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Status: {selectedLead.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedLead.company}</h2>
                  <p className="text-xs text-slate-400">Primary Contact: {selectedLead.contact_name}</p>
                </div>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Automatic Classification & AI Intelligence Card */}
              <div className="my-6 p-4 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span>AI Lead Intelligence & Scoring</span>
                  </div>
                  {selectedLead.sales_priority && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {selectedLead.sales_priority}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Reason: <span className="font-semibold text-brand-300">{selectedLead.classification_reason || 'Evaluated against configurable business rules.'}</span>
                </p>
                {selectedLead.recommended_action && (
                  <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                    <span className="text-[10px] uppercase font-bold text-brand-300 block mb-0.5">Recommended Next Action:</span>
                    <span className="text-white font-medium">{selectedLead.recommended_action}</span>
                  </div>
                )}
                {selectedLead.ai_score !== undefined && (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>AI Conversion Probability:</span>
                    <span className="font-bold text-emerald-400 text-sm">{selectedLead.ai_score}/100</span>
                  </div>
                )}
              </div>


              {/* Fields Matrix */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs mb-6">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Email Address</p>
                  <p className="text-slate-200 font-medium truncate">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Phone Number</p>
                  <p className="text-slate-200 font-medium">{selectedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Deal Estimated Value</p>
                  <p className="text-emerald-400 font-extrabold text-sm">${(selectedLead.deal_value || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Lead Source</p>
                  <p className="text-slate-200 font-medium">{selectedLead.source || 'Website'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Scheduled Follow-up</p>
                  <p className="text-amber-400 font-medium">
                    {selectedLead.follow_up_date ? new Date(selectedLead.follow_up_date).toLocaleDateString() : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Assigned Employee</p>
                  <p className="text-slate-200 font-medium">{selectedLead.assignee_name || 'Unassigned'}</p>
                </div>
              </div>

              {/* AI Strategic Summary */}
              {selectedLead.ai_summary && (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 mb-6">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">AI Intent Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedLead.ai_summary}</p>
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Conversation Notes</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
              {selectedLead.status !== 'CONVERTED' && (
                <button
                  onClick={() => handleOpenConvert(selectedLead)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Convert to Customer</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedLead);
                    setShowDetailDrawer(false);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Edit Lead"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    handleOpenDelete(selectedLead);
                    setShowDetailDrawer(false);
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  title="Delete Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
              {showAddModal ? 'Add New Business Lead' : 'Edit Lead Details'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Automatic classification (Hot/Warm/Cold) will run upon saving.
            </p>

            <form onSubmit={showAddModal ? handleCreateLead : handleUpdateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
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
                    placeholder="e.g. jane@acme.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deal Value ($) *</label>
                  <input
                    type="number"
                    required
                    value={formData.deal_value}
                    onChange={(e) => setFormData({ ...formData, deal_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {leadSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pipeline Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {leadStatuses.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Employee</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes & Context</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key discovery notes or requirements..."
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
                  <span>{showAddModal ? 'Save & Classify Lead' : 'Update Lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-emerald-500/30 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Convert Lead to Customer</span>
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This will convert <span className="font-bold text-white">{selectedLead.company}</span> into an active customer account with lifetime value of <span className="font-bold text-emerald-400">${(selectedLead.deal_value || 0).toLocaleString()}</span> and log the conversion event in the customer timeline.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConvertLead}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow transition flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-rose-500/30 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Delete Lead Opportunity</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete lead <span className="font-bold text-white">{selectedLead.company}</span>? This action cannot be undone.
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
                onClick={handleDeleteLead}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-glow transition flex items-center gap-2"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classification Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Configurable Classification Rules</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              How the Upteky engine automatically determines Hot, Warm, and Cold tiers:
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <Flame className="w-4 h-4" />
                  <span>HOT Tier Conditions</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  <li>Estimated Deal Value &ge; ${activeRules?.hot_deal_value_min?.toLocaleString() || '20,000'}</li>
                  <li>Status in Qualified / Proposal / Negotiation with Deal &ge; $10,000</li>
                  <li>Referral, Partner, or Inbound Demo with AI Score &ge; 75</li>
                  <li>ML Conversion Probability &ge; {activeRules?.hot_ai_score_min || '85'}%</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Sun className="w-4 h-4" />
                  <span>WARM Tier Conditions</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  <li>Scheduled follow-up outreach within {activeRules?.follow_up_window_days || '7'} days</li>
                  <li>Deal Value between $5,000 and $20,000</li>
                  <li>Active pipeline stage (New, Contacted, Qualified, Proposal)</li>
                  <li>ML Conversion Probability &ge; 55%</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30">
                <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                  <Snowflake className="w-4 h-4" />
                  <span>COLD Tier Conditions</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  <li>Opportunity status marked as Lost</li>
                  <li>Deal Value &lt; $5,000 with no imminent follow-up outreach</li>
                  <li>Low engagement profile and score &lt; 55%</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-5 mt-5 border-t border-slate-800">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition"
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
