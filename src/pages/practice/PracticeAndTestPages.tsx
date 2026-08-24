import React, { useState, useEffect } from 'react';
import { PageRoute, TestMode, TypingResult } from '../../types';
import { 
  PRACTICE_TEXTS, 
  PARAGRAPHS_LIST, 
  PracticeTextItem,
  ParagraphItem 
} from '../../data/practiceTexts';
import { TypingEngine } from '../../components/typing/TypingEngine';
import { useTypingStats } from '../../context/TypingStatsContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  Edit3, 
  Play, 
  Sliders,
  BookOpen,
  ShieldCheck,
  Award,
  User,
  CheckCircle2,
  X,
  FileText
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
  { value: 0, label: 'Untimed', mode: 'paragraph' as TestMode },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'quote', label: 'Quote' },
  { id: 'literature', label: 'Literature' },
  { id: 'code', label: 'Code' },
  { id: 'business', label: 'Business' },
  { id: 'simple', label: 'Simple' },
  { id: 'general', label: 'General' },
  { id: 'pangram', label: 'Pangram' },
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
    return !localStorage.getItem('smarttyping_candidate_name_set');
  });

  // Test Mode & Text Selection (Completely Decoupled)
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedParagraph, setSelectedParagraph] = useState<ParagraphItem>(PARAGRAPHS_LIST[0]);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [testText, setTestText] = useState<string>(PARAGRAPHS_LIST[0].text);

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

  // Duration changes independently without modifying or resetting chosen passage
  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
  };

  // Passage selection independently sets test text without overriding selected duration
  const handleSelectParagraph = (paragraph: ParagraphItem) => {
    setSelectedParagraph(paragraph);
    setIsCustomMode(false);
    setTestText(paragraph.text);
  };

  // Custom text independently sets text without resetting selected duration
  const handleApplyCustomText = () => {
    if (!customInputText.trim()) return;
    setTestText(customInputText.trim());
    setIsCustomMode(true);
  };

  const handleTestComplete = (result: TypingResult) => {
    recordTestCompleted(result);
    onNavigate('results', result);
  };

  const currentMode: TestMode = selectedDuration === 0
    ? 'paragraph'
    : (DURATION_OPTIONS.find(d => d.value === selectedDuration)?.mode || 'timed_60');

  const filteredParagraphs = activeCategory === 'all'
    ? PARAGRAPHS_LIST
    : PARAGRAPHS_LIST.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

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
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-900 dark:text-slate-100 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCandidateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Candidate Exam Entry</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Smart Typing Pro - Official Speed Assessment</p>
              </div>
            </div>

            {/* Candidate Name Form */}
            <form onSubmit={handleStartTestFromModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  This name will be displayed on your verified certification upon qualification.
                </p>
              </div>

              {/* Assessment Guidelines */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exam Guidelines</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Smart Typing Pro - Official Speed Assessment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Official Typing Test</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Candidate: <strong className="text-slate-800 dark:text-slate-200">{candidateName}</strong> • {selectedDuration === 0
              ? 'Untimed Full Passage' 
              : `Timed ${selectedDuration >= 60 ? `${selectedDuration / 60} min` : `${selectedDuration}s`} Test`} • {isCustomMode ? 'Custom Text' : selectedParagraph.title}
          </p>
        </div>

        {/* Action Controls & Candidate Edit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setTempCandidateName(candidateName); setShowCandidateModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Edit Candidate ({candidateName})</span>
          </button>
        </div>
      </div>

      {/* Certification Qualification Criteria Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/5 dark:via-slate-900/90 to-emerald-500/10 border border-amber-500/30 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Official Certification Criteria:</span>{' '}
            <span className="text-slate-600 dark:text-slate-400">Score <strong className="text-emerald-600 dark:text-emerald-400">≥30 Net WPM</strong> and <strong className="text-[#1e3a8a] dark:text-cyan-400">≥95% Accuracy</strong> to earn your Verified Smart Typing Pro Certificate.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 self-end sm:self-auto shrink-0">
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">Silver: 30+ WPM</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">Gold: 50+ WPM</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-cyan-300 border border-blue-500/30">Platinum: 70+ WPM</span>
        </div>
      </div>

      {/* ==================== TOP-STACKED CONTROL PANEL (3 ROWS) ==================== */}
      <div id="top-stacked-exam-controls" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
        {/* ROW 1: Custom Practice Text Input / Paste Box */}
        <div id="controls-row-1-custom-text" className="space-y-2 pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-500" />
              <span>Row 1: Custom Practice Text</span>
            </h3>
            {isCustomMode && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                  Custom Text Active ({testText.split(/\s+/).filter(Boolean).length} words)
                </span>
                <button
                  onClick={() => {
                    setIsCustomMode(false);
                    setTestText(selectedParagraph.text);
                  }}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Reset to Presets
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <textarea
              rows={2}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="Paste or enter custom exam paragraph, technical document, or test text here..."
              className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none shadow-xs"
            />
            <button
              onClick={handleApplyCustomText}
              disabled={!customInputText.trim()}
              className="sm:w-48 py-2.5 px-4 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white border border-[#1e3a8a] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Load Custom Text</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Duration Presets */}
        <div id="controls-row-2-durations" className="space-y-2 pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Row 2: Duration Presets</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((dur) => (
              <button
                key={dur.value}
                id={`test-duration-${dur.label}`}
                onClick={() => handleDurationChange(dur.value)}
                className={`py-2 px-4 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                  selectedDuration === dur.value
                    ? 'bg-[#1e3a8a] text-white shadow-sm font-bold scale-[1.02] border border-[#1e3a8a]'
                    : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 3: Categories & Passages Set */}
        <div id="controls-row-3-categories-passages" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1e3a8a] dark:text-cyan-400" />
              <span>Row 3: Categories & Curated Passages</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Active: <strong className="text-slate-800 dark:text-slate-200">{isCustomMode ? 'Custom Text' : selectedParagraph.title}</strong>
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1e3a8a] text-white font-bold border border-[#1e3a8a] shadow-xs'
                    : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Unique Passages List for Active Category (Strictly actual passages only, no empty boxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {filteredParagraphs.filter(item => !!item && !!item.id).map((item) => {
              const isCurrent = !isCustomMode && selectedParagraph.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectParagraph(item)}
                  className={`text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#1e3a8a]/10 border-2 border-[#1e3a8a] text-[#1e3a8a] dark:text-blue-300 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-950/70 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold truncate">{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-1.5">{item.wordCount}w</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{item.category} • {item.difficulty}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== CENTER MAIN TYPING ARENA (WIDE SONMA 2-BOX STYLE) ==================== */}
      <div id="wide-sonma-typing-arena-container" className="w-full">
        <TypingEngine
          key={`${selectedDuration}-${isCustomMode ? 'custom' : selectedParagraph.id}-${testText.slice(0, 25)}-${candidateName}`}
          practiceText={testText}
          mode={currentMode}
          targetDurationSeconds={selectedDuration > 0 ? selectedDuration : undefined}
          candidateName={candidateName}
          layout="sonma"
          onComplete={handleTestComplete}
          onExit={() => onNavigate('dashboard')}
          onRestart={() => {
            if (isCustomMode && customInputText.trim()) {
              setTestText(customInputText.trim());
            } else {
              setTestText(selectedParagraph.text);
            }
          }}
        />
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
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1e3a8a] dark:text-cyan-400 font-bold uppercase">
          <Play className="w-3.5 h-3.5" /> Freeform Practice Sandbox
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Practice Arena & Drills
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Sharpen muscle memory with curated quotes, literature passages, software code syntax, or paste your own custom training text.
        </p>
      </div>

      {/* Main Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Text Selection & Custom Input (1 Col) */}
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Drill Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'quote', 'literature', 'code', 'business', 'simple', 'general', 'pangram'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setIsCustomMode(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    !isCustomMode && activeCategory === cat
                      ? 'bg-[#1e3a8a] text-white font-bold border border-[#1e3a8a] shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Curated Text List */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 max-h-[300px] overflow-y-auto shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-2">Preset Selections</h3>
            <div className="space-y-1.5">
              {filteredItems.filter(item => !!item && !!item.id).map((item) => {
                const isCurrent = !isCustomMode && selectedTextItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPredefined(item)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#1e3a8a]/10 border-2 border-[#1e3a8a] text-[#1e3a8a] dark:text-blue-300 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-850'
                    }`}
                  >
                    <span className="font-bold truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.author} • {item.difficulty}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Text Input Accordion */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-500" /> Custom Practice Text
            </h3>
            <textarea
              rows={3}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="Paste or write your own custom study notes, code snippet, or paragraph here..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none shadow-xs"
            />
            <button
              onClick={handleApplyCustomText}
              disabled={!customInputText.trim()}
              className="w-full py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white border border-[#1e3a8a] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              Load Custom Text into Arena
            </button>
          </div>
        </div>

        {/* Right: Active Typing Arena (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 rounded-xl text-xs shadow-xs">
            <span className="text-slate-800 dark:text-slate-300 font-semibold truncate">
              {isCustomMode ? 'Custom Text Exercise' : `${selectedTextItem.title} (${selectedTextItem.author})`}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
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
