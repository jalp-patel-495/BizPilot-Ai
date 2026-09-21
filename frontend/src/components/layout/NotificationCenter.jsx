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
  ShieldAlert,
  Trash2,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';

const EVENT_CONFIG = {
  NEW_LEAD: {
    label: 'New Lead',
    icon: UserPlus,
    badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    iconColor: 'text-[#111111]',
    bgColor: 'bg-[#F3F3F3]',
  },
  FOLLOW_UP_DUE: {
    label: 'Follow-up Due',
    icon: Clock,
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    iconColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  LOW_CONVERSION: {
    label: 'Low Conversion',
    icon: TrendingDown,
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    iconColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
  },
  SALES_CHANGE: {
    label: 'Sales Velocity',
    icon: TrendingUp,
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  INVOICE_PROCESSED: {
    label: 'Invoice Parsed',
    icon: FileCheck,
    badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    iconColor: 'text-[#111111]',
    bgColor: 'bg-[#F3F3F3]',
  },
  AUTOMATION_FAILURE: {
    label: 'Automation Failure',
    icon: ShieldAlert,
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    iconColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
  },
  FOLLOW_UP_ALERT: {
    label: 'Follow-up',
    icon: Clock,
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    iconColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  HIGH_PRIORITY_LEAD: {
    label: 'Hot Lead',
    icon: UserPlus,
    badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    iconColor: 'text-[#111111]',
    bgColor: 'bg-[#F3F3F3]',
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
  const [filter, setFilter] = useState('all');
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
        className={`relative p-2 rounded-md border transition ${
          isOpen
            ? 'bg-[#F3F3F3] border-[#111111] text-[#111111]'
            : 'bg-white border-[#D9D9D9] text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
        }`}
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-[#111111] text-white text-[9px] font-semibold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] sm:w-[400px] max-w-[92vw] bg-white border border-[#E5E5E5] rounded-lg shadow-dropdown z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-3.5 border-b border-[#EBEBEB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9]">
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-medium text-[#666666] hover:text-[#111111] transition flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 text-[#8A8A8A] hover:text-[#111111] transition rounded-md hover:bg-[#F7F7F7]"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#111111]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Simulation Bar */}
          <div className="px-3 py-2 bg-[#FAFAFA] border-b border-[#EBEBEB]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#666666] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#555555]" />
                <span>Simulate Event Triggers:</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleTriggerTest('NEW_LEAD')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9] transition truncate text-left"
              >
                + New Lead
              </button>
              <button
                onClick={() => handleTriggerTest('FOLLOW_UP_DUE')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9] transition truncate text-left"
              >
                + Follow-up
              </button>
              <button
                onClick={() => handleTriggerTest('LOW_CONVERSION')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9] transition truncate text-left"
              >
                + Low Conv
              </button>
              <button
                onClick={() => handleTriggerTest('SALES_CHANGE')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9] transition truncate text-left"
              >
                + Sales Shift
              </button>
              <button
                onClick={() => handleTriggerTest('INVOICE_PROCESSED')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9] transition truncate text-left"
              >
                + Invoice Done
              </button>
              <button
                onClick={() => handleTriggerTest('AUTOMATION_FAILURE')}
                disabled={triggering !== null}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white hover:bg-[#F3F3F3] text-[#111111] border border-[#D9D9D9] transition truncate text-left"
              >
                + Auto Fail
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 py-1.5 bg-white border-b border-[#EBEBEB] flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'all'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'unread'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('sales')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'sales'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              Commercial
            </button>
            <button
              onClick={() => setFilter('alerts')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'alerts'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Scrollable Notifications Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F0] overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-[#8A8A8A]">
                <Bell className="w-6 h-6 text-[#CCCCCC] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#666666]">No notifications</p>
                <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                  Use the trigger buttons above to test live event alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const config = EVENT_CONFIG[notif.type] || {
                  label: notif.type,
                  icon: Bell,
                  badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
                  iconColor: 'text-[#111111]',
                  bgColor: 'bg-[#F3F3F3]',
                };
                const IconComponent = config.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition relative group ${
                      notif.is_read
                        ? 'bg-white hover:bg-[#F9FAFB]'
                        : 'bg-[#FAFAFA] hover:bg-[#F5F5F5] border-l-2 border-[#111111]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${config.bgColor} ${config.iconColor} flex-shrink-0 mt-0.5 border border-[#E5E5E5]`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold border uppercase tracking-wider ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] text-[#8A8A8A] whitespace-nowrap">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs leading-tight mb-1 truncate ${
                          notif.is_read ? 'text-[#666666] font-normal' : 'text-[#111111] font-semibold'
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-[#666666] leading-snug line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#8A8A8A]">
                        {notif.link_url && (
                          <span className="inline-flex items-center gap-1 text-[#111111] font-medium group-hover:underline">
                            <span>Open destination</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}

                        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="p-1 rounded text-[#666666] hover:text-[#111111] hover:bg-[#EBEBEB] transition"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="p-1 rounded text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition"
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
          <div className="p-2.5 bg-[#FAFAFA] border-t border-[#EBEBEB] flex items-center justify-between text-[11px] text-[#8A8A8A]">
            <span>
              {notifications.length} total • {unreadCount} unread
            </span>
            <span className="text-[#111111] font-medium">Real-time alerts active</span>
          </div>
        </div>
      )}
    </div>
  );
};
