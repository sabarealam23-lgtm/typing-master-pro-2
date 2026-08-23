import React, { useState } from 'react';
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
  Shuffle
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

// ==================== OFFICIAL TYPING TEST PAGE ====================
export const TypingTestPage: React.FC<PracticePageProps> = ({ onNavigate }) => {
  const { recordTestCompleted } = useTypingStats();
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [isParagraphMode, setIsParagraphMode] = useState<boolean>(false);
  const [selectedParagraph, setSelectedParagraph] = useState<ParagraphItem>(PARAGRAPHS_LIST[0]);
  const [testText, setTestText] = useState<string>(() => generateDurationPassage(60).text);

  const handleModeChange = (duration: number) => {
    setSelectedDuration(duration);
    setIsParagraphMode(false);
    setTestText(generateDurationPassage(duration).text);
  };

  const handleParagraphMode = () => {
    setIsParagraphMode(true);
    setTestText(selectedParagraph.text);
  };

  const handleSelectParagraph = (paragraphId: string) => {
    const item = PARAGRAPHS_LIST.find(p => p.id === paragraphId) || PARAGRAPHS_LIST[0];
    setSelectedParagraph(item);
    setIsParagraphMode(true);
    setTestText(item.text);
  };

  const handleRandomParagraph = () => {
    const randomIndex = Math.floor(Math.random() * PARAGRAPHS_LIST.length);
    const item = PARAGRAPHS_LIST[randomIndex];
    setSelectedParagraph(item);
    setIsParagraphMode(true);
    setTestText(item.text);
  };

  const handleTestComplete = (result: TypingResult) => {
    recordTestCompleted(result);
    onNavigate('results', result);
  };

  const currentMode: TestMode = isParagraphMode 
    ? 'paragraph' 
    : (DURATION_OPTIONS.find(d => d.value === selectedDuration)?.mode || 'timed_60');

  return (
    <div id="official-typing-test-page" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase mb-1">
            <Clock className="w-3.5 h-3.5" /> Official Speed Benchmark
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Typing Speed Test</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isParagraphMode 
              ? 'Complete the selected standalone paragraph with maximum accuracy' 
              : `Timed ${selectedDuration >= 60 ? `${selectedDuration / 60} min` : `${selectedDuration} sec`} challenge • Continuous multi-paragraph stream`}
          </p>
        </div>

        {/* Timed Durations Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {DURATION_OPTIONS.map((dur) => (
            <button
              key={dur.value}
              id={`test-duration-${dur.label}`}
              onClick={() => handleModeChange(dur.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                !isParagraphMode && selectedDuration === dur.value
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {dur.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            id="test-mode-paragraph"
            onClick={handleParagraphMode}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-all ${
              isParagraphMode
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Paragraph
          </button>
        </div>
      </div>

      {/* Paragraph Selection Bar (Visible in Paragraph Mode) */}
      {isParagraphMode && (
        <div 
          id="paragraph-selection-toolbar"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-300 shrink-0">Choose Paragraph:</span>
            <div className="relative flex-1 max-w-md">
              <select
                id="paragraph-dropdown-selector"
                value={selectedParagraph.id}
                onChange={(e) => handleSelectParagraph(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-100 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer"
              >
                {PARAGRAPHS_LIST.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200 py-1">
                    {p.title} ({p.category} • {p.wordCount} words)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
              {selectedParagraph.wordCount} words • {selectedParagraph.difficulty}
            </span>
            <button
              onClick={handleRandomParagraph}
              title="Pick a random paragraph"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold border border-slate-700 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random</span>
            </button>
          </div>
        </div>
      )}

      {/* Embedded Typing Engine */}
      <TypingEngine
        key={`${selectedDuration}-${isParagraphMode}-${selectedParagraph.id}-${testText.slice(0, 20)}`}
        practiceText={testText}
        mode={currentMode}
        targetDurationSeconds={isParagraphMode ? undefined : selectedDuration}
        onComplete={handleTestComplete}
        onRestart={() => {
          if (!isParagraphMode) {
            setTestText(generateDurationPassage(selectedDuration).text);
          } else {
            setTestText(selectedParagraph.text);
          }
        }}
      />
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
              {['all', 'quote', 'literature', 'code', 'business', 'pangram'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setIsCustomMode(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    !isCustomMode && activeCategory === cat
                      ? 'bg-emerald-500 text-slate-950'
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
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
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
              className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors disabled:opacity-50"
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
            onComplete={handleTestComplete}
          />
        </div>
      </div>
    </div>
  );
};
