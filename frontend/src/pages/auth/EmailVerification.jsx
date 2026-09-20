import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, CheckCircle2, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || 'businessadmin@upteky.ai';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // If pasted full 6 digit code
      const pasted = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((ch, idx) => {
        if (idx < 6) newOtp[idx] = ch;
      });
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyEmail(email, code);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } else {
      setError(res.error);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(45);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 shadow-glow mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Mail className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Verify Your Email</h1>
          <p className="text-xs text-slate-400">
            We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Email Verified!</h3>
              <p className="text-xs text-slate-400">
                Your account is confirmed. Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* 6 OTP inputs */}
              <div className="flex items-center justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xl font-bold text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner"
                  />
                ))}
              </div>

              <div className="text-center text-[11px] text-slate-400">
                <span>Demo Code: </span>
                <button
                  type="button"
                  onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                  className="font-mono text-cyan-400 font-bold hover:underline"
                >
                  123456 (Click to fill)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-semibold text-xs shadow-glow transition duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend button */}
              <div className="pt-2 text-center text-xs">
                {resendTimer > 0 ? (
                  <span className="text-slate-500">
                    Resend verification code in <span className="text-brand-400 font-semibold">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500">
          Already verified?{' '}
          <Link to="/login" className="text-brand-400 hover:underline font-medium">
            Sign in to your workspace
          </Link>
        </div>
      </div>
    </div>
  );
};
