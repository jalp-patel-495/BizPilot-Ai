import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Lock,
  Building,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Bell,
  Save,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../../components/common/Badge';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [leadNotifications, setLeadNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setSavingProfile(true);
    const res = await updateProfile({ full_name: fullName, title });
    setSavingProfile(false);
    if (res.success) {
      setProfileMsg('Profile information updated successfully.');
      setTimeout(() => setProfileMsg(''), 4000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');

    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    const res = await updateProfile({ current_password: currentPassword, new_password: newPassword });
    setSavingPassword(false);

    if (res.success) {
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } else {
      setPasswordErr(res.error || 'Password update failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">User Profile & Security</h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Manage your personal credentials, workspace identity, security credentials, and active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Profile Card & Sessions */}
        <div className="space-y-5">
          {/* Identity Card */}
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>

            <h3 className="text-base font-bold text-[#111111]">{user?.full_name}</h3>
            <p className="text-xs text-[#666666] mt-0.5">{user?.email}</p>
            <p className="text-xs text-[#111111] font-medium mt-0.5">{user?.title || 'Team Member'}</p>

            <div className="mt-3.5 pt-3.5 border-t border-[#e5e5e5] flex items-center justify-center gap-2">
              <RoleBadge role={user?.role || 'EMPLOYEE'} />
            </div>

            <div className="mt-3.5 p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#666666]">
                <span>Organization:</span>
                <span className="text-[#111111] font-medium">{user?.organization_name || 'Upteky Technologies'}</span>
              </div>
              <div className="flex items-center justify-between text-[#666666]">
                <span>Status:</span>
                <span className="text-emerald-700 font-medium">Active Account</span>
              </div>
              <div className="flex items-center justify-between text-[#666666]">
                <span>Joined:</span>
                <span className="text-[#111111] font-mono">Sep 2026</span>
              </div>
            </div>
          </div>

          {/* Active Devices & Sessions */}
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e5e5e5]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                Active Devices & Sessions
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-[#f3f3f3] text-[#111111]">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#111111]">Chrome on Windows 11</p>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Current
                    </span>
                  </div>
                  <p className="text-[10px] text-[#666666] mt-0.5 font-mono">IP: 127.0.0.1 • Localhost</p>
                  <p className="text-[10px] text-[#8a8a8a]">Active right now</p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-start gap-2.5 opacity-75">
                <div className="p-1.5 rounded-md bg-[#f3f3f3] text-[#8a8a8a]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#111111]">Safari on iPhone 15 Pro</p>
                  <p className="text-[10px] text-[#666666] mt-0.5 font-mono">IP: 192.168.1.45</p>
                  <p className="text-[10px] text-[#8a8a8a]">Last active: 2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information Form */}
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e5e5e5]">
              <User className="w-4 h-4 text-[#111111]" />
              <h3 className="text-sm font-semibold text-[#111111]">Personal Information</h3>
            </div>

            {profileMsg && (
              <div className="p-3 rounded-md bg-[#f7f7f7] border border-[#e5e5e5] text-xs text-[#111111] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-[#fafafa] border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#666666] cursor-not-allowed"
                />
                <p className="text-[10px] text-[#8a8a8a] mt-1">To change work email, contact your organization administrator.</p>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e5e5e5]">
              <KeyRound className="w-4 h-4 text-[#111111]" />
              <h3 className="text-sm font-semibold text-[#111111]">Security & Password</h3>
            </div>

            {passwordMsg && (
              <div className="p-3 rounded-md bg-[#f7f7f7] border border-[#e5e5e5] text-xs text-[#111111] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{passwordMsg}</span>
              </div>
            )}
            {passwordErr && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordErr}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] font-semibold text-xs transition border border-[#d9d9d9] shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-[#666666]" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notifications Preferences */}
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e5e5e5]">
              <Bell className="w-4 h-4 text-[#111111]" />
              <h3 className="text-sm font-semibold text-[#111111]">Notifications & Alerts</h3>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
                <div>
                  <p className="text-xs font-medium text-[#111111]">Deal & Lead Score Alerts</p>
                  <p className="text-[11px] text-[#666666]">Receive alerts when leads achieve an AI score above 80</p>
                </div>
                <input
                  type="checkbox"
                  checked={leadNotifications}
                  onChange={(e) => setLeadNotifications(e.target.checked)}
                  className="w-4 h-4 accent-[#111111] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
                <div>
                  <p className="text-xs font-medium text-[#111111]">Support SLA Escalations</p>
                  <p className="text-[11px] text-[#666666]">Immediate dispatch for urgent priority tickets</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#111111] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
                <div>
                  <p className="text-xs font-medium text-[#111111]">Weekly Executive Report</p>
                  <p className="text-[11px] text-[#666666]">Automated digest delivered every Monday morning</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
                  className="w-4 h-4 accent-[#111111] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
