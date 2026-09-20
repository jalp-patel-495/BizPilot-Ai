import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Layers,
  Cpu,
  UserCheck,
  Menu,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_CREDENTIALS } from '../../constants/demoCredentials';
import { RoleBadge } from '../common/Badge';
import { NotificationCenter } from './NotificationCenter';

export const Topbar = ({ onOpenMobileMenu }) => {
  const { user, demoLogin, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const handleQuickSwitch = async (roleKey) => {
    setSwitching(true);
    setShowRoleMenu(false);
    await demoLogin(roleKey);
    setSwitching(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-18 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Hamburger button + Search */}
      <div className="flex items-center gap-3 w-full sm:w-96">
        {/* Mobile menu hamburger toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, invoices, tickets, analytics..."
            className="w-full bg-slate-950/70 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Demo Role Switcher Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowProfileMenu(false);
            }}
            disabled={switching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-brand-500/50 text-xs font-medium text-slate-200 transition shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>Role:</span>
            <span className="font-bold text-brand-300">
              {DEMO_CREDENTIALS[user?.role]?.label || user?.role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Instant RBAC Persona Simulator
                </p>
                <p className="text-[10px] text-slate-500">Click any role to test permissions</p>
              </div>
              <div className="mt-1 space-y-1">
                {Object.entries(DEMO_CREDENTIALS).map(([key, cred]) => (
                  <button
                    key={key}
                    onClick={() => handleQuickSwitch(key)}
                    className={`w-full flex flex-col text-left px-3 py-2 rounded-xl text-xs transition ${
                      user?.role === cred.role
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{cred.label}</span>
                      {user?.role === cred.role && (
                        <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{cred.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Quick Link */}
        {user?.role === 'SUPER_ADMIN' && (
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 hover:text-white text-xs font-bold transition shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Admin</span>
          </Link>
        )}

        {/* Notification Center */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowRoleMenu(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user?.full_name?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400">{user?.title || 'Team Member'}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>Settings</span>
              </Link>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
