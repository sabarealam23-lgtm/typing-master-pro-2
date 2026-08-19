export interface PracticeTextItem {
  id: string;
  category: 'quote' | 'literature' | 'code' | 'business' | 'pangram' | 'general';
  title: string;
  author?: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ParagraphItem {
  id: string;
  title: string;
  category: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
}

export const PRACTICE_TEXTS: PracticeTextItem[] = [
  {
    id: 'pt-1',
    category: 'pangram',
    title: 'The Classic Fox Pangram',
    author: 'Traditional',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.',
    difficulty: 'easy',
  },
  {
    id: 'pt-2',
    category: 'quote',
    title: 'Simplicity and Clarity',
    author: 'Steve Jobs',
    text: 'Simple can be harder than complex: You have to work hard to get your thinking clean to make it simple. But it is worth it in the end because once you get there, you can move mountains.',
    difficulty: 'medium',
  },
  {
    id: 'pt-3',
    category: 'literature',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.',
    difficulty: 'medium',
  },
  {
    id: 'pt-4',
    category: 'general',
    title: 'The Art of Touch Typing',
    author: 'Typing Master Pro',
    text: 'Touch typing is the ability to use muscle memory to find keys fast without using the sense of sight. It eliminates the cognitive tax of searching for individual letters on the keyboard and allows your conscious mind to focus purely on composition, creativity, and flow.',
    difficulty: 'easy',
  },
  {
    id: 'pt-5',
    category: 'business',
    title: 'Executive Communication',
    author: 'Professional Management',
    text: 'Effective leadership requires unambiguous correspondence, rapid decision turnaround, and coherent project documentation. Delivering concise feedback while respecting team velocity ensures sustained organizational momentum across global quarters.',
    difficulty: 'medium',
  },
  {
    id: 'pt-6',
    category: 'code',
    title: 'TypeScript Architecture Drill',
    author: 'Software Engineering',
    text: 'interface CacheStore<T> { get(key: string): Promise<T | null>; set(key: string, value: T, ttlMs?: number): Promise<void>; clear(): void; }',
    difficulty: 'hard',
  },
  {
    id: 'pt-7',
    category: 'literature',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    text: 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing anyone, just remember that all the people in this world have not had the advantages that you have had.',
    difficulty: 'medium',
  },
  {
    id: 'pt-8',
    category: 'quote',
    title: 'Mastery and Discipline',
    author: 'Bruce Lee',
    text: 'I fear not the man who has practiced ten thousand kicks once, but I fear the man who has practiced one kick ten thousand times. Consistency and deliberate focus surpass sporadic bursts of effort.',
    difficulty: 'easy',
  },
  {
    id: 'pt-9',
    category: 'general',
    title: 'Digital Ergonomics & Focus',
    author: 'Ergonomic Society',
    text: 'Keep your elbows bent at ninety degrees, relax your shoulders, align your screen at eye level, and take periodic micro-breaks every twenty minutes. Good ergonomics prevent repetitive strain and protect cognitive endurance over hours of intense computing.',
    difficulty: 'medium',
  },
  {
    id: 'pt-10',
    category: 'code',
    title: 'Async Functions & State',
    author: 'Web Development',
    text: 'async function fetchMetrics(endpoint: string, retries = 3): Promise<Record<string, number>> { const res = await fetch(endpoint); if (!res.ok) throw new Error("HTTP Error " + res.status); return res.json(); }',
    difficulty: 'hard',
  }
];

export const PARAGRAPHS_LIST: ParagraphItem[] = [
  {
    id: 'p-1',
    title: 'The Art of Touch Typing',
    category: 'Skill & Mastery',
    difficulty: 'easy',
    text: 'Touch typing transforms the physical keyboard from a mechanical barrier into a direct extension of your thoughts. By resting your index fingers on the tactile home bumps of the F and J keys, every character becomes reachable through subconscious reflex. Speed naturally emerges when smooth accuracy leads the way.',
    wordCount: 49
  },
  {
    id: 'p-2',
    title: 'Deep Work & Cognitive Flow',
    category: 'Productivity',
    difficulty: 'medium',
    text: 'Cultivating deep focus requires carving out quiet sanctuaries within our noisy digital world. When you silence notifications and immerse yourself in a challenging task, your brain enters a state of cognitive flow. Distractions fragment attention, but sustained concentration yields work of enduring depth and craft.',
    wordCount: 47
  },
  {
    id: 'p-3',
    title: 'Modern Software Engineering',
    category: 'Technology',
    difficulty: 'medium',
    text: 'Modern software engineering relies on reliable abstractions, modular architectures, and disciplined testing paradigms. When systems scale across thousands of distributed servers, clarity of design becomes paramount. Clean code is not merely aesthetic; it reduces operational risk and enables collaborative teams to innovate with quiet confidence.',
    wordCount: 47
  },
  {
    id: 'p-4',
    title: 'Oceans & Marine Sanctuaries',
    category: 'Nature & Science',
    difficulty: 'easy',
    text: 'Beneath the sunlit surface of the open ocean lies an ecosystem of immense complexity and tranquil beauty. Coral reefs shimmer with vibrant marine life, while gentle deep-sea currents transport nutrients across vast aquatic trenches. Exploring these underwater realms reminds us of the delicate balance sustaining our planet.',
    wordCount: 49
  },
  {
    id: 'p-5',
    title: 'Astronomy & The Cosmos',
    category: 'Science',
    difficulty: 'medium',
    text: "On a crisp, cloudless night, looking up at the canopy of stars reveals the quiet grandeur of the cosmos. Distant galaxies emit light that traveled across billions of years to reach our eyes. Each telescope launched into orbit expands our understanding of cosmic origins and humanity's place in the universe.",
    wordCount: 50
  },
  {
    id: 'p-6',
    title: 'Urban Architecture & Cities',
    category: 'Architecture',
    difficulty: 'medium',
    text: 'Great cities are living tapestries woven from centuries of history, architectural innovation, and communal energy. Narrow cobblestone alleys open into bustling marketplaces, while soaring glass towers reflect the sunset. The rhythm of footsteps, streetcars, and conversations creates an inspiring urban symphony.',
    wordCount: 43
  },
  {
    id: 'p-7',
    title: 'Mountain Summits & Wilderness',
    category: 'Adventure',
    difficulty: 'easy',
    text: 'Standing atop an alpine summit at dawn, the cool wind carries the scent of pine and fresh morning frost. Jagged granite peaks stretch across the horizon, bathed in amber sunlight. In such untamed wilderness, one discovers both physical resilience and a profound sense of inner stillness.',
    wordCount: 46
  },
  {
    id: 'p-8',
    title: 'The Craft of Clear Writing',
    category: 'Literature',
    difficulty: 'medium',
    text: 'Writing well is an act of empathy for the reader. Choosing the exact word, balancing sentence rhythm, and discarding superfluous adjectives requires patience and relentless revision. A thoughtful paragraph can clarify complex dilemmas and spark creative curiosity in unexpected ways.',
    wordCount: 41
  },
  {
    id: 'p-9',
    title: 'Everyday Mindfulness',
    category: 'Wellness',
    difficulty: 'easy',
    text: 'Taking a deliberate breath in the middle of a busy day grounds our wandering thoughts in the present moment. Notice the ambient sound of rain against the window, the warmth of a morning beverage, and the subtle sensation of relaxation spreading across your shoulders.',
    wordCount: 44
  },
  {
    id: 'p-10',
    title: 'Lifelong Learning & Curiosity',
    category: 'Education',
    difficulty: 'medium',
    text: 'Genuine education is not the passive accumulation of static facts, but the continuous refinement of critical thinking and intellectual curiosity. Asking thoughtful questions often illuminates more truth than memorizing easy answers. A lifelong learner approaches every challenge with humility and enthusiasm.',
    wordCount: 43
  },
  {
    id: 'p-11',
    title: 'Engineering Innovation',
    category: 'Technology',
    difficulty: 'medium',
    text: 'From renewable energy grids to lightweight aerospace materials, technological breakthroughs begin with small experimental prototypes. Iterative problem solving allows engineers to test hypotheses, analyze anomalies, and refine complex systems until theoretical ideas transform into reliable everyday infrastructure.',
    wordCount: 41
  },
  {
    id: 'p-12',
    title: 'Ancient Temperate Forests',
    category: 'Nature',
    difficulty: 'easy',
    text: 'Ancient temperate forests harbor intricate underground fungal networks that connect towering trees across miles of woodland. Sunlight filters through the lush canopy, casting dappled emerald shadows on mossy riverbanks. These woodland sanctuaries provide essential shelter for countless bird and mammal species.',
    wordCount: 43
  },
  {
    id: 'p-13',
    title: 'High-Performance Habits',
    category: 'Productivity',
    difficulty: 'easy',
    text: 'Excellence is rarely an accident; it is the compound interest of daily habits practiced with steady discipline. Whether training as an athlete, practicing an instrument, or refining a vocational craft, small daily improvements inevitably culminate in remarkable long-term achievements.',
    wordCount: 40
  },
  {
    id: 'p-14',
    title: 'The Ancient Silk Road',
    category: 'History',
    difficulty: 'medium',
    text: 'Caravans along the ancient Silk Road transported silk, ceramics, and spices across treacherous mountain passes and sun-baked desert dunes. Beyond precious commodities, these travelers exchanged scientific treatises, philosophical ideas, and musical traditions that permanently reshaped human civilization.',
    wordCount: 41
  },
  {
    id: 'p-15',
    title: 'Artificial Intelligence & Ethics',
    category: 'Technology',
    difficulty: 'hard',
    text: 'As computational intelligence advances, the collaboration between human creativity and algorithmic precision opens unprecedented frontiers. Automated models can rapidly process immense datasets, yet the discernment of moral values, empathy, and artistic intent remains a uniquely human responsibility.',
    wordCount: 39
  },
  {
    id: 'p-16',
    title: 'The Psychology of Optimal Flow',
    category: 'Psychology',
    difficulty: 'medium',
    text: 'Psychologists describe flow as the optimal mental state where challenge and skill meet in perfect harmony. During flow, self-consciousness vanishes, time seems to stretch or contract, and every keystroke or brushstroke flows seamlessly into the next with effortless momentum.',
    wordCount: 41
  },
  {
    id: 'p-17',
    title: 'Coastal Lighthouses & Sea',
    category: 'Exploration',
    difficulty: 'easy',
    text: 'Perched upon windswept rocky cliffs, historic lighthouses have guided sailors safely through dense fog and turbulent coastal waters for generations. The steady rhythmic sweep of their beacons offers reassurance to weary navigators returning home after long journeys across the sea.',
    wordCount: 42
  },
  {
    id: 'p-18',
    title: 'High-Trust Collaborative Teams',
    category: 'Leadership',
    difficulty: 'medium',
    text: 'High-performing teams thrive on psychological safety, mutual respect, and transparent communication. When team members feel secure sharing unconventional ideas or highlighting potential flaws, the collective intelligence of the group far surpasses the insight of any single individual.',
    wordCount: 39
  },
  {
    id: 'p-19',
    title: 'Precision Mechanical Horology',
    category: 'Craftsmanship',
    difficulty: 'hard',
    text: 'Master watchmakers assemble intricate mechanical movements containing hundreds of microscopic gears, rubies, and hairsprings. Operating without electrical currents, these mechanical chronometers measure seconds with rhythmic escapement beats, celebrating centuries of horological precision.',
    wordCount: 35
  },
  {
    id: 'p-20',
    title: 'The Balance of Typography',
    category: 'Design',
    difficulty: 'medium',
    text: "The art of typography balances letterforms, kerning, leading, and negative space to make written language both legible and visually harmonious. A well-chosen typeface establishes an immediate atmosphere, subtly guiding the reader's eye across the printed or digital page.",
    wordCount: 41
  }
];

export const NATURAL_PARAGRAPH_POOL: string[] = PARAGRAPHS_LIST.map(p => p.text);

export const TIMED_TEST_WORD_BANK = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by',
  'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can',
  'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new',
  'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such',
  'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back',
  'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel',
  'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand', 'old', 'life', 'tell', 'write', 'become',
  'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under', 'last', 'right', 'move', 'thing', 'general',
  'school', 'never', 'same', 'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form',
  'child', 'few', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow',
  'during', 'present', 'without', 'again', 'hold', 'govern', 'around', 'possible', 'head', 'consider', 'word', 'program', 'problem',
  'however', 'lead', 'system', 'set', 'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact', 'group', 'play', 'stand', 'increase',
  'early', 'course', 'change', 'help', 'line'
];

export function generateTimedWords(wordCount: number = 100): string {
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * TIMED_TEST_WORD_BANK.length);
    result.push(TIMED_TEST_WORD_BANK[randomIndex]);
  }
  return result.join(' ');
}

export function generateDurationPassage(durationSeconds: number): { text: string; paragraphCount: number; usedIndices: number[] } {
  let neededParagraphs = 2;

  if (durationSeconds <= 30) {
    neededParagraphs = 2;
  } else if (durationSeconds <= 60) {
    neededParagraphs = 4;
  } else if (durationSeconds <= 120) {
    neededParagraphs = 8;
  } else if (durationSeconds <= 300) {
    neededParagraphs = 18;
  } else {
    neededParagraphs = 36;
  }

  const pool = NATURAL_PARAGRAPH_POOL;
  const indices: number[] = Array.from({ length: pool.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const selectedParagraphs: string[] = [];
  const usedIndices: number[] = [];

  for (let i = 0; i < neededParagraphs; i++) {
    const poolIndex = indices[i % indices.length];
    selectedParagraphs.push(pool[poolIndex]);
    usedIndices.push(poolIndex);
  }

  return {
    text: selectedParagraphs.join('\n'),
    paragraphCount: selectedParagraphs.length,
    usedIndices,
  };
}

export function getAdditionalNaturalParagraphs(count: number = 3, recentIndices: number[] = []): { text: string; newIndices: number[] } {
  const pool = NATURAL_PARAGRAPH_POOL;
  const recentSet = new Set(recentIndices.slice(-10));
  let availableIndices = Array.from({ length: pool.length }, (_, i) => i)
    .filter(i => !recentSet.has(i));

  if (availableIndices.length === 0) {
    availableIndices = Array.from({ length: pool.length }, (_, i) => i);
  }

  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }

  const picked: string[] = [];
  const newIndices: number[] = [];

  for (let i = 0; i < count; i++) {
    const idx = availableIndices[i % availableIndices.length];
    picked.push(pool[idx]);
    newIndices.push(idx);
  }

  return {
    text: picked.join('\n'),
    newIndices,
  };
}
