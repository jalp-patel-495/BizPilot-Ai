import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Inbox,
  Check,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        // Fallback baseline notifications
        setNotifications([
          {
            id: 'notif-1',
            type: 'TASK',
            title: 'High Priority Follow-Up: BioCare Health Solutions',
            message: 'Client engagement inactive for 5 days. High churn probability detected by AI engine.',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 'notif-2',
            type: 'LEAD',
            title: 'New High-Score Lead Assigned: Apex Financial',
            message: 'Inbound enterprise inquiry qualified with AI score 94/100. Deal value: Rs. 48,500.',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
          {
            id: 'notif-3',
            type: 'ALERT',
            title: 'Automated Invoice Reconciliation Complete',
            message: 'Invoice #INV-2026-088 for Nexus Systems reconciled with zero OCR discrepancy.',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: 'notif-4',
            type: 'SYSTEM',
            title: 'Security Session Policy Verified',
            message: 'Cluster security audit completed. All RBAC enforcement active with zero anomalies.',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setToastMsg('All notifications marked as read.');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerTest = async () => {
    try {
      await api.post('/notifications/trigger-test');
      fetchNotifications();
      setToastMsg('Test notification triggered!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed test notif trigger:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesUnread = !unreadOnly || !n.is_read;
    const matchesType = filterType === 'ALL' || n.type === filterType;
    return matchesUnread && matchesType;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'LEAD':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

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
                <Bell className="w-3 h-3 text-neutral-600" />
                Notification Inbox
              </span>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {unreadCount} Unread
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  All Caught Up
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Platform Alerts & Notifications
            </h1>
            <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
              Stay up-to-date with assigned task deadlines, lead scoring updates, customer follow-up alerts, and system notices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-medium border border-[#D9D9D9] transition shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All as Read</span>
              </button>
            )}
            <button
              onClick={handleTriggerTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-medium transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Alert</span>
            </button>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#666666] hover:text-[#111111] transition"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['ALL', 'TASK', 'LEAD', 'ALERT', 'SYSTEM'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                filterType === type
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] hover:bg-[#EBEBEB]'
              }`}
            >
              {type === 'ALL' ? 'All Alerts' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[#666666] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-[#CCCCCC] text-[#111111] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Unread Only</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] text-[#8A8A8A] mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-[#8A8A8A]" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">Inbox is clear</h3>
            <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
              There are currently no alerts matching your selected criteria. New messages will appear automatically.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border transition flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white border-[#E5E5E5]'
                  : 'bg-[#FAFAFA] border-[#D0D0D0] ring-1 ring-[#E5E5E5] shadow-subtle'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-full bg-white border border-[#E5E5E5] shrink-0 mt-0.5 shadow-xs">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-800">
                      {notif.type}
                    </span>
                    <h4
                      className={`text-xs ${
                        notif.is_read ? 'font-medium text-[#444444]' : 'font-bold text-[#111111]'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-[#666666] leading-relaxed mb-1.5">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-[#8A8A8A]">
                    <Clock className="w-3 h-3" />
                    <span>
                      {notif.created_at
                        ? new Date(notif.created_at).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#F5F5F5] text-[#111111] border border-[#D9D9D9] text-xs font-medium transition shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
