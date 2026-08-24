export interface PracticeTextItem {
  id: string;
  category: 'quote' | 'literature' | 'code' | 'business' | 'simple' | 'pangram' | 'general';
  title: string;
  author?: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ParagraphItem {
  id: string;
  title: string;
  category: 'Quote' | 'Literature' | 'Code' | 'Business' | 'Simple' | 'Pangram' | 'General';
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
}

export const PRACTICE_TEXTS: PracticeTextItem[] = [
  // ==================== QUOTES ====================
  {
    id: 'pt-quote-1',
    category: 'quote',
    title: 'Simplicity and Clarity',
    author: 'Steve Jobs',
    text: 'Simple can be harder than complex: You have to work hard to get your thinking clean to make it simple. But it is worth it in the end because once you get there, you can move mountains.',
    difficulty: 'medium',
  },
  {
    id: 'pt-quote-2',
    category: 'quote',
    title: 'Mastery and Deliberate Practice',
    author: 'Bruce Lee',
    text: 'I fear not the man who has practiced ten thousand kicks once, but I fear the man who has practiced one kick ten thousand times. Consistency and deliberate focus surpass sporadic bursts of effort.',
    difficulty: 'easy',
  },
  {
    id: 'pt-quote-3',
    category: 'quote',
    title: 'Imagination and Relativity',
    author: 'Albert Einstein',
    text: 'Imagination is more important than knowledge. For knowledge is limited to all we now know and understand, while imagination embraces the entire world, and all there ever will be to know and understand.',
    difficulty: 'medium',
  },
  {
    id: 'pt-quote-4',
    category: 'quote',
    title: 'Courage and Daily Choice',
    author: 'Eleanor Roosevelt',
    text: 'You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face. You must do the thing you think you cannot do.',
    difficulty: 'easy',
  },
  {
    id: 'pt-quote-5',
    category: 'quote',
    title: 'Inner Sovereignty and Equilibrium',
    author: 'Marcus Aurelius',
    text: 'You have power over your mind, not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts.',
    difficulty: 'medium',
  },

  // ==================== LITERATURE ====================
  {
    id: 'pt-lit-1',
    category: 'literature',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.',
    difficulty: 'medium',
  },
  {
    id: 'pt-lit-2',
    category: 'literature',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    text: 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing anyone, just remember that all the people in this world have not had the advantages that you have had.',
    difficulty: 'medium',
  },
  {
    id: 'pt-lit-3',
    category: 'literature',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood.',
    difficulty: 'medium',
  },
  {
    id: 'pt-lit-4',
    category: 'literature',
    title: 'Moby Dick',
    author: 'Herman Melville',
    text: 'Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
    difficulty: 'medium',
  },
  {
    id: 'pt-lit-5',
    category: 'literature',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    text: 'Saturday morning was come, and all the summer world was bright and fresh, and brimming with life. There was a song in every heart; and if the heart was young the music came at the lips. There was cheer in every face and a spring in every step.',
    difficulty: 'easy',
  },

  // ==================== CODE ====================
  {
    id: 'pt-code-1',
    category: 'code',
    title: 'TypeScript CacheStore Interface',
    author: 'Software Engineering',
    text: 'interface CacheStore<T> { get(key: string): Promise<T | null>; set(key: string, value: T, ttlMs?: number): Promise<void>; clear(): void; }',
    difficulty: 'hard',
  },
  {
    id: 'pt-code-2',
    category: 'code',
    title: 'Async Fetch with Retries',
    author: 'Web Development',
    text: 'async function fetchMetrics(endpoint: string, retries = 3): Promise<Record<string, number>> { const res = await fetch(endpoint); if (!res.ok) throw new Error("HTTP Error " + res.status); return res.json(); }',
    difficulty: 'hard',
  },
  {
    id: 'pt-code-3',
    category: 'code',
    title: 'Python Binary Search Implementation',
    author: 'Algorithms',
    text: 'def binary_search(arr: list[int], target: int) -> int: low, high = 0, len(arr) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] < target: low = mid + 1\n    else: high = mid - 1\nreturn -1',
    difficulty: 'hard',
  },
  {
    id: 'pt-code-4',
    category: 'code',
    title: 'SQL Aggregation and Partition Query',
    author: 'Database Engineering',
    text: 'SELECT department_id, employee_id, salary, AVG(salary) OVER (PARTITION BY department_id) as dept_avg_salary, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank FROM corporate_payroll WHERE active = true;',
    difficulty: 'hard',
  },
  {
    id: 'pt-code-5',
    category: 'code',
    title: 'React Custom Keydown Hook',
    author: 'Frontend Engineering',
    text: 'export function useKeyCombo(targetKey: string, handler: () => void) { useEffect(() => { const onKeyDown = (e: KeyboardEvent) => { if (e.key === targetKey && !e.repeat) handler(); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [targetKey, handler]); }',
    difficulty: 'hard',
  },

  // ==================== BUSINESS ====================
  {
    id: 'pt-biz-1',
    category: 'business',
    title: 'Executive Communication',
    author: 'Professional Management',
    text: 'Effective leadership requires unambiguous correspondence, rapid decision turnaround, and coherent project documentation. Delivering concise feedback while respecting team velocity ensures sustained organizational momentum across global quarters.',
    difficulty: 'medium',
  },
  {
    id: 'pt-biz-2',
    category: 'business',
    title: 'Quarterly Strategic Alignment',
    author: 'Corporate Operations',
    text: 'Our primary objective for the second quarter is expanding customer lifetime value while streamlining operational expenditures. Cross-functional alignment between product engineering and enterprise sales will accelerate our expansion into high-growth international markets.',
    difficulty: 'medium',
  },
  {
    id: 'pt-biz-3',
    category: 'business',
    title: 'Customer Success & Retention Metrics',
    author: 'Enterprise Advisory',
    text: 'Retaining high-value clients depends on proactive account reviews, clear service level agreements, and responsive technical support. Monitoring net revenue retention and customer health scores allows us to preempt renewal bottlenecks well in advance.',
    difficulty: 'medium',
  },
  {
    id: 'pt-biz-4',
    category: 'business',
    title: 'Data-Driven Risk Management',
    author: 'Executive Finance',
    text: 'Prudent fiscal management balances calculated market expansion with strict liquidity reserves and diversified portfolio allocations. Regular stress testing and scenario modeling safeguard operational capital against macro market volatility.',
    difficulty: 'hard',
  },

  // ==================== SIMPLE ====================
  {
    id: 'pt-sim-1',
    category: 'simple',
    title: 'Morning Sun over Green Hills',
    author: 'Easy Phrasing',
    text: 'The warm morning sun came up over the green hills. Birds began to sing softly in the tall oak trees. It was a fresh, peaceful day to walk down the quiet garden path and enjoy the cool breeze.',
    difficulty: 'easy',
  },
  {
    id: 'pt-sim-2',
    category: 'simple',
    title: 'Fresh Bread in the Kitchen',
    author: 'Easy Phrasing',
    text: 'Fresh bread was baking in the warm oven. The sweet aroma filled the room with comfort. A bowl of ripe red apples sat upon the wooden table next to a cup of warm tea.',
    difficulty: 'easy',
  },
  {
    id: 'pt-sim-3',
    category: 'simple',
    title: 'Afternoon at the Library',
    author: 'Easy Phrasing',
    text: 'Rows of neat books lined the quiet wooden shelves. Sunlight streamed through the tall glass window onto the study desk. It was easy to sit, read, and learn in such a calm place.',
    difficulty: 'easy',
  },
  {
    id: 'pt-sim-4',
    category: 'simple',
    title: 'Gentle Rain on the Rooftop',
    author: 'Easy Phrasing',
    text: 'Soft rain fell steadily against the windowpane. Small drops slid down the clear glass into the garden below. Inside the warm house, everything was calm, still, and pleasant.',
    difficulty: 'easy',
  },

  // ==================== PANGRAMS ====================
  {
    id: 'pt-pan-1',
    category: 'pangram',
    title: 'The Classic Fox Pangram',
    author: 'Traditional',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.',
    difficulty: 'easy',
  },
  {
    id: 'pt-pan-2',
    category: 'pangram',
    title: 'Sphinx & Black Quartz',
    author: 'Typing Drill',
    text: 'Sphinx of black quartz, judge my vow! The five boxing wizards jump quickly. How razorback-jumping frogs can level six piqued gymnasts! Cozy sphinx waves back from jigsaw cliff.',
    difficulty: 'easy',
  },
  {
    id: 'pt-pan-3',
    category: 'pangram',
    title: 'Jackdaws & Quartz Jewels',
    author: 'Alphabet Master',
    text: 'Jackdaws love my big sphinx of quartz. Six crazy kings vowed to quiz the lazy dwarf about prized jumping fox gems. Blowzy red night-frumps vexing quick pyx quaffers.',
    difficulty: 'medium',
  },
  {
    id: 'pt-pan-4',
    category: 'pangram',
    title: 'Wizards & Quizzical Prizefights',
    author: 'Keyboard Gymnast',
    text: 'A quick movement of the enemy will jeopardize six gunboats. Crazy Frederick bought many very exquisite opal jewels. The job requires extra pluck and zeal from every young wage earner.',
    difficulty: 'medium',
  },

  // ==================== GENERAL ====================
  {
    id: 'pt-gen-1',
    category: 'general',
    title: 'The Art of Touch Typing',
    author: 'SmartTypingPro',
    text: 'Touch typing is the ability to use muscle memory to find keys fast without using the sense of sight. It eliminates the cognitive tax of searching for individual letters on the keyboard and allows your conscious mind to focus purely on composition, creativity, and flow.',
    difficulty: 'easy',
  },
  {
    id: 'pt-gen-2',
    category: 'general',
    title: 'Digital Ergonomics & Focus',
    author: 'Ergonomic Society',
    text: 'Keep your elbows bent at ninety degrees, relax your shoulders, align your screen at eye level, and take periodic micro-breaks every twenty minutes. Good ergonomics prevent repetitive strain and protect cognitive endurance over hours of intense computing.',
    difficulty: 'medium',
  },
  {
    id: 'pt-gen-3',
    category: 'general',
    title: 'Left & Right Hand Finger Coordination',
    author: 'Hand Drill Series',
    text: 'Left pinky taps a and q, left ring hits s and w, left middle guides d and e, left index handles f and r. Right index controls j and u, right middle manages k and i, right ring directs l and o, right pinky commands semicolon and p.',
    difficulty: 'medium',
  }
];

export const PARAGRAPHS_LIST: ParagraphItem[] = [
  // ==================== QUOTE CATEGORY ====================
  {
    id: 'p-quote-1',
    title: 'Simplicity & Vision (Steve Jobs)',
    category: 'Quote',
    difficulty: 'medium',
    text: 'Simple can be harder than complex: You have to work hard to get your thinking clean to make it simple. But it is worth it in the end because once you get there, you can move mountains with clarity and focus.',
    wordCount: 42
  },
  {
    id: 'p-quote-2',
    title: 'Mastery & Deliberate Practice (Bruce Lee)',
    category: 'Quote',
    difficulty: 'easy',
    text: 'I fear not the man who has practiced ten thousand kicks once, but I fear the man who has practiced one kick ten thousand times. Consistency, quiet rhythm, and deliberate focus surpass sporadic bursts of effort.',
    wordCount: 37
  },
  {
    id: 'p-quote-3',
    title: 'Imagination & Cosmic Wonder (Albert Einstein)',
    category: 'Quote',
    difficulty: 'medium',
    text: 'Imagination is more important than knowledge. For knowledge is limited to all we now know and understand, while imagination embraces the entire world, stimulating progress and giving birth to future evolution.',
    wordCount: 32
  },
  {
    id: 'p-quote-4',
    title: 'Courage & Facing Fear (Eleanor Roosevelt)',
    category: 'Quote',
    difficulty: 'easy',
    text: 'You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face. You are able to say to yourself, I have lived through this horror; I can take the next thing that comes along.',
    wordCount: 44
  },
  {
    id: 'p-quote-5',
    title: 'Inner Sovereignty & Judgment (Marcus Aurelius)',
    category: 'Quote',
    difficulty: 'medium',
    text: 'You have power over your mind, not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts; therefore, guard accordingly.',
    wordCount: 31
  },
  {
    id: 'p-quote-6',
    title: 'Perseverance & Victory (Nelson Mandela)',
    category: 'Quote',
    difficulty: 'easy',
    text: 'It always seems impossible until it is done. The greatest glory in living lies not in never falling, but in rising every time we fall. Dedication and persistent effort always carve a way forward.',
    wordCount: 35
  },

  // ==================== LITERATURE CATEGORY ====================
  {
    id: 'p-lit-1',
    title: 'A Tale of Two Cities (Charles Dickens)',
    category: 'Literature',
    difficulty: 'medium',
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.',
    wordCount: 48
  },
  {
    id: 'p-lit-2',
    title: 'The Great Gatsby (F. Scott Fitzgerald)',
    category: 'Literature',
    difficulty: 'medium',
    text: 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing anyone, just remember that all the people in this world have not had the advantages that you have had.',
    wordCount: 49
  },
  {
    id: 'p-lit-3',
    title: 'Pride & Prejudice (Jane Austen)',
    category: 'Literature',
    difficulty: 'medium',
    text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is well fixed.',
    wordCount: 47
  },
  {
    id: 'p-lit-4',
    title: 'Moby Dick (Herman Melville)',
    category: 'Literature',
    difficulty: 'medium',
    text: 'Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen.',
    wordCount: 54
  },
  {
    id: 'p-lit-5',
    title: 'Tom Sawyer (Mark Twain)',
    category: 'Literature',
    difficulty: 'easy',
    text: 'Saturday morning was come, and all the summer world was bright and fresh, and brimming with life. There was a song in every heart; and if the heart was young the music came at the lips. There was cheer in every face and a spring in every step.',
    wordCount: 48
  },
  {
    id: 'p-lit-6',
    title: 'A Study in Scarlet (Arthur Conan Doyle)',
    category: 'Literature',
    difficulty: 'medium',
    text: 'There is a mystery about this which stimulates the imagination; where there is no imagination there is no horror. We must look for consistency in human motives and deduce the hidden truth from minor observations.',
    wordCount: 36
  },

  // ==================== CODE CATEGORY ====================
  {
    id: 'p-code-1',
    title: 'TypeScript Interface & Generic Cache',
    category: 'Code',
    difficulty: 'hard',
    text: 'export interface CacheManager<T> { get(key: string): Promise<T | null>; set(key: string, value: T, ttlMs?: number): Promise<void>; invalidate(pattern: string): Promise<number>; has(key: string): boolean; }',
    wordCount: 29
  },
  {
    id: 'p-code-2',
    title: 'Async Retry & Error Handling Function',
    category: 'Code',
    difficulty: 'hard',
    text: 'async function fetchMetrics(endpoint: string, retries = 3): Promise<Record<string, number>> { for (let i = 0; i < retries; i++) { try { const res = await fetch(endpoint); if (res.ok) return await res.json(); } catch (err) { if (i === retries - 1) throw err; } } throw new Error("Retry limit exceeded"); }',
    wordCount: 52
  },
  {
    id: 'p-code-3',
    title: 'Python Binary Search Algorithm',
    category: 'Code',
    difficulty: 'hard',
    text: 'def binary_search(nums: list[int], target: int) -> int: low, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target: return mid\n    elif nums[mid] < target: low = mid + 1\n    else: high = mid - 1\nreturn -1',
    wordCount: 42
  },
  {
    id: 'p-code-4',
    title: 'SQL Window Partition & Ranking Query',
    category: 'Code',
    difficulty: 'hard',
    text: 'SELECT department_id, employee_id, salary, AVG(salary) OVER (PARTITION BY department_id) as dept_average, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank FROM corporate_roster WHERE status = "active";',
    wordCount: 29
  },
  {
    id: 'p-code-5',
    title: 'React Custom Hook for Event Keybindings',
    category: 'Code',
    difficulty: 'hard',
    text: 'export function useShortcut(key: string, callback: () => void) { useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === key && !e.repeat) callback(); }; window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, [key, callback]); }',
    wordCount: 40
  },
  {
    id: 'p-code-6',
    title: 'Go Concurrency Worker Pool Channel',
    category: 'Code',
    difficulty: 'hard',
    text: 'func worker(id int, jobs <-chan Job, results chan<- Result) { for job := range jobs { res := process(job); results <- res } }',
    wordCount: 24
  },

  // ==================== BUSINESS CATEGORY ====================
  {
    id: 'p-biz-1',
    title: 'Executive Communication & Alignment',
    category: 'Business',
    difficulty: 'medium',
    text: 'Effective leadership requires unambiguous correspondence, rapid decision turnaround, and coherent project documentation. Delivering concise feedback while respecting team velocity ensures sustained organizational momentum across global quarters.',
    wordCount: 28
  },
  {
    id: 'p-biz-2',
    title: 'Quarterly Strategic Growth & KPIs',
    category: 'Business',
    difficulty: 'medium',
    text: 'Our primary corporate objective for the upcoming fiscal quarter centers on accelerating net revenue retention while streamlining operational overhead. Close cross-functional alignment between engineering and enterprise accounts will ensure seamless customer onboarding.',
    wordCount: 33
  },
  {
    id: 'p-biz-3',
    title: 'Enterprise Security & Compliance Memo',
    category: 'Business',
    difficulty: 'hard',
    text: 'Maintaining stringent SOC 2 and ISO compliance requires rigorous access controls, multi-factor authentication enforcement, and periodic third-party penetration audits. Safeguarding customer data remains our highest fiduciary commitment.',
    wordCount: 27
  },
  {
    id: 'p-biz-4',
    title: 'Customer Lifetime Value & Retention',
    category: 'Business',
    difficulty: 'medium',
    text: 'Sustainable business expansion relies upon cultivating enduring client relationships. By proactively addressing support escalations and delivering regular value-added feature updates, we maximize retention while minimizing customer acquisition expenditures.',
    wordCount: 30
  },
  {
    id: 'p-biz-5',
    title: 'Agile Velocity & Sprint Retrospective',
    category: 'Business',
    difficulty: 'easy',
    text: 'During our sprint retrospective, the product team identified opportunities to reduce code review cycle times and improve automated test coverage. Fostering continuous feedback loops empowers distributed engineering teams to ship reliable software on schedule.',
    wordCount: 34
  },
  {
    id: 'p-biz-6',
    title: 'Financial Liquidity & Risk Management',
    category: 'Business',
    difficulty: 'hard',
    text: 'Prudent fiscal treasury policy requires maintaining substantial liquid reserves, evaluating foreign currency exposure, and hedging against commodity volatility to safeguard enterprise operations through unpredictable market cycles.',
    wordCount: 28
  },

  // ==================== SIMPLE CATEGORY ====================
  {
    id: 'p-sim-1',
    title: 'The Morning Sun & Green Hills',
    category: 'Simple',
    difficulty: 'easy',
    text: 'The warm morning sun came up over the quiet green hills. Birds began to sing softly in the tall oak trees. It was a fresh and pleasant day to take a walk along the clean stone path and enjoy the light cool breeze.',
    wordCount: 46
  },
  {
    id: 'p-sim-2',
    title: 'Fresh Warm Bread in the Bakery',
    category: 'Simple',
    difficulty: 'easy',
    text: 'Fresh bread was baking inside the warm kitchen oven. The sweet smell of butter and wheat filled the cozy room. A bowl of ripe red apples sat upon the wooden table next to a cup of hot green tea.',
    wordCount: 41
  },
  {
    id: 'p-sim-3',
    title: 'A Calm Afternoon in the Library',
    category: 'Simple',
    difficulty: 'easy',
    text: 'Rows of neat books stood on the clean wooden shelves. Warm sunlight streamed through the tall window onto the reading desk. It was quiet and relaxing to sit, open a favorite book, and read peacefully.',
    wordCount: 36
  },
  {
    id: 'p-sim-4',
    title: 'Gentle Rain on the Cozy Rooftop',
    category: 'Simple',
    difficulty: 'easy',
    text: 'Soft rain fell steadily against the bedroom window. Small drops of water slid down the clear glass into the garden below. Inside the comfortable room, everything was still, peaceful, and warm.',
    wordCount: 32
  },
  {
    id: 'p-sim-5',
    title: 'A Little Blue Bird in the Garden',
    category: 'Simple',
    difficulty: 'easy',
    text: 'A little blue bird flew down to rest on the wooden fence. It looked around the blooming flower garden with bright curious eyes before hopping onto the soft green grass in search of seeds.',
    wordCount: 35
  },

  // ==================== PANGRAM CATEGORY ====================
  {
    id: 'p-pangram-1',
    title: 'Classic Fox & Dog Pangram Suite',
    category: 'Pangram',
    difficulty: 'easy',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.',
    wordCount: 31
  },
  {
    id: 'p-pangram-2',
    title: 'Sphinx, Wizards & Piqued Gymnasts',
    category: 'Pangram',
    difficulty: 'medium',
    text: 'Sphinx of black quartz, judge my vow! The five boxing wizards jump quickly. How razorback-jumping frogs can level six piqued gymnasts! Cozy sphinx waves back from jigsaw cliff.',
    wordCount: 29
  },
  {
    id: 'p-pangram-3',
    title: 'Jackdaws & Prized Opal Jewels',
    category: 'Pangram',
    difficulty: 'medium',
    text: 'Jackdaws love my big sphinx of quartz. Six crazy kings vowed to quiz the lazy dwarf about prized jumping fox gems. Blowzy red night-frumps vexing quick pyx quaffers.',
    wordCount: 30
  },
  {
    id: 'p-pangram-4',
    title: 'Quizzical Prizefighters & Gunboats',
    category: 'Pangram',
    difficulty: 'hard',
    text: 'A quick movement of the enemy will jeopardize six gunboats. Crazy Frederick bought many very exquisite opal jewels. The job requires extra pluck and zeal from every young wage earner.',
    wordCount: 31
  },
  {
    id: 'p-pangram-5',
    title: 'Brawny Fox & Zesty Jumping Jive',
    category: 'Pangram',
    difficulty: 'medium',
    text: 'Brawny gods just flocked up to quiz and vex playful wimps. Watch "Jeopardy!", Alex Trebek\'s fun TV quiz game. Foxy parsons quiz and cajole the lovably dim, gawky wizard.',
    wordCount: 30
  },

  // ==================== GENERAL CATEGORY ====================
  {
    id: 'p-gen-1',
    title: 'The Art of Touch Typing',
    category: 'General',
    difficulty: 'easy',
    text: 'Touch typing transforms the physical keyboard from a mechanical barrier into a direct extension of your thoughts. By resting your index fingers on the tactile home bumps of the F and J keys, every character becomes reachable through subconscious reflex. Speed naturally emerges when smooth accuracy leads the way.',
    wordCount: 49
  },
  {
    id: 'p-gen-2',
    title: 'Deep Work & Cognitive Flow',
    category: 'General',
    difficulty: 'medium',
    text: 'Cultivating deep focus requires carving out quiet sanctuaries within our noisy digital world. When you silence notifications and immerse yourself in a challenging task, your brain enters a state of cognitive flow. Distractions fragment attention, but sustained concentration yields work of enduring depth and craft.',
    wordCount: 47
  },
  {
    id: 'p-gen-3',
    title: 'Digital Ergonomics & Physical Health',
    category: 'General',
    difficulty: 'medium',
    text: 'Keep your elbows bent at ninety degrees, relax your shoulders, align your screen at eye level, and take periodic micro-breaks every twenty minutes. Good ergonomics prevent repetitive strain and protect cognitive endurance over hours of intense computing.',
    wordCount: 37
  },
  {
    id: 'p-gen-4',
    title: 'Oceans & Marine Sanctuaries',
    category: 'General',
    difficulty: 'easy',
    text: 'Beneath the sunlit surface of the open ocean lies an ecosystem of immense complexity and tranquil beauty. Coral reefs shimmer with vibrant marine life, while gentle deep-sea currents transport nutrients across vast aquatic trenches. Exploring these underwater realms reminds us of the delicate balance sustaining our planet.',
    wordCount: 49
  },
  {
    id: 'p-gen-5',
    title: 'Astronomy & The Cosmic Frontier',
    category: 'General',
    difficulty: 'medium',
    text: "On a crisp, cloudless night, looking up at the canopy of stars reveals the quiet grandeur of the cosmos. Distant galaxies emit light that traveled across billions of years to reach our eyes. Each telescope launched into orbit expands our understanding of cosmic origins and humanity's place in the universe.",
    wordCount: 50
  },
  {
    id: 'p-gen-6',
    title: 'Ancient Temperate Rainforests',
    category: 'General',
    difficulty: 'easy',
    text: 'Ancient temperate forests harbor intricate underground fungal networks that connect towering trees across miles of woodland. Sunlight filters through the lush canopy, casting dappled emerald shadows on mossy riverbanks. These woodland sanctuaries provide essential shelter for countless bird and mammal species.',
    wordCount: 43
  },
  {
    id: 'p-gen-7',
    title: 'The Balance of Typography & Space',
    category: 'General',
    difficulty: 'medium',
    text: "The art of typography balances letterforms, kerning, leading, and negative space to make written language both legible and visually harmonious. A well-chosen typeface establishes an immediate atmosphere, subtly guiding the reader's eye across the printed or digital page.",
    wordCount: 41
  },
  {
    id: 'p-gen-8',
    title: 'Acoustic Resonance & Classical Music',
    category: 'General',
    difficulty: 'medium',
    text: 'Acoustic instruments produce sound through the sympathetic vibration of wood, strings, and air columns. Handcrafted violins and concert grand pianos resonate with rich harmonic overtones that can captivate an audience in a quiet auditorium, turning mechanical vibrations into emotional resonance.',
    wordCount: 43
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
  let neededParagraphs = 3;

  if (durationSeconds <= 30) {
    neededParagraphs = 3; // ~130 words
  } else if (durationSeconds <= 60) {
    neededParagraphs = 6; // ~260 words
  } else if (durationSeconds <= 120) {
    neededParagraphs = 12; // ~520 words
  } else if (durationSeconds <= 300) {
    // 5-minute test: Significantly longer content (~1,600 - 1,800 words)
    neededParagraphs = 40;
  } else {
    // 10-minute test: Maximum length content (~3,200 - 3,600 words)
    neededParagraphs = 80;
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
