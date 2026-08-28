'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import Countdown from './Countdown';
import { playSound } from './SoundManager';
import { markEggFound, HOME_EGG_KEY } from '../hooks/useEggsFound';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!%&';
const FINAL_TEXT = "technoVIT'26";

const HERO_CLOUDS = [
  { top: 5, w: 13, dur: 230, delay: -20 },
  { top: 10, w: 18, dur: 200, delay: -160 },
  { top: 15, w: 15, dur: 215, delay: -110 },
  { top: 12, w: 21, dur: 188, delay: -55 },
  { top: 22, w: 16, dur: 208, delay: -140 },
  { top: 26, w: 23, dur: 176, delay: -45 },
  { top: 7, w: 16, dur: 222, delay: -95 },
  { top: 18, w: 19, dur: 195, delay: -30 },
  { top: 24, w: 14, dur: 212, delay: -175 },
];
const HERO_CLOUD_DEPTHS = [0.5, 0.6, 0.52, 0.68, 0.58, 0.74, 0.55, 0.66, 0.5];

function HeroClouds() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 select-none"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 38%, transparent 62%)',
        maskImage: 'linear-gradient(to bottom, #000 0%, #000 38%, transparent 62%)',
      }}
    >
      {HERO_CLOUDS.map((c, i) => (
        <div
          key={i}
          className="hero-cloud absolute left-0"
          style={{
            top: `${c.top}%`,
            width: `${c.w}%`,
            aspectRatio: '220 / 90',
            animation: `hero-cloud-drift ${c.dur}s linear ${c.delay}s infinite, hero-cloud-bob ${
              9 + (i % 5) * 2
            }s ease-in-out ${-i * 1.6}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 220 90"
            className="h-full w-full"
            style={{ opacity: Math.min(0.15, 0.1 * HERO_CLOUD_DEPTHS[i]), filter: 'blur(0.8px)' }}
            aria-hidden
          >
            <g fill="#08414a">
              <ellipse cx="70" cy="60" rx="70" ry="28" />
              <ellipse cx="120" cy="52" rx="55" ry="34" />
              <ellipse cx="160" cy="62" rx="52" ry="26" />
              <ellipse cx="100" cy="44" rx="34" ry="26" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}
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
      <HeroClouds />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center
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
          <Countdown targetDate="2026-09-03T09:30:00" />
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
