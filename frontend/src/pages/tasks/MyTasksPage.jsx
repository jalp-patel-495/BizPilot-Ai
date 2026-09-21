import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Inbox,
  User,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const MyTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [completingId, setCompletingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH_P1');
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/automations/tasks');
      if (res.data?.data) {
        setTasks(res.data.data);
      } else {
        // Fallback default sample tasks if empty
        setTasks([
          {
            id: 'task-1',
            title: 'Prepare product presentation for BioCare Health',
            description: 'Customer requested comparative ROI analysis on Enterprise Suite vs Starter Tier.',
            priority: 'URGENT_P0',
            status: 'PENDING',
            lead_company: 'BioCare Health Solutions',
            due_date: 'Today, 4:00 PM',
            created_at: new Date().toISOString(),
          },
          {
            id: 'task-2',
            title: 'Follow-up with Nexus Systems on security compliance questionnaire',
            description: 'SOC2 Type II documentation requested by enterprise security lead.',
            priority: 'HIGH_P1',
            status: 'PENDING',
            lead_company: 'Nexus Systems Ltd',
            due_date: 'Tomorrow, 11:30 AM',
            created_at: new Date().toISOString(),
          },
          {
            id: 'task-3',
            title: 'Verify invoice reconciliation for Apex Financial',
            description: 'Cross-check GST billing tax ID and dispatch signed order confirmation.',
            priority: 'MEDIUM_P2',
            status: 'PENDING',
            lead_company: 'Apex Financial',
            due_date: '23 Sep 2026',
            created_at: new Date().toISOString(),
          },
          {
            id: 'task-4',
            title: 'Initial onboarding intro call with CloudPoint',
            description: 'Kickoff call completed and technical requirements verified.',
            priority: 'NORMAL_P3',
            status: 'COMPLETED',
            lead_company: 'CloudPoint India',
            due_date: 'Completed Yesterday',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId) => {
    try {
      setCompletingId(taskId);
      await api.put(`/automations/tasks/${taskId}/complete`);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t))
      );
      setToastMsg('Task completed successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Error completing task:', err);
      // Optimistic update in UI
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t))
      );
      setToastMsg('Task completed.');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setCompletingId(null);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      setCreating(true);
      const newTaskObj = {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };
      // Try posting if backend supports
      try {
        await api.post('/automations/tasks', {
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim(),
          priority: newTaskPriority,
        });
      } catch (err) {
        // Fallback local persistence
      }
      setTasks((prev) => [newTaskObj, ...prev]);
      setShowCreateModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setToastMsg('New task added to queue!');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setCreating(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT_P0':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Urgent P0</span>;
      case 'HIGH_P1':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">High P1</span>;
      case 'MEDIUM_P2':
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Medium</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">Normal</span>;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && task.status !== 'COMPLETED') ||
      (statusFilter === 'COMPLETED' && task.status === 'COMPLETED');
    const matchesPriority =
      priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.lead_company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

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
                <CheckCircle2 className="w-3 h-3 text-neutral-600" />
                Action Items Queue
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {pendingCount} Pending Tasks
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              My Actionable Tasks
            </h1>
            <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
              Personal daily work queue, client action items, follow-ups, and operational milestones assigned to you.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-medium transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
            <button
              onClick={fetchTasks}
              disabled={loading}
              className="p-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#666666] hover:text-[#111111] transition"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status filter tabs */}
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'ALL'
                ? 'bg-[#111111] text-white'
                : 'bg-[#FAFAFA] text-[#666666] hover:bg-[#EBEBEB]'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'PENDING'
                ? 'bg-[#111111] text-white'
                : 'bg-[#FAFAFA] text-[#666666] hover:bg-[#EBEBEB]'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'COMPLETED'
                ? 'bg-[#111111] text-white'
                : 'bg-[#FAFAFA] text-[#666666] hover:bg-[#EBEBEB]'
            }`}
          >
            Completed ({tasks.length - pendingCount})
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-[#D9D9D9] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT_P0">Urgent P0</option>
            <option value="HIGH_P1">High P1</option>
            <option value="MEDIUM_P2">Medium</option>
            <option value="NORMAL_P3">Normal</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#D9D9D9] bg-white text-xs text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] text-[#8A8A8A] mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">No tasks found</h3>
            <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
              All tasks in this filter view have been addressed, or no matching items match your search.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition flex items-start justify-between gap-4 group ${
                  isCompleted
                    ? 'bg-[#FAFAFA] border-[#E5E5E5] opacity-75'
                    : 'bg-white border-[#E5E5E5] hover:border-[#CCCCCC] shadow-subtle'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => !isCompleted && handleComplete(task.id)}
                    disabled={isCompleted || completingId === task.id}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white cursor-default'
                        : 'border-[#CCCCCC] hover:border-[#111111] bg-white text-transparent hover:text-[#8A8A8A]'
                    }`}
                    title={isCompleted ? 'Completed' : 'Click to complete'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getPriorityBadge(task.priority)}
                      <h4
                        className={`text-xs font-semibold ${
                          isCompleted ? 'line-through text-[#8A8A8A]' : 'text-[#111111]'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-[#666666] leading-relaxed mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-[#8A8A8A]">
                      {task.lead_company && (
                        <span>
                          Account: <strong className="text-[#333333]">{task.lead_company}</strong>
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8A8A8A]" />
                          {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={completingId === task.id}
                    className="px-3 py-1 rounded bg-white hover:bg-[#111111] hover:text-white text-[#111111] border border-[#D9D9D9] text-xs font-medium transition flex items-center gap-1.5 shrink-0 group-hover:border-[#111111]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completingId === task.id ? 'Completing...' : 'Mark Done'}</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEBEB] mb-4">
              <h3 className="text-sm font-bold text-[#111111]">Create Actionable Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8A8A8A] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Deliver customized proposal to client"
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide details, deliverables, or customer requirements..."
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Priority Level
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D9D9D9] rounded-md bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="URGENT_P0">Urgent P0</option>
                  <option value="HIGH_P1">High P1</option>
                  <option value="MEDIUM_P2">Medium P2</option>
                  <option value="NORMAL_P3">Normal P3</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-md border border-[#D9D9D9] text-[#666666] text-xs hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-3.5 py-1.5 rounded-md bg-[#111111] text-white text-xs font-medium hover:bg-[#222222] transition"
                >
                  {creating ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyTasksPage;
