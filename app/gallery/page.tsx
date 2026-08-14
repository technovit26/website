'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowLeft, ArrowRight, Aperture } from '@phosphor-icons/react';
import Marquee from '../components/Marquee';
import { useLenis } from '../components/SmoothScrolling';
import { playSound } from '../components/SoundManager';
import { markEggFound, GALLERY_EGG_KEY } from '../hooks/useEggsFound';

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_ITEMS = ["TechnoVIT'26"];

type Span = 'sq' | 'tall' | 'wide';

interface CoreItem {
  id: number;
  seed: string;
  w: number;
  h: number;
  label: string;
  tag: string;
  span: Span;
}

const CORE_ITEMS: CoreItem[] = [
  { id: 1,  seed: 'technovit-01', w: 700, h: 900, label: 'Hackathon — Finals Night', tag: 'HACK',  span: 'tall' },
  { id: 2,  seed: 'technovit-02', w: 900, h: 650, label: 'RoboWars — Arena',          tag: 'ROBO',  span: 'wide' },
  { id: 3,  seed: 'technovit-03', w: 750, h: 750, label: 'Workshop — AI & ML',        tag: 'WKSP',  span: 'sq' },
  { id: 4,  seed: 'technovit-04', w: 700, h: 900, label: 'Coding Marathon',           tag: 'CODE',  span: 'tall' },
  { id: 5,  seed: 'technovit-05', w: 750, h: 750, label: 'Paper Presentation',        tag: 'PAPER', span: 'sq' },
  { id: 6,  seed: 'technovit-06', w: 900, h: 650, label: 'Design Sprint',             tag: 'DSGN',  span: 'wide' },
  { id: 7,  seed: 'technovit-07', w: 700, h: 900, label: 'Guest Lecture',             tag: 'TALK',  span: 'tall' },
  { id: 8,  seed: 'technovit-08', w: 750, h: 750, label: 'Late-Night Build',          tag: 'BUILD', span: 'sq' },
  { id: 9,  seed: 'technovit-09', w: 900, h: 650, label: 'CTF — Live Round',          tag: 'CTF',   span: 'wide' },
  { id: 10, seed: 'technovit-10', w: 700, h: 900, label: 'Team Photo',                tag: 'CREW',  span: 'tall' },
  { id: 11, seed: 'technovit-11', w: 750, h: 750, label: 'Closing Ceremony',          tag: 'CLOSE', span: 'sq' },
];

const AMBIENT_COUNT = 46;
const AMBIENT_ITEMS = Array.from({ length: AMBIENT_COUNT }, (_, i) => ({
  id: i,
  seed: `technovit-amb-${i}`,
}));

const coreUrl = (item: CoreItem) => `https://picsum.photos/seed/${item.seed}/${item.w}/${item.h}`;
const ambientUrl = (seed: string) => `https://picsum.photos/seed/${seed}/460/460`;

const SPAN_CLS: Record<Span, string> = {
  sq: 'row-span-4',
  tall: 'row-span-5',
  wide: 'row-span-3',
};

function CoreCard({ item, onOpen }: { item: CoreItem; onOpen: (item: CoreItem) => void }) {
  return (
    <button
      onClick={() => onOpen(item)}
      data-cursor="View"
      className={`gallery-item group relative w-full overflow-hidden rounded-lg border border-[#84C87F]/20
        bg-[#03080a] text-left ${SPAN_CLS[item.span]}`}
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-[#080f09] border-b border-[#84C87F]/10 relative z-10 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-[8px] h-[8px] rounded-full bg-[#FF5F56]/70" />
          <span className="w-[8px] h-[8px] rounded-full bg-[#FFBD2E]/70" />
          <span className="w-[8px] h-[8px] rounded-full bg-[#27C93F]/70" />
        </div>
        <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/50">
          {item.tag}_{String(item.id).padStart(3, '0')}.jpg
        </span>
      </div>

      <div className="relative h-[calc(100%-30px)] overflow-hidden">
        <img
          src={coreUrl(item)}
          alt={item.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover
            grayscale contrast-110 brightness-[0.8]
            group-hover:grayscale-0 group-hover:brightness-100
            transition-[filter] duration-700 ease-out"
        />

        <div
          aria-hidden
          className="terminal-scanlines opacity-40 group-hover:opacity-0 transition-opacity duration-700"
        />

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
            opacity-100 group-hover:opacity-40 transition-opacity duration-500"
        />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-clash font-bold text-white text-sm leading-tight
            translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
            {item.label}
          </p>
        </div>
      </div>
    </button>
  );
}

const AMBIENT_ROW_COUNT = 6;
const AMBIENT_ROWS: { seed: string }[][] = Array.from({ length: AMBIENT_ROW_COUNT }, () => []);
AMBIENT_ITEMS.forEach((item, i) => AMBIENT_ROWS[i % AMBIENT_ROW_COUNT].push(item));
const ROW_SPEEDS = [70, 85, 62, 95, 74, 88];

function AmbientRow({ items, reverse, speed }: { items: { seed: string }[]; reverse: boolean; speed: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden" aria-hidden>
      <div
        className="flex items-center gap-1.5 whitespace-nowrap will-change-transform"
        style={{ animation: `ambient-${reverse ? 'rev' : 'fwd'} ${speed}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="relative shrink-0 w-[170px] h-[120px] sm:w-[230px] sm:h-[165px] overflow-hidden rounded-md bg-[#03080a]">
            <img
              src={ambientUrl(item.seed)}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 contrast-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AmbientWall() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="h-px flex-1 bg-[#84C87F]/15" />
        <span className="font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
          The rest of the roll — {AMBIENT_COUNT} frames
        </span>
        <div className="h-px flex-1 bg-[#84C87F]/15" />
      </div>

      <div className="flex flex-col gap-[3px]">
        {AMBIENT_ROWS.map((row, i) => (
          <AmbientRow key={i} items={row} reverse={i % 2 === 1} speed={ROW_SPEEDS[i]} />
        ))}
      </div>

      <style>{`
        @keyframes ambient-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ambient-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: CoreItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const lenis = useLenis();
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setFlash(false), 180);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const body = document.body;
    const oh = html.style.overflow;
    const ob = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      window.removeEventListener('keydown', onKey);
      html.style.overflow = oh;
      body.style.overflow = ob;
    };
  }, [lenis, onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
      data-no-context-menu
    >
      <motion.div
        key={item.id}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a] max-w-[92vw] max-h-[88vh]"
        style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.15), 0 40px 100px rgba(0,0,0,0.85)' }}
      >
        <div className="relative flex items-center px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 select-none">
          <button
            onClick={onClose}
            aria-label="Close"
            data-cursor="Close"
            className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors shrink-0"
          />
          <span className="absolute left-1/2 -translate-x-1/2 font-clash font-bold text-white text-sm sm:text-base tracking-wide">
            {item.label}
          </span>
        </div>

        <div className="relative inline-block align-bottom leading-none bg-black">
          <img
            src={coreUrl(item)}
            alt={item.label}
            width={item.w}
            height={item.h}
            className="block w-auto h-auto max-w-[92vw] max-h-[calc(88vh-70px)] object-contain"
          />

          {flash && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          )}

          <button
            onClick={onPrev}
            aria-label="Previous photo"
            data-cursor="Prev"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-[#84C87F]/30
              bg-[#064928]/80 backdrop-blur text-[#84C87F] flex items-center justify-center
              hover:bg-[#84C87F] hover:text-[#064928] transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
          </button>
          <button
            onClick={onNext}
            aria-label="Next photo"
            data-cursor="Next"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-[#84C87F]/30
              bg-[#064928]/80 backdrop-blur text-[#84C87F] flex items-center justify-center
              hover:bg-[#84C87F] hover:text-[#064928] transition-colors"
          >
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>

        <div className="flex items-center justify-center px-4 py-2.5 bg-[#080f09] border-t border-[#84C87F]/10 select-none">
          <span className="font-terminal text-[9px] uppercase tracking-[0.25em] text-[#84C87F]/40">
            {item.tag}_{String(item.id).padStart(3, '0')}.jpg · decoded
          </span>
        </div>
      </motion.div>

      <button
        onClick={onClose}
        aria-label="Close"
        data-cursor="Close"
        className="absolute top-5 right-5 sm:top-8 sm:right-8 w-10 h-10 rounded-full border border-[#84C87F]/30
          bg-[#064928] text-[#84C87F] flex items-center justify-center hover:bg-[#84C87F] hover:text-[#064928] transition-colors"
      >
        <X size={16} weight="bold" />
      </button>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const bigTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const coverSectionRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef<Set<number>>(new Set());

  const openItem = (item: CoreItem) => {
    playSound('shutter');
    setOpenIndex(CORE_ITEMS.findIndex((i) => i.id === item.id));

    viewedRef.current.add(item.id);
    if (viewedRef.current.size >= CORE_ITEMS.length) {
      markEggFound(GALLERY_EGG_KEY);
    }
  };
  const close = () => {
    playSound('toggle');
    setOpenIndex(null);
  };
  const prev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + CORE_ITEMS.length) % CORE_ITEMS.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % CORE_ITEMS.length));

  const goPrev = () => {
    playSound('shutter');
    prev();
  };
  const goNext = () => {
    playSound('shutter');
    next();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bigTitleRef.current,
        { y: 60, opacity: 0, filter: 'blur(12px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' });

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.gallery-item');
        gsap.fromTo(cards,
          { y: 40, opacity: 0, filter: 'blur(6px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 88%' } });
      }

      if (wallRef.current) {
        gsap.fromTo(wallRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: wallRef.current, start: 'top 92%' } });
      }

      if (heroSectionRef.current && coverSectionRef.current) {
        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const active = openIndex !== null ? CORE_ITEMS[openIndex] : null;

  return (
    <main className="relative min-h-screen bg-[#064928] overflow-x-hidden">

      <section
        ref={heroSectionRef}
        className="relative z-0 min-h-screen flex items-center justify-center select-none
          bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24 overflow-hidden"
      >
        <h1
          ref={bigTitleRef}
          className="font-clash font-bold text-[#04331c] opacity-[0.22] leading-none
            text-[19vw] tracking-tight uppercase"
        >
          GALLERY
        </h1>
      </section>

      <section
        ref={coverSectionRef}
        className="relative z-10 min-h-screen flex flex-col justify-center gap-6 sm:gap-8
          bg-[#84C87F] text-[#04331c] py-16 overflow-hidden"
      >
        <Marquee items={CURTAIN_ITEMS} size="lg" />
        <Marquee reverse size="lg" />
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          <Aperture size={22} weight="bold" className="text-[#84C87F]/70" />
          <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
            Moments from TechnoVIT&apos;25.
          </p>
          <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
            Decoded, one frame at a time. Every photo here is muted until you look closer —
            <span className="text-[#84C87F] font-semibold"> hover to bring back the color, click to look closer.</span>
          </p>
        </div>
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="h-px flex-1 bg-[#84C87F]/15" />
          <span className="font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
            Core Memories — {CORE_ITEMS.length} selects
          </span>
          <div className="h-px flex-1 bg-[#84C87F]/15" />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4
            grid-flow-dense auto-rows-[70px] sm:auto-rows-[80px]"
        >
          {CORE_ITEMS.map((item) => (
            <CoreCard key={item.id} item={item} onOpen={openItem} />
          ))}
        </div>
      </section>

      <section ref={wallRef} className="px-5 sm:px-10 md:px-16 lg:px-24 pb-20 sm:pb-28">
        <AmbientWall />
      </section>

      <AnimatePresence>
        {active && (
          <Lightbox item={active} onClose={close} onPrev={goPrev} onNext={goNext} />
        )}
      </AnimatePresence>
    </main>
  );
}
