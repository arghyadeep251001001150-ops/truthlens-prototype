import React, { useState } from 'react';
import { LIVE_FEED_ITEMS } from '../data/mockData';

export default function LiveFeed({ onSelectClaim }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'Clean Tech', 'Geology / Media', 'Automotive', 'Policy', 'Marine Biology'];

  const filteredItems = LIVE_FEED_ITEMS.filter((item) => {
    const matchesCategory = filterCategory === 'ALL' || item.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'VERIFIED':
        return 'bg-secondary/15 text-secondary border border-secondary/30';
      case 'FALSE':
        return 'bg-error/15 text-error border border-error/30';
      case 'DISPUTED':
      default:
        return 'bg-tertiary/15 text-tertiary border border-tertiary/30';
    }
  };

  return (
    <div className="w-full max-w-container-max mx-auto space-y-md">
      <div className="bg-surface-container-low border border-white/10 rounded-xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
              <span className="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">
                Real-Time Intelligence Ingestion
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Global Verification Stream
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              Live automated crawler index verifying cross-continental news, market rumors, and research claims.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-2 rounded-lg border border-white/5 font-label-sm text-xs text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">sync</span>
            <span>Polling 2,450+ endpoints every 30s</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incoming stream by keyword, topic, or source..."
              className="w-full bg-surface-container-highest border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2.5 font-body-md text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-label-sm text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-2 rounded whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-primary text-on-primary font-bold shadow'
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stream Items List */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#161B22] border border-white/10 rounded-lg p-4 hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`${getVerdictBadge(item.verdict)} px-2 py-0.5 rounded font-label-sm text-[10px] font-bold`}>
                    {item.verdict}
                  </span>
                  <span className="font-label-sm text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {item.category}
                  </span>
                  <span className="text-on-surface-variant/60 font-label-sm text-[11px]">
                    • Ingested {item.time}
                  </span>
                </div>

                <h3 className="font-body-md text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>

                <div className="flex items-center gap-3 text-[11px] font-label-sm text-on-surface-variant pt-1">
                  <span>Cross-Indexed: <strong className="text-on-surface font-normal">{item.sourceCount} primary sources</strong></span>
                  <span>•</span>
                  <span>Trust Index: <strong className="text-secondary font-normal">{item.trustIndex}</strong></span>
                </div>
              </div>

              {/* Confidence & Inspect Button */}
              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/5">
                <div className="text-right">
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase block">Confidence</span>
                  <span className="font-label-md text-base font-bold text-on-surface">{item.confidence}%</span>
                </div>

                <button
                  onClick={() => onSelectClaim(item)}
                  className="bg-surface-container-highest hover:bg-primary hover:text-on-primary border border-white/10 text-on-surface px-3.5 py-2 rounded font-label-sm text-xs font-semibold transition-all duration-200 flex items-center gap-1 group-hover:border-primary/50"
                >
                  <span>Inspect</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
