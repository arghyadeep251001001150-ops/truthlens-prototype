import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export default function UserDashboard({ 
  user,
  historyList = [], 
  onDeleteHistoryItem, 
  onClearAllHistory, 
  onNavigateToConsole
}) {
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [dbHistory, setDbHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch verifications from Supabase for the current user
  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingHistory(true);
    supabase
      .from('verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching verification history:', error);
        } else if (data) {
          setDbHistory(data.map((row) => ({
            id: row.id,
            date: new Date(row.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            }),
            type: row.type === 'url' ? 'URL' : row.type === 'image' ? 'Image' : 'Text',
            snippet: (row.claim_text || '').length > 75
              ? row.claim_text.substring(0, 72) + '...'
              : row.claim_text || '',
            verdict: row.verdict,
            confidence: row.confidence,
            summary: row.summary,
          })));
        }
        setIsLoadingHistory(false);
      });
  }, [user?.id]);

  // Merge in-memory history with DB history (newest first), avoiding duplicates.
  const mergedHistory = [
    ...historyList.filter(
      (local) => !dbHistory.some(
        (db) => db.snippet === local.snippet && db.verdict === local.verdict
      )
    ),
    ...dbHistory,
  ];

  // Dynamic Metric Calculations based on merged history (DB + in-memory)
  const totalVerified = mergedHistory.length;
  const imageItems = mergedHistory.filter(item => item.type === 'Image');
  const aiCount = imageItems.filter(item => String(item.verdict || '').toLowerCase().includes('ai')).length;
  const aiRate = imageItems.length > 0 ? Math.round((aiCount / imageItems.length) * 100) : 0;
  const usageDisplay = totalVerified > 0 ? `${Math.max(1, totalVerified * 3)}m` : '0m';

  // Verdict style mapper
  const getVerdictStyle = (verdict) => {
    const v = String(verdict).toLowerCase();
    if (v === 'error') {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300',
        text: 'text-rose-700',
        bar: 'bg-rose-500',
        icon: 'error',
        label: 'Error'
      };
    }
    if (v === 'true' || v === 'verified' || v === 'authentic') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        icon: 'check_circle',
        label: verdict === 'Authentic' ? 'Authentic' : 'True'
      };
    }
    if (v === 'false' || v === 'debunked' || v === 'ai-generated' || v === 'ai generated') {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'text-rose-700',
        bar: 'bg-rose-500',
        icon: 'cancel',
        label: v.includes('ai') ? 'AI-Generated' : 'False'
      };
    }
    return {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      text: 'text-amber-800',
      bar: 'bg-amber-500',
      icon: 'help',
      label: 'Disputed'
    };
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Image':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'URL':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Text':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter history items based on dropdown selection (using merged DB + in-memory list)
  const filteredHistory = mergedHistory.filter((item) => {
    if (verdictFilter === 'ALL') return true;
    const v = String(item.verdict).toLowerCase();
    const filter = verdictFilter.toLowerCase();
    if (filter === 'true') return v === 'true' || v === 'verified';
    if (filter === 'false') return v === 'false' || v === 'debunked';
    if (filter === 'disputed') return v === 'disputed';
    if (filter === 'ai-generated') return v === 'ai-generated' || v === 'ai generated';
    if (filter === 'authentic') return v === 'authentic';
    return true;
  });

  return (
    <div className="w-full max-w-container-max mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Analyst Portal
            </span>
            <span className="text-xs text-slate-500">• User Dashboard & Analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Personal Verification Dashboard
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Review activity metrics, audit verified records, and manage your claim history.
          </p>
        </div>

        <button
          onClick={onNavigateToConsole}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>New Verification</span>
        </button>
      </div>

      {/* A. Usage Analytics (Top Row: 3 Clean Dynamic Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Claims Verified (Dynamic) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Claims Verified
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalVerified}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              {totalVerified > 0 ? (
                <>
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  +{totalVerified} this session
                </>
              ) : (
                <span className="text-slate-400 font-normal">0 in active session</span>
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Cross-referenced across indexed fact registries</p>
        </div>

        {/* Metric 2: App Usage Time (Dynamic) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              App Usage Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{usageDisplay}</span>
            <span className="text-xs font-medium text-slate-500">
              {totalVerified > 0 ? 'active session' : 'idle'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {totalVerified > 0 ? 'High-throughput active analyst session' : 'Start verifying claims to track active time'}
          </p>
        </div>

        {/* Metric 3: AI Detection Rate (Dynamic) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AI Detection Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{aiRate}%</span>
            <span className="text-xs font-medium text-slate-500">
              {imageItems.length > 0 ? `${aiCount} of ${imageItems.length} images` : 'no images scanned'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">of checked images flagged as synthetic</p>
        </div>
      </div>

      {/* B. Verification History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
        {/* Table Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-700 text-[20px]">history</span>
              <span>Verification History</span>
              <span className="text-xs font-normal text-slate-500">({filteredHistory.length} records)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any row to inspect the full verification briefing and evidence summary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Verdict Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Filter:</span>
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                className="clean-input rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Verdicts</option>
                <option value="True">True / Verified</option>
                <option value="False">False / Debunked</option>
                <option value="Disputed">Disputed</option>
                <option value="AI-Generated">AI-Generated</option>
                <option value="Authentic">Authentic</option>
              </select>
            </div>

            {/* Clear History Action */}
            {mergedHistory.length > 0 && (
              <button
                onClick={onClearAllHistory}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 shadow-sm hover:-translate-y-0.5"
                title="Clear all records"
              >
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 rounded-l-lg">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Claim Snippet</th>
                  <th className="py-3 px-3">Verdict</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredHistory.map((item) => {
                  const vStyle = getVerdictStyle(item.verdict);
                  const tStyle = getTypeStyle(item.type);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemForDetails(item)}
                      className="hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                        {item.date}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tStyle}`}>
                          {item.type}
                        </span>
                      </td>

                      {/* Snippet */}
                      <td className="py-3.5 px-3 font-medium text-slate-900 group-hover:text-teal-700 transition-colors max-w-md">
                        <div className="line-clamp-2 leading-relaxed">
                          {item.snippet}
                        </div>
                      </td>

                      {/* Verdict */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1 shadow-sm ${vStyle.bg}`}>
                          <span className="material-symbols-outlined text-[14px]">{vStyle.icon}</span>
                          {vStyle.label}
                        </span>
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{item.confidence}%</span>
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full ${vStyle.bar} rounded-full`}
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHistoryItem(item.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                          title="Delete this record"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : isLoadingHistory ? (
          /* Loading skeleton while fetching from Supabase */
          <div className="py-8 space-y-3 animate-pulse px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 bg-slate-100 rounded w-20"></div>
                <div className="h-4 bg-slate-100 rounded w-12"></div>
                <div className="h-4 bg-slate-100 rounded flex-1"></div>
                <div className="h-4 bg-slate-100 rounded w-16"></div>
                <div className="h-4 bg-slate-100 rounded w-14"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="py-14 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">manage_search</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                No verification records found. Return to the console to scan your first claim or image.
              </p>
            </div>
            <button
              onClick={onNavigateToConsole}
              className="bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-800 border border-teal-200 px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>Go to Verification Console</span>
            </button>
          </div>
        )}
      </div>

      {/* Row Inspection Modal / Details Popup */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getVerdictStyle(selectedItemForDetails.verdict).bg}`}>
                  {selectedItemForDetails.verdict}
                </span>
                <span className="text-xs text-slate-500">[{selectedItemForDetails.type}]</span>
              </div>
              <button
                onClick={() => setSelectedItemForDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {selectedItemForDetails.imageUrl && (
              <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img 
                  src={selectedItemForDetails.imageUrl} 
                  alt={selectedItemForDetails.snippet} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Claim / Title</span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {selectedItemForDetails.snippet}
              </h4>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-teal-600 text-[16px]">summarize</span>
                Evidence Briefing
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedItemForDetails.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Date: <strong>{selectedItemForDetails.date}</strong></span>
              <span>Confidence: <strong className="text-slate-900">{selectedItemForDetails.confidence}%</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
