'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { setCursorMode, subscribeCursorMode, type CursorMode } from '../hooks/useCursorMode';

let lastX = 0;
let lastY = 0;
let initialized = false;

const RING_SPRING = { stiffness: 220, damping: 20, mass: 0.6 };
const HOVER_SELECTOR = 'a, button, [role="button"]';

const TRAIL_SPRINGS = [
  { stiffness: 260, damping: 22, mass: 0.4 },
  { stiffness: 230, damping: 22, mass: 0.45 },
  { stiffness: 200, damping: 23, mass: 0.5 },
  { stiffness: 170, damping: 23, mass: 0.55 },
  { stiffness: 140, damping: 24, mass: 0.6 },
  { stiffness: 110, damping: 24, mass: 0.65 },
];
const TRAIL_SIZES = [6, 5, 5, 4, 3, 2];
const TRAIL_OPACITIES = [0.45, 0.35, 0.28, 0.2, 0.13, 0.07];

export default function CustomCursor() {
  const pathname = usePathname();
  const [hidden] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const [hovering, setHovering] = useState(false);
  const [mode, setMode] = useState<CursorMode>('');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(mouseX, RING_SPRING);
  const ringY = useSpring(mouseY, RING_SPRING);

  const t1x = useSpring(mouseX, TRAIL_SPRINGS[0]);
  const t1y = useSpring(mouseY, TRAIL_SPRINGS[0]);
  const t2x = useSpring(t1x, TRAIL_SPRINGS[1]);
  const t2y = useSpring(t1y, TRAIL_SPRINGS[1]);
  const t3x = useSpring(t2x, TRAIL_SPRINGS[2]);
  const t3y = useSpring(t2y, TRAIL_SPRINGS[2]);
  const t4x = useSpring(t3x, TRAIL_SPRINGS[3]);
  const t4y = useSpring(t3y, TRAIL_SPRINGS[3]);
  const t5x = useSpring(t4x, TRAIL_SPRINGS[4]);
  const t5y = useSpring(t4y, TRAIL_SPRINGS[4]);
  const t6x = useSpring(t5x, TRAIL_SPRINGS[5]);
  const t6y = useSpring(t5y, TRAIL_SPRINGS[5]);
  const trail = [
    [t1x, t1y],
    [t2x, t2y],
    [t3x, t3y],
    [t4x, t4y],
    [t5x, t5y],
    [t6x, t6y],
  ] as const;

  useEffect(() => {
    if (hidden) return;

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

      const target = document.elementFromPoint(e.clientX, e.clientY);
      setHovering(!!target?.closest(HOVER_SELECTOR));

      const cursorEl = target?.closest<HTMLElement>('[data-cursor]');
      setCursorMode(cursorEl?.dataset.cursor ?? '');
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [hidden, mouseX, mouseY]);

  useEffect(() => subscribeCursorMode(setMode), []);

  useEffect(() => {
    queueMicrotask(() => {
      setHovering(false);
      setCursorMode('');
    });
  }, [pathname]);

  if (hidden) return null;

  return (
    <>
      {trail.map(([x, y], i) => (
        <motion.div
          key={i}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-[999997]"
          style={{
            x,
            y,
            translate: '-50% -50%',
            width: TRAIL_SIZES[i],
            height: TRAIL_SIZES[i],
            backgroundColor: '#84C87F',
            opacity: TRAIL_OPACITIES[i],
            mixBlendMode: 'screen',
            willChange: 'transform',
          }}
        />
      ))}
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
      <AnimatePresence>
        {mode && (
          <motion.div
            key={mode}
            className="fixed top-0 left-0 pointer-events-none z-[999999] whitespace-nowrap
              rounded-full border border-[#84C87F]/40 bg-[#064928] px-2 py-1
              text-[10px] font-bold uppercase tracking-[0.15em] text-[#84C87F]"
            style={{ x: mouseX, y: mouseY, translate: '16px 16px', willChange: 'transform' }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
          >
            {mode}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
