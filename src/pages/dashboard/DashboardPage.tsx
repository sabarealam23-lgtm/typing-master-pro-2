import React, { useState, useEffect, useCallback } from 'react';
import { PageRoute, Lesson } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTypingStats } from '../../context/TypingStatsContext';
import { calculateLevelInfo, formatTotalTime } from '../../utils/typingCalculations';
import { LESSONS_DATA } from '../../data/lessons';
import { ProgressCharts } from '../../components/charts/ProgressCharts';
import { 
  getUserHistoryFromFirestore, 
  FirestoreTypingScore 
} from '../../services/firebase';
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
  RotateCcw,
  Loader2
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageRoute, lesson?: Lesson) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { stats, lessonProgress, unlockedAchievementIds } = useTypingStats();
  const [cloudScores, setCloudScores] = useState<FirestoreTypingScore[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const levelInfo = calculateLevelInfo(user.xp || 0);

  // Fetch logged-in user's past typing attempts from Firestore typing_scores
  const loadUserCloudHistory = useCallback(async () => {
    if (!user.uid || user.isGuest) return;
    setIsLoadingHistory(true);
    try {
      const scores = await getUserHistoryFromFirestore(user.uid, 50);
      setCloudScores(scores);
    } catch (err) {
      console.warn('Could not fetch cloud scores for dashboard:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user.uid, user.isGuest]);

  useEffect(() => {
    loadUserCloudHistory();
  }, [loadUserCloudHistory]);

  // Derived KPI Metrics (combining Firestore cloud data & local stats)
  const cloudBestWpm = cloudScores.length > 0
    ? Math.max(...cloudScores.map(s => s.wpm || 0))
    : 0;
  const bestWpm = Math.max(cloudBestWpm, stats.bestNetWpm || 0);

  const cloudAvgAccuracy = cloudScores.length > 0
    ? Math.round((cloudScores.reduce((acc, s) => acc + (s.accuracy || 0), 0) / cloudScores.length) * 10) / 10
    : null;
  const averageAccuracy = cloudAvgAccuracy !== null ? cloudAvgAccuracy : (stats.averageAccuracy || 100);

  const totalTestsTaken = cloudScores.length > 0 
    ? Math.max(cloudScores.length, stats.totalTestsCompleted)
    : stats.totalTestsCompleted;

  // Recent test attempts list for display
  const displayRecentTests = cloudScores.length > 0
    ? cloudScores.slice(0, 10).map((score, index) => ({
        id: score.id || `cloud_${index}`,
        title: score.mode ? score.mode.replace('_', ' ').toUpperCase() : 'TIMED TEST',
        netWpm: score.wpm,
        grossWpm: score.rawWpm || score.wpm,
        accuracy: score.accuracy,
        duration: score.timeTaken ? `${score.timeTaken}s` : '60s',
        date: score.completedAtIso 
          ? new Date(score.completedAtIso).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          : 'Recent',
      }))
    : stats.recentResults.slice(0, 10).map((r) => ({
        id: r.id,
        title: r.lessonTitle || r.mode.replace('_', ' ').toUpperCase(),
        netWpm: r.netWpm,
        grossWpm: r.grossWpm,
        accuracy: r.accuracy,
        duration: `${(r.elapsedMs / 1000).toFixed(0)}s`,
        date: new Date(r.completedAt).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      }));

  // Find next uncompleted lesson to recommend
  const nextLesson = LESSONS_DATA.find(l => !lessonProgress[l.id]?.completed) || LESSONS_DATA[0];

  // Daily goal
  const todayMinutes = stats.dailyPracticeMinutes.find(d => d.date === new Date().toISOString().split('T')[0])?.minutes || 0;
  const dailyGoalMinutes = 10;
  const dailyGoalPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div id="dashboard-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome & Level Hero Header */}
      <div 
        id="dashboard-welcome-banner"
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold tracking-wider">
                {user.isGuest ? 'Guest Session' : 'Typing Member'}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              {cloudScores.length > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-[11px] font-mono text-[#1e3a8a] dark:text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Cloud Synced
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Ready for your daily practice? Maintain your rhythm, elevate your Net WPM, and keep your streak alive.
            </p>
          </div>

          {/* Level Progress Capsule */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 min-w-[260px] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Level Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Level {levelInfo.level}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-[#1e3a8a] dark:to-cyan-400 transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>{levelInfo.currentLevelXp} XP</span>
              <span>{levelInfo.nextLevelXpThreshold} XP for Lv.{levelInfo.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best WPM */}
        <div id="kpi-best-wpm" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Best WPM</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Zap className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{bestWpm}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">WPM</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Peak net speed recorded</p>
        </div>

        {/* Average Accuracy */}
        <div id="kpi-best-accuracy" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Average Accuracy</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-[#1e3a8a] dark:text-cyan-400"><Target className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-[#1e3a8a] dark:text-cyan-400">{averageAccuracy}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Precision consistency</p>
        </div>

        {/* Total Tests Taken */}
        <div id="kpi-practice-time" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Tests Taken</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{totalTestsTaken}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Tests</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Time: {formatTotalTime(stats.totalPracticeTimeSeconds)}</p>
        </div>

        {/* Current Streak */}
        <div id="kpi-streak" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Current Streak</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"><Flame className="w-4 h-4" /></div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-extrabold text-amber-600 dark:text-amber-400">{user.currentStreak || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Longest: {user.longestStreak || 0} Days</p>
        </div>
      </div>

      {/* Action / Quick Start & Daily Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Lesson Recommendation Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Continue Curriculum
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{nextLesson.level} Tier</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{nextLesson.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{nextLesson.description}</p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-700 dark:text-slate-300 pt-1">
              <span>Goal: <strong>{nextLesson.requiredWpm} WPM</strong></span>
              <span>•</span>
              <span>Min Accuracy: <strong>{nextLesson.requiredAccuracy}%</strong></span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{nextLesson.xpReward} XP</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="dashboard-start-lesson-btn"
              onClick={() => onNavigate('lesson-view', nextLesson)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start This Lesson</span>
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              View All 18 Lessons
            </button>
            <button
              onClick={() => onNavigate('typing-test')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Quick Timed Test
            </button>
          </div>
        </div>

        {/* Daily Goal & Achievements Teaser */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">Daily Target</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{todayMinutes} / {dailyGoalMinutes} min</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Achievements
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">{unlockedAchievementIds.length} unlocked</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Unlock badges for speed thresholds, streaks, and error-free execution.
            </p>
            <button
              onClick={() => onNavigate('achievements')}
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              View Badge Showcase
            </button>
          </div>
        </div>
      </div>

      {/* Progress Charts Component */}
      <ProgressCharts stats={stats} />

      {/* Recent Tests Table (User History from Firestore & Local) */}
      <div id="dashboard-recent-results" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Test History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your latest official keystroke records</p>
            </div>
            {isLoadingHistory && (
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadUserCloudHistory}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-mono cursor-pointer"
              title="Sync Cloud Scores"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sync</span>
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs text-[#1e3a8a] dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {displayRecentTests.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-3">
            <p>No typing tests completed yet.</p>
            <button
              onClick={() => onNavigate('typing-test')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Take Your First Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Session / Mode</th>
                  <th className="pb-3">Net WPM</th>
                  <th className="pb-3">Gross WPM</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                {displayRecentTests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                      {r.title}
                    </td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">{r.netWpm}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{r.grossWpm}</td>
                    <td className="py-3 text-[#1e3a8a] dark:text-cyan-400 font-bold">{r.accuracy}%</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{r.duration}</td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                      {r.date}
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
