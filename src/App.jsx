import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import VerificationConsole from './components/VerificationConsole';
import UserDashboard from './components/UserDashboard';
import AuthModal from './components/AuthModal';
import Modals from './components/Modals';
import { supabase } from './services/supabaseClient';

/**
 * Map a raw Supabase user to the shape expected by the rest of the app.
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

  return { id: supabaseUser.id, email, name, initials, role: 'Fact Analyst' };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'dashboard'
  // Strictly initialized as empty array [] for live demo
  const [historyList, setHistoryList] = useState([]);

  // Modals state
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });
  const [activeInfoModal, setActiveInfoModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // ── Supabase Session Bootstrap ─────────────────────────────────────────
  useEffect(() => {
    // Restore existing session on first render
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(buildUserFromSession(session.user));
      }
    });

    // Keep user state in sync with auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const mappedUser = buildUserFromSession(session.user);
        setUser(mappedUser);

        if (event === 'SIGNED_IN') {
          // Close auth modal and navigate to the verification console immediately
          setAuthModalState({ isOpen: false, mode: 'login' });
          setActiveTab('console');
          setToastMsg({ message: `Welcome, ${mappedUser.name}! Session unlocked.`, type: 'success' });
          setTimeout(() => setToastMsg(null), 2500);
        }
        // TOKEN_REFRESHED — silently update user, no nav change needed
      } else {
        setUser(null);
        setHistoryList([]);
        setActiveTab('console');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  // onAuthStateChange (above) handles all redirect/toast on SIGNED_IN.
  // This callback is kept so AuthModal's onLogin prop still resolves cleanly.
  const handleLogin = (_userData) => {
    // Intentionally empty — redirect is driven by onAuthStateChange SIGNED_IN event.
  };

  // Sign out via Supabase
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange listener above clears user state automatically
    showToast('Signed out. Verification console locked.', 'info');
  };

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  // Add newly verified item to history and navigate to Dashboard
  const handleSaveAndNavigateToDashboard = (item) => {
    setHistoryList((prev) => {
      const exists = prev.some((h) => h.id === item.id);
      return exists ? prev : [item, ...prev];
    });
    setActiveTab('dashboard');
    showToast('Recorded in Dashboard history!');
  };

  // Add item to history silently
  const handleAddHistoryItem = (item) => {
    setHistoryList((prev) => {
      const exists = prev.some((h) => h.id === item.id);
      return exists ? prev : [item, ...prev];
    });
  };

  // Delete individual history item
  const handleDeleteHistoryItem = (id) => {
    setHistoryList((prev) => prev.filter((item) => item.id !== id));
    showToast('Record deleted from history.', 'info');
  };

  // Clear all history records
  const handleClearAllHistory = () => {
    setHistoryList([]);
    showToast('All verification history cleared.', 'info');
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col antialiased relative selection:bg-teal-100 selection:text-teal-900">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-light-grid opacity-35"></div>
      </div>

      {/* Global Top Navbar */}
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        onOpenLoginModal={handleOpenAuthModal}
        onOpenApiSettings={() => setActiveInfoModal('apiSettings')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center px-4 md:px-6 pt-20 pb-12 z-10 w-full">
        {!user ? (
          /* Initial Logged-Out State: Protected Landing Screen */
          <LandingHero onOpenLoginModal={handleOpenAuthModal} />
        ) : (
          /* Unlocked Authenticated Views */
          <>
            {/* View 1: Forensic Claim Verification Console */}
            {activeTab === 'console' && (
              <div className="w-full max-w-container-max py-2 animate-fadeIn">
                <VerificationConsole
                  user={user}
                  onSaveAndNavigateToDashboard={handleSaveAndNavigateToDashboard}
                  onAddHistoryItem={handleAddHistoryItem}
                  onOpenApiSettings={() => setActiveInfoModal('apiSettings')}
                />
              </div>
            )}

            {/* View 2: User Dashboard (Analytics & Verification History Table) */}
            {activeTab === 'dashboard' && (
              <div className="w-full max-w-container-max py-2 animate-fadeIn">
                <UserDashboard
                  user={user}
                  historyList={historyList}
                  onDeleteHistoryItem={handleDeleteHistoryItem}
                  onClearAllHistory={handleClearAllHistory}
                  onNavigateToConsole={() => setActiveTab('console')}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white border ${toastMsg.type === 'info' ? 'border-slate-300 text-slate-800' : 'border-emerald-300 text-emerald-800'} p-4 rounded-xl shadow-clean flex items-center gap-3 animate-fadeIn`}>
          <span className={`material-symbols-outlined text-[20px] ${toastMsg.type === 'info' ? 'text-slate-600' : 'text-emerald-600'}`}>
            {toastMsg.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="text-xs font-bold">{toastMsg.message}</span>
        </div>
      )}

      {/* Shared Light Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md py-6 px-6 z-10 w-full mt-auto shadow-sm">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-800 font-semibold">TruthLens MVP</span>
            <span>• Forensic Fact & AI Image Detection</span>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => setActiveTab('console')}
                  className="hover:text-teal-700 transition-colors"
                >
                  Verification Console
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-teal-700 transition-colors"
                >
                  User Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="hover:text-teal-700 transition-colors font-semibold"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setActiveInfoModal('apiSettings')}
              className="hover:text-teal-700 transition-colors"
            >
              API Config
            </button>
            <button
              onClick={() => setActiveInfoModal('about')}
              className="hover:text-teal-700 transition-colors"
            >
              About
            </button>
            <span className="text-slate-400">© 2026 TruthLens</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal (Supabase-backed) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        onLogin={handleLogin}
      />

      {/* Info Modals */}
      <Modals
        activeModal={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
        onToast={showToast}
      />
    </div>
  );
}
