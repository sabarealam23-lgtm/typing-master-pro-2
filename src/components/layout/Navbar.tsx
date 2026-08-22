import React, { useState } from 'react';
import { PageRoute } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { calculateLevelInfo } from '../../utils/typingCalculations';
import { 
  Keyboard, 
  Flame, 
  Trophy, 
  Award, 
  BarChart3, 
  Settings as SettingsIcon, 
  User, 
  BookOpen, 
  Play, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings, setTheme } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const levelInfo = calculateLevelInfo(user.xp || 0);

  const navLinks: { label: string; page: PageRoute; icon: React.ReactNode }[] = [
    { label: 'Dashboard', page: 'dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Learn', page: 'learn', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Practice', page: 'practice', icon: <Play className="w-4 h-4" /> },
    { label: 'Typing Test', page: 'typing-test', icon: <Keyboard className="w-4 h-4" /> },
    { label: 'Leaderboard', page: 'leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Achievements', page: 'achievements', icon: <Award className="w-4 h-4" /> },
  ];

  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const toggleTheme = () => {
    setTheme(settings.theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav 
      id="main-navigation-bar"
      className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md transition-colors shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div 
            id="brand-logo-button"
            onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Keyboard className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Typing Master
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  id={`nav-link-${link.page}`}
                  onClick={() => handleNav(link.page)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
                    ${active 
                      ? 'bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-slate-700/60 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}
                  `}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Bar (Streak, Level, Theme, User) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Streak Counter */}
            <div 
              id="streak-indicator-badge"
              title={`${user.currentStreak || 0} Day Practice Streak`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold"
            >
              <Flame className="w-4 h-4 fill-amber-400/30 text-amber-500 dark:text-amber-400" />
              <span>{user.currentStreak || 0}</span>
            </div>

            {/* Level & XP Capsule */}
            <div 
              id="level-indicator-badge"
              title={`Level ${levelInfo.level} - ${levelInfo.currentLevelXp}/${levelInfo.nextLevelXpThreshold} XP to Level ${levelInfo.level + 1}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
                <span className="font-bold text-blue-600 dark:text-emerald-400">Lv.{levelInfo.level}</span>
              </div>
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={settings.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              {settings.theme === 'light' ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Profile Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.displayName}</span>
                </button>

                {profileDropdownOpen && (
                  <div 
                    id="profile-dropdown-menu"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-slate-700 dark:text-slate-300"
                  >
                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => handleNav('progress')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span>Detailed Progress</span>
                    </button>
                    <button
                      onClick={() => handleNav('settings')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Preferences</span>
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                    <button
                      onClick={() => { logout(); handleNav('home'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNav('login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Log In
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => handleNav('register')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              id="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === link.page ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
          <div className="h-px bg-slate-800 my-2" />
          <button
            onClick={() => handleNav('profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            <User className="w-4 h-4" />
            <span>Profile ({user.displayName})</span>
          </button>
          <button
            onClick={() => handleNav('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
          {!isAuthenticated ? (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleNav('login')}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-slate-200 text-sm font-medium border border-slate-800 text-center"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 text-sm font-bold text-center"
              >
                Register
              </button>
            </div>
          ) : (
            <button
              onClick={() => { logout(); handleNav('home'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
