'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CurtainIntro({
  title,
  label = "technoVIT'26",
}: {
  title: string;
  label?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        setOpen(true);
        return;
      }

      const tl = gsap.timeline({ onComplete: () => setOpen(true) });

      tl.fromTo(
        [titleRef.current, labelRef.current],
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.06 }
      )
        .to([titleRef.current, labelRef.current], {
          y: -12,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          delay: 0.3,
        })
        .to(panelRef.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '<');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  if (open) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[200]" aria-hidden="true">
      <div ref={panelRef} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#04331c]">
        <span
          ref={titleRef}
          className="font-clash font-bold text-[#c2e0a5] leading-none tracking-tight uppercase text-center px-8
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {title}
        </span>
        <span
          ref={labelRef}
          className="font-bold text-[#84C87F]/70 text-[10px] sm:text-xs tracking-[0.3em] uppercase"
        >
          {label}
        </span>
      </div>
    </div>
  );
}
