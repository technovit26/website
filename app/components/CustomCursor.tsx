'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'motion/react';

let lastX = 0;
let lastY = 0;
let initialized = false;

const RING_SPRING = { stiffness: 220, damping: 20, mass: 0.6 };
const HOVER_SELECTOR = 'a, button, [role="button"]';

export default function CustomCursor() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(mouseX, RING_SPRING);
  const ringY = useSpring(mouseY, RING_SPRING);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setHidden(true);
      return;
    }

    if (!initialized) {
      lastX = window.innerWidth / 2;
      lastY = window.innerHeight / 2;
      initialized = true;
    }
    mouseX.set(lastX);
    mouseY.set(lastY);

    // Read the actual element under the pointer on every move instead of tracking
    // mouseenter/mouseleave pairs — those get stuck "hovering" when a hovered
    // element (e.g. a menu item) is removed from the DOM without firing mouseleave.
    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      mouseX.set(lastX);
      mouseY.set(lastY);

      const target = document.elementFromPoint(e.clientX, e.clientY);
      setHovering(!!target?.closest(HOVER_SELECTOR));
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [mouseX, mouseY]);

  // A route change (e.g. via a link whose element just got unmounted) can leave
  // hover state stuck with no further mousemove to self-correct it — reset explicitly.
  useEffect(() => {
    setHovering(false);
  }, [pathname]);

  if (hidden) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999]"
        style={{
          x: mouseX,
          y: mouseY,
          translate: '-50% -50%',
          width: 8,
          height: 8,
          backgroundColor: '#ffffff',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
        animate={{ scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999998]"
        style={{
          x: ringX,
          y: ringY,
          translate: '-50% -50%',
          width: 32,
          height: 32,
          border: '2px solid #84C87F99',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
        animate={{
          scale: hovering ? 2.2 : 1,
          borderColor: hovering ? '#84C87F' : '#84C87F99',
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </>
  );
}
