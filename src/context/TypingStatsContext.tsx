import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TypingResult, AggregateStats, Achievement, LessonProgress } from '../types';
import { 
  calculateAggregateStats, 
  saveTestResult, 
  loadLessonProgress,
  loadUnlockedAchievements,
} from '../utils/storage';
import { useAuth } from './AuthContext';
import { auth, saveTypingScoreToFirestore } from '../services/firebase';
import { soundSynthesizer } from '../utils/audio';

interface TypingStatsContextType {
  stats: AggregateStats;
  lastResult: TypingResult | null;
  lessonProgress: Record<string, LessonProgress>;
  unlockedAchievementIds: string[];
  recentNewAchievements: Achievement[];
  clearNewAchievements: () => void;
  recordTestCompleted: (result: TypingResult) => { leveledUp: boolean; newAchievements: Achievement[] };
  refreshStats: () => void;
}

const TypingStatsContext = createContext<TypingStatsContextType | undefined>(undefined);

export const TypingStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateUserProfileState } = useAuth();
  const [stats, setStats] = useState<AggregateStats>(() => calculateAggregateStats());
  const [lastResult, setLastResult] = useState<TypingResult | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>(() => loadLessonProgress());
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>(() => loadUnlockedAchievements());
  const [recentNewAchievements, setRecentNewAchievements] = useState<Achievement[]>([]);

  const refreshStats = useCallback(() => {
    setStats(calculateAggregateStats());
    setLessonProgress(loadLessonProgress());
    setUnlockedAchievementIds(loadUnlockedAchievements());
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const recordTestCompleted = (result: TypingResult) => {
    const { updatedProfile, newAchievements, leveledUp } = saveTestResult(result);
    setLastResult(result);
    updateUserProfileState(updatedProfile);
    refreshStats();

    if (auth && auth.currentUser) {
      saveTypingScoreToFirestore({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || updatedProfile.displayName || 'Typing Master',
        userEmail: auth.currentUser.email || updatedProfile.email || '',
        wpm: result.netWpm,
        rawWpm: result.grossWpm,
        accuracy: result.accuracy,
        timeTaken: result.durationSeconds,
        mode: result.mode,
      }).catch((err) => console.warn('Could not sync score to Firestore:', err));
    }

    if (newAchievements.length > 0) {
      setRecentNewAchievements(prev => [...prev, ...newAchievements]);
      soundSynthesizer.playSuccessChime(0.6);
    } else if (leveledUp) {
      soundSynthesizer.playSuccessChime(0.7);
    }

    return { leveledUp, newAchievements };
  };

  const clearNewAchievements = () => {
    setRecentNewAchievements([]);
  };

  return (
    <TypingStatsContext.Provider
      value={{
        stats,
        lastResult,
        lessonProgress,
        unlockedAchievementIds,
        recentNewAchievements,
        clearNewAchievements,
        recordTestCompleted,
        refreshStats,
      }}
    >
      {children}
    </TypingStatsContext.Provider>
  );
};

export function useTypingStats(): TypingStatsContextType {
  const context = useContext(TypingStatsContext);
  if (!context) {
    throw new Error('useTypingStats must be used within a TypingStatsProvider');
  }
  return context;
}
