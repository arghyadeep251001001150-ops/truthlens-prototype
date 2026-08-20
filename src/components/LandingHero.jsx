import React from 'react';

export default function LandingHero({ onOpenLoginModal }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-6 text-center animate-fadeIn">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 bg-white border border-teal-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
        <span className="text-xs font-bold text-teal-900 tracking-wide uppercase">
          TruthLens Security Protocol
        </span>
        <span className="text-xs text-slate-400">• Authenticated Access Only</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Forensic Fact-Checking & <br className="hidden sm:inline" />
          <span className="text-teal-700">AI Image Authenticity</span> Verification
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Verify breaking claims, cross-examine news URLs, and detect synthetic generative artwork (watercolors, hand sketches, and 3D renders) in a single unified console.
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
        <button
          onClick={() => onOpenLoginModal('signup')}
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          onClick={() => onOpenLoginModal('login')}
          className="w-full sm:w-auto bg-white hover:bg-slate-50 active:translate-y-0 hover:-translate-y-0.5 text-slate-800 font-bold text-sm px-7 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px] text-teal-700">login</span>
          <span>Login to Account</span>
        </button>
      </div>

      {/* Protected Features Preview (Locked Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all duration-200 relative group overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-3.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">article</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Claim Cross-Examination
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-registry cross-referencing against verified primary data sources and broadcast logs.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Requires Login</span>
            <span className="material-symbols-outlined text-[14px]">lock</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all duration-200 relative group overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center mb-3.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">link</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Article URL Ingestion
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Live web crawler extracts article text and evaluates truth consistency across trusted registries.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Requires Login</span>
            <span className="material-symbols-outlined text-[14px]">lock</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all duration-200 relative group overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center mb-3.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">image_search</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            AI Art & Realism Forensics
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Detects generative diffusion in simulated watercolors, faux pencil sketches, and hyper-realistic 3D models.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Requires Login</span>
            <span className="material-symbols-outlined text-[14px]">lock</span>
          </div>
        </div>
      </div>

      {/* Security & Access Banner */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-700 text-[18px]">verified_user</span>
          <span>Authentication required to execute forensic verification models.</span>
        </div>
        <button
          onClick={() => onOpenLoginModal('demo')}
          className="text-teal-700 hover:text-teal-800 font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          1-Click Demo Login →
        </button>
      </div>
    </div>
  );
}
