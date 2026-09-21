import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState('EMPLOYEE');
  const [title, setTitle] = useState('Operations Specialist');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/users', {
        full_name: fullName,
        email,
        password,
        role,
        title,
      });
      setIsModalOpen(false);
      setSuccess(`User ${fullName} added with role ${role}`);
      setFullName('');
      setEmail('');
      setTitle('Operations Specialist');
      fetchUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      setSuccess(`User ${name} removed`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete user');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Team & RBAC Management</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Configure member permissions and role assignments across your workspace.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs shadow-xs transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-3.5 rounded-lg bg-[#f7f7f7] border border-[#e5e5e5] text-xs text-[#111111] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Role Hierarchy Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] shadow-xs">
          <RoleBadge role="SUPER_ADMIN" />
          <p className="text-xs text-[#111111] font-semibold mt-2">Platform Architect (Single Admin)</p>
          <p className="text-[11px] text-[#666666] mt-0.5">Dedicated system administrator with global controls, tenant management, and infrastructure.</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] shadow-xs">
          <RoleBadge role="BUSINESS_ADMIN" />
          <p className="text-xs text-[#111111] font-semibold mt-2">Business Admin</p>
          <p className="text-[11px] text-[#666666] mt-0.5">Team management, organization settings, billing, and complete business analytics.</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] shadow-xs">
          <RoleBadge role="EMPLOYEE" />
          <p className="text-xs text-[#111111] font-semibold mt-2">Employee Specialist</p>
          <p className="text-[11px] text-[#666666] mt-0.5">Assigned operational leads, customer support tickets, and sales activities.</p>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, email, or role..."
              className="w-full bg-white border border-[#d9d9d9] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#111111] transition"
            />
          </div>
          <span className="text-xs text-[#666666]">{filteredUsers.length} total members</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#666666] border-b border-[#e5e5e5]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role & Access</th>
                <th className="px-4 py-3">Title / Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8a8a8a]">
                    Loading team accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8a8a8a]">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8f8f8] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#f3f3f3] text-[#111111] border border-[#e5e5e5] flex items-center justify-center font-bold text-xs">
                          {u.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111111]">{u.full_name}</p>
                          <p className="text-[11px] text-[#666666]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{u.title || 'Staff'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.full_name)}
                          className="p-1 rounded text-[#8a8a8a] hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Team Member">
        {error && (
          <div className="mb-3.5 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateUser} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jordan Miller"
              className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@company.com"
              className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-[#d9d9d9] rounded-md px-2.5 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
              >
                <option value="BUSINESS_ADMIN">Business Admin</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Account Exec"
                className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">
              Initial Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#666666] hover:text-[#111111]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition shadow-xs"
            >
              {submitting ? 'Creating...' : 'Confirm & Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
