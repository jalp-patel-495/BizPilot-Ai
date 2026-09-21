import React from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  LogOut,
  X,
  Sparkles,
  Building2,
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../common/Badge';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const ROLE_NAVIGATIONS = {
    SUPER_ADMIN: {
      section: 'Super Admin Console',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Businesses', path: '/businesses', icon: Building2 },
        { label: 'Users', path: '/users', icon: Users },
        { label: 'Roles & Permissions', path: '/roles-permissions', icon: ShieldCheck },
        { label: 'System Analytics', path: '/system-analytics', icon: BarChart3 },
        { label: 'AI Monitoring', path: '/ai-monitoring', icon: Sparkles },
      ],
    },
    BUSINESS_ADMIN: {
      section: 'Business Operations',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Sales', path: '/sales', icon: ShoppingBag },
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Products', path: '/products', icon: Layers },
        { label: 'Employees', path: '/employees', icon: User },
        { label: 'Analytics', path: '/analytics', icon: TrendingUp },
        { label: 'AI Insights', path: '/ai-insights', icon: Sparkles },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
    SALES_MANAGER: {
      section: 'Sales Operations',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Leads', path: '/leads', icon: Target },
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Sales', path: '/sales', icon: ShoppingBag },
        { label: 'Team Performance', path: '/team-performance', icon: Users },
        { label: 'Sales Analytics', path: '/sales-analytics', icon: TrendingUp },
        { label: 'AI Sales Insights', path: '/ai-sales-insights', icon: Sparkles },
      ],
    },
    EMPLOYEE: {
      section: 'Employee Workspace',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Tasks', path: '/tasks', icon: CheckCircle2 },
        { label: 'My Activities', path: '/activities', icon: Clock },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  };

  // Least-privilege default: an unknown/missing role should never see the
  // Business Admin navigation menu — fall back to the Employee menu instead.
  const currentRoleNav = ROLE_NAVIGATIONS[user?.role] || ROLE_NAVIGATIONS.EMPLOYEE;

  const isItemActive = (itemPath) => {
    const currentFull = location.pathname + location.search;
    if (itemPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (itemPath.includes('?')) {
      return currentFull === itemPath;
    }
    return location.pathname === itemPath && (!location.search || location.search === '');
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0 bg-white border-r border-[#E5E5E5] flex flex-col justify-between transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#111111] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#111111] text-sm tracking-tight">Upteky AI</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#8A8A8A]">
                {user?.role === 'SUPER_ADMIN' ? 'Platform Console' : 'Business Operations'}
              </p>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Tenant / Role Container */}
        <div className="mx-3.5 mt-3.5 p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E5E5] flex items-center justify-between">
          <div className="truncate">
            <p className="text-[10px] font-medium text-[#8A8A8A] uppercase tracking-wider">
              {user?.role === 'SUPER_ADMIN' ? 'System Console' : 'Tenant Org'}
            </p>
            <p className="text-xs font-semibold text-[#111111] truncate">
              {user?.role === 'SUPER_ADMIN' ? 'Upteky Global Cloud' : (user?.organization_name || 'Upteky Technologies')}
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
        </div>

        {/* Role-Specific Navigation */}
        <nav className="mt-4 px-2.5 space-y-0.5 pb-6">
          <p className="px-2.5 pb-1.5 text-[10px] font-medium tracking-wider uppercase text-[#8A8A8A]">
            {currentRoleNav.section}
          </p>
          {currentRoleNav.items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors duration-150 group ${
                  active
                    ? 'bg-[#F3F3F3] text-[#111111] font-semibold'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-[#111111]' : 'text-[#666666] group-hover:text-[#111111]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3.5 border-t border-[#E5E5E5] bg-white">
        <Link
          to="/profile"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 mb-2 p-1.5 rounded-md hover:bg-[#F7F7F7] transition group"
        >
          <div className="w-7 h-7 rounded-md bg-[#111111] text-white flex items-center justify-center font-semibold text-xs">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#111111] truncate">
              {user?.full_name || 'Admin User'}
            </p>
            <RoleBadge role={user?.role || 'EMPLOYEE'} />
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition border border-transparent hover:border-[#FCA5A5]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
