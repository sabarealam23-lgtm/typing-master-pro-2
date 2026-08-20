import React from 'react';
import { PageRoute } from '../types';
import { 
  Keyboard, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Trophy, 
  Award, 
  CheckCircle2, 
  Star, 
  Globe, 
  BookOpen, 
  Zap, 
  Smile, 
  Compass, 
  Rocket, 
  Code2, 
  ShieldCheck,
  Flame,
  MousePointerClick
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Pre-generate randomized stars for consistent rendering
  const stars = [
    { top: '10%', left: '8%', size: 3, delay: '0s', opacity: 0.8 },
    { top: '14%', left: '28%', size: 2, delay: '1.2s', opacity: 0.6 },
    { top: '22%', left: '42%', size: 2.5, delay: '2.1s', opacity: 0.9 },
    { top: '8%', left: '55%', size: 3, delay: '0.7s', opacity: 0.75 },
    { top: '18%', left: '68%', size: 2, delay: '1.8s', opacity: 0.5 },
    { top: '12%', left: '82%', size: 3.5, delay: '2.5s', opacity: 0.85 },
    { top: '26%', left: '92%', size: 2, delay: '0.4s', opacity: 0.7 },
    { top: '35%', left: '15%', size: 2, delay: '1.5s', opacity: 0.6 },
    { top: '40%', left: '32%', size: 3, delay: '2.8s', opacity: 0.9 },
    { top: '32%', left: '50%', size: 2, delay: '0.9s', opacity: 0.5 },
    { top: '38%', left: '74%', size: 2.5, delay: '1.7s', opacity: 0.8 },
    { top: '48%', left: '88%', size: 2, delay: '2.3s', opacity: 0.7 },
    { top: '52%', left: '6%', size: 2.5, delay: '1.1s', opacity: 0.65 },
    { top: '56%', left: '24%', size: 3, delay: '0.3s', opacity: 0.85 },
    { top: '48%', left: '62%', size: 2, delay: '2.0s', opacity: 0.55 },
  ];

  return (
    <div id="home-landing-page" className="w-full flex flex-col -mt-4 sm:-mt-6">
      
      {/* ========================================================================= */}
      {/* 1. ANIMATED NIGHT SKY HERO SECTION (TypingClub Aesthetic with Moon & Clouds) */}
      {/* ========================================================================= */}
      <section 
        id="hero-night-sky-section"
        className="relative w-full overflow-hidden bg-gradient-to-b from-[#0b192e] via-[#0f3460] to-[#16213e] text-white pt-12 pb-32 sm:pt-16 sm:pb-40 select-none"
      >
        {/* Twinkling Stars Canvas */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {stars.map((star, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
                opacity: star.opacity,
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.9)'
              }}
            />
          ))}

          {/* Shooting Star Streak */}
          <div 
            className="absolute top-16 left-1/4 w-28 h-0.5 bg-gradient-to-r from-transparent via-cyan-200 to-white -rotate-35 animate-shooting-star opacity-0 pointer-events-none"
            style={{ animationDelay: '4s' }}
          />
        </div>

        {/* Glowing Realistic Moon (Top-Left Floating) */}
        <div 
          id="hero-glowing-moon"
          className="absolute top-6 sm:top-10 left-6 sm:left-14 z-10 animate-float-moon pointer-events-none"
        >
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-100 via-amber-50 to-white shadow-[0_0_50px_rgba(254,240,138,0.45)] border border-amber-200/50 flex items-center justify-center">
            {/* Moon Crater Details */}
            <div className="absolute top-4 left-5 w-3.5 h-3.5 rounded-full bg-amber-200/40 shadow-inner" />
            <div className="absolute top-8 left-9 w-5 h-5 rounded-full bg-amber-200/35 shadow-inner" />
            <div className="absolute bottom-5 left-6 w-4 h-4 rounded-full bg-amber-200/30 shadow-inner" />
            <div className="absolute top-11 left-3 w-2.5 h-2.5 rounded-full bg-amber-200/40 shadow-inner" />
            <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-amber-200/35 shadow-inner" />
            {/* Outer Lunar Glow Aura */}
            <div className="absolute -inset-2 rounded-full bg-amber-300/10 blur-md pointer-events-none" />
          </div>
        </div>

        {/* Hero Central Text & CTA Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 shadow-sm backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Interactive Touch Typing for Everyone</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl drop-shadow-md">
            Learn Touch Typing <br className="hidden sm:block" />
            <span className="text-cyan-400">for free!</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-200 max-w-2xl leading-relaxed font-normal drop-shadow-xs">
            Typing is a skill that lasts a lifetime. Join millions of students, professionals, and kids building speed and confidence with interactive lessons, instant feedback, and engaging typing stories.
          </p>

          {/* Prominent Primary & Secondary CTAs */}
          <div className="mt-9 flex flex-wrap justify-center items-center gap-4 w-full max-w-md">
            <button
              id="hero-get-started-btn"
              onClick={() => onNavigate('learn')}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-extrabold text-lg sm:text-xl shadow-xl shadow-cyan-500/35 hover:shadow-cyan-400/50 hover:scale-102 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-6 h-6 text-slate-950 stroke-[3]" />
            </button>

            <button
              id="hero-typing-test-btn"
              onClick={() => onNavigate('typing-test')}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 font-bold text-base hover:border-slate-600 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Take a Test</span>
            </button>
          </div>

          {/* Benefit Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 100% Free Forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> No Download Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> School & Home Friendly
            </span>
          </div>
        </div>

        {/* Animated Multi-Layer Drifting Clouds at the bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-24 sm:h-32 overflow-hidden pointer-events-none z-10">
          
          {/* Back Cloud Layer (Slower drift, translucent cyan) */}
          <div 
            className="absolute bottom-0 left-0 flex w-[200%] h-20 sm:h-24 animate-drift-clouds opacity-50"
            style={{ width: '200%' }}
          >
            <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-1/2 h-full">
              <path d="M0,80 C120,40 220,90 320,60 C420,30 520,70 640,50 C760,30 860,80 980,50 C1100,20 1220,70 1340,40 C1400,25 1440,60 1440,60 L1440,120 L0,120 Z" fill="#38bdf8" />
            </svg>
            <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-1/2 h-full">
              <path d="M0,80 C120,40 220,90 320,60 C420,30 520,70 640,50 C760,30 860,80 980,50 C1100,20 1220,70 1340,40 C1400,25 1440,60 1440,60 L1440,120 L0,120 Z" fill="#38bdf8" />
            </svg>
          </div>

          {/* Front Cloud Layer (Smooth white fluffy clouds transitioning to next section) */}
          <div 
            className="absolute bottom-0 left-0 flex w-[200%] h-16 sm:h-20 animate-drift-clouds-fast opacity-95"
            style={{ width: '200%' }}
          >
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full">
              <path d="M0,40 C150,10 280,60 420,30 C560,0 700,50 840,25 C980,0 1120,45 1260,20 C1360,5 1440,30 1440,30 L1440,100 L0,100 Z" fill="#ffffff" className="dark:fill-slate-900" />
            </svg>
            <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-1/2 h-full">
              <path d="M0,40 C150,10 280,60 420,30 C560,0 700,50 840,25 C980,0 1120,45 1260,20 C1360,5 1440,30 1440,30 L1440,100 L0,100 Z" fill="#ffffff" className="dark:fill-slate-900" />
            </svg>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TYPINGCLUB STYLE FEATURE GRID SECTION ("All the reasons to start...") */}
      {/* ========================================================================= */}
      <section 
        id="reasons-feature-grid-section" 
        className="w-full bg-white dark:bg-slate-900 py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              All the reasons to start learning how to type right now
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Touch typing is a foundation for digital communication, productivity, and academic success. Here is how our curriculum makes it fast and fun.
            </p>
          </div>

          {/* Feature Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Card 1: 5-Star Rating & Gamification */}
            <div 
              id="feature-card-gamification"
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  5-Star Rating & Gamification
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Engaging interactive drills with stars, badges, and instant accuracy scores that keep practice rewarding.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1 text-amber-500 text-xs font-bold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
                <span className="ml-1 text-slate-500 dark:text-slate-400">5-Star Goals</span>
              </div>
            </div>

            {/* Card 2: Proper Hand Posture Guide */}
            <div 
              id="feature-card-posture"
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Keyboard className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Proper Hand Posture Guide
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time visual guidance on home-row anchor keys, proper finger reaches, and ergonomic posture.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4" /> Live Key Finger Indicator
              </div>
            </div>

            {/* Card 3: Levels, Badges & Leaderboards */}
            <div 
              id="feature-card-leaderboards"
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Levels, Badges & Leaderboards
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Stay motivated, level up from Novice to Grandmaster, maintain daily streaks, and compete on the leaderboard.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Flame className="w-4 h-4 text-amber-500" /> Daily Streaks & XP Ranks
              </div>
            </div>

            {/* Card 4: 100% Online & Responsive */}
            <div 
              id="feature-card-responsive"
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  100% Online & Responsive
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Zero installs or setups. Works seamlessly in any browser across Chromebooks, Macs, Windows PCs, and tablets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-4 h-4" /> Instant Cloud Progress Sync
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CURRICULUM & STORY SERIES SHOWCASE CARDS (Kids, Hand Drills, Stories) */}
      {/* ========================================================================= */}
      <section 
        id="curriculum-showcase-section" 
        className="w-full bg-slate-50 dark:bg-slate-950 py-16 sm:py-24 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Interactive Learning Modules
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                Explore Curriculum & Stories
              </h2>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              <span>View All 20+ Lessons</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Curriculum Card 1: Typing for Kids & Beginners */}
            <div 
              id="curriculum-card-kids"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mb-5">
                  🐻
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3">
                  Beginner • Jungle Junior Style
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Typing for Kids & Beginners
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Step-by-step introduction to home row keys (F, J, D, K, S, L, A, ;), alphabet drills, and friendly guided pacing.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Home row tactile anchors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Simple words & 3-letter combinations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Fun milestone celebrations</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={() => onNavigate('learn')}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Start Beginner Track
                </button>
              </div>
            </div>

            {/* Curriculum Card 2: Left & Right Hand Finger Drills */}
            <div 
              id="curriculum-card-hand-drills"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-2xl mb-5">
                  👐
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 text-xs font-bold mb-3">
                  Skill Builder • Targeted Drills
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Left Hand & Right Hand Drills
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Isolate each finger zone to eliminate weak fingers and balance muscle memory across top, home, and bottom rows.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <span>Pinky & Ring finger strengthening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <span>Shift key synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <span>Numbers and symbols row drills</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Start Hand Drills
                </button>
              </div>
            </div>

            {/* Curriculum Card 3: Story Typing Series */}
            <div 
              id="curriculum-card-stories"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl mb-5">
                  📖
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-xs font-bold mb-3">
                  Story Series • Immersion
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Story Typing Series
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Immerse yourself in narrative stories including <em>Going Solo</em>, <em>Ava & the Rabbit</em>, and <em>Space Explorer</em>.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Going Solo: Aviation Adventures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Ava & the Rabbit Tale</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Space Explorer Galaxy Voyage</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Explore Story Series
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. READY TO TEST SPEED CTA BANNER */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800/60 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Benchmark</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Test your typing speed in 60 seconds
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              No account or signup needed. Jump directly into our benchmark engine and get real-time Gross WPM, Net WPM, and accuracy analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => onNavigate('typing-test')}
              className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/30 transition-all cursor-pointer text-center"
            >
              Start 60s Typing Test
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-white font-semibold text-base border border-slate-700 transition-all cursor-pointer text-center"
            >
              Browse Lessons
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
