import React, { useEffect, useState } from 'react';
import { PageRoute, TypingResult, Lesson } from '../../types';
import { useTypingStats } from '../../context/TypingStatsContext';
import { useAuth } from '../../context/AuthContext';
import { formatDuration } from '../../utils/typingCalculations';
import { LESSONS_DATA } from '../../data/lessons';
import { OfficialTypingCertificate, getTierConfig } from '../../components/certificate/OfficialTypingCertificate';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Home, 
  Share2, 
  Check, 
  Sparkles, 
  Flame, 
  Target, 
  Zap, 
  Clock, 
  AlertCircle,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  TrendingUp
} from 'lucide-react';

interface ResultsPageProps {
  result?: TypingResult | null;
  onNavigate: (page: PageRoute, lesson?: Lesson) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, onNavigate }) => {
  const { stats, lastResult } = useTypingStats();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const activeResult = result || lastResult;

  const defaultCandidateName = activeResult?.candidateName || (user?.displayName && user.displayName !== 'Guest'
    ? user.displayName 
    : (user?.email ? user.email.split('@')[0] : 'Typing Candidate'));

  const [candidateName, setCandidateName] = useState<string>(defaultCandidateName);

  // Sync candidate name if user logs in or updates
  useEffect(() => {
    if (activeResult?.candidateName) {
      setCandidateName(activeResult.candidateName);
    } else if (user?.displayName && user.displayName !== 'Guest') {
      setCandidateName(user.displayName);
    }
  }, [activeResult?.candidateName, user?.displayName]);

  // Qualification Check: Typing Test mode with Net WPM >= 30 and Accuracy >= 95%
  const isTypingTestMode = activeResult ? (activeResult.mode.startsWith('timed_') || activeResult.mode === 'paragraph' || activeResult.mode === 'custom') : false;
  const meetsSpeed = activeResult ? activeResult.netWpm >= 30 : false;
  const meetsAccuracy = activeResult ? activeResult.accuracy >= 95 : false;
  const isQualifiedForCertificate = isTypingTestMode && meetsSpeed && meetsAccuracy;

  const tier = activeResult?.certificateTier || (activeResult && activeResult.netWpm >= 70 && activeResult.accuracy >= 98 ? 'platinum' : activeResult && activeResult.netWpm >= 50 && activeResult.accuracy >= 97 ? 'gold' : 'silver');
  const tierConfig = getTierConfig(tier);

  useEffect(() => {
    if (activeResult) {
      if (isQualifiedForCertificate || activeResult.netWpm >= 50 || activeResult.accuracy >= 98) {
        try {
          confetti({
            particleCount: isQualifiedForCertificate ? 100 : 60,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#e0e7ff'],
          });
        } catch {
          // ignore
        }
      }
    }
  }, [activeResult, isQualifiedForCertificate]);

  if (!activeResult) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">No Recent Test Results</h2>
        <p className="text-xs text-slate-400">Complete a typing session or speed test to see your metrics.</p>
        <button
          onClick={() => onNavigate('typing-test')}
          className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Start a Test
        </button>
      </div>
    );
  }

  const isPersonalBest = activeResult.netWpm >= (stats.bestNetWpm || 0);

  const handleCopySummary = () => {
    const certText = isQualifiedForCertificate 
      ? `\n🏅 Official Certification: ${tierConfig.badgeLabel} (${activeResult.certificateCode || 'ST-CERT-VERIFIED'})`
      : '';
    const text = `🏆 SmartTypingPro Score:\n⚡ Net Speed: ${activeResult.netWpm} WPM (Gross: ${activeResult.grossWpm} WPM)\n🎯 Accuracy: ${activeResult.accuracy}%\n⏱️ Time: ${formatDuration(activeResult.durationSeconds)}\n✨ XP: +${activeResult.xpEarned}${certText}\nPractice free at SmartTypingPro!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const associatedLesson = activeResult.lessonId 
    ? LESSONS_DATA.find(l => l.id === activeResult.lessonId) 
    : undefined;

  const nextLesson = associatedLesson 
    ? LESSONS_DATA.find(l => l.order === associatedLesson.order + 1)
    : undefined;

  const handleNext = () => {
    if (nextLesson) {
      onNavigate('lesson-view', nextLesson);
    } else if (activeResult?.mode === 'lesson' && associatedLesson) {
      onNavigate('lesson-view', associatedLesson);
    } else {
      onNavigate('typing-test');
    }
  };

  return (
    <div id="test-results-view" className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isPersonalBest && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Personal Best Recorded!</span>
            </div>
          )}

          {isQualifiedForCertificate && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Certificate Awarded</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          {isQualifiedForCertificate ? 'Speed Test Completed & Certified!' : 'Test Completed'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {activeResult.lessonTitle ? `Lesson: ${activeResult.lessonTitle}` : `Mode: ${activeResult.mode.replace('_', ' ').toUpperCase()}`} • {new Date(activeResult.completedAt).toLocaleTimeString()}
        </p>
      </div>

      {/* Primary 3-Hero Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net WPM Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl shadow-emerald-500/5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-xs uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> Net Speed
          </span>
          <div className="flex items-baseline justify-center gap-1.5 py-2">
            <span className="text-5xl font-mono font-extrabold text-emerald-400">{activeResult.netWpm}</span>
            <span className="text-sm font-mono text-slate-400">WPM</span>
          </div>
          <p className="text-[11px] text-slate-400">Gross Speed: <strong>{activeResult.grossWpm} WPM</strong></p>
        </div>

        {/* Accuracy Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-xl shadow-cyan-500/5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-xs uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> Accuracy
          </span>
          <div className="flex items-baseline justify-center gap-1 py-2">
            <span className="text-5xl font-mono font-extrabold text-cyan-400">{activeResult.accuracy}</span>
            <span className="text-sm font-mono text-slate-400">%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {activeResult.correctCharacters} / {activeResult.totalCharactersTyped} keystrokes
          </p>
        </div>

        {/* XP Earned Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl shadow-amber-500/5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-xs uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" /> XP Gained
          </span>
          <div className="flex items-baseline justify-center gap-1 py-2">
            <span className="text-5xl font-mono font-extrabold text-amber-400">+{activeResult.xpEarned}</span>
            <span className="text-sm font-mono text-slate-400">XP</span>
          </div>
          <p className="text-[11px] text-slate-400">Duration: {formatDuration(activeResult.durationSeconds)}</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MASTER FEATURE: VERIFIED OFFICIAL CERTIFICATE (When Qualified) */}
      {/* ========================================================================= */}
      {isQualifiedForCertificate ? (
        <div className="space-y-4 pt-2">
          <OfficialTypingCertificate
            result={activeResult}
            candidateName={candidateName}
            onUpdateCandidateName={(name) => setCandidateName(name)}
            showControls={true}
          />
        </div>
      ) : isTypingTestMode ? (
        /* Certificate Qualification Benchmark Card (When criteria not yet met) */
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Official Typing Certificate Qualification</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold uppercase">
                  Criteria in Progress
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                To earn and download your official, verified SmartTyping Pro certificate with official stamp and credential ID, achieve at least <strong className="text-slate-200">30 Net WPM</strong> with <strong className="text-slate-200">≥ 95% Accuracy</strong> in Typing Test Mode.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Speed Status */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Speed Target (≥ 30 WPM)
                </span>
                <span className={`font-mono font-bold text-xs ${meetsSpeed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeResult.netWpm} / 30 WPM {meetsSpeed ? '✓' : `(Needs +${30 - activeResult.netWpm} WPM)`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${meetsSpeed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (activeResult.netWpm / 30) * 100)}%` }}
                />
              </div>
            </div>

            {/* Accuracy Status */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" /> Accuracy Target (≥ 95%)
                </span>
                <span className={`font-mono font-bold text-xs ${meetsAccuracy ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {activeResult.accuracy}% / 95% {meetsAccuracy ? '✓' : `(Needs +${(95 - activeResult.accuracy).toFixed(1)}%)`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${meetsAccuracy ? 'bg-cyan-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (activeResult.accuracy / 95) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/80">
            <span className="text-slate-400 text-[11px]">
              Tiers available: <strong>Silver (30+ WPM)</strong> • <strong>Gold (50+ WPM)</strong> • <strong>Platinum (70+ WPM)</strong>
            </span>
            <button
              onClick={() => onNavigate('typing-test')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Test for Certificate</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Comprehensive Secondary Metrics Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Biomechanical Keystroke Diagnostics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Characters</span>
            <p className="text-lg font-mono font-bold text-slate-100">{activeResult.totalCharactersTyped}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Correct Chars</span>
            <p className="text-lg font-mono font-bold text-emerald-400">{activeResult.correctCharacters}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Corrected Mistakes</span>
            <p className="text-lg font-mono font-bold text-cyan-400">{activeResult.correctedErrors}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Uncorrected Errors</span>
            <p className="text-lg font-mono font-bold text-rose-400">{activeResult.uncorrectedErrors}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Correct Words</span>
            <p className="text-lg font-mono font-bold text-emerald-400">
              {activeResult.correctWordsCount ?? Math.max(0, Math.round(activeResult.correctCharacters / 5))}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Wrong Words</span>
            <p className="text-lg font-mono font-bold text-rose-400">
              {activeResult.incorrectWordsCount ?? Math.max(0, Math.round(activeResult.uncorrectedErrors / 3))}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Spacebar Hits</span>
            <p className="text-lg font-mono font-bold text-slate-200">
              {activeResult.spacebarHits ?? Math.round(activeResult.correctCharacters / 5.2)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Backspaces</span>
            <p className="text-lg font-mono font-bold text-slate-300">{activeResult.backspaceCount}</p>
          </div>
        </div>
      </div>

      {/* Actions and Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="results-retry-btn"
            onClick={() => onNavigate(activeResult.mode === 'lesson' && associatedLesson ? 'lesson-view' : 'typing-test', associatedLesson)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {nextLesson && (
            <button
              id="results-next-lesson-btn"
              onClick={() => onNavigate('lesson-view', nextLesson)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Next Lesson ({nextLesson.order})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            id="results-dashboard-btn"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        <button
          id="results-share-btn"
          onClick={handleCopySummary}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Summary Copied!' : 'Copy Score'}</span>
        </button>
      </div>
    </div>
  );
};
