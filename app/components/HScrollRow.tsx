'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export default function HScrollRow({
  children,
  edgeFadeClassName = 'from-[#03080a]',
  ariaLabel,
  wheelScroll = true,
  dragScroll = false,
}: {
  children: ReactNode;
  edgeFadeClassName?: string;
  ariaLabel?: string;
  wheelScroll?: boolean;
  dragScroll?: boolean;
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
    if (!el || !wheelScroll) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [wheelScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !dragScroll) return;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollTo({ left: startScroll - dx, behavior: 'instant' as ScrollBehavior });
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [dragScroll]);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        role="group"
        aria-label={ariaLabel}
        className={`terminal-scroll flex items-center gap-2 overflow-x-auto overscroll-contain pb-1 pr-1 scroll-smooth ${
          dragScroll ? 'cursor-grab active:cursor-grabbing select-none' : ''
        }`}
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
