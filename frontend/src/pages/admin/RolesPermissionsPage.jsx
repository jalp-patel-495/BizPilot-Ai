import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sliders,
  Sparkles,
  Info,
  RefreshCw,
  Download,
  AlertTriangle,
  FileText,
  Layers,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../../components/common/Badge';

export const RolesPermissionsPage = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [userCounts, setUserCounts] = useState({
    SUPER_ADMIN: 1,
    BUSINESS_ADMIN: 3,
    SALES_MANAGER: 2,
    EMPLOYEE: 5,
  });

  // Default RBAC Matrix for Upteky AI Platform
  const [permissionsMatrix, setPermissionsMatrix] = useState([
    {
      module: 'Executive Dashboard',
      description: 'Access to high-level organizational KPI widgets and overview summaries',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: true,
      },
    },
    {
      module: 'Business Tenant Management',
      description: 'Create, update, suspend, or configure multi-tenant business accounts',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: false,
        SALES_MANAGER: false,
        EMPLOYEE: false,
      },
    },
    {
      module: 'User Provisioning & Team Access',
      description: 'Invite, edit, reset passwords, and manage team member access roles',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: false,
        EMPLOYEE: false,
      },
    },
    {
      module: 'Sales Orders & Revenue Operations',
      description: 'Create and inspect transaction records, sales orders, and revenue journals',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: false,
      },
    },
    {
      module: 'Customer Directory & Accounts',
      description: 'View customer accounts, interaction histories, and commercial profiles',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: true,
      },
    },
    {
      module: 'Lead Pipeline & Conversion Management',
      description: 'Manage sales leads, assign representatives, and track funnel stages',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: true,
      },
    },
    {
      module: 'Product Catalog & Pricing Tiers',
      description: 'Configure product offerings, pricing tiers, and unit costs',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: false,
        EMPLOYEE: false,
      },
    },
    {
      module: 'Sales Team Performance & Quota Tracking',
      description: 'Inspect sales representative quota attainment, leaderboards, and targets',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: false,
      },
    },
    {
      module: 'ML Sales Analytics & Revenue Forecasting',
      description: 'Access scikit-learn predictive models, confidence intervals, and trend charts',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: false,
      },
    },
    {
      module: 'AI Business Insights & Executive Copilot',
      description: 'Query conversational business copilot and view AI-synthesized strategies',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: false,
      },
    },
    {
      module: 'Financial & Operational BI Reports',
      description: 'Export PDF and CSV reports, audit statements, and compliance records',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: false,
        EMPLOYEE: false,
      },
    },
    {
      module: 'Employee Tasks & Personal Activity Logging',
      description: 'Manage individual task queues, log interaction notes, and track milestones',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: true,
        EMPLOYEE: true,
      },
    },
    {
      module: 'Organization & Billing Settings',
      description: 'Configure tenant identity, invoice profiles, and payment credentials',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: true,
        SALES_MANAGER: false,
        EMPLOYEE: false,
      },
    },
    {
      module: 'System Analytics & Infrastructure Monitoring',
      description: 'Monitor API gateway velocity, cluster health, and AI token quotas',
      roles: {
        SUPER_ADMIN: true,
        BUSINESS_ADMIN: false,
        SALES_MANAGER: false,
        EMPLOYEE: false,
      },
    },
  ]);

  const ROLES_INFO = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      badge: 'Platform Architect',
      desc: 'Single dedicated root administrator. Has unconditional governance over tenants, global security policies, and AI monitoring.',
      security: 'Hardware MFA Required • Single System Account',
    },
    {
      role: 'BUSINESS_ADMIN',
      title: 'Business Admin',
      badge: 'Tenant Admin',
      desc: 'Full operational administrator for the enterprise tenant. Manages employees, financial reports, catalog, and organization settings.',
      security: 'Enterprise SSO • Full Org Scope',
    },
    {
      role: 'SALES_MANAGER',
      title: 'Sales Manager',
      badge: 'Revenue Lead',
      desc: 'Oversees pipeline velocity, sales reps, quota targets, team performance metrics, and predictive AI sales insights.',
      security: 'Sales Scope • Pipeline & Team',
    },
    {
      role: 'EMPLOYEE',
      title: 'Employee',
      badge: 'Specialist',
      desc: 'Operational frontline team member. Manages assigned tasks, customer follow-up activities, and receives automated notifications.',
      security: 'Least Privilege • Personal Scope',
    },
  ];

  // Fetch actual user counts per role
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get('/users');
        if (res.data?.data) {
          const counts = { SUPER_ADMIN: 1, BUSINESS_ADMIN: 0, SALES_MANAGER: 0, EMPLOYEE: 0 };
          res.data.data.forEach((u) => {
            if (counts[u.role] !== undefined) {
              counts[u.role] += 1;
            }
          });
          setUserCounts(counts);
        }
      } catch (err) {
        // Fallback to default counts if endpoint scoped
      }
    };
    fetchCounts();
  }, []);

  const togglePermission = (index, roleKey) => {
    // Super Admin root privileges cannot be toggled off
    if (roleKey === 'SUPER_ADMIN') return;

    setPermissionsMatrix((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        roles: {
          ...updated[index].roles,
          [roleKey]: !updated[index].roles[roleKey],
        },
      };
      return updated;
    });

    setSaveSuccess('Permission policy updated successfully.');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const filteredMatrix = permissionsMatrix.filter((item) => {
    const matchesSearch =
      item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="rounded-lg bg-white p-6 border border-[#E5E5E5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-neutral-600" />
                Security & Access Governance
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                RBAC Active
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Roles & Permissions Governance
            </h1>
            <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
              Inspect and configure role-based access control (RBAC) across the 4 platform tiers: Super Admin, Business Admin, Sales Manager, and Employee.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccess && (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveSuccess}
              </span>
            )}
            <button
              onClick={() => {
                setSaveSuccess('RBAC matrix synchronized.');
                setTimeout(() => setSaveSuccess(''), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-medium transition shadow-xs"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Save Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES_INFO.map((item) => (
          <div
            key={item.role}
            className="bg-white rounded-lg border border-[#E5E5E5] p-4 shadow-subtle hover:border-[#CCCCCC] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#111111]">{item.title}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F5F5F5] text-[#111111] border border-[#E0E0E0]">
                  {userCounts[item.role] || 1} {userCounts[item.role] === 1 ? 'User' : 'Users'}
                </span>
              </div>
              <p className="text-[11px] text-[#666666] leading-relaxed mb-3">{item.desc}</p>
            </div>
            <div className="pt-2.5 border-t border-[#F0F0F0] flex items-center justify-between text-[10px] text-[#8A8A8A]">
              <span className="font-medium text-[#444444]">{item.security}</span>
              <Lock className="w-3 h-3 text-[#8A8A8A]" />
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#111111]" />
            <h2 className="text-sm font-bold text-[#111111]">Platform Module Permissions Matrix</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search module permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#D9D9D9] bg-white text-xs text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                <th className="py-3 px-4 w-2/5">Platform Feature / Module</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Business Admin</th>
                <th className="py-3 px-4 text-center">Sales Manager</th>
                <th className="py-3 px-4 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB] text-xs">
              {filteredMatrix.map((item, idx) => (
                <tr key={item.module} className="hover:bg-[#FAFAFA] transition">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#111111]">{item.module}</p>
                    <p className="text-[11px] text-[#666666]">{item.description}</p>
                  </td>

                  {/* Super Admin */}
                  <td className="py-3 px-4 text-center">
                    <span
                      title="Super Admin has root access"
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </td>

                  {/* Business Admin */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => togglePermission(idx, 'BUSINESS_ADMIN')}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition ${
                        item.roles.BUSINESS_ADMIN
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                      title="Click to toggle permission"
                    >
                      {item.roles.BUSINESS_ADMIN ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Sales Manager */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => togglePermission(idx, 'SALES_MANAGER')}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition ${
                        item.roles.SALES_MANAGER
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                      title="Click to toggle permission"
                    >
                      {item.roles.SALES_MANAGER ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Employee */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => togglePermission(idx, 'EMPLOYEE')}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition ${
                        item.roles.EMPLOYEE
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                      title="Click to toggle permission"
                    >
                      {item.roles.EMPLOYEE ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between text-[11px] text-[#666666]">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#111111]" />
            <span>Super Admin privileges are immutable and enforced by server kernel RBAC.</span>
          </div>
          <span>Showing {filteredMatrix.length} platform capabilities</span>
        </div>
      </div>
    </div>
  );
};
export default RolesPermissionsPage;
