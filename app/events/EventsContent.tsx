'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowCounterClockwise,
  ArrowRight,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
  Funnel,
  MagnifyingGlass,
  SmileySad,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import Marquee from '../components/Marquee';
import ContourBackdrop from '../components/ContourBackdrop';
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
const DEFAULT_DATE = 'All';
const PAGE_SIZE = 10;
const COMPLETED_PAGE_SIZE = 6;

function eventStart(e: EventItem) {
  return new Date(e.startDateTime).getTime();
}
function eventEnd(e: EventItem) {
  return new Date(e.endDateTime).getTime();
}

function toDayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function eventStartDayKey(e: EventItem): string {
  return toDayKey(new Date(e.startDateTime));
}

function formatDayLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function compareEvents(a: EventItem, b: EventItem) {
  const byStart = eventStart(a) - eventStart(b);
  if (byStart) return byStart;
  return a.eventName.localeCompare(b.eventName);
}

const EVENTS_CACHE_KEY = 'technovit:events-cache:v1';
const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000;

function readEventsCache(): EventItem[] | null {
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { events: EventItem[]; cachedAt: number };
    if (!parsed.events?.length || Date.now() - parsed.cachedAt > EVENTS_CACHE_TTL_MS) return null;
    return parsed.events;
  } catch {
    return null;
  }
}

function writeEventsCache(events: EventItem[]) {
  if (events.length === 0) return;
  try {
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify({ events, cachedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — skip caching silently
  }
}

const MATCHED_CACHE_KEY = 'technovit:matched-events-cache:v1';
const MATCHED_CACHE_TTL_MS = 5 * 60 * 1000;

function readMatchedCache(): string[] | null {
  try {
    const raw = localStorage.getItem(MATCHED_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { matchedIds: string[]; cachedAt: number };
    if (!parsed.matchedIds || Date.now() - parsed.cachedAt > MATCHED_CACHE_TTL_MS) return null;
    return parsed.matchedIds;
  } catch {
    return null;
  }
}

function writeMatchedCache(matchedIds: string[]) {
  try {
    localStorage.setItem(MATCHED_CACHE_KEY, JSON.stringify({ matchedIds, cachedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — skip caching silently
  }
}

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

const PAGER_BTN_CLASS =
  'flex items-center gap-1.5 rounded-full border border-[#84C87F]/25 px-4 py-2 text-[11px] font-semibold ' +
  'uppercase tracking-wide text-[#84C87F]/70 transition-colors hover:border-[#84C87F]/50 hover:text-[#84C87F] ' +
  'disabled:opacity-30 disabled:pointer-events-none';

function Pager({
  current,
  total,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2 font-terminal">
      <button type="button" onClick={onPrev} disabled={current === 1} data-cursor="Left" className={PAGER_BTN_CLASS}>
        <CaretLeft size={12} weight="bold" />
        Prev
      </button>
      <span className="px-3 text-[11px] uppercase tracking-wide text-[#84C87F]/50">
        {current} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={current === total}
        data-cursor="Right"
        className={PAGER_BTN_CLASS}
      >
        Next
        <CaretRight size={12} weight="bold" />
      </button>
    </div>
  );
}

export default function EventsContent({ events: initialEvents }: { events: EventItem[] }) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  // null = matching data not loaded yet -> don't filter anything out.
  const [matchedIds, setMatchedIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    const cached = readEventsCache();
    if (cached) {
      setEvents(cached);
      return;
    }
    if (initialEvents.length > 0) {
      writeEventsCache(initialEvents);
      return;
    }
    let active = true;
    fetch('/api/technovit/event-list')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: EventItem[]) => {
        if (!active || data.length === 0) return;
        setEvents(data);
        writeEventsCache(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cached = readMatchedCache();
    if (cached) {
      setMatchedIds(new Set(cached));
      return;
    }
    let active = true;
    fetch('/api/technovit/matched-events')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ready: boolean; matchedIds: string[] | null } | null) => {
        if (!active || !data?.ready || !data.matchedIds) return;
        setMatchedIds(new Set(data.matchedIds));
        writeMatchedCache(data.matchedIds);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Events with no name-match on the upstream chennaievents portal have no
  // working registration flow, so keep them out of the listing entirely
  // rather than showing a card that can't actually register anyone.
  const visibleEvents = useMemo(
    () => (matchedIds ? events.filter((e) => matchedIds.has(e.id)) : events),
    [events, matchedIds]
  );

  const flagshipEvents = useMemo(() => visibleEvents.filter((e) => e.isSpecialEvent), [visibleEvents]);
  const regularEvents = useMemo(() => visibleEvents.filter((e) => !e.isSpecialEvent), [visibleEvents]);

  const eventTypes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of regularEvents) {
      const key = e.eventType.toLowerCase();
      if (key && !seen.has(key)) seen.set(key, e.eventType);
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [regularEvents]);
  const eventDates = useMemo(() => {
    const seen = new Set<string>();
    for (const e of regularEvents) seen.add(eventStartDayKey(e));
    return Array.from(seen).sort();
  }, [regularEvents]);
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
  const [dateFilter, setDateFilter] = useState<string>(DEFAULT_DATE);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [priceMin, priceMax]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkedEventId = searchParams.get('event');
  const activeEvent = useMemo(
    () => (deepLinkedEventId ? events.find((e) => e.id === deepLinkedEventId) ?? null : null),
    [deepLinkedEventId, events]
  );

  const debouncedSearch = useDebouncedValue(search, 250);

  const heroRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const flagshipRef = useRef<HTMLDivElement>(null);

  const filtersActive =
    debouncedSearch.trim() !== '' ||
    eventType !== DEFAULT_TYPE ||
    dateFilter !== DEFAULT_DATE ||
    priceRange[0] !== priceMin ||
    priceRange[1] !== priceMax;

  const resetFilters = () => {
    setSearch('');
    setEventType(DEFAULT_TYPE);
    setDateFilter(DEFAULT_DATE);
    setPriceRange([priceMin, priceMax]);
  };

  const isSearching = debouncedSearch.trim() !== '';

  const [now] = useState(() => Date.now());

  const { upcoming, completed } = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const typeQuery = eventType.toLowerCase();

    const matches = regularEvents.filter((e) => {
      if (eventType !== 'All' && e.eventType.toLowerCase() !== typeQuery) return false;
      if (dateFilter !== DEFAULT_DATE && eventStartDayKey(e) !== dateFilter) return false;
      if (e.pricePerPerson < priceRange[0] || e.pricePerPerson > priceRange[1]) return false;
      if (!q) return true;
      return e.eventName.toLowerCase().includes(q);
    });

    matches.sort(compareEvents);

    return {
      upcoming: matches.filter((e) => eventEnd(e) >= now),
      completed: matches.filter((e) => eventEnd(e) < now),
    };
  }, [regularEvents, debouncedSearch, eventType, dateFilter, priceRange, now]);

  const completedVisible = isSearching ? [] : completed;

  const [page, setPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const filterKey = `${debouncedSearch}|${eventType}|${dateFilter}|${priceRange[0]}|${priceRange[1]}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
    setCompletedPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(upcoming.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUpcoming = upcoming.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const completedTotalPages = Math.max(1, Math.ceil(completedVisible.length / COMPLETED_PAGE_SIZE));
  const completedCurrentPage = Math.min(completedPage, completedTotalPages);
  const pagedCompleted = completedVisible.slice(
    (completedCurrentPage - 1) * COMPLETED_PAGE_SIZE,
    completedCurrentPage * COMPLETED_PAGE_SIZE
  );

  const resultsRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef<HTMLDivElement>(null);
  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const goToCompletedPage = (next: number) => {
    setCompletedPage(Math.min(Math.max(1, next), completedTotalPages));
    completedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openEvent = useCallback(
    (event: EventItem) => {
      playSound('toggle');
      const params = new URLSearchParams(searchParams.toString());
      params.set('event', event.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );
  const closeEvent = useCallback(() => {
    playSound('toggle');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('event');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

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
      <ContourBackdrop />
      <div className="relative">
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
            <HScrollRow
              ariaLabel="Flagship events"
              edgeFadeClassName="from-[#064928]"
              wheelScroll={false}
              dragScroll
            >
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
                placeholder="Search events..."
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

            {eventDates.length > 1 && (
              <FilterSection label="Date">
                <FilterChip active={dateFilter === DEFAULT_DATE} onClick={() => setDateFilter(DEFAULT_DATE)}>
                  All
                </FilterChip>
                {eventDates.map((key) => (
                  <FilterChip key={key} active={dateFilter === key} onClick={() => setDateFilter(key)}>
                    {formatDayLabel(key)}
                  </FilterChip>
                ))}
              </FilterSection>
            )}

            <PriceRangeSlider min={priceMin} max={priceMax} value={priceRange} onChange={setPriceRange} />
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="px-5 sm:px-10 md:px-16 lg:px-24 pb-24 sm:pb-32 scroll-mt-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <MagnifyingGlass size={16} weight="bold" className="text-[#84C87F] shrink-0" />
          <span className="font-terminal font-bold uppercase tracking-[0.3em] text-[#84C87F]/70 text-[10px] sm:text-xs whitespace-nowrap">
            $ query --matches {upcoming.length}
          </span>
          <div className="h-px flex-1 bg-[#84C87F]/15" />
        </div>

        {upcoming.length > 0 ? (
          <>
            <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <AnimatePresence mode="popLayout">
                {pagedUpcoming.map((event) => (
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

            {totalPages > 1 && (
              <Pager
                current={currentPage}
                total={totalPages}
                onPrev={() => goToPage(currentPage - 1)}
                onNext={() => goToPage(currentPage + 1)}
              />
            )}
          </>
        ) : completedVisible.length > 0 ? (
          <p className="font-terminal text-sm text-[#84C87F]/50 text-center py-12">
            Nothing upcoming for that combination — completed events are listed below.
          </p>
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

        {completedVisible.length > 0 && (
          <div ref={completedRef} className="mt-20 sm:mt-28 scroll-mt-8">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <ClockCounterClockwise size={16} weight="bold" className="text-[#84C87F] shrink-0" />
              <span className="font-terminal font-bold uppercase tracking-[0.3em] text-[#84C87F]/70 text-[10px] sm:text-xs whitespace-nowrap">
                Events Completed
              </span>
              <div className="h-px flex-1 bg-[#84C87F]/15" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 opacity-55">
              {pagedCompleted.map((event) => (
                <div key={event.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_260px]">
                  <EventCard
                    event={event}
                    onOpen={openEvent}
                    className="w-full h-[220px] sm:h-[260px]"
                  />
                </div>
              ))}
            </div>
            {completedTotalPages > 1 && (
              <Pager
                current={completedCurrentPage}
                total={completedTotalPages}
                onPrev={() => goToCompletedPage(completedCurrentPage - 1)}
                onNext={() => goToCompletedPage(completedCurrentPage + 1)}
              />
            )}
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
      </div>

      <AnimatePresence>
        {activeEvent && <EventModal event={activeEvent} onClose={closeEvent} />}
      </AnimatePresence>
    </main>
  );
}
