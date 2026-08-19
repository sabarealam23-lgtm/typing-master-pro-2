import React from 'react';
import { PageRoute } from '../types';
import { 
  Keyboard, 
  Zap, 
  Target, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  BookOpen, 
  CheckCircle2,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div id="home-page-container" className="w-full flex flex-col gap-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Web Typing Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl leading-tight">
          Master Touch Typing with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Precision & Flow
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Unlock effortless typing speed through structured cognitive muscle memory courses, microsecond-accurate WPM timing, and real-time biometric keystroke analytics.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <button
            id="hero-start-test-btn"
            onClick={() => onNavigate('typing-test')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Take a Free Typing Test</span>
          </button>

          <button
            id="hero-explore-courses-btn"
            onClick={() => onNavigate('learn')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-all"
          >
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Structured Lessons</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-12 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xl">
              <Zap className="w-4 h-4" /> 100% Real
            </div>
            <p className="text-xs text-slate-400 mt-1">Authentic keystroke engine with hardware timestamping.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xl">
              <Target className="w-4 h-4" /> 5-Char Standard
            </div>
            <p className="text-xs text-slate-400 mt-1">Official Gross and Net WPM calculation standard.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xl">
              <Flame className="w-4 h-4" /> Daily Streaks
            </div>
            <p className="text-xs text-slate-400 mt-1">Build daily practice habit and earn bonus XP.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xl">
              <Trophy className="w-4 h-4" /> Leaderboards
            </div>
            <p className="text-xs text-slate-400 mt-1">Compete across Daily, Weekly, and All-Time ranks.</p>
          </div>
        </div>
      </section>

      {/* Curriculum Path Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Engineered 3-Tier Touch Typing Path
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Progress step-by-step from home-row foundation to elite speed writing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Beginner Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-100">Beginner: Foundation</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Home row anchoring (F & J keys), individual finger allocations, top & bottom rows, and simple core vocabulary.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Home row finger positions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Individual letter reach</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Short sentence flow</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
            >
              Explore Beginner (9 Lessons)
            </button>
          </div>

          {/* Intermediate Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-100">Intermediate: Rhythm</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Shift keys, capitalization, punctuation marks, the full number row, and common daily symbols.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Shift key synchronization</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Numeric & symbol row mastery</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Punctuation cadence</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
            >
              Explore Intermediate (5 Lessons)
            </button>
          </div>

          {/* Advanced Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-100">Advanced: Speed Mastery</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Extended paragraphs, coding syntax, alphanumeric tokens, and high-cadence endurance drills.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Code brackets & symbols</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Sustained 60+ WPM drills</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Error recovery reflex</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
            >
              Explore Advanced (4 Lessons)
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Quick Practice Preview CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
              Ready to test your typing speed in 60 seconds?
            </h2>
            <p className="text-sm text-slate-400">
              No account required to test. Jump straight into the benchmark engine and receive instant Gross WPM, Net WPM, and error analysis.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate('typing-test')}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
              >
                Start 60-Second Test
              </button>
              <button
                onClick={() => onNavigate('practice')}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
              >
                Custom Practice
              </button>
            </div>
          </div>

          <div className="w-full max-w-sm p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>Sample Engine Stats</span>
              <span className="text-emerald-400 font-mono">Live Demo</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Speed</span>
                <p className="text-2xl font-mono font-bold text-emerald-400">74 <span className="text-xs text-slate-400">WPM</span></p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
                <p className="text-2xl font-mono font-bold text-cyan-400">98.5%</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Backspaces tracked:</span>
              <span className="font-mono text-slate-400">2 corrected</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
