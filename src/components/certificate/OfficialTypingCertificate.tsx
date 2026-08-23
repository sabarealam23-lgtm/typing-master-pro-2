import React, { useState, useRef } from 'react';
import { TypingResult, CertificateTier } from '../../types';
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
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(candidateName);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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
        backgroundColor: '#0a0f1d'
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
        backgroundColor: '#0a0f1d'
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Verified Official Certificate</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                  Approved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Issued for candidate <strong className="text-slate-200">{candidateName}</strong> • {tierInfo.badgeLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="cert-edit-name-btn"
              onClick={() => setIsEditingName(!isEditingName)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditingName ? 'Close Name Edit' : 'Edit Candidate Name'}</span>
            </button>

            <button
              id="cert-download-png-btn"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              id="cert-download-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/10 transition-all disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              id="cert-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              id="cert-share-btn"
              onClick={handleCopyVerification}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Copy Verification Summary"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Inline Candidate Name Editor */}
      {isEditingName && (
        <form 
          onSubmit={handleSaveName}
          className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-xs font-semibold text-slate-300 shrink-0">
              Enter Your Full Name for Official Certificate:
            </label>
            <input
              type="text"
              id="cert-candidate-name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g., Alexander Hamilton"
              className="flex-1 w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-colors"
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
          className="relative w-full min-w-[820px] max-w-4xl mx-auto aspect-[1.414/1] bg-gradient-to-b from-slate-950 via-[#0a1022] to-slate-950 text-slate-100 rounded-2xl p-8 sm:p-10 shadow-2xl border-4 border-amber-500/40 select-none overflow-hidden font-sans"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(245, 158, 11, 0.05)'
          }}
        >
          {/* Ornate Background Security Guilloche & Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Subtle Luxury Gradient Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Double Decorative Border Frame with Corner Flourishes */}
          <div className="absolute inset-3.5 sm:inset-4.5 border border-amber-500/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-5 sm:inset-6 border border-slate-700/60 rounded-lg pointer-events-none" />

          {/* Corner Flourish Emblems */}
          <div className="absolute top-7 left-7 text-amber-400/50 font-mono text-xs select-none">❖</div>
          <div className="absolute top-7 right-7 text-amber-400/50 font-mono text-xs select-none">❖</div>
          <div className="absolute bottom-7 left-7 text-amber-400/50 font-mono text-xs select-none">❖</div>
          <div className="absolute bottom-7 right-7 text-amber-400/50 font-mono text-xs select-none">❖</div>

          {/* Inner Certificate Content Layout */}
          <div className="relative z-10 h-full flex flex-col justify-between px-4 sm:px-6 py-2">
            
            {/* 1. Header Section */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-400 font-mono">
                  SmartTyping Pro Verified Credentials
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 uppercase font-serif">
                Certificate of Typing Achievement
              </h1>
              
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl mx-auto italic font-serif">
                This official credential is awarded in recognition of outstanding speed, biomechanical rhythm, and verified touch-typing precision.
              </p>
            </div>

            {/* 2. Candidate Presentation Section */}
            <div className="text-center my-auto py-2 space-y-1.5">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                THIS IS PROUDLY PRESENTED TO
              </span>
              
              <div className="relative inline-block px-8 py-1 max-w-full">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 tracking-wide font-serif capitalize">
                  {candidateName}
                </h2>
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500/70 to-transparent mt-1" />
              </div>

              {/* Tier Badge Pill */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r ${tierInfo.themeColor} text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{tierInfo.badgeLabel}</span>
                  <div className="flex gap-0.5 ml-1">
                    {Array.from({ length: tierInfo.starCount }).map((_, i) => (
                      <span key={i} className="text-slate-950 text-[10px]">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Comprehensive Performance Matrix (3x3 Grid) */}
            <div className="my-auto py-2">
              <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-inner backdrop-blur-xs">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider font-mono text-slate-400">
                      <th className="py-1 px-2 border-r border-slate-800">Speed Diagnostics</th>
                      <th className="py-1 px-2 border-r border-slate-800">Time & Pace Efficiency</th>
                      <th className="py-1 px-2">Biomechanical Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {/* Row 1: Core Metrics */}
                    <tr className="bg-slate-900/40">
                      <td className="py-2 px-3 border-r border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Net Speed:</span>
                          <span className="font-mono font-extrabold text-emerald-400 text-sm">{netWpm} WPM</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Allotted Time:</span>
                          <span className="font-mono font-bold text-slate-200 text-xs">{allottedLabel}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Correct Words:</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs">{correctWords} words</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2: Accuracy & Timing */}
                    <tr className="bg-slate-950/40">
                      <td className="py-2 px-3 border-r border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Accuracy:</span>
                          <span className="font-mono font-extrabold text-cyan-400 text-sm">{accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Time Taken:</span>
                          <span className="font-mono font-bold text-slate-200 text-xs">{actualTimeFormatted}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Wrong Words:</span>
                          <span className="font-mono font-bold text-rose-400 text-xs">{wrongWords}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 3: Gross & Pace & Spacebar */}
                    <tr className="bg-slate-900/40">
                      <td className="py-2 px-3 border-r border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Gross Speed:</span>
                          <span className="font-mono font-bold text-slate-300 text-xs">{grossWpm} WPM</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Pace / Saved:</span>
                          <span className="font-mono font-bold text-amber-400 text-xs">{paceLabel}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Spacebar Hits:</span>
                          <span className="font-mono font-bold text-slate-200 text-xs">{spacebarHits} presses</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Footer & Official Stamp / Mohar Section */}
            <div className="pt-2 flex items-end justify-between gap-4 border-t border-slate-800/80">
              {/* Left: Metadata & Unique Verification Hash */}
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Date Issued: <strong>{formattedDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <QrCode className="w-3 h-3 text-cyan-400" />
                  <span>Verification ID: <strong className="text-cyan-300">{certCode}</strong></span>
                </div>
                <p className="text-[9px] text-slate-500 font-sans">
                  Digitally validated & permanently indexed in SmartTyping Pro Global Ledger
                </p>
              </div>

              {/* Center: Official Signature Line */}
              <div className="text-center px-4 space-y-1 pb-1 hidden sm:block">
                <div className="font-serif italic text-base sm:text-lg text-amber-300 font-bold tracking-widest font-cursive select-none">
                  SmartTyping Auth.
                </div>
                <div className="w-36 h-px bg-slate-700 mx-auto" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400 block">
                  Authorized Verification Authority
                </span>
              </div>

              {/* Right: Official Circular Gold/Navy Stamp (Mohar Seal) */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 160 160" 
                    className="w-full h-full animate-spin-slow duration-[30000ms]"
                  >
                    {/* Outer Scalloped / Toothed Gold Border */}
                    <circle cx="80" cy="80" r="76" fill="#091428" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4 2" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    
                    {/* Circular Text Path */}
                    <path
                      id="stamp-circle-path"
                      d="M 80, 80 m -56, 0 a 56,56 0 1,1 112,0 a 56,56 0 1,1 -112,0"
                      fill="none"
                    />
                    <text className="text-[9px] font-bold font-mono uppercase fill-amber-400 tracking-[0.18em]">
                      <textPath href="#stamp-circle-path" startOffset="0%">
                        SMARTTYPING PRO • OFFICIAL CERTIFICATION • VERIFIED •
                      </textPath>
                    </text>
                    
                    {/* Inner Seal Circle */}
                    <circle cx="80" cy="80" r="42" fill="#0f1f38" stroke="#f59e0b" strokeWidth="1.5" />
                  </svg>

                  {/* Central Emblem Icon inside Seal */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <ShieldCheck className="w-5 h-5 text-amber-400 drop-shadow-md" />
                    <span className="text-[8px] font-mono font-black uppercase text-amber-300 tracking-wider">
                      APPROVED
                    </span>
                    <span className="text-[7px] font-mono text-cyan-300">
                      2026
                    </span>
                  </div>
                </div>

                <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 text-center">
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
