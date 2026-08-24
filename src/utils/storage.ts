import { 
  UserProfile, 
  TypingResult, 
  LessonProgress, 
  AggregateStats, 
  UserSettings, 
  LeaderboardEntry,
  Achievement
} from '../types';
import { ACHIEVEMENTS_DATA } from '../data/achievements';
import { LESSONS_DATA } from '../data/lessons';
import { calculateLevelInfo } from './typingCalculations';

const STORAGE_KEYS = {
  SETTINGS: 'tmp_settings_v1',
  USER_PROFILE: 'tmp_user_profile_v1',
  TEST_RESULTS: 'tmp_results_v1',
  LESSON_PROGRESS: 'tmp_lessons_progress_v1',
  UNLOCKED_ACHIEVEMENTS: 'tmp_unlocked_achievements_v1',
  GUEST_ID: 'tmp_guest_id_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'warm',
  soundEnabled: true,
  soundType: 'click',
  soundVolume: 0.5,
  showVirtualKeyboard: true,
  keyboardLayout: 'qwerty',
  fontSize: 'md',
  cursorStyle: 'underline',
  smoothCaret: true,
  blindMode: false,
  highlightMode: 'character',
  instantRestart: false,
  autoSaveResults: true,
};

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ==================== SETTINGS STORAGE ====================
export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const validSoundTypes = ['click', 'typewriter', 'soft', 'beep', 'off'];
    const soundType = validSoundTypes.includes(parsed?.soundType) ? parsed.soundType : 'click';
    const validThemes = ['warm', 'ivory-sapphire', 'dark', 'light', 'system'];
    const theme = validThemes.includes(parsed?.theme) ? parsed.theme : 'warm';
    const validFontSizes = ['sm', 'md', 'lg', 'xl'];
    const fontSize = validFontSizes.includes(parsed?.fontSize) ? parsed.fontSize : 'md';
    const validCursorStyles = ['line', 'block', 'underline'];
    const cursorStyle = validCursorStyles.includes(parsed?.cursorStyle) ? parsed.cursorStyle : 'underline';
    const showVirtualKeyboard = typeof parsed?.showVirtualKeyboard === 'boolean' ? parsed.showVirtualKeyboard : true;
    return { ...DEFAULT_SETTINGS, ...parsed, soundType, theme, fontSize, cursorStyle, showVirtualKeyboard };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function resetAllDataToFactoryDefaults(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.TEST_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.LESSON_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.GUEST_ID);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } catch (err) {
    console.error('Failed to reset data to factory defaults:', err);
  }
}

// ==================== USER PROFILE STORAGE ====================
export function createInitialUserProfile(uid?: string, email?: string, displayName?: string, isGuest = true): UserProfile {
  const generatedId = uid || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    uid: generatedId,
    email: email || 'guest@smarttypingpro.local',
    displayName: displayName || 'Typing Cadet',
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    createdAt: new Date().toISOString(),
    bio: 'Touch typing enthusiast honing accuracy and rhythm on SmartTypingPro.',
    isGuest,
  };
}

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return createInitialUserProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      const initial = createInitialUserProfile();
      saveUserProfile(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return createInitialUserProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

// ==================== RESULTS STORAGE ====================
export function loadTestResults(): TypingResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
    if (!raw) return [];
    const parsed: TypingResult[] = JSON.parse(raw);
    return parsed.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch {
    return [];
  }
}

export function saveTestResult(result: TypingResult): { 
  updatedProfile: UserProfile; 
  newAchievements: Achievement[];
  leveledUp: boolean;
} {
  if (typeof window === 'undefined') {
    const profile = createInitialUserProfile();
    return { updatedProfile: profile, newAchievements: [], leveledUp: false };
  }

  const existingResults = loadTestResults();
  const updatedResults = [result, ...existingResults];
  localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(updatedResults));

  // Update User Streak & Practice Date
  const currentProfile = loadUserProfile();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let streak = currentProfile.currentStreak || 0;
  if (!currentProfile.lastPracticeDate) {
    streak = 1;
  } else if (currentProfile.lastPracticeDate === today) {
    // Already practiced today, keep streak intact
    streak = Math.max(1, streak);
  } else if (currentProfile.lastPracticeDate === yesterday) {
    // Consecutive day practice
    streak += 1;
  } else {
    // Missed a day or more
    streak = 1;
  }

  const longestStreak = Math.max(currentProfile.longestStreak || 0, streak);
  const oldLevel = calculateLevelInfo(currentProfile.xp || 0).level;
  const newXp = (currentProfile.xp || 0) + (result.xpEarned || 0);
  const newLevelInfo = calculateLevelInfo(newXp);
  const leveledUp = newLevelInfo.level > oldLevel;

  const updatedProfile: UserProfile = {
    ...currentProfile,
    xp: newXp,
    level: newLevelInfo.level,
    currentStreak: streak,
    longestStreak,
    lastPracticeDate: today,
  };

  saveUserProfile(updatedProfile);

  // Update Lesson Progress if applicable
  if (result.lessonId) {
    recordLessonCompletion(result.lessonId, result.netWpm, result.accuracy);
  }

  // Check achievements unlock
  const newAchievements = evaluateAchievements(updatedProfile, updatedResults);

  return { updatedProfile, newAchievements, leveledUp };
}

// ==================== LESSON PROGRESS STORAGE ====================
export function loadLessonProgress(): Record<string, LessonProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordLessonCompletion(
  lessonId: string, 
  wpm: number, 
  accuracy: number
): void {
  const lesson = LESSONS_DATA.find(l => l.id === lessonId);
  if (!lesson) return;

  const current = loadLessonProgress();
  const existing = current[lessonId];

  const passed = wpm >= lesson.requiredWpm && accuracy >= lesson.requiredAccuracy;
  
  // Calculate 1-3 stars
  let stars = 1;
  if (wpm >= lesson.requiredWpm + 10 && accuracy >= lesson.requiredAccuracy + 2) {
    stars = 3;
  } else if (wpm >= lesson.requiredWpm + 5 || accuracy >= lesson.requiredAccuracy + 1) {
    stars = 2;
  }

  const updatedItem: LessonProgress = {
    lessonId,
    completed: passed || (existing?.completed ?? false),
    bestWpm: Math.max(existing?.bestWpm || 0, wpm),
    bestAccuracy: Math.max(existing?.bestAccuracy || 0, accuracy),
    stars: Math.max(existing?.stars || 0, passed ? stars : 0),
    lastCompletedAt: new Date().toISOString(),
  };

  current[lessonId] = updatedItem;
  localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(current));
}

// ==================== ACHIEVEMENTS ====================
export function loadUnlockedAchievements(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function evaluateAchievements(profile: UserProfile, results: TypingResult[]): Achievement[] {
  const unlockedIds = new Set(loadUnlockedAchievements());
  const newlyUnlocked: Achievement[] = [];

  const maxNetWpm = results.reduce((max, r) => Math.max(max, r.netWpm), 0);
  const maxAccuracy = results.reduce((max, r) => Math.max(max, r.accuracy), 0);
  const testCount = results.length;
  const streak = profile.currentStreak || 0;
  const lessonProg = loadLessonProgress();
  const completedBeginnerLessons = LESSONS_DATA
    .filter(l => l.level === 'beginner')
    .every(l => lessonProg[l.id]?.completed);

  ACHIEVEMENTS_DATA.forEach(ach => {
    if (unlockedIds.has(ach.id)) return;

    let conditionMet = false;
    if (ach.category === 'speed' && maxNetWpm >= ach.requirement) {
      conditionMet = true;
    } else if (ach.category === 'accuracy' && maxAccuracy >= ach.requirement) {
      conditionMet = true;
    } else if (ach.category === 'volume' && testCount >= ach.requirement) {
      conditionMet = true;
    } else if (ach.category === 'streak' && streak >= ach.requirement) {
      conditionMet = true;
    } else if (ach.id === 'lesson-all-beg' && completedBeginnerLessons) {
      conditionMet = true;
    }

    if (conditionMet) {
      unlockedIds.add(ach.id);
      newlyUnlocked.push({ ...ach, unlockedAt: new Date().toISOString() });
    }
  });

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, JSON.stringify(Array.from(unlockedIds)));
  }

  return newlyUnlocked;
}

// ==================== AGGREGATE STATS ====================
export function calculateAggregateStats(): AggregateStats {
  const results = loadTestResults();
  const lessonsProgress = loadLessonProgress();
  const lessonsCompletedCount = Object.values(lessonsProgress).filter(p => p.completed).length;

  if (results.length === 0) {
    return {
      bestGrossWpm: 0,
      bestNetWpm: 0,
      averageNetWpm: 0,
      bestAccuracy: 0,
      averageAccuracy: 0,
      totalTestsCompleted: 0,
      totalPracticeTimeSeconds: 0,
      totalCharactersTyped: 0,
      lessonsCompletedCount,
      recentResults: [],
      dailyPracticeMinutes: [],
      wpmHistory: [],
    };
  }

  let totalNetWpm = 0;
  let totalAccuracy = 0;
  let bestGrossWpm = 0;
  let bestNetWpm = 0;
  let bestAccuracy = 0;
  let totalSeconds = 0;
  let totalCharacters = 0;

  const dateMinutesMap: Record<string, number> = {};
  const wpmHistory: { date: string; wpm: number; accuracy: number; mode: string }[] = [];

  results.forEach(r => {
    totalNetWpm += r.netWpm;
    totalAccuracy += r.accuracy;
    bestGrossWpm = Math.max(bestGrossWpm, r.grossWpm);
    bestNetWpm = Math.max(bestNetWpm, r.netWpm);
    bestAccuracy = Math.max(bestAccuracy, r.accuracy);
    totalSeconds += r.durationSeconds;
    totalCharacters += r.totalCharactersTyped;

    const dateKey = r.completedAt.split('T')[0];
    dateMinutesMap[dateKey] = (dateMinutesMap[dateKey] || 0) + r.durationSeconds / 60;

    wpmHistory.push({
      date: new Date(r.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      wpm: r.netWpm,
      accuracy: r.accuracy,
      mode: r.mode,
    });
  });

  const dailyPracticeMinutes = Object.keys(dateMinutesMap).map(date => ({
    date,
    minutes: Number(dateMinutesMap[date].toFixed(1)),
  })).slice(-14);

  return {
    bestGrossWpm: Number(bestGrossWpm.toFixed(1)),
    bestNetWpm: Number(bestNetWpm.toFixed(1)),
    averageNetWpm: Number((totalNetWpm / results.length).toFixed(1)),
    bestAccuracy: Number(bestAccuracy.toFixed(1)),
    averageAccuracy: Number((totalAccuracy / results.length).toFixed(1)),
    totalTestsCompleted: results.length,
    totalPracticeTimeSeconds: Math.round(totalSeconds),
    totalCharactersTyped: totalCharacters,
    lessonsCompletedCount,
    recentResults: results.slice(0, 10),
    dailyPracticeMinutes,
    wpmHistory: wpmHistory.reverse().slice(-20),
  };
}

// ==================== LEADERBOARD GENERATION ====================
const COMMUNITY_TYPISTS = [
  { displayName: 'Elena Rostova', level: 28, netWpm: 124.5, accuracy: 99.2, xp: 14850 },
  { displayName: 'Marcus Sterling', level: 25, netWpm: 112.8, accuracy: 98.7, xp: 12200 },
  { displayName: 'Aisha Al-Mansoor', level: 22, netWpm: 104.2, accuracy: 99.0, xp: 9950 },
  { displayName: 'Kenji Takahashi', level: 19, netWpm: 96.4, accuracy: 97.9, xp: 8100 },
  { displayName: 'Chloe Dupont', level: 16, netWpm: 88.0, accuracy: 98.4, xp: 6400 },
  { displayName: 'Devon Vance', level: 14, netWpm: 82.5, accuracy: 96.8, xp: 5100 },
  { displayName: 'Priya Sharma', level: 12, netWpm: 76.1, accuracy: 97.5, xp: 4200 },
  { displayName: 'Liam O\'Connor', level: 10, netWpm: 69.4, accuracy: 96.2, xp: 3300 },
  { displayName: 'Sofia Gomez', level: 8, netWpm: 63.8, accuracy: 95.8, xp: 2500 },
  { displayName: 'Lucas Chen', level: 6, netWpm: 55.0, accuracy: 96.0, xp: 1800 },
];

export function getLeaderboard(
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time',
  sortBy: 'netWpm' | 'accuracy' | 'xp' = 'netWpm'
): LeaderboardEntry[] {
  const profile = loadUserProfile();
  const stats = calculateAggregateStats();

  const userEntry: LeaderboardEntry = {
    id: `user_${profile.uid}`,
    userId: profile.uid,
    displayName: `${profile.displayName} (You)`,
    level: profile.level,
    netWpm: stats.bestNetWpm || 0,
    accuracy: stats.bestAccuracy || 0,
    xp: profile.xp || 0,
    rank: 0,
    testsCount: stats.totalTestsCompleted,
    timeframe,
    timestamp: new Date().toISOString(),
  };

  const list: LeaderboardEntry[] = COMMUNITY_TYPISTS.map((t, idx) => {
    // adjust slightly by timeframe for variety
    const modifier = timeframe === 'daily' ? 0.92 : timeframe === 'weekly' ? 0.96 : 1.0;
    return {
      id: `comm_${idx}`,
      userId: `comm_${idx}`,
      displayName: t.displayName,
      level: t.level,
      netWpm: Number((t.netWpm * modifier).toFixed(1)),
      accuracy: t.accuracy,
      xp: Math.round(t.xp * modifier),
      rank: 0,
      testsCount: Math.round(t.level * 8),
      timeframe,
      timestamp: new Date().toISOString(),
    };
  });

  list.push(userEntry);

  list.sort((a, b) => {
    if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
    if (sortBy === 'xp') return b.xp - a.xp;
    return b.netWpm - a.netWpm;
  });

  return list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
