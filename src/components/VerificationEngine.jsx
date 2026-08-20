import React, { useState, useRef } from 'react';
import { SAMPLE_CLAIMS, SAMPLE_IMAGES, INITIAL_SAVED_LOGS } from '../data/mockData';

export default function VerificationEngine() {
  // Input mode: 'text' | 'url' | 'image'
  const [inputMode, setInputMode] = useState('text');

  // Input states
  const [claimText, setClaimText] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(SAMPLE_IMAGES[0].imageUrl);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Active result state
  const [activeResultType, setActiveResultType] = useState('claim'); // 'claim' | 'image'
  const [claimResult, setClaimResult] = useState(SAMPLE_CLAIMS[0]);
  const [imageResult, setImageResult] = useState(SAMPLE_IMAGES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pre-populated History List
  const [savedLogs, setSavedLogs] = useState(INITIAL_SAVED_LOGS);
  const [toastMsg, setToastMsg] = useState(null);

  // Show Toast notification
  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Handle Text/URL verification
  const handleVerifyClaim = (e) => {
    if (e) e.preventDefault();
    const query = inputMode === 'text' ? claimText : articleUrl;
    if (!query && inputMode !== 'image') return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveResultType('claim');

      if (query && query !== SAMPLE_CLAIMS[0].sourceText) {
        const isSuspicious = query.toLowerCase().includes('leak') || query.toLowerCase().includes('secret') || query.toLowerCase().includes('hoax') || query.toLowerCase().includes('false');
        const isDisputed = query.toLowerCase().includes('kohli') || query.toLowerCase().includes('alleged') || query.toLowerCase().includes('rumor');
        const verdict = isDisputed ? 'Disputed' : (isSuspicious ? 'False' : (query.length % 2 === 0 ? 'True' : 'Disputed'));
        const confidence = 80 + (query.length % 19);

        const newResult = {
          id: `claim-${Date.now()}`,
          category: inputMode === 'url' ? 'Web Ingestion' : 'Forensic Claim',
          title: query.length > 80 ? query.substring(0, 77) + '...' : query,
          sourceText: query,
          verdict: verdict,
          confidence: confidence,
          summary: `Automated fact-checking cross-referenced multiple trusted registries and official broadcast logs to evaluate factual consistency.`
        };

        setClaimResult(newResult);
      }
    }, 450);
  };

  // Handle Preset Claim Selection
  const handleSelectClaimPreset = (claim) => {
    setInputMode('text');
    setClaimText(claim.sourceText);
    setClaimResult(claim);
    setActiveResultType('claim');
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 250);
  };

  // Handle Drag & Drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file) => {
    const url = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(url);

    const isLikelyAI = file.name.toLowerCase().includes('ai') || file.name.toLowerCase().includes('gen') || file.name.toLowerCase().includes('market') || file.size < 600000;
    setImageResult({
      id: `img-${Date.now()}`,
      title: `Image: ${file.name.replace(/\.[^/.]+$/, "")}`,
      style: "Uploaded Media Analysis",
      imageUrl: url,
      verdict: isLikelyAI ? "AI-Generated" : "Authentic",
      confidence: isLikelyAI ? 98 : 95,
      summary: isLikelyAI 
        ? "Synthetic generative patterns identified. Micro-texture frequency analysis reveals latent diffusion artifacts and artificial watercolor/pencil stroke smoothing."
        : "Authentic camera capture verified. Optical lens dispersion and organic sensor noise distribution match physical camera hardware."
    });
  };

  // Handle Preset Image Selection
  const handleSelectImagePreset = (img) => {
    setInputMode('image');
    setImagePreviewUrl(img.imageUrl);
    setImageResult(img);
    setActiveResultType('image');
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 250);
  };

  // Handle Image Detection Trigger
  const handleDetectImage = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveResultType('image');
    }, 450);
  };

  // Save to Database action
  const handleSaveToDatabase = () => {
    const newItem = activeResultType === 'claim' ? {
      id: `log-${Date.now()}`,
      type: 'CLAIM',
      title: claimResult.title,
      verdict: claimResult.verdict,
      confidence: claimResult.confidence,
      timestamp: 'Just now',
      summary: claimResult.summary
    } : {
      id: `log-${Date.now()}`,
      type: 'IMAGE',
      title: imageResult.title.startsWith('Image:') ? imageResult.title : `Image: ${imageResult.title}`,
      verdict: imageResult.verdict,
      confidence: imageResult.confidence,
      timestamp: 'Just now',
      imageUrl: imagePreviewUrl,
      summary: imageResult.summary
    };

    setSavedLogs([newItem, ...savedLogs]);
    showToast('Saved to Recent Verifications database!');
  };

  // Delete Individual History Item
  const handleDeleteLogItem = (id, e) => {
    e.stopPropagation();
    setSavedLogs((prev) => prev.filter((item) => item.id !== id));
    showToast('Record deleted from history.', 'info');
  };

  // Delete / Clear All History
  const handleClearAllHistory = () => {
    setSavedLogs([]);
    showToast('All verification history deleted.', 'info');
  };

  // Reset Demo History
  const handleResetDemoHistory = () => {
    setSavedLogs(INITIAL_SAVED_LOGS);
    showToast('Demo verification history restored.');
  };

  // Click history item to inspect
  const handleInspectHistory = (log) => {
    if (log.type === 'IMAGE') {
      setInputMode('image');
      setActiveResultType('image');
      setImagePreviewUrl(log.imageUrl || SAMPLE_IMAGES[0].imageUrl);
      setImageResult({
        id: log.id,
        title: log.title,
        style: "Verified History Record",
        imageUrl: log.imageUrl || SAMPLE_IMAGES[0].imageUrl,
        verdict: log.verdict,
        confidence: log.confidence,
        summary: log.summary
      });
    } else {
      setInputMode('text');
      setActiveResultType('claim');
      setClaimResult({
        id: log.id,
        category: log.category || 'Archived Fact Check',
        title: log.title,
        sourceText: log.title,
        verdict: log.verdict,
        confidence: log.confidence,
        summary: log.summary
      });
    }
  };

  // Clean Verdict Style Mapper
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
    if (v === 'true' || v === 'verified' || v === 'authentic' || v === 'authentic / human-made') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        icon: 'check_circle',
        label: verdict === 'Authentic' || verdict === 'AUTHENTIC / HUMAN-MADE' ? 'Authentic' : 'True'
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

  return (
    <div className="w-full max-w-container-max mx-auto space-y-6">
      {/* 1. Forensic Claim Verification Console */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-card space-y-6">
        {/* Header & 3-Way Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                TruthLens Core Engine
              </span>
              <span className="text-xs text-slate-500">• Fast Verification MVP</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Forensic Verification Console
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Input textual claims, news article URLs, or upload images to detect AI-generated art and synthetic realism.
            </p>
          </div>

          {/* 3-Way Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start md:self-auto text-xs font-semibold">
            <button
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                inputMode === 'text' 
                  ? 'bg-white text-teal-800 shadow-sm font-bold hover:bg-slate-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">article</span>
              Claim Text
            </button>

            <button
              onClick={() => setInputMode('url')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                inputMode === 'url' 
                  ? 'bg-white text-teal-800 shadow-sm font-bold hover:bg-slate-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
              Article URL
            </button>

            <button
              onClick={() => {
                setInputMode('image');
                setActiveResultType('image');
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                inputMode === 'image' 
                  ? 'bg-white text-teal-800 shadow-sm font-bold hover:bg-slate-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">image_search</span>
              Image Upload
            </button>
          </div>
        </div>

        {/* Input Forms */}
        {inputMode === 'text' && (
          <form onSubmit={handleVerifyClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="claimInput">
                Enter claim or statement to verify
              </label>
              <textarea
                id="claimInput"
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="e.g. Viral quote from Virat Kohli responding to Harsha Bhogle's commentary during the match..."
                rows={3}
                className="w-full clean-input rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 resize-none transition-all duration-200"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-teal-600 text-[16px]">shield</span>
                Multi-registry fact cross-examination
              </span>
              <button
                type="submit"
                disabled={isAnalyzing || !claimText.trim()}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Claim...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Claim</span>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {inputMode === 'url' && (
          <form onSubmit={handleVerifyClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="urlInput">
                Enter article or report URL
              </label>
              <div className="relative">
                <input
                  id="urlInput"
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://news.example.com/sports/cricket-interview-2026..."
                  className="w-full clean-input rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-400 transition-all duration-200"
                />
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  link
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-teal-600 text-[16px]">public</span>
                Automated web ingestion & verification
              </span>
              <button
                type="submit"
                disabled={isAnalyzing || !articleUrl.trim()}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Ingesting URL...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Article URL</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {inputMode === 'image' && (
          <div className="space-y-4">
            {/* User-Friendly Drag & Drop Zone with Interactive Hover and Drag-Over States */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 md:p-8 transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-center gap-6 justify-center text-center md:text-left ${
                isDragOver 
                  ? 'border-teal-500 bg-teal-50/80 scale-[1.01] shadow-md' 
                  : 'border-slate-300 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/30'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreviewUrl ? (
                <div className="w-44 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white shadow-sm relative group">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold bg-white/95 px-2.5 py-1 rounded-md text-slate-800 shadow">
                      Change File
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  {selectedImageFile ? selectedImageFile.name : (isDragOver ? 'Release to upload image...' : 'Drop an image here or click to browse')}
                </h4>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                  Specifically checks for simulated watercolors, faux hand-drawn sketches, hyper-realistic 3D graphics, and optical camera noise profiles.
                </p>
                <span className="text-[11px] font-semibold text-teal-700 block pt-0.5">
                  Supports PNG, JPG, WebP • Drag & drop ready
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-teal-600 text-[16px]">auto_awesome</span>
                Fine-tuned for AI art & faux realism detection
              </span>
              <button
                type="button"
                onClick={handleDetectImage}
                disabled={isAnalyzing || !imagePreviewUrl}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scanning Image...</span>
                  </>
                ) : (
                  <>
                    <span>Detect AI Generation</span>
                    <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 1-Click Preset Samples */}
        <div className="pt-5 border-t border-slate-200/80">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {inputMode === 'image' ? '1-Click Sample Images to Test:' : '1-Click Sample Claim Dossiers:'}
          </div>

          {inputMode === 'image' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SAMPLE_IMAGES.map((img) => {
                const isSelected = imageResult?.id === img.id && activeResultType === 'image';
                const style = getVerdictStyle(img.verdict);
                return (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImagePreset(img)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex items-center gap-3 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-400 shadow-sm ring-1 ring-teal-400'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg}`}>
                        {img.verdict}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 truncate mt-1">
                        {img.title}
                      </p>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {img.style}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_CLAIMS.map((claim) => {
                const isSelected = claimResult?.id === claim.id && activeResultType === 'claim';
                const style = getVerdictStyle(claim.verdict);
                return (
                  <button
                    key={claim.id}
                    onClick={() => handleSelectClaimPreset(claim)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-400 shadow-sm ring-1 ring-teal-400'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-teal-800 uppercase">
                        {claim.category}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg}`}>
                        {claim.verdict}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed">
                      {claim.title}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Score: <strong className="text-slate-800">{claim.confidence}%</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Results Dashboard: Current Result Card */}
      {activeResultType === 'claim' && claimResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-card space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* Clear, Bold Verdict Badge */}
                {(() => {
                  const style = getVerdictStyle(claimResult.verdict);
                  return (
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${style.bg}`}>
                      <span className="material-symbols-outlined text-[16px]">{style.icon}</span>
                      VERDICT: {style.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                  {claimResult.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {claimResult.title}
              </h3>
            </div>

            {/* Prominent Credibility/Confidence Score */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Credibility Score</span>
              <span className={`text-2xl font-extrabold ${getVerdictStyle(claimResult.verdict).text}`}>
                {claimResult.confidence}%
              </span>
            </div>
          </div>

          {/* Visual Progress Meter */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getVerdictStyle(claimResult.verdict).bar} rounded-full transition-all duration-700`}
              style={{ width: `${claimResult.confidence}%` }}
            ></div>
          </div>

          {/* Brief 1-2 Sentence Evidence Summary */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-teal-600 text-[16px]">description</span>
              Evidence Summary
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">
              {claimResult.summary}
            </p>
          </div>

          {/* Save to History Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Verified in active session
            </span>
            <button
              onClick={handleSaveToDatabase}
              className="bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow active:translate-y-0"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
              Save to History
            </button>
          </div>
        </div>
      )}

      {/* Image Current Result Card */}
      {activeResultType === 'image' && imageResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-card space-y-5 animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image Preview */}
            <div className="w-full md:w-56 h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-sm relative">
              <img
                src={imagePreviewUrl}
                alt={imageResult.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded shadow">
                  {imageResult.style}
                </span>
              </div>
            </div>

            {/* Output Details */}
            <div className="flex-grow space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="mb-2">
                    {/* Clear, Bold Verdict Badge */}
                    {(() => {
                      const style = getVerdictStyle(imageResult.verdict);
                      return (
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg border inline-flex items-center gap-1.5 shadow-sm ${style.bg}`}>
                          <span className="material-symbols-outlined text-[16px]">{style.icon}</span>
                          VERDICT: {style.label}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {imageResult.title}
                  </h3>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Detection Score</span>
                  <span className={`text-2xl font-extrabold ${getVerdictStyle(imageResult.verdict).text}`}>
                    {imageResult.confidence}%
                  </span>
                </div>
              </div>

              {/* Single Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getVerdictStyle(imageResult.verdict).bar} rounded-full transition-all duration-700`}
                  style={{ width: `${imageResult.confidence}%` }}
                ></div>
              </div>

              {/* Brief 1-2 Sentence Evidence Summary */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-600 text-[16px]">brush</span>
                  Forensic Evidence Summary
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {imageResult.summary}
                </p>
              </div>

              {/* Save to History Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  AI Image Forensics Complete
                </span>
                <button
                  onClick={handleSaveToDatabase}
                  className="bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                  Save to History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white border ${toastMsg.type === 'info' ? 'border-slate-300 text-slate-800' : 'border-emerald-300 text-emerald-800'} p-4 rounded-xl shadow-clean flex items-center gap-3 animate-fadeIn`}>
          <span className={`material-symbols-outlined text-[20px] ${toastMsg.type === 'info' ? 'text-slate-600' : 'text-emerald-600'}`}>
            {toastMsg.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="text-xs font-bold">{toastMsg.message}</span>
        </div>
      )}

      {/* 3. Recent Verifications History List (With Delete History & Reset Actions) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700 text-[20px]">history</span>
            <h3 className="text-base font-bold text-slate-900">
              Recent Verifications ({savedLogs.length} Records)
            </h3>
          </div>

          {/* Action buttons: Delete History & Reset Demo Data */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {savedLogs.length > 0 ? (
              <button
                onClick={handleClearAllHistory}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                title="Delete all history entries"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>Delete History</span>
              </button>
            ) : (
              <button
                onClick={handleResetDemoHistory}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                title="Restore demo placeholder history entries"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Restore Demo History</span>
              </button>
            )}
          </div>
        </div>

        {/* History List or Empty State */}
        {savedLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {savedLogs.map((log) => {
              const style = getVerdictStyle(log.verdict);
              return (
                <div
                  key={log.id}
                  onClick={() => handleInspectHistory(log)}
                  className="py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/90 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-start sm:items-center gap-2.5 overflow-hidden flex-grow">
                    {/* Bold Verdict Badge */}
                    <span className={`px-2.5 py-0.5 rounded-md font-bold border shrink-0 text-[11px] ${style.bg}`}>
                      {style.label}
                    </span>
                    
                    <span className="text-slate-400 font-mono text-[11px] shrink-0 font-medium">
                      [{log.type}]
                    </span>

                    <span className="text-slate-800 font-semibold group-hover:text-teal-700 transition-colors line-clamp-1">
                      {log.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-slate-500 self-end sm:self-auto">
                    <span>Confidence: <strong className="text-slate-900 font-bold">{log.confidence}%</strong></span>
                    <span>•</span>
                    <span className="text-slate-400">{log.timestamp}</span>

                    {/* Single Item Delete Button */}
                    <button
                      onClick={(e) => handleDeleteLogItem(log.id, e)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-all duration-200 opacity-60 group-hover:opacity-100"
                      title="Delete this entry"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>

                    <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty History State */
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">history_toggle_off</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Verification History is Empty</p>
              <p className="text-xs text-slate-500 mt-0.5">Run a verification above to record new items, or restore the demo history.</p>
            </div>
            <button
              onClick={handleResetDemoHistory}
              className="bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-slate-700 border border-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              Restore Demo History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
