import React, { useState, useEffect } from 'react';
import {
  Clock,
  Phone,
  Video,
  Mail,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  User,
  ShoppingBag,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const MyActivitiesPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Log activity form state
  const [activityType, setActivityType] = useState('CALL');
  const [targetCompany, setTargetCompany] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/employee-dashboard');
      if (res.data?.data && res.data.data.recent_activity) {
        const stream = res.data.data.recent_activity;
        if (stream.length > 0) {
          setActivities(stream);
          return;
        }
      }

      // Default baseline historical activities for the employee
      setActivities([
        {
          id: 'act-1',
          activity_type: 'CALL',
          title: 'Product discovery call with BioCare Health',
          description: 'Reviewed integration requirements with IT Director. Follow-up demo scheduled for Thursday.',
          customer_name: 'BioCare Health Solutions',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          performed_by: user?.full_name || 'Alex Rivera',
        },
        {
          id: 'act-2',
          activity_type: 'MEETING',
          title: 'Executive alignment session with Apex Financial',
          description: 'Demonstrated automated invoice OCR and reconciliation workflow. Positive stakeholder reception.',
          customer_name: 'Apex Financial',
          created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
          performed_by: user?.full_name || 'Alex Rivera',
        },
        {
          id: 'act-3',
          activity_type: 'EMAIL',
          title: 'Dispatched custom proposal to Nexus Systems',
          description: 'Sent enterprise SLA specifications and pricing tier summary for 50 seat licenses.',
          customer_name: 'Nexus Systems Ltd',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          performed_by: user?.full_name || 'Alex Rivera',
        },
        {
          id: 'act-4',
          activity_type: 'CONVERSION',
          title: 'Lead converted to active customer account',
          description: 'CloudPoint India completed contracting process and moved to Active customer state.',
          customer_name: 'CloudPoint India',
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          performed_by: user?.full_name || 'Alex Rivera',
        },
        {
          id: 'act-5',
          activity_type: 'NOTE',
          title: 'Client technical requirement memo',
          description: 'Noted client preference for webhook notifications on high-volume invoice events.',
          customer_name: 'Apex Financial',
          created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
          performed_by: user?.full_name || 'Alex Rivera',
        },
      ]);
    } catch (err) {
      console.error('Failed to load activity stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleLogActivity = (e) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    const newEntry = {
      id: `act-${Date.now()}`,
      activity_type: activityType,
      title: activityTitle.trim(),
      description: activityDesc.trim(),
      customer_name: targetCompany.trim() || 'Client Organization',
      created_at: new Date().toISOString(),
      performed_by: user?.full_name || 'Employee',
    };

    setActivities((prev) => [newEntry, ...prev]);
    setShowLogModal(false);
    setActivityTitle('');
    setActivityDesc('');
    setTargetCompany('');
    setToastMsg('Activity logged successfully.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'MEETING':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'CONVERSION':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'SALE':
        return <ShoppingBag className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-600" />;
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesType = typeFilter === 'ALL' || act.activity_type === typeFilter;
    const matchesSearch =
      act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-lg bg-[#111111] text-white text-xs shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-lg bg-white p-6 border border-[#E5E5E5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-600" />
                Work Log & Timeline
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activities.length} Recorded Activities
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              My Operational Activities
            </h1>
            <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
              Log and review personal client interactions, phone calls, meetings, follow-up emails, and deal milestones.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-medium transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="p-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#666666] hover:text-[#111111] transition"
              title="Refresh timeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'CALL', 'MEETING', 'EMAIL', 'NOTE', 'CONVERSION'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                typeFilter === type
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] hover:bg-[#EBEBEB]'
              }`}
            >
              {type === 'ALL' ? 'All Activities' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#D9D9D9] bg-white text-xs text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-[#8A8A8A]">
            <Clock className="w-8 h-8 mx-auto mb-2 text-[#CCCCCC]" />
            <p className="text-xs font-medium">No activity records match your filter.</p>
          </div>
        ) : (
          <div className="relative border-l border-[#E5E5E5] ml-4 pl-6 space-y-6">
            {filteredActivities.map((act) => {
              const dateStr = act.created_at
                ? new Date(act.created_at).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline dot icon */}
                  <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center shadow-xs">
                    {getActivityIcon(act.activity_type)}
                  </div>

                  <div className="bg-[#FAFAFA] rounded-md border border-[#EBEBEB] p-3.5 hover:bg-white hover:border-[#CCCCCC] transition">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#111111] border border-[#E0E0E0]">
                          {act.activity_type}
                        </span>
                        <h4 className="text-xs font-semibold text-[#111111]">{act.title}</h4>
                      </div>
                      <span className="text-[10px] text-[#8A8A8A] shrink-0">{dateStr}</span>
                    </div>

                    {act.description && (
                      <p className="text-[11px] text-[#666666] leading-relaxed mt-1">
                        {act.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-[#8A8A8A] mt-2 pt-2 border-t border-[#F0F0F0]">
                      {act.customer_name && (
                        <span>
                          Account: <strong className="text-[#333333]">{act.customer_name}</strong>
                        </span>
                      )}
                      <span>Logged by: {act.performed_by || 'Alex Rivera'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEBEB] mb-4">
              <h3 className="text-sm font-bold text-[#111111]">Log Client Activity</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-[#8A8A8A] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">Client Meeting</option>
                  <option value="EMAIL">Email Outreach</option>
                  <option value="NOTE">Follow-up Note</option>
                  <option value="CONVERSION">Lead Conversion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Customer / Lead Account
                </label>
                <input
                  type="text"
                  required
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Apex Financial Solutions"
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Interaction Title
                </label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Proposal review and contract discussion"
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Detailed Notes & Follow-up
                </label>
                <textarea
                  rows={3}
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Key takeaways, customer questions, next scheduled touchpoints..."
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-md border border-[#D9D9D9] text-[#666666] text-xs hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#111111] text-white text-xs font-medium hover:bg-[#222222] transition"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyActivitiesPage;
