'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import Countdown from './Countdown';
import { playSound } from './SoundManager';
import { markEggFound, HOME_EGG_KEY } from '../hooks/useEggsFound';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!%&';
const FINAL_TEXT = "technoVIT'26";
const REPLAY_TRIGGER_COUNT = 5;
const FLASH_VISIBLE_MS = 2400;

const Header = () => {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLParagraphElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const clicksRef = useRef(0);
  const replayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const handleTitleClick = useCallback(() => {
    const h1 = h1Ref.current;
    if (!h1) return;

    clicksRef.current += 1;
    playSound('keystroke');

    if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    let iteration = 0;
    const totalChars = FINAL_TEXT.length;
    replayIntervalRef.current = setInterval(() => {
      h1.innerText = FINAL_TEXT.split('').map((char, i) => {
        if (i < Math.floor(iteration)) return char;
        if (char === "'" || char === ' ') return char;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');
      iteration += 0.5;
      if (iteration >= totalChars) {
        h1.innerText = FINAL_TEXT;
        if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
      }
    }, 30);

    if (clicksRef.current === REPLAY_TRIGGER_COUNT) {
      markEggFound(HOME_EGG_KEY);
      playSound('toggle');
      setFlash('Okay, persistence noted. Respect.');
      setTimeout(() => setFlash(null), FLASH_VISIBLE_MS);
    }
  }, []);

  useLayoutEffect(() => {
    const h1 = h1Ref.current;
    const line = lineRef.current;
    const theme = themeRef.current;
    const date = dateRef.current;
    const countdown = countdownRef.current;
    if (!h1 || !line || !theme || !date || !countdown) return;

    let iteration = 0;
    const totalChars = FINAL_TEXT.length;

    const scrambleInterval = setInterval(() => {
      h1.innerText = FINAL_TEXT.split('').map((char, i) => {
        if (i < Math.floor(iteration)) return char;
        if (char === "'" || char === ' ') return char;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');

      iteration += 0.4;

      if (iteration >= totalChars) {
        h1.innerText = FINAL_TEXT;
        clearInterval(scrambleInterval);
        gsap.fromTo(
          [line, theme],
          { y: 24, opacity: 0, filter: 'blur(6px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', delay: 0.1 }
        );
        gsap.fromTo(
          [date, countdown],
          { y: 24, opacity: 0, filter: 'blur(6px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.2, ease: 'power3.out', delay: 0.3 }
        );
      }
    }, 35);


    gsap.fromTo(
      h1,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );



    return () => {
      clearInterval(scrambleInterval);
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, []);

  return (
    <section className="home-hero-text relative flex flex-col overflow-hidden bg-[#c2e0a5]">
      <div className="flex-1 flex flex-col items-center justify-center
        px-4 sm:px-6
        pt-6 sm:pt-10 md:pt-20 lg:pt-20">

        <div className="relative pb-4 sm:pb-5 md:pb-6 mb-14 sm:mb-16 md:mb-20">
          <h1
            ref={h1Ref}
            onClick={handleTitleClick}
            data-cursor="Recompile"
            className="font-clash font-bold leading-none text-center text-[#08414a] whitespace-nowrap
              text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl cursor-pointer select-none"
          >
            {FINAL_TEXT}
          </h1>

          <div
            ref={lineRef}
            className="absolute left-0 right-0 bottom-0 h-1 sm:h-[5px] md:h-1.5 bg-[#08414a] opacity-0"
          />

          <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
            <div className="translate-y-1/2">
              <div
                ref={themeRef}
                className="opacity-0 bg-[#08414a] px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 shadow-xl"
              >
                <p
                  className="font-clash font-bold uppercase whitespace-nowrap text-[#c2e0a5] tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em]
                    text-sm sm:text-base md:text-xl lg:text-2xl leading-none translate-y-[1px] ml-[0.2em] sm:ml-[0.25em] md:ml-[0.3em]"
                >
                  Inclusive Innovation
                </p>
              </div>
            </div>
          </div>
        </div>

        <p
          ref={dateRef}
          className="font-bold uppercase text-[#08414a] opacity-0
            tracking-[0.15em] sm:tracking-[0.2em]
            text-xs sm:text-sm md:text-xl xl:text-2xl"
        >
          3rd September and 4th September
        </p>

        <div
          ref={countdownRef}
          className="w-full flex justify-center opacity-0
            mt-4 sm:mt-5 md:mt-6
            px-2 sm:px-4"
        >
          <Countdown targetDate="2026-09-03T00:00:00" />
        </div>
      </div>

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
              💻
            </motion.span>
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Header;
