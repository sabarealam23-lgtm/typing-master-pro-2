import React, { useState, useEffect } from 'react';
import { PageRoute, TestMode, TypingResult } from '../../types';
import { 
  PRACTICE_TEXTS, 
  PARAGRAPHS_LIST, 
  generateDurationPassage, 
  PracticeTextItem,
  ParagraphItem 
} from '../../data/practiceTexts';
import { TypingEngine } from '../../components/typing/TypingEngine';
import { useTypingStats } from '../../context/TypingStatsContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Keyboard, 
  Clock, 
  FileText, 
  Code, 
  Quote, 
  Edit3, 
  Play, 
  RotateCcw, 
  Sliders,
  Sparkles,
  Flame,
  ChevronDown,
  BookOpen,
  Shuffle,
  ShieldCheck,
  Award,
  User,
  CheckCircle2,
  X
} from 'lucide-react';

interface PracticePageProps {
  onNavigate: (page: PageRoute, testResult?: TypingResult) => void;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30s', mode: 'timed_30' as TestMode },
  { value: 60, label: '60s', mode: 'timed_60' as TestMode },
  { value: 120, label: '120s', mode: 'timed_120' as TestMode },
  { value: 300, label: '5m', mode: 'timed_300' as TestMode },
  { value: 600, label: '10m', mode: 'timed_600' as TestMode },
];

// ==================== OFFICIAL TYPING TEST PAGE (SONMA 2-BOX EXAM MODE) ====================
export const TypingTestPage: React.FC<PracticePageProps> = ({ onNavigate }) => {
  const { recordTestCompleted } = useTypingStats();
  const { user } = useAuth();

  // Candidate Name Management
  const initialName = user?.displayName && user.displayName !== 'Guest' 
    ? user.displayName 
    : (localStorage.getItem('smarttyping_candidate_name') || 'Typing Candidate');
  const [candidateName, setCandidateName] = useState<string>(initialName);
  const [tempCandidateName, setTempCandidateName] = useState<string>(initialName);
  const [showCandidateModal, setShowCandidateModal] = useState<boolean>(() => {
    // Show modal if no candidate name stored or on initial entry
    return !localStorage.getItem('smarttyping_candidate_name_set');
  });

  // Test Mode & Text Selection
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [isParagraphMode, setIsParagraphMode] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedParagraph, setSelectedParagraph] = useState<ParagraphItem>(PARAGRAPHS_LIST[0]);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [testText, setTestText] = useState<string>(() => generateDurationPassage(60).text);

  // Sync candidate name if user logs in
  useEffect(() => {
    if (user?.displayName && user.displayName !== 'Guest') {
      setCandidateName(user.displayName);
      setTempCandidateName(user.displayName);
    }
  }, [user]);

  const handleStartTestFromModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = tempCandidateName.trim() || 'Typing Candidate';
    setCandidateName(finalName);
    localStorage.setItem('smarttyping_candidate_name', finalName);
    localStorage.setItem('smarttyping_candidate_name_set', 'true');
    setShowCandidateModal(false);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setIsParagraphMode(false);
    setIsCustomMode(false);
    setTestText(generateDurationPassage(duration).text);
  };

  const handleParagraphMode = () => {
    setIsParagraphMode(true);
    setIsCustomMode(false);
    setTestText(selectedParagraph.text);
  };

  const handleSelectParagraph = (paragraph: ParagraphItem) => {
    setSelectedParagraph(paragraph);
    setIsParagraphMode(true);
    setIsCustomMode(false);
    setTestText(paragraph.text);
  };

  const handleApplyCustomText = () => {
    if (!customInputText.trim()) return;
    setTestText(customInputText.trim());
    setIsCustomMode(true);
    setIsParagraphMode(false);
  };

  const handleTestComplete = (result: TypingResult) => {
    recordTestCompleted(result);
    onNavigate('results', result);
  };

  const currentMode: TestMode = isParagraphMode 
    ? 'paragraph' 
    : isCustomMode
    ? 'custom'
    : (DURATION_OPTIONS.find(d => d.value === selectedDuration)?.mode || 'timed_60');

  const filteredParagraphs = activeCategory === 'all'
    ? PARAGRAPHS_LIST
    : PARAGRAPHS_LIST.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div id="official-typing-test-page" className="w-full max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* ==================== PRE-TEST CANDIDATE NAME POPUP (SONMA STYLE) ==================== */}
      {showCandidateModal && (
        <div 
          id="pre-test-candidate-modal-overlay"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div 
            id="pre-test-candidate-modal"
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCandidateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Candidate Exam Entry</h3>
                <p className="text-xs text-slate-400">Smart Typing Pro & Verified Certification</p>
              </div>
            </div>

            {/* Candidate Name Form */}
            <form onSubmit={handleStartTestFromModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Candidate Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="candidate-name-input-pretest"
                    type="text"
                    required
                    value={tempCandidateName}
                    onChange={(e) => setTempCandidateName(e.target.value)}
                    placeholder="Enter candidate full name..."
                    autoFocus
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm font-medium outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This name will appear on your official PDF & PNG typing certificate upon qualification.
                </p>
              </div>

              {/* Assessment Guidelines */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exam Guidelines</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                  <li>Minimum Speed: <strong>30 Net WPM</strong></li>
                  <li>Minimum Accuracy: <strong>95.0%</strong></li>
                  <li>2-Box Layout: Reference above, Live input below</li>
                </ul>
              </div>

              <button
                id="pretest-start-test-btn"
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Test</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header & Quick Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Smart Typing Pro - Official Speed Assessment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Official Typing Test</h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidate: <strong className="text-slate-200">{candidateName}</strong> • {isParagraphMode 
              ? 'Standalone Paragraph Assessment' 
              : `Timed ${selectedDuration >= 60 ? `${selectedDuration / 60} min` : `${selectedDuration}s`} Test`}
          </p>
        </div>

        {/* Action Controls & Candidate Edit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setTempCandidateName(candidateName); setShowCandidateModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Candidate</span>
          </button>
        </div>
      </div>

      {/* Certification Qualification Criteria Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-emerald-500/10 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200">Official Certification Criteria:</span>{' '}
            <span className="text-slate-400">Score <strong className="text-emerald-400">≥30 Net WPM</strong> and <strong className="text-cyan-400">≥95% Accuracy</strong> to earn your Verified SmartTyping Pro Certificate.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 self-end sm:self-auto shrink-0">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Silver: 30+ WPM</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Gold: 50+ WPM</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Platinum: 70+ WPM</span>
        </div>
      </div>

      {/* ==================== MAIN 3-COLUMN EXAM LAYOUT ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Test Configuration Sidebar (1 Col) */}
        <div className="space-y-5">
          {/* Test Durations */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Exam Duration Presets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur.value}
                  id={`test-duration-${dur.label}`}
                  onClick={() => handleDurationChange(dur.value)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                    !isParagraphMode && !isCustomMode && selectedDuration === dur.value
                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
              <button
                id="test-mode-paragraph"
                onClick={handleParagraphMode}
                className={`py-2 rounded-xl text-xs font-sans font-bold transition-all text-center ${
                  isParagraphMode
                    ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Passage
              </button>
            </div>
          </div>

          {/* Drill & Category Filter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'quote', 'code', 'business', 'literature', 'pangram', 'general'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Passage List */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 max-h-[260px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Preset Passages
            </h3>
            <div className="space-y-1.5">
              {filteredParagraphs.map((item) => {
                const isCurrent = isParagraphMode && selectedParagraph.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectParagraph(item)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 hover:bg-slate-850 text-slate-300 border border-slate-900'
                    }`}
                  >
                    <span className="font-bold truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.category} • {item.wordCount} words</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Practice / Exam Text Input */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Custom Practice Text
            </h3>
            <textarea
              rows={2}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="Paste custom exam paragraph or text..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-200 focus:outline-none resize-none"
            />
            <button
              onClick={handleApplyCustomText}
              disabled={!customInputText.trim()}
              className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Load Custom Text into Arena
            </button>
          </div>
        </div>

        {/* Right: Sonma 2-Box Exam Arena (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <TypingEngine
            key={`${selectedDuration}-${isParagraphMode}-${selectedParagraph.id}-${testText.slice(0, 25)}-${candidateName}`}
            practiceText={testText}
            mode={currentMode}
            targetDurationSeconds={isParagraphMode || isCustomMode ? undefined : selectedDuration}
            candidateName={candidateName}
            layout="sonma"
            onComplete={handleTestComplete}
            onRestart={() => {
              if (!isParagraphMode && !isCustomMode) {
                setTestText(generateDurationPassage(selectedDuration).text);
              } else if (isParagraphMode) {
                setTestText(selectedParagraph.text);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ==================== CUSTOM PRACTICE SANDBOX PAGE ====================
export const PracticePage: React.FC<PracticePageProps> = ({ onNavigate }) => {
  const { recordTestCompleted } = useTypingStats();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTextItem, setSelectedTextItem] = useState<PracticeTextItem>(PRACTICE_TEXTS[0]);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [activeText, setActiveText] = useState<string>(PRACTICE_TEXTS[0].text);

  // Viewport auto-centering on mount
  React.useEffect(() => {
    const arena = document.getElementById('practice-sandbox-page');
    if (arena) {
      arena.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  const filteredItems = activeCategory === 'all' 
    ? PRACTICE_TEXTS 
    : PRACTICE_TEXTS.filter(p => p.category === activeCategory);

  const handleSelectPredefined = (item: PracticeTextItem) => {
    setSelectedTextItem(item);
    setIsCustomMode(false);
    setActiveText(item.text);
  };

  const handleApplyCustomText = () => {
    if (!customInputText.trim()) return;
    setActiveText(customInputText.trim());
    setIsCustomMode(true);
  };

  const handleTestComplete = (result: TypingResult) => {
    recordTestCompleted(result);
    onNavigate('results', result);
  };

  return (
    <div id="practice-sandbox-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold uppercase">
          <Play className="w-3.5 h-3.5" /> Freeform Practice Sandbox
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Practice Arena & Drills
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Sharpen muscle memory with curated quotes, literature passages, software code syntax, or paste your own custom training text.
        </p>
      </div>

      {/* Main Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Text Selection & Custom Input (1 Col) */}
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Drill Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'quote', 'code', 'business', 'literature', 'pangram', 'general'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setIsCustomMode(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    !isCustomMode && activeCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Curated Text List */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 max-h-[300px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Preset Selections</h3>
            <div className="space-y-1.5">
              {filteredItems.map((item) => {
                const isCurrent = !isCustomMode && selectedTextItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPredefined(item)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 hover:bg-slate-850 text-slate-300 border border-slate-900'
                    }`}
                  >
                    <span className="font-bold truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.author} • {item.difficulty}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Text Input Accordion */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Custom Practice Text
            </h3>
            <textarea
              rows={3}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="Paste or write your own custom study notes, code snippet, or paragraph here..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-200 focus:outline-none resize-none"
            />
            <button
              onClick={handleApplyCustomText}
              disabled={!customInputText.trim()}
              className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Load Custom Text into Arena
            </button>
          </div>
        </div>

        {/* Right: Active Typing Arena (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs">
            <span className="text-slate-300 font-semibold truncate">
              {isCustomMode ? 'Custom Text Exercise' : `${selectedTextItem.title} (${selectedTextItem.author})`}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {activeText.split(' ').length} words • {activeText.length} chars
            </span>
          </div>

          <TypingEngine
            key={activeText}
            practiceText={activeText}
            mode="custom"
            layout="standard"
            onComplete={handleTestComplete}
          />
        </div>
      </div>
    </div>
  );
};
