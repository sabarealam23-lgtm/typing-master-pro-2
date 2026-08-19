import React from 'react';
import { PageRoute } from '../../types';
import { Keyboard, Shield, FileText, Mail, Info, Trophy, BookOpen, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer 
      id="main-footer"
      className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-sm">
                <Keyboard className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-sm font-extrabold text-slate-100">Typing Master Pro</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              An original, high-performance touch-typing platform crafted for students, professionals, and developers seeking precision speed and effortless cognitive flow.
            </p>
          </div>

          {/* Col 2: Learning & Training */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Curriculum & Tests</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('learn')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> Beginner to Advanced Courses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('typing-test')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Keyboard className="w-3.5 h-3.5" /> Official Timed Speed Tests
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('practice')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Heart className="w-3.5 h-3.5" /> Custom Practice Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Trophy className="w-3.5 h-3.5" /> Global Typist Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Platform */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Info className="w-3.5 h-3.5" /> About Touch Typing Science
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Support & Contact
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Shield className="w-3.5 h-3.5" /> Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Engine Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Measurement Standard</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Measured via high-resolution <span className="font-mono text-slate-300">performance.now()</span> hardware timestamps. Standard 5-character word convention with keystroke-level uncorrected error accountability.
            </p>
            <div className="pt-2">
              <span className="inline-block px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                Engine Standard: CPM/WPM v1.0.0
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Typing Master Pro. All rights reserved. Web Application.
          </div>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-400">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-400">Terms</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-400">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
