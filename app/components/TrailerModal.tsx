'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, MotionConfig, Variants } from 'motion/react';
import { ArrowClockwise, Pause, Play, SpeakerSimpleHigh, SpeakerSimpleX } from '@phosphor-icons/react';
import { useLenis } from './SmoothScrolling';
import { emit, on } from '../hooks/useEventBus';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';
import { playSound } from './SoundManager';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const TRAILER_VIDEO_URL = 'https://technovit.cdn.a2ys.dev/root-assets/trailer.webm';
const STALE_VIDEO_CACHE_NAMES = ['technovit26-trailer-cache', 'technovit26-trailer-cache-v2'];

const STORAGE_KEY = 'technovit26_trailer_seen';
const POSITION_STORAGE_KEY = 'technovit26_trailer_position';
const CONTROLS_HIDE_DELAY = 2500;

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
  const [phase, setPhase] = useState<'hidden' | 'open' | 'closing' | 'minimizing' | 'minimized'>('hidden');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showPill, setShowPill] = useState(false);
  const [scrollUp, setScrollUp] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [activeSrc, setActiveSrc] = useState<string | undefined>(undefined);
  const isTouchDevice = useIsTouchDevice();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = phase !== 'hidden';
  const visible = phase === 'open' || phase === 'closing' || phase === 'minimizing';
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const lenis = useLenis();

  useEffect(() => {
    emit('trailer:play-pill-visible', showPill && scrollUp);
  }, [showPill, scrollUp]);

  useEffect(() => {
    // Runs once, when this (route-persistent) component first mounts — i.e. on the
    // initial hard load of the app. `pathname` here is whatever URL that load landed
    // on, so this only auto-opens when the user's entry point was the homepage itself,
    // never when they land elsewhere and later navigate to "/" client-side.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'minimized' || stored === 'closed') {
        queueMicrotask(() => setShowPill(true));
      } else if (!stored && pathname === '/') {
        queueMicrotask(() => setPhase('open'));
      }
    } catch {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof caches === 'undefined') return;
    STALE_VIDEO_CACHE_NAMES.forEach((name) => {
      caches.delete(name).catch(() => {});
    });
  }, []);

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 4) {
        setScrollUp(y < lastY);
        lastY = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showControlsTemporarily = () => {
    setControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  };

  useEffect(() => {
    if (paused && hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
      setControlsVisible(true);
    }
  }, [paused]);

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
  const savePlaybackPosition = () => {
    try {
      if (videoRef.current && videoRef.current.currentTime > 0) {
        localStorage.setItem(POSITION_STORAGE_KEY, String(videoRef.current.currentTime));
      }
    } catch {}
  };
  const handleClose = () => {
    videoRef.current?.pause();
    try {
      localStorage.removeItem(POSITION_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, 'closed');
    } catch {}
    setPhase('closing');
  };
  const handleMinimize = () => {
    savePlaybackPosition();
    videoRef.current?.pause();
    try {
      localStorage.setItem(STORAGE_KEY, 'minimized');
    } catch {}
    setPhase('minimizing');
  };
  useEffect(() => {
    if (phase === 'open' && !activeSrc) {
      queueMicrotask(() => {
        setActiveSrc(TRAILER_VIDEO_URL);
        setVideoReady(true);
        setBuffering(true);
      });
    }
  }, [phase, activeSrc]);

  const handleExitComplete = () => {
    setShowPill(true);
    setPhase('hidden');
    setVideoReady(false);
    setActiveSrc(undefined);
    setMuted(true);
    setEnded(false);
    setBuffering(false);
    setBuffered(0);
    setPaused(true);
    setCurrentTime(0);
    setDuration(0);
    setControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
  };
  const handleOpen = useCallback(() => {
    playSound('play');
    setShowPill(false);
    setPhase('open');
  }, []);

  useEffect(() => on('trailer:request-open', handleOpen), [handleOpen]);
  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
        if (!next && volume === 0) {
          videoRef.current.volume = 1;
          setVolume(1);
        }
      }
      return next;
    });
  };
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    setVolume(next);
    if (videoRef.current) {
      videoRef.current.volume = next;
      videoRef.current.muted = next === 0;
    }
    setMuted(next === 0);
  };
  const seekToClientX = (clientX: number) => {
    const bar = seekBarRef.current;
    const v = videoRef.current;
    if (!bar || !v || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
    setCurrentTime(v.currentTime);
  };
  const handleSeekPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    seekToClientX(e.clientX);
    const handleMove = (ev: PointerEvent) => {
      if (isDraggingRef.current) seekToClientX(ev.clientX);
    };
    const handleUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
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
    try {
      localStorage.removeItem(POSITION_STORAGE_KEY);
    } catch {}
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };
  return (
    <MotionConfig transition={{ duration: 0.3, ease: EASE }}>
      <AnimatePresence>
        {mounted && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate={visible ? 'visible' : 'exit'}
            exit="exit"
            aria-hidden={!visible}
            onClick={handleClose}
            className={`fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-4 sm:p-8'} ${visible ? '' : 'pointer-events-none'}`}
            style={{ background: 'rgba(4,10,6,0.92)' }}
          >
            <motion.div
              ref={modalRef}
              layout
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate={
                phase === 'closing'
                  ? 'exitClose'
                  : phase === 'minimizing' || phase === 'minimized'
                    ? 'exitMinimize'
                    : 'visible'
              }
              onAnimationComplete={(definition) => {
                if (definition === 'exitClose') {
                  handleExitComplete();
                } else if (definition === 'exitMinimize') {
                  setShowPill(true);
                  setPhase('minimized');
                } else if (definition === 'visible' && modalRef.current) {
                  modalRef.current.style.clipPath = '';
                }
              }}
              className={`relative grid grid-rows-[auto_1fr_auto] bg-[#03080a] overflow-hidden transition-[border-radius,box-shadow] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isFullscreen
                  ? 'w-full h-full max-w-none rounded-none'
                  : 'w-[95vw] sm:w-[90vw] max-w-[1200px] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-2xl'
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
                className={`flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#080f09] border-b border-[#84C87F]/10 shrink-0 z-10 relative select-none ${
                  isFullscreen ? '' : 'rounded-t-2xl'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="w-[14px] h-[14px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors"
                    aria-label="Close"
                  />
                  <button
                    onClick={handleMinimize}
                    className="w-[14px] h-[14px] rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors"
                    aria-label="Minimize"
                  />
                  {!isTouchDevice && (
                    <button
                      onClick={toggleFullscreen}
                      className="w-[14px] h-[14px] rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 transition-colors"
                      aria-label="Fullscreen"
                    />
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
              </motion.div>
              <motion.div
                layout
                className={`relative w-full bg-[#03080a] overflow-hidden min-h-0 ${!isFullscreen ? 'aspect-video' : ''}`}
                onMouseMove={showControlsTemporarily}
                onTouchStart={showControlsTemporarily}
              >
                <div className="absolute inset-5 sm:inset-6 overflow-hidden rounded-lg">
                  <video
                    ref={videoRef}
                    src={activeSrc}
                    preload={videoReady ? 'auto' : 'none'}
                    muted={muted}
                    playsInline
                    disablePictureInPicture
                    onClick={togglePlay}
                    onEnded={() => {
                      setEnded(true);
                      try {
                        localStorage.removeItem(POSITION_STORAGE_KEY);
                      } catch {}
                    }}
                    onWaiting={() => setBuffering(true)}
                    onPlaying={() => setBuffering(false)}
                    onCanPlay={() => setBuffering(false)}
                    onPlay={() => {
                      setPaused(false);
                      showControlsTemporarily();
                    }}
                    onPause={() => setPaused(true)}
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      setDuration(v.duration);
                      try {
                        const stored = localStorage.getItem(POSITION_STORAGE_KEY);
                        const t = stored ? parseFloat(stored) : 0;
                        if (Number.isFinite(t) && t > 0 && t < v.duration) v.currentTime = t;
                      } catch {}
                    }}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onProgress={(e) => {
                      const v = e.currentTarget;
                      if (!v.buffered.length) return;
                      const bufferedEnd = v.buffered.end(v.buffered.length - 1);
                      if (v.duration) setBuffered((bufferedEnd / v.duration) * 100);
                    }}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    controls={false}
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 z-30 px-3 sm:px-4 pb-2.5 pt-10
                      bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col gap-2
                      transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <div
                      ref={seekBarRef}
                      onPointerDown={handleSeekPointerDown}
                      className="relative h-4 flex items-center cursor-pointer group/seek"
                    >
                      <div className="absolute inset-x-0 h-[5px] rounded-full bg-white/20" />
                      <div className="absolute left-0 h-[5px] rounded-full bg-white/30" style={{ width: `${buffered}%` }} />
                      <div className="absolute left-0 h-[5px] rounded-full bg-[#84C87F]" style={{ width: `${progress}%` }} />
                      <div
                        className="absolute w-4 h-4 rounded-full bg-[#84C87F] shadow -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
                        style={{ left: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        aria-label={paused ? 'Play' : 'Pause'}
                        className="text-[#84C87F] hover:text-white transition-colors"
                      >
                        {paused ? <Play size={22} weight="fill" /> : <Pause size={22} weight="fill" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
                        className="text-[#84C87F] hover:text-white transition-colors"
                      >
                        {muted || volume === 0 ? <SpeakerSimpleX size={20} weight="bold" /> : <SpeakerSimpleHigh size={20} weight="bold" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        className="w-20 accent-[#84C87F] cursor-pointer"
                      />
                      <span className="ml-auto font-clash text-xs sm:text-sm text-white/70 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
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
                    className={`absolute w-7 h-7 pointer-events-none border-[#84C87F] z-40
                      ${pos === 'tl' ? 'top-5 sm:top-6 left-5 sm:left-6 border-t-[3px] border-l-[3px]' : ''}
                      ${pos === 'tr' ? 'top-5 sm:top-6 right-5 sm:right-6 border-t-[3px] border-r-[3px]' : ''}
                      ${pos === 'bl' ? 'bottom-5 sm:bottom-6 left-5 sm:left-6 border-b-[3px] border-l-[3px]' : ''}
                      ${pos === 'br' ? 'bottom-5 sm:bottom-6 right-5 sm:right-6 border-b-[3px] border-r-[3px]' : ''}
                    `}
                  />
                ))}
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
              </motion.div>
              <motion.div
                layout="position"
                className={`flex items-center justify-center py-3.5 bg-[#080f09] border-t border-[#84C87F]/10 shrink-0 z-10 relative ${
                  isFullscreen ? '' : 'rounded-b-2xl'
                }`}
              >
                <span className="w-10 h-[3px] rounded-full bg-[#84C87F]/15" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
