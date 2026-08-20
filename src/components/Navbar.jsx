import React from 'react';

export default function Navbar({ 
  user, 
  onSignOut, 
  onOpenLoginModal,
  onOpenApiSettings,
  activeTab, 
  setActiveTab 
}) {
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 fixed top-0 w-full z-50 transition-all duration-200 shadow-sm">
      <div className="max-w-container-max mx-auto px-6 py-3.5 flex justify-between items-center">
        {/* Left: TruthLens Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => user && setActiveTab('console')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm group-hover:bg-teal-100 transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                verified
              </span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              TruthLens
            </span>
          </button>

          {/* Simple status badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Fact & AI Detection MVP</span>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            /* Unlocked Navigation (Logged In) */
            <>
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                {/* Link 1: Verification Console */}
                <button 
                  onClick={() => setActiveTab('console')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'console' 
                      ? 'bg-white text-teal-800 shadow-sm font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">manage_search</span>
                  <span>Verification Console</span>
                </button>

                {/* Link 2: Dashboard */}
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-teal-800 shadow-sm font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  <span>Dashboard</span>
                </button>
              </div>

              {/* API Settings Quick Link */}
              {onOpenApiSettings && (
                <button
                  onClick={onOpenApiSettings}
                  title="API Settings & Model Diagnostics"
                  className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-teal-600">tune</span>
                  <span>API Config</span>
                </button>
              )}

              {/* User Profile Pill & Logout */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium">
                    {user.role || 'Fact Analyst'}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 font-bold text-xs">
                  {user.initials || 'EV'}
                </div>
                <button
                  onClick={onSignOut}
                  title="Logout"
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </>
          ) : (
            /* Logged Out State (Locked): "Login" text link directly followed by "Get Started" button */
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenLoginModal('login')}
                className="text-xs font-bold text-slate-600 hover:text-teal-700 px-3 py-2 rounded-lg transition-colors hover:bg-slate-100"
              >
                Login
              </button>

              <button
                onClick={() => onOpenLoginModal('signup')}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
