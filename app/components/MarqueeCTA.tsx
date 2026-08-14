'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

function MarqueeCTAItem({ label }: { label: string }) {
  return (
    <span className="flex items-center shrink-0">
      <span className="font-clash font-bold uppercase tracking-[0.1em] text-[#08414a]
        text-sm sm:text-base px-4 sm:px-5">
        {label}
      </span>
      <ArrowRight size={14} weight="bold" className="text-[#08414a] shrink-0" />
    </span>
  );
}

export default function MarqueeCTA({
  href,
  label,
  dataCursor,
}: {
  href: string;
  label: string;
  dataCursor?: string;
}) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(4);

  useEffect(() => {
    const container = containerRef.current;
    const unit = measureRef.current;
    if (!container || !unit) return;

    let cancelled = false;

    const recalc = () => {
      if (cancelled) return;
      const unitWidth = unit.scrollWidth;
      if (unitWidth < 10) return;
      const needed = Math.min(Math.ceil(container.offsetWidth / unitWidth) + 1, 40);
      setRepeat((prev) => (prev === needed ? prev : needed));
    };

    recalc();
    document.fonts?.ready.then(recalc);
    const ro = new ResizeObserver(recalc);
    ro.observe(container);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [label]);

  const items = Array.from({ length: repeat * 2 });

  return (
    <Link
      ref={containerRef}
      href={href}
      aria-label={label}
      data-cursor={dataCursor}
      className="group relative inline-flex w-auto min-w-[200px] sm:min-w-[260px] items-center overflow-hidden
        rounded-full border border-[#84C87F]/40 bg-[#84C87F] hover:bg-white
        transition-colors duration-300 py-3 sm:py-3.5"
    >
      <div
        ref={measureRef}
        className="absolute -z-10 opacity-0 pointer-events-none flex items-center whitespace-nowrap"
      >
        <MarqueeCTAItem label={label} />
      </div>

      <div
        aria-hidden
        className="flex items-center whitespace-nowrap will-change-transform
          group-hover:[animation-play-state:paused]"
        style={{ animation: 'marquee-cta-fwd 34s linear infinite' }}
      >
        {items.map((_, i) => (
          <MarqueeCTAItem key={i} label={label} />
        ))}
      </div>

      <style>{`
        @keyframes marquee-cta-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </Link>
  );
}
