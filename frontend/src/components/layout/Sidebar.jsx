import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  ShoppingBag,
  Layers,
  BarChart3,
  Bot,
  Zap,
  Settings,
  ReceiptText,
  User,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../common/Badge';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  // The 9 Specified Core Platform Modules
  const coreModules = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Leads', path: '/leads', icon: Target },
    { label: 'Sales', path: '/sales', icon: ShoppingBag },
    { label: 'Products', path: '/products', icon: Layers },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Automation', path: '/automation', icon: Zap },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Secondary Tools
  const secondaryTools = [
    { label: 'Super Admin', path: '/admin', icon: ShieldCheck, roles: ['SUPER_ADMIN'], badge: 'SAAS' },
    { label: 'AI Sales Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Smart Invoices', path: '/invoices', icon: ReceiptText },
    { label: 'Support Copilot', path: '/support', icon: ShieldCheck },
    { label: 'Team & RBAC', path: '/users', icon: User, roles: ['SUPER_ADMIN', 'BUSINESS_ADMIN'] },
  ].filter((item) => !item.roles || item.roles.includes(user?.role) || user?.role === 'SUPER_ADMIN');

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0 bg-slate-900/95 lg:bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between backdrop-blur-xl transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-white text-base tracking-tight">Upteky AI</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Business Operations</p>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Tenant / Org Pill */}
        <div className="mx-4 mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
          <div className="truncate">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tenant Org</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.organization_name || 'Upteky Technologies'}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
        </div>

        {/* The 9 Specified Core Modules */}
        <nav className="mt-4 px-3 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
            Core Modules
          </p>
          {coreModules.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-brand-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary Tools */}
        <div className="mt-4 px-3 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
            Operations & Team
          </p>
          {secondaryTools.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-brand-400" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <Link
          to="/profile"
          onClick={onCloseMobile}
          className="flex items-center gap-3 mb-3 p-1.5 rounded-xl hover:bg-slate-800/50 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate group-hover:text-brand-300 transition">
              {user?.full_name}
            </p>
            <RoleBadge role={user?.role || 'EMPLOYEE'} />
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
