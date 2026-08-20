import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_CLAIMS, SAMPLE_IMAGES } from '../data/mockData';
import { verifyTextWithGemini, verifyImageWithGemini } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

// Rotating placeholder claims that change every 6 seconds
const ROTATING_CLAIM_PLACEHOLDERS = [
  "e.g. Viral quote from Virat Kohli responding to Harsha Bhogle during the match...",
  "e.g. New eco-tourism sustainability regulations for heritage sites in Kerala and Goa...",
  "e.g. Acceptor impurity increases p-type semiconductor conductivity by 500%...",
  "e.g. Theorem regarding the roots of analytic functions in complex analysis...",
  "e.g. Lawrence Livermore achieves net positive laser fusion energy gain exceeding 2.5...",
  "e.g. Central Bank announces mandatory digital currency phase-out by Q3 2026..."
];

/**
 * Persist a verification result to the Supabase `verifications` table.
 * Silent — does not disrupt the UI on failure.
 */
async function saveVerificationToSupabase(user, { claimText, verdict, confidence, summary, type }) {
  if (!user?.id) return;
  const { error } = await supabase.from('verifications').insert([{
    user_id: user.id,
    claim_text: claimText,
    verdict,
    confidence,
    summary,
    type: type || 'text',
  }]);
  if (error) console.error('Error saving verification to Supabase:', error);
}

export default function VerificationConsole({ 
  user,
  onSaveAndNavigateToDashboard, 
  onAddHistoryItem,
  onOpenApiSettings
}) {
  // 3-way toggle: 'text' | 'url' | 'image'
  const [inputMode, setInputMode] = useState('text');

  // Input states
  const [claimText, setClaimText] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(SAMPLE_IMAGES[0].imageUrl);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Rotating placeholder index (changes every 6 seconds)
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Result state
  const [activeResult, setActiveResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing claim against global dossiers...');

  // Cycle placeholder every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % ROTATING_CLAIM_PLACEHOLDERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Handle Text/URL Live Verification via Gemini Backend
  const handleVerifyClaim = async (e) => {
    if (e) e.preventDefault();
    const query = inputMode === 'text' ? (claimText || ROTATING_CLAIM_PLACEHOLDERS[placeholderIndex].replace('e.g. ', '')) : articleUrl;
    if (!query && inputMode !== 'image') return;

    setIsAnalyzing(true);
    setLoadingMessage(inputMode === 'url' ? 'Ingesting URL & evaluating source credibility with Gemini 3.5...' : 'Analyzing claim against global dossiers with Gemini 3.5...');

    try {
      const liveResult = await verifyTextWithGemini(query, inputMode);

      const resultObj = {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: inputMode === 'url' ? 'URL' : 'Text',
        snippet: query.length > 75 ? query.substring(0, 72) + '...' : query,
        verdict: liveResult.verdict,
        confidence: liveResult.confidence,
        summary: liveResult.summary,
        modelUsed: liveResult.modelUsed || 'Gemini 3.5 Flash'
      };

      setActiveResult(resultObj);
      if (onAddHistoryItem) onAddHistoryItem(resultObj);

      // Persist to Supabase if user is logged in
      await saveVerificationToSupabase(user, {
        claimText: query,
        verdict: liveResult.verdict,
        confidence: liveResult.confidence,
        summary: liveResult.summary,
        type: inputMode === 'url' ? 'url' : 'text',
      });
    } catch (err) {
      console.error('Verification error:', err);
      setActiveResult({
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: inputMode === 'url' ? 'URL' : 'Text',
        snippet: query.length > 75 ? query.substring(0, 72) + '...' : query,
        verdict: 'Error',
        confidence: 0,
        summary: err.message || 'Verification failed. Please check your network and API key.',
        modelUsed: 'Error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Preset Claim Selection
  const handleSelectClaimPreset = async (claim) => {
    setInputMode('text');
    setClaimText(claim.sourceText);
    setIsAnalyzing(true);
    setLoadingMessage('Executing Gemini claim verification...');

    try {
      const liveResult = await verifyTextWithGemini(claim.sourceText, 'text');
      const resultObj = {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Text',
        snippet: claim.title,
        verdict: liveResult.verdict || claim.verdict,
        confidence: liveResult.confidence || claim.confidence,
        summary: liveResult.summary || claim.summary,
        modelUsed: liveResult.modelUsed || 'Gemini Flash'
      };
      setActiveResult(resultObj);
      if (onAddHistoryItem) onAddHistoryItem(resultObj);
    } catch (e) {
      console.error('Preset claim verification error:', e);
      setActiveResult({
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Text',
        snippet: claim.title,
        verdict: 'Error',
        confidence: 0,
        summary: e.message || 'Verification failed. Please check your network and API key.',
        modelUsed: 'Error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Drag and Drop
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

  const processUploadedFile = async (file) => {
    const url = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(url);

    setIsAnalyzing(true);
    setLoadingMessage('Scanning uploaded image with Gemini Multimodal Vision AI...');

    try {
      const liveResult = await verifyImageWithGemini(file);
      const resultObj = {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Image',
        snippet: `Image: ${file.name.replace(/\.[^/.]+$/, "")}`,
        verdict: liveResult.verdict,
        confidence: liveResult.confidence,
        imageUrl: url,
        summary: liveResult.summary,
        forensicDetails: liveResult.forensicDetails || [],
        modelUsed: liveResult.modelUsed || 'Gemini Vision AI'
      };
      setActiveResult(resultObj);
      if (onAddHistoryItem) onAddHistoryItem(resultObj);

      // Persist to Supabase if user is logged in
      await saveVerificationToSupabase(user, {
        claimText: file.name,
        verdict: liveResult.verdict,
        confidence: liveResult.confidence,
        summary: liveResult.summary,
        type: 'image',
      });
    } catch (e) {
      console.error('Image verification failed:', e);
      setActiveResult({
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Image',
        snippet: `Image: ${file.name.replace(/\.[^/.]+$/, "")}`,
        verdict: 'Error',
        confidence: 0,
        imageUrl: url,
        summary: e.message || 'Image verification failed. Please check your API key and network connection.',
        forensicDetails: [],
        modelUsed: 'Error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Preset Image Selection
  const handleSelectImagePreset = async (img) => {
    setInputMode('image');
    setImagePreviewUrl(img.imageUrl);
    setSelectedImageFile(null);
    setIsAnalyzing(true);
    setLoadingMessage('Scanning Image with Gemini Multimodal Vision AI...');

    try {
      const liveResult = await verifyImageWithGemini(img.imageUrl);
      const resultObj = {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Image',
        snippet: img.title.startsWith('Image:') ? img.title : `Image: ${img.title}`,
        verdict: liveResult.verdict || img.verdict,
        confidence: liveResult.confidence || img.confidence,
        imageUrl: img.imageUrl,
        summary: liveResult.summary || img.summary,
        forensicDetails: liveResult.forensicDetails || [],
        modelUsed: liveResult.modelUsed || 'Gemini Vision AI'
      };
      setActiveResult(resultObj);
      if (onAddHistoryItem) onAddHistoryItem(resultObj);
    } catch (e) {
      console.error('Image preset verification failed:', e);
      setActiveResult({
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Image',
        snippet: img.title.startsWith('Image:') ? img.title : `Image: ${img.title}`,
        verdict: 'Error',
        confidence: 0,
        imageUrl: img.imageUrl,
        summary: e.message || 'Image verification failed. Please check your API key and retry.',
        forensicDetails: [],
        modelUsed: 'Error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleDetectImage = async () => {
    setIsAnalyzing(true);
    setLoadingMessage('Executing Gemini Vision AI forensic scan...');

    try {
      const liveResult = await verifyImageWithGemini(selectedImageFile || imagePreviewUrl);

      const resultObj = {
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Image',
        snippet: `Image: ${selectedImageFile ? selectedImageFile.name.replace(/\.[^/.]+$/, "") : 'Bustling market fine art image'}`,
        verdict: liveResult.verdict,
        confidence: liveResult.confidence,
        imageUrl: imagePreviewUrl,
        summary: liveResult.summary,
        forensicDetails: liveResult.forensicDetails || [],
        modelUsed: liveResult.modelUsed || 'Gemini Vision AI'
      };
      setActiveResult(resultObj);
      if (onAddHistoryItem) onAddHistoryItem(resultObj);
    } catch (e) {
      console.error('Image detection failed:', e);
      setActiveResult({
        id: `hist-${Date.now()}`,
        date: 'Just now',
        type: 'Image',
        snippet: `Image: ${selectedImageFile ? selectedImageFile.name.replace(/\.[^/.]+$/, "") : 'image'}`,
        verdict: 'Error',
        confidence: 0,
        imageUrl: imagePreviewUrl,
        summary: e.message || 'Image verification failed. Please check your API key and retry.',
        forensicDetails: [],
        modelUsed: 'Error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Verdict style mapper
  const getVerdictStyle = (verdict) => {
    const v = String(verdict || '').toLowerCase();
    if (v === 'error') {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300',
        text: 'text-rose-700',
        bar: 'bg-rose-500',
        icon: 'error',
        label: 'Error'
      };
    }
    if (v === 'true' || v === 'verified' || v === 'authentic' || v.includes('likely real')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        icon: 'check_circle',
        label: v.includes('likely real') ? 'Likely Real' : (v === 'authentic' ? 'Authentic' : 'True')
      };
    }
    if (v.includes('manipulat')) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
        icon: 'auto_fix_high',
        label: 'Manipulated'
      };
    }
    if (v === 'false' || v === 'debunked' || v.includes('ai generated') || v.includes('ai-generated')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'text-rose-700',
        bar: 'bg-rose-500',
        icon: 'cancel',
        label: v.includes('ai') ? 'AI Generated' : 'False'
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
      {/* Input Console Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-card space-y-6">
        {/* Console Header & 3-Way Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                Gemini Live Verification
              </span>
              <span className="text-xs text-slate-500">• Powered by Google Gemini 3.5 Flash & Global Dossiers</span>
              {onOpenApiSettings && (
                <button
                  type="button"
                  onClick={onOpenApiSettings}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition-colors inline-flex items-center gap-1 shadow-sm"
                  title="Configure API key or test connection"
                >
                  <span className="material-symbols-outlined text-[13px]">tune</span>
                  <span>API Config</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Forensic Claim Verification Console
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Input textual claims, news article URLs, or upload images to run real-time verification against global dossiers.
            </p>
          </div>

          {/* 3-Way Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start md:self-auto text-xs font-semibold">
            <button
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                inputMode === 'text' 
                  ? 'bg-white text-teal-800 shadow-sm font-bold' 
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
                  ? 'bg-white text-teal-800 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
              Article URL
            </button>

            <button
              onClick={() => setInputMode('image')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                inputMode === 'image' 
                  ? 'bg-white text-teal-800 shadow-sm font-bold' 
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-2" htmlFor="claimInput">
                  <span>Enter claim or statement to verify</span>
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
                    Live Suggestions
                  </span>
                </label>

                {/* Quick Action to autofill rotating sample */}
                {!claimText && (
                  <button
                    type="button"
                    onClick={() => setClaimText(ROTATING_CLAIM_PLACEHOLDERS[placeholderIndex].replace('e.g. ', ''))}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-0.5 rounded-md transition-all duration-200 flex items-center gap-1 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                    title="Click to autofill this rotating sample"
                  >
                    <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                    <span>Use rotating example</span>
                  </button>
                )}
              </div>

              {/* Textarea with Direct Dynamic Placeholder & Smooth Animated Transition */}
              <div className="relative rounded-xl overflow-hidden">
                <textarea
                  id="claimInput"
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder={ROTATING_CLAIM_PLACEHOLDERS[placeholderIndex]}
                  rows={3}
                  className="w-full clean-input rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 placeholder:transition-opacity placeholder:duration-500 resize-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-teal-600 text-[16px]">shield</span>
                Live Gemini 3.5 Flash Fact Extraction & Structured Validation
              </span>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-75 disabled:hover:translate-y-0"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">{loadingMessage}</span>
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
                Enter article or news report URL
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
                Automated web URL credibility & claim verification
              </span>
              <button
                type="submit"
                disabled={isAnalyzing || !articleUrl.trim()}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-75 disabled:hover:translate-y-0"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">{loadingMessage}</span>
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
            {/* User-Friendly Drag & Drop Zone */}
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
                  Live Gemini Multimodal Vision inspects for synthetic watercolor bleeding, faux sketch strokes, hyper-realistic 3D rendering, and camera noise distributions.
                </p>
                <span className="text-[11px] font-semibold text-teal-700 block pt-0.5">
                  Supports PNG, JPG, WebP • Drag & drop ready
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-teal-600 text-[16px]">auto_awesome</span>
                Gemini Vision AI base64 multimodal forensic scan
              </span>
              <button
                type="button"
                onClick={handleDetectImage}
                disabled={isAnalyzing || !imagePreviewUrl}
                className="bg-teal-600 hover:bg-teal-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-75 disabled:hover:translate-y-0"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    <span>Verify Image</span>
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
                const isSelected = activeResult?.snippet?.includes(img.title);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SAMPLE_CLAIMS.map((claim) => {
                const isSelected = activeResult?.snippet === claim.title;
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

      {/* Result Card with "View in Dashboard" button */}
      {activeResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-card space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* Clear, Bold Verdict Badge */}
                {(() => {
                  const style = getVerdictStyle(activeResult.verdict);
                  return (
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${style.bg}`}>
                      <span className="material-symbols-outlined text-[16px]">{style.icon}</span>
                      VERDICT: {style.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                  Type: {activeResult.type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {activeResult.snippet}
              </h3>
            </div>

            {/* Credibility / Confidence Score */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Confidence Score</span>
              <span className={`text-2xl font-extrabold ${getVerdictStyle(activeResult.verdict).text}`}>
                {activeResult.confidence}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getVerdictStyle(activeResult.verdict).bar} rounded-full transition-all duration-700`}
              style={{ width: `${activeResult.confidence}%` }}
            ></div>
          </div>

          {/* Brief Evidence Summary */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-teal-600 text-[16px]">description</span>
              Evidence Summary
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">
              {activeResult.summary}
            </p>
          </div>

          {/* Forensic Breakdown Card (multimodal image analysis findings) */}
          {activeResult.type === 'Image' && activeResult.forensicDetails && activeResult.forensicDetails.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 border border-slate-800 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-400 text-[22px]">biotech</span>
                  <h4 className="text-sm font-bold tracking-wide uppercase text-teal-300">
                    Multimodal Forensic Breakdown
                  </h4>
                </div>
                <span className="text-[11px] font-semibold bg-teal-950 text-teal-300 border border-teal-800 px-2.5 py-0.5 rounded-full">
                  {activeResult.forensicDetails.length} Key Signatures Analyzed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {activeResult.forensicDetails.map((item, idx) => {
                  const cat = String(item.category || 'Artifacts').toLowerCase();
                  let iconName = 'blur_on';
                  let badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40';

                  if (cat.includes('light')) {
                    iconName = 'lightbulb';
                    badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  } else if (cat.includes('geom')) {
                    iconName = 'straighten';
                    badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                  } else if (cat.includes('text')) {
                    iconName = 'texture';
                    badgeStyle = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
                  } else if (cat.includes('anat')) {
                    iconName = 'accessibility';
                    badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  }

                  return (
                    <div
                      key={idx}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 space-y-2 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${badgeStyle}`}>
                          <span className="material-symbols-outlined text-[15px]">{iconName}</span>
                          {item.category}
                        </span>

                        {item.locationHint && item.locationHint !== 'unspecified' && (
                          <span className="text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700 font-mono truncate max-w-[150px]">
                            📍 {item.locationHint}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row with "View in Dashboard" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Live Gemini verification saved to Dashboard.</span>
              </span>
              {activeResult.modelUsed && (
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  Engine: {activeResult.modelUsed}
                </span>
              )}
            </div>

            <button
              onClick={() => onSaveAndNavigateToDashboard(activeResult)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>View in Dashboard</span>
              <span className="material-symbols-outlined text-[16px]">dashboard_customize</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
