'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Microphone, CalendarBlank, Clock } from '@phosphor-icons/react';
import Marquee from '../components/Marquee';
import MarqueeCTA from '../components/MarqueeCTA';
import ContourBackdrop from '../components/ContourBackdrop';
import SpeakerCard from './SpeakerCard';
import { CEREMONIES, type Ceremony } from './data';

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_ITEMS = ["TechnoVIT'26"];

function tagFor(prefix: string, i: number): string {
  return `${prefix}_${String(i).padStart(3, '0')}.dat`;
}

function CeremonyHeading({ ceremony }: { ceremony: Ceremony }) {
  return (
    <div className="flex flex-col items-center gap-3 mb-10 md:mb-12">
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="h-px flex-1 bg-[#84C87F]/15" />
        <span className="font-bold uppercase tracking-[0.3em] text-[#84C87F]/50 text-[10px] sm:text-xs whitespace-nowrap">
          {ceremony.title}
        </span>
        <div className="h-px flex-1 bg-[#84C87F]/15" />
      </div>
      <div className="flex items-center gap-4 sm:gap-6 text-[#c2e0a5]/60 text-xs sm:text-sm">
        <span className="flex items-center gap-1.5">
          <CalendarBlank size={14} weight="bold" className="text-[#84C87F]/70" />
          {ceremony.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} weight="bold" className="text-[#84C87F]/70" />
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
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
    >
      {ceremony.speakers.map((s, i) => (
        <SpeakerCard key={s.name} speaker={s} tag={tagFor(ceremony.id.toUpperCase(), i)} />
      ))}
    </div>
  );
}

export default function SpeakersContent() {
  const bigTitleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bigTitleRef.current,
        { y: 60, opacity: 0, filter: 'blur(12px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
      );

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
        <section
          className="sticky top-0 z-0 min-h-[100dvh] flex items-center justify-center select-none
            bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24 overflow-hidden"
        >
          <h1
            ref={bigTitleRef}
            className="font-clash font-bold text-[#04331c] opacity-[0.22] leading-none
              text-[13vw] sm:text-[16vw] tracking-tight uppercase text-center"
          >
            GUEST SPEAKERS
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
