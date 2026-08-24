import React, { useState } from 'react';
import { PageRoute, Lesson, DifficultyLevel, TypingResult } from '../../types';
import { LESSONS_DATA } from '../../data/lessons';
import { useTypingStats } from '../../context/TypingStatsContext';
import { useSettings } from '../../context/SettingsContext';
import { soundSynthesizer } from '../../utils/audio';
import { TypingEngine } from '../../components/typing/TypingEngine';
import { VirtualKeyboard, getFingerGuide } from '../../components/typing/VirtualKeyboard';
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
  Flame,
  Check
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
      <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          id="tab-beginner-lessons"
          onClick={() => setSelectedLevel('beginner')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedLevel === 'beginner'
              ? 'bg-[#1e3a8a] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800'
          }`}
        >
          <span>Beginner: Foundation</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
            selectedLevel === 'beginner' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
          }`}>
            {begProg.completedCount}/{begProg.total}
          </span>
        </button>

        <button
          id="tab-intermediate-lessons"
          onClick={() => setSelectedLevel('intermediate')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedLevel === 'intermediate'
              ? 'bg-[#1e3a8a] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800'
          }`}
        >
          <span>Intermediate: Precision</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
            selectedLevel === 'intermediate' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
          }`}>
            {intProg.completedCount}/{intProg.total}
          </span>
        </button>

        <button
          id="tab-advanced-lessons"
          onClick={() => setSelectedLevel('advanced')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedLevel === 'advanced'
              ? 'bg-[#1e3a8a] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800'
          }`}
        >
          <span>Advanced: Speed Mastery</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
            selectedLevel === 'advanced' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
          }`}>
            {advProg.completedCount}/{advProg.total}
          </span>
        </button>
      </div>

      {/* Milestone Mini-Games Highlight Section */}
      {filteredMilestones.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Milestone Bubble Pop Games</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    +XP REWARDS
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
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
                      ? 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-xs'
                      : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        After Lesson {m.afterLessonOrder}
                      </span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">{m.badge}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{m.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{m.description}</p>
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
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm ${
                isCompleted 
                  ? 'border-emerald-500/40' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {lesson.order}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      {lesson.category}
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      +{lesson.xpReward} XP
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
                  {lesson.steps && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {lesson.steps.length} STEPS
                    </span>
                  )}
                  {isMilestone && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      🎮 MINI-GAME
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{lesson.description}</p>

                {/* Target Keys Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Keys:</span>
                  {lesson.targetKeys.map((k, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[#1e3a8a] dark:text-emerald-400 font-mono font-bold text-xs shadow-2xs"
                    >
                      {k === ' ' ? 'SPACE' : k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Req: {lesson.requiredWpm} WPM • {lesson.requiredAccuracy}% Acc</span>
                  {isCompleted && (
                    <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-sans font-semibold mt-0.5">
                      Best: {prog.bestWpm} WPM ({prog.bestAccuracy}%)
                    </div>
                  )}
                </div>

                <button
                  id={`start-lesson-btn-${lesson.id}`}
                  onClick={() => onNavigate('lesson-view', lesson)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      : 'bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-sm'
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

// ==================== SINGLE-KEY DISCOVERY (STEP 1) ====================
interface SingleKeyDiscoveryProps {
  practiceText: string;
  lesson: Lesson;
  onComplete: () => void;
}

export const SingleKeyDiscovery: React.FC<SingleKeyDiscoveryProps> = ({
  practiceText,
  lesson,
  onComplete,
}) => {
  const { settings } = useSettings();
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isErrorShake, setIsErrorShake] = useState<boolean>(false);

  const currentChar = practiceText[currentCharIndex] || practiceText[0];
  const fingerGuide = React.useMemo(() => getFingerGuide(currentChar), [currentChar]);

  // Key press evaluation
  const handleKeyEvaluation = React.useCallback((key: string) => {
    if (isCompleted) return;

    const expectedChar = practiceText[currentCharIndex];
    if (!expectedChar) return;

    const isMatch = (key.toLowerCase() === expectedChar.toLowerCase()) || (key === expectedChar);

    if (isMatch) {
      if (settings.soundEnabled) {
        soundSynthesizer.playKeySound(settings.soundType, settings.soundVolume);
      }
      if (currentCharIndex + 1 < practiceText.length) {
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Last intro key pressed!
        if (settings.soundEnabled) {
          soundSynthesizer.playSuccessChime(settings.soundVolume);
        }
        setIsCompleted(true);
      }
    } else {
      if (settings.soundEnabled) {
        soundSynthesizer.playKeySound(settings.soundType, settings.soundVolume, true);
      }
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 350);
    }
  }, [isCompleted, practiceText, currentCharIndex, settings.soundEnabled, settings.soundType, settings.soundVolume]);

  // Scoped keydown listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onComplete();
        }
        return;
      }

      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Tab' || e.key === 'CapsLock') {
        return;
      }

      e.preventDefault();
      handleKeyEvaluation(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, handleKeyEvaluation, onComplete]);

  // Auto-center discovery arena on mount
  React.useEffect(() => {
    const arena = document.getElementById('single-key-discovery-view');
    if (arena) {
      arena.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <div id="single-key-discovery-view" className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 [@media(max-height:820px)]:space-y-2 animate-fade-in select-none">
      {!isCompleted ? (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 [@media(max-height:820px)]:p-3 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-3 sm:space-y-4 [@media(max-height:820px)]:space-y-2">
          {/* Top Instruction */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Step 1: Key Discovery ({currentCharIndex + 1} of {practiceText.length})</span>
            </div>
            <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-slate-100">
              Press the highlighted key on your keyboard
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto">
              Place your hands on the home row and locate the tactile anchor position.
            </p>
          </div>

          {/* Large Centered Active Keycap Tile */}
          <div className="flex flex-col items-center justify-center py-1">
            <div
              className={`
                w-20 h-20 sm:w-26 sm:h-26 md:w-30 md:h-30 [@media(max-height:820px)]:w-18 [@media(max-height:820px)]:h-18 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center
                bg-gradient-to-b from-slate-800 to-slate-950 border-2 transition-all duration-200
                shadow-2xl relative select-none
                ${isErrorShake 
                  ? 'border-rose-500 ring-4 ring-rose-500/30 scale-95' 
                  : 'border-cyan-400 shadow-cyan-500/25 ring-4 ring-cyan-500/20 scale-105'}
              `}
            >
              <span className="font-mono text-3xl sm:text-5xl font-black text-cyan-300 drop-shadow-md">
                {currentChar === ' ' ? 'SPACE' : currentChar.toUpperCase()}
              </span>
              
              {/* Tactile Ridge Indicator on F and J */}
              {(currentChar.toLowerCase() === 'f' || currentChar.toLowerCase() === 'j') && (
                <div className="absolute bottom-2.5 flex items-center gap-1">
                  <span className="w-3.5 h-1 bg-cyan-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Dynamic Finger Guide Banner */}
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <span className="text-slate-400">Target:</span>
              <span className="font-mono font-extrabold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 text-xs">
                {fingerGuide.targetDisplay}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Use:</span>
              <span className="font-bold text-slate-100">
                {fingerGuide.handName} • {fingerGuide.fingerName}
              </span>
            </div>

            {/* Mini Progress Dots */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {practiceText.split('').map((char, idx) => {
                const isPassed = idx < currentCharIndex;
                const isCurrent = idx === currentCharIndex;
                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-mono text-[11px] sm:text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 scale-110'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : (char === ' ' ? '␣' : char.toUpperCase())}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Virtual Keyboard Matrix */}
          <div className="w-full pt-1.5 border-t border-slate-800/80">
            <VirtualKeyboard
              currentExpectedChar={currentChar}
              onKeyPress={handleKeyEvaluation}
              hideFingerBadge={true}
              compact={true}
            />
          </div>
        </div>
      ) : (
        /* Step 1 Completion Pause & 'Press Enter to Continue' Modal */
        <div className="w-full max-w-xl mx-auto p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full mx-auto bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg text-3xl">
            🎉
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Step 1 of {lesson.steps?.length || 4} Completed
            </div>
            <h3 className="text-2xl font-extrabold text-slate-100">
              Step Passed! 🎉
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              You discovered all intro anchor keys for this lesson. Ready to build muscle memory in Step 2!
            </p>
          </div>

          {/* Mastered Key Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 py-2">
            {practiceText.split('').map((k, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{k === ' ' ? 'SPACE' : k.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Continue CTA Button with Physical Enter Reminder */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onComplete}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-transform hover:scale-105 cursor-pointer"
            >
              <span>Continue [ ↵ Enter ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ACTIVE LESSON VIEW PAGE ====================
interface LessonViewPageProps {
  lesson: Lesson;
  onNavigate: (page: PageRoute, nextLesson?: Lesson) => void;
}

interface StepVerdict {
  stepIndex: number;
  passed: boolean;
  result: TypingResult;
}

export const LessonViewPage: React.FC<LessonViewPageProps> = ({ lesson, onNavigate }) => {
  const { recordTestCompleted } = useTypingStats();
  
  // 4-Step / Multi-Step Sub-drill progression state
  const lessonSteps = (lesson.steps && lesson.steps.length > 0) ? lesson.steps : [lesson.practiceText];
  const totalSteps = lessonSteps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepVerdict, setStepVerdict] = useState<StepVerdict | null>(null);
  const [completedResult, setCompletedResult] = useState<TypingResult | null>(null);
  const [isMiniGameOpen, setIsMiniGameOpen] = useState<boolean>(false);

  // Reset steps and results when active lesson switches
  React.useEffect(() => {
    setCurrentStepIndex(0);
    setStepVerdict(null);
    setCompletedResult(null);
    setIsMiniGameOpen(false);
  }, [lesson.id]);

  const getStepMetadata = (idx: number) => {
    if (totalSteps === 4) {
      if (idx === 0) return { name: 'Key Discovery', desc: 'Single-key intro & tactile anchors' };
      if (idx === 1) return { name: 'Single Repetition', desc: '4x single-key bursts' };
      if (idx === 2) return { name: 'Double Pairs', desc: '2x double pairs' };
      if (idx === 3) return { name: 'Rhythm & Flow', desc: 'Alternates & rhythm patterns' };
      return { name: `Sub-Drill ${idx + 1}`, desc: 'Progressive practice step' };
    }
    if (idx === 0) return { name: 'Single Repetition', desc: '4x single-key bursts' };
    if (idx === 1) return { name: 'Double Pairs', desc: '2x double pairs' };
    if (idx === 2) return { name: 'Rhythm & Flow', desc: 'Alternates & rhythm patterns' };
    return { name: `Sub-Drill ${idx + 1}`, desc: 'Progressive practice step' };
  };

  const isDiscoveryStep = currentStepIndex === 0 && (totalSteps === 4 || (lessonSteps[0].length <= 5 && !lessonSteps[0].includes(' ')));

  const handleSubStepComplete = (result: TypingResult) => {
    const isPassed = (result.netWpm >= lesson.requiredWpm && result.accuracy >= lesson.requiredAccuracy);

    if (isPassed) {
      if (currentStepIndex < totalSteps - 1) {
        // Sub-drill passed! Show intermediate step transition
        setStepVerdict({
          stepIndex: currentStepIndex,
          passed: true,
          result,
        });
      } else {
        // Final step passed! Complete overall lesson and grant XP
        recordTestCompleted(result);
        setCompletedResult(result);
        setStepVerdict(null);
      }
    } else {
      // Step failed targets, prompt retry for current step
      setStepVerdict({
        stepIndex: currentStepIndex,
        passed: false,
        result,
      });
    }
  };

  const handleAdvanceNextStep = React.useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setStepVerdict(null);
    }
  }, [currentStepIndex, totalSteps]);

  const handleRetryCurrentStep = React.useCallback(() => {
    setStepVerdict(null);
  }, []);

  const isOverallPassed = completedResult 
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
    if (isOverallPassed && nextLesson) {
      setCompletedResult(null);
      setStepVerdict(null);
      setCurrentStepIndex(0);
      setIsMiniGameOpen(false);
      onNavigate('lesson-view', nextLesson);
    } else {
      setCompletedResult(null);
      setStepVerdict(null);
      setCurrentStepIndex(0);
      setIsMiniGameOpen(false);
    }
  }, [isOverallPassed, nextLesson, onNavigate]);

  const handleRetryLesson = React.useCallback(() => {
    setCompletedResult(null);
    setStepVerdict(null);
    setCurrentStepIndex(0);
    setIsMiniGameOpen(false);
  }, []);

  // Scoped keydown listener active for modal steps & completion screen
  React.useEffect(() => {
    if (isMiniGameOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (completedResult) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleNextLesson();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleRetryLesson();
        }
      } else if (stepVerdict) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (stepVerdict.passed) {
            handleAdvanceNextStep();
          } else {
            handleRetryCurrentStep();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleRetryCurrentStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [completedResult, stepVerdict, isMiniGameOpen, handleNextLesson, handleRetryLesson, handleAdvanceNextStep, handleRetryCurrentStep]);

  // Viewport auto-centering on mount or step change
  React.useEffect(() => {
    const arena = document.getElementById('active-lesson-view');
    if (arena) {
      arena.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [lesson.id, currentStepIndex]);

  // If user opened the milestone game from the completion modal
  if (isMiniGameOpen) {
    const gameTitle = milestoneForLesson?.title || `Lesson ${lesson.order} Milestone Pop`;
    const targetKeysForGame = getLearnedKeysUpToLesson(lesson.order);

    return (
      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8 space-y-4">
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
            setStepVerdict(null);
            setCurrentStepIndex(0);
            onNavigate('lesson-view', nxt);
          }}
        />
      </div>
    );
  }

  return (
    <div id="active-lesson-view" className="w-full max-w-7xl mx-auto py-2 sm:py-4 px-3 sm:px-6 lg:px-8 space-y-2 sm:space-y-3">
      {/* Back button & Lesson header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          onClick={() => onNavigate('learn')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Lessons</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            Target: {lesson.requiredWpm} WPM • {lesson.requiredAccuracy}% Accuracy
          </span>
        </div>
      </div>

      {/* 3-Step Sub-Drill Progress Header (TypingClub Style) */}
      {totalSteps > 1 && !completedResult && !stepVerdict && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/25">
              {currentStepIndex + 1}/{totalSteps}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-100">
                  Step {currentStepIndex + 1}: {getStepMetadata(currentStepIndex).name}
                </h4>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  ({getStepMetadata(currentStepIndex).desc})
                </span>
              </div>
            </div>
          </div>

          {/* 3 Progressive Step Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {lessonSteps.map((_, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-semibold transition-all ${
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                  <span className="hidden md:inline">{getStepMetadata(idx).name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Branching: 1) Active Sub-Drill Typing or Discovery Mode, 2) Step Transition Verdict, 3) Final Lesson Completion */}
      {!completedResult && !stepVerdict && (
        isDiscoveryStep ? (
          <SingleKeyDiscovery
            key={`${lesson.id}-step-0`}
            practiceText={lessonSteps[0]}
            lesson={lesson}
            onComplete={handleAdvanceNextStep}
          />
        ) : (
          <TypingEngine
            key={`${lesson.id}-step-${currentStepIndex}`}
            practiceText={lessonSteps[currentStepIndex]}
            mode="lesson"
            lesson={lesson}
            onComplete={handleSubStepComplete}
          />
        )
      )}

      {/* Intermediate Sub-Step Verdict Screen */}
      {stepVerdict && !completedResult && (
        <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5 animate-fade-in">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl shadow-lg">
            {stepVerdict.passed ? (
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <RotateCcw className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Step {stepVerdict.stepIndex + 1} of {totalSteps}: {getStepMetadata(stepVerdict.stepIndex).name}
            </div>
            <h3 className="text-xl font-extrabold text-slate-100">
              {stepVerdict.passed ? `Step ${stepVerdict.stepIndex + 1} Cleared!` : `Try Step ${stepVerdict.stepIndex + 1} Again`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {stepVerdict.passed
                ? `Great rhythm! You achieved ${stepVerdict.result.netWpm} WPM and ${stepVerdict.result.accuracy}% accuracy.`
                : `You scored ${stepVerdict.result.netWpm} WPM (${lesson.requiredWpm} required) and ${stepVerdict.result.accuracy}% accuracy (${lesson.requiredAccuracy}% required).`}
            </p>
          </div>

          {/* Quick mini stats */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Step Speed</span>
              <p className="text-lg font-mono font-bold text-emerald-400">{stepVerdict.result.netWpm} WPM</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Step Accuracy</span>
              <p className="text-lg font-mono font-bold text-cyan-400">{stepVerdict.result.accuracy}%</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            {stepVerdict.passed ? (
              <>
                <button
                  onClick={handleAdvanceNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  <span>Advance to Step {stepVerdict.stepIndex + 2}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRetryCurrentStep}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  Retry Step {stepVerdict.stepIndex + 1}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetryCurrentStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Step {stepVerdict.stepIndex + 1}</span>
                </button>
                <button
                  onClick={() => onNavigate('learn')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  Back to Catalog
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overall Lesson Mastered Verdict Card (Shown after Passing Step 3) */}
      {completedResult && (
        <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg">
            {isOverallPassed ? (
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
              {isOverallPassed ? 'Lesson Mastered!' : 'Keep Practicing'}
            </h2>
            <p className="text-xs text-slate-400">
              {isOverallPassed 
                ? `All 3 sub-drills mastered! You scored ${completedResult.netWpm} WPM with ${completedResult.accuracy}% accuracy.` 
                : `You scored ${completedResult.netWpm} WPM (${lesson.requiredWpm} required) and ${completedResult.accuracy}% accuracy (${lesson.requiredAccuracy}% required).`}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Final Speed</span>
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
          {isOverallPassed && isMilestone && (
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
              onClick={handleRetryLesson}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Lesson (Step 1)</span>
            </button>

            {isOverallPassed && nextLesson && (
              <button
                onClick={handleNextLesson}
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

