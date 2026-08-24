/**
 * SmartTypingPro - Centralized Typing Calculation Utilities
 * 
 * Industry Standard Convention (Monkeytype / Typing.com standard):
 * 1 Word = 5 keystrokes/characters (including spaces, numbers, punctuation)
 * Time elapsed is measured using high-resolution timestamps (performance.now())
 * Elapsed minutes is bounded with Math.max(elapsedMs / 60000, 0.0167) (~1 second minimum)
 * to prevent zero division and erratic initial jumps.
 */

export interface WpmCalculationInput {
  totalCharactersTyped: number;
  correctCharacters: number;
  uncorrectedErrors: number;
  elapsedMs: number;
}

export const CALCULATION_VERSION = "1.1.0";

/**
 * Calculates Gross / Raw Words Per Minute.
 * Formula: ((Total Typed Characters) / 5) / max(Elapsed Minutes, 0.0167)
 */
export function calculateGrossWPM(totalCharacters: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || totalCharacters <= 0) return 0;
  const elapsedMinutes = Math.max(elapsedMs / 60000, 0.0167);
  const grossWpm = (totalCharacters / 5) / elapsedMinutes;
  return Number(Math.max(0, grossWpm).toFixed(2));
}

/**
 * Calculates Net / Real-Time Words Per Minute (Industry Standard: Monkeytype & Typing.com).
 * Formula: ((Total Correct Characters Typed) / 5) / max(Time Elapsed in Minutes, 0.0167)
 * 
 * Typos reduce Accuracy % and increment Error Count, but do NOT artificially
 * crash the active running WPM to zero or single digits.
 */
export function calculateNetWPM(
  correctCharacters: number,
  uncorrectedErrors: number,
  elapsedMs: number
): number {
  if (elapsedMs <= 0 || correctCharacters <= 0) return 0;
  const elapsedMinutes = Math.max(elapsedMs / 60000, 0.0167);
  
  // Real-time speed based strictly on standard correct keypress throughput
  const netWpm = (correctCharacters / 5) / elapsedMinutes;
  return Number(Math.max(0, netWpm).toFixed(2));
}

/**
 * Calculates Keystroke Accuracy Percentage.
 * Formula: (Correct Keystrokes / Total Keystrokes) * 100
 * Returned as a 2-decimal number (e.g. 98.45).
 */
export function calculateAccuracy(
  correctKeystrokes: number,
  totalKeystrokes: number
): number {
  if (totalKeystrokes <= 0) return 100;
  if (correctKeystrokes <= 0) return 0;
  const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
  // Guard against any floating point anomalies
  const clamped = Math.min(100, Math.max(0, accuracy));
  return Number(clamped.toFixed(2));
}

/**
 * Calculates XP earned from a typing test session.
 */
export function calculateXpEarned(
  netWpm: number,
  accuracy: number,
  durationSeconds: number,
  isLesson: boolean = false,
  lessonPassed: boolean = false
): number {
  if (durationSeconds < 5 && netWpm < 10) return 0;

  // Base XP by duration (approx 1 XP per 2 seconds practiced)
  let baseXP = Math.floor(durationSeconds * 0.75);

  // Speed Bonus (1 XP per 3 WPM)
  const speedBonus = Math.floor(netWpm / 3);

  // Accuracy Multiplier
  let accuracyBonus = 0;
  if (accuracy >= 99.5) {
    accuracyBonus = 25;
  } else if (accuracy >= 98) {
    accuracyBonus = 15;
  } else if (accuracy >= 95) {
    accuracyBonus = 8;
  }

  // Lesson completion bonus
  let lessonBonus = 0;
  if (isLesson && lessonPassed) {
    lessonBonus = 50;
  }

  const totalXP = Math.max(5, baseXP + speedBonus + accuracyBonus + lessonBonus);
  return totalXP;
}

/**
 * Calculates User Level and XP progress towards next level.
 * Level 1: 0 - 200 XP
 * Level 2: 200 - 500 XP
 * Level 3: 500 - 900 XP, etc. (Threshold = Level * (Level + 1) * 100)
 */
export function calculateLevelInfo(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXpThreshold: number;
  progressPercent: number;
} {
  let level = 1;
  let xpForCurrent = 0;
  let xpForNext = 250;

  while (totalXp >= xpForNext) {
    level++;
    xpForCurrent = xpForNext;
    xpForNext = xpForCurrent + Math.floor(250 * Math.pow(1.25, level - 1));
  }

  const xpInCurrentLevel = totalXp - xpForCurrent;
  const xpNeededForNextLevel = xpForNext - xpForCurrent;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXpThreshold: xpNeededForNextLevel,
    progressPercent: Number(progressPercent.toFixed(1)),
  };
}

/**
 * Format duration in seconds to mm:ss format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format total practice time into hours and minutes
 */
export function formatTotalTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = (minutes / 60).toFixed(1);
  return `${hours} hrs`;
}
