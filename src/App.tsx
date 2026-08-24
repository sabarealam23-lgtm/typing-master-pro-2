import React, { useState, useEffect } from 'react';
import { PageRoute, Lesson, TypingResult } from './types';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TypingStatsProvider } from './context/TypingStatsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LessonsPage, LessonViewPage } from './pages/learn/LessonsPages';
import { TypingTestPage, PracticePage } from './pages/practice/PracticeAndTestPages';
import { ResultsPage } from './pages/results/ResultsPage';
import { ProgressPage, AchievementsPage } from './pages/analytics/ProgressAndAchievementsPages';
import { LeaderboardPage, ProfilePage, SettingsPage } from './pages/user/UserAndSettingsPages';
import { LoginPage, RegisterPage, ForgotPasswordPage, EmailVerificationPage } from './pages/auth/AuthPages';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsPage } from './pages/info/InfoPages';
import { LESSONS_DATA } from './data/lessons';

const AppContent: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  
  // Stateful navigation
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [activeLesson, setActiveLesson] = useState<Lesson | undefined>(undefined);
  const [testResult, setTestResult] = useState<TypingResult | null>(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) return;

      const [route, param] = hash.split('/');
      const validRoutes: PageRoute[] = [
        'home', 'dashboard', 'learn', 'lesson-view', 'practice', 'typing-test', 
        'results', 'progress', 'achievements', 'leaderboard', 'profile', 
        'settings', 'login', 'register', 'forgot-password', 'email-verification',
        'about', 'contact', 'privacy-policy', 'terms'
      ];

      if (validRoutes.includes(route as PageRoute)) {
        setCurrentPage(route as PageRoute);
        if (route === 'lesson-view' && param) {
          const matchedLesson = LESSONS_DATA.find(l => l.id === param);
          if (matchedLesson) setActiveLesson(matchedLesson);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageRoute, data?: Lesson | TypingResult) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (page === 'lesson-view' && data && 'targetKeys' in data) {
      setActiveLesson(data as Lesson);
      window.location.hash = `lesson-view/${(data as Lesson).id}`;
    } else if (page === 'results' && data && 'netWpm' in data) {
      setTestResult(data as TypingResult);
      window.location.hash = 'results';
    } else {
      window.location.hash = page;
    }

    setCurrentPage(page);
  };

  // Render appropriate page component
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'learn':
        return <LessonsPage onNavigate={handleNavigate} />;
      case 'lesson-view':
        return <LessonViewPage lesson={activeLesson || LESSONS_DATA[0]} onNavigate={handleNavigate} />;
      case 'practice':
        return <PracticePage onNavigate={handleNavigate} />;
      case 'typing-test':
        return <TypingTestPage onNavigate={handleNavigate} />;
      case 'results':
        return <ResultsPage result={testResult} onNavigate={handleNavigate} />;
      case 'progress':
        return <ProgressPage onNavigate={handleNavigate} />;
      case 'achievements':
        return <AchievementsPage onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'email-verification':
        return <EmailVerificationPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Theme container classes
  const isIvorySapphire = settings.theme === 'ivory-sapphire';
  const isDark = !isIvorySapphire && (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isIvorySapphire
        ? 'bg-[#fbf8f1] text-[#1e293b] selection:bg-[#1e3a8a]/20 selection:text-[#1e3a8a]'
        : isDark 
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200' 
        : 'bg-slate-50 text-slate-900 selection:bg-cyan-500/30 selection:text-cyan-900'
    }`}>
      {/* Top Sticky Navigation Bar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Page Canvas */}
      <main className="flex-1 w-full flex flex-col">
        {renderCurrentPage()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <TypingStatsProvider>
          <AppContent />
        </TypingStatsProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
