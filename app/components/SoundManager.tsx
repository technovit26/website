'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { emit, on } from '../hooks/useEventBus';
import { useStackOffset, useBroadcastHeight } from '../hooks/useBottomStack';

type SoundName = 'hover' | 'click' | 'toggle' | 'transition' | 'keystroke' | 'denied' | 'ask' | 'play' | 'chomp' | 'shutter';

interface ToneSpec {
  type: OscillatorType;
  freqFrom: number;
  freqTo: number;
  duration: number;
  peakGain: number;
  filterFrom?: number;
  filterTo?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  muted = false;

  private ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  unlock() {
    this.ensureContext();
  }

  private tone(spec: ToneSpec) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freqFrom, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(spec.freqTo, 1), now + spec.duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(spec.peakGain, now + Math.min(0.015, spec.duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);

    if (spec.filterFrom !== undefined && spec.filterTo !== undefined) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(spec.filterFrom, now);
      filter.frequency.exponentialRampToValueAtTime(spec.filterTo, now + spec.duration);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + spec.duration + 0.02);
  }

  private noiseBite(peakGain: number, filterFreq: number, duration = 0.09) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(filterFreq * 0.4, 200), now + duration);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  play(name: SoundName) {
    switch (name) {
      case 'hover':
        this.tone({ type: 'sine', freqFrom: 900, freqTo: 1300, duration: 0.05, peakGain: 0.02 });
        break;
      case 'click':
        this.tone({ type: 'triangle', freqFrom: 420, freqTo: 180, duration: 0.09, peakGain: 0.06 });
        break;
      case 'toggle':
        this.tone({ type: 'sine', freqFrom: 600, freqTo: 900, duration: 0.12, peakGain: 0.05 });
        break;
      case 'keystroke':
        this.tone({ type: 'square', freqFrom: 1400, freqTo: 1100, duration: 0.02, peakGain: 0.015 });
        break;
      case 'denied':
        this.tone({ type: 'square', freqFrom: 220, freqTo: 90, duration: 0.18, peakGain: 0.05 });
        break;
      case 'ask':
        this.tone({ type: 'triangle', freqFrom: 700, freqTo: 1000, duration: 0.1, peakGain: 0.045 });
        break;
      case 'play':
        this.tone({ type: 'sine', freqFrom: 440, freqTo: 880, duration: 0.13, peakGain: 0.05 });
        break;
      case 'chomp':
        this.noiseBite(0.09, 2200);
        setTimeout(() => this.noiseBite(0.08, 1600), 110);
        break;
      case 'shutter':
        this.noiseBite(0.12, 3600, 0.032);
        setTimeout(() => this.noiseBite(0.08, 2000, 0.045), 55);
        break;
      case 'transition':
        this.tone({
          type: 'sawtooth',
          freqFrom: 60,
          freqTo: 180,
          duration: 0.45,
          peakGain: 0.035,
          filterFrom: 200,
          filterTo: 2200,
        });
        break;
    }
  }
}

export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
export const playSound = (name: SoundName) => soundEngine?.play(name);

export const requestSoundMute = (muted: boolean) => emit('sound:set-muted', muted);

const STORAGE_KEY = 'technovit-sound-muted';
const INTERACTIVE_SELECTOR = 'a, button, [role="button"]';

export default function SoundManager() {
  const [muted, setMuted] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    hydrated.current = true;
    if (stored === 'true') queueMicrotask(() => setMuted(true));
  }, []);

  useEffect(() => {
    if (!soundEngine) return;
    soundEngine.muted = muted;
    if (hydrated.current) window.localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    if (!soundEngine) return;

    const unlock = () => {
      soundEngine.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    const handleHover = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) soundEngine.play('hover');
    };
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) soundEngine.play('click');
    };
    window.addEventListener('mouseover', handleHover);
    window.addEventListener('click', handleClick);

    const unsubTransition = on<boolean>('page:transitioning', (active) => {
      if (active) soundEngine.play('transition');
    });
    const unsubKeystroke = on('terminal:keystroke', () => soundEngine.play('keystroke'));
    const unsubDenied = on('sound:denied', () => soundEngine.play('denied'));
    const unsubTerminalOpen = on<boolean>('terminal:open', setTerminalOpen);
    const unsubSetMuted = on<boolean>('sound:set-muted', (next) => {
      soundEngine.muted = next;
      setMuted(next);
      if (!next) soundEngine.play('toggle');
    });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('click', handleClick);
      unsubTransition();
      unsubKeystroke();
      unsubDenied();
      unsubTerminalOpen();
      unsubSetMuted();
    };
  }, []);

  const toggle = () => requestSoundMute(!muted);
  const pushOffset = useStackOffset('sound-icon');
  const iconRef = useBroadcastHeight<HTMLButtonElement>('sound-icon-self');

  if (terminalOpen) return null;

  return (
    <motion.button
      ref={iconRef}
      onClick={toggle}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      aria-pressed={muted}
      data-cursor={muted ? 'Unmute' : 'Mute'}
      animate={{ y: -pushOffset }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[99999] w-10 h-10 rounded-full border border-[#84C87F]/30 bg-[#064928] text-[#84C87F] flex items-center justify-center hover:bg-[#84C87F] hover:text-[#064928] hover:border-[#84C87F] transition-colors"
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </motion.button>
  );
}
