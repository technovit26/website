'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./components/Header";
import Marquee from "./components/Marquee";
import HomepageContent from "./components/HomepageContent";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current && svgRef.current) {
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={heroRef}>
        <Header />
      </div>

      <div
        ref={svgRef}
        className="relative z-10 w-full pointer-events-none select-none shrink-0 -mt-10 sm:-mt-16 md:-mt-22 lg:-mt-28"
      >
        <img src="/bg.svg" alt="Background landscape" fetchPriority="high" className="w-full h-auto block" />
      </div>

      <div className="relative z-20 -mt-1 bg-[#064928] text-[#84C87F] py-3.5 sm:py-4 overflow-hidden w-full">
        <Marquee />
      </div>
      <HomepageContent />
    </>
  );
}
