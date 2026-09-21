import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSent(true);
      if (res.data?.data?.reset_token) {
        setResetToken(res.data.data.reset_token);
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-[#111111] text-white mb-1 shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Recover Password</h1>
          <p className="text-xs text-[#666666]">
            Enter your work email address and we'll dispatch a secure recovery link.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative">
          <Link
            to="/"
            className="absolute top-4 right-4 p-2 text-[#8A8A8A] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-full transition flex items-center justify-center"
            title="Close and return to Home"
            aria-label="Close and return to Home"
          >
            <X className="w-5 h-5" />
          </Link>
          {error && (
            <div className="mb-4 p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Reset Link Dispatched</h3>
                <p className="text-xs text-[#666666] mt-1">
                  We've simulated sending recovery instructions to <span className="text-[#111111] font-medium">{email}</span>.
                </p>
              </div>

              {resetToken && (
                <div className="p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5] text-left space-y-2">
                  <p className="text-[11px] font-semibold text-[#111111]">Demo Instant Reset Link:</p>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="block text-xs text-[#111111] underline break-all font-mono"
                  >
                    Click here to enter new password &rarr;
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#111111] hover:underline pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-white border border-[#D9D9D9] rounded-[6px] pl-10 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
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
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#111111] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
