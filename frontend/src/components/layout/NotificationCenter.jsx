import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  UserPlus,
  TrendingDown,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import api from '../../services/api';

const EVENT_CONFIG = {
  NEW_LEAD: {
    label: 'New Lead',
    icon: UserPlus,
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  FOLLOW_UP_DUE: {
    label: 'Follow-up Due',
    icon: Clock,
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  LOW_CONVERSION: {
    label: 'Low Conversion',
    icon: TrendingDown,
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
  },
  SALES_CHANGE: {
    label: 'Sales Velocity',
    icon: TrendingUp,
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  INVOICE_PROCESSED: {
    label: 'Invoice Parsed',
    icon: FileCheck,
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  AUTOMATION_FAILURE: {
    label: 'Automation Failure',
    icon: ShieldAlert,
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  // Backward compatibility fallback
  FOLLOW_UP_ALERT: {
    label: 'Follow-up',
    icon: Clock,
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  HIGH_PRIORITY_LEAD: {
    label: 'Hot Lead',
    icon: UserPlus,
    badgeBg: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    iconColor: 'text-brand-400',
    bgColor: 'bg-brand-500/20',
  },
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, sales, alerts
  const [triggering, setTriggering] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications?limit=40'),
        api.get('/notifications/unread-count'),
      ]);
      if (notifsRes.data?.data) {
        setNotifications(notifsRes.data.data);
      }
      if (countRes.data?.data?.unread_count !== undefined) {
        setUnreadCount(countRes.data.data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      const wasUnread = notifications.find((n) => n.id === id && !n.is_read);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.link_url) {
      navigate(notif.link_url);
    }
  };

  const handleTriggerTest = async (type) => {
    try {
      setTriggering(type);
      const res = await api.post('/notifications/trigger-test', { type });
      if (res.data?.data) {
        setNotifications((prev) => [res.data.data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to trigger test notification:', err);
    } finally {
      setTriggering(null);
    }
  };

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'sales') {
      return ['NEW_LEAD', 'SALES_CHANGE', 'FOLLOW_UP_DUE', 'HIGH_PRIORITY_LEAD'].includes(n.type);
    }
    if (filter === 'alerts') {
      return ['LOW_CONVERSION', 'AUTOMATION_FAILURE', 'INVOICE_PROCESSED'].includes(n.type);
    }
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={`relative p-2 rounded-xl border transition ${
          isOpen
            ? 'bg-slate-800 border-brand-500/50 text-white'
            : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse shadow-glow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[380px] sm:w-[420px] max-w-[92vw] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Simulation Bar for 6 Required Event Triggers */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Simulate Event Triggers:</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleTriggerTest('NEW_LEAD')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition truncate text-left"
              >
                + New Lead
              </button>
              <button
                onClick={() => handleTriggerTest('FOLLOW_UP_DUE')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition truncate text-left"
              >
                + Follow-up
              </button>
              <button
                onClick={() => handleTriggerTest('LOW_CONVERSION')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition truncate text-left"
              >
                + Low Conv
              </button>
              <button
                onClick={() => handleTriggerTest('SALES_CHANGE')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition truncate text-left"
              >
                + Sales Shift
              </button>
              <button
                onClick={() => handleTriggerTest('INVOICE_PROCESSED')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition truncate text-left"
              >
                + Invoice Done
              </button>
              <button
                onClick={() => handleTriggerTest('AUTOMATION_FAILURE')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition truncate text-left"
              >
                + Auto Fail
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'unread'
                  ? 'bg-slate-800 text-brand-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('sales')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'sales'
                  ? 'bg-slate-800 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commercial
            </button>
            <button
              onClick={() => setFilter('alerts')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'alerts'
                  ? 'bg-slate-800 text-rose-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Scrollable Notifications Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-slate-400">No notifications in this filter</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Use the trigger buttons above to test live event alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const config = EVENT_CONFIG[notif.type] || {
                  label: notif.type,
                  icon: Bell,
                  badgeBg: 'bg-slate-700/20 text-slate-300 border-slate-700',
                  iconColor: 'text-slate-300',
                  bgColor: 'bg-slate-800',
                };
                const IconComponent = config.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition relative group ${
                      notif.is_read
                        ? 'bg-slate-900/40 hover:bg-slate-800/50'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-l-2 border-brand-500'
                    }`}
                  >
                    {/* Icon Bubble */}
                    <div
                      className={`p-2 rounded-xl ${config.bgColor} ${config.iconColor} flex-shrink-0 mt-0.5`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold leading-tight mb-1 truncate ${
                          notif.is_read ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Footer Actions */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        {notif.link_url && (
                          <span className="inline-flex items-center gap-1 text-brand-400 font-semibold group-hover:underline">
                            <span>Open destination</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}

                        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Dismiss"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer */}
          <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {notifications.length} total • {unreadCount} unread
            </span>
            <span className="text-brand-400 font-medium">Real-time alerts active</span>
          </div>
        </div>
      )}
    </div>
  );
};
