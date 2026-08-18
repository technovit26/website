'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export default function HScrollRow({
  children,
  edgeFadeClassName = 'from-[#03080a]',
  ariaLabel,
}: {
  children: ReactNode;
  edgeFadeClassName?: string;
  ariaLabel?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [children]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        role="group"
        aria-label={ariaLabel}
        className="terminal-scroll flex items-center gap-2 overflow-x-auto overscroll-contain pb-1 pr-1 scroll-smooth"
      >
        {children}
      </div>

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r ${edgeFadeClassName} to-transparent transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${edgeFadeClassName} to-transparent transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll left"
        data-cursor="Left"
        className={`absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-[#84C87F]/30 bg-[#064928]
          text-[#84C87F] flex items-center justify-center hover:bg-[#84C87F] hover:text-[#064928] hover:border-[#84C87F]
          transition-all duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <CaretLeft size={12} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll right"
        data-cursor="Right"
        className={`absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-[#84C87F]/30 bg-[#064928]
          text-[#84C87F] flex items-center justify-center hover:bg-[#84C87F] hover:text-[#064928] hover:border-[#84C87F]
          transition-all duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <CaretRight size={12} weight="bold" />
      </button>
    </div>
  );
}
