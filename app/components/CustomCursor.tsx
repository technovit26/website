'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

let lastX = 0;
let lastY = 0;
let initialized = false;

const RING_SPRING = { stiffness: 220, damping: 20, mass: 0.6 };

export default function CustomCursor() {
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

    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      mouseX.set(lastX);
      mouseY.set(lastY);
    };

    const onMouseEnterLink = () => setHovering(true);
    const onMouseLeaveLink = () => setHovering(false);

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
  }, [mouseX, mouseY]);

  if (hidden) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
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
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
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
