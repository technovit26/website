'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useEggsFound, type EggFoundPayload } from '../hooks/useEggsFound';
import { on } from '../hooks/useEventBus';
import { useStackOffset, useStackPush } from '../hooks/useBottomStack';
import { playSound } from './SoundManager';

const ALL_FOUND_KEY = 'technovit_eggs_all_found';
const CELEBRATE_MS = 3400;
const PROGRESS_TOAST_MS = 2600;

export default function EggMaster() {
  const { found, total, allFound } = useEggsFound();
  const [unlocked, setUnlocked] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [progressToast, setProgressToast] = useState<number | null>(null);

  useEffect(() => {
    return on<EggFoundPayload>('egg:found', ({ count }) => {
      if (count >= total) return;
      setProgressToast(count);
      setTimeout(() => setProgressToast(null), PROGRESS_TOAST_MS);
    });
  }, [total]);

  const hintOffset = useStackOffset('terminal-hint');
  const toastRef = useStackPush<HTMLDivElement>('egg-toast', progressToast !== null);
  const toastOffset = useStackOffset('egg-toast');
  const counterOffset = hintOffset + toastOffset;

  useEffect(() => {
    try {
      if (localStorage.getItem(ALL_FOUND_KEY)) queueMicrotask(() => setUnlocked(true));
    } catch {}
  }, []);

  useEffect(() => {
    if (!allFound || unlocked) return;
    let firstTime = false;
    try {
      firstTime = !localStorage.getItem(ALL_FOUND_KEY);
      localStorage.setItem(ALL_FOUND_KEY, '1');
    } catch {}
    queueMicrotask(() => setUnlocked(true));
    if (firstTime) {
      playSound('toggle');
      queueMicrotask(() => setCelebrate(true));
      console.log('%cEvery secret on this site, found.', 'color:#84C87F;font-weight:bold;font-size:14px;');
      setTimeout(() => setCelebrate(false), CELEBRATE_MS);
    }
  }, [allFound, unlocked]);

  return (
    <>
      {!unlocked && found > 0 && (
        <motion.div
          animate={{ y: -counterOffset }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          title={`${found}/${total} secrets found`}
          className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-[9999] h-9 px-3 rounded-full
            border border-[#84C87F]/20 bg-[#064928]/90 flex items-center justify-center
            text-[10px] font-bold tracking-widest text-[#84C87F]/70 select-none"
        >
          {found}/{total}
        </motion.div>
      )}

      <AnimatePresence>
        {progressToast !== null && (
          <motion.div
            key="egg-progress-toast"
            ref={toastRef}
            initial={{ opacity: 0, x: -10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1, y: -hintOffset }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-[9999] bg-[#064928] text-[#84C87F]
              text-xs font-bold px-3.5 py-2 rounded-full shadow-2xl border border-[#84C87F]/30 whitespace-nowrap"
          >
            Easter egg #{progressToast} found. Keep going.
          </motion.div>
        )}
      </AnimatePresence>

      {unlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: -hintOffset }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          title="You found every secret on this site"
          className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-[9999] w-9 h-9 rounded-full
            border border-[#84C87F]/30 bg-[#064928] flex items-center justify-center text-base shadow-lg select-none"
        >
          🏆
        </motion.div>
      )}

      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed top-[14%] left-1/2 -translate-x-1/2 z-[999996] bg-[#064928] text-[#84C87F]
              font-clash font-bold text-base px-6 py-3.5 rounded-full border border-[#84C87F]/40
              flex items-center gap-2.5 whitespace-nowrap"
            style={{ boxShadow: '0 0 40px rgba(132,200,127,0.35), 0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <motion.span
              className="text-xl"
              animate={{ rotate: [0, -12, 12, -8, 0] }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              🏆
            </motion.span>
            You found everything. Respect.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
