'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion, useMotionValue, useTransform, useInView, animate } from 'motion/react';
import MarqueeCTA from '../components/MarqueeCTA';
import ContourBackdrop from '../components/ContourBackdrop';
import Countdown from '../components/Countdown';
import UnderMaintenance from '../components/UnderMaintenance';
import { playSound } from '../components/SoundManager';
import { useStackPush } from '../hooks/useBottomStack';
import { markEggFound, ABOUT_EGG_KEY } from '../hooks/useEggsFound';
import { ABOUT_MAINTENANCE } from '../maintenance';

gsap.registerPlugin(ScrollTrigger);

const EGG_SEEN_KEY = ABOUT_EGG_KEY;
const EGG_VISIBLE_MS = 2200;
const EGG_MESSAGES = ["You found it. There's more hiding around here.", 'Still here, huh?', 'Okay, okay. Keep looking.'];

const HINT_MAX_POKES = 3;
const HINT_VISIBLE_MS = 3200;
const HINT_MESSAGES = ["That text isn't just decoration.", 'Go on, click it.', 'Still there. Still clickable.'];

const STATS = [
  { value: 25000, suffix: '+', label: 'Participants' },
  { value: 150,   suffix: '+', label: 'Events' },
  { value: 20,    suffix: '+', label: 'Countries' },
  { value: 2,     suffix: '',  label: 'Power-packed Days' },
];

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [inView, value, count]);

  return (
    <div ref={ref} className="flex flex-col gap-2 items-start">
      <span className="font-clash font-bold text-[#c2e0a5] leading-none tabular-nums
        max-[390px]:text-4xl text-5xl sm:text-6xl md:text-6xl lg:text-7xl">
        <motion.span>{rounded}</motion.span>{suffix}
      </span>
      <span className="font-bold uppercase tracking-[0.25em] text-[#84C87F]/60 max-[390px]:text-[9px] text-[10px] sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function AboutPageContent() {
  const themeHeadRef    = useRef<HTMLDivElement>(null);
  const themeBodyRef    = useRef<HTMLDivElement>(null);
  const statsRef        = useRef<HTMLDivElement>(null);
  const closingRef      = useRef<HTMLDivElement>(null);

  const [egg, setEgg] = useState<string | null>(null);
  const eggRef = useStackPush<HTMLDivElement>('play-pill', egg !== null);

  const [hint, setHint] = useState<string | null>(null);
  const hintRef = useStackPush<HTMLDivElement>('play-pill', hint !== null);

  const triggerEgg = useCallback(() => {
    let firstTime = false;
    try {
      firstTime = !localStorage.getItem(EGG_SEEN_KEY);
    } catch {}
    markEggFound(ABOUT_EGG_KEY);
    setHint(null);
    playSound('toggle');
    setEgg(firstTime ? EGG_MESSAGES[0] : EGG_MESSAGES[1 + Math.floor(Math.random() * (EGG_MESSAGES.length - 1))]);
    setTimeout(() => setEgg(null), EGG_VISIBLE_MS);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem(EGG_SEEN_KEY);
    } catch {}
    if (seen) return;

    let pokes = 0;
    let timer: number;

    const poke = () => {
      try {
        if (localStorage.getItem(EGG_SEEN_KEY)) return;
      } catch {}
      if (pokes >= HINT_MAX_POKES) return;
      setHint(HINT_MESSAGES[pokes]);
      pokes++;
      timer = window.setTimeout(() => {
        setHint(null);
        timer = window.setTimeout(poke, 9000 + Math.random() * 6000);
      }, HINT_VISIBLE_MS);
    };

    timer = window.setTimeout(poke, 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (themeHeadRef.current) {
        gsap.fromTo(themeHeadRef.current,
          { y: 50, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out',
            scrollTrigger: { trigger: themeHeadRef.current, start: 'top 85%' } });
      }

      if (themeBodyRef.current) {
        const paras = themeBodyRef.current.querySelectorAll('.para');
        gsap.fromTo(paras,
          { y: 36, opacity: 0, filter: 'blur(6px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: themeBodyRef.current, start: 'top 82%' } });
      }

      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: statsRef.current, start: 'top 88%' } });
      }

      if (closingRef.current) {
        gsap.fromTo(closingRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: closingRef.current, start: 'top 88%' } });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <ContourBackdrop />
      <div className="relative">
      <section
        className="relative px-5 sm:px-10 md:px-16 lg:px-24 pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-20 md:pb-28"
      >
        <div className="max-w-5xl mx-auto w-full">
          <div ref={themeHeadRef} className="mb-10 md:mb-14">
            <span
              onClick={triggerEgg}
              data-cursor="26"
              className="font-bold uppercase tracking-[0.3em] text-[#84C87F] text-[10px] sm:text-xs block mb-4 cursor-pointer"
            >
              TechnoVIT&apos;26 Theme
            </span>

            <div>
              <p className="font-clash font-bold text-[#c2e0a5] leading-none uppercase
                text-[9vw] sm:text-[7vw] md:text-[6vw] lg:text-[5.5vw] tracking-tight">
                Inclusive
              </p>
              <p className="font-clash font-bold leading-none uppercase
                text-[9vw] sm:text-[7vw] md:text-[6vw] lg:text-[5.5vw] tracking-tight
                text-[#84C87F]">
                Innovation
              </p>
            </div>
          </div>


          <div ref={themeBodyRef} className="flex flex-col gap-0 max-w-3xl">
            {[
              "Good tech doesn't come from one type of person. It comes from someone who's spent years on robotics, and from someone walking into their first hackathon. From the coder who lives in the terminal, and the designer who's never written a line of code. Inclusive Innovation is about making room for all of it, on the same stage.",
              "It's a shift away from gatekept, insider-only tech culture — where you need the right background or the right resume to belong — and toward something more open: talent and curiosity as the only real entry requirements.",
              "At VIT, this runs through everything TechnoVIT puts on: the hackathons, the robotics battles, the workshops, the paper presentations, the late-night builds before a deadline. Every school, every team, every kind of participant, one fest.",
              "TechnoVIT'26 — two days, every discipline, every skill level welcome. Come be part of it.",
            ].map((text, i) => (
              <div key={i}
                className="para border-t border-[#84C87F]/15 last:border-b py-6 sm:py-7">
                <p className="text-[#c2e0a5]/70 text-base sm:text-lg leading-relaxed font-[450]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20 md:py-28">
        <div ref={statsRef} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 xl:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className={`flex flex-col gap-2 py-10 xl:py-0
                ${i % 2 === 0 ? 'border-r border-[#84C87F]/10' : ''}
                ${i < 2 ? 'border-b border-[#84C87F]/10 xl:border-b-0' : ''}
                ${i !== 3 ? 'xl:border-r xl:border-[#84C87F]/10' : 'xl:border-r-0'}
                px-4 sm:px-8 xl:px-12 ${i === 0 ? 'xl:pl-0' : ''}
              `}>
                <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative overflow-hidden
        px-5 sm:px-10 md:px-16 lg:px-24 py-20 sm:py-24 md:py-32">


        <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none" aria-hidden>
          <span className="font-clash font-bold text-[35vw] leading-none text-white opacity-[0.035] pr-4 translate-x-8">
            26
          </span>
        </div>

        <div ref={closingRef} className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-8 sm:gap-10">
          <Countdown targetDate="2026-09-03T09:30:00" className="text-[#c2e0a5]" />

          <p className="text-white/55 text-xs sm:text-sm uppercase tracking-[0.3em] font-bold">
            Until TechnoVIT&apos;26 · VIT Chennai
          </p>

          <div className="w-16 sm:w-20 h-px bg-[#84C87F]/25" />

          <MarqueeCTA href="/events" label="Explore Events" dataCursor="Explore" />
        </div>
      </section>
      </div>

      <AnimatePresence>
        {egg && (
          <motion.div
            ref={eggRef}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#064928] text-[#84C87F]
              font-clash font-bold text-sm px-5 py-3 rounded-full shadow-2xl border border-[#84C87F]/30
              flex items-center gap-2 whitespace-nowrap"
          >
            {egg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hint && (
          <motion.div
            ref={hintRef}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#064928] text-[#84C87F]/80
              font-clash font-bold text-sm px-5 py-3 rounded-full shadow-2xl border border-[#84C87F]/20
              flex items-center gap-2 whitespace-nowrap"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

export default function AboutPage() {
  if (ABOUT_MAINTENANCE) return <UnderMaintenance title="About" />;
  return <AboutPageContent />;
}
