export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type TestMode = 'timed_15' | 'timed_30' | 'timed_60' | 'timed_120' | 'timed_300' | 'timed_600' | 'paragraph' | 'lesson' | 'custom';

export type CursorStyle = 'line' | 'block' | 'underline';
export type SoundType = 'click' | 'typewriter' | 'soft' | 'beep' | 'off';
export type ThemeMode = 'dark' | 'light' | 'system';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface UserSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  soundType: SoundType;
  soundVolume: number; // 0 to 1
  showVirtualKeyboard: boolean;
  keyboardLayout: 'qwerty';
  fontSize: FontSize;
  cursorStyle: CursorStyle;
  smoothCaret: boolean;
  blindMode: boolean; // Hide errors during typing
  highlightMode: 'character' | 'word';
  instantRestart: boolean;
  autoSaveResults: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null; // ISO Date string (YYYY-MM-DD)
  createdAt: string;
  bio?: string;
  isGuest?: boolean;
}

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  expectedChar: string;
  isCorrect: boolean;
  isBackspace: boolean;
  wasMistakeCorrected?: boolean;
}

export interface TypingResult {
  id: string;
  userId: string;
  mode: TestMode;
  lessonId?: string;
  lessonTitle?: string;
  durationSeconds: number;
  elapsedMs: number;
  grossWpm: number;
  netWpm: number;
  grossWPM?: number;
  netWPM?: number;
  accuracy: number; // Percentage, e.g., 98.45
  totalCharactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalErrors: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  backspaceCount: number;
  xpEarned: number;
  completedAt: string; // ISO String
  calculationVersion: string; // e.g. "1.0.0"
}

export interface Lesson {
  id: string;
  level: DifficultyLevel;
  order: number;
  title: string;
  category: string;
  description: string;
  targetKeys: string[];
  practiceText: string;
  requiredWpm: number;
  requiredAccuracy: number;
  xpReward: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  stars: number; // 1 to 3
  lastCompletedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'speed' | 'accuracy' | 'streak' | 'volume' | 'lesson';
  requirement: number;
  xpReward: number;
  unlockedAt?: string;
}

export interface AggregateStats {
  bestGrossWpm: number;
  bestNetWpm: number;
  averageNetWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTestsCompleted: number;
  totalPracticeTimeSeconds: number;
  totalCharactersTyped: number;
  lessonsCompletedCount: number;
  recentResults: TypingResult[];
  dailyPracticeMinutes: { date: string; minutes: number }[];
  wpmHistory: { date: string; wpm: number; accuracy: number; mode: string }[];
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  netWpm: number;
  accuracy: number;
  xp: number;
  rank: number;
  testsCount: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  timestamp: string;
}

export type PageRoute = 
  | 'home'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'email-verification'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'privacy-policy'
  | 'terms'
  | 'dashboard'
  | 'learn'
  | 'lesson-view'
  | 'practice'
  | 'typing-test'
  | 'results'
  | 'progress'
  | 'achievements'
  | 'leaderboard'
  | 'profile'
  | 'settings';
