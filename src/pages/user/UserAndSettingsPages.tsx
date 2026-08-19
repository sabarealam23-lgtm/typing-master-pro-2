import React, { useState } from 'react';
import { PageRoute, LeaderboardEntry, UserProfile, CursorStyle, SoundType, FontSize, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTypingStats } from '../../context/TypingStatsContext';
import { getLeaderboard, saveUserProfile, loadUserProfile } from '../../utils/storage';
import { calculateLevelInfo, formatTotalTime } from '../../utils/typingCalculations';
import { soundSynthesizer } from '../../utils/audio';
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
  Award
} from 'lucide-react';

interface UserPageProps {
  onNavigate: (page: PageRoute) => void;
}

// ==================== LEADERBOARD PAGE ====================
export const LeaderboardPage: React.FC<UserPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');
  const [sortBy, setSortBy] = useState<'netWpm' | 'accuracy' | 'xp'>('netWpm');

  const leaderboardEntries = getLeaderboard(timeframe, sortBy);

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
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {(['daily', 'weekly', 'monthly', 'all_time'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors font-medium ${
                timeframe === tf
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sort metric toggle */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 uppercase font-semibold text-[10px]">Rank By:</span>
        {(['netWpm', 'accuracy', 'xp'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setSortBy(m)}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              sortBy === m
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {m === 'netWpm' ? 'Net Speed (WPM)' : m === 'accuracy' ? 'Accuracy (%)' : 'XP Points'}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Typist</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Net Speed</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4">XP</th>
                <th className="py-3.5 px-4 text-right">Tests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {leaderboardEntries.map((entry) => {
                const isCurrentUser = entry.userId === user.uid || entry.displayName.includes('(You)');
                const isTop3 = entry.rank <= 3;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 font-semibold'
                        : 'hover:bg-slate-850'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      {entry.rank === 1 ? (
                        <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                      ) : entry.rank === 2 ? (
                        <Crown className="w-5 h-5 text-slate-300 mx-auto" />
                      ) : entry.rank === 3 ? (
                        <Crown className="w-5 h-5 text-amber-600 mx-auto" />
                      ) : (
                        <span className="text-slate-400 font-bold">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                        {entry.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className={isCurrentUser ? 'text-emerald-400 font-bold' : ''}>
                        {entry.displayName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                        Lv.{entry.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                      {entry.netWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">
                      {entry.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 text-amber-400">
                      {entry.xp.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {entry.testsCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

  const handleTestSound = (type: SoundType) => {
    soundSynthesizer.playKeySound(type, settings.soundVolume, false);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset your local typing statistics and preferences?')) {
      localStorage.clear();
      resetToDefaults();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
      window.location.reload();
    }
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Appearance & Theme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['dark', 'light', 'system'] as const).map((thm) => (
              <button
                key={thm}
                onClick={() => setTheme(thm)}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold capitalize transition-all ${
                  settings.theme === thm
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{thm} Theme</span>
                {thm === 'dark' ? <Moon className="w-4 h-4" /> : thm === 'light' ? <Sun className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Synthesizer */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Mechanical Key Audio</h2>
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
                {(['click', 'typewriter', 'soft', 'beep'] as const).map((snd) => (
                  <button
                    key={snd}
                    onClick={() => {
                      setSoundType(snd);
                      handleTestSound(snd);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold capitalize flex flex-col items-center gap-1 transition-all ${
                      settings.soundType === snd
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{snd}</span>
                    <span className="text-[10px] text-slate-500">Preview</span>
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
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Typing Area & Visuals</h2>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Font Size</label>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`py-2 rounded-xl border text-center font-bold capitalize transition-colors ${
                    settings.fontSize === sz
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Cursor Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Cursor / Caret Style</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(['line', 'block', 'underline'] as const).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCursorStyle(cur)}
                  className={`py-2 rounded-xl border text-center font-bold capitalize transition-colors ${
                    settings.cursorStyle === cur
                      ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Keyboard Toggle */}
          <div className="flex justify-between items-center pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">On-Screen Visual Keyboard</span>
              <span className="text-[11px] text-slate-400">Show interactive finger guide below typing area</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showVirtualKeyboard}
              onChange={(e) => setShowVirtualKeyboard(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </div>
        </div>

        {/* Reset & Storage Management */}
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
          <h2 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Reset Data & Factory Defaults
          </h2>
          <p className="text-xs text-rose-200/80">
            Clear all locally cached keystroke records, test histories, streak counters, and reset preferences to default settings.
          </p>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {resetDone ? 'Reset Completed!' : 'Wipe Local Records & Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};
