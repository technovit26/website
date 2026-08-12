'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

let lastX = 0;
let lastY = 0;
let initialized = false;

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;


    if (window.matchMedia('(pointer: coarse)').matches) {
      gsap.set([dot, ring], { display: 'none' });
      return;
    }


    if (!initialized) {
      lastX = window.innerWidth / 2;
      lastY = window.innerHeight / 2;
      initialized = true;
    }
    gsap.set([dot, ring], { x: lastX, y: lastY });


    const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.06, ease: 'none' });
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.06, ease: 'none' });
    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.18, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.18, ease: 'power3.out' });

    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      moveDotX(lastX);
      moveDotY(lastY);
      moveRingX(lastX);
      moveRingY(lastY);
    };


    const onMouseEnterLink = () => {
      gsap.to(ring, { scale: 2.2, borderColor: '#84C87F', duration: 0.25, ease: 'power2.out' });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };
    const onMouseLeaveLink = () => {
      gsap.to(ring, { scale: 1, borderColor: '#84C87F99', duration: 0.25, ease: 'power2.out' });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    const addHoverListeners = () => {
      document
        .querySelectorAll('a, button, [role="button"]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onMouseEnterLink);
          el.addEventListener('mouseleave', onMouseLeaveLink);
        });
    };

    window.addEventListener('mousemove', onMouseMove);
    addHoverListeners();


    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>

      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 8,
          height: 8,
          borderRadius: 0,
          backgroundColor: '#ffffff',
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width: 32,
          height: 32,
          borderRadius: 0,
          border: '2px solid #ffffff',
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;
