'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ComingSoon({ title }: { title: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.fromTo(
      [titleRef.current, subtitleRef.current],
      { y: 40, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    );

    const glitch = () => {
      if (!titleRef.current) return;
      const el = titleRef.current;
      
      gsap.timeline()
        .to(el, { x: 8, y: -4, skewX: 15, scale: 1.02, color: '#019153', duration: 0.04 })
        .to(el, { x: -12, y: 4, skewX: -15, scale: 0.98, opacity: 0.7, color: '#ffffff', duration: 0.04 })
        .to(el, { x: 6, y: -2, skewX: 5, scale: 1.05, opacity: 0.9, color: '#08414a', filter: 'blur(2px)', duration: 0.04 })
        .to(el, { x: 0, y: 0, skewX: 0, scale: 1, opacity: 1, color: '#08414a', filter: 'blur(0px)', duration: 0.04 });
    };

    const glitchInterval = setInterval(glitch, 3200);
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <section className="flex-1 flex flex-col items-center justify-center min-h-[65svh] md:min-h-[85vh] px-4 text-center
      bg-[#c2e0a5] pt-16 md:pt-20 lg:pt-24">
      <h1
        ref={titleRef}
        className="font-clash font-bold text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[11rem] leading-none text-[#08414a] uppercase"
      >
        {title}
      </h1>
      <p
        ref={subtitleRef}
        className="mt-6 sm:mt-8 md:mt-10 font-bold uppercase tracking-[0.25em] text-[#019153] text-xs sm:text-sm md:text-lg lg:text-xl"
      >
        Coming Soon.
      </p>
    </section>
  );
}
