'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function NotFound() {
  const fourRef = useRef<HTMLDivElement>(null);
  const zeroRef = useRef<HTMLDivElement>(null);
  const fourTwoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      [fourRef.current, zeroRef.current, fourTwoRef.current],
      { y: -80, opacity: 0, skewX: -8 },
      { y: 0, opacity: 1, skewX: 0, duration: 0.7, stagger: 0.12 }
    )
      .fromTo(
        taglineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.2'
      )
      .fromTo(
        btnRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45 },
        '-=0.15'
      );

    gsap.to(zeroRef.current, {
      y: -12,
      duration: 1.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1,
    });

    const glitch = () => {
      gsap.timeline()
        .to([fourRef.current, fourTwoRef.current], {
          x: 4, skewX: 4, duration: 0.06,
        })
        .to([fourRef.current, fourTwoRef.current], {
          x: -4, skewX: -4, duration: 0.06,
        })
        .to([fourRef.current, fourTwoRef.current], {
          x: 0, skewX: 0, duration: 0.06,
        });
    };

    const glitchInterval = setInterval(glitch, 3500);
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <section className="relative min-h-[60svh] md:min-h-screen flex flex-col overflow-hidden bg-[#c2e0a5]">

      <div className="flex-1 flex flex-col items-center justify-center text-center
        px-4 sm:px-6
        pt-6 sm:pt-10 md:pt-20 lg:pt-20
        pb-4 sm:pb-6">

        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6
          leading-none font-clash font-bold text-[#08414a] select-none">
          <div ref={fourRef}
            className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[13rem] xl:text-[15rem]">
            4
          </div>
          <div ref={zeroRef}
            className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[13rem] xl:text-[15rem] text-[#019153]">
            0
          </div>
          <div ref={fourTwoRef}
            className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[13rem] xl:text-[15rem]">
            4
          </div>
        </div>

        <p
          ref={taglineRef}
          className="font-bold uppercase tracking-[0.18em] text-[#08414a] opacity-80
            text-xs sm:text-sm md:text-xl xl:text-2xl
            mt-2 sm:mt-3 md:mt-4 max-w-xl"
        >
          Looks like this page went off-grid.
          <br />
          <span className="opacity-60 tracking-[0.1em] normal-case font-semibold
            text-[10px] sm:text-xs md:text-base xl:text-lg mt-1 block">
            Even our best engineers couldn&apos;t find it at technoVIT&apos;26.
          </span>
        </p>

        <Link
          ref={btnRef}
          href="/"
          className="mt-6 sm:mt-8 md:mt-10 inline-block
            bg-[#064928] text-white font-semibold uppercase tracking-widest
            px-6 py-3 sm:px-8 sm:py-4
            text-xs sm:text-sm md:text-base
            hover:bg-[#019153] transition-colors duration-300
            border-2 border-transparent hover:border-[#84C87F]"
        >
          Back to Base Camp →
        </Link>
      </div>

      <div className="w-full pointer-events-none select-none shrink-0 -mt-10 sm:-mt-16 md:-mt-22 lg:-mt-28">
        <img
          src="/bg.svg"
          alt="Background landscape"
          className="w-full h-auto block"
        />
      </div>

    </section>
  );
}
