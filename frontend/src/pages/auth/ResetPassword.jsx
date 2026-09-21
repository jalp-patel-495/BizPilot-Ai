import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('A valid reset token is required. Please check your reset link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(res.error);
    }
  };

  const hasLength = newPassword.length >= 6;
  const hasNumberOrSymbol = /[\d!@#$%^&*]/.test(newPassword);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-[#111111] text-white mb-1 shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Set New Password</h1>
          <p className="text-xs text-[#666666]">
            Create a strong, secure password for your workspace account.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {error && (
            <div className="mb-4 p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Password Updated!</h3>
              <p className="text-xs text-[#666666]">
                Your password has been changed. Redirecting to sign in...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#111111] text-xs font-semibold text-white hover:bg-[#222222] transition"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!tokenFromUrl && (
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste reset token from email"
                    className="w-full bg-white border border-[#D9D9D9] rounded-[6px] px-3.5 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-xs text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-xs text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>
              </div>

              {/* Password strength checklist */}
              <div className="p-3 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5] space-y-1.5 text-[11px]">
                <div className={`flex items-center gap-2 ${hasLength ? 'text-emerald-600' : 'text-[#8A8A8A]'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>At least 6 characters long</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumberOrSymbol ? 'text-emerald-600' : 'text-[#8A8A8A]'}`}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Contains numbers or special characters</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white font-medium text-xs transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
