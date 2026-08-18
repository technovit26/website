'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowCounterClockwise,
  ArrowRight,
  Funnel,
  MagnifyingGlass,
  SmileySad,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import Marquee from '../components/Marquee';
import HScrollRow from '../components/HScrollRow';
import { playSound } from '../components/SoundManager';
import { markEggFound, SEARCH_EGG_KEY, SLIDER_EGG_KEY } from '../hooks/useEggsFound';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import EventCard from './EventCard';
import EventModal from './EventModal';
import PriceRangeSlider from './PriceRangeSlider';
import { type EventItem } from './data';

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_ITEMS = ["TechnoVIT'26"];

const DEFAULT_TYPE = 'All';
const DEFAULT_PARTICIPATION = 'All';
const DEFAULT_FOR = 'All';

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="Select"
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-terminal text-[11px] font-semibold
        uppercase tracking-wide transition-colors duration-200 ${
          active
            ? 'bg-[#84C87F] text-[#064928] border-[#84C87F]'
            : 'bg-transparent text-[#84C87F]/70 border-[#84C87F]/25 hover:border-[#84C87F]/50 hover:text-[#84C87F]'
        }`}
    >
      {children}
    </button>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-terminal text-[9px] uppercase tracking-[0.25em] text-[#84C87F]/40">{label}</span>
      <HScrollRow ariaLabel={label}>{children}</HScrollRow>
    </div>
  );
}

export default function EventsContent({ events }: { events: EventItem[] }) {
  const flagshipEvents = useMemo(() => events.filter((e) => e.isSpecialEvent), [events]);
  const regularEvents = useMemo(() => events.filter((e) => !e.isSpecialEvent), [events]);

  const eventTypes = useMemo(
    () => Array.from(new Set(regularEvents.map((e) => e.eventType))).sort(),
    [regularEvents]
  );
  const eventForOptions = useMemo(
    () => Array.from(new Set(regularEvents.map((e) => e.eventFor))).sort(),
    [regularEvents]
  );
  const participationTypes = useMemo(
    () => Array.from(new Set(regularEvents.map((e) => e.participationType))).sort(),
    [regularEvents]
  );
  const priceMin = useMemo(
    () => (regularEvents.length ? Math.min(...regularEvents.map((e) => e.pricePerPerson)) : 0),
    [regularEvents]
  );
  const priceMax = useMemo(
    () => (regularEvents.length ? Math.max(...regularEvents.map((e) => e.pricePerPerson)) : 0),
    [regularEvents]
  );

  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState<string>(DEFAULT_TYPE);
  const [participation, setParticipation] = useState<string>(DEFAULT_PARTICIPATION);
  const [eventFor, setEventFor] = useState<string>(DEFAULT_FOR);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [priceMin, priceMax]);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);

  const heroRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const flagshipRef = useRef<HTMLDivElement>(null);

  const filtersActive =
    debouncedSearch.trim() !== '' ||
    eventType !== DEFAULT_TYPE ||
    participation !== DEFAULT_PARTICIPATION ||
    eventFor !== DEFAULT_FOR ||
    priceRange[0] !== priceMin ||
    priceRange[1] !== priceMax;

  const resetFilters = () => {
    setSearch('');
    setEventType(DEFAULT_TYPE);
    setParticipation(DEFAULT_PARTICIPATION);
    setEventFor(DEFAULT_FOR);
    setPriceRange([priceMin, priceMax]);
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return regularEvents.filter((e) => {
      if (eventType !== 'All' && e.eventType !== eventType) return false;
      if (participation !== 'All' && e.participationType !== participation) return false;
      if (eventFor !== 'All' && e.eventFor !== eventFor) return false;
      if (e.pricePerPerson < priceRange[0] || e.pricePerPerson > priceRange[1]) return false;
      if (!q) return true;
      return (
        e.eventName.toLowerCase().includes(q) ||
        e.clubName.toLowerCase().includes(q) ||
        e.shortDescription.toLowerCase().includes(q) ||
        e.eventVenue.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q)
      );
    });
  }, [regularEvents, debouncedSearch, eventType, participation, eventFor, priceRange]);

  const openEvent = (event: EventItem) => {
    playSound('toggle');
    setActiveEvent(event);
  };
  const closeEvent = () => {
    playSound('toggle');
    setActiveEvent(null);
  };

  useEffect(() => {
    if (debouncedSearch.trim().toLowerCase() === '42') markEggFound(SEARCH_EGG_KEY);
  }, [debouncedSearch]);

  useEffect(() => {
    if (priceMin === priceMax) return;
    if (priceRange[0] === priceRange[1]) markEggFound(SLIDER_EGG_KEY);
  }, [priceRange, priceMin, priceMax]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 60, opacity: 0, filter: 'blur(12px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' }
      );

      if (introRef.current) {
        gsap.fromTo(
          introRef.current,
          { y: 30, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: introRef.current, start: 'top 88%' },
          }
        );
      }

      if (flagshipRef.current) {
        gsap.fromTo(
          flagshipRef.current,
          { y: 30, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: flagshipRef.current, start: 'top 88%' },
          }
        );
      }

      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { y: 36, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: panelRef.current, start: 'top 88%' },
          }
        );
      }

    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <section
        className="sticky top-0 z-0 min-h-[100dvh] flex items-center justify-center select-none
          bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24 overflow-hidden"
      >
        <h1
          ref={heroRef}
          className="font-clash font-bold text-[#04331c] opacity-[0.22] leading-none
            text-[19vw] tracking-tight uppercase"
        >
          EVENTS
        </h1>
      </section>

      <section
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center gap-6 sm:gap-8
          bg-[#84C87F] text-[#04331c] py-16 overflow-hidden"
      >
        <Marquee items={CURTAIN_ITEMS} size="lg" />
        <Marquee reverse size="lg" />
      </section>

      <section ref={introRef} className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          <Sparkle size={22} weight="bold" className="text-[#84C87F]/70" />
          <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
            150+ events. Pick your battlefield.
          </p>
          <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
            Hackathons, workshops, showdowns, and everything between —
            <span className="text-[#84C87F] font-semibold"> search below, or narrow it down by whatever matters to you.</span>
          </p>
        </div>
      </section>

      {flagshipEvents.length > 0 && (
        <section ref={flagshipRef} className="pb-16 sm:pb-20">
          <div className="px-5 sm:px-10 md:px-16 lg:px-24 flex items-center gap-3 mb-6 sm:mb-8">
            <Sparkle size={16} weight="fill" className="text-[#84C87F] shrink-0" />
            <span className="font-terminal font-bold uppercase tracking-[0.3em] text-[#84C87F]/70 text-[10px] sm:text-xs whitespace-nowrap">
              Flagship Events
            </span>
            <div className="h-px flex-1 bg-[#84C87F]/15" />
          </div>

          <div className="px-5 sm:px-10 md:px-16 lg:px-24">
            <HScrollRow ariaLabel="Flagship events" edgeFadeClassName="from-[#064928]">
              {flagshipEvents.map((event) => (
                <EventCard key={event.id} event={event} onOpen={openEvent} />
              ))}
            </HScrollRow>
          </div>
        </section>
      )}

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 pb-16 sm:pb-20">
        <div
          ref={panelRef}
          className="rounded-lg border border-[#84C87F]/20 bg-[#03080a] overflow-hidden"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-[8px] h-[8px] rounded-full bg-[#FF5F56]/70" />
                <span className="w-[8px] h-[8px] rounded-full bg-[#FFBD2E]/70" />
                <span className="w-[8px] h-[8px] rounded-full bg-[#27C93F]/70" />
              </div>
              <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/50 ml-1 hidden sm:inline-flex items-center gap-1.5">
                <Funnel size={11} weight="bold" /> filters.sh
              </span>
            </div>
            <AnimatePresence>
              {filtersActive && (
                <motion.button
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  onClick={resetFilters}
                  data-cursor="Reset"
                  className="flex items-center gap-1.5 font-terminal text-[10px] uppercase tracking-[0.15em] text-[#84C87F]/60 hover:text-[#84C87F] transition-colors"
                >
                  <ArrowCounterClockwise size={12} weight="bold" />
                  Reset
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex items-center gap-3 rounded-lg border border-[#84C87F]/20 bg-[#080f09] px-4 py-3 focus-within:border-[#84C87F]/50 transition-colors">
              <MagnifyingGlass size={16} weight="bold" className="text-[#84C87F]/50 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, clubs, venues..."
                spellCheck={false}
                autoComplete="off"
                className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-[#c2e0a5] placeholder:text-[#84C87F]/30 font-terminal text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  data-cursor="Clear"
                  className="text-[#84C87F]/40 hover:text-[#84C87F] transition-colors shrink-0"
                >
                  <X size={14} weight="bold" />
                </button>
              )}
            </div>

            <FilterSection label="Event Type">
              <FilterChip active={eventType === 'All'} onClick={() => setEventType('All')}>All</FilterChip>
              {eventTypes.map((t) => (
                <FilterChip key={t} active={eventType === t} onClick={() => setEventType(t)}>{t}</FilterChip>
              ))}
            </FilterSection>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <FilterSection label="Participation">
                  <FilterChip active={participation === 'All'} onClick={() => setParticipation('All')}>All</FilterChip>
                  {participationTypes.map((p) => (
                    <FilterChip key={p} active={participation === p} onClick={() => setParticipation(p)}>{p}</FilterChip>
                  ))}
                </FilterSection>
              </div>

              <div className="flex-1">
                <FilterSection label="Open To">
                  <FilterChip active={eventFor === 'All'} onClick={() => setEventFor('All')}>All</FilterChip>
                  {eventForOptions.map((f) => (
                    <FilterChip key={f} active={eventFor === f} onClick={() => setEventFor(f)}>{f}</FilterChip>
                  ))}
                </FilterSection>
              </div>
            </div>

            <PriceRangeSlider min={priceMin} max={priceMax} value={priceRange} onChange={setPriceRange} />
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 pb-24 sm:pb-32">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="h-px flex-1 bg-[#84C87F]/15" />
          <span className="font-terminal font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
            $ query --matches {filtered.length}
          </span>
          <div className="h-px flex-1 bg-[#84C87F]/15" />
        </div>

        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <EventCard event={event} onOpen={openEvent} className="w-full h-[220px] sm:h-[260px]" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <SmileySad size={32} weight="bold" className="text-[#84C87F]/40" />
            <p className="font-terminal text-sm text-[#84C87F]/50">
              0 matches for that combination. Try loosening a filter.
            </p>
            <button
              onClick={resetFilters}
              data-cursor="Reset"
              className="flex items-center gap-2 rounded-full border border-[#84C87F]/30 px-5 py-2.5
                text-[#84C87F] font-clash font-bold uppercase tracking-[0.15em] text-xs
                hover:bg-[#84C87F]/8 hover:border-[#84C87F] transition-all duration-300"
            >
              <ArrowCounterClockwise size={14} weight="bold" />
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="px-5 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-20 sm:py-28 border-t border-[#84C87F]/10
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <p className="font-clash font-bold leading-[0.9] text-[#c2e0a5]" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
          Not sure yet?
          <br />
          <span className="text-[#84C87F]">See last year in photos.</span>
        </p>
        <Link
          href="/gallery"
          data-cursor="View"
          className="group flex items-center gap-4 border border-[#84C87F]/30
            px-6 py-4 sm:px-8 sm:py-5
            hover:bg-[#84C87F]/8 hover:border-[#84C87F] transition-all duration-300"
        >
          <span className="font-clash font-bold uppercase tracking-[0.2em] text-[#c2e0a5] text-sm">
            View Gallery
          </span>
          <ArrowRight
            size={20}
            weight="bold"
            className="text-[#84C87F] group-hover:translate-x-1 transition-transform duration-300"
          />
        </Link>
      </section>

      <AnimatePresence>
        {activeEvent && <EventModal event={activeEvent} onClose={closeEvent} />}
      </AnimatePresence>
    </main>
  );
}
