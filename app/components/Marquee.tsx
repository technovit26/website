'use client';

import { useEffect, useRef, useState } from 'react';

const MARQUEE_BASE_ITEMS = ['Inclusive Innovation', 'High on Tech'];

function MarqueeItem({ text, size }: { text: string; size: 'sm' | 'lg' }) {
  return (
    <span className="flex items-center shrink-0">
      <span
        className={`font-clash font-bold uppercase tracking-[0.12em] ${
          size === 'lg'
            ? 'text-4xl sm:text-6xl md:text-7xl px-6 sm:px-10 md:px-12'
            : 'text-base sm:text-lg md:text-xl px-8 sm:px-10'
        }`}
      >
        {text}
      </span>
      <span className={`font-bold select-none ${size === 'lg' ? 'text-3xl sm:text-5xl' : 'text-lg'}`}>·</span>
    </span>
  );
}

export default function Marquee({
  reverse = false,
  size = 'sm',
  items: baseItems = MARQUEE_BASE_ITEMS,
}: {
  reverse?: boolean;
  size?: 'sm' | 'lg';
  items?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(6);
  const itemsKey = baseItems.join('|');

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
  }, [itemsKey, size]);

  const half = Array.from({ length: repeat }, () => baseItems).flat();
  const items = [...half, ...half];

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full" aria-hidden>
      <div
        ref={measureRef}
        className="absolute -z-10 opacity-0 pointer-events-none flex items-center whitespace-nowrap"
      >
        {baseItems.map((item, i) => (
          <MarqueeItem key={i} text={item} size={size} />
        ))}
      </div>

      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee-${reverse ? 'rev' : 'fwd'} ${reverse ? 22 : 20}s linear infinite`,
        }}
      >
        {items.map((item, i) => (
          <MarqueeItem key={i} text={item} size={size} />
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
