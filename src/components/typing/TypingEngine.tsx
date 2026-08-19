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
import { auth, saveTypingScoreToFirestore } from '../../services/firebase';
import { soundSynthesizer } from '../../utils/audio';
import { VirtualKeyboard } from './VirtualKeyboard';
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
  EyeOff 
} from 'lucide-react';

interface TypingEngineProps {
  practiceText: string;
  mode: TestMode;
  targetDurationSeconds?: number; // for timed tests (15, 30, 60, 120)
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
  const { settings, setSoundEnabled, setShowVirtualKeyboard } = useSettings();
  const { user } = useAuth();

  const isTimedMode = Boolean(targetDurationSeconds && targetDurationSeconds > 0);
  const initialTimeLeft = targetDurationSeconds || 0;

  // Refs for high-precision timing
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

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

  // Refs to avoid stale closures in timer
  const cursorIndexRef = useRef(cursorIndex);
  cursorIndexRef.current = cursorIndex;
  const charDetailsRef = useRef(charDetails);
  charDetailsRef.current = charDetails;

  // Live calculation states for smooth UI
  const [liveGrossWpm, setLiveGrossWpm] = useState<number>(0);
  const [liveNetWpm, setLiveNetWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  // Keep active character scrolled into view comfortably without glitching on idle or initial render
  useEffect(() => {
    if (!isStarted || cursorIndex === 0) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      return;
    }

    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const charElem = activeCharRef.current;
      const charTop = charElem.offsetTop - container.offsetTop;
      
      // Only scroll when typing advances beyond the upper visible region
      if (charTop > container.scrollTop + container.clientHeight - 90) {
        container.scrollTo({
          top: charTop - 60,
          behavior: 'smooth'
        });
      } else if (charTop < container.scrollTop + 30) {
        container.scrollTo({
          top: Math.max(0, charTop - 30),
          behavior: 'smooth'
        });
      }
    }
  }, [cursorIndex, isStarted]);

  // Finish test callback
  const finishTest = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);

    const endTimestamp = performance.now();
    endTimeRef.current = endTimestamp;

    const startTimestamp = startTimeRef.current || endTimestamp - 1000;
    const finalElapsedMs = Math.max(500, endTimestamp - startTimestamp);
    const finalElapsedSeconds = isTimedMode && targetDurationSeconds
      ? targetDurationSeconds
      : Number((finalElapsedMs / 1000).toFixed(1));

    // Calculate uncorrected errors from current charDetails
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
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.uid,
      mode,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
      durationSeconds: finalElapsedSeconds,
      elapsedMs: Math.round(finalElapsedMs),
      grossWpm: grossWPM,
      netWpm: netWPM,
      grossWPM,
      netWPM,
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

    // Save to Firestore typing_scores collection if user is logged in (auth.currentUser)
    if (auth && auth.currentUser) {
      saveTypingScoreToFirestore({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || user.displayName || 'Typing Master',
        userEmail: auth.currentUser.email || user.email || '',
        wpm: netWPM,
        rawWpm: grossWPM,
        accuracy: accuracy,
        timeTaken: finalElapsedSeconds,
        mode: mode,
      }).catch((err) => {
        console.warn('Could not save score to Firestore:', err);
      });
    }

    onComplete(result);
  }, [isFinished, isTimedMode, targetDurationSeconds, lesson, user.uid, user.displayName, user.email, mode, onComplete]);

  const finishTestRef = useRef(finishTest);
  finishTestRef.current = finishTest;

  // Master Countdown Timer Loop: starts ONLY when user types first key, ticks and stops at 0
  useEffect(() => {
    if (!isStarted || isFinished) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!startTimeRef.current) return;
      const now = performance.now();
      const elapsedMs = now - startTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsedSeconds(elapsedSec);

      if (isTimedMode && targetDurationSeconds) {
        const remaining = Math.max(0, targetDurationSeconds - elapsedSec);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          window.clearInterval(intervalId);
          finishTestRef.current();
          return;
        }
      }

      // Live metrics update
      const totalChars = cursorIndexRef.current;
      const correctChars = correctKeystrokesRef.current;
      let currentUncorrected = 0;
      charDetailsRef.current.forEach(c => {
        if (c.state === 'incorrect') currentUncorrected++;
      });

      const currentGross = calculateGrossWPM(totalChars, elapsedMs);
      const currentNet = calculateNetWPM(correctChars, currentUncorrected, elapsedMs);
      const currentAcc = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current);

      setLiveGrossWpm(currentGross);
      setLiveNetWpm(currentNet);
      setLiveAccuracy(currentAcc);
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isStarted, isFinished, isTimedMode, targetDurationSeconds]);

  // Handle Keystroke
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent holding key down duplicate stat generation (except backspace)
    if (e.repeat && e.key !== 'Backspace') {
      e.preventDefault();
      return;
    }

    // Intercept Paste hotkeys (Ctrl+V / Cmd+V)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      setPasteBlockedWarning(true);
      setTimeout(() => setPasteBlockedWarning(false), 2500);
      return;
    }

    // Ignore function keys, control modifiers, alt modifiers
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Tab' || e.key === 'CapsLock' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;
    if (e.key.startsWith('F') && e.key.length > 1) return; // F1-F12

    if (isFinished) return;

    // Start countdown timer on first genuine keystroke
    if (!isStarted) {
      startTimeRef.current = performance.now();
      setIsStarted(true);
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (cursorIndex === 0) return;

      backspaceCountRef.current += 1;
      const prevIndex = cursorIndex - 1;
      const prevChar = charDetails[prevIndex];

      // Check if user is correcting a mistake
      if (prevChar.state === 'incorrect' || mistakePositionsRef.current.has(prevIndex)) {
        correctedErrorsRef.current += 1;
      }

      setCharDetails(prev => {
        const next = [...prev];
        next[prevIndex] = {
          ...next[prevIndex],
          typed: undefined,
          state: 'untyped',
        };
        return next;
      });

      setCursorIndex(prevIndex);
      return;
    }

    // Accept single character keys or Enter key (which represents newline/paragraph breaks)
    const isAcceptableKey = e.key.length === 1 || e.key === 'Enter';
    if (!isAcceptableKey) return;

    e.preventDefault();
    totalKeystrokesRef.current += 1;

    const expectedChar = charDetails[cursorIndex]?.expected;
    if (expectedChar === undefined) return;

    // If expected is newline, accept Enter or Space
    let isMatch = false;
    if (expectedChar === '\n') {
      isMatch = e.key === 'Enter' || e.key === ' ';
    } else {
      isMatch = e.key === expectedChar;
    }

    if (isMatch) {
      correctKeystrokesRef.current += 1;
      const hadPreviousMistake = mistakePositionsRef.current.has(cursorIndex);
      soundSynthesizer.playKeySound(settings.soundEnabled ? settings.soundType : 'off', settings.soundVolume, false);

      setCharDetails(prev => {
        const next = [...prev];
        next[cursorIndex] = {
          ...next[cursorIndex],
          typed: e.key === 'Enter' ? '\n' : e.key,
          state: hadPreviousMistake ? 'corrected' : 'correct',
        };
        return next;
      });
    } else {
      incorrectKeystrokesRef.current += 1;
      totalErrorsEncounteredRef.current += 1;
      mistakePositionsRef.current.add(cursorIndex);
      soundSynthesizer.playKeySound(settings.soundEnabled ? settings.soundType : 'off', settings.soundVolume, true);

      setCharDetails(prev => {
        const next = [...prev];
        next[cursorIndex] = {
          ...next[cursorIndex],
          typed: e.key,
          state: 'incorrect',
        };
        return next;
      });
    }

    const nextIndex = cursorIndex + 1;
    setCursorIndex(nextIndex);

    // Continuous Content: If approaching the end during a timed test, seamlessly append next natural paragraphs
    if (isTimedMode && !isFinished && nextIndex >= charDetails.length - 120) {
      const extra = getAdditionalNaturalParagraphs(3, usedParagraphIndicesRef.current);
      if (extra.text) {
        usedParagraphIndicesRef.current.push(...extra.newIndices);
        const extraChars: CharDetail[] = ('\n' + extra.text).split('').map(char => ({
          expected: char,
          state: 'untyped',
        }));
        setCharDetails(prev => [...prev, ...extraChars]);
      }
    }

    // If reached end of text in paragraph or lesson mode, finish
    if (nextIndex >= charDetails.length) {
      if (!isTimedMode) {
        setTimeout(() => finishTestRef.current(), 50);
      }
    }
  }, [isFinished, isStarted, cursorIndex, charDetails, settings.soundEnabled, settings.soundType, settings.soundVolume, isTimedMode]);

  // Bind global keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Intercept Paste events on window
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setPasteBlockedWarning(true);
      setTimeout(() => setPasteBlockedWarning(false), 2500);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Reset Engine (internal state reset)
  const resetEngine = useCallback(() => {
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
    setTimeLeft(targetDurationSeconds || 0);
    setElapsedSeconds(0);
    setLiveGrossWpm(0);
    setLiveNetWpm(0);
    setLiveAccuracy(100);
    setPasteBlockedWarning(false);
  }, [practiceText, targetDurationSeconds]);

  // Initialize text and timer on prop change
  useEffect(() => {
    resetEngine();
  }, [practiceText, mode, targetDurationSeconds, resetEngine]);

  // Explicit user manual restart
  const handleManualRestart = () => {
    resetEngine();
    if (onRestart) {
      onRestart();
    }
  };

  const currentExpectedChar = charDetails[cursorIndex]?.expected || '';
  const progressPercent = Math.min(100, Math.round((cursorIndex / charDetails.length) * 100));

  // Font size classes
  const fontSizeClass = {
    sm: 'text-lg leading-relaxed',
    md: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
    lg: 'text-2xl sm:text-3xl leading-loose',
    xl: 'text-3xl sm:text-4xl leading-loose',
  }[settings.fontSize || 'md'];

  // Cursor style class
  const getCaretClass = () => {
    switch (settings.cursorStyle) {
      case 'block':
        return 'bg-emerald-500/40 text-emerald-300 rounded-sm animate-pulse';
      case 'underline':
        return 'border-b-2 border-emerald-400 animate-pulse';
      case 'line':
      default:
        return 'border-l-2 border-emerald-400 pl-[1px] -ml-[1px] animate-pulse';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      {/* Top Header Metrics Bar */}
      <div 
        id="typing-engine-stats-bar" 
        className="w-full bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
      >
        {/* Left: Mode / Lesson Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              {lesson ? lesson.title : mode.replace('_', ' ').toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400">
              {lesson ? `Target: ${lesson.requiredWpm} WPM • ${lesson.requiredAccuracy}% Acc` : 'Type text to begin timer'}
            </p>
          </div>
        </div>

        {/* Center: Live Stats Badges */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Time</span>
              <span className="text-lg font-mono font-bold text-slate-100">
                {isTimedMode ? formatDuration(timeLeft) : formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Net WPM */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Net WPM</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{Math.round(liveNetWpm)}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Accuracy */}
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Accuracy</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{liveAccuracy}%</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Progress */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Progress</span>
            <span className="text-sm font-mono font-semibold text-slate-300">{progressPercent}%</span>
          </div>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!settings.soundEnabled)}
            title={settings.soundEnabled ? 'Mute Key Sound' : 'Enable Key Sound'}
            className={`p-2 rounded-lg border transition-colors ${
              settings.soundEnabled 
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="toggle-keyboard-btn"
            onClick={() => setShowVirtualKeyboard(!settings.showVirtualKeyboard)}
            title={settings.showVirtualKeyboard ? 'Hide On-Screen Keyboard' : 'Show On-Screen Keyboard'}
            className={`p-2 rounded-lg border transition-colors ${
              settings.showVirtualKeyboard 
                ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            id="toggle-blind-mode-btn"
            onClick={() => setBlindModeActive(!blindModeActive)}
            title={blindModeActive ? 'Disable Blind Mode' : 'Enable Blind Mode (Hide Live Errors)'}
            className={`p-2 rounded-lg border transition-colors ${
              blindModeActive 
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {blindModeActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            id="restart-test-btn"
            onClick={handleManualRestart}
            title="Restart Test (or press Tab / Esc)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Paste Blocked Warning Toast */}
      {pasteBlockedWarning && (
        <div 
          id="paste-warning-banner"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-medium animate-bounce shadow-md"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Clipboard paste is disabled to ensure authentic keystroke tracking & accuracy metrics.</span>
        </div>
      )}

      {/* Main Interactive Typing Area */}
      <div
        id="typing-focus-container"
        ref={containerRef}
        className={`
          relative w-full min-h-[220px] max-h-[300px] overflow-y-auto 
          bg-slate-900/90 dark:bg-slate-950/95 
          border-2 rounded-2xl p-6 sm:p-8 
          shadow-2xl transition-all duration-200
          font-mono select-none outline-none
          ${isStarted && !isFinished ? 'border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-slate-800'}
        `}
        tabIndex={0}
      >
        {/* Helper prompt when not yet started */}
        {!isStarted && (
          <div className="absolute top-3 right-4 text-xs font-sans text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 pointer-events-none">
            Start typing any key to begin
          </div>
        )}

        {/* Text stream display */}
        <div 
          id="typing-text-display"
          className={`font-mono text-left leading-relaxed sm:leading-loose tracking-normal whitespace-pre-wrap select-none outline-none ${fontSizeClass}`}
          style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
        >
          {charDetails.map((detail, index) => {
            const isCurrent = index === cursorIndex;
            let charColor = 'text-slate-400 dark:text-slate-500'; // untyped readable neutral

            if (!blindModeActive) {
              if (detail.state === 'correct') {
                charColor = 'text-slate-100 dark:text-white font-medium';
              } else if (detail.state === 'corrected') {
                charColor = 'text-emerald-400 font-medium';
              } else if (detail.state === 'incorrect') {
                charColor = 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 rounded-xs';
              }
            } else if (detail.state !== 'untyped') {
              charColor = 'text-slate-200';
            }

            if (detail.expected === '\n') {
              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className="block my-4 sm:my-5 border-t border-dashed border-slate-800/80 pt-2"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono select-none transition-colors ${
                      !blindModeActive && (detail.state === 'correct' || detail.state === 'corrected')
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                        : !blindModeActive && detail.state === 'incorrect'
                        ? 'bg-rose-500/25 text-rose-300 font-semibold ring-1 ring-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    } ${isCurrent ? getCaretClass() : ''}`}
                  >
                    <span className="font-bold text-emerald-400">↵</span>
                    <span className="text-[11px]">Next Paragraph (Enter / Space)</span>
                  </span>
                </span>
              );
            }

            if (detail.expected === ' ') {
              return (
                <span
                  key={index}
                  ref={isCurrent ? activeCharRef : null}
                  className={`relative inline-block transition-colors duration-75 ${charColor} ${
                    isCurrent ? getCaretClass() : ''
                  } ${detail.state === 'incorrect' ? 'bg-rose-500/30 text-rose-400 underline decoration-rose-500' : ''}`}
                >
                  {detail.state === 'incorrect' ? '␣' : '\u00A0'}
                </span>
              );
            }

            return (
              <span
                key={index}
                ref={isCurrent ? activeCharRef : null}
                className={`relative inline-block transition-colors duration-75 ${charColor} ${
                  isCurrent ? getCaretClass() : ''
                }`}
              >
                {detail.expected}
              </span>
            );
          })}
        </div>

        {/* Progress bar at bottom of typing area */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/80 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Visual Keyboard if enabled */}
      {settings.showVirtualKeyboard && (
        <VirtualKeyboard currentExpectedChar={currentExpectedChar} />
      )}
    </div>
  );
};
