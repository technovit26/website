'use client';

import { useEffect, useRef, useState } from 'react';

const MARQUEE_BASE_ITEMS = ['Inclusive Innovation', 'High on Tech'];

function MarqueeItem({ text }: { text: string }) {
  return (
    <span className="flex items-center shrink-0">
      <span className="font-clash font-bold uppercase tracking-[0.12em] text-base sm:text-lg md:text-xl px-8 sm:px-10">
        {text}
      </span>
      <span className="text-[#84C87F] font-bold text-lg select-none">·</span>
    </span>
  );
}

export default function Marquee({ reverse = false }: { reverse?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(6);

  useEffect(() => {
    const container = containerRef.current;
    const unit = measureRef.current;
    if (!container || !unit) return;

    const recalc = () => {
      const unitWidth = unit.scrollWidth;
      if (!unitWidth) return;
      const needed = Math.ceil(container.offsetWidth / unitWidth) + 1;
      setRepeat((prev) => (prev === needed ? prev : needed));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const half = Array.from({ length: repeat }, () => MARQUEE_BASE_ITEMS).flat();
  const items = [...half, ...half];

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full" aria-hidden>
      <div
        ref={measureRef}
        className="absolute -z-10 opacity-0 pointer-events-none flex items-center whitespace-nowrap"
      >
        {MARQUEE_BASE_ITEMS.map((item, i) => (
          <MarqueeItem key={i} text={item} />
        ))}
      </div>

      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee-${reverse ? 'rev' : 'fwd'} ${reverse ? 22 : 20}s linear infinite`,
        }}
      >
        {items.map((item, i) => (
          <MarqueeItem key={i} text={item} />
        ))}
      </div>

      <style>{`
        @keyframes marquee-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
