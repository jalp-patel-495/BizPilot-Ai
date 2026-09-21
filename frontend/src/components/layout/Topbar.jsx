import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
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
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-[#E5E5E5] bg-white flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Hamburger button + Search */}
      <div className="flex items-center gap-3 w-full sm:w-96">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, invoices, tickets, analytics..."
            className="w-full bg-white text-[#111111] text-xs rounded-md pl-9 pr-3 py-1.5 border border-[#D9D9D9] focus:outline-none focus:border-[#111111] transition placeholder:text-[#8A8A8A]"
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
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-[#D9D9D9] hover:bg-[#F7F7F7] text-xs font-medium text-[#111111] transition"
          >
            <Cpu className="w-3.5 h-3.5 text-[#555555]" />
            <span className="text-[#666666]">Role:</span>
            <span className="font-semibold text-[#111111]">
              {DEMO_CREDENTIALS[user?.role]?.label || user?.role}
            </span>
            <ChevronDown className="w-3 h-3 text-[#666666]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E5E5] rounded-lg shadow-dropdown p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-2 border-b border-[#EBEBEB]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  RBAC Persona Simulator
                </p>
                <p className="text-[10px] text-[#8A8A8A]">Click any role to test permissions</p>
              </div>
              <div className="mt-1 space-y-0.5">
                {Object.entries(DEMO_CREDENTIALS).map(([key, cred]) => (
                  <button
                    key={key}
                    onClick={() => handleQuickSwitch(key)}
                    className={`w-full flex flex-col text-left px-2.5 py-1.5 rounded-md text-xs transition ${
                      user?.role === cred.role
                        ? 'bg-[#F3F3F3] text-[#111111] font-semibold'
                        : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cred.label}</span>
                      {user?.role === cred.role && (
                        <UserCheck className="w-3.5 h-3.5 text-[#111111]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#8A8A8A] font-normal">{cred.desc}</span>
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
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F3F3F3] hover:bg-[#EBEBEB] border border-[#D9D9D9] text-[#111111] text-xs font-medium transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
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
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[#F7F7F7] transition"
          >
            <div className="w-7 h-7 rounded-md bg-[#111111] text-white flex items-center justify-center font-semibold text-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#111111] leading-tight">{user?.full_name?.split(' ')[0]}</p>
              <p className="text-[10px] text-[#8A8A8A]">{user?.title || 'Team Member'}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#666666] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E5E5E5] rounded-lg shadow-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#EBEBEB] mb-1">
                <p className="text-xs font-semibold text-[#111111] truncate">{user?.full_name}</p>
                <p className="text-[10px] text-[#8A8A8A] truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] rounded-md transition font-medium"
              >
                <User className="w-3.5 h-3.5 text-[#555555]" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] rounded-md transition font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-[#555555]" />
                <span>Settings</span>
              </Link>

              <div className="border-t border-[#EBEBEB] my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition font-medium"
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
