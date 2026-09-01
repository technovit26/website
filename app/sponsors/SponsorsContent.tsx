'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Handshake, Megaphone } from '@phosphor-icons/react';
import ContourBackdrop from '../components/ContourBackdrop';
import SponsorCard from './SponsorCard';
import { SPONSORS, PARTNERS, type Sponsor } from './data';

gsap.registerPlugin(ScrollTrigger);

function tagFor(prefix: string, i: number): string {
  return `${prefix}_${String(i).padStart(3, '0')}.dat`;
}

function AnimatedGrid({ items, tagPrefix }: { items: Sponsor[]; tagPrefix: string }) {
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
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
    >
      {items.map((s, i) => (
        <SponsorCard key={s.name} sponsor={s} tag={tagFor(tagPrefix, i)} />
      ))}
    </div>
  );
}

export default function SponsorsContent() {
  const introRef = useRef<HTMLDivElement>(null);
  const partnersIntroRef = useRef<HTMLDivElement>(null);

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

      if (partnersIntroRef.current) {
        gsap.fromTo(
          partnersIntroRef.current,
          { y: 30, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: { trigger: partnersIntroRef.current, start: 'top 85%' },
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
            <Handshake size={22} weight="bold" className="text-[#84C87F]/70" />
            <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
              Powered by our sponsors.
            </p>
            <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
              The organisations backing TechnoVIT&apos;26.
            </p>
          </div>
        </section>

        <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
          <AnimatedGrid items={SPONSORS} tagPrefix="SPON" />
        </section>

        <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
          <div
            ref={partnersIntroRef}
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4"
          >
            <Megaphone size={22} weight="bold" className="text-[#84C87F]/70" />
            <p className="font-clash font-bold text-[#c2e0a5] text-2xl sm:text-3xl md:text-4xl leading-tight">
              Our partners.
            </p>
            <p className="text-[#c2e0a5]/70 text-sm sm:text-base leading-relaxed max-w-xl">
              The teams amplifying TechnoVIT&apos;26.
            </p>
          </div>
        </section>

        <section className="px-5 sm:px-10 md:px-16 lg:px-24 py-14 sm:py-16 md:py-20">
          <AnimatedGrid items={PARTNERS} tagPrefix="PTNR" />
        </section>
      </div>
    </main>
  );
}
