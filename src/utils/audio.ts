import { SoundType } from '../types';

export interface SoundOption {
  id: SoundType;
  name: string;
  description?: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: 'click', name: 'Standard Click', description: 'Crisp tactile switch click' },
  { id: 'typewriter', name: 'Typewriter', description: 'Vintage mechanical typewriter hammer' },
  { id: 'soft', name: 'Soft / Quiet', description: 'Gentle cushioned key pop' },
  { id: 'beep', name: 'Beep', description: 'Subtle electronic tone' },
];

/**
 * Web Audio API synthesizer for keypress sound effects and milestone audio.
 * Operates 100% in-memory with zero external dependencies.
 */
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Warm up AudioContext on the earliest user interaction
      const unlockAudio = () => {
        this.getContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playKeySound(type: SoundType, volume = 0.5, isError = false) {
    if (type === 'off' || volume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.4, now);
      masterGain.connect(ctx.destination);

      if (isError) {
        // Low error thud
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        osc.connect(masterGain);
        masterGain.gain.setValueAtTime(volume * 0.45, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        return;
      }

      switch (type) {
        case 'typewriter': {
          // Sharp metallic strike + release click
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
          osc.connect(masterGain);
          masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'beep': {
          // Clean subtle sine beep
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.connect(masterGain);
          masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }
        case 'soft': {
          // Warm soft pop
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320 + Math.random() * 40, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
          osc.connect(masterGain);
          masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
        case 'click':
        default: {
          // Crisp mechanical keyclick with micro-noise
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800 + Math.random() * 150, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);
          osc.connect(masterGain);
          masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
      }
    } catch {
      // Audio playback silent fallback
    }
  }

  public playSuccessChime(volume = 0.5) {
    if (volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(volume * 0.25, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.35);
      });
    } catch {
      // ignore
    }
  }
}

export const soundSynthesizer = new SoundSynthesizer();
