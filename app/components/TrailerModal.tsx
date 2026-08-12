'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, Variants } from 'motion/react';
import { useLenis } from './SmoothScrolling';

const PLACEHOLDER_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

const STORAGE_KEY = 'technovit26_trailer_seen';

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

export default function TrailerModal() {
  const [phase, setPhase] = useState<'hidden' | 'open' | 'closing' | 'minimizing'>('hidden');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = phase !== 'hidden';
  const lenis = useLenis();

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setPhase('open');
      }
    } catch {
    }
  }, []);

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
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setPhase('closing');
  };
  const handleMinimize = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPhase('minimizing');
  };
  const handleExitComplete = () => setPhase('hidden');
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.16, ease: EASE } },
  };
  const NO_CLIP = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 14, clipPath: NO_CLIP },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      clipPath: NO_CLIP,
      transition: { duration: 0.3, ease: EASE, delay: 0.05 },
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
      clipPath: [
        NO_CLIP,
        'polygon(0% 0%, 100% 0%, 68% 100%, 32% 100%)',
        'polygon(0% 0%, 100% 0%, 54% 100%, 46% 100%)',
        'polygon(0% 0%, 100% 0%, 50.5% 100%, 49.5% 100%)',
      ],
      transition: { duration: 0.4, ease: EASE, times: [0, 0.22, 0.55, 1] },
    },
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
            className={`fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-md ${isFullscreen ? 'p-0' : 'p-4 sm:p-8'}`}
            style={{ background: 'rgba(4,10,6,0.92)' }}
          >
            <motion.div
              layout
              variants={modalVariants}
              initial="hidden"
              animate={
                phase === 'closing' ? 'exitClose' : phase === 'minimizing' ? 'exitMinimize' : 'visible'
              }
              onAnimationComplete={(definition) => {
                if (definition === 'exitClose' || definition === 'exitMinimize') {
                  handleExitComplete();
                }
              }}
              className={`relative flex flex-col bg-[#03080a] overflow-hidden transition-[border-radius,box-shadow] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isFullscreen
                  ? 'w-full h-full max-w-none rounded-none'
                  : 'w-[95vw] sm:w-[90vw] max-w-[1200px] rounded-2xl'
              }`}
              style={{
                boxShadow: isFullscreen
                  ? '0 0 0 0 rgba(0,0,0,0)'
                  : '0 0 0 1px rgba(132,200,127,0.2), 0 40px 100px rgba(0,0,0,0.85)',
                transformOrigin: phase === 'minimizing' ? 'center bottom' : 'center',
              }}
            >
              <motion.div layout="position" className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#080f09] border-b border-[#84C87F]/10 shrink-0 z-10 relative">
                <div className="flex items-center gap-4">
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
                  </div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                    className="font-clash font-bold text-[#84C87F]/70 text-[11px] uppercase tracking-[0.22em] hidden sm:block"
                  >
                    TechnoVIT - A Sneak Peek
                  </motion.span>
                </div>
              </motion.div>
              <motion.div
                layout
                className={`relative w-full bg-[#03080a] overflow-hidden flex-grow flex flex-col justify-center ${!isFullscreen ? 'aspect-video' : ''}`}
              >
                <video
                  ref={videoRef}
                  src={PLACEHOLDER_VIDEO}
                  autoPlay
                  muted
                  playsInline
                  loop
                  disablePictureInPicture
                  className="absolute inset-0 w-full h-full object-cover"
                  controls={false}
                />
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
                {(['tl', 'tr', 'bl', 'br'] as const).map((pos, idx) => (
                  <motion.span
                    key={pos}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.05, duration: 0.25, ease: EASE }}
                    aria-hidden
                    className={`absolute w-6 h-6 pointer-events-none border-[#84C87F]/40 z-20
                      ${pos === 'tl' ? 'top-4 left-4  border-t-2 border-l-2' : ''}
                      ${pos === 'tr' ? 'top-4 right-4 border-t-2 border-r-2' : ''}
                      ${pos === 'bl' ? 'bottom-4 left-4  border-b-2 border-l-2' : ''}
                      ${pos === 'br' ? 'bottom-4 right-4 border-b-2 border-r-2' : ''}
                    `}
                  />
                ))}
              </motion.div>
              <motion.div layout="position" className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#080f09] border-t border-[#84C87F]/10 shrink-0 z-10 relative">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.25 }}
                  className="font-clash font-bold text-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.3em]"
                >
                  VIT Chennai · 2026
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.25 }}
                  className="font-clash font-bold text-[#84C87F]/50 text-[10px] sm:text-[11px] uppercase tracking-widest"
                >
                  Inclusive Innovation
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
