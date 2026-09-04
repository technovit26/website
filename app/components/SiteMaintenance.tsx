'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ContourBackdrop from './ContourBackdrop';

export default function SiteMaintenance() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.sm-stagger',
        { y: 28, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden
        bg-[#064928] px-6 sm:px-10 text-center"
    >
      <ContourBackdrop />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[2vw] -bottom-[6vw] select-none font-clash font-bold
          leading-none text-white opacity-[0.045] text-[26vw]"
      >
        26
      </span>

      <div className="relative flex max-w-2xl flex-col items-center gap-6 sm:gap-8">
        <span className="sm-stagger font-bold uppercase tracking-[0.3em] text-[#84C87F] text-[10px] sm:text-xs">
          technoVIT&apos;26 · VIT Chennai
        </span>

        <h1 className="sm-stagger font-clash font-bold uppercase leading-[0.95] text-[#c2e0a5]
          text-[13vw] sm:text-6xl md:text-7xl">
          We&apos;ll be
          <br />
          right back
        </h1>

        <p className="sm-stagger max-w-md text-[#c2e0a5]/60 text-sm sm:text-base leading-relaxed">
          The site is down for scheduled maintenance. Nothing&apos;s broken on your end —
          we&apos;re shipping an update. Check back in a little while.
        </p>
      </div>
    </main>
  );
}
