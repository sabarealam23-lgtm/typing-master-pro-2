import React, { useState } from 'react';
import { PageRoute, Lesson, DifficultyLevel, TypingResult } from '../../types';
import { LESSONS_DATA } from '../../data/lessons';
import { useTypingStats } from '../../context/TypingStatsContext';
import { TypingEngine } from '../../components/typing/TypingEngine';
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
  Target
} from 'lucide-react';

interface LessonsPageProps {
  onNavigate: (page: PageRoute, lesson?: Lesson) => void;
}

// ==================== LESSONS CATALOG PAGE ====================
export const LessonsPage: React.FC<LessonsPageProps> = ({ onNavigate }) => {
  const { lessonProgress } = useTypingStats();
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('beginner');

  const filteredLessons = LESSONS_DATA.filter(l => l.level === selectedLevel);

  const getLevelProgressSummary = (level: DifficultyLevel) => {
    const levelLessons = LESSONS_DATA.filter(l => l.level === level);
    const completedCount = levelLessons.filter(l => lessonProgress[l.id]?.completed).length;
    return { completedCount, total: levelLessons.length };
  };

  const begProg = getLevelProgressSummary('beginner');
  const intProg = getLevelProgressSummary('intermediate');
  const advProg = getLevelProgressSummary('advanced');

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
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, idx) => {
          const prog = lessonProgress[lesson.id];
          const isCompleted = prog?.completed;
          const stars = prog?.stars || 0;

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

                <h3 className="text-base font-bold text-slate-100">{lesson.title}</h3>
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
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
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
  const { recordTestCompleted, lessonProgress } = useTypingStats();
  const [completedResult, setCompletedResult] = useState<TypingResult | null>(null);

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

  const isCompleted = completedResult !== null;

  const handleNextLesson = React.useCallback(() => {
    if (isPassed && nextLesson) {
      setCompletedResult(null);
      onNavigate('lesson-view', nextLesson);
    } else {
      // If not passed or no next lesson, retry
      setCompletedResult(null);
    }
  }, [isPassed, nextLesson, onNavigate]);

  // Scoped Enter listener active only when modal is completed (isCompleted === true)
  React.useEffect(() => {
    if (!isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextLesson();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCompleted, handleNextLesson]);

  return (
    <div id="active-lesson-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button & Lesson header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('learn')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
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

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <button
              onClick={() => setCompletedResult(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                <span>Next Lesson ({nextLesson.order})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigate('learn')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
