'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, Variants } from 'motion/react';
import { ArrowClockwise, Play, Question, SpeakerSimpleHigh, SpeakerSimpleX } from '@phosphor-icons/react';
import { useLenis } from './SmoothScrolling';

const TRAILER_VIDEO_URL = 'https://technovit.cdn.a2ys.dev/root-assets/trailer.webm';

const STORAGE_KEY = 'technovit26_trailer_seen';
const PRELOAD_SECONDS = 10;

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: EASE } },
};
const NO_CLIP = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const GENIE_NARROW = 'polygon(0% 0%, 100% 0%, 68% 100%, 32% 100%)';
const GENIE_NARROWER = 'polygon(0% 0%, 100% 0%, 54% 100%, 46% 100%)';
const GENIE_TIP = 'polygon(0% 0%, 100% 0%, 50.5% 100%, 49.5% 100%)';
const modalVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0.08, scaleY: 0.03, y: '74vh', clipPath: GENIE_TIP },
  visible: {
    opacity: [0, 0.9, 1, 1],
    scaleX: [0.08, 0.3, 0.66, 1],
    scaleY: [0.03, 0.3, 0.84, 1],
    y: ['74vh', '26vh', '4vh', 0],
    clipPath: [GENIE_TIP, GENIE_NARROWER, GENIE_NARROW, NO_CLIP],
    transition: { duration: 0.5, ease: EASE, times: [0, 0.22, 0.55, 1], delay: 0.05 },
  },
  exitClose: {
    opacity: 0,
    scale: 0.92,
    y: -10,
    clipPath: NO_CLIP,
    transition: { duration: 0.2, ease: EASE },
  },
  exitMinimize: {
    opacity: [1, 1, 0.9, 0],
    scaleX: [1, 0.66, 0.3, 0.08],
    scaleY: [1, 0.84, 0.3, 0.03],
    y: [0, '4vh', '26vh', '74vh'],
    clipPath: [NO_CLIP, GENIE_NARROW, GENIE_NARROWER, GENIE_TIP],
    transition: { duration: 0.4, ease: EASE, times: [0, 0.22, 0.55, 1] },
  },
};

export default function TrailerModal() {
  const [phase, setPhase] = useState<'hidden' | 'open' | 'closing' | 'minimizing'>('hidden');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showPill, setShowPill] = useState(false);
  const [isTouchDevice] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const visible = phase !== 'hidden';
  const lenis = useLenis();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'minimized') {
        setShowPill(true);
      } else if (!stored) {
        setPhase('open');
      }
    } catch {
    }
  }, []);

  // While the pill is showing, keep the first ~10s of the trailer warm in the
  // browser's HTTP cache so restoring feels instant instead of re-buffering from
  // zero — bounded so a minimized trailer doesn't quietly keep eating bandwidth.
  useEffect(() => {
    if (!showPill) return;

    const preloadVideo = document.createElement('video');
    preloadVideo.src = TRAILER_VIDEO_URL;
    preloadVideo.muted = true;
    preloadVideo.preload = 'auto';

    const stopIfWarmEnough = () => {
      const { buffered } = preloadVideo;
      if (buffered.length && buffered.end(buffered.length - 1) >= PRELOAD_SECONDS) {
        preloadVideo.removeEventListener('progress', stopIfWarmEnough);
        preloadVideo.pause();
        preloadVideo.removeAttribute('src');
        preloadVideo.load();
      }
    };

    preloadVideo.addEventListener('progress', stopIfWarmEnough);
    preloadVideo.load();

    return () => {
      preloadVideo.removeEventListener('progress', stopIfWarmEnough);
      preloadVideo.pause();
      preloadVideo.removeAttribute('src');
      preloadVideo.load();
    };
  }, [showPill]);

  useEffect(() => {
    if (!visible) return;
    lenis?.stop();
    const html = document.documentElement;
    const body = document.body;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, [visible, lenis]);
  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'closed');
    } catch {}
    setPhase('closing');
  };
  const handleMinimize = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'minimized');
    } catch {}
    setPhase('minimizing');
  };
  const handleExitComplete = () => {
    if (phase === 'minimizing') setShowPill(true);
    setPhase('hidden');
    setVideoReady(false);
    setMuted(true);
    setEnded(false);
    setBuffering(false);
    setProgress(0);
    setBuffered(0);
  };
  const handleRestore = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setShowPill(false);
    setPhase('open');
  };
  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };
  const toggleFullscreen = () => {
    if (isTouchDevice) return;
    setIsFullscreen((prev) => !prev);
  };
  const handleTitleBarDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    toggleFullscreen();
  };
  const handleReplay = () => {
    setEnded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };
  return (
    <MotionConfig transition={{ duration: 0.3, ease: EASE }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={(definition) => {
              if (definition === 'visible') setVideoReady(true);
            }}
            className={`fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-4 sm:p-8'}`}
            style={{ background: 'rgba(4,10,6,0.92)' }}
          >
            <motion.div
              ref={modalRef}
              layout
              variants={modalVariants}
              initial="hidden"
              animate={
                phase === 'closing' ? 'exitClose' : phase === 'minimizing' ? 'exitMinimize' : 'visible'
              }
              onAnimationComplete={(definition) => {
                if (definition === 'exitClose' || definition === 'exitMinimize') {
                  handleExitComplete();
                } else if (definition === 'visible' && modalRef.current) {
                  modalRef.current.style.clipPath = '';
                }
              }}
              className={`relative grid grid-rows-[auto_1fr_auto] bg-[#03080a] overflow-hidden transition-[border-radius,box-shadow] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isFullscreen
                  ? 'w-full h-full max-w-none rounded-none'
                  : 'w-[95vw] sm:w-[90vw] max-w-[1200px] rounded-2xl'
              }`}
              style={{
                boxShadow: isFullscreen
                  ? '0 0 0 0 rgba(0,0,0,0)'
                  : '0 0 0 1px rgba(132,200,127,0.2), 0 40px 100px rgba(0,0,0,0.85)',
                transformOrigin: phase === 'closing' ? 'center' : 'center bottom',
              }}
            >
              <motion.div
                layout="position"
                onDoubleClick={handleTitleBarDoubleClick}
                className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#080f09] border-b border-[#84C87F]/10 shrink-0 z-10 relative select-none"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="w-[14px] h-[14px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center group transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <button
                    onClick={handleMinimize}
                    className="w-[14px] h-[14px] rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center group transition-colors"
                    aria-label="Minimize"
                  >
                    <svg className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                  </button>
                  {!isTouchDevice && (
                    <button
                      onClick={toggleFullscreen}
                      className="w-[14px] h-[14px] rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group transition-colors"
                      aria-label="Fullscreen"
                    >
                      {isFullscreen ? (
                        <svg className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" /></svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                      )}
                    </button>
                  )}
                </div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.25 }}
                  className="absolute right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 max-w-[45%] sm:max-w-none truncate
                    font-clash font-bold text-[#84C87F]/70 text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.22em] pointer-events-none"
                >
                  TechnoVIT - A Sneak Peek
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="font-clash font-bold text-[#84C87F]/40 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] hidden sm:block pointer-events-none"
                >
                  Try the buttons — they work
                </motion.span>
              </motion.div>
              <div
                className={`relative w-full bg-[#03080a] overflow-hidden min-h-0 ${!isFullscreen ? 'aspect-video' : ''}`}
              >
                <div className="absolute inset-5 sm:inset-6 overflow-hidden rounded-lg">
                  <video
                    ref={videoRef}
                    src={videoReady ? TRAILER_VIDEO_URL : undefined}
                    autoPlay={videoReady}
                    preload={videoReady ? 'metadata' : 'none'}
                    muted={muted}
                    playsInline
                    disablePictureInPicture
                    onEnded={() => setEnded(true)}
                    onWaiting={() => setBuffering(true)}
                    onPlaying={() => setBuffering(false)}
                    onCanPlay={() => setBuffering(false)}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                    }}
                    onProgress={(e) => {
                      const v = e.currentTarget;
                      if (v.duration && v.buffered.length) {
                        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    controls={false}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
                    <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${buffered}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-[#84C87F]" style={{ width: `${progress}%` }} />
                  </div>
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay z-10"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)',
                    }}
                  />
                  <motion.div
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(6,73,40,0.35) 100%)',
                    }}
                  />
                </div>
                {(['tl', 'tr', 'bl', 'br'] as const).map((pos, idx) => (
                  <motion.span
                    key={pos}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.05, duration: 0.25, ease: EASE }}
                    aria-hidden
                    className={`absolute w-7 h-7 pointer-events-none border-[#84C87F]/80 z-20
                      ${pos === 'tl' ? 'top-5 sm:top-6 left-5 sm:left-6 border-t-[3px] border-l-[3px]' : ''}
                      ${pos === 'tr' ? 'top-5 sm:top-6 right-5 sm:right-6 border-t-[3px] border-r-[3px]' : ''}
                      ${pos === 'bl' ? 'bottom-5 sm:bottom-6 left-5 sm:left-6 border-b-[3px] border-l-[3px]' : ''}
                      ${pos === 'br' ? 'bottom-5 sm:bottom-6 right-5 sm:right-6 border-b-[3px] border-r-[3px]' : ''}
                    `}
                  />
                ))}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.25, ease: EASE }}
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
                  className="absolute bottom-9 right-9 sm:bottom-10 sm:right-10 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm
                    border border-[#84C87F]/30 flex items-center justify-center text-[#84C87F]
                    hover:bg-black/60 hover:border-[#84C87F]/60 transition-colors"
                >
                  {muted ? <SpeakerSimpleX size={16} weight="bold" /> : <SpeakerSimpleHigh size={16} weight="bold" />}
                </motion.button>
                <AnimatePresence>
                  {buffering && !ended && (
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-5 sm:inset-6 z-30 flex items-center justify-center pointer-events-none"
                    >
                      <span className="w-8 h-8 rounded-full border-2 border-[#84C87F]/25 border-t-[#84C87F] animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {ended && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      onClick={handleReplay}
                      className="absolute inset-5 sm:inset-6 z-40 flex flex-col items-center justify-center gap-3 rounded-lg
                        bg-black/75 backdrop-blur-sm text-[#84C87F] hover:bg-black/85 transition-colors"
                    >
                      <span className="w-14 h-14 rounded-full border-2 border-[#84C87F]/50 flex items-center justify-center">
                        <ArrowClockwise size={22} weight="bold" />
                      </span>
                      <span className="font-clash font-bold uppercase tracking-[0.25em] text-xs">Replay</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <motion.div layout="position" className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#080f09] border-t border-[#84C87F]/10 shrink-0 z-10 relative">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.25 }}
                  className="font-clash font-bold text-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.3em]"
                >
                  VIT Chennai · 2026
                </motion.span>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.25 }}
                    className="font-clash font-bold text-[#84C87F]/50 text-[10px] sm:text-[11px] uppercase tracking-widest"
                  >
                    Inclusive Innovation
                  </motion.span>
                  <div className="relative group">
                    <Question size={13} weight="bold" className="text-white/25 hover:text-[#84C87F]/70 transition-colors cursor-help" />
                    <div
                      className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 rounded-lg bg-[#080f09] border border-[#84C87F]/20
                        text-[10px] leading-relaxed text-[#84C87F]/80 opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity duration-200 shadow-xl z-20 normal-case tracking-normal font-[450]"
                    >
                      You can&apos;t control the video playback. Sorry! 😅
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPill && (
          <motion.button
            key="trailer-pill"
            onClick={handleRestore}
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            exit={{ opacity: 0, scale: 0.3, y: 20 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.4, ease: EASE },
              y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
            }}
            style={{ transformOrigin: 'center bottom' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2.5
              bg-[#080f09] border border-[#84C87F]/30 rounded-full pl-3 pr-4 py-2.5 shadow-2xl
              text-[#84C87F] hover:border-[#84C87F]/60 transition-colors"
            aria-label="Restore trailer"
          >
            <span className="w-7 h-7 rounded-full bg-[#84C87F]/15 flex items-center justify-center">
              <Play size={12} weight="fill" />
            </span>
            <span className="font-clash font-bold uppercase tracking-[0.15em] text-[10px]">
              Watch Trailer
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
