import React, { useState } from 'react';

export default function AuthCard({ onLogin, onOpenForgotPassword }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: fullName || (email.split('@')[0].replace('.', ' ').toUpperCase() || 'Dr. Elena Vance'),
        email: email,
        role: 'Lead Fact Analyst',
        tier: 'Standard MVP'
      });
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    setEmail('elena.vance@truthlens.ai');
    setPassword('••••••••••••');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: 'Dr. Elena Vance',
        email: 'elena.vance@truthlens.ai',
        role: 'Lead Fact Analyst',
        tier: 'Standard MVP'
      });
    }, 350);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 relative z-10">
      {/* Left Panel: Clean Brand Graphic (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-teal-50/70 via-sky-50/50 to-white p-10 flex-col justify-between border-r border-slate-200/80">
        {/* Top Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              TruthLens
            </span>
          </div>
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider bg-teal-100/70 px-2.5 py-1 rounded-md inline-block border border-teal-200">
            Truth & Integrity Suite
          </span>
        </div>

        {/* Center Visual Callout */}
        <div className="my-auto py-8 space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 leading-snug">
            Information moves fast. Verification should move faster.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Verify breaking news claims and detect synthetic AI images designed to mimic human art and realistic photography.
          </p>

          <div className="pt-2 space-y-2 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">check_circle</span>
              <span>Fast Cross-Reference Against Trusted Sources</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">brush</span>
              <span>Fine-Tuned AI Style Mimicry Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">database</span>
              <span>Clean, Instant Results Saved to Session Database</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-200/60 text-xs text-slate-500">
          <span>Trusted by research labs & fact-checking desks</span>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="md:hidden mb-6 flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              TruthLens
            </span>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900">
              {isSignUp ? 'Create your account' : 'Sign in to TruthLens'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp ? 'Get started with instant verification' : 'Access your verification console'}
            </p>
          </div>

          {/* Quick Demo Login Button */}
          {!isSignUp && (
            <div className="mb-5 p-3 rounded-xl bg-teal-50/80 border border-teal-200/80 flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="text-xs font-bold text-teal-950">1-Click Fast Access</div>
                <div className="text-[11px] text-teal-700">Dr. Elena Vance (Lead Analyst)</div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                Sign In
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Elena Vance"
                  className="w-full clean-input rounded-lg px-3.5 py-2.5 text-sm placeholder:text-slate-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full clean-input rounded-lg px-3.5 py-2.5 text-sm placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={onOpenForgotPassword}
                    className="text-xs text-teal-700 hover:text-teal-800 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full clean-input rounded-lg px-3.5 py-2.5 text-sm placeholder:text-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex justify-center items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-teal-600 text-[18px]">account_circle</span>
            Continue with Google
          </button>

          <div className="mt-6 text-center text-xs text-slate-600">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-teal-700 hover:text-teal-800 font-semibold ml-1 underline"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
