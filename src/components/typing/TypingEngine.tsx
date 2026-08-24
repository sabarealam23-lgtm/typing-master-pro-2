import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TestMode, 
  TypingResult, 
  Lesson 
} from '../../types';
import { 
  calculateGrossWPM, 
  calculateNetWPM, 
  calculateAccuracy, 
  calculateXpEarned, 
  formatDuration,
  CALCULATION_VERSION
} from '../../utils/typingCalculations';
import { getAdditionalNaturalParagraphs } from '../../data/practiceTexts';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { saveTypingScoreToFirestore } from '../../services/firebase';
import { soundSynthesizer } from '../../utils/audio';
import { VirtualKeyboard, getFingerGuide } from './VirtualKeyboard';
import { 
  RotateCcw, 
  AlertTriangle, 
  Flame, 
  Target, 
  Timer as TimerIcon, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Eye, 
  EyeOff,
  Sun,
  Moon,
  Check,
  LayoutGrid,
  AlignLeft,
  Pause,
  Play,
  X,
  User,
  ArrowDown,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

interface TypingEngineProps {
  practiceText: string;
  mode: TestMode;
  targetDurationSeconds?: number; // for timed tests (15, 30, 60, 120, 300, 600)
  lesson?: Lesson;
  candidateName?: string;
  layout?: 'standard' | 'sonma';
  onComplete: (result: TypingResult) => void;
  onRestart?: () => void;
  onExit?: () => void;
}

interface CharDetail {
  expected: string;
  typed?: string;
  state: 'untyped' | 'correct' | 'incorrect' | 'corrected';
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  practiceText,
  mode,
  targetDurationSeconds,
  lesson,
  candidateName,
  layout = 'standard',
  onComplete,
  onRestart,
  onExit,
}) => {
  const { settings, setTheme, setSoundEnabled, setShowVirtualKeyboard } = useSettings();
  const { user } = useAuth();

  const isSonmaLayout = layout === 'sonma';
  const isTimedMode = Boolean(targetDurationSeconds && targetDurationSeconds > 0);
  const initialTimeLeft = targetDurationSeconds || 0;

  // View style: Learn mode defaults to compact character boxes; Practice and Test default to continuous text flow
  const isDefaultCards = mode === 'lesson';
  const [displayStyle, setDisplayStyle] = useState<'cards' | 'continuous'>(isDefaultCards ? 'cards' : 'continuous');

  // Timing refs
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const referenceContainerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const activeRefCharRef = useRef<HTMLSpanElement>(null);

  // State
  const [charDetails, setCharDetails] = useState<CharDetail[]>(() => 
    practiceText.split('').map(char => ({ expected: char, state: 'untyped' }))
  );
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [pasteBlockedWarning, setPasteBlockedWarning] = useState<boolean>(false);
  const [blindModeActive, setBlindModeActive] = useState<boolean>(settings.blindMode);

  // Keystroke statistics trackers
  const totalKeystrokesRef = useRef<number>(0);
  const correctKeystrokesRef = useRef<number>(0);
  const incorrectKeystrokesRef = useRef<number>(0);
  const backspaceCountRef = useRef<number>(0);
  const spacebarHitsRef = useRef<number>(0);
  const totalErrorsEncounteredRef = useRef<number>(0);
  const correctedErrorsRef = useRef<number>(0);
  const mistakePositionsRef = useRef<Set<number>>(new Set());
  const usedParagraphIndicesRef = useRef<number[]>([]);

  // Avoid stale closures in event listeners & interval timers
  const cursorIndexRef = useRef(cursorIndex);
  cursorIndexRef.current = cursorIndex;
  const charDetailsRef = useRef(charDetails);
  charDetailsRef.current = charDetails;
  const isStartedRef = useRef(isStarted);
  isStartedRef.current = isStarted;
  const isFinishedRef = useRef(isFinished);
  isFinishedRef.current = isFinished;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Live calculation states for smooth UI feedback
  const [liveGrossWpm, setLiveGrossWpm] = useState<number>(0);
  const [liveNetWpm, setLiveNetWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  // Viewport Auto-Center & Auto-Focus on mount or mode change
  useEffect(() => {
    containerRef.current?.focus();
    if (mode === 'lesson') {
      const timer = setTimeout(() => {
        const arena = document.getElementById('typing-engine-wrapper');
        if (arena) {
          const rect = arena.getBoundingClientRect();
          if (rect.top < 60 || rect.bottom > window.innerHeight) {
            arena.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [practiceText, mode]);

  // Smooth auto-scroll for reference text container in Sonma layout
  useEffect(() => {
    if (!isSonmaLayout || !referenceContainerRef.current) return;

    if (!isStarted || cursorIndex === 0) {
      referenceContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeRefCharRef.current) {
      const refContainer = referenceContainerRef.current;
      const charElem = activeRefCharRef.current;

      const containerRect = refContainer.getBoundingClientRect();
      const charRect = charElem.getBoundingClientRect();

      const relativeTop = charRect.top - containerRect.top + refContainer.scrollTop;
      const charHeight = charRect.height || 28;
      const containerHeight = refContainer.clientHeight;

      const targetScrollTop = Math.max(0, relativeTop - (containerHeight / 2) + (charHeight / 2));

      if (Math.abs(refContainer.scrollTop - targetScrollTop) > 12) {
        refContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [cursorIndex, isStarted, isSonmaLayout]);

  // Smooth auto-scroll for active typing position / line centering inside the typing box
  useEffect(() => {
    if (!containerRef.current) return;

    if (!isStarted || cursorIndex === 0) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeCharRef.current) {
      const container = containerRef.current;
      const charElem = activeCharRef.current;

      const containerRect = container.getBoundingClientRect();
      const charRect = charElem.getBoundingClientRect();

      // Relative vertical offset from the top of the scrollable content
      const relativeTop = charRect.top - containerRect.top + container.scrollTop;
      const charHeight = charRect.height || 36;
      const containerHeight = container.clientHeight;

      // Keep active line centered in the container viewport so upcoming lines & paragraphs are always clearly visible
      const targetScrollTop = Math.max(0, relativeTop - (containerHeight / 2) + (charHeight / 2));

      // Scroll smoothly when advancing past 1st/2nd line or when deviating from center
      if (Math.abs(container.scrollTop - targetScrollTop) > 14) {
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [cursorIndex, isStarted]);

  // Pause / Resume toggle
  const togglePause = useCallback(() => {
    if (!isStartedRef.current || isFinishedRef.current) return;
    if (isPausedRef.current) {
      if (pausedAtRef.current) {
        totalPausedTimeRef.current += (performance.now() - pausedAtRef.current);
        pausedAtRef.current = null;
      }
      setIsPaused(false);
      isPausedRef.current = false;
      setTimeout(() => containerRef.current?.focus(), 50);
    } else {
      pausedAtRef.current = performance.now();
      setIsPaused(true);
      isPausedRef.current = true;
    }
  }, []);

  // Finish test callback
  const finishTest = useCallback(() => {
    if (isFinishedRef.current) return;
    setIsFinished(true);
    isFinishedRef.current = true;

    const endTimestamp = performance.now();
    endTimeRef.current = endTimestamp;

    const startTimestamp = startTimeRef.current || endTimestamp - 1000;
    const finalElapsedMs = Math.max(500, endTimestamp - startTimestamp - totalPausedTimeRef.current);
    const finalElapsedSeconds = isTimedMode && targetDurationSeconds
      ? targetDurationSeconds
      : Number((finalElapsedMs / 1000).toFixed(1));

    let uncorrected = 0;
    charDetailsRef.current.forEach(c => {
      if (c.state === 'incorrect') uncorrected++;
    });

    const totalChars = cursorIndexRef.current;
    const correctChars = charDetailsRef.current.filter(c => c.state === 'correct' || c.state === 'corrected').length;
    const grossWPM = calculateGrossWPM(totalChars, finalElapsedMs);
    const netWPM = calculateNetWPM(correctChars, uncorrected, finalElapsedMs);
    const accuracy = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current);

    // Compute Word Breakdown
    const typedSlice = charDetailsRef.current.slice(0, cursorIndexRef.current);
    const wordsList: typeof typedSlice[] = [];
    let currentWord: typeof typedSlice = [];

    typedSlice.forEach((c) => {
      if (c.expected === ' ' || c.expected === '\n') {
        if (currentWord.length > 0) {
          wordsList.push(currentWord);
          currentWord = [];
        }
      } else {
        currentWord.push(c);
      }
    });
    if (currentWord.length > 0) {
      wordsList.push(currentWord);
    }

    let correctWordsCount = 0;
    let incorrectWordsCount = 0;
    wordsList.forEach((w) => {
      const hasError = w.some((ch) => ch.state === 'incorrect');
      if (hasError) {
        incorrectWordsCount++;
      } else {
        correctWordsCount++;
      }
    });

    // Time efficiency calculations
    const allottedSeconds = isTimedMode && targetDurationSeconds
      ? targetDurationSeconds
      : (mode === 'paragraph' ? Math.max(30, Math.round((Math.max(1, wordsList.length) / 40) * 60)) : Math.round(finalElapsedSeconds));
    const actualSeconds = Number((finalElapsedMs / 1000).toFixed(1));
    const paceTimeSaved = Math.max(0, Number((allottedSeconds - actualSeconds).toFixed(1)));

    // Certificate qualification & tier evaluation
    const isTypingTestMode = mode.startsWith('timed_') || mode === 'paragraph' || isSonmaLayout;
    const isCertificateQualified = isTypingTestMode && netWPM >= 30 && accuracy >= 95;
    let certificateTier: 'silver' | 'gold' | 'platinum' | null = null;
    if (isCertificateQualified) {
      if (netWPM >= 70 && accuracy >= 98) {
        certificateTier = 'platinum';
      } else if (netWPM >= 50 && accuracy >= 97) {
        certificateTier = 'gold';
      } else {
        certificateTier = 'silver';
      }
    }
    const certificateCode = `ST-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const isLessonPassed = lesson ? (netWPM >= lesson.requiredWpm && accuracy >= lesson.requiredAccuracy) : true;
    const xpEarned = calculateXpEarned(netWPM, accuracy, finalElapsedSeconds, Boolean(lesson), isLessonPassed);

    const resolvedCandidateName = candidateName || (user?.displayName && user.displayName !== 'Guest' ? user.displayName : 'Typing Candidate');

    const result: TypingResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      userId: user?.uid || 'guest',
      mode,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
      durationSeconds: finalElapsedSeconds,
      elapsedMs: finalElapsedMs,
      grossWpm: grossWPM,
      netWpm: netWPM,
      grossWPM: grossWPM,
      netWPM: netWPM,
      accuracy,
      totalCharactersTyped: totalChars,
      correctCharacters: correctChars,
      incorrectCharacters: uncorrected,
      totalErrors: totalErrorsEncounteredRef.current,
      correctedErrors: correctedErrorsRef.current,
      uncorrectedErrors: uncorrected,
      backspaceCount: backspaceCountRef.current,
      xpEarned,
      completedAt: new Date().toISOString(),
      calculationVersion: CALCULATION_VERSION,
      allottedDurationSeconds: allottedSeconds,
      actualTimeTakenSeconds: actualSeconds,
      paceTimeSavedSeconds: paceTimeSaved,
      correctWordsCount,
      incorrectWordsCount,
      totalWordsCount: wordsList.length,
      spacebarHits: spacebarHitsRef.current,
      certificateCode,
      isCertificateQualified,
      certificateTier,
      candidateName: resolvedCandidateName,
    };

    // Save score to Firestore if user is authenticated
    if (user && user.uid && !user.isGuest) {
      saveTypingScoreToFirestore({
        userId: user.uid,
        userName: resolvedCandidateName,
        userEmail: user.email || '',
        wpm: result.netWpm,
        rawWpm: result.grossWpm,
        accuracy: result.accuracy,
        timeTaken: result.durationSeconds,
        mode: result.mode
      });
    }

    onComplete(result);
  }, [isTimedMode, targetDurationSeconds, lesson, mode, isSonmaLayout, candidateName, user, onComplete]);

  // Restart / Reset
  const handleManualRestart = useCallback(() => {
    startTimeRef.current = null;
    endTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    incorrectKeystrokesRef.current = 0;
    backspaceCountRef.current = 0;
    spacebarHitsRef.current = 0;
    totalErrorsEncounteredRef.current = 0;
    correctedErrorsRef.current = 0;
    mistakePositionsRef.current.clear();
    usedParagraphIndicesRef.current = [];

    setCharDetails(practiceText.split('').map(char => ({ expected: char, state: 'untyped' })));
    setCursorIndex(0);
    setIsStarted(false);
    setIsFinished(false);
    setIsPaused(false);
    isStartedRef.current = false;
    isFinishedRef.current = false;
    isPausedRef.current = false;
    setTimeLeft(targetDurationSeconds || 0);
    setElapsedSeconds(0);
    setLiveGrossWpm(0);
    setLiveNetWpm(0);
    setLiveAccuracy(100);

    if (onRestart) onRestart();

    setTimeout(() => {
      containerRef.current?.focus();
    }, 50);
  }, [practiceText, targetDurationSeconds, onRestart]);

  // Reset when practiceText or targetDuration changes
  useEffect(() => {
    setCharDetails(practiceText.split('').map(char => ({ expected: char, state: 'untyped' })));
    setCursorIndex(0);
    setIsStarted(false);
    setIsFinished(false);
    setIsPaused(false);
    isStartedRef.current = false;
    isFinishedRef.current = false;
    isPausedRef.current = false;
    setTimeLeft(targetDurationSeconds || 0);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    endTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    incorrectKeystrokesRef.current = 0;
    backspaceCountRef.current = 0;
    spacebarHitsRef.current = 0;
    totalErrorsEncounteredRef.current = 0;
    correctedErrorsRef.current = 0;
    mistakePositionsRef.current.clear();
    usedParagraphIndicesRef.current = [];
    setLiveGrossWpm(0);
    setLiveNetWpm(0);
    setLiveAccuracy(100);
  }, [practiceText, targetDurationSeconds]);

  // Real-time timer
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const intervalId = setInterval(() => {
      if (!startTimeRef.current || isPausedRef.current) return;
      const now = performance.now();
      const elapsedMs = Math.max(0, now - startTimeRef.current - totalPausedTimeRef.current);
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsedSeconds(elapsedSec);

      const totalChars = cursorIndexRef.current;
      const correctChars = charDetailsRef.current.filter(c => c.state === 'correct' || c.state === 'corrected').length;
      let uncorrected = 0;
      charDetailsRef.current.forEach(c => {
        if (c.state === 'incorrect') uncorrected++;
      });

      const gWpm = calculateGrossWPM(totalChars, elapsedMs);
      const nWpm = calculateNetWPM(correctChars, uncorrected, elapsedMs);
      const acc = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current);

      setLiveGrossWpm(gWpm);
      setLiveNetWpm(nWpm);
      setLiveAccuracy(acc);

      if (isTimedMode && targetDurationSeconds) {
        const remaining = Math.max(0, targetDurationSeconds - elapsedSec);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(intervalId);
          finishTest();
        }
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [isStarted, isFinished, isTimedMode, targetDurationSeconds, finishTest]);

  // Core Keystroke Processor
  const processKeyInput = useCallback((key: string, e?: KeyboardEvent | React.KeyboardEvent) => {
    if (isFinishedRef.current) return;

    // Instant restart hotkey
    if (key === 'Escape' || (key === 'Tab' && settings.instantRestart)) {
      if (e) e.preventDefault();
      handleManualRestart();
      return;
    }

    // Ignore if paused
    if (isPausedRef.current) {
      if (key === ' ' || key === 'Enter') {
        if (e) e.preventDefault();
        togglePause();
      }
      return;
    }

    // Ignore modifier keys
    if ([
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ArrowUp', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageDown', 'PageUp', 'Insert',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ].includes(key)) {
      return;
    }

    // Prevent default scroll / page actions for Space, Enter, Backspace, Tab
    if (e && (key === ' ' || key === 'Enter' || key === 'Backspace' || key === 'Tab')) {
      e.preventDefault();
    }

    // Start timer on first keypress
    if (!isStartedRef.current) {
      setIsStarted(true);
      isStartedRef.current = true;
      startTimeRef.current = performance.now();
    }

    const currentIndex = cursorIndexRef.current;
    const currentList = [...charDetailsRef.current];

    // Handle Backspace
    if (key === 'Backspace') {
      totalKeystrokesRef.current += 1;
      backspaceCountRef.current += 1;

      if (settings.soundEnabled) {
        soundSynthesizer.playKeySound(settings.soundType, settings.soundVolume, false);
      }

      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        const prevChar = currentList[prevIndex];

        if (prevChar.state === 'incorrect') {
          correctedErrorsRef.current += 1;
        }

        currentList[prevIndex] = {
          ...prevChar,
          typed: undefined,
          state: 'untyped'
        };

        setCharDetails(currentList);
        setCursorIndex(prevIndex);
      }
      return;
    }

    // Preemptively extend text buffer in timed/continuous tests so typing is never interrupted
    if (isTimedMode && currentList.length - currentIndex < 140) {
      const { text: extraText, newIndices } = getAdditionalNaturalParagraphs(3, usedParagraphIndicesRef.current);
      usedParagraphIndicesRef.current.push(...newIndices);
      const newChars: CharDetail[] = extraText.split('').map(char => ({ expected: char, state: 'untyped' }));
      const extended = [...currentList, { expected: '\n', state: 'untyped' as const }, ...newChars];
      currentList.length = 0;
      currentList.push(...extended);
      charDetailsRef.current = extended;
      setCharDetails(extended);
    } else if (currentIndex >= currentList.length) {
      if (isTimedMode) {
        const { text: extraText, newIndices } = getAdditionalNaturalParagraphs(3, usedParagraphIndicesRef.current);
        usedParagraphIndicesRef.current.push(...newIndices);
        const newChars: CharDetail[] = extraText.split('').map(char => ({ expected: char, state: 'untyped' }));
        const extended = [...currentList, { expected: '\n', state: 'untyped' as const }, ...newChars];
        charDetailsRef.current = extended;
        setCharDetails(extended);
      } else {
        finishTest();
        return;
      }
    }

    const expectedChar = currentList[currentIndex]?.expected;
    if (!expectedChar) return;

    let inputChar = key;
    if (key === ' ') {
      spacebarHitsRef.current += 1;
    }
    if (inputChar === 'Enter' && expectedChar === '\n') {
      inputChar = '\n';
    } else if (inputChar === ' ' && expectedChar === '\n') {
      inputChar = '\n';
    }

    totalKeystrokesRef.current += 1;

    const isMatch = inputChar === expectedChar;

    if (isMatch) {
      correctKeystrokesRef.current += 1;
      const wasEverMistake = mistakePositionsRef.current.has(currentIndex);

      currentList[currentIndex] = {
        expected: expectedChar,
        typed: inputChar,
        state: wasEverMistake ? 'corrected' : 'correct'
      };

      if (settings.soundEnabled) {
        soundSynthesizer.playKeySound(settings.soundType, settings.soundVolume, false);
      }
    } else {
      incorrectKeystrokesRef.current += 1;
      totalErrorsEncounteredRef.current += 1;
      mistakePositionsRef.current.add(currentIndex);

      currentList[currentIndex] = {
        expected: expectedChar,
        typed: inputChar,
        state: 'incorrect'
      };

      if (settings.soundEnabled) {
        soundSynthesizer.playKeySound(settings.soundType, settings.soundVolume, true);
      }
    }

    const nextIndex = currentIndex + 1;
    setCharDetails(currentList);
    setCursorIndex(nextIndex);

    if (!isTimedMode && nextIndex >= currentList.length) {
      finishTest();
    }
  }, [
    isTimedMode,
    settings.instantRestart,
    settings.soundEnabled,
    settings.soundType,
    settings.soundVolume,
    handleManualRestart,
    togglePause,
    finishTest
  ]);

  // Global Window Keydown Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      processKeyInput(e.key, e);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [processKeyInput]);

  // Block Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPasteBlockedWarning(true);
    setTimeout(() => setPasteBlockedWarning(false), 3000);
  };

  const currentExpectedChar = charDetails[cursorIndex]?.expected || '';
  const fingerGuide = React.useMemo(() => getFingerGuide(currentExpectedChar), [currentExpectedChar]);
  const progressPercent = Math.min(100, Math.round((cursorIndex / Math.max(1, charDetails.length)) * 100));

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Dynamic Typography Mapping for Typing Area
  const continuousFontSizeClass = {
    sm: 'text-lg md:text-xl leading-relaxed',
    md: 'text-2xl md:text-2xl leading-relaxed',
    lg: 'text-3xl md:text-3xl leading-relaxed',
    xl: 'text-4xl md:text-4xl leading-relaxed',
  }[settings.fontSize || 'md'] || 'text-2xl md:text-2xl leading-relaxed';

  const cardSizes = {
    sm: {
      charText: 'text-xs sm:text-sm',
      spaceText: 'text-[9px]',
      charBox: 'min-w-[24px] sm:min-w-[28px] px-1 h-7 sm:h-8',
      spaceBox: 'min-w-[38px] sm:min-w-[44px] px-1.5 h-7 sm:h-8'
    },
    md: {
      charText: 'text-sm sm:text-base',
      spaceText: 'text-[10px]',
      charBox: 'min-w-[28px] sm:min-w-[34px] px-1.5 h-8 sm:h-9',
      spaceBox: 'min-w-[44px] sm:min-w-[52px] px-2 h-8 sm:h-9'
    },
    lg: {
      charText: 'text-base sm:text-lg',
      spaceText: 'text-xs',
      charBox: 'min-w-[32px] sm:min-w-[40px] px-2 h-9.5 sm:h-10.5',
      spaceBox: 'min-w-[50px] sm:min-w-[60px] px-2.5 h-9.5 sm:h-10.5'
    },
    xl: {
      charText: 'text-lg sm:text-xl',
      spaceText: 'text-sm',
      charBox: 'min-w-[38px] sm:min-w-[46px] px-2.5 h-11 sm:h-12',
      spaceBox: 'min-w-[58px] sm:min-w-[70px] px-3 h-11 sm:h-12'
    }
  }[settings.fontSize || 'md'] || {
    charText: 'text-sm sm:text-base',
    spaceText: 'text-[10px]',
    charBox: 'min-w-[28px] sm:min-w-[34px] px-1.5 h-8 sm:h-9',
    spaceBox: 'min-w-[44px] sm:min-w-[52px] px-2 h-8 sm:h-9'
  };

  // Caret / Cursor Renderer for Continuous Flow Mode
  const renderContinuousCaret = (isCurrent: boolean) => {
    if (!isCurrent) return null;
    const style = settings.cursorStyle || 'underline';

    if (style === 'block') {
      return (
        <span 
          id="typing-caret-block"
          className="absolute inset-0 bg-blue-500/30 dark:bg-blue-400/40 border-2 border-blue-600 dark:border-blue-400 rounded-xs animate-pulse pointer-events-none z-10" 
        />
      );
    }

    if (style === 'line') {
      return (
        <span 
          id="typing-caret-line"
          className="absolute -left-[2px] top-[4%] bottom-[4%] w-[2.5px] bg-blue-600 dark:bg-blue-400 animate-pulse pointer-events-none rounded-full z-10" 
        />
      );
    }

    // Default: 'underline'
    return (
      <span 
        id="typing-caret-underline"
        className="absolute left-0 right-0 -bottom-0.5 h-[3px] bg-blue-600 dark:bg-blue-400 animate-pulse pointer-events-none rounded-full z-10" 
      />
    );
  };

  // Caret / Cursor Renderer for Character Boxes Mode
  const renderCardCaret = (isCurrent: boolean) => {
    if (!isCurrent) return null;
    const style = settings.cursorStyle || 'underline';

    if (style === 'line') {
      return (
        <span 
          id="typing-card-caret-line"
          className="absolute top-1 bottom-1 left-0.5 w-[2.5px] bg-cyan-500 rounded-full animate-pulse z-10" 
        />
      );
    }

    if (style === 'block') {
      return (
        <span 
          id="typing-card-caret-block"
          className="absolute inset-0 border-2 border-cyan-400 rounded-lg animate-pulse pointer-events-none z-10" 
        />
      );
    }

    // Default / 'underline'
    return (
      <span 
        id="typing-card-caret-underline"
        className="absolute bottom-0.5 left-1 right-1 h-[2.5px] bg-cyan-500 rounded-full animate-pulse z-10" 
      />
    );
  };

  const isLessonMode = mode === 'lesson';

  // ==================== AUTHENTIC SONMA 2-BOX EXAM ARENA LAYOUT ====================
  if (isSonmaLayout) {
    const formattedCandidateName = candidateName || (user?.displayName && user.displayName !== 'Guest' ? user.displayName : 'Typing Candidate');

    // Compute word-by-word structure for authentic Sonma top reference box
    const sonmaWords = React.useMemo(() => {
      const words: Array<{
        wordIndex: number;
        startIndex: number;
        endIndex: number;
        chars: typeof charDetails;
        hasNewlineAfter: boolean;
        hasError: boolean;
      }> = [];

      let currentWordChars: typeof charDetails = [];
      let currentStartIndex = 0;

      for (let i = 0; i < charDetails.length; i++) {
        const detail = charDetails[i];
        if (detail.expected === ' ' || detail.expected === '\n') {
          if (currentWordChars.length > 0) {
            const hasErr = currentWordChars.some(c => c.state === 'incorrect');
            words.push({
              wordIndex: words.length,
              startIndex: currentStartIndex,
              endIndex: i - 1,
              chars: currentWordChars,
              hasNewlineAfter: detail.expected === '\n',
              hasError: hasErr,
            });
            currentWordChars = [];
          }
          currentStartIndex = i + 1;
        } else {
          if (currentWordChars.length === 0) {
            currentStartIndex = i;
          }
          currentWordChars.push(detail);
        }
      }

      if (currentWordChars.length > 0) {
        const hasErr = currentWordChars.some(c => c.state === 'incorrect');
        words.push({
          wordIndex: words.length,
          startIndex: currentStartIndex,
          endIndex: charDetails.length - 1,
          chars: currentWordChars,
          hasNewlineAfter: false,
          hasError: hasErr,
        });
      }

      return words;
    }, [charDetails]);

    // Find which word is currently active
    const activeWordIndex = React.useMemo(() => {
      if (sonmaWords.length === 0) return 0;
      const idx = sonmaWords.findIndex(w => cursorIndex <= w.endIndex + 1);
      return idx !== -1 ? idx : sonmaWords.length - 1;
    }, [sonmaWords, cursorIndex]);

    return (
      <div 
        id="sonma-exam-arena-wrapper" 
        onClick={() => containerRef.current?.focus()}
        className="w-full border-4 border-[#1e40af] bg-[#eff6ff] rounded-lg shadow-xl overflow-hidden select-none"
      >
        {/* Top Window Title Bar */}
        <div className="bg-[#1e40af] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="tracking-wide text-sm font-extrabold font-sans">Smart Typing Pro - Official Speed Assessment</span>
          </div>
          <div className="font-mono text-xs text-blue-100 flex items-center gap-2">
            <span>Candidate:</span>
            <span className="text-white font-bold bg-blue-900/60 px-2.5 py-0.5 rounded border border-blue-400/40">
              {formattedCandidateName}
            </span>
          </div>
        </div>

        {/* Center Main Typing Arena (Wide Full-Width Sonma 2-Box Style) */}
        <div className="p-3.5 sm:p-5 space-y-3 flex flex-col justify-between">
          {/* Paste Blocked Warning */}
          {pasteBlockedWarning && (
            <div 
              id="sonma-paste-warning"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#fee2e2] border border-[#f87171] text-[#991b1b] text-xs font-medium animate-bounce shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-[#dc2626] shrink-0" />
              <span>Clipboard pasting is locked during official exam mode to maintain authentic candidate scoring.</span>
            </div>
          )}

          {/* ==================== BOX 1: TOP REFERENCE BOX ==================== */}
          <div className="relative rounded-md bg-[#fefced] border border-[#cbd5e1] shadow-xs flex flex-col overflow-hidden">
            {/* Top Box Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#fef9c3]/60 border-b border-[#e2e8f0] text-xs font-serif text-[#1e3a8a]">
              <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1e40af]" /> Reference Text Passage
              </span>
              <span className="text-[11px] font-mono text-[#64748b]">
                {charDetails.length} chars • {sonmaWords.length} words
              </span>
            </div>

            {/* Top Box Content (Classic Serif, ~19px, line-height 1.8, Word-by-Word styling) */}
            <div
              id="sonma-reference-box"
              ref={referenceContainerRef}
              className="p-4 sm:p-5 h-[155px] sm:h-[175px] overflow-y-auto font-serif text-[19px] leading-[1.8] text-[#111827] text-left select-none scrollbar-clean scroll-smooth"
              style={{ wordBreak: 'normal', overflowWrap: 'break-word', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
            >
              {sonmaWords.map((word) => {
                const isPast = word.wordIndex < activeWordIndex;
                const isCurrent = word.wordIndex === activeWordIndex;

                let wordStyle = 'text-[#1f2937]'; // Upcoming words: Crisp dark charcoal text
                if (isPast) {
                  wordStyle = word.hasError ? 'text-[#9a3412] font-normal' : 'text-[#78716c] font-normal'; // Wrong: Soft muted brownish-tan | Correct: Muted olive-grey
                } else if (isCurrent) {
                  wordStyle = 'text-[#1d4ed8] border-b-2 border-[#2563eb] font-semibold pb-0.5'; // Current Active Word: Deep royal blue with clean blue underline
                }

                return (
                  <React.Fragment key={word.wordIndex}>
                    <span
                      ref={isCurrent ? activeRefCharRef : null}
                      className={`inline-block mr-2 transition-colors duration-75 ${wordStyle}`}
                    >
                      {word.chars.map((c) => c.expected).join('')}
                    </span>
                    {word.hasNewlineAfter && (
                      <span className="block my-1.5 border-t border-dashed border-[#cbd5e1] pt-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ==================== CENTER RED DIVIDER ==================== */}
          <div className="relative my-2 flex items-center justify-center select-none">
            <div className="w-full border-t-2 border-[#dc2626]" />
            <span className="absolute px-4 py-1 bg-[#eff6ff] text-[#dc2626] border-2 border-[#dc2626] rounded-full text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <ArrowDown className="w-3.5 h-3.5 text-[#dc2626] animate-bounce" />
              <span>Type the above texts below</span>
            </span>
          </div>

          {/* ==================== BOX 2: BOTTOM LIVE INPUT BOX ==================== */}
          <div 
            id="sonma-input-container-card"
            className="relative rounded-md bg-[#fefced] border-2 border-[#94a3b8] focus-within:border-[#1e40af] shadow-sm flex flex-col overflow-hidden transition-all"
          >
            {/* Bottom Box Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#fef9c3]/60 border-b border-[#e2e8f0] text-xs font-serif text-[#1e3a8a]">
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${isStarted && !isPaused ? 'bg-[#10b981] animate-pulse' : 'bg-[#f59e0b]'}`} />
                <span className="uppercase tracking-wider text-[11px]">Live Typing Input Box</span>
              </div>
              <div className="text-[11px] font-mono text-[#64748b]">
                {cursorIndex} / {charDetails.length} ({progressPercent}%)
              </div>
            </div>

            {/* Dedicated Typing Area (Classic Serif, ~19px, line-height 1.8) */}
            <div
              id="sonma-typing-input-area"
              ref={containerRef}
              onPaste={handlePaste}
              tabIndex={0}
              className="p-4 sm:p-5 h-[155px] sm:h-[175px] overflow-y-auto font-serif text-[19px] leading-[1.8] text-[#111827] text-left select-none outline-none cursor-text scrollbar-clean scroll-smooth"
              style={{ wordBreak: 'normal', overflowWrap: 'break-word', fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
            >
              {cursorIndex === 0 && !isStarted ? (
                <div className="flex flex-col items-center justify-center h-full text-[#64748b] text-base italic pointer-events-none">
                  <Keyboard className="w-8 h-8 text-[#94a3b8] mb-2" />
                  <span>Click here or press any key to start the official speed test...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {charDetails.slice(0, Math.max(cursorIndex + 1, 1)).map((detail, index) => {
                    const isCurrent = index === cursorIndex;
                    // Clean standard neutral body text color as typed, exactly like authentic Sonma Typing Expert (no live red highlights)
                    const charStyle = 'text-[#111827]';

                    if (detail.expected === '\n') {
                      return (
                        <span
                          key={index}
                          ref={isCurrent ? activeCharRef : null}
                          className="block my-1.5 border-t border-dashed border-[#cbd5e1] pt-1"
                        >
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans ${
                            isCurrent ? 'bg-[#1e40af] text-white font-bold' : 'bg-[#e2e8f0] text-[#64748b]'
                          }`}>
                            ↵ Paragraph Break
                          </span>
                        </span>
                      );
                    }

                    return (
                      <span
                        key={index}
                        ref={isCurrent ? activeCharRef : null}
                        className={`relative inline-block ${charStyle}`}
                      >
                        {isCurrent && (
                          <span 
                            id="sonma-typing-caret"
                            className="inline-block w-[2px] h-[1.15em] bg-[#1e40af] animate-pulse align-middle mx-0.5" 
                          />
                        )}
                        {detail.typed !== undefined 
                          ? (detail.typed === ' ' ? '\u00A0' : detail.typed) 
                          : (detail.expected === ' ' ? '\u00A0' : detail.expected)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Paused Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-[#fefced]/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 space-y-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600">
                  <Pause className="w-5 h-5" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-[#1e293b]">Test Paused</h4>
                  <p className="text-xs text-[#64748b]">Timer is frozen. Keystrokes are temporarily locked.</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePause(); }}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Test (Space)</span>
                </button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="h-1 w-full bg-[#e2e8f0] overflow-hidden">
              <div 
                className="h-full bg-[#1e40af] transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ==================== DEDICATED BOTTOM STATS & CONTROL DASHBOARD PANEL ==================== */}
        <div 
          id="sonma-bottom-dashboard-panel"
          className="w-full bg-[#dcfce7] border-t-2 border-[#86efac] text-[#065f46] p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none"
        >
          {/* Left: Candidate Info */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#065f46] text-white flex items-center justify-center shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-[#047857] tracking-wider block">Candidate Name</span>
                <p className="text-xs sm:text-sm font-bold text-[#065f46] truncate max-w-[180px] sm:max-w-[220px]">
                  {formattedCandidateName}
                </p>
              </div>
            </div>
            {onExit && (
              <button
                id="sonma-close-btn"
                onClick={(e) => { e.stopPropagation(); onExit(); }}
                title="Exit Exam Arena"
                className="md:hidden p-1.5 rounded-lg bg-white/70 hover:bg-rose-100 text-[#065f46] hover:text-rose-600 border border-[#86efac] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Center: Prominent Live Telemetry Widgets & Countdown Clock */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full md:w-auto">
            {/* Digital Countdown / Elapsed Time Clock */}
            <div 
              id="sonma-digital-countdown"
              className="bg-white/95 border-2 border-[#86efac] rounded-xl px-4 py-1.5 text-center shadow-xs flex items-center gap-2.5 min-w-[130px]"
            >
              <Clock className="w-4 h-4 text-[#047857] shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-[#047857] tracking-wider block leading-tight">
                  Remaining Time
                </span>
                <span className={`text-xl sm:text-2xl font-extrabold font-mono tracking-wider leading-none ${
                  isTimedMode && timeLeft <= 10 && isStarted && !isFinished
                    ? 'text-[#dc2626] animate-pulse'
                    : 'text-[#065f46]'
                }`}>
                  {isTimedMode ? formatDuration(timeLeft) : formatDuration(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Live Net WPM */}
            <div className="bg-white/95 border-2 border-[#86efac] rounded-xl px-3.5 py-1.5 text-center shadow-xs min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#047857] tracking-wider block leading-tight">
                Net WPM
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#065f46] leading-none">
                {Math.round(liveNetWpm)}
              </span>
            </div>

            {/* Live Accuracy % */}
            <div className="bg-white/95 border-2 border-[#86efac] rounded-xl px-3.5 py-1.5 text-center shadow-xs min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#047857] tracking-wider block leading-tight">
                Accuracy
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#065f46] leading-none">
                {liveAccuracy}%
              </span>
            </div>

            {/* Chars / Progress */}
            <div className="hidden lg:block bg-white/95 border-2 border-[#86efac] rounded-xl px-3.5 py-1.5 text-center shadow-xs min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#047857] tracking-wider block leading-tight">
                Progress
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#065f46] leading-snug">
                {cursorIndex}/{charDetails.length} ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Right: Action Buttons (Pause, Restart, Sound, Exit) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Pause / Resume */}
            <button
              id="sonma-pause-btn"
              onClick={(e) => { e.stopPropagation(); togglePause(); }}
              disabled={!isStarted || isFinished}
              title={isPaused ? 'Resume Test (Space)' : 'Pause Test'}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${
                isPaused
                  ? 'bg-[#10b981] hover:bg-[#059669] text-white'
                  : 'bg-white hover:bg-[#f0fdf4] text-[#065f46] border border-[#86efac]'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* New / Restart */}
            <button
              id="sonma-restart-btn"
              onClick={(e) => { e.stopPropagation(); handleManualRestart(); }}
              title="Restart Assessment (Esc / Tab)"
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#f0fdf4] text-[#065f46] border border-[#86efac] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            {/* Sound Keystrokes Toggle */}
            <button
              id="sonma-sound-toggle-btn"
              onClick={(e) => { e.stopPropagation(); setSoundEnabled(!settings.soundEnabled); }}
              title="Toggle Keystroke Audio"
              className="p-2 rounded-xl bg-white hover:bg-[#f0fdf4] text-[#065f46] border border-[#86efac] text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#059669]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Exit Button (Desktop) */}
            {onExit && (
              <button
                id="sonma-close-btn-desktop"
                onClick={(e) => { e.stopPropagation(); onExit(); }}
                title="Exit Exam Arena"
                className="hidden md:flex p-2 rounded-xl bg-white/80 hover:bg-rose-100 text-[#065f46] hover:text-rose-600 border border-[#86efac] transition-colors cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== STANDARD / LESSON LAYOUT ====================
  return (
    <div 
      id="typing-engine-wrapper" 
      onClick={() => containerRef.current?.focus()}
      className={`w-full max-w-5xl mx-auto ${
        isLessonMode 
          ? 'space-y-2 sm:space-y-3 [@media(max-height:820px)]:space-y-1.5' 
          : 'space-y-4 sm:space-y-5'
      } select-none`}
    >
      {/* Top Controls & KPI Dashboard Bar */}
      <div 
        id="typing-stats-dashboard"
        className={`w-full bg-slate-100 dark:bg-slate-950/90 border border-slate-300 dark:border-slate-800 rounded-xl sm:rounded-2xl ${
          isLessonMode 
            ? 'p-2.5 sm:p-3.5 [@media(max-height:820px)]:p-2' 
            : 'p-3 sm:p-4'
        } shadow-md dark:shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 transition-colors`}
      >
        {/* Left: Mode / Lesson Info */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {lesson ? lesson.title : mode.replace('_', ' ').toUpperCase()}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {lesson ? `Target: ${lesson.requiredWpm} WPM • ${lesson.requiredAccuracy}% Acc` : 'Type any key to begin'}
            </p>
          </div>
        </div>

        {/* Center: Live Stats Badges */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Timer */}
          <div className="flex items-center gap-1">
            <TimerIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <div className="text-right">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block leading-none">Time</span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-800 dark:text-slate-100">
                {isTimedMode ? formatDuration(timeLeft) : formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />

          {/* Net WPM */}
          <div className="flex items-center gap-1">
            <div className="text-right">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block leading-none">Net WPM</span>
              <span className="text-sm sm:text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">{Math.round(liveNetWpm)}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />

          {/* Accuracy */}
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <div className="text-right">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block leading-none">Accuracy</span>
              <span className="text-sm sm:text-base font-mono font-bold text-cyan-600 dark:text-cyan-400">{liveAccuracy}%</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />

          {/* Progress */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block leading-none">Progress</span>
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
          </div>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1">
          {/* Display Mode Toggle */}
          <button
            id="toggle-display-style-btn"
            onClick={(e) => { e.stopPropagation(); setDisplayStyle(prev => prev === 'cards' ? 'continuous' : 'cards'); }}
            title={displayStyle === 'cards' ? 'Switch to Continuous Text Flow' : 'Switch to Compact Character Boxes'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
          >
            {displayStyle === 'cards' ? <LayoutGrid className="w-3 h-3 text-blue-500" /> : <AlignLeft className="w-3 h-3 text-emerald-500" />}
            <span className="hidden sm:inline">{displayStyle === 'cards' ? 'Boxes' : 'Flow'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="engine-theme-toggle-btn"
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={(e) => { e.stopPropagation(); setSoundEnabled(!settings.soundEnabled); }}
            title={settings.soundEnabled ? 'Mute Key Sound' : 'Enable Key Sound'}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors shadow-2xs ${
              settings.soundEnabled 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Keyboard Toggle */}
          <button
            id="toggle-keyboard-btn"
            onClick={(e) => { e.stopPropagation(); setShowVirtualKeyboard(!settings.showVirtualKeyboard); }}
            title={settings.showVirtualKeyboard ? 'Hide On-Screen Keyboard' : 'Show On-Screen Keyboard'}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors shadow-2xs ${
              settings.showVirtualKeyboard 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Blind Mode Toggle */}
          <button
            id="toggle-blind-mode-btn"
            onClick={(e) => { e.stopPropagation(); setBlindModeActive(!blindModeActive); }}
            title={blindModeActive ? 'Disable Blind Mode' : 'Enable Blind Mode'}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors shadow-2xs ${
              blindModeActive 
                ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
            }`}
          >
            {blindModeActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Manual Restart */}
          <button
            id="restart-test-btn"
            onClick={(e) => { e.stopPropagation(); handleManualRestart(); }}
            title="Restart Test (or press Tab / Esc)"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Paste Blocked Toast */}
      {pasteBlockedWarning && (
        <div 
          id="paste-warning-banner"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs font-medium animate-bounce shadow-md"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Clipboard paste is disabled to ensure authentic keystroke tracking & accuracy metrics.</span>
        </div>
      )}

      {/* Target Key Prompt / Finger Guideline */}
      {(settings.showVirtualKeyboard || mode === 'lesson') && (
        <div 
          id="typing-target-key-guide"
          className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs text-xs"
        >
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Type:</span>
            <span className="font-mono font-extrabold px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 text-xs sm:text-sm shadow-2xs">
              {fingerGuide.targetDisplay}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Finger:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {fingerGuide.handName} • {fingerGuide.fingerName}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
            <span className="hidden md:inline">Home Row:</span>
            <span>ASDF JKL;</span>
          </div>
        </div>
      )}

      {/* Main Interactive Typing Container */}
      <div
        id="typing-focus-container"
        ref={containerRef}
        onPaste={handlePaste}
        className={`
          relative w-full ${
            isLessonMode 
              ? 'min-h-[90px] max-h-[140px] sm:max-h-[175px] lg:max-h-[200px] [@media(max-height:820px)]:max-h-[120px] [@media(max-height:740px)]:max-h-[95px] p-3 sm:p-4 [@media(max-height:820px)]:p-2.5' 
              : 'min-h-[150px] max-h-[240px] sm:max-h-[280px] p-4 sm:p-6'
          }
          overflow-y-auto scrollbar-clean scroll-smooth
          bg-white dark:bg-slate-950/95 
          border-2 rounded-xl sm:rounded-2xl
          shadow-md dark:shadow-2xl transition-all duration-150
          select-none outline-none cursor-text
          ${isStarted && !isFinished ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 dark:border-slate-800'}
        `}
        tabIndex={0}
      >
        {!isStarted && (
          <div className="absolute top-2.5 right-3 text-[11px] font-sans text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 pointer-events-none font-semibold">
            Press any key to start typing
          </div>
        )}

        {/* 1. COMPACT CHARACTER BOXES (Learn / Drill view) */}
        {displayStyle === 'cards' ? (
          <div 
            id="compact-character-boxes-grid"
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 py-1"
          >
            {charDetails.map((detail, index) => {
              const isCurrent = index === cursorIndex;
              const isSpace = detail.expected === ' ';
              const isNewline = detail.expected === '\n';

              if (isNewline) {
                return (
                  <div key={index} className="w-full my-1.5 border-t border-dashed border-slate-300 dark:border-slate-800 flex items-center pt-1">
                    <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-800/60 border border-white/10 px-2 py-0.5 rounded">
                      ↵ New Paragraph
                    </span>
                  </div>
                );
              }

              if (isSpace) {
                return (
                  <div
                    key={index}
                    ref={isCurrent ? activeCharRef : null}
                    id={`letter-space-card-${index}`}
                    className={`
                      relative flex items-center justify-center
                      ${cardSizes.spaceBox} rounded-lg ${cardSizes.spaceText} uppercase font-mono font-bold
                      transition-all duration-75 select-none
                      ${
                        detail.state === 'correct' || detail.state === 'corrected'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : detail.state === 'incorrect'
                          ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-400 dark:border-rose-600 text-rose-600 dark:text-rose-400'
                          : isCurrent
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 ring-2 ring-cyan-400/40 scale-105 shadow-2xs'
                          : 'bg-slate-800/60 border border-dashed border-white/10 text-slate-300'
                      }
                    `}
                  >
                    <span>SPACE</span>
                    {(detail.state === 'correct' || detail.state === 'corrected') && !blindModeActive && (
                      <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3] absolute top-0.5 right-0.5" />
                    )}
                    {detail.state === 'incorrect' && !blindModeActive && (
                      <span className="text-[8px] font-extrabold text-rose-500 absolute top-0.5 right-0.5">✕</span>
                    )}
                    {renderCardCaret(isCurrent)}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  id={`letter-card-${index}`}
                  className={`
                    relative flex items-center justify-center
                    ${cardSizes.charBox} rounded-lg ${cardSizes.charText} font-mono font-bold
                    transition-all duration-75 select-none shadow-2xs
                    ${
                      detail.state === 'correct' || detail.state === 'corrected'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400'
                        : detail.state === 'incorrect'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-400 dark:border-rose-600 text-rose-600 dark:text-rose-400'
                        : isCurrent
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-300 ring-2 ring-cyan-400/40 scale-105 shadow-2xs'
                        : 'bg-slate-800/60 border border-white/10 text-slate-100'
                    }
                  `}
                >
                  <span className="leading-none">{detail.expected}</span>
                  {(detail.state === 'correct' || detail.state === 'corrected') && !blindModeActive && (
                    <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3] absolute top-0.5 right-0.5" />
                  )}
                  {detail.state === 'incorrect' && !blindModeActive && (
                    <span className="text-[8px] font-extrabold text-rose-500 absolute top-0.5 right-0.5">✕</span>
                  )}
                  {renderCardCaret(isCurrent)}
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. CONTINUOUS STREAMING MONOSPACE TEXT (Practice & Drill view) */
          <div 
            id="typing-continuous-text-display"
            className={`font-mono text-left tracking-normal whitespace-pre-wrap select-none outline-none py-1.5 ${continuousFontSizeClass}`}
            style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
          >
            {charDetails.map((detail, index) => {
              const isCurrent = index === cursorIndex;
              let charStyle = 'text-slate-700 dark:text-slate-300';

              if (!blindModeActive) {
                if (detail.state === 'correct' || detail.state === 'corrected') {
                  charStyle = 'text-emerald-600 dark:text-emerald-400 font-semibold';
                } else if (detail.state === 'incorrect') {
                  charStyle = 'text-red-500 dark:text-red-400 bg-red-500/10 underline decoration-red-500 font-semibold';
                }
              }

              if (detail.expected === '\n') {
                return (
                  <span
                    key={index}
                    ref={isCurrent ? activeCharRef : null}
                    className="block my-2.5 border-t border-dashed border-slate-300 dark:border-slate-800 pt-1"
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono select-none transition-colors ${
                        !blindModeActive && (detail.state === 'correct' || detail.state === 'corrected')
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold'
                          : !blindModeActive && detail.state === 'incorrect'
                          ? 'bg-red-500/25 text-red-600 dark:text-red-300 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      } ${isCurrent ? 'ring-2 ring-blue-500 font-bold text-slate-900 dark:text-slate-100' : ''}`}
                    >
                      <span className="font-bold text-blue-500">↵</span>
                      <span>Next Paragraph (Enter / Space)</span>
                    </span>
                  </span>
                );
              }

              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative inline-block transition-colors duration-75 ${charStyle}`}
                >
                  {renderContinuousCaret(isCurrent)}
                  {detail.expected === ' ' ? (detail.state === 'incorrect' ? '␣' : '\u00A0') : detail.expected}
                </span>
              );
            })}
          </div>
        )}

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Virtual Keyboard (Only in standard/learn/practice mode) */}
      {!isSonmaLayout && settings.showVirtualKeyboard && (
        <VirtualKeyboard 
          currentExpectedChar={currentExpectedChar} 
          onKeyPress={(k) => processKeyInput(k)}
          hideFingerBadge={true}
          compact={isLessonMode}
        />
      )}
    </div>
  );
};

