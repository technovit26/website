'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Countdown from './Countdown';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!%&';
const FINAL_TEXT = "technoVIT'26";

const Header = () => {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLParagraphElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h1 = h1Ref.current;
    const theme = themeRef.current;
    const date = dateRef.current;
    const countdown = countdownRef.current;
    if (!h1 || !theme || !date || !countdown) return;

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
          [theme, date, countdown],
          { y: 24, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0, opacity: 1, filter: 'blur(0px)',
            duration: 0.6, stagger: 0.2, ease: 'power3.out',
            delay: 0.1,
          }
        );
      }
    }, 35);


    gsap.fromTo(
      h1,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );


    gsap.set([theme, date, countdown], { opacity: 0 });

    return () => clearInterval(scrambleInterval);
  }, []);

  return (
    <section className="relative min-h-[60svh] md:min-h-screen flex flex-col overflow-hidden bg-[#c2e0a5] pt-16 md:pt-20 lg:pt-24">
      <div className="flex-1 flex flex-col items-center justify-center
        px-4 sm:px-6
        pt-6 sm:pt-10 md:pt-20 lg:pt-20">

        <h1
          ref={h1Ref}
          className="font-clash font-bold leading-none text-center text-[#08414a] whitespace-nowrap
            text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
        >
          {FINAL_TEXT}
        </h1>

        <div
          ref={themeRef}
          className="bg-[#08414a] px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 mt-1 sm:mt-2 md:mt-2 lg:mt-3 shadow-xl"
        >
          <p
            className="font-clash font-bold uppercase text-[#c2e0a5] tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em]
              text-sm sm:text-base md:text-xl lg:text-2xl leading-none translate-y-[1px] ml-[0.2em] sm:ml-[0.25em] md:ml-[0.3em]"
          >
            Inclusive Innovation
          </p>
        </div>

        <p
          ref={dateRef}
          className="font-bold uppercase text-[#08414a] opacity-80
            tracking-[0.15em] sm:tracking-[0.2em]
            mt-7 sm:mt-9 md:mt-12 lg:mt-16
            text-xs sm:text-sm md:text-xl xl:text-2xl"
        >
          3rd September - 4th September
        </p>

        <div
          ref={countdownRef}
          className="w-full flex justify-center
            mt-4 sm:mt-5 md:mt-6
            px-2 sm:px-4"
        >
          <Countdown targetDate="2026-09-03T00:00:00" />
        </div>
      </div>

      <div className="w-full pointer-events-none select-none shrink-0 -mt-10 sm:-mt-16 md:-mt-22 lg:-mt-28">
        <img src="/bg.svg" alt="Background landscape" fetchPriority="high" className="w-full h-auto block" />
      </div>
    </section>
  );
};

export default Header;
