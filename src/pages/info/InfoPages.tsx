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
  Clock, 
  Sparkles, 
  BookOpen,
  Sliders,
  BarChart3,
  Copy,
  Check,
  ExternalLink,
  HardDrive,
  Cookie,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface InfoPageProps {
  onNavigate: (page: PageRoute) => void;
}

// ==================== ABOUT PAGE ====================
export const AboutPage: React.FC<InfoPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About SmartTypingPro • © 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100">About Touch Typing Science</h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          SmartTypingPro is a high-performance, distraction-free touch typing platform engineered for learners, developers, transcriptionists, and speed typists to cultivate effortless motor memory through cognitive neuroscience principles.
        </p>
      </div>

      {/* Key Feature Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Beginner-Friendly Lessons</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Step-by-step easy interactive levels designed to master touch typing effortlessly from scratch. Learn home row anchors, reach keys, numbers, and capital rhythms naturally.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Automatic Certification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unlocks and generates an official downloadable Typing Certificate upon achieving <strong className="text-slate-200">≥ 30 Net WPM</strong> with <strong className="text-slate-200">≥ 95% Accuracy</strong> in official test modes, complete with custom security ID stamp.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Smart Customization</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Timed tests (30s, 60s, 120s, 5m, 10m), custom AI paragraph sandboxes, 3 theme presets (Dark, Light, Day/Night), keystroke sound volume controls, and responsive cursor styles.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Analytics & Tracking</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time CPM/WPM tracking via microsecond hardware <code className="text-purple-300 font-mono text-[11px]">performance.now()</code> precision, detailed mistake cluster analysis, and user dashboard progress history.
          </p>
        </div>
      </div>

      {/* Ergonomics & Biomechanical Guidelines */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Ergonomics & Typing Posture
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Tactile F & J Anchoring:</strong> Index fingers rest on the tactile bumps of F and J keys to anchor finger positioning without conscious visual hunting.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Floating Wrist Posture:</strong> Avoid resting palms or wrists firmly on desk surfaces while typing; maintain slight wrist elevation to prevent median nerve compression.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Cadence Over Frantic Bursting:</strong> Steady keystroke rhythm guarantees high 98%+ accuracy, eliminating costly backspace regressions.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={() => onNavigate('learn')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          Start Lesson 1: Home Row
        </button>
        <button
          onClick={() => onNavigate('typing-test')}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          Take Speed Test & Get Certified
        </button>
      </div>
    </div>
  );
};

// ==================== CONTACT PAGE ====================
export const ContactPage: React.FC<InfoPageProps> = () => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Feedback & Feature Suggestions',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const contactEmail = 'sabarealam23@gmail.com';
  const formspreeEndpoint = 'https://formspree.io/f/xyegvrvz';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          category: formData.category,
          message: formData.message
        })
      });

      if (response.ok) {
        setSent(true);
        setFormData({ name: '', email: '', category: 'Feedback & Feature Suggestions', message: '' });
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(
          data?.errors?.[0]?.message || 'Unable to submit your feedback at this moment. Please try again or email us directly.'
        );
      }
    } catch (err) {
      setErrorMessage('Network error occurred. Please check your connection or send us an email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mx-auto flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Support & Contact</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          You can also reach us directly at <strong className="text-cyan-300">{contactEmail}</strong> (Response within 24–48 hours).
        </p>
      </div>

      {/* Copyable Direct Email Box */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Direct Support Address</span>
            <p className="font-mono text-sm font-bold text-slate-100">{contactEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>
          <a
            href={`mailto:${contactEmail}?subject=SmartTypingPro%20Inquiry`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Mailer</span>
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {sent ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Thank you! Your feedback has been received.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our team has received your message and will review it promptly. We appreciate you helping us enhance SmartTypingPro!
            </p>
            <button
              onClick={() => {
                setSent(false);
                setFormData({ name: '', email: '', message: '' });
                setErrorMessage(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" method="POST" action={formspreeEndpoint}>
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="info-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="info-name-input"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Hunter"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="info-email-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                User Email <span className="text-rose-400">*</span>
              </label>
              <input
                id="info-email-input"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="info-category-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic Category
              </label>
              <select
                id="info-category-select"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Feedback & Feature Suggestions">Feedback & Feature Suggestions</option>
                <option value="Bug Report / Technical Issue">Bug Report / Technical Issue</option>
                <option value="Typing Certificate Query">Typing Certificate Query</option>
                <option value="General Question & Support">General Question & Support</option>
              </select>
            </div>

            <div>
              <label htmlFor="info-message-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="info-message-input"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help enhance your typing experience?"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 focus:outline-none resize-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Sending Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Feedback</span>
                </>
              )}
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
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 animate-fade-in">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-4 h-4" /> Privacy Commitment
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-emerald-400">
            <Keyboard className="w-4 h-4" />
            1. Zero Keylogging Policy
          </h2>
          <p>
            SmartTypingPro <strong>never records, logs, or transmits private keystrokes to external servers</strong>. Keystroke timing, CPM, and WPM are computed exclusively in memory inside the client browser. Outside of explicit typing exercises, no keystrokes are tracked.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-cyan-400">
            <HardDrive className="w-4 h-4" />
            2. Local Storage Usage
          </h2>
          <p>
            Browser storage is used solely to save user theme preferences (Dark, Light, Day/Night), sound/cursor configurations, test history, earned achievements, and verified certificates for seamless progress continuation.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-amber-400">
            <Cookie className="w-4 h-4" />
            3. Analytics & Advertising Compliance
          </h2>
          <p>
            SmartTypingPro adheres strictly to Google AdSense compliance and privacy guidelines. Non-identifiable aggregate cookies may be used for general performance metrics, server diagnostics, and traffic monitoring.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-purple-400">
            <Shield className="w-4 h-4" />
            4. User Control & Data Retention
          </h2>
          <p>
            You retain absolute ownership of your typing data. You can clear your cached browser records or export your statistics at any time through the Settings interface.
          </p>
        </section>
      </div>
    </div>
  );
};

// ==================== TERMS & CONDITIONS ====================
export const TermsPage: React.FC<InfoPageProps> = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 animate-fade-in">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
          <FileText className="w-4 h-4" /> Legal & Terms
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Terms & Conditions</h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-amber-400">
            <CheckCircle2 className="w-4 h-4" />
            1. Usage Purpose
          </h2>
          <p>
            SmartTypingPro is provided as a free educational platform for touch typing practice, speed enhancement, and certification. Use of this service must adhere to all applicable digital regulations and community standards.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            2. Certificate Integrity
          </h2>
          <p>
            Certified results and credential validation codes (<code className="text-emerald-300 font-mono text-[11px]">ST-CERT-XXXXXX</code>) must be achieved through genuine physical keystroke input meeting or exceeding <strong className="text-slate-200">≥ 30 Net WPM</strong> and <strong className="text-slate-200">≥ 95% Accuracy</strong>.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            3. Fair Use & Anti-Cheating
          </h2>
          <p>
            Automated scripts, virtual input macros, bots, or tampering with speed metrics on public leaderboards are strictly forbidden. The platform employs cadence validation algorithms to ensure community fairness.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-4 h-4" />
            4. Intellectual Property
          </h2>
          <p>
            All custom learning paths, original UI components, sound synthesis algorithms, vector badges, and brand assets are protected under standard intellectual property terms (<strong>SmartTypingPro © 2026</strong>).
          </p>
        </section>
      </div>
    </div>
  );
};

