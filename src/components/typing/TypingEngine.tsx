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
  AlignLeft
} from 'lucide-react';

interface TypingEngineProps {
  practiceText: string;
  mode: TestMode;
  targetDurationSeconds?: number; // for timed tests (15, 30, 60, 120, 300, 600)
  lesson?: Lesson;
  onComplete: (result: TypingResult) => void;
  onRestart?: () => void;
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
  onComplete,
  onRestart,
}) => {
  const { settings, setTheme, setSoundEnabled, setShowVirtualKeyboard } = useSettings();
  const { user } = useAuth();

  const isTimedMode = Boolean(targetDurationSeconds && targetDurationSeconds > 0);
  const initialTimeLeft = targetDurationSeconds || 0;

  // View style: Learn mode defaults to compact character boxes; Practice and Test default to continuous text flow
  const isDefaultCards = mode === 'lesson';
  const [displayStyle, setDisplayStyle] = useState<'cards' | 'continuous'>(isDefaultCards ? 'cards' : 'continuous');

  // Timing refs
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLDivElement & HTMLSpanElement>(null);

  // State
  const [charDetails, setCharDetails] = useState<CharDetail[]>(() => 
    practiceText.split('').map(char => ({ expected: char, state: 'untyped' }))
  );
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [pasteBlockedWarning, setPasteBlockedWarning] = useState<boolean>(false);
  const [blindModeActive, setBlindModeActive] = useState<boolean>(settings.blindMode);

  // Keystroke statistics trackers
  const totalKeystrokesRef = useRef<number>(0);
  const correctKeystrokesRef = useRef<number>(0);
  const incorrectKeystrokesRef = useRef<number>(0);
  const backspaceCountRef = useRef<number>(0);
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

  // Live calculation states for smooth UI feedback
  const [liveGrossWpm, setLiveGrossWpm] = useState<number>(0);
  const [liveNetWpm, setLiveNetWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  // Viewport Auto-Center & Auto-Focus on mount or mode change (isolated to lesson mode)
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

  // Finish test callback
  const finishTest = useCallback(() => {
    if (isFinishedRef.current) return;
    setIsFinished(true);
    isFinishedRef.current = true;

    const endTimestamp = performance.now();
    endTimeRef.current = endTimestamp;

    const startTimestamp = startTimeRef.current || endTimestamp - 1000;
    const finalElapsedMs = Math.max(500, endTimestamp - startTimestamp);
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

    const isLessonPassed = lesson ? (netWPM >= lesson.requiredWpm && accuracy >= lesson.requiredAccuracy) : true;
    const xpEarned = calculateXpEarned(netWPM, accuracy, finalElapsedSeconds, Boolean(lesson), isLessonPassed);

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
    };

    // Save score to Firestore if user is authenticated
    if (user && user.uid && !user.isGuest) {
      saveTypingScoreToFirestore({
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Typist',
        userEmail: user.email || '',
        wpm: result.netWpm,
        rawWpm: result.grossWpm,
        accuracy: result.accuracy,
        timeTaken: result.durationSeconds,
        mode: result.mode
      });
    }

    onComplete(result);
  }, [isTimedMode, targetDurationSeconds, lesson, mode, user, onComplete]);

  // Restart / Reset
  const handleManualRestart = useCallback(() => {
    startTimeRef.current = null;
    endTimeRef.current = null;
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    incorrectKeystrokesRef.current = 0;
    backspaceCountRef.current = 0;
    totalErrorsEncounteredRef.current = 0;
    correctedErrorsRef.current = 0;
    mistakePositionsRef.current.clear();
    usedParagraphIndicesRef.current = [];

    setCharDetails(practiceText.split('').map(char => ({ expected: char, state: 'untyped' })));
    setCursorIndex(0);
    setIsStarted(false);
    setIsFinished(false);
    isStartedRef.current = false;
    isFinishedRef.current = false;
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
    isStartedRef.current = false;
    isFinishedRef.current = false;
    setTimeLeft(targetDurationSeconds || 0);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    endTimeRef.current = null;
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    incorrectKeystrokesRef.current = 0;
    backspaceCountRef.current = 0;
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
      if (!startTimeRef.current) return;
      const now = performance.now();
      const elapsedMs = now - startTimeRef.current;
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

    // Ignore modifier keys
    if ([
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ArrowUp', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Insert',
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
    finishTest
  ]);

  // Global Window Keydown Listener: Ensures reliable input across all modes
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

      {/* Target Key Prompt / Finger Guideline (Positioned cleanly ABOVE the main typing text display card) */}
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
          /* 2. CONTINUOUS STREAMING MONOSPACE TEXT (Practice & Test view) */
          <div 
            id="typing-continuous-text-display"
            className={`font-mono text-left tracking-normal whitespace-pre-wrap select-none outline-none py-1.5 ${continuousFontSizeClass}`}
            style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
          >
            {charDetails.map((detail, index) => {
              const isCurrent = index === cursorIndex;
              // Untyped / Upcoming text: solid, clearly visible dark slate / light slate
              let charStyle = 'text-slate-700 dark:text-slate-300';

              if (!blindModeActive) {
                if (detail.state === 'correct' || detail.state === 'corrected') {
                  // Correctly Typed: vibrant green
                  charStyle = 'text-emerald-600 dark:text-emerald-400 font-semibold';
                } else if (detail.state === 'incorrect') {
                  // Incorrect / Error: bright red (keeping existing error handling untouched)
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
                  {/* Dynamic Active Caret Cursor */}
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

      {/* Clean Modular Virtual Keyboard */}
      {settings.showVirtualKeyboard && (
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
