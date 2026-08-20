import React from 'react';
import { SYSTEM_STATS } from '../data/mockData';

export default function AnalyticsPanel() {
  return (
    <div className="w-full max-w-container-max mx-auto space-y-md">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Claims Verified (24h)</span>
            <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
          </div>
          <div className="font-display-lg text-3xl font-bold text-on-surface mb-1">
            {SYSTEM_STATS.claimsToday}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-label-sm text-secondary">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+14.2% from yesterday</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Avg Processing Latency</span>
            <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
          </div>
          <div className="font-display-lg text-3xl font-bold text-on-surface mb-1">
            {SYSTEM_STATS.avgLatency}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-label-sm text-primary">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>High-throughput edge pipeline</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Truth Precision Index</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          </div>
          <div className="font-display-lg text-3xl font-bold text-secondary mb-1">
            {SYSTEM_STATS.truthRatio}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-label-sm text-on-surface-variant">
            <span>Zero-Knowledge Multi-Agent Consensus</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Indexed Primary Sources</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">dataset</span>
          </div>
          <div className="font-display-lg text-3xl font-bold text-on-surface mb-1">
            {SYSTEM_STATS.sourcesIndexed}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-label-sm text-tertiary">
            <span>Academic, Wire & Institutional</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Breakdown */}
        <div className="lg:col-span-2 bg-surface-container-low border border-white/10 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">
              Global Claim Verdict Distribution
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Telemetry metrics based on 14,892 real-time cross-examined claims over the past 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between font-label-sm text-xs mb-1.5">
                <span className="text-secondary font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Verified True Claims (64%)
                </span>
                <span className="text-on-surface font-bold">9,530 claims</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-label-sm text-xs mb-1.5">
                <span className="text-error font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  Debunked / False Disinformation (24%)
                </span>
                <span className="text-on-surface font-bold">3,574 claims</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-error rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-label-sm text-xs mb-1.5">
                <span className="text-tertiary font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  Disputed / Context Missing (12%)
                </span>
                <span className="text-on-surface font-bold">1,788 claims</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-tertiary rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>

          {/* Category Breakdown Chips */}
          <div className="pt-4 border-t border-white/5">
            <h4 className="font-label-sm text-xs text-on-surface-variant font-bold uppercase mb-3">
              Dominant Ingestion Categories
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-label-md">
              <div className="bg-[#161B22] p-3 rounded-lg border border-white/5">
                <span className="text-primary text-[11px] block">Science & Tech</span>
                <strong className="text-on-surface text-base">41.2%</strong>
              </div>
              <div className="bg-[#161B22] p-3 rounded-lg border border-white/5">
                <span className="text-primary text-[11px] block">Geopolitics</span>
                <strong className="text-on-surface text-base">28.5%</strong>
              </div>
              <div className="bg-[#161B22] p-3 rounded-lg border border-white/5">
                <span className="text-primary text-[11px] block">Financial Markets</span>
                <strong className="text-on-surface text-base">18.7%</strong>
              </div>
              <div className="bg-[#161B22] p-3 rounded-lg border border-white/5">
                <span className="text-primary text-[11px] block">Medicine & Health</span>
                <strong className="text-on-surface text-base">11.6%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Source Credibility Tiers */}
        <div className="bg-surface-container-low border border-white/10 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-headline-md text-base font-bold text-on-surface">
            Source Reliability Tiering
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant">
            TruthLens algorithmic trust rating per domain class.
          </p>

          <div className="space-y-3 font-label-sm text-xs">
            <div className="p-3 bg-[#161B22] border border-white/5 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-on-surface block">Tier 1: Peer-Reviewed Journals</span>
                <span className="text-[10px] text-on-surface-variant">Nature, Lancet, Science, ArXiv</span>
              </div>
              <span className="text-secondary font-bold text-sm">99.2%</span>
            </div>

            <div className="p-3 bg-[#161B22] border border-white/5 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-on-surface block">Tier 2: Global Wires & Standards</span>
                <span className="text-[10px] text-on-surface-variant">Reuters, AP, BIS, NIST, WHO</span>
              </div>
              <span className="text-secondary font-bold text-sm">96.8%</span>
            </div>

            <div className="p-3 bg-[#161B22] border border-white/5 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-on-surface block">Tier 3: Verified Digital Outlets</span>
                <span className="text-[10px] text-on-surface-variant">Bloomberg, FT, MIT Tech Review</span>
              </div>
              <span className="text-primary font-bold text-sm">94.1%</span>
            </div>

            <div className="p-3 bg-[#161B22] border border-white/5 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-on-surface block">Tier 4: Social & Community Repos</span>
                <span className="text-[10px] text-on-surface-variant">Requires 3+ Independent Validations</span>
              </div>
              <span className="text-tertiary font-bold text-sm">68.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
