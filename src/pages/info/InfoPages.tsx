import React, { useState } from 'react';
import { PageRoute } from '../../types';
import { 
  Keyboard, 
  Shield, 
  FileText, 
  Mail, 
  CheckCircle2, 
  Award, 
  Zap, 
  Send, 
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface InfoPageProps {
  onNavigate: (page: PageRoute) => void;
}

// ==================== ABOUT PAGE ====================
export const AboutPage: React.FC<InfoPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Science & Methodology</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100">About Typing Master Pro</h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Typing Master Pro was designed from the ground up to cultivate effortless motor memory through cognitive neuroscience principles and real-time biomechanical feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">The 5-Finger Anchor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            By anchoring your index fingers on the tactile F and J bumps, all other keys are indexed via muscle memory rather than conscious visual scanning.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Microsecond Accuracy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard web timers drift. We evaluate every stroke using browser hardware performance timestamps to ensure official competition-grade precision.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Adaptive Practice</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our multi-tiered lessons adjust to common typing bottlenecks such as numeric reach, uppercase coordination, and tricky punctuation rhythms.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Ergonomics & Typing Posture</h2>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Wrists Elevated:</strong> Avoid resting your palms or wrists on the desk while typing; keep them floating lightly to prevent repetitive strain.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>90-Degree Elbow Angle:</strong> Adjust chair height so your forearms rest parallel to the floor with relaxed shoulders.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Rhythm Over Speed:</strong> Speed naturally blossoms from consistent accuracy and smooth keypress cadence. Never rush at the cost of errors.</span>
          </li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('learn')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
        >
          Start Lesson 1: Home Row
        </button>
      </div>
    </div>
  );
};

// ==================== CONTACT PAGE ====================
export const ContactPage: React.FC<InfoPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Contact & Support</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Have suggestions, feature requests, or questions? Send us a message below.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {sent ? (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-100">Message Received</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Thank you for reaching out! Our team reads every note and will get back to you at {email}.
            </p>
            <button
              onClick={() => { setSent(false); setMessage(''); }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Hunter"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help enhance your typing experience?"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ==================== PRIVACY POLICY ====================
export const PrivacyPolicyPage: React.FC<InfoPageProps> = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
          <Shield className="w-4 h-4" /> Privacy Commitment
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">1. Information We Collect</h2>
          <p>
            Typing Master Pro collects keystroke timing, WPM calculations, accuracy scores, lesson completion markers, and optional account credentials (such as email address and display name). We do not record or transmit arbitrary user input outside of explicit typing exercises.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">2. How Data is Used</h2>
          <p>
            All typing statistics are utilized strictly to compute your historical learning trajectory, unlock achievements, rank on community leaderboards, and personalize lessons.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">3. Storage & Cloud Persistence</h2>
          <p>
            For guest users, all data remains private and local in browser storage. For authenticated users, data is synchronized with secure Firestore cloud persistence. You retain the ability to export or wipe your local records at any time via Settings.
          </p>
        </section>
      </div>
    </div>
  );
};

// ==================== TERMS & CONDITIONS ====================
export const TermsPage: React.FC<InfoPageProps> = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
          <FileText className="w-4 h-4" /> Legal & Terms
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Terms & Conditions</h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">1. Acceptance of Terms</h2>
          <p>
            By accessing and practicing on Typing Master Pro, you agree to comply with these terms. The platform is provided for educational and skill improvement purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">2. Fair Play & Leaderboard Integrity</h2>
          <p>
            Leaderboard submissions must originate from genuine physical human keystrokes. Automated macros, script injections, or simulated keystrokes are strictly disallowed to ensure fair community comparison.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">3. Intellectual Property</h2>
          <p>
            All custom learning paths, original UI design, branding, and algorithms are proprietary to Typing Master Pro.
          </p>
        </section>
      </div>
    </div>
  );
};
