import React, { useState, useRef } from 'react';
import { TypingResult, CertificateTier } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { 
  Award, 
  ShieldCheck, 
  Download, 
  FileText, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  QrCode,
  Zap,
  Target,
  Clock,
  Keyboard,
  Share2,
  Check
} from 'lucide-react';

interface OfficialTypingCertificateProps {
  result: TypingResult;
  candidateName?: string;
  onUpdateCandidateName?: (name: string) => void;
  showControls?: boolean;
}

export function getTierConfig(tier?: CertificateTier | null) {
  switch (tier) {
    case 'platinum':
      return {
        title: 'Elite Speed Typist',
        badgeLabel: 'Elite Speed Typist - Platinum',
        themeColor: 'from-cyan-500 to-blue-600',
        textColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/40',
        accentBg: 'bg-cyan-500/10',
        sealColor: '#06b6d4',
        sealFill: '#083344',
        starCount: 3,
        description: 'Demonstrated transcendent typing velocity (70+ Net WPM) with pristine biomechanical precision (≥98% Accuracy).'
      };
    case 'gold':
      return {
        title: 'Master Typist',
        badgeLabel: 'Master Typist - Gold',
        themeColor: 'from-amber-400 to-yellow-600',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        accentBg: 'bg-amber-500/10',
        sealColor: '#f59e0b',
        sealFill: '#451a03',
        starCount: 2,
        description: 'Demonstrated master-grade speed (50+ Net WPM) with professional-grade accuracy (≥97% Accuracy).'
      };
    case 'silver':
    default:
      return {
        title: 'Certified Typist',
        badgeLabel: 'Certified Typist - Silver',
        themeColor: 'from-slate-300 to-slate-500',
        textColor: 'text-slate-300',
        borderColor: 'border-slate-400/40',
        accentBg: 'bg-slate-400/10',
        sealColor: '#94a3b8',
        sealFill: '#0f172a',
        starCount: 1,
        description: 'Demonstrated verified touch-typing proficiency (30+ Net WPM) with high biomechanical precision (≥95% Accuracy).'
      };
  }
}

export const OfficialTypingCertificate: React.FC<OfficialTypingCertificateProps> = ({
  result,
  candidateName = 'SmartTypist Candidate',
  onUpdateCandidateName,
  showControls = true
}) => {
  const { settings } = useSettings();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(candidateName);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Check if active theme is Warm Ivory & Sapphire (or default warm theme)
  const isWarmTheme = settings?.theme === 'warm' || settings?.theme === 'ivory-sapphire' || (!settings?.theme && true);

  const tier = result.certificateTier || (result.netWpm >= 70 && result.accuracy >= 98 ? 'platinum' : result.netWpm >= 50 && result.accuracy >= 97 ? 'gold' : 'silver');
  const tierInfo = getTierConfig(tier);

  // Time & Performance Matrix Values
  const netWpm = result.netWpm;
  const grossWpm = result.grossWpm || result.grossWPM || netWpm;
  const accuracy = typeof result.accuracy === 'number' ? result.accuracy.toFixed(1) : '100.0';
  
  const allottedSec = result.allottedDurationSeconds || result.durationSeconds || 60;
  const allottedLabel = allottedSec >= 60 ? `${Math.round(allottedSec / 60)} Min` : `${allottedSec}s`;
  
  const actualSec = result.actualTimeTakenSeconds || Number((result.elapsedMs / 1000).toFixed(1)) || result.durationSeconds;
  const actualMinutes = Math.floor(actualSec / 60);
  const actualSecondsRemainder = Math.floor(actualSec % 60);
  const actualTimeFormatted = `${String(actualMinutes).padStart(2, '0')}:${String(actualSecondsRemainder).padStart(2, '0')}s`;
  
  const timeSaved = result.paceTimeSavedSeconds !== undefined ? result.paceTimeSavedSeconds : Math.max(0, Number((allottedSec - actualSec).toFixed(1)));
  const paceLabel = timeSaved > 1 
    ? `${timeSaved}s early` 
    : timeSaved === 0 && actualSec >= allottedSec 
      ? 'Full duration' 
      : 'On-time';

  const correctWords = result.correctWordsCount ?? Math.max(0, Math.round(result.correctCharacters / 5));
  const wrongWords = result.incorrectWordsCount ?? Math.max(0, Math.round(result.uncorrectedErrors / 3));
  const spacebarHits = result.spacebarHits ?? Math.max(0, Math.round(correctWords * 0.95));

  const certCode = result.certificateCode || `ST-CERT-${result.id ? result.id.slice(-6).toUpperCase() : '8X9K2M'}`;
  
  const formattedDate = new Date(result.completedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = nameInput.trim() || 'SmartTypist Candidate';
    setNameInput(cleanName);
    setIsEditingName(false);
    if (onUpdateCandidateName) {
      onUpdateCandidateName(cleanName);
    }
  };

  // Export as PNG
  const handleDownloadPng = async () => {
    if (!certificateRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: isWarmTheme ? '#FAF7F2' : '#0a0f1d'
      });
      const link = document.createElement('a');
      link.download = `SmartTypingPro_Certificate_${candidateName.replace(/\s+/g, '_')}_${netWpm}WPM.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export certificate as PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export as PDF
  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: isWarmTheme ? '#FAF7F2' : '#0a0f1d'
      });
      
      // Standard Landscape PDF (A4: 297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`SmartTypingPro_Certificate_${candidateName.replace(/\s+/g, '_')}_${netWpm}WPM.pdf`);
    } catch (err) {
      console.error('Failed to export certificate as PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Print Dialog
  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerification = () => {
    const text = `Official SmartTyping Pro Typing Certificate\nCandidate: ${candidateName}\nScore: ${netWpm} Net WPM (${accuracy}% Accuracy)\nTier: ${tierInfo.badgeLabel}\nVerification Code: ${certCode}\nVerified at SmartTyping Pro Engine.`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div id="verified-certificate-container" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Action Toolbar */}
      {showControls && (
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl backdrop-blur-md shadow-lg transition-colors ${isWarmTheme ? 'bg-[#fffdf5] border border-[#0F52BA]/20' : 'bg-slate-900/90 border border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isWarmTheme ? 'bg-[#0F52BA]/10 border border-[#0F52BA]/30 text-[#0F52BA]' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-bold ${isWarmTheme ? 'text-slate-900' : 'text-slate-100'}`}>Verified Official Certificate</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase ${isWarmTheme ? 'bg-[#0F52BA]/10 text-[#0F52BA] border border-[#0F52BA]/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  Approved
                </span>
              </div>
              <p className={`text-xs ${isWarmTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                Issued for candidate <strong className={isWarmTheme ? 'text-slate-900 font-bold' : 'text-slate-200'}>{candidateName}</strong> • {tierInfo.badgeLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="cert-edit-name-btn"
              onClick={() => setIsEditingName(!isEditingName)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${isWarmTheme ? 'bg-[#0F52BA]/10 hover:bg-[#0F52BA]/20 text-[#0F52BA] border-[#0F52BA]/30' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
            >
              <Edit3 className={`w-3.5 h-3.5 ${isWarmTheme ? 'text-[#0F52BA]' : 'text-cyan-400'}`} />
              <span className={isWarmTheme ? 'text-[#0F52BA] font-bold' : 'text-white'}>{isEditingName ? 'Close Name Edit' : 'Edit Candidate Name'}</span>
            </button>

            <button
              id="cert-download-png-btn"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer ${isWarmTheme ? 'bg-[#0F52BA] hover:bg-[#0d47a1] text-white shadow-[#0F52BA]/20' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              id="cert-download-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer ${isWarmTheme ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-500/20' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/10'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              id="cert-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
            </button>

            <button
              id="cert-share-btn"
              onClick={handleCopyVerification}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Copy Verification Summary"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        </div>
      )}

      {/* Inline Candidate Name Editor */}
      {isEditingName && (
        <form 
          onSubmit={handleSaveName}
          className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${isWarmTheme ? 'bg-[#fffdf5] border-[#0F52BA]/30 shadow-md' : 'bg-slate-900 border-cyan-500/40'}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className={`text-xs font-semibold shrink-0 ${isWarmTheme ? 'text-slate-800' : 'text-slate-300'}`}>
              Enter Your Full Name for Official Certificate:
            </label>
            <input
              type="text"
              id="cert-candidate-name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g., Alexander Hamilton"
              className={`flex-1 w-full rounded-xl px-3.5 py-2 text-sm focus:outline-none ${isWarmTheme ? 'bg-[#FAF7F2] border border-[#0F52BA]/30 focus:border-[#0F52BA] text-slate-900 placeholder:text-slate-400' : 'bg-slate-950 border-slate-700 focus:border-cyan-400 text-slate-100 placeholder:text-slate-600'}`}
              autoFocus
            />
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer ${isWarmTheme ? 'bg-[#0F52BA] hover:bg-[#0d47a1] text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'}`}
            >
              Apply to Certificate
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MASTER HIGH-RESOLUTION CERTIFICATE CANVAS (Self-contained, pixel-perfect) */}
      {/* ========================================================================= */}
      <div className="overflow-x-auto pb-4">
        <div
          ref={certificateRef}
          id="official-smarttyping-certificate-card"
          className={`relative w-full min-w-[820px] max-w-4xl mx-auto aspect-[1.414/1] rounded-2xl p-8 sm:p-10 select-none overflow-hidden font-sans transition-all duration-300 ${
            isWarmTheme 
              ? 'bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-[#F5EFEB] text-slate-800 border-4 border-[#0F52BA]' 
              : 'bg-gradient-to-b from-slate-950 via-[#0a1022] to-slate-950 text-slate-100 border-4 border-amber-500/40'
          }`}
          style={{
            boxShadow: isWarmTheme 
              ? '0 20px 50px -10px rgba(15, 82, 186, 0.18), inset 0 0 40px rgba(15, 82, 186, 0.04)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(245, 158, 11, 0.05)'
          }}
        >
          {/* Ornate Background Security Guilloche & Watermark */}
          <div className={`absolute inset-0 pointer-events-none ${isWarmTheme ? 'opacity-[0.04] bg-[radial-gradient(#0F52BA_1px,transparent_1px)] [background-size:16px_16px]' : 'opacity-[0.03] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]'}`} />
          
          {/* Subtle Luxury Gradient Glows */}
          <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isWarmTheme ? 'bg-[#0F52BA]/8' : 'bg-amber-500/10'}`} />
          <div className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isWarmTheme ? 'bg-amber-500/8' : 'bg-cyan-500/10'}`} />

          {/* Double Decorative Border Frame with Corner Flourishes */}
          <div className={`absolute inset-3.5 sm:inset-4.5 border rounded-xl pointer-events-none ${isWarmTheme ? 'border-[#0F52BA]/40' : 'border-amber-500/30'}`} />
          <div className={`absolute inset-5 sm:inset-6 border rounded-lg pointer-events-none ${isWarmTheme ? 'border-[#d97706]/40' : 'border-slate-700/60'}`} />

          {/* Corner Flourish Emblems */}
          <div className={`absolute top-7 left-7 font-mono text-xs select-none ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-400/50'}`}>❖</div>
          <div className={`absolute top-7 right-7 font-mono text-xs select-none ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-400/50'}`}>❖</div>
          <div className={`absolute bottom-7 left-7 font-mono text-xs select-none ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-400/50'}`}>❖</div>
          <div className={`absolute bottom-7 right-7 font-mono text-xs select-none ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-400/50'}`}>❖</div>

          {/* Inner Certificate Content Layout */}
          <div className="relative z-10 h-full flex flex-col justify-between px-4 sm:px-6 py-2">
            
            {/* 1. Header Section */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${isWarmTheme ? 'bg-[#0F52BA]/10 border border-[#0F52BA]/30 text-[#0F52BA]' : 'bg-amber-500/20 border border-amber-500/50 text-amber-400'}`}>
                  <Award className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold tracking-[0.25em] uppercase font-mono ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-400'}`}>
                  SmartTyping Pro Verified Credentials
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${isWarmTheme ? 'bg-[#0F52BA]/10 border border-[#0F52BA]/30 text-[#0F52BA]' : 'bg-amber-500/20 border border-amber-500/50 text-amber-400'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-serif ${isWarmTheme ? 'text-[#0F52BA]' : 'text-slate-100'}`}>
                Certificate of Typing Achievement
              </h1>
              
              <p className={`text-[11px] sm:text-xs max-w-xl mx-auto italic font-serif ${isWarmTheme ? 'text-[#475569]' : 'text-slate-400'}`}>
                This official credential is awarded in recognition of outstanding speed, biomechanical rhythm, and verified touch-typing precision.
              </p>
            </div>

            {/* 2. Candidate Presentation Section */}
            <div className="text-center my-auto py-2 space-y-1.5">
              <span className={`text-[10px] sm:text-[11px] font-mono tracking-widest uppercase ${isWarmTheme ? 'text-[#64748b]' : 'text-slate-400'}`}>
                THIS IS PROUDLY PRESENTED TO
              </span>
              
              <div className="relative inline-block px-8 py-1 max-w-full">
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide font-serif capitalize ${
                  isWarmTheme 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#0F52BA] via-[#1e3a8a] to-[#0F52BA]' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200'
                }`}>
                  {candidateName}
                </h2>
                <div className={`h-0.5 w-full mt-1 ${isWarmTheme ? 'bg-gradient-to-r from-transparent via-[#0F52BA]/60 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-500/70 to-transparent'}`} />
              </div>

              {/* Tier Badge Pill */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full ${
                  isWarmTheme 
                    ? (tier === 'platinum' ? 'bg-gradient-to-r from-[#0F52BA] to-[#1e3a8a] text-white shadow-md' : tier === 'gold' ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md' : 'bg-gradient-to-r from-[#475569] to-[#334155] text-white shadow-md')
                    : `bg-gradient-to-r ${tierInfo.themeColor} text-slate-950`
                } font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{tierInfo.badgeLabel}</span>
                  <div className="flex gap-0.5 ml-1">
                    {Array.from({ length: tierInfo.starCount }).map((_, i) => (
                      <span key={i} className={isWarmTheme ? "text-amber-300 text-[10px]" : "text-slate-950 text-[10px]"}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Comprehensive Performance Matrix (3x3 Grid) */}
            <div className="my-auto py-2">
              <div className={`w-full rounded-xl overflow-hidden shadow-inner backdrop-blur-xs ${isWarmTheme ? 'bg-[#FAF7F2] border border-[#0F52BA]/30' : 'bg-slate-900/90 border border-slate-800/90'}`}>
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase tracking-wider font-mono ${isWarmTheme ? 'border-[#0F52BA]/25 bg-[#0F52BA]/10 text-[#0F52BA]' : 'border-slate-800 bg-slate-950/60 text-slate-400'}`}>
                      <th className={`py-1 px-2 border-r ${isWarmTheme ? 'border-[#0F52BA]/20' : 'border-slate-800'}`}>Speed Diagnostics</th>
                      <th className={`py-1 px-2 border-r ${isWarmTheme ? 'border-[#0F52BA]/20' : 'border-slate-800'}`}>Time & Pace Efficiency</th>
                      <th className="py-1 px-2">Biomechanical Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isWarmTheme ? 'divide-[#0F52BA]/15' : 'divide-slate-800/80'}`}>
                    {/* Row 1: Core Metrics */}
                    <tr className={isWarmTheme ? 'bg-white/80' : 'bg-slate-900/40'}>
                      <td className={`py-2 px-3 border-r ${isWarmTheme ? 'border-[#0F52BA]/15' : 'border-slate-800/80'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Net Speed:</span>
                          <span className={`font-mono font-extrabold text-sm ${isWarmTheme ? 'text-[#0F52BA]' : 'text-emerald-400'}`}>{netWpm} WPM</span>
                        </div>
                      </td>
                      <td className={`py-2 px-3 border-r ${isWarmTheme ? 'border-[#0F52BA]/15' : 'border-slate-800/80'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Allotted Time:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#1e293b]' : 'text-slate-200'}`}>{allottedLabel}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Correct Words:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#059669]' : 'text-emerald-400'}`}>{correctWords} words</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2: Accuracy & Timing */}
                    <tr className={isWarmTheme ? 'bg-[#FAF7F2]/80' : 'bg-slate-950/40'}>
                      <td className={`py-2 px-3 border-r ${isWarmTheme ? 'border-[#0F52BA]/15' : 'border-slate-800/80'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Accuracy:</span>
                          <span className={`font-mono font-extrabold text-sm ${isWarmTheme ? 'text-[#0284c7]' : 'text-cyan-400'}`}>{accuracy}%</span>
                        </div>
                      </td>
                      <td className={`py-2 px-3 border-r ${isWarmTheme ? 'border-[#0F52BA]/15' : 'border-slate-800/80'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Time Taken:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#1e293b]' : 'text-slate-200'}`}>{actualTimeFormatted}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Wrong Words:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#e11d48]' : 'text-rose-400'}`}>{wrongWords}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 3: Gross & Pace & Spacebar */}
                    <tr className={isWarmTheme ? 'bg-white/80' : 'bg-slate-900/40'}>
                      <td className={`py-2 px-3 border-r ${isWarmTheme ? 'border-[#0F52BA]/15' : 'border-slate-800/80'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Gross Speed:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#1e293b]' : 'text-slate-300'}`}>{grossWpm} WPM</span>
                        </div>
                      </td>
                      <td className={`py-2 px-3 border-r ${isWarmTheme ? 'border-[#0F52BA]/15' : 'border-slate-800/80'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Pace / Saved:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#d97706]' : 'text-amber-400'}`}>{paceLabel}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isWarmTheme ? 'text-[#475569] text-[11px]' : 'text-slate-400 text-[11px]'}>Spacebar Hits:</span>
                          <span className={`font-mono font-bold text-xs ${isWarmTheme ? 'text-[#1e293b]' : 'text-slate-200'}`}>{spacebarHits} presses</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Footer & Official Stamp / Mohar Section */}
            <div className={`pt-2 flex items-end justify-between gap-4 border-t ${isWarmTheme ? 'border-[#0F52BA]/25' : 'border-slate-800/80'}`}>
              {/* Left: Metadata & Unique Verification Hash */}
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <Calendar className={`w-3 h-3 ${isWarmTheme ? 'text-[#d97706]' : 'text-amber-400'}`} />
                  <span className={isWarmTheme ? 'text-[#475569]' : 'text-slate-400'}>Date Issued: <strong className={isWarmTheme ? 'text-[#1e293b]' : 'text-slate-200'}>{formattedDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <QrCode className={`w-3 h-3 ${isWarmTheme ? 'text-[#0F52BA]' : 'text-cyan-400'}`} />
                  <span className={isWarmTheme ? 'text-[#475569]' : 'text-slate-400'}>Verification ID: <strong className={isWarmTheme ? 'text-[#0F52BA]' : 'text-cyan-300'}>{certCode}</strong></span>
                </div>
                <p className={`text-[9px] font-sans ${isWarmTheme ? 'text-[#64748b]' : 'text-slate-500'}`}>
                  Digitally validated & permanently indexed in SmartTyping Pro Global Ledger
                </p>
              </div>

              {/* Center: Official Signature Line */}
              <div className="text-center px-4 space-y-1 pb-1 hidden sm:block">
                <div className={`font-serif italic text-base sm:text-lg font-bold tracking-widest select-none ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-300'}`}>
                  SmartTyping Auth.
                </div>
                <div className={`w-36 h-px mx-auto ${isWarmTheme ? 'bg-[#0F52BA]/30' : 'bg-slate-700'}`} />
                <span className={`text-[9px] uppercase tracking-widest font-mono block ${isWarmTheme ? 'text-[#64748b]' : 'text-slate-400'}`}>
                  Authorized Verification Authority
                </span>
              </div>

              {/* Right: Official Circular Stamp (Mohar Seal) */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 160 160" 
                    className="w-full h-full animate-spin-slow duration-[30000ms]"
                  >
                    {/* Outer Scalloped Border */}
                    <circle cx="80" cy="80" r="76" fill={isWarmTheme ? "#FAF7F2" : "#091428"} stroke={isWarmTheme ? "#0F52BA" : "#d97706"} strokeWidth="2.5" strokeDasharray="4 2" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke={isWarmTheme ? "#d97706" : "#f59e0b"} strokeWidth="1.5" />
                    
                    {/* Circular Text Path */}
                    <path
                      id="stamp-circle-path"
                      d="M 80, 80 m -56, 0 a 56,56 0 1,1 112,0 a 56,56 0 1,1 -112,0"
                      fill="none"
                    />
                    <text className={`text-[9px] font-bold font-mono uppercase tracking-[0.18em] ${isWarmTheme ? 'fill-[#0F52BA]' : 'fill-amber-400'}`}>
                      <textPath href="#stamp-circle-path" startOffset="0%">
                        SMARTTYPING PRO • OFFICIAL CERTIFICATION • VERIFIED •
                      </textPath>
                    </text>
                    
                    {/* Inner Seal Circle */}
                    <circle cx="80" cy="80" r="42" fill={isWarmTheme ? "#FAF7F2" : "#0f1f38"} stroke={isWarmTheme ? "#0F52BA" : "#f59e0b"} strokeWidth="1.5" />
                  </svg>

                  {/* Central Emblem Icon inside Seal */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <ShieldCheck className={`w-5 h-5 drop-shadow-md ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-400'}`} />
                    <span className={`text-[8px] font-mono font-black uppercase tracking-wider ${isWarmTheme ? 'text-[#0F52BA]' : 'text-amber-300'}`}>
                      APPROVED
                    </span>
                    <span className={`text-[7px] font-mono ${isWarmTheme ? 'text-[#d97706]' : 'text-cyan-300'}`}>
                      2026
                    </span>
                  </div>
                </div>

                <span className={`text-[8px] font-mono uppercase tracking-wider mt-0.5 text-center ${isWarmTheme ? 'text-[#64748b]' : 'text-slate-400'}`}>
                  Authorized by SmartTyping Pro Engine
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
