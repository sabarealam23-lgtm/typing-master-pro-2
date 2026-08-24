import React, { useState } from 'react';
import { PageRoute } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Keyboard, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthPageProps {
  onNavigate: (page: PageRoute) => void;
}

// ==================== LOGIN PAGE ====================
export const LoginPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onNavigate('dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4">
      <div className="bg-white dark:bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#1e3a8a] mx-auto flex items-center justify-center shadow-xs mb-3">
            <Keyboard className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-600 mt-1">Sign in to sync your typing progress and streaks</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-700 font-semibold text-xs uppercase tracking-wider block">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-[#1e3a8a] font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 text-sm transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-700 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-500 font-semibold">Or</span></div>
        </div>

        <button
          id="login-guest-btn"
          type="button"
          onClick={handleGuest}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 w-full cursor-pointer text-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Continue as Guest</span>
        </button>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#1e3a8a] font-semibold hover:underline ml-1 cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

// ==================== REGISTER PAGE ====================
export const RegisterPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await register(email, password, displayName);
    setLoading(false);
    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4">
      <div className="bg-white dark:bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#1e3a8a] mx-auto flex items-center justify-center shadow-xs mb-3">
            <Keyboard className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-600 mt-1">Join SmartTyping Pro and start your progression</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 block">Display Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="register-name-input"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Hunter"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="register-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 block">Password (min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 text-sm transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-700 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#1e3a8a] font-semibold hover:underline ml-1 cursor-pointer"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

// ==================== FORGOT PASSWORD PAGE ====================
export const ForgotPasswordPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4">
      <div className="bg-white dark:bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-600 mt-1 mb-6">
          Enter your registered email address and we will send password reset instructions.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
            <p>If an account exists for {email}, password reset instructions have been dispatched.</p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-3 w-full py-2.5 bg-[#1e3a8a] hover:bg-[#172554] rounded-xl text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 text-sm transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full text-center text-xs text-[#1e3a8a] font-semibold hover:underline pt-2 block cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ==================== EMAIL VERIFICATION PAGE ====================
export const EmailVerificationPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { user, resendVerificationEmail } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    await resendVerificationEmail();
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 text-center">
      <div className="bg-white dark:bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] border border-blue-200 mx-auto flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Verify Your Email</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          We sent a verification link to <span className="text-slate-900 font-mono font-semibold">{user.email}</span>. Click the link in the email to activate full cloud synchronization.
        </p>

        {sent && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            Verification link sent successfully!
          </div>
        )}

        <div className="pt-4 space-y-3">
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5 text-[#1e3a8a]" />
            <span>{loading ? 'Sending...' : 'Resend Verification Email'}</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

