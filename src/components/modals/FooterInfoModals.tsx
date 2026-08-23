import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Award, 
  Sliders, 
  BarChart3, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  Shield, 
  HardDrive, 
  Cookie, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Keyboard, 
  ExternalLink,
  Zap,
  Clock,
  ShieldCheck,
  Flame,
  HelpCircle
} from 'lucide-react';

export type FooterModalType = 'about' | 'contact' | 'privacy' | 'terms' | null;

interface FooterInfoModalProps {
  activeModal: FooterModalType;
  onClose: () => void;
  onNavigate?: (page: any) => void;
}

export const FooterInfoModal: React.FC<FooterInfoModalProps> = ({
  activeModal,
  onClose,
  onNavigate
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        onClose();
      }
    };

    if (activeModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  return (
    <div 
      id="footer-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="footer-modal-title"
    >
      <div 
        ref={modalRef}
        id={`footer-modal-${activeModal}`}
        className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            {activeModal === 'about' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'contact' && (
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Mail className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'privacy' && (
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
            )}
            {activeModal === 'terms' && (
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 id="footer-modal-title" className="text-base sm:text-lg font-bold text-slate-100">
                {activeModal === 'about' && 'About SmartTypingPro & Touch Typing Science'}
                {activeModal === 'contact' && 'Support & Contact'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms & Conditions'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {activeModal === 'about' && 'Engineered for learners, developers, and speed typists • © 2026'}
                {activeModal === 'contact' && 'Direct developer assistance & feedback channel'}
                {activeModal === 'privacy' && 'Updated August 2026 • Strict zero-keylogging commitment'}
                {activeModal === 'terms' && 'Updated August 2026 • Platform usage & integrity standards'}
              </p>
            </div>
          </div>

          <button
            id="footer-modal-close-btn"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed custom-scrollbar">
          {activeModal === 'about' && <AboutModalContent onNavigate={onNavigate} onClose={onClose} />}
          {activeModal === 'contact' && <ContactModalContent />}
          {activeModal === 'privacy' && <PrivacyModalContent />}
          {activeModal === 'terms' && <TermsModalContent />}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold text-slate-300">SmartTypingPro</span>
            <span>•</span>
            <span>v1.0 Official Release</span>
            <span>•</span>
            <span>© 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 1. ABOUT US & TOUCH TYPING SCIENCE CONTENT
// =========================================================================
const AboutModalContent: React.FC<{ onNavigate?: (page: any) => void; onClose: () => void }> = ({ onNavigate, onClose }) => {
  return (
    <div className="space-y-6">
      {/* Brand & Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 border border-emerald-500/20 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
            ST
          </div>
          <span className="text-xs font-bold font-mono uppercase text-emerald-400 tracking-wider">
            SmartTypingPro • Brand & Mission
          </span>
        </div>
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
          <strong>SmartTypingPro (© 2026)</strong> is a high-performance, distraction-free touch typing platform engineered specifically for students, professional developers, transcriptionists, and speed typists aiming to reach frictionless cognitive flow and elite typing velocities.
        </p>
      </div>

      {/* Core Platform Pillars Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Key Features & Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Feature 1: Beginner Lessons */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Keyboard className="w-4 h-4" />
              <span>Beginner-Friendly Lessons</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Step-by-step interactive curriculum designed to master touch typing effortlessly from scratch. Progress from single-key discovery to home row, reach keys, numbers, and advanced punctuation.
            </p>
          </div>

          {/* Feature 2: Official Certification */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>Automatic Certification</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unlocks and generates an official downloadable Typing Certificate upon achieving <strong className="text-slate-200">≥ 30 Net WPM</strong> with <strong className="text-slate-200">≥ 95% Accuracy</strong> in official speed tests, complete with verified security seal and exportable PNG/PDF formats.
            </p>
          </div>

          {/* Feature 3: Smart Customization */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Sliders className="w-4 h-4" />
              <span>Smart Customization</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Flexible timed tests (30s, 60s, 120s, 5m, 10m), custom paragraph sandboxes, 3 theme presets (Dark, Light, Day/Night), keystroke mechanical sound synthesis, volume controls, and responsive cursor styles.
            </p>
          </div>

          {/* Feature 4: Analytics & Tracking */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Tracking</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time CPM and WPM tracking calculated via hardware <code className="text-purple-300 font-mono text-[11px]">performance.now()</code> precision, detailed mistake cluster analysis, and personal user dashboard progression history.
            </p>
          </div>
        </div>
      </div>

      {/* Ergonomic & Biomechanical Principles */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          The Science of Muscle Memory & Ergonomics
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Tactile Home Row Anchors (F & J):</strong> By anchoring your index fingers on the tactile bumps, each finger is assigned a strict geometric column, eliminating the visual hunting reflex.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Floating Wrist Alignment:</strong> Keeping wrists slightly elevated avoids median nerve compression and enables smooth micro-swivels across upper and lower rows.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Rhythmic Cadence Over Raw Speed:</strong> Speed naturally compounds once keystroke latency standardizes. Consistent 98%+ accuracy produces far greater long-term throughput than rushing with high backspace penalties.</span>
          </li>
        </ul>
      </div>

      {/* Quick Action Navigation */}
      {onNavigate && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">Ready to boost your speed?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigate('learn');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Start Step-by-Step Lessons
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('typing-test');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Take Certification Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. SUPPORT & CONTACT CONTENT (LIVE FORMSPREE INTEGRATION)
// =========================================================================
const ContactModalContent: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const contactEmail = 'sabarealam23@gmail.com';
  const formspreeEndpoint = 'https://formspree.io/f/xyegvrvz';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
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
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
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
    <div className="space-y-6">
      {/* Official Contact Box & Copyable Email */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase font-mono">
            <Mail className="w-4 h-4" />
            <span>Direct Developer Support</span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            24–48h Response SLA
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          You can also reach us directly at <strong className="text-cyan-300">{contactEmail}</strong> (Response within 24–48 hours).
        </p>

        {/* Copyable Email Box */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs sm:text-sm text-slate-100 font-bold truncate">
              {contactEmail}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="contact-copy-email-btn"
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
            </button>
            <a
              href={`mailto:${contactEmail}?subject=SmartTypingPro%20Inquiry`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mail</span>
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Contact / Feedback Form */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            Send Feedback or Support Request
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Live Formspree Integration</span>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Thank you! Your feedback has been received.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Our team has received your message and will review it promptly. We appreciate you helping us make SmartTypingPro better!
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', message: '' });
                setErrorMessage(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5" method="POST" action={formspreeEndpoint}>
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="contact-name-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Your Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="contact-name-input"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Alex Hunter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
                  User Email <span className="text-rose-400">*</span>
                </label>
                <input
                  id="contact-email-input"
                  name="email"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
                Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="contact-message-input"
                name="message"
                required
                rows={3}
                placeholder="Share your feature suggestions, bug reports, or questions..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 focus:outline-none resize-none transition-colors"
              />
            </div>

            <button
              id="contact-form-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Sending Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
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

// =========================================================================
// 3. PRIVACY POLICY CONTENT
// =========================================================================
const PrivacyModalContent: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Privacy Commitment Banner */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Zero-Keylogging & Privacy Guarantee (Updated August 2026)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            SmartTypingPro is architected around absolute client-side privacy. We believe that your typing practice must remain confidential, private, and secure at all times.
          </p>
        </div>
      </div>

      {/* Policy Point 1: No Keylogging */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <Keyboard className="w-4 h-4" />
          <span>1. No Keylogging & Real-Time Processing</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SmartTypingPro <strong>never records, logs, or transmits private keystrokes to external servers</strong>. All character comparisons, WPM calculations, and accuracy percentages occur strictly in real-time memory within your local browser sandbox via <code className="text-emerald-300 font-mono text-[11px]">performance.now()</code>.
        </p>
      </div>

      {/* Policy Point 2: Local Storage Usage */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
          <HardDrive className="w-4 h-4" />
          <span>2. Browser Local Storage Utilization</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Browser local storage is used solely to store your chosen UI theme preferences (Dark/Light/Day-Night), sound synthesis volume settings, cursor configurations, test session history, earned achievements, and verified certificate credentials so you can resume practice seamlessly across visits.
        </p>
      </div>

      {/* Policy Point 3: Analytics & Ads Compliance */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <Cookie className="w-4 h-4" />
          <span>3. Analytics & Advertising Compliance</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          We maintain full compliance with Google AdSense policies and privacy standards. Non-identifiable aggregate cookies may be utilized for general traffic analytics, platform availability monitoring, and crash reporting to maintain optimal server response times and platform stability.
        </p>
      </div>

      {/* Policy Point 4: User Data Rights */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
          <Shield className="w-4 h-4" />
          <span>4. User Control & Data Deletion</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          You retain complete ownership of your typing records. At any moment, you can export your history or erase all stored local data with a single click from the Settings panel.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 4. TERMS & CONDITIONS CONTENT
// =========================================================================
const TermsModalContent: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Terms Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Terms of Use & Fair Play Guidelines (Updated August 2026)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to SmartTypingPro. By accessing our training curriculum, speed tests, and certification engines, you agree to these transparent usage terms.
          </p>
        </div>
      </div>

      {/* Terms Section 1: Usage Purpose */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>1. Educational & Skill Development Purpose</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          SmartTypingPro is provided as a free, accessible educational service designed to help typists improve speed, reduce repetitive strain, and achieve professional certification standards.
        </p>
      </div>

      {/* Terms Section 2: Certificate Integrity */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>2. Certificate Authenticity & Integrity</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Official SmartTypingPro Certificates (Silver, Gold, and Platinum) and auto-generated verification codes (<code className="text-emerald-300 font-mono text-[11px]">ST-CERT-XXXXXX</code>) are awarded solely for authenticated human tests meeting the <strong className="text-slate-200">≥ 30 Net WPM</strong> and <strong className="text-slate-200">≥ 95% Accuracy</strong> thresholds. Misrepresenting simulated or altered results is strictly prohibited.
        </p>
      </div>

      {/* Terms Section 3: Fair Play */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>3. Fair Play & Anti-Cheating Policy</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Automated scripts, macros, virtual input bots, or tampering with speed metrics on public leaderboards are strictly forbidden. The system applies algorithmic cadence consistency checks and reserves the right to invalidate suspicious scores.
        </p>
      </div>

      {/* Terms Section 4: Intellectual Property */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>4. Intellectual Property & Brand Rights</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          All curriculum structures, interactive keyboard components, sound synthesis engines, visual badges, and branding elements are proprietary property of <strong>SmartTypingPro (© 2026)</strong> and protected under international copyright laws.
        </p>
      </div>
    </div>
  );
};
