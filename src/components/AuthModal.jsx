import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

// Demo credentials pre-created in the Supabase project.
// If the account doesn't exist yet we auto-create it on first demo click.
const DEMO_EMAIL = 'demo@truthlens.ai';
const DEMO_PASSWORD = 'TruthLens2026!';

/**
 * Translate raw Supabase auth errors into friendly UI messages.
 * Catches rate-limit variants (HTTP 429, "email rate limit exceeded",
 * "over_email_send_rate_limit", "too many requests").
 */
function getFriendlyAuthError(err) {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status;

  if (
    status === 429 ||
    msg.includes('email rate limit exceeded') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  ) {
    return 'Too many sign-up attempts. Please try again later.';
  }

  if (msg.includes('invalid login credentials') || msg.includes('invalid login')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }

  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }

  return err?.message || 'Something went wrong. Please try again.';
}

/**
 * Build a lean user object from a Supabase session user.
 */
function buildUserFromSession(supabaseUser) {
  const email = supabaseUser.email || '';
  const localPart = email.split('@')[0] || 'User';
  const name = localPart
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'TL';

  return {
    id: supabaseUser.id,
    email,
    name,
    initials,
    role: 'Fact Analyst',
  };
}

export default function AuthModal({ isOpen, onClose, onLogin, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // ── Real Supabase Sign In ───────────────────────────────────────────────
  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    resetMessages();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onLogin(buildUserFromSession(data.user));
      onClose();
    } catch (err) {
      setErrorMsg(getFriendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Real Supabase Sign Up ───────────────────────────────────────────────
  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    resetMessages();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // If email confirmation is required, Supabase returns a user but no session.
      if (data.session) {
        onLogin(buildUserFromSession(data.user));
        onClose();
      } else {
        setSuccessMsg(
          'Account created! Check your inbox to confirm your email, then log in.'
        );
        setMode('login');
      }
    } catch (err) {
      setErrorMsg(getFriendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── 1-Click Demo Login ─────────────────────────────────────────────────
  const handleDemoLogin = async () => {
    resetMessages();
    setIsLoading(true);
    try {
      // Try sign-in first; if account doesn't exist, create it.
      let { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (error && error.message.toLowerCase().includes('invalid login')) {
        // Account not yet created — auto sign up
        const signUpRes = await supabase.auth.signUp({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        if (signUpRes.error) throw signUpRes.error;
        data = signUpRes.data;
      } else if (error) {
        throw error;
      }

      if (data?.user) {
        onLogin(buildUserFromSession(data.user));
        onClose();
      } else {
        setErrorMsg('Demo account created — please confirm your email then log in.');
      }
    } catch (err) {
      setErrorMsg(getFriendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = mode === 'login' ? handleSignIn : handleSignUp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden relative p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-2">
              <span className="material-symbols-outlined text-[22px]">lock_open</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'signup' ? 'Get Started with TruthLens' : 'Login to TruthLens'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'signup'
                ? 'Create your account to unlock the verification console.'
                : 'Enter your credentials to unlock the verification console and personal dashboard.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1-Click Fast Demo Login Pill */}
        <div className="bg-teal-50/80 border border-teal-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-teal-900 font-medium">
            <span className="material-symbols-outlined text-teal-700 text-[18px]">bolt</span>
            <span>Fast Demo Login</span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm active:translate-y-0 disabled:opacity-50"
          >
            1-Click Login
          </button>
        </div>

        {/* Error / Success banners */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 text-xs text-rose-700 font-medium animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-emerald-700 font-medium animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] flex-shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="authEmail">
              Email Address
            </label>
            <div className="relative">
              <input
                id="authEmail"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); resetMessages(); }}
                placeholder="analyst@truthlens.ai"
                className="w-full clean-input rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                mail
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="authPass">
              Password {mode === 'signup' && <span className="text-slate-400 font-normal">(min. 6 characters)</span>}
            </label>
            <div className="relative">
              <input
                id="authPass"
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); resetMessages(); }}
                placeholder="••••••••••••"
                className="w-full clean-input rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                key
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-bold text-sm py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{mode === 'signup' ? 'Creating Account...' : 'Authenticating...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Login'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Mode toggle */}
        <p className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); resetMessages(); }}
                className="text-teal-700 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); resetMessages(); }}
                className="text-teal-700 font-semibold hover:underline"
              >
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
