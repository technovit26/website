'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import { Wrench } from '@phosphor-icons/react';
import Marquee from './Marquee';
import { markEggFound, type EggKey } from '../hooks/useEggsFound';
import { playSound } from './SoundManager';

const FIX_CLICKS = 5;

export default function UnderMaintenance({ title, eggKey }: { title: string; eggKey?: EggKey }) {
  const heroRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const wrenchRef = useRef<HTMLButtonElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const clicksRef = useRef(0);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
      );
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.15 }
      );
      gsap.to(wrenchRef.current, {
        rotate: 360,
        duration: 3.4,
        repeat: -1,
        ease: 'linear',
        transformOrigin: '50% 50%',
      });
      gsap.fromTo(
        barFillRef.current,
        { xPercent: -100 },
        { xPercent: 100, duration: 1.6, repeat: -1, ease: 'power1.inOut' }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleWrenchClick = () => {
    if (!eggKey || fixed) return;
    playSound('keystroke');
    clicksRef.current += 1;
    if (clicksRef.current >= FIX_CLICKS) {
      markEggFound(eggKey);
      playSound('toggle');
      setFixed(true);
      setTimeout(() => setFixed(false), 2400);
    }
  };

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <section className="relative flex min-h-[38dvh] sm:min-h-[42dvh] flex-col items-center justify-center gap-4 sm:gap-6
        bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24 py-16 overflow-hidden text-center">
        <h1
          ref={heroRef}
          className="font-clash font-bold text-[#04331c] opacity-[0.22] leading-none
            text-[16vw] tracking-tight uppercase select-none"
        >
          {title}
        </h1>
        <div className="absolute inset-x-0 bottom-6 sm:bottom-8 text-[#08414a]">
          <Marquee items={[`${title} — Under Maintenance`]} size="sm" />
        </div>
      </section>

      <section className="flex flex-col items-center justify-center px-4 py-16 sm:py-20 md:py-24 text-center min-h-[50dvh]">
        <div
          ref={cardRef}
          className="relative w-full max-w-md rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a]"
          style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.12), 0 30px 70px rgba(0,0,0,0.5)' }}
        >
          <div aria-hidden className="terminal-scanlines opacity-20" />

          <div className="relative flex items-center px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F56]/70" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]/70" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#27C93F]/70" />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/50 truncate max-w-[60%]">
              {title.toLowerCase()}.sh · maintenance
            </span>
          </div>

          <div className="relative flex flex-col items-center gap-5 px-6 py-10 sm:py-12">
            <button
              ref={wrenchRef}
              type="button"
              onClick={handleWrenchClick}
              aria-label="Wrench"
              className="flex items-center justify-center w-14 h-14 rounded-full border border-[#84C87F]/30 text-[#84C87F]"
            >
              <Wrench size={26} weight="bold" />
            </button>

            <h2 className="font-clash font-bold text-2xl sm:text-3xl text-[#c2e0a5] uppercase tracking-tight">
              {fixed ? 'Wait, That Worked?' : 'Under Maintenance'}
            </h2>
            <p className="text-[#84C87F]/70 text-sm leading-relaxed max-w-xs">
              {fixed
                ? "Huh. Don't tell the maintainers — back to being broken in a moment."
                : `${title} is being recalibrated — we're still getting the frames in order. Check back soon.`}
            </p>

            <div className="w-full max-w-[220px] h-[3px] rounded-full bg-[#84C87F]/10 overflow-hidden">
              <div ref={barFillRef} className="h-full w-1/2 rounded-full bg-[#84C87F]" />
            </div>

            <span className="font-terminal text-[10px] text-[#84C87F]/40 uppercase tracking-[0.2em]">
              $ status --check<span className="terminal-cursor">_</span>
            </span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {fixed && (
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
              🔧
            </motion.span>
            You actually fixed it. Briefly.
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
