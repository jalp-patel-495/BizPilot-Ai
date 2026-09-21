import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shield, ArrowRight, Lock, Mail, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_CREDENTIALS } from '../../constants/demoCredentials';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const handleQuickLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    const res = await demoLogin(roleKey);
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    } else {
      setError(res?.error || 'Could not sign in with demo role');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-[#111111] text-white mb-1 shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Upteky AI</h1>
          <p className="text-xs text-[#666666]">
            Intelligent Business Automation & Analytics Platform
          </p>
        </div>

        {/* Main Card */}
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
            <div className="mb-5 p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#111111]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#666666] hover:text-[#111111] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white font-medium text-sm transition duration-150 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#111111]" />
              <span className="text-xs font-semibold text-[#111111]">
                Instant Demo Logins (Select Role)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(DEMO_CREDENTIALS).map(([key, cred]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleQuickLogin(key)}
                  disabled={loading}
                  className="text-left p-2.5 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#111111] hover:bg-white transition group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold text-[#111111] group-hover:text-black leading-tight">
                      {cred.label}
                    </span>
                    <span className="text-[9px] text-[#666666] font-medium bg-[#EBEBEB] px-1 py-0.5 rounded shrink-0">1-Click</span>
                  </div>
                  <p className="text-[10px] text-[#666666] truncate mt-1">{cred.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#666666]">
          Need a new organization workspace?{' '}
          <Link to="/register" className="text-[#111111] font-semibold hover:underline">
            Register new tenant
          </Link>
        </p>
      </div>
    </div>
  );
};
