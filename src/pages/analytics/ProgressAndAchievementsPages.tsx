import React, { useState } from 'react';
import { PageRoute, AggregateStats } from '../../types';
import { useTypingStats } from '../../context/TypingStatsContext';
import { ACHIEVEMENTS_DATA } from '../../data/achievements';
import { ProgressCharts } from '../../components/charts/ProgressCharts';
import { formatTotalTime } from '../../utils/typingCalculations';
import { 
  BarChart3, 
  Award, 
  Zap, 
  Target, 
  Clock, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';

interface AnalyticsProps {
  onNavigate: (page: PageRoute) => void;
}

// ==================== PROGRESS ANALYTICS PAGE ====================
export const ProgressPage: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const { stats } = useTypingStats();
  const [filterMode, setFilterMode] = useState<'all' | 'timed' | 'lesson'>('all');

  const filteredHistory = stats.recentResults.filter(r => {
    if (filterMode === 'timed') return r.mode.startsWith('timed_');
    if (filterMode === 'lesson') return r.mode === 'lesson';
    return true;
  });

  return (
    <div id="detailed-progress-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase">
          <BarChart3 className="w-3.5 h-3.5" /> Performance Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Typing Progress & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Track historical WPM trajectories, accuracy stabilization curves, keystroke counts, and daily practice endurance.
        </p>
      </div>

      {/* Aggregate KPI Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peak Net Speed</span>
          <p className="text-2xl font-mono font-bold text-[#1e3a8a] dark:text-emerald-400">{stats.bestNetWpm} <span className="text-xs text-slate-500 dark:text-slate-400">WPM</span></p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Gross: {stats.bestGrossWpm} WPM</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Speed</span>
          <p className="text-2xl font-mono font-bold text-[#1e3a8a] dark:text-emerald-400">{stats.averageNetWpm} <span className="text-xs text-slate-500 dark:text-slate-400">WPM</span></p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Lifetime Average</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Accuracy</span>
          <p className="text-2xl font-mono font-bold text-blue-700 dark:text-cyan-400">{stats.averageAccuracy}%</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Best: {stats.bestAccuracy}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Keystrokes Typed</span>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-indigo-400">{stats.totalCharactersTyped.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Time: {formatTotalTime(stats.totalPracticeTimeSeconds)}</span>
        </div>
      </div>

      {/* Progress Charts */}
      <ProgressCharts stats={stats} />

      {/* Full Test History Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Historical Test Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete log of verified sessions</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto text-xs">
            {(['all', 'timed', 'lesson'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  filterMode === m ? 'bg-[#1e3a8a] text-white font-bold shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
            No test records matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Session</th>
                  <th className="py-3 px-3">Net WPM</th>
                  <th className="py-3 px-3">Gross WPM</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Corrected</th>
                  <th className="py-3 px-3">Uncorrected</th>
                  <th className="py-3 px-3">Elapsed</th>
                  <th className="py-3 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                {filteredHistory.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-slate-200">
                      {r.lessonTitle || r.mode.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#1e3a8a] dark:text-emerald-400">{r.netWpm}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{r.grossWpm}</td>
                    <td className="py-3 px-3 text-blue-700 dark:text-cyan-400 font-bold">{r.accuracy}%</td>
                    <td className="py-3 px-3 text-cyan-600 dark:text-cyan-300">{r.correctedErrors}</td>
                    <td className="py-3 px-3">
                      {r.uncorrectedErrors > 0 ? (
                        <span className="text-rose-500 dark:text-rose-400 font-bold">{r.uncorrectedErrors}</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{(r.elapsedMs / 1000).toFixed(1)}s</td>
                    <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                      {new Date(r.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== ACHIEVEMENTS PAGE ====================
export const AchievementsPage: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const { stats, unlockedAchievementIds } = useTypingStats();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const unlockedSet = new Set(unlockedAchievementIds);

  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS_DATA
    : ACHIEVEMENTS_DATA.filter(a => a.category === selectedCategory);

  const unlockedCount = ACHIEVEMENTS_DATA.filter(a => unlockedSet.has(a.id)).length;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const percentComplete = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div id="achievements-showcase-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Overall Unlock Progress Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-500 font-bold uppercase">
            <Award className="w-3.5 h-3.5" /> Mastery Milestones
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Badges & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Earn exclusive badges, rank up, and claim XP rewards by surpassing typing velocity, consistency, and endurance goals.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-w-[240px] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Badges Unlocked</span>
            <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">{unlockedCount} / {totalCount} ({percentComplete}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1e3a8a] transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {['all', 'speed', 'accuracy', 'volume', 'streak', 'lesson'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1e3a8a] text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800 shadow-xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid (Clean cards: bg-white border border-slate-200 shadow-sm text-slate-800) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((ach) => {
          const isUnlocked = unlockedSet.has(ach.id);

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                isUnlocked
                  ? 'bg-white border-slate-200 hover:border-blue-300 shadow-sm text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200'
                  : 'bg-slate-50/70 border-slate-200 opacity-80 text-slate-700 dark:bg-slate-950/60 dark:border-slate-800/80 dark:text-slate-400'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-bold shadow-sm ${
                  isUnlocked
                    ? 'bg-[#1e3a8a] text-white'
                    : 'bg-slate-200 border border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ach.title}</h3>
                  <span className="text-[10px] font-mono font-bold text-[#1e3a8a] dark:text-amber-400 bg-blue-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-amber-500/20">
                    +{ach.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ach.description}</p>
                <div className="pt-2 text-[10px] font-mono">
                  {isUnlocked ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-500">Locked Milestone</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
