'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowLeft, ArrowRight, Aperture } from '@phosphor-icons/react';
import Marquee from '../components/Marquee';
import ContourBackdrop from '../components/ContourBackdrop';
import PhotoRow from '../components/PhotoRow';
import { useLenis } from '../components/SmoothScrolling';
import { playSound } from '../components/SoundManager';
import { markEggFound, GALLERY_EGG_KEY } from '../hooks/useEggsFound';
import { thumbUrl } from '../lib/thumbnail';
import { type GalleryImage } from './data';

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_ITEMS = ["TechnoVIT'26"];

type Span = 'sq' | 'tall' | 'wide';
const SPAN_CYCLE: Span[] = ['tall', 'wide', 'sq'];

interface CoreItem {
  id: number;
  url: string;
  label: string;
  tag: string;
  span: Span;
}

function filenameOf(url: string): string {
  return url.split('/').pop() || 'photo';
}

function deriveTag(url: string): string {
  const name = filenameOf(url).replace(/\.[^.]+$/, '');
  const alpha = name.match(/[A-Za-z]+/)?.[0] ?? 'IMG';
  return alpha.slice(0, 5).toUpperCase();
}

function buildCoreItems(images: GalleryImage[]): CoreItem[] {
  return images.map((img, i) => ({
    id: i,
    url: img.url,
    label: "TechnoVIT'26",
    tag: deriveTag(img.url),
    span: SPAN_CYCLE[i % SPAN_CYCLE.length],
  }));
}

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
        bg-[#03080a] text-left isolate [content-visibility:auto] ${SPAN_CLS[item.span]}`}
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
          src={thumbUrl(item.url, 460)}
          alt={item.label}
          loading="lazy"
          decoding="async"
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

const AMBIENT_ROW_COUNT = 4;
const MIN_TILES_PER_ROW = 10;
// Tiles are served through /api/thumb (resized + cached), but each still-new
// source photo needs a first-hit resize before it's cached. Capping row width
// bounds how many DOM nodes and cold thumb requests the wall can grow to as
// more event photos land in the live feed, regardless of pool size.
const MAX_TILES_PER_ROW = 10;
const ROW_SPEEDS = [70, 88, 62, 95];

function ambientTileUrl(url: string) {
  return thumbUrl(url, 340);
}

function buildAmbientRows(images: GalleryImage[]): { seed: string }[][] {
  if (images.length === 0) return [];
  const tilesPerRow = Math.min(
    MAX_TILES_PER_ROW,
    Math.max(MIN_TILES_PER_ROW, Math.ceil(images.length / AMBIENT_ROW_COUNT))
  );
  return Array.from({ length: AMBIENT_ROW_COUNT }, (_, row) =>
    Array.from({ length: tilesPerRow }, (_, i) => {
      const img = images[(row + i * AMBIENT_ROW_COUNT) % images.length];
      return { seed: img.url };
    })
  );
}

function AmbientWall({ images }: { images: GalleryImage[] }) {
  const rows = useMemo(() => buildAmbientRows(images), [images]);
  const hostRef = useRef<HTMLDivElement>(null);
  const near = useInView(hostRef, { once: true, margin: '800px 0px' });
  const onScreen = useInView(hostRef, { margin: '150px 0px' });

  if (rows.length === 0) return null;

  return (
    <div ref={hostRef}>
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="h-px flex-1 bg-[#84C87F]/15" />
        <span className="font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
          The rest of the roll — {images.length} frames
        </span>
        <div className="h-px flex-1 bg-[#84C87F]/15" />
      </div>

      <div
        className="flex flex-col gap-[3px] transition-opacity duration-500"
        style={{ minHeight: near ? undefined : 360, opacity: near ? 1 : 0 }}
      >
        {near &&
          rows.map((row, i) => (
            <PhotoRow
              key={i}
              items={row}
              reverse={i % 2 === 1}
              speed={ROW_SPEEDS[i]}
              imgUrl={ambientTileUrl}
              paused={!onScreen}
            />
          ))}
      </div>
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
        className="relative rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a] max-w-[92vw] max-h-[88dvh]"
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
            src={thumbUrl(item.url, 920)}
            alt={item.label}
            className="block w-auto h-auto max-w-[92vw] max-h-[calc(88dvh-70px)] object-contain"
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

export default function GalleryContent({
  images,
  ambientImages,
}: {
  images: GalleryImage[];
  ambientImages: GalleryImage[];
}) {
  const coreItems = useMemo(() => buildCoreItems(images), [images]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const bigTitleRef = useRef<HTMLHeadingElement>(null);
  const viewedRef = useRef<Set<number>>(new Set());

  const openItem = (item: CoreItem) => {
    playSound('shutter');
    setOpenIndex(coreItems.findIndex((i) => i.id === item.id));

    viewedRef.current.add(item.id);
    if (viewedRef.current.size >= coreItems.length) {
      markEggFound(GALLERY_EGG_KEY);
    }
  };
  const close = () => {
    playSound('toggle');
    setOpenIndex(null);
  };
  const prev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + coreItems.length) % coreItems.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % coreItems.length));

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
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 88%' } });
      }

      if (wallRef.current) {
        gsap.fromTo(wallRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: wallRef.current, start: 'top 92%' } });
      }

    });
    return () => ctx.revert();
  }, []);

  const active = openIndex !== null ? coreItems[openIndex] : null;

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <ContourBackdrop />
      <div className="relative">

      <section
        className="sticky top-0 z-0 min-h-[100dvh] flex items-center justify-center select-none
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
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center gap-6 sm:gap-8
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

      {coreItems.length > 0 && (
        <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="h-px flex-1 bg-[#84C87F]/15" />
            <span className="font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
              Core Memories — {coreItems.length} selects
            </span>
            <div className="h-px flex-1 bg-[#84C87F]/15" />
          </div>

          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4
              grid-flow-dense auto-rows-[70px] sm:auto-rows-[80px]"
          >
            {coreItems.map((item) => (
              <CoreCard key={item.id} item={item} onOpen={openItem} />
            ))}
          </div>
        </section>
      )}

      <section ref={wallRef} className="px-5 sm:px-10 md:px-16 lg:px-24 pb-20 sm:pb-28">
        <AmbientWall images={ambientImages} />
      </section>
      </div>

      <AnimatePresence>
        {active && (
          <Lightbox item={active} onClose={close} onPrev={goPrev} onNext={goNext} />
        )}
      </AnimatePresence>
    </main>
  );
}
