import React from 'react';
import { PageRoute, Lesson } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTypingStats } from '../../context/TypingStatsContext';
import { calculateLevelInfo, formatTotalTime } from '../../utils/typingCalculations';
import { LESSONS_DATA } from '../../data/lessons';
import { ProgressCharts } from '../../components/charts/ProgressCharts';
import { 
  Zap, 
  Target, 
  Flame, 
  Clock, 
  BookOpen, 
  Trophy, 
  Award, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageRoute, lesson?: Lesson) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { stats, lessonProgress, unlockedAchievementIds } = useTypingStats();

  const levelInfo = calculateLevelInfo(user.xp || 0);

  // Find next uncompleted lesson to recommend
  const nextLesson = LESSONS_DATA.find(l => !lessonProgress[l.id]?.completed) || LESSONS_DATA[0];

  // Daily goal: e.g. 5 minutes practice or 3 tests
  const todayMinutes = stats.dailyPracticeMinutes.find(d => d.date === new Date().toISOString().split('T')[0])?.minutes || 0;
  const dailyGoalMinutes = 10;
  const dailyGoalPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div id="dashboard-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome & Level Hero Header */}
      <div 
        id="dashboard-welcome-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold tracking-wider">
                {user.isGuest ? 'Guest Session' : 'Typing Member'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Ready for your daily practice? Maintain your rhythm, elevate your Net WPM, and keep your streak alive.
            </p>
          </div>

          {/* Level Progress Capsule */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[260px] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Level Status</span>
              <span className="text-emerald-400 font-mono font-bold">Level {levelInfo.level}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>{levelInfo.currentLevelXp} XP</span>
              <span>{levelInfo.nextLevelXpThreshold} XP for Lv.{levelInfo.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best WPM */}
        <div id="kpi-best-wpm" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Best Net Speed</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Zap className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-emerald-400">{stats.bestNetWpm || 0}</span>
            <span className="text-xs text-slate-400 font-mono">WPM</span>
          </div>
          <p className="text-[11px] text-slate-400">Avg: {stats.averageNetWpm || 0} WPM</p>
        </div>

        {/* Best Accuracy */}
        <div id="kpi-best-accuracy" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Best Accuracy</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><Target className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-cyan-400">{stats.bestAccuracy || 100}%</span>
          </div>
          <p className="text-[11px] text-slate-400">Avg: {stats.averageAccuracy || 100}%</p>
        </div>

        {/* Current Streak */}
        <div id="kpi-streak" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Current Streak</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Flame className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-amber-400">{user.currentStreak || 0}</span>
            <span className="text-xs text-slate-400 font-mono">Days</span>
          </div>
          <p className="text-[11px] text-slate-400">Longest: {user.longestStreak || 0} Days</p>
        </div>

        {/* Total Tests & Practice Time */}
        <div id="kpi-practice-time" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Practice Volume</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-indigo-400">{stats.totalTestsCompleted}</span>
            <span className="text-xs text-slate-400 font-mono">Tests</span>
          </div>
          <p className="text-[11px] text-slate-400">Time: {formatTotalTime(stats.totalPracticeTimeSeconds)}</p>
        </div>
      </div>

      {/* Action / Quick Start & Daily Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Lesson Recommendation Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Continue Curriculum
              </span>
              <span className="text-xs text-slate-400 capitalize">{nextLesson.level} Tier</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">{nextLesson.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{nextLesson.description}</p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-1">
              <span>Goal: <strong>{nextLesson.requiredWpm} WPM</strong></span>
              <span>•</span>
              <span>Min Accuracy: <strong>{nextLesson.requiredAccuracy}%</strong></span>
              <span>•</span>
              <span className="text-emerald-400">+{nextLesson.xpReward} XP</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="dashboard-start-lesson-btn"
              onClick={() => onNavigate('lesson-view', nextLesson)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start This Lesson</span>
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              View All 18 Lessons
            </button>
            <button
              onClick={() => onNavigate('typing-test')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              Quick Timed Test
            </button>
          </div>
        </div>

        {/* Daily Goal & Achievements Teaser */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Target</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{todayMinutes} / {dailyGoalMinutes} min</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Achievements
              </span>
              <span className="text-slate-400 font-mono">{unlockedAchievementIds.length} unlocked</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unlock badges for speed thresholds, streaks, and error-free execution.
            </p>
            <button
              onClick={() => onNavigate('achievements')}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              View Badge Showcase
            </button>
          </div>
        </div>
      </div>

      {/* Progress Charts Component */}
      <ProgressCharts stats={stats} />

      {/* Recent Tests Table */}
      <div id="dashboard-recent-results" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Test History</h3>
            <p className="text-xs text-slate-400">Your latest official keystroke records</p>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentResults.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-3">
            <p>No typing tests completed yet.</p>
            <button
              onClick={() => onNavigate('typing-test')}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg"
            >
              Take Your First Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Mode / Title</th>
                  <th className="pb-3">Net WPM</th>
                  <th className="pb-3">Gross WPM</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3">Errors</th>
                  <th className="pb-3">XP</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {stats.recentResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-200">
                      {r.lessonTitle || r.mode.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="py-3 font-bold text-emerald-400">{r.netWpm}</td>
                    <td className="py-3 text-slate-400">{r.grossWpm}</td>
                    <td className="py-3 text-cyan-400">{r.accuracy}%</td>
                    <td className="py-3 text-slate-400">
                      {r.uncorrectedErrors > 0 ? (
                        <span className="text-rose-400">{r.uncorrectedErrors} err</span>
                      ) : (
                        <span className="text-emerald-400">0</span>
                      )}
                    </td>
                    <td className="py-3 text-amber-400">+{r.xpEarned}</td>
                    <td className="py-3 text-right text-slate-400 font-sans text-[11px]">
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
