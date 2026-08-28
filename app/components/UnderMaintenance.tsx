'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function UnderMaintenance({ title }: { title: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.um-stagger',
        { y: 34, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.13,
          ease: 'power3.out',
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="w-full overflow-hidden">
      <div className="home-hero-text relative flex flex-col overflow-hidden bg-[#c2e0a5]">
        <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6
          pt-6 pb-4 text-center sm:pt-10 sm:pb-6 md:pt-20 lg:pt-20">
          <h1 className="um-stagger font-clash font-bold uppercase leading-none text-[#08414a]
            text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem]">
            {title}
          </h1>

          <p className="um-stagger mt-4 font-bold uppercase tracking-[0.25em] text-[#019153]
            text-xs sm:text-sm md:text-lg lg:text-xl sm:mt-6 md:mt-8">
            Under Maintenance.
          </p>

          <p className="um-stagger mt-3 max-w-md text-[#08414a]/70 text-xs sm:text-sm md:text-base leading-relaxed">
            We&apos;re reworking this page right now. The rest of technoVIT&apos;26 is up and running —
            check back here soon.
          </p>

          <Link
            href="/"
            className="um-stagger mt-6 inline-block border-2 border-transparent bg-[#064928] px-6 py-3
              font-semibold uppercase tracking-widest text-white text-xs
              transition-colors duration-300 hover:border-[#84C87F] hover:bg-[#019153]
              sm:mt-8 sm:px-8 sm:py-4 sm:text-sm md:mt-10 md:text-base"
          >
            Back to Home →
          </Link>
        </div>
      </div>

      <div className="relative z-10 -mt-10 w-full shrink-0 select-none pointer-events-none
        sm:-mt-16 md:-mt-22 lg:-mt-28">
        <img src="/bg.svg" alt="" className="block h-auto w-full" />
      </div>
    </main>
  );
}
