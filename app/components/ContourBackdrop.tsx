'use client';

import { useEffect, useRef } from 'react';

const BG = '#064928';
const GREEN = '#84C87F';
const CELL_W = 12;
const CELL_H = 18;
const CHARS = ['_', '.', '-', '~', '=', '‾'];
const DRIFT_FPS = 12;
const SCROLL_FPS = 30;
const LINE_ALPHA = 0.3;
const VUNIT = 900;

export default function ContourBackdrop() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fam = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-terminal')
      .trim();
    const font = `${CELL_H - 4}px ${fam || 'ui-monospace'}, monospace`;

    let cssW = 0;
    let cssH = 0;
    let cols = 0;
    let rows = 0;
    let translateY = 0;
    let docY0 = 0;
    let drawnAtY = -1e9;
    let drawnAtT = -1e9;

    const measure = () => {
      cssW = wrap.clientWidth;
      cssH = Math.min(wrap.clientHeight, window.innerHeight + CELL_H * 6);
      canvas.width = Math.max(1, cssW);
      canvas.height = Math.max(1, cssH);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.font = font;
      ctx.textBaseline = 'top';
      cols = Math.ceil(cssW / CELL_W) + 1;
      rows = Math.ceil(cssH / CELL_H) + 1;
      drawnAtY = -1e9;
      drawnAtT = -1e9;
    };

    const trackScroll = () => {
      const top = wrap.getBoundingClientRect().top;
      const maxT = Math.max(0, wrap.clientHeight - cssH);
      const ty = Math.min(maxT, Math.max(0, -top));
      if (ty !== translateY) {
        translateY = ty;
        canvas.style.transform = `translate3d(0, ${ty}px, 0)`;
      }
      docY0 = window.scrollY + top + translateY;
    };

    const draw = (t: number) => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.fillStyle = GREEN;
      ctx.globalAlpha = LINE_ALPHA;
      for (let x = 0; x < cols; x++) {
        const fx = x / cols;
        const phase = fx * 6 + t * 0.15;
        const ax = Math.sin(phase);
        const bx = Math.sin(fx * 3) * 2;
        const px = fx * 13 + t * 0.1;
        const ci = Math.max(
          0,
          Math.min(
            CHARS.length - 1,
            Math.round(((Math.cos(phase) * 6 + 6) / 12) * (CHARS.length - 1))
          )
        );
        const ch = CHARS[ci];
        for (let y = 0; y < rows; y++) {
          const fy = (docY0 + y * CELL_H) / VUNIT;
          const v = ax * 1.4 + Math.sin(px - fy * 3) * 0.6 + Math.cos(fy * 5 + bx) * 1.2;
          const band = v * 3;
          const frac = band - Math.floor(band);
          if (frac < 0.12 || frac > 0.88) ctx.fillText(ch, x * CELL_W, y * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
    };

    measure();
    const t0 = performance.now();
    trackScroll();
    draw(0);

    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener('resize', measure);

    if (reduced) {
      let rafR = 0;
      const onScroll = () => {
        cancelAnimationFrame(rafR);
        rafR = requestAnimationFrame(() => {
          const before = translateY;
          trackScroll();
          if (translateY !== before) draw(0);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', measure);
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(rafR);
      };
    }

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      trackScroll();
      const scrolled = translateY !== drawnAtY;
      const minGap = 1000 / (scrolled ? SCROLL_FPS : DRIFT_FPS);
      if (now - drawnAtT < minGap) return;
      drawnAtY = translateY;
      drawnAtT = now;
      draw((now - t0) / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div aria-hidden ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute left-0 top-0 block will-change-transform" />
    </div>
  );
}
