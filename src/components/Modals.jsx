import React, { useState, useEffect } from 'react';
import { getApiKey, setCustomApiKey, resetCustomApiKey, testApiKeyConnection, TEXT_MODELS } from '../services/geminiService';

export default function Modals({ 
  activeModal, 
  onClose,
  onToast
}) {
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // API Settings State
  const [currentKey, setCurrentKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (activeModal === 'apiSettings') {
      setCurrentKey(getApiKey());
      setTestResult(null);
    }
  }, [activeModal]);

  if (!activeModal) return null;

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      onClose();
    }, 2000);
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (!currentKey.trim()) {
      resetCustomApiKey();
      if (onToast) onToast('Restored default TruthLens API credentials.', 'info');
    } else {
      setCustomApiKey(currentKey.trim());
      if (onToast) onToast('Custom Gemini API key saved successfully!');
    }
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await testApiKeyConnection(currentKey);
      setTestResult(res);
      if (onToast) {
        if (res.success) {
          onToast(`API Connected: ${res.model}`);
        } else {
          onToast(res.message, 'info');
        }
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleResetToDefault = () => {
    resetCustomApiKey();
    setCurrentKey(getApiKey());
    setTestResult(null);
    if (onToast) onToast('API key reset to default configuration.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {activeModal === 'about' && 'info'}
                {activeModal === 'howItWorks' && 'auto_awesome'}
                {activeModal === 'forgotPassword' && 'lock_reset'}
                {activeModal === 'apiSettings' && 'key'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeModal === 'about' && 'About TruthLens MVP'}
              {activeModal === 'howItWorks' && 'How TruthLens Detection Works'}
              {activeModal === 'forgotPassword' && 'Reset Account Password'}
              {activeModal === 'apiSettings' && 'Google Gemini API Configuration'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed max-h-[80vh] overflow-y-auto">
          {activeModal === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-xs leading-relaxed">
                <strong>TruthLens</strong> is a streamlined verification platform engineered to deliver fast, unambiguous fact-checking and AI image detection without feature bloat.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-teal-600 text-[16px]">verified</span>
                    Binary Fact Verdicts
                  </span>
                  <p className="text-slate-600">
                    Straightforward True, False, or Disputed verdicts backed by high-confidence consensus.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-teal-600 text-[16px]">image_search</span>
                    AI Art & Style Forensics
                  </span>
                  <p className="text-slate-600">
                    Specifically flags simulated watercolors, hand sketches, and hyper-realistic 3D graphics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'howItWorks' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                TruthLens applies two focused verification pipelines:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <strong className="text-slate-900 block font-semibold">1. Claim & URL Cross-Examination</strong>
                  <p className="text-slate-600">
                    Isolates factual statements, queries verified registries (scientific journals, wire services, standard bureaus), and calculates an instant credibility score.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <strong className="text-slate-900 block font-semibold">2. AI Image & Faux Realism Forensics</strong>
                  <p className="text-slate-600">
                    Scans micro-textures for synthetic diffusion signatures: watercolor capillary bleeding anomalies, mechanical cross-hatch pressure uniformity, and raytracing light inconsistencies.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'forgotPassword' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your registered email address to receive password reset instructions.
              </p>

              {resetSent ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Reset instructions sent to {resetEmail || 'your email'}.</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="modalEmail">
                      Email Address
                    </label>
                    <input
                      id="modalEmail"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="analyst@truthlens.ai"
                      className="w-full clean-input rounded-xl px-3.5 py-2.5 text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {activeModal === 'apiSettings' && (
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-700 text-[16px]">verified_user</span>
                  <span>Multi-Model Resilient Architecture</span>
                </div>
                <p className="text-teal-800">
                  TruthLens automatically rotates across verified models ({TEXT_MODELS.slice(0, 3).join(', ')}...) with instant failover to ensure zero downtime.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between" htmlFor="apiKeyInput">
                  <span>Gemini API Key</span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {showKey ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{showKey ? 'Hide' : 'Show'} Key</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    id="apiKeyInput"
                    type={showKey ? 'text' : 'password'}
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full clean-input font-mono rounded-xl pl-3.5 pr-10 py-2.5 text-xs placeholder:text-slate-400"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    vpn_key
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Keys are stored locally in your browser session for direct client-side verification.
                </span>
              </div>

              {/* Test Status Box */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <span className={`material-symbols-outlined text-[18px] ${
                    testResult.success ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {testResult.success ? 'check_circle' : 'error'}
                  </span>
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingKey}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingKey ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px]">network_check</span>
                        <span>Test API</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    Reset Default
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
