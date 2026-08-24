import React, { useState, useEffect, useCallback } from 'react';
import { PageRoute, LeaderboardEntry, UserProfile, CursorStyle, SoundType, FontSize, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTypingStats } from '../../context/TypingStatsContext';
import { getLeaderboard, saveUserProfile, loadUserProfile, resetAllDataToFactoryDefaults } from '../../utils/storage';
import { calculateLevelInfo, formatTotalTime } from '../../utils/typingCalculations';
import { soundSynthesizer, SOUND_OPTIONS } from '../../utils/audio';
import { 
  getGlobalLeaderboardFromFirestore, 
  FirestoreTypingScore, 
  isFirebaseConfigured 
} from '../../services/firebase';
import { 
  Trophy, 
  User, 
  Settings as SettingsIcon, 
  Crown, 
  Flame, 
  Zap, 
  Target, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Trash2, 
  Download, 
  Save, 
  Check, 
  Moon, 
  Sun, 
  Sparkles,
  Award,
  RotateCcw,
  Loader2,
  Calendar,
  Clock,
  Palette,
  AlertTriangle,
  X
} from 'lucide-react';

interface UserPageProps {
  onNavigate: (page: PageRoute) => void;
}

// ==================== LEADERBOARD PAGE ====================
export const LeaderboardPage: React.FC<UserPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [firestoreScores, setFirestoreScores] = useState<FirestoreTypingScore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadLeaderboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const liveScores = await getGlobalLeaderboardFromFirestore(20);
      setFirestoreScores(liveScores);
    } catch (err) {
      console.warn('Could not load Firestore leaderboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  // If no Firestore scores yet (e.g. fresh database), fallback to local leaderboard demo entries
  const localEntries = getLeaderboard('all_time', 'netWpm');

  const displayRows = firestoreScores.length > 0
    ? firestoreScores.map((score, index) => ({
        id: score.id || `fs_${index}`,
        rank: index + 1,
        userId: score.userId,
        userName: score.userName || score.userEmail?.split('@')[0] || 'Anonymous Typist',
        userEmail: score.userEmail || '',
        wpm: score.wpm,
        rawWpm: score.rawWpm || score.wpm,
        accuracy: score.accuracy,
        timeTaken: score.timeTaken || 60,
        date: score.completedAtIso 
          ? new Date(score.completedAtIso).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
          : 'Recent',
        isCurrentUser: score.userId === user.uid || (user.email && score.userEmail === user.email),
      }))
    : localEntries.map((entry) => ({
        id: entry.id,
        rank: entry.rank,
        userId: entry.userId,
        userName: entry.displayName,
        userEmail: '',
        wpm: entry.netWpm,
        rawWpm: entry.netWpm,
        accuracy: entry.accuracy,
        timeTaken: 60,
        date: new Date(entry.timestamp).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        isCurrentUser: entry.userId === user.uid || entry.displayName.includes('(You)'),
      }));

  return (
    <div id="leaderboard-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase mb-1">
            <Trophy className="w-3.5 h-3.5" /> Competitive Rankings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Global Typist Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Top scores synced in real time to the cloud from all certified typing sessions.
          </p>
        </div>

        {/* Refresh button & Live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-400">
              {firestoreScores.length > 0 ? 'Live Cloud Sync' : 'Local / Ready'}
            </span>
          </div>

          <button
            id="leaderboard-refresh-btn"
            onClick={loadLeaderboardData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-60"
            title="Refresh Leaderboard"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Fetching global scores from Firestore...</p>
          </div>
        ) : displayRows.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-3">
            <p>No leaderboard scores recorded yet. Be the first to claim #1!</p>
            <button
              onClick={() => onNavigate('typing-test')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              Take a Typing Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">WPM</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {displayRows.map((entry) => {
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 font-semibold'
                          : 'hover:bg-slate-850'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {isTop1 ? (
                          <div className="flex items-center justify-center">
                            <Crown className="w-5 h-5 text-amber-400" />
                          </div>
                        ) : isTop2 ? (
                          <div className="flex items-center justify-center">
                            <Crown className="w-5 h-5 text-slate-300" />
                          </div>
                        ) : isTop3 ? (
                          <div className="flex items-center justify-center">
                            <Crown className="w-5 h-5 text-amber-600" />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">#{entry.rank}</span>
                        )}
                      </td>

                      {/* User Name */}
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {entry.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={entry.isCurrentUser ? 'text-emerald-400 font-bold' : ''}>
                              {entry.userName}
                            </span>
                            {entry.isCurrentUser && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WPM */}
                      <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                        {entry.wpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 font-bold text-cyan-400">
                        {entry.accuracy}%
                      </td>

                      {/* Duration / Time Taken */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {entry.timeTaken}s
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-slate-400 font-sans text-xs">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PROFILE PAGE ====================
export const ProfilePage: React.FC<UserPageProps> = ({ onNavigate }) => {
  const { user, updateUserProfileState, isAuthenticated } = useAuth();
  const { stats, unlockedAchievementIds } = useTypingStats();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [savedMessage, setSavedMessage] = useState(false);

  const levelInfo = calculateLevelInfo(user.xp || 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfileState({ displayName, bio });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      stats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing_master_pro_backup_${Date.now()}.json`;
    a.click();
  };

  return (
    <div id="user-profile-page" className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-cyan-500 text-slate-950 flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-emerald-500/20">
          {user.displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-100">{user.displayName}</h1>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              Level {levelInfo.level}
            </span>
          </div>
          <p className="text-xs text-slate-400">{user.email}</p>
          <p className="text-xs text-slate-300 italic pt-1 max-w-lg">{user.bio || 'Touch typing enthusiast.'}</p>
        </div>

        <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950 border border-slate-800 min-w-[140px]">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Streak</span>
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xl">
            <Flame className="w-5 h-5 fill-amber-400/30 text-amber-400" />
            <span>{user.currentStreak || 0} Days</span>
          </div>
        </div>
      </div>

      {/* Lifetime Performance Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Best Net Speed</span>
          <p className="text-2xl font-mono font-bold text-emerald-400 pt-1">{stats.bestNetWpm} WPM</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Best Accuracy</span>
          <p className="text-2xl font-mono font-bold text-cyan-400 pt-1">{stats.bestAccuracy}%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Practice</span>
          <p className="text-2xl font-mono font-bold text-slate-200 pt-1">{formatTotalTime(stats.totalPracticeTimeSeconds)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Badges Claimed</span>
          <p className="text-2xl font-mono font-bold text-amber-400 pt-1">{unlockedAchievementIds.length}</p>
        </div>
      </div>

      {/* Official Verified Certification Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              stats.bestNetWpm >= 70 && stats.bestAccuracy >= 98
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                : stats.bestNetWpm >= 50 && stats.bestAccuracy >= 97
                ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                : stats.bestNetWpm >= 30 && stats.bestAccuracy >= 95
                ? 'bg-slate-700/50 border-slate-400 text-slate-200'
                : 'bg-slate-800/40 border-slate-700 text-slate-500'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">SmartTyping Pro Official Certification</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  stats.bestNetWpm >= 70 && stats.bestAccuracy >= 98
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : stats.bestNetWpm >= 50 && stats.bestAccuracy >= 97
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : stats.bestNetWpm >= 30 && stats.bestAccuracy >= 95
                    ? 'bg-slate-700 text-slate-200 border border-slate-600'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {stats.bestNetWpm >= 70 && stats.bestAccuracy >= 98
                    ? 'Platinum Tier Master'
                    : stats.bestNetWpm >= 50 && stats.bestAccuracy >= 97
                    ? 'Gold Tier Advanced'
                    : stats.bestNetWpm >= 30 && stats.bestAccuracy >= 95
                    ? 'Silver Tier Qualified'
                    : 'Benchmark Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official verified certificates with holographic seal, time matrix, and security hash are awarded on speed tests with ≥30 Net WPM & ≥95% Accuracy.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('typing-test')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Take Speed Test</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-base font-bold text-slate-100">Edit Profile Details</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedMessage ? 'Profile Updated!' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Typing Data (JSON)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== SETTINGS PAGE ====================
export const SettingsPage: React.FC<UserPageProps> = ({ onNavigate }) => {
  const { settings, updateSettings, setTheme, setSoundEnabled, setSoundType, setSoundVolume, setShowVirtualKeyboard, setFontSize, setCursorStyle, resetToDefaults } = useSettings();
  const [resetDone, setResetDone] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleTestSound = (type: SoundType) => {
    soundSynthesizer.playKeySound(type, settings.soundVolume, false);
  };

  const handleOpenResetDialog = () => {
    setShowResetModal(true);
  };

  const handleExecuteReset = () => {
    setIsResetting(true);
    resetAllDataToFactoryDefaults();
    resetToDefaults();
    setResetDone(true);
    setShowResetModal(false);
    setIsResetting(false);
    
    // Smoothly refresh/re-initialize application state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div id="user-settings-page" className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase">
          <SettingsIcon className="w-3.5 h-3.5" /> Engine & Audio Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Settings & Customization
        </h1>
        <p className="text-xs text-slate-400">
          Personalize your mechanical sound synthesis, typography scale, visual guides, and test engine behavior.
        </p>
      </div>

      <div className="space-y-6">
        {/* Visual Appearance & Theme */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" /> Appearance & Theme
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Select your preferred visual theme</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {settings.theme.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'ivory-sapphire' as ThemeMode,
                name: '📜 Warm Ivory & Sapphire',
                description: 'Cream canvas, sapphire navy bars & gold amber trims',
                icon: <Palette className="w-4 h-4 text-amber-500" />
              },
              {
                id: 'dark' as ThemeMode,
                name: 'Dark Mode',
                description: 'Deep contrast dark theme',
                icon: <Moon className="w-4 h-4" />
              },
              {
                id: 'light' as ThemeMode,
                name: 'Light Mode',
                description: 'Clean bright day theme',
                icon: <Sun className="w-4 h-4" />
              },
              {
                id: 'system' as ThemeMode,
                name: 'System Default',
                description: 'Syncs with operating system',
                icon: <Sparkles className="w-4 h-4" />
              },
            ].map((thm) => {
              const isSelected = settings.theme === thm.id;
              return (
                <button
                  key={thm.id}
                  id={`theme-option-${thm.id}`}
                  onClick={() => setTheme(thm.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold capitalize transition-all ${
                    isSelected
                      ? 'bg-[#1e3a8a]/10 border-[#1e3a8a] text-[#1e3a8a] dark:bg-slate-800 dark:border-emerald-500 dark:text-emerald-400 shadow-sm ring-1 ring-[#1e3a8a]/40 dark:ring-emerald-500/40'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${
                      isSelected
                        ? 'bg-white border-[#1e3a8a]/40 text-[#1e3a8a] dark:bg-slate-900 dark:border-emerald-500/40 dark:text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      {thm.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-100">{thm.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{thm.description}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#1e3a8a] text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Synthesizer */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Keypress Audio Effects</h2>
              <p className="text-xs text-slate-400">Realistic keypress feedback synthesized in real-time</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!settings.soundEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                settings.soundEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>
          </div>

          {settings.soundEnabled && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOUND_OPTIONS.map((snd) => (
                  <button
                    key={snd.id}
                    id={`sound-option-${snd.id}`}
                    onClick={() => {
                      setSoundType(snd.id);
                      handleTestSound(snd.id);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-between text-center gap-1.5 transition-all min-h-[72px] ${
                      settings.soundType === snd.id
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm ring-1 ring-cyan-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="leading-tight">{snd.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">Preview</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-slate-400 w-24">Volume ({Math.round(settings.soundVolume * 100)}%)</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Typing Canvas Customization */}
        <div id="settings-typing-visuals-panel" className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Typing Area & Visuals</h2>
            <p className="text-xs text-slate-400 mt-0.5">Customize font scaling, caret visual indicator, and guide visibility</p>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Font Size (Typing Arena & Tests)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              {[
                { id: 'sm', label: 'SM', desc: '1.125rem / 18px' },
                { id: 'md', label: 'MD', desc: '1.5rem / 24px (Default)' },
                { id: 'lg', label: 'LG', desc: '1.875rem / 30px' },
                { id: 'xl', label: 'XL', desc: '2.25rem / 36px' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  id={`font-size-opt-${sz.id}`}
                  onClick={() => setFontSize(sz.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.fontSize === sz.id
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-sm">{sz.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sz.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cursor Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Cursor / Caret Style</label>
            <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
              {[
                { id: 'line', label: 'Line', symbol: '│', desc: 'Vertical blinking bar' },
                { id: 'block', label: 'Block', symbol: '█', desc: 'Highlighted character box' },
                { id: 'underline', label: 'Underline', symbol: ' ', desc: 'Bottom baseline bar' },
              ].map((cur) => (
                <button
                  key={cur.id}
                  id={`cursor-style-opt-${cur.id}`}
                  onClick={() => setCursorStyle(cur.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.cursorStyle === cur.id
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 ring-2 ring-cyan-500/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm capitalize">{cur.label}</span>
                    <span className="text-base font-bold text-cyan-400">{cur.symbol}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{cur.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Keyboard Toggle */}
          <div 
            id="toggle-virtual-keyboard-row"
            onClick={() => setShowVirtualKeyboard(!settings.showVirtualKeyboard)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-200 block">On-Screen Visual Keyboard</span>
              <span className="text-[11px] text-slate-400">Show interactive finger guide & keyboard below typing area</span>
            </div>
            <input
              type="checkbox"
              id="settings-virtual-keyboard-checkbox"
              checked={settings.showVirtualKeyboard}
              onChange={(e) => {
                e.stopPropagation();
                setShowVirtualKeyboard(e.target.checked);
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Reset & Storage Management */}
        <div id="settings-reset-section" className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
          <h2 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Reset Data & Factory Defaults
          </h2>
          <p className="text-xs text-rose-200/80">
            Clear all locally cached keystroke records, test histories, streak counters, and reset preferences to factory defaults (with default Underline caret).
          </p>
          <button
            id="settings-wipe-data-btn"
            onClick={handleOpenResetDialog}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetDone ? 'Reset Completed!' : 'Wipe Local Records & Reset'}</span>
          </button>
        </div>
      </div>

      {/* Factory Reset Confirmation Dialog Modal */}
      {showResetModal && (
        <div 
          id="factory-reset-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div 
            id="factory-reset-modal-card"
            className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-5 text-left relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => !isResetting && setShowResetModal(false)}
              disabled={isResetting}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">
                  Reset Data & Factory Defaults
                </h3>
                <p className="text-xs font-semibold text-rose-300">
                  Are you sure you want to reset all data, history, and settings to factory defaults?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              This action will permanently clear all cached test history, keystroke logs, and streak counters. All preferences will be restored to initial factory defaults (with default <span className="text-cyan-400 font-semibold">Underline</span> cursor). This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="cancel-factory-reset-btn"
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-factory-reset-btn"
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Reset Everything</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
