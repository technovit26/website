'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* A stable ref, not state: consumers (e.g. TrailerModal) only ever read
   this inside their own effects, so there's no need to re-render anything
   when Lenis mounts — that would mean calling setState synchronously
   inside an effect just to force a re-render nothing needs. */
const LenisContext = createContext<React.RefObject<Lenis | null>>({ current: null });

/** Access the page's Lenis instance, e.g. to lenis.stop()/start() while a modal is open. */
export function useLenis() {
  return useContext(LenisContext).current;
}

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);


  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();


      setTimeout(() => {
        ScrollTrigger.refresh();
        lenisRef.current?.resize();
      }, 100);
    }
  }, [pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
