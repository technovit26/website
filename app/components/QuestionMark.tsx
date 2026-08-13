'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Question } from '@phosphor-icons/react';
import { useLenis } from './SmoothScrolling';
import { useStackOffset } from '../hooks/useBottomStack';
import { on } from '../hooks/useEventBus';
import { playSound } from './SoundManager';

const CLICKED_KEY = 'technovit_question_clicked';
const DISMISSED_KEY = 'technovit_question_dismissed';

export default function QuestionMark() {
  const lenis = useLenis();
  const [isTouchDevice] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );
  const [dismissed, setDismissed] = useState(true);
  const [everClicked, setEverClicked] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrollUp, setScrollUp] = useState(true);
  const [playPillVisible, setPlayPillVisible] = useState(false);
  const playPillOffset = useStackOffset('play-pill');

  useEffect(() => {
    try {
      queueMicrotask(() => {
        setDismissed(!!localStorage.getItem(DISMISSED_KEY));
        setEverClicked(!!localStorage.getItem(CLICKED_KEY));
      });
    } catch {}
  }, []);

  useEffect(() => on<boolean>('trailer:play-pill-visible', setPlayPillVisible), []);

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

  useEffect(() => {
    if (!open) return;
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
  }, [open, lenis]);

  const openPanel = () => {
    playSound('ask');
    setOpen(true);
    if (!everClicked) {
      setEverClicked(true);
      try {
        localStorage.setItem(CLICKED_KEY, '1');
      } catch {}
    }
  };

  const minimize = () => {
    playSound('ask');
    setOpen(false);
  };

  const cut = () => {
    playSound('ask');
    setOpen(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {}
  };

  if (dismissed) return null;

  const visible = scrollUp && !open && playPillVisible;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.button
            key="question-mark-button"
            onClick={openPanel}
            aria-label="What is this site?"
            data-cursor="?"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: -playPillOffset }}
            exit={{ opacity: 0, y: 24 }}
            transition={
              everClicked
                ? { type: 'spring', stiffness: 300, damping: 26 }
                : { type: 'spring', stiffness: 240, damping: 12 }
            }
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[200] w-9 h-9 sm:w-10 sm:h-10 rounded-full
              border border-[#84C87F]/30 bg-[#064928] text-[#84C87F] flex items-center justify-center
              shadow-lg hover:bg-[#84C87F] hover:text-[#064928] hover:border-[#84C87F] transition-colors"
          >
            <Question size={16} weight="bold" />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        aria-hidden={!open}
        onClick={minimize}
        className={`fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        role="dialog"
        aria-hidden={!open}
        aria-label="About this site"
        data-no-context-menu
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] sm:w-[440px] max-w-[92vw]
          rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a] font-terminal
          shadow-[0_0_0_1px_rgba(132,200,127,0.15),0_40px_100px_rgba(0,0,0,0.85)]
          transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 relative select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={cut}
              aria-label="Close and don't show this again"
              title="Close for good"
              className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors"
            />
            <button
              onClick={minimize}
              aria-label="Minimize"
              title="Minimize"
              className="w-[12px] h-[12px] rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors"
            />
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/60">
            psst
          </span>
        </div>

        <div className="px-6 py-7 space-y-4">
          <p className="font-clash font-bold leading-[1.1] text-2xl sm:text-3xl md:text-4xl text-white">
            Not just a website.
            <br />
            <span className="text-[#84C87F]">An experience.</span>
          </p>
          <p className="text-white/80 text-sm leading-relaxed">
            TechnoVIT is a hundred experiences happening together, beautifully. This site is
            built the same way — not a page about the fest, but a piece of it.
          </p>
          <p className="text-white/80 text-sm leading-relaxed">
            It&apos;s filled with easter eggs. Find them all for something special.
          </p>
          <p className="text-[#84C87F] text-sm font-semibold">
            Hints are everywhere. Look closely.
          </p>
          {isTouchDevice && (
            <p className="text-white/50 text-xs leading-relaxed border-t border-[#84C87F]/10 pt-3">
              Only a PC can help you discover all the easter eggs.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
