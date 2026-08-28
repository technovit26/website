'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { animate, useInView } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import ContourBackdrop from './ContourBackdrop';

const STATS = [
  { value: 25000, suffix: '+', label: 'Participants' },
  { value: 150,   suffix: '+', label: 'Events' },
  { value: 20,    suffix: '+', label: 'Countries' },
  { value: 2,     suffix: '',  label: 'Days' },
];

function StatBlock({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView || !numberRef.current) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (numberRef.current) numberRef.current.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div ref={containerRef} className="flex flex-col items-center text-center">
      <span
        className="font-clash font-bold leading-none text-[#c2e0a5] tabular-nums"
        style={{ fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)' }}
      >
        <span ref={numberRef}>0</span>
        {suffix}
      </span>
      <span className="mt-1 font-semibold uppercase tracking-[0.2em] text-[#84C87F]/70 text-xs sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export default function HomepageContent() {
  return (
    <div className="relative z-20 bg-[#064928] text-[#c2e0a5]">
      <ContourBackdrop />
      <div className="relative">
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-20 sm:py-28 md:py-36">
        <p
          className="font-clash font-bold leading-[0.88] text-[#c2e0a5]"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
        >
          Two days.
          <br />
          <span className="text-[#84C87F]">Every discipline.</span>
          <br />
          One fest.
        </p>
        <p className="mt-8 max-w-xl font-semibold text-[#84C87F]/70 leading-relaxed text-sm sm:text-base md:text-lg">
          TechnoVIT&apos;26 is VIT Chennai&apos;s annual technical festival — 150+ events across
          engineering, design, robotics, coding, and more. No gatekeeping. Talent and curiosity
          are the only entry requirements.
        </p>
      </section>

      <section className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 pb-20 sm:pb-28">
        <div className="h-px bg-[#84C87F]/20 mb-12 sm:mb-16" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {STATS.map((s) => (
            <StatBlock key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      <section
        className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-20 sm:py-28 md:py-36
          border-t border-[#84C87F]/10
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8"
      >
        <p
          className="font-clash font-bold leading-[0.9] text-[#c2e0a5]"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          3rd – 4th Sep.
          <br />
          <span className="text-[#84C87F]">VIT Chennai.</span>
        </p>
        <Link
          href="/events"
          data-cursor="Explore"
          className="group flex items-center gap-4 border border-[#84C87F]/30
            px-6 py-4 sm:px-8 sm:py-5
            hover:bg-[#84C87F]/8 hover:border-[#84C87F] transition-all duration-300"
        >
          <span className="font-clash font-bold uppercase tracking-[0.2em] text-[#c2e0a5] text-sm">
            Explore Events
          </span>
          <ArrowRight
            size={20}
            weight="bold"
            className="text-[#84C87F] group-hover:translate-x-1 transition-transform duration-300"
          />
        </Link>
      </section>
      </div>
    </div>
  );
}
