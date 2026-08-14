'use client';

import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

export default function HomepageContent() {
  return (
    <div className="relative z-20 bg-[#064928] text-[#c2e0a5]">
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
          TechnoVIT&apos;26 is VIT Chennai&apos;s annual technical festival — 50+ events across
          engineering, design, robotics, coding, and more. No gatekeeping. Talent and curiosity
          are the only entry requirements.
        </p>
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
  );
}
