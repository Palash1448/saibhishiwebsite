import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isFirebaseConfigured } from '../firebase/config';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password reset modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, resetPassword, loading, error: authError } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Missing Fields', 'Please enter your admin email and password');
      return;
    }

    try {
      await login(email, password);
      success('Welcome back!', 'Admin session authenticated successfully.');
      navigate('/');
    } catch (err: any) {
      toastError('Login Failed', err.message || 'Authentication error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toastError('Email Required', 'Please enter your registered admin email');
      return;
    }

    try {
      await resetPassword(forgotEmail);
      setResetSent(true);
      success('Password Reset Email Sent', 'Check your inbox for password recovery instructions.');
    } catch (err: any) {
      toastError('Reset Failed', err.message || 'Failed to send recovery email');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Logo & Title */}
        <div className="text-center">
          <img
            src="/logo.png"
            alt="साई भिषी मंडळ"
            className="w-24 h-24 rounded-3xl object-cover shadow-2xl mx-auto mb-4 ring-4 ring-emerald-500/30 bg-slate-900"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            साई भिषी मंडळ
          </h2>
          <p className="mt-1 text-sm text-emerald-400 font-medium">
            SaiBhishi Finance & Microfinance Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-elevated rounded-3xl border border-slate-800 space-y-5">
          {!isFirebaseConfigured && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-bold text-amber-200">Cloud Sync Configuration Required</p>
                <p className="text-amber-300/80 text-[11px]">
                  Please verify your cloud database credentials in <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">.env</code>.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-800/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                    setResetSent(false);
                  }}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative rounded-xl border border-slate-700 bg-slate-800/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4"
                />
                <span className="text-xs text-slate-300">Remember session</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Admin Portal
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          SaiBhishi Finance Admin Portal • Secured with 256-Bit Cloud Encryption
        </p>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-elevated">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
                <p className="text-xs text-slate-400">Secure Account Recovery</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Enter your registered admin email address. A secure link will be dispatched to reset your password.
            </p>

            {resetSent ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
                A password reset email has been dispatched. Please check your inbox and spam folders.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="my-5 space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading}>
                  Send Password Reset Link
                </Button>
              </form>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
