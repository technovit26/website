'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { WarningCircle } from '@phosphor-icons/react';

export default function SiteMaintenance() {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
      );
      gsap.to(iconRef.current, {
        opacity: 0.4,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.fromTo(
        barFillRef.current,
        { xPercent: -100 },
        { xPercent: 100, duration: 1.6, repeat: -1, ease: 'power1.inOut' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4 text-center bg-[#064928]">
      <div
        ref={cardRef}
        className="relative w-full max-w-md rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a]"
        style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.12), 0 30px 70px rgba(0,0,0,0.5)' }}
      >
        <div aria-hidden className="terminal-scanlines opacity-20" />

        <div className="relative flex items-center px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F56]/70" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]/70" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#27C93F]/70" />
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/50 truncate max-w-[60%]">
            technovit.sh · offline
          </span>
        </div>

        <div className="relative flex flex-col items-center gap-5 px-6 py-12 sm:py-14">
          <span
            ref={iconRef}
            className="flex items-center justify-center w-14 h-14 rounded-full border border-[#84C87F]/30 text-[#84C87F]"
          >
            <WarningCircle size={26} weight="bold" />
          </span>

          <h1 className="font-clash font-bold text-2xl sm:text-3xl text-[#c2e0a5] uppercase tracking-tight">
            We&apos;ll Be Right Back
          </h1>
          <p className="text-[#84C87F]/70 text-sm leading-relaxed max-w-xs">
            TechnoVIT&apos;26 is offline for scheduled maintenance. Everything&apos;s fine — we&apos;re just
            working on something behind the scenes. Check back shortly.
          </p>

          <div className="w-full max-w-[220px] h-[3px] rounded-full bg-[#84C87F]/10 overflow-hidden">
            <div ref={barFillRef} className="h-full w-1/2 rounded-full bg-[#84C87F]" />
          </div>

          <span className="font-terminal text-[10px] text-[#84C87F]/40 uppercase tracking-[0.2em]">
            $ status --site<span className="terminal-cursor">_</span>
          </span>
        </div>
      </div>
    </main>
  );
}
