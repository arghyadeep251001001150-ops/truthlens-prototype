import React from 'react';

export default function EvidenceCard({ source }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="bg-secondary/15 text-secondary border border-secondary/30 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            CONFIRMED
          </span>
        );
      case 'DEBUNKED':
        return (
          <span className="bg-error/15 text-error border border-error/30 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">cancel</span>
            DEBUNKED
          </span>
        );
      case 'INVESTIGATING':
      case 'PARTIALLY_SUPPORTED':
      case 'CONTEXT_PROVIDED':
        return (
          <span className="bg-tertiary/15 text-tertiary border border-tertiary/30 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">pending</span>
            {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold">
            {status}
          </span>
        );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-secondary';
    if (score >= 70) return 'text-tertiary';
    return 'text-error';
  };

  return (
    <div className="bg-[#161B22] border border-white/10 rounded-lg p-4 hover:border-primary/40 transition-all duration-300 group hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-sm text-xs font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            {source.domain}
          </span>
          <span className="font-label-md text-xs text-on-surface font-medium">
            {source.name}
          </span>
          <span className="font-label-sm text-[11px] text-on-surface-variant/70">
            • {source.date}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(source.status)}
          <div className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded border border-white/5">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Trust</span>
            <span className={`font-label-sm text-xs font-bold ${getScoreColor(source.trustScore)}`}>
              {source.trustScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Excerpt Quote */}
      <div className="bg-surface-container-lowest/80 border-l-2 border-primary/60 p-3 rounded-r-md my-2.5">
        <p className="font-body-sm text-xs text-on-surface italic leading-relaxed">
          "{source.quote}"
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-label-sm text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-outline">tune</span>
            Bias: <strong className="text-on-surface font-normal ml-0.5">{source.bias}</strong>
          </span>
        </div>
        <a 
          href={source.url}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-fixed flex items-center gap-0.5 hover:underline"
        >
          <span>Citation Dossier</span>
          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
}
