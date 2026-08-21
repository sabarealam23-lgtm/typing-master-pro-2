import React, { useState } from 'react';
import { PageRoute, Lesson, DifficultyLevel, TypingResult } from '../../types';
import { LESSONS_DATA } from '../../data/lessons';
import { useTypingStats } from '../../context/TypingStatsContext';
import { TypingEngine } from '../../components/typing/TypingEngine';
import { LetterPopGame } from '../../components/learn/LetterPopGame';
import { 
  BookOpen, 
  CheckCircle2, 
  Star, 
  Lock, 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Zap, 
  Target,
  Gamepad2,
  Flame
} from 'lucide-react';

export interface LessonMilestone {
  id: string;
  afterLessonOrder: number;
  level: DifficultyLevel;
  title: string;
  description: string;
  targetCount: number;
  timeLimitSeconds: number;
  badge: string;
}

export const LESSON_MILESTONES: LessonMilestone[] = [
  // Tier 1: Beginner Milestones (Lessons 2, 4, 6, 8)
  {
    id: 'milestone-2',
    afterLessonOrder: 2,
    level: 'beginner',
    title: 'Anchors & Spacebar Pop',
    description: 'Pop falling bubble tiles coordinating index anchors (F, J) and the spacebar.',
    targetCount: 20,
    timeLimitSeconds: 45,
    badge: 'Anchor Scout',
  },
  {
    id: 'milestone-4',
    afterLessonOrder: 4,
    level: 'beginner',
    title: 'Home Row Basics Bubble Pop',
    description: 'Pop falling bubble tiles using your newly trained index, middle, and ring fingers!',
    targetCount: 25,
    timeLimitSeconds: 45,
    badge: 'Home Row Star',
  },
  {
    id: 'milestone-6',
    afterLessonOrder: 6,
    level: 'beginner',
    title: 'Home Row Words Sprint',
    description: 'Pop full home row letters at speed without looking down at the keyboard.',
    targetCount: 28,
    timeLimitSeconds: 45,
    badge: 'Row Runner',
  },
  {
    id: 'milestone-8',
    afterLessonOrder: 8,
    level: 'beginner',
    title: 'Foundations Mastery Bubble Pop',
    description: 'Master all home row anchor keys and index reaches in this arcade bubble sprint.',
    targetCount: 30,
    timeLimitSeconds: 45,
    badge: 'Anchor Master',
  },

  // Tier 2: Intermediate Milestones (Lessons 10, 12, 14, 16, 18, 20)
  {
    id: 'milestone-10',
    afterLessonOrder: 10,
    level: 'intermediate',
    title: 'Top Row Index & Middle Pop',
    description: 'Pop reaching top row letters (E, I, R, U) combined with home row anchors.',
    targetCount: 28,
    timeLimitSeconds: 45,
    badge: 'Top Reach',
  },
  {
    id: 'milestone-12',
    afterLessonOrder: 12,
    level: 'intermediate',
    title: 'Top Row Ring Reach Pop',
    description: 'Rapidly coordinate upward ring finger reaches (W, O) before bubbles touch the ground.',
    targetCount: 30,
    timeLimitSeconds: 45,
    badge: 'Ring Precision',
  },
  {
    id: 'milestone-14',
    afterLessonOrder: 14,
    level: 'intermediate',
    title: 'Top Row Synthesis Bubble Pop',
    description: 'Quickly coordinate upward reaching fingers from Home to Top row characters.',
    targetCount: 30,
    timeLimitSeconds: 45,
    badge: 'Top Row Ace',
  },
  {
    id: 'milestone-16',
    afterLessonOrder: 16,
    level: 'intermediate',
    title: 'Bottom Row Index & Middle Pop',
    description: 'Hit downward reaches (V, M, C, comma) with steady rhythmic cadence.',
    targetCount: 30,
    timeLimitSeconds: 45,
    badge: 'Bottom Row Pilot',
  },
  {
    id: 'milestone-18',
    afterLessonOrder: 18,
    level: 'intermediate',
    title: 'Bottom Row Pinky & Ring Pop',
    description: 'Stretch down to tricky keys (X, Z, period, slash) under time pressure.',
    targetCount: 32,
    timeLimitSeconds: 50,
    badge: 'Reach Master',
  },
  {
    id: 'milestone-20',
    afterLessonOrder: 20,
    level: 'intermediate',
    title: '3-Row Alphabet Blitz',
    description: 'All 26 letters are falling! Test full finger coordination across the entire keyboard.',
    targetCount: 35,
    timeLimitSeconds: 50,
    badge: 'Alphabet Ninja',
  },

  // Tier 3: Advanced Milestones (Lessons 22, 24, 26)
  {
    id: 'milestone-22',
    afterLessonOrder: 22,
    level: 'advanced',
    title: 'Capitals & Number Row Pop',
    description: 'Coordinate Shift keys and number row keys (1–5) in fast bubble streams.',
    targetCount: 30,
    timeLimitSeconds: 45,
    badge: 'Number Cadet',
  },
  {
    id: 'milestone-24',
    afterLessonOrder: 24,
    level: 'advanced',
    title: 'Numbers & Symbols Pop',
    description: 'Pop falling numbers and tricky symbols with pinpoint precision and reflexes.',
    targetCount: 32,
    timeLimitSeconds: 45,
    badge: 'Symbol Specialist',
  },
  {
    id: 'milestone-26',
    afterLessonOrder: 26,
    level: 'advanced',
    title: 'Endurance Speed Sprint',
    description: 'High-speed comprehensive test across all letters, numbers, and punctuation marks.',
    targetCount: 35,
    timeLimitSeconds: 45,
    badge: 'Speed Demon',
  },
];

export const getLearnedKeysUpToLesson = (order: number): string[] => {
  const accumulated = new Set<string>();
  for (const l of LESSONS_DATA) {
    if (l.order <= order) {
      l.targetKeys.forEach(k => {
        if (k.length === 1) {
          accumulated.add(k.toLowerCase());
        } else if (k === 'all letter rows' || k === 'full keyboard' || k === 'all keys' || k === 'A-Z' || k === 'Shift') {
          'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => accumulated.add(ch));
        } else {
          // split any characters if multi-character punctuation or symbol string
          k.split('').forEach(ch => {
            if (ch.trim()) accumulated.add(ch.toLowerCase());
          });
        }
      });
    }
  }
  if (accumulated.size === 0) return ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'];
  return Array.from(accumulated);
};

interface LessonsPageProps {
  onNavigate: (page: PageRoute, lesson?: Lesson) => void;
}

// ==================== LESSONS CATALOG PAGE ====================
export const LessonsPage: React.FC<LessonsPageProps> = ({ onNavigate }) => {
  const { lessonProgress } = useTypingStats();
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('beginner');
  const [activeMilestoneGame, setActiveMilestoneGame] = useState<LessonMilestone | null>(null);

  const filteredLessons = LESSONS_DATA.filter(l => l.level === selectedLevel);
  const filteredMilestones = LESSON_MILESTONES.filter(m => m.level === selectedLevel);

  const getLevelProgressSummary = (level: DifficultyLevel) => {
    const levelLessons = LESSONS_DATA.filter(l => l.level === level);
    const completedCount = levelLessons.filter(l => lessonProgress[l.id]?.completed).length;
    return { completedCount, total: levelLessons.length };
  };

  const begProg = getLevelProgressSummary('beginner');
  const intProg = getLevelProgressSummary('intermediate');
  const advProg = getLevelProgressSummary('advanced');

  // If a milestone game is active, render it directly
  if (activeMilestoneGame) {
    const nextLessonForMilestone = LESSONS_DATA.find(l => l.order === activeMilestoneGame.afterLessonOrder + 1) || null;
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <LetterPopGame
          milestoneTitle={activeMilestoneGame.title}
          allowedKeys={getLearnedKeysUpToLesson(activeMilestoneGame.afterLessonOrder)}
          targetCount={activeMilestoneGame.targetCount}
          timeLimitSeconds={activeMilestoneGame.timeLimitSeconds}
          prerequisiteLessonOrder={activeMilestoneGame.afterLessonOrder}
          nextLesson={nextLessonForMilestone}
          onExit={() => setActiveMilestoneGame(null)}
          onNavigateNextLesson={(nxt) => {
            setActiveMilestoneGame(null);
            onNavigate('lesson-view', nxt);
          }}
        />
      </div>
    );
  }

  return (
    <div id="lessons-catalog-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Structured Touch Typing Curriculum</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Typing Courses & Lessons
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Systematic muscle memory progression designed to build finger independence, high-speed coordination, and zero-hesitation touch typing.
        </p>
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-800 pb-4">
        <button
          id="tab-beginner-lessons"
          onClick={() => setSelectedLevel('beginner')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedLevel === 'beginner'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <span>Beginner: Foundation</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
            selectedLevel === 'beginner' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {begProg.completedCount}/{begProg.total}
          </span>
        </button>

        <button
          id="tab-intermediate-lessons"
          onClick={() => setSelectedLevel('intermediate')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedLevel === 'intermediate'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <span>Intermediate: Precision</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
            selectedLevel === 'intermediate' ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {intProg.completedCount}/{intProg.total}
          </span>
        </button>

        <button
          id="tab-advanced-lessons"
          onClick={() => setSelectedLevel('advanced')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedLevel === 'advanced'
              ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <span>Advanced: Speed Mastery</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
            selectedLevel === 'advanced' ? 'bg-slate-950 text-purple-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {advProg.completedCount}/{advProg.total}
          </span>
        </button>
      </div>

      {/* Milestone Mini-Games Highlight Section */}
      {filteredMilestones.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                  <span>Milestone Bubble Pop Games</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +XP REWARDS
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Reinforce keys you've learned through fast-paced falling bubble drills!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {filteredMilestones.map(m => {
              const prereqLesson = LESSONS_DATA.find(l => l.order === m.afterLessonOrder);
              const isUnlocked = prereqLesson ? !!lessonProgress[prereqLesson.id]?.completed : true;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-850 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        After Lesson {m.afterLessonOrder}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300">{m.badge}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">{m.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{m.description}</p>
                  </div>

                  <button
                    onClick={() => setActiveMilestoneGame(m)}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/15 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const prog = lessonProgress[lesson.id];
          const isCompleted = prog?.completed;
          const stars = prog?.stars || 0;
          const isMilestone = lesson.order % 2 === 0;

          return (
            <div
              key={lesson.id}
              id={`lesson-card-${lesson.id}`}
              className={`p-6 rounded-2xl bg-slate-900/80 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isCompleted 
                  ? 'border-emerald-500/40 shadow-sm shadow-emerald-500/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                      {lesson.order}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {lesson.category}
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +{lesson.xpReward} XP
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">{lesson.title}</h3>
                  {isMilestone && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      🎮 MINI-GAME
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">{lesson.description}</p>

                {/* Target Keys Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Keys:</span>
                  {lesson.targetKeys.map((k, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs"
                    >
                      {k === ' ' ? 'SPACE' : k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400">
                  <span>Req: {lesson.requiredWpm} WPM • {lesson.requiredAccuracy}% Acc</span>
                  {isCompleted && (
                    <div className="text-emerald-400 text-[10px] font-sans font-semibold mt-0.5">
                      Best: {prog.bestWpm} WPM ({prog.bestAccuracy}%)
                    </div>
                  )}
                </div>

                <button
                  id={`start-lesson-btn-${lesson.id}`}
                  onClick={() => onNavigate('lesson-view', lesson)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isCompleted ? 'Practice Again' : 'Start'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== ACTIVE LESSON VIEW PAGE ====================
interface LessonViewPageProps {
  lesson: Lesson;
  onNavigate: (page: PageRoute, nextLesson?: Lesson) => void;
}

export const LessonViewPage: React.FC<LessonViewPageProps> = ({ lesson, onNavigate }) => {
  const { recordTestCompleted } = useTypingStats();
  const [completedResult, setCompletedResult] = useState<TypingResult | null>(null);
  const [isMiniGameOpen, setIsMiniGameOpen] = useState<boolean>(false);

  const handleTestComplete = (result: TypingResult) => {
    recordTestCompleted(result);
    setCompletedResult(result);
  };

  const isPassed = completedResult 
    ? (completedResult.netWpm >= lesson.requiredWpm && completedResult.accuracy >= lesson.requiredAccuracy) 
    : false;

  // Next lesson finding
  const currentIndex = LESSONS_DATA.findIndex(l => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < LESSONS_DATA.length - 1 
    ? LESSONS_DATA[currentIndex + 1] 
    : null;

  // Check if current lesson has a milestone mini-game (every 2 completed lessons)
  const isMilestone = lesson.order % 2 === 0;
  const milestoneForLesson = LESSON_MILESTONES.find(m => m.afterLessonOrder === lesson.order) || (isMilestone ? {
    id: `milestone-${lesson.order}`,
    afterLessonOrder: lesson.order,
    level: lesson.level,
    title: `Lesson ${lesson.order} Milestone Bubble Pop`,
    description: `Pop falling bubbles using keys mastered through Lesson ${lesson.order}!`,
    targetCount: Math.min(35, 20 + Math.floor(lesson.order / 2) * 2),
    timeLimitSeconds: 45,
    badge: `Level ${lesson.order} Scout`,
  } : null);

  const isCompleted = completedResult !== null;

  const handleNextLesson = React.useCallback(() => {
    if (isPassed && nextLesson) {
      setCompletedResult(null);
      setIsMiniGameOpen(false);
      onNavigate('lesson-view', nextLesson);
    } else {
      setCompletedResult(null);
      setIsMiniGameOpen(false);
    }
  }, [isPassed, nextLesson, onNavigate]);

  const handleRetryLesson = React.useCallback(() => {
    setCompletedResult(null);
    setIsMiniGameOpen(false);
  }, []);

  // Scoped keydown listener active only when modal is completed (isCompleted === true and not in mini-game)
  React.useEffect(() => {
    if (!isCompleted || isMiniGameOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextLesson();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleRetryLesson();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCompleted, isMiniGameOpen, handleNextLesson, handleRetryLesson]);

  // If user opened the milestone game from the completion modal
  if (isMiniGameOpen) {
    const gameTitle = milestoneForLesson?.title || `Lesson ${lesson.order} Milestone Pop`;
    const targetKeysForGame = getLearnedKeysUpToLesson(lesson.order);

    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <LetterPopGame
          milestoneTitle={gameTitle}
          allowedKeys={targetKeysForGame}
          targetCount={milestoneForLesson?.targetCount || 30}
          timeLimitSeconds={milestoneForLesson?.timeLimitSeconds || 45}
          prerequisiteLessonOrder={lesson.order}
          nextLesson={nextLesson}
          onExit={() => setIsMiniGameOpen(false)}
          onNavigateNextLesson={(nxt) => {
            setIsMiniGameOpen(false);
            setCompletedResult(null);
            onNavigate('lesson-view', nxt);
          }}
        />
      </div>
    );
  }

  return (
    <div id="active-lesson-view" className="w-full max-w-7xl mx-auto py-3 sm:py-5 px-4 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-4">
      {/* Back button & Lesson header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('learn')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Lessons</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Target: {lesson.requiredWpm} WPM • {lesson.requiredAccuracy}% Accuracy
          </span>
        </div>
      </div>

      {/* Embedded Typing Engine */}
      {!completedResult ? (
        <TypingEngine
          practiceText={lesson.practiceText}
          mode="lesson"
          lesson={lesson}
          onComplete={handleTestComplete}
        />
      ) : (
        /* Completion Verdict Card */
        <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg">
            {isPassed ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <RotateCcw className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-100">
              {isPassed ? 'Lesson Mastered!' : 'Keep Practicing'}
            </h2>
            <p className="text-xs text-slate-400">
              {isPassed 
                ? `You reached ${completedResult.netWpm} WPM with ${completedResult.accuracy}% accuracy!` 
                : `You scored ${completedResult.netWpm} WPM (${lesson.requiredWpm} required) and ${completedResult.accuracy}% accuracy (${lesson.requiredAccuracy}% required).`}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Speed</span>
              <p className="text-xl font-mono font-bold text-emerald-400">{completedResult.netWpm} WPM</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
              <p className="text-xl font-mono font-bold text-cyan-400">{completedResult.accuracy}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">XP Earned</span>
              <p className="text-xl font-mono font-bold text-amber-400">+{completedResult.xpEarned}</p>
            </div>
          </div>

          {/* Highlighted Milestone Mini-Game Button (After Every 2 Completed Lessons) */}
          {isPassed && isMilestone && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left animate-pulse">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-extrabold font-mono">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>MILESTONE MINI-GAME READY (LESSON {lesson.order})!</span>
                </div>
                <p className="text-xs text-slate-300">
                  {milestoneForLesson ? milestoneForLesson.title : `Pop falling letter bubbles with keys learned through Lesson ${lesson.order}!`}
                </p>
              </div>

              <button
                onClick={() => setIsMiniGameOpen(true)}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>🎮 Play Milestone Game</span>
              </button>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <button
              onClick={() => setCompletedResult(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Lesson</span>
            </button>

            {isPassed && nextLesson && (
              <button
                onClick={() => {
                  setCompletedResult(null);
                  onNavigate('lesson-view', nextLesson);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                <span>Next Lesson ({nextLesson.order})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigate('learn')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

