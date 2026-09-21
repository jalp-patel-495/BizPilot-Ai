import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, ArrowRight, X, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUSINESS_ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
        title:
          role === 'BUSINESS_ADMIN'
            ? 'Business Administrator'
            : role === 'SALES_MANAGER'
            ? 'Sales Manager'
            : 'Operations Specialist',
      });

      if (res.success) {
        // Account created AND the user is now actually logged in as
        // themselves (see AuthContext.register), so it's safe to go
        // straight to the dashboard — no email verification step.
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-[#111111] text-white mb-1 shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Create Tenant Account</h1>
          <p className="text-xs text-[#666666]">
            Join the Upteky AI Intelligent Business Platform
          </p>
        </div>

        <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative">
          {/* Direct Close Button to Home Page */}
          <Link
            to="/"
            className="absolute top-4 right-4 p-2 text-[#8A8A8A] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-full transition flex items-center justify-center"
            title="Close and return to Home"
            aria-label="Close and return to Home"
          >
            <X className="w-5 h-5" />
          </Link>

          {error && (
            <div className="mb-4 p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-xs font-semibold text-[#111111] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jordan Miller"
                  className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#111111] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                />
              </div>
            </div>

            {/* Role-Based Account Creation */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Account Role (Select Role)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('BUSINESS_ADMIN')}
                  className={`p-3 rounded-[6px] border text-left transition flex flex-col justify-between ${
                    role === 'BUSINESS_ADMIN'
                      ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]'
                      : 'border-[#D9D9D9] bg-white hover:border-[#8A8A8A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#111111]">Business Admin</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        role === 'BUSINESS_ADMIN' ? 'border-[#111111] bg-[#111111]' : 'border-[#CCCCCC]'
                      }`}
                    >
                      {role === 'BUSINESS_ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-snug">
                    Full organization administration, finance, products, and operations.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('SALES_MANAGER')}
                  className={`p-3 rounded-[6px] border text-left transition flex flex-col justify-between ${
                    role === 'SALES_MANAGER'
                      ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]'
                      : 'border-[#D9D9D9] bg-white hover:border-[#8A8A8A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#111111]">Sales Manager</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        role === 'SALES_MANAGER' ? 'border-[#111111] bg-[#111111]' : 'border-[#CCCCCC]'
                      }`}
                    >
                      {role === 'SALES_MANAGER' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-snug">
                    Sales pipeline, leads, team performance quotas, and deal analytics.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('EMPLOYEE')}
                  className={`p-3 rounded-[6px] border text-left transition flex flex-col justify-between ${
                    role === 'EMPLOYEE'
                      ? 'border-[#111111] bg-[#FAFAFA] ring-1 ring-[#111111]'
                      : 'border-[#D9D9D9] bg-white hover:border-[#8A8A8A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#111111]">Employee</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        role === 'EMPLOYEE' ? 'border-[#111111] bg-[#111111]' : 'border-[#CCCCCC]'
                      }`}
                    >
                      {role === 'EMPLOYEE' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-snug">
                    Daily tasks, personal activity tracking, assigned leads, and notifications.
                  </p>
                </button>
              </div>
            </div>

            {/* Super Admin Notice */}
            <div className="p-2.5 rounded-[6px] bg-[#F7F7F7] border border-[#E5E5E5] text-[11px] text-[#666666] flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Super Admin Notice:</strong> Super Admin is a single system administrator account that can only log in directly and cannot be registered.
              </span>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#111111] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white font-medium text-sm transition duration-150 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[#666666]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#111111] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
