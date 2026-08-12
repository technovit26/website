'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useTransform, useInView, animate, type MotionValue } from 'motion/react';

gsap.registerPlugin(ScrollTrigger);


const STATS = [
  { value: 5000, suffix: '+', label: 'Registrations' },
  { value: 50,   suffix: '+', label: 'Events' },
  { value: 2,    suffix: '',  label: 'Power-packed Days' },
  { value: 1,    suffix: '',  label: 'Unifying Theme' },
];

const DIGIT_STACK = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

function DigitColumn({ place, count }: { place: number; count: MotionValue<number> }) {
  const y = useTransform(count, (latest) => {
    const raw = (latest / place) % 10;
    return `-${raw}em`;
  });

  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top">
      <span className="invisible">0</span>
      <motion.span className="absolute inset-0 flex flex-col" style={{ y }}>
        {DIGIT_STACK.map((d, i) => (
          <span key={i} className="h-[1em] leading-none flex items-center justify-center">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const count = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.2, ease: [0.12, 0.8, 0.2, 1] });
    return controls.stop;
  }, [inView, value, count]);

  const digits = String(value).length;
  const places = Array.from({ length: digits }, (_, i) => 10 ** (digits - 1 - i));

  return (
    <div ref={ref} className="flex flex-col gap-2 items-start">
      <span className="font-clash font-bold text-white leading-none tabular-nums
        max-[390px]:text-4xl text-5xl sm:text-6xl md:text-6xl lg:text-7xl
        inline-flex items-baseline">
        {places.map((place, i) => (
          <DigitColumn key={i} place={place} count={count} />
        ))}
        {suffix}
      </span>
      <span className="font-bold uppercase tracking-[0.25em] text-[#84C87F]/60 max-[390px]:text-[9px] text-[10px] sm:text-xs">
        {label}
      </span>
    </div>
  );
}

const MARQUEE_BASE_ITEMS = ['Inclusive Innovation', 'High on Tech'];

function MarqueeItem({ text }: { text: string }) {
  return (
    <span className="flex items-center shrink-0">
      <span className="font-clash font-bold uppercase tracking-[0.12em] text-base sm:text-lg md:text-xl px-8 sm:px-10">
        {text}
      </span>
      <span className="text-[#84C87F] font-bold text-lg select-none">·</span>
    </span>
  );
}


function Marquee({ reverse = false }: { reverse?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(6);

  useEffect(() => {
    const container = containerRef.current;
    const unit = measureRef.current;
    if (!container || !unit) return;

    const recalc = () => {
      const unitWidth = unit.scrollWidth;
      if (!unitWidth) return;
      const needed = Math.ceil(container.offsetWidth / unitWidth) + 1;
      setRepeat((prev) => (prev === needed ? prev : needed));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const half = Array.from({ length: repeat }, () => MARQUEE_BASE_ITEMS).flat();
  const items = [...half, ...half];

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full" aria-hidden>

      <div
        ref={measureRef}
        className="absolute -z-10 opacity-0 pointer-events-none flex items-center whitespace-nowrap"
      >
        {MARQUEE_BASE_ITEMS.map((item, i) => (
          <MarqueeItem key={i} text={item} />
        ))}
      </div>

      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee-${reverse ? 'rev' : 'fwd'} ${reverse ? 22 : 20}s linear infinite`,
        }}
      >
        {items.map((item, i) => (
          <MarqueeItem key={i} text={item} />
        ))}
      </div>


      <style>{`
        @keyframes marquee-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}


export default function AboutPage() {
  const bigTitleRef  = useRef<HTMLHeadingElement>(null);
  const metaRowRef   = useRef<HTMLDivElement>(null);
  const ticker1Ref   = useRef<HTMLDivElement>(null);
  const themeHeadRef = useRef<HTMLDivElement>(null);
  const themeBodyRef = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);
  const whatRef      = useRef<HTMLDivElement>(null);
  const closingRef   = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const ctx = gsap.context(() => {

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(bigTitleRef.current,
          { y: 60, opacity: 0, filter: 'blur(12px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0 })
        .fromTo(metaRowRef.current,
          { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.65 },
          '-=0.4')
        .fromTo(ticker1Ref.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.45 },
          '-=0.15');





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


      if (whatRef.current) {
        const items = whatRef.current.querySelectorAll('.what-para');
        gsap.fromTo(items,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: whatRef.current, start: 'top 82%' } });
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
    <main className="relative min-h-screen bg-white overflow-x-hidden">


      <section className="relative bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24
        pt-20 sm:pt-20 md:pt-24 lg:pt-24 pb-0 overflow-hidden">

        <div className="flex-1 flex items-center justify-center pointer-events-none select-none">
          <h1
            ref={bigTitleRef}
            className="font-clash font-bold text-[#04331c] opacity-[0.22] leading-none
              text-[28vw] tracking-tight uppercase -mt-[2vw] -mb-[3vw]"
          >
            ABOUT
          </h1>
        </div>

        <div ref={metaRowRef} className="mt-2 sm:mt-4 h-px bg-[#064928]/25 w-full" />

        <div
          ref={ticker1Ref}
          className="mt-0 -mx-5 sm:-mx-10 md:-mx-16 lg:-mx-24
            bg-[#064928] text-[#84C87F] py-3.5 sm:py-4 overflow-hidden"
        >
          <Marquee />
        </div>
      </section>


      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto">


          <div ref={themeHeadRef} className="mb-10 md:mb-14">
            <span className="font-bold uppercase tracking-[0.3em] text-[#019153] text-[10px] sm:text-xs block mb-4">
              TechnoVIT&apos;26 Theme
            </span>

            <div>
              <p className="font-clash font-bold text-[#08414a] leading-none uppercase
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
                className="para border-t border-[#064928]/10 last:border-b py-6 sm:py-7">
                <p className="text-[#08414a]/70 text-base sm:text-lg leading-relaxed font-[450]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="bg-[#064928] px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20 md:py-28">
        <div ref={statsRef} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 xl:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className={`flex flex-col gap-2 py-10 xl:py-0
                ${i % 2 === 0 ? 'border-r border-white/10' : ''} 
                ${i < 2 ? 'border-b border-white/10 xl:border-b-0' : ''}
                ${i !== 3 ? 'xl:border-r xl:border-white/10' : 'xl:border-r-0'}
                px-4 sm:px-8 xl:px-12 ${i === 0 ? 'xl:pl-0' : ''}
              `}>
                <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">


          <div className="md:sticky md:top-32">
            <h2 className="font-clash font-bold text-[#08414a] text-3xl sm:text-4xl md:text-5xl leading-tight">
              What is<br />TechnoVIT?
            </h2>
            <div className="mt-5 w-10 h-[3px] bg-[#84C87F] rounded-full" />
          </div>


          <div ref={whatRef} className="flex flex-col gap-5 sm:gap-6 md:gap-7">
            {[
              "TechnoVIT is the annual technical festival of VIT Chennai — a celebration where engineering, creativity, and innovation converge on campus every year. It's the stage where students from across India come to compete, collaborate, and push the boundaries of what's possible.",
              "TechnoVIT brings together thousands of participants across technical events, workshops, hackathons, guest lectures, and cultural showcases — all packed into two electrifying days.",
              "From paper presentations to robotics competitions, from coding marathons to design challenges — TechnoVIT is where ambition meets opportunity, and where the next generation of innovators makes their mark.",
            ].map((p, i) => (
              <p key={i} className="what-para text-[#08414a]/75 text-base sm:text-lg leading-relaxed font-[450]
                border-l-2 border-[#064928]/10 pl-5 hover:border-[#84C87F] transition-colors duration-300">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>


      <div className="bg-[#064928] text-[#84C87F] py-3.5 sm:py-4 overflow-hidden">
        <Marquee reverse />
      </div>


      <section className="relative overflow-hidden bg-[#064928]
        px-5 sm:px-10 md:px-16 lg:px-24 py-20 sm:py-24 md:py-32">


        <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none" aria-hidden>
          <span className="font-clash font-bold text-[35vw] leading-none text-white opacity-[0.035] pr-4 translate-x-8">
            26
          </span>
        </div>

        <div ref={closingRef} className="relative max-w-7xl mx-auto">
          <h2 className="font-clash font-bold text-white leading-[0.92] uppercase
            text-[11vw] sm:text-[9vw] md:text-[7vw] lg:text-6xl xl:text-7xl
            max-w-3xl tracking-tight">
            Make your<br />
            <span className="text-[#84C87F]">mark here.</span>
          </h2>

          <p className="mt-6 sm:mt-8 text-white/55 text-sm sm:text-base leading-relaxed max-w-md font-[450]">
            Two days. Thousands of minds. One relentless drive to build something that matters.
            TechnoVIT&apos;26 — VIT Chennai.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
            <a
              href="/events"
              id="about-explore-events"
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4
                bg-[#84C87F] text-[#08414a] font-bold uppercase tracking-widest text-xs
                hover:bg-white transition-colors duration-200"
            >
              Explore Events
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/team"
              id="about-meet-team"
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4
                border border-white/25 text-white font-bold uppercase tracking-widest text-xs
                hover:border-[#84C87F] hover:text-[#84C87F] transition-colors duration-200"
            >
              Meet the Team
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
