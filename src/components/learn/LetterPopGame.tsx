import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, PageRoute } from '../../types';
import { soundSynthesizer } from '../../utils/audio';
import { useTypingStats } from '../../context/TypingStatsContext';
import { 
  Heart, 
  Timer, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Flame, 
  Volume2, 
  VolumeX,
  Play,
  XCircle
} from 'lucide-react';

export interface LetterPopGameProps {
  milestoneTitle: string;
  allowedKeys: string[];
  targetCount?: number; // default 30
  timeLimitSeconds?: number; // default 45
  prerequisiteLessonOrder?: number;
  nextLesson?: Lesson | null;
  onExit: () => void;
  onNavigateNextLesson?: (nextLesson: Lesson) => void;
}

interface Bubble {
  id: string;
  char: string;
  displayChar: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage 0% to 100%
  speed: number; // speed multiplier
  colorIndex: number;
  isPopping?: boolean;
}

interface PopParticle {
  id: string;
  x: number;
  y: number;
  char: string;
  color: string;
}

const BUBBLE_COLORS = [
  { bg: 'from-emerald-500/30 to-teal-600/40 border-emerald-400 text-emerald-300 shadow-emerald-500/20', particle: '#10B981' },
  { bg: 'from-cyan-500/30 to-blue-600/40 border-cyan-400 text-cyan-300 shadow-cyan-500/20', particle: '#06B6D4' },
  { bg: 'from-purple-500/30 to-indigo-600/40 border-purple-400 text-purple-300 shadow-purple-500/20', particle: '#A855F7' },
  { bg: 'from-amber-500/30 to-orange-600/40 border-amber-400 text-amber-300 shadow-amber-500/20', particle: '#F59E0B' },
  { bg: 'from-pink-500/30 to-rose-600/40 border-pink-400 text-pink-300 shadow-pink-500/20', particle: '#EC4899' },
  { bg: 'from-blue-500/30 to-indigo-600/40 border-blue-400 text-blue-300 shadow-blue-500/20', particle: '#3B82F6' },
];

export const LetterPopGame: React.FC<LetterPopGameProps> = ({
  milestoneTitle,
  allowedKeys,
  targetCount = 30,
  timeLimitSeconds = 45,
  prerequisiteLessonOrder,
  nextLesson,
  onExit,
  onNavigateNextLesson,
}) => {
  const { recordTestCompleted } = useTypingStats();

  // Filter valid single-char keys (ignoring empty strings or complex descriptors)
  const validKeys = React.useMemo(() => {
    const raw = allowedKeys
      .map(k => k.trim())
      .filter(k => k.length === 1);
    if (raw.length === 0) {
      return ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'];
    }
    return raw;
  }, [allowedKeys]);

  // Game state
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'game_over' | 'victory'>('ready');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<PopParticle[]>([]);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Animation frame and timer refs
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const nextBubbleId = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus container for keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, [gameState]);

  // Start game handler
  const handleStartGame = () => {
    setBubbles([]);
    setParticles([]);
    setLives(3);
    setScore(0);
    setPoppedCount(0);
    setTimeLeft(timeLimitSeconds);
    setStreak(0);
    setMaxStreak(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setGameState('playing');
    lastSpawnTime.current = Date.now();
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame('time_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Main game physics loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let lastFrameTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;

      // Spawn bubbles periodically (every 1.0 to 1.6 seconds)
      const now = Date.now();
      const spawnInterval = Math.max(800, 1500 - (30 - timeLeft) * 15);
      if (now - lastSpawnTime.current > spawnInterval) {
        lastSpawnTime.current = now;
        const randomChar = validKeys[Math.floor(Math.random() * validKeys.length)];
        const newBubble: Bubble = {
          id: `bubble_${nextBubbleId.current++}`,
          char: randomChar.toLowerCase(),
          displayChar: randomChar === ' ' ? '␣' : randomChar.toUpperCase(),
          x: Math.floor(Math.random() * 75) + 10, // 10% to 85% horizontal
          y: 0,
          speed: 12 + Math.random() * 6, // % per second
          colorIndex: Math.floor(Math.random() * BUBBLE_COLORS.length),
        };
        setBubbles(prev => [...prev, newBubble]);
      }

      // Move bubbles downward and check floor collision
      setBubbles(prevBubbles => {
        const nextBubbles: Bubble[] = [];
        let floorCollisions = 0;

        for (const bubble of prevBubbles) {
          if (bubble.isPopping) continue;

          const newY = bubble.y + bubble.speed * deltaTime;

          if (newY >= 88) {
            // Touched floor!
            floorCollisions += 1;
            if (!soundMuted) soundSynthesizer.playKeySound('beep', 0.5, true);
          } else {
            nextBubbles.push({ ...bubble, y: newY });
          }
        }

        if (floorCollisions > 0) {
          setStreak(0);
          setLives(prevLives => {
            const updated = prevLives - floorCollisions;
            if (updated <= 0) {
              setTimeout(() => endGame('out_of_lives'), 0);
              return 0;
            }
            return updated;
          });
        }

        return nextBubbles;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, validKeys, soundMuted, timeLeft]);

  // End game logic
  const endGame = useCallback((reason: 'victory' | 'time_up' | 'out_of_lives') => {
    if (gameState === 'victory' || gameState === 'game_over') return;

    if (reason === 'victory' || (reason === 'time_up' && poppedCount > 5)) {
      setGameState('victory');
      if (!soundMuted) soundSynthesizer.playSuccessChime(0.7);

      // Record XP reward into stats
      const finalXpEarned = Math.max(50, poppedCount * 10 + (reason === 'victory' ? 50 : 0));
      const accuracyCalc = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

      recordTestCompleted({
        id: `pop_${Date.now()}`,
        userId: 'local',
        mode: 'lesson',
        lessonTitle: `${milestoneTitle} (Mini-Game)`,
        durationSeconds: timeLimitSeconds - timeLeft,
        elapsedMs: (timeLimitSeconds - timeLeft) * 1000,
        grossWpm: Math.round((poppedCount * 12) / Math.max(1, timeLimitSeconds - timeLeft)),
        netWpm: Math.round((poppedCount * 12) / Math.max(1, timeLimitSeconds - timeLeft)),
        accuracy: accuracyCalc,
        totalCharactersTyped: totalKeystrokes,
        correctCharacters: correctKeystrokes,
        incorrectCharacters: totalKeystrokes - correctKeystrokes,
        totalErrors: totalKeystrokes - correctKeystrokes,
        correctedErrors: 0,
        uncorrectedErrors: 0,
        backspaceCount: 0,
        xpEarned: finalXpEarned,
        completedAt: new Date().toISOString(),
        calculationVersion: '1.0.0',
      });
    } else {
      setGameState('game_over');
      if (!soundMuted) soundSynthesizer.playKeySound('beep', 0.6, true);
    }
  }, [gameState, poppedCount, soundMuted, timeLimitSeconds, timeLeft, totalKeystrokes, correctKeystrokes, milestoneTitle, recordTestCompleted]);

  // Check if cleared target count
  useEffect(() => {
    if (gameState === 'playing' && poppedCount >= targetCount) {
      endGame('victory');
    }
  }, [poppedCount, targetCount, gameState, endGame]);

  // Key press listener for popping bubbles
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
    // Escape to exit or pause
    if (e.key === 'Escape') {
      onExit();
      return;
    }

    // Space/Enter when victory to navigate next
    if ((gameState === 'victory' || gameState === 'game_over') && e.key === 'Enter') {
      if (gameState === 'victory' && nextLesson && onNavigateNextLesson) {
        onNavigateNextLesson(nextLesson);
      } else {
        handleStartGame();
      }
      return;
    }

    if (gameState !== 'playing') return;

    const pressedKey = e.key.toLowerCase();
    setTotalKeystrokes(prev => prev + 1);

    // Find matching bubbles (sort by lowest on screen first - highest Y)
    const matchingBubbles = bubbles
      .filter(b => !b.isPopping && (b.char === pressedKey || (pressedKey === ' ' && b.char === ' ')))
      .sort((a, b) => b.y - a.y);

    if (matchingBubbles.length > 0) {
      const targetBubble = matchingBubbles[0];

      // Mark bubble as popping
      setBubbles(prev => prev.map(b => b.id === targetBubble.id ? { ...b, isPopping: true } : b));
      
      // Remove after brief animation
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== targetBubble.id));
      }, 200);

      // Create particle effect
      const colorScheme = BUBBLE_COLORS[targetBubble.colorIndex] || BUBBLE_COLORS[0];
      const newParticle: PopParticle = {
        id: `p_${Date.now()}_${Math.random()}`,
        x: targetBubble.x,
        y: targetBubble.y,
        char: targetBubble.displayChar,
        color: colorScheme.particle,
      };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 500);

      // Update score & counts
      setCorrectKeystrokes(prev => prev + 1);
      setPoppedCount(prev => prev + 1);
      setScore(prev => prev + 10 + (streak >= 5 ? 5 : 0));
      setStreak(prev => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });

      if (!soundMuted) soundSynthesizer.playKeySound('click', 0.6, false);
    } else {
      // Missed key press
      setStreak(0);
      if (!soundMuted) soundSynthesizer.playKeySound('beep', 0.4, true);
    }
  }, [gameState, bubbles, streak, maxStreak, soundMuted, nextLesson, onNavigateNextLesson, onExit]);

  // Attach global keyboard handler when game is active
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys like Ctrl/Meta are held
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleKeyDown]);

  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const xpEarned = poppedCount * 10 + (gameState === 'victory' ? 50 : 0);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      id="letter-pop-game-container"
      className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden focus:outline-none select-none relative flex flex-col min-h-[580px]"
    >
      {/* Top Header & HUD */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Exit Mini-Game"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                MILESTONE MINI-GAME
              </span>
              {prerequisiteLessonOrder && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Level {prerequisiteLessonOrder}
                </span>
              )}
            </div>
            <h2 className="text-base font-extrabold text-slate-100 mt-0.5">
              {milestoneTitle}
            </h2>
          </div>
        </div>

        {/* Live HUD Badges */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Target Progress */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Popped:</span>
            <span className="font-bold text-slate-100">{poppedCount}/{targetCount}</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Timer className={`w-3.5 h-3.5 ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className={`font-bold ${timeLeft <= 10 ? 'text-rose-400' : 'text-slate-100'}`}>{timeLeft}s</span>
          </div>

          {/* Lives */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {[1, 2, 3].map(heartIdx => (
              <Heart
                key={heartIdx}
                className={`w-4 h-4 transition-all duration-300 ${
                  heartIdx <= lives
                    ? 'fill-rose-500 text-rose-500 scale-100'
                    : 'text-slate-700 fill-slate-800/50 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundMuted(prev => !prev)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage Canvas View */}
      <div className="relative flex-1 bg-slate-950/60 overflow-hidden flex flex-col justify-between p-4 min-h-[460px]">
        {/* Subtle animated background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* Streak HUD Overlay */}
        {streak >= 3 && gameState === 'playing' && (
          <div className="absolute top-4 left-6 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono animate-bounce">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{streak}X STREAK! (+5 BONUS)</span>
          </div>
        )}

        {/* Falling Bubbles */}
        {gameState === 'playing' && bubbles.map(bubble => {
          const color = BUBBLE_COLORS[bubble.colorIndex] || BUBBLE_COLORS[0];
          return (
            <div
              key={bubble.id}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: bubble.isPopping ? 'scale(1.4)' : 'scale(1)',
                opacity: bubble.isPopping ? 0 : 1,
              }}
              className={`absolute -translate-x-1/2 w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b ${color.bg} border-2 flex items-center justify-center font-mono font-extrabold text-xl sm:text-2xl shadow-lg transition-transform duration-150 backdrop-blur-sm`}
            >
              <span>{bubble.displayChar}</span>
              {/* Inner bubble shine */}
              <div className="absolute top-1 left-2 w-3 h-1.5 rounded-full bg-white/30 transform -rotate-12" />
            </div>
          );
        })}

        {/* Pop Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center animate-ping"
          >
            <span className="text-xs font-mono font-bold text-amber-300">+10 XP</span>
          </div>
        ))}

        {/* Floor Line with Warning Glow */}
        <div className="absolute bottom-2 left-4 right-4 h-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-rose-500/60 to-rose-500/20 border-b border-rose-500/40 shadow-sm shadow-rose-500/20" />
        <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-mono text-slate-500 uppercase tracking-wider pointer-events-none">
          Pop bubbles before they hit the floor line!
        </div>

        {/* ================= READY STATE OVERLAY ================= */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10">
              <Zap className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-extrabold text-slate-100">
                Milestone Challenge: {milestoneTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test your reaction speed and finger memory! Pop the falling letter bubbles by typing their matching keys before they touch the ground.
              </p>
            </div>

            {/* Target Keys Preview */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
              <span className="text-xs text-slate-400 font-semibold mr-1">Active Keys:</span>
              {validKeys.map((k, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold text-xs"
                >
                  {k === ' ' ? 'SPACE' : k.toUpperCase()}
                </span>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Bubble Pop (30 Letters)</span>
            </button>
          </div>
        )}

        {/* ================= VICTORY STATE OVERLAY ================= */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                Milestone Complete!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Flawless precision! You cleared all target bubbles and reinforced your finger anchors.
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                <p className="text-xl font-mono font-extrabold text-emerald-400">{score}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
                <p className="text-xl font-mono font-extrabold text-cyan-400">{accuracy}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">XP Earned</span>
                <p className="text-xl font-mono font-extrabold text-amber-400">+{xpEarned} XP</p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>

              {nextLesson && onNavigateNextLesson ? (
                <button
                  onClick={() => onNavigateNextLesson(nextLesson)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  <span>Enter / Continue (Lesson {nextLesson.order})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onExit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  <span>Back to Lessons</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= GAME OVER OVERLAY ================= */}
        {gameState === 'game_over' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-100">
                Out of Lives!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                You popped {poppedCount} bubbles. Keep your eyes on the screen and try again!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={onExit}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800"
              >
                Exit Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
