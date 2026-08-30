'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Handshake } from '@phosphor-icons/react';
import Marquee from '../components/Marquee';
import ContourBackdrop from '../components/ContourBackdrop';
import SponsorCard from './SponsorCard';
import { SPONSORS } from './data';

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_ITEMS = ["TechnoVIT'26"];

function tagFor(i: number): string {
  return `SPON_${String(i).padStart(3, '0')}.dat`;
}

function AnimatedGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      const cards = ref.current.querySelectorAll('.sponsor-card');
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
      {SPONSORS.map((s, i) => (
        <SponsorCard key={s.name} sponsor={s} tag={tagFor(i)} />
      ))}
    </div>
  );
}

export default function SponsorsContent() {
  const bigTitleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

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
              text-[15vw] sm:text-[17vw] tracking-tight uppercase text-center"
          >
            SPONSORS
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
            <Handshake size={22} weight="bold" className="text-[#84C87F]/70" />
            <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
              Powered by our sponsors.
            </p>
            <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
              The organisations backing TechnoVIT&apos;26 —
              <span className="text-[#84C87F] font-semibold"> logos to be added shortly.</span>
            </p>
          </div>
        </section>

        <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
          <AnimatedGrid />
        </section>
      </div>
    </main>
  );
}
