'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<React.RefObject<Lenis | null>>({ current: null });

export function useLenis() {
  return useContext(LenisContext).current;
}

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);


  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
    } else {
      window.scrollTo(0, 0);
    }

    const id = setTimeout(() => {
      ScrollTrigger.refresh();
      lenisRef.current?.resize();
    }, 100);
    return () => clearTimeout(id);
  }, [pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
