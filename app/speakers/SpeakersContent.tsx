'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Microphone, CalendarBlank, Clock, Storefront } from '@phosphor-icons/react';
import MarqueeCTA from '../components/MarqueeCTA';
import ContourBackdrop from '../components/ContourBackdrop';
import SpeakerCard from './SpeakerCard';
import { CEREMONIES, EVENT_SPEAKER_DAYS, type Ceremony, type EventSpeakerSession } from './data';

gsap.registerPlugin(ScrollTrigger);

function tagFor(prefix: string, i: number): string {
  return `${prefix}_${String(i).padStart(3, '0')}.dat`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(dateStr: string): string {
  const match = dateStr.trim().match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return dateStr;
  const [, day, monthName, year] = match;
  const monthIdx = MONTHS.findIndex((m) => m.toLowerCase().startsWith(monthName.toLowerCase()));
  const month = monthIdx >= 0 ? MONTHS[monthIdx] : monthName;
  return `${month} ${Number(day)}, ${year}`;
}

function CeremonyHeading({ ceremony }: { ceremony: Ceremony }) {
  return (
    <div className="flex flex-col items-center gap-3 mb-10 md:mb-12">
      <div className="flex items-center gap-3 w-full max-w-2xl">
        <div className="h-px flex-1 bg-[#84C87F]/15" />
        <span className="font-bold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[#84C87F] text-lg sm:text-3xl text-center">
          {ceremony.title}
        </span>
        <div className="h-px flex-1 bg-[#84C87F]/15" />
      </div>
      <div className="flex items-center gap-4 sm:gap-6 text-[#c2e0a5] font-bold text-lg sm:text-2xl">
        <span className="flex items-center gap-1.5">
          <CalendarBlank size={22} weight="bold" className="text-[#84C87F]" />
          {ceremony.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={22} weight="bold" className="text-[#84C87F]" />
          {ceremony.time}
        </span>
      </div>
    </div>
  );
}

function AnimatedGrid({ ceremony }: { ceremony: Ceremony }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      const cards = ref.current.querySelectorAll('.speaker-card');
      gsap.fromTo(
        cards,
        { y: 36, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 88%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto [&>*]:w-full sm:[&>*]:w-[380px] md:[&>*]:w-[340px] lg:[&>*]:w-[320px] xl:[&>*]:w-[300px]"
    >
      {ceremony.speakers.map((s, i) => (
        <SpeakerCard key={s.name} speaker={s} tag={tagFor(ceremony.id.toUpperCase(), i)} />
      ))}
    </div>
  );
}

function EventSpeakerCard({
  speaker,
  eventName,
  date,
}: {
  speaker: EventSpeakerSession['speakers'][number];
  eventName: string;
  date: string;
}) {
  function initialsOf(name: string): string {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter((p) => !/^(mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?)$/i.test(p));
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  const displayName = speaker.honorific ? `${speaker.honorific}. ${speaker.name}` : speaker.name;

  return (
    <div
      className="speaker-card group relative flex flex-col overflow-hidden rounded-lg
        border border-[#84C87F]/20 bg-[#03080a] isolate transition-colors duration-300 hover:border-[#84C87F]/45"
      style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.07), 0 12px 32px rgba(0,0,0,0.3)' }}
    >
      {/* Terminal bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#080f09] border-b border-[#84C87F]/10 select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-[6px] h-[6px] rounded-full bg-[#FF5F56]/70" />
          <span className="w-[6px] h-[6px] rounded-full bg-[#FFBD2E]/70" />
          <span className="w-[6px] h-[6px] rounded-full bg-[#27C93F]/70" />
        </div>
      </div>

      {/* Square photo */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#080f09]">
        {speaker.photoUrl ? (
          <img
            src={speaker.photoUrl}
            alt={speaker.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-clash font-bold text-[#84C87F]/10 group-hover:text-[#84C87F]/20 transition-colors duration-500 text-6xl leading-none">
              {initialsOf(displayName)}
            </span>
          </div>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-3.5 py-3 flex-1">
        <h3 className="font-clash font-bold text-[#c2e0a5] text-lg leading-tight">{displayName}</h3>
        <span className="font-bold uppercase tracking-[0.12em] text-[#84C87F]/65 text-[11px] leading-snug">
          {speaker.designation}
        </span>
        <span className="text-[#c2e0a5]/55 text-[13px] leading-snug">{speaker.organization}</span>

        <div className="mt-auto pt-2 border-t border-[#84C87F]/10 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[#84C87F]/80 font-terminal text-[11px] uppercase tracking-[0.1em] truncate">
            <Storefront size={12} weight="fill" className="text-[#84C87F] shrink-0" />
            {eventName}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#c2e0a5]/60 text-xs leading-snug">
            <CalendarBlank size={13} weight="bold" className="text-[#84C87F] shrink-0" />
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}






function EventSpeakerSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      const cards = ref.current.querySelectorAll('.speaker-card');
      gsap.fromTo(
        cards,
        { y: 36, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 88%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-16">
      {EVENT_SPEAKER_DAYS.map((day) => (
        <div key={day.day}>
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="flex items-center gap-3 w-full max-w-2xl">
              <div className="h-px flex-1 bg-[#84C87F]/15" />
              <span className="font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#84C87F] text-base sm:text-xl text-center whitespace-nowrap">
                {day.label}
                <span className="text-[#c2e0a5]/80"> ({shortDate(day.date)})</span>
              </span>
              <div className="h-px flex-1 bg-[#84C87F]/15" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-7xl mx-auto [&>*]:w-full sm:[&>*]:w-[calc(50%-5px)] md:[&>*]:w-[calc(33.333%-7px)] lg:[&>*]:w-[calc(25%-8px)] xl:[&>*]:w-[calc(20%-8px)]">
            {day.sessions.flatMap((session) =>
              session.speakers.map((speaker) => (
                <EventSpeakerCard
                  key={`${session.id}-${speaker.name}`}
                  speaker={speaker}
                  eventName={session.eventName}
                  date={day.date}
                />
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SpeakersContent() {
  const introRef = useRef<HTMLDivElement>(null);
  const eventSpeakersIntroRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (introRef.current) {
        gsap.fromTo(
          introRef.current,
          { y: 30, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: { trigger: introRef.current, start: 'top 85%' },
          },
        );
      }

      if (eventSpeakersIntroRef.current) {
        gsap.fromTo(
          eventSpeakersIntroRef.current,
          { y: 30, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: { trigger: eventSpeakersIntroRef.current, start: 'top 85%' },
          },
        );
      }

      if (closingRef.current) {
        gsap.fromTo(
          closingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: closingRef.current, start: 'top 88%' },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <ContourBackdrop />
      <div className="relative">
        <section className="px-5 sm:px-10 md:px-16 lg:px-24 pt-32 sm:pt-40 md:pt-48 pb-14 sm:pb-16 md:pb-20">
          <div
            ref={introRef}
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4"
          >
            <Microphone size={22} weight="bold" className="text-[#84C87F]/70" />
            <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
              Our Guest Speakers for TechnoVIT&apos;26.
            </p>
            <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
              Distinguished guests joining us at the
              <span className="text-[#84C87F] font-semibold"> Inaugural and Valedictory Ceremonies</span>,
              bringing perspective from industry, diplomacy, and academia.
            </p>
          </div>
        </section>

        {CEREMONIES.map((ceremony) => (
          <section key={ceremony.id} className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
            <CeremonyHeading ceremony={ceremony} />
            <AnimatedGrid ceremony={ceremony} />
          </section>
        ))}

        {/* ── Event Speakers ── */}
        <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
          <div
            ref={eventSpeakersIntroRef}
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4 mb-14 sm:mb-16"
          >
            <Storefront size={22} weight="bold" className="text-[#84C87F]/70" />
            <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
              Event Speakers
            </p>
            <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
              Industry practitioners and makers presenting at select TechnoVIT&apos;26 events.
            </p>
          </div>

          <EventSpeakerSection />
        </section>

        <section className="relative overflow-hidden px-5 sm:px-10 md:px-16 lg:px-24 py-20 sm:py-24 md:py-32">
          <div
            className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none"
            aria-hidden
          >
            <span className="font-clash font-bold text-[35vw] leading-none text-white opacity-[0.035] pr-4 translate-x-8">
              26
            </span>
          </div>

          <div
            ref={closingRef}
            className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-6 sm:gap-8"
          >
            <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
              Catch them live at the fest.
            </p>
            <p className="text-white/55 text-xs sm:text-sm uppercase tracking-[0.3em] font-bold">
              3rd &amp; 4th September &middot; VIT Chennai
            </p>

            <div className="w-16 sm:w-20 h-px bg-[#84C87F]/25" />

            <MarqueeCTA href="/events" label="Explore Events" dataCursor="Explore" />
          </div>
        </section>
      </div>
    </main>
  );
}
