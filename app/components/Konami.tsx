'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { useStackPush } from '../hooks/useBottomStack';
import { markEggFound, KONAMI_EGG_KEY } from '../hooks/useEggsFound';
import { playSound } from './SoundManager';

const FLASH_VISIBLE_MS = 2200;

export default function Konami() {
  const [unlocked, setUnlocked] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KONAMI_EGG_KEY)) queueMicrotask(() => setUnlocked(true));
    } catch {}
  }, []);

  const handleSuccess = useCallback(() => {
    let firstTime = false;
    try {
      firstTime = !localStorage.getItem(KONAMI_EGG_KEY);
    } catch {}
    markEggFound(KONAMI_EGG_KEY);
    playSound('toggle');
    setUnlocked(true);
    setFlash(firstTime ? 'Konami Discovered!' : 'Konami!');
    setTimeout(() => setFlash(null), FLASH_VISIBLE_MS);
  }, []);

  useKonamiCode(handleSuccess);
  const badgeRef = useStackPush<HTMLDivElement>('sound-icon', unlocked);

  return (
    <>
      {unlocked && (
        <motion.div
          ref={badgeRef}
          initial={{ opacity: 0, scale: 0.4, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          title="Konami code unlocked"
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[99999] w-10 h-10 rounded-full
            border border-[#84C87F]/30 bg-[#064928] flex items-center justify-center text-lg shadow-lg select-none"
        >
          🏅
        </motion.div>
      )}

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -16 }}
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
              🏅
            </motion.span>
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
