'use client';

import { useEffect, useRef, useState } from 'react';
import { emit, on } from './useEventBus';

export const STACK_GAP = 12;

type PushPayload = { anchor: string; amount: number };
type PopPayload = { anchor: string };

export function useStackPush<T extends HTMLElement>(anchor: string, active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const report = () => emit<PushPayload>('stack:push', { anchor, amount: el.offsetHeight + STACK_GAP });
    report();

    const observer = new ResizeObserver(report);
    observer.observe(el);

    return () => {
      observer.disconnect();
      emit<PopPayload>('stack:pop', { anchor });
    };
  }, [anchor, active]);

  return ref;
}

export function useStackOffset(anchor: string) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const unsubPush = on<PushPayload>('stack:push', (p) => {
      if (p.anchor === anchor) setOffset(p.amount);
    });
    const unsubPop = on<PopPayload>('stack:pop', (p) => {
      if (p.anchor === anchor) setOffset(0);
    });
    return () => {
      unsubPush();
      unsubPop();
    };
  }, [anchor]);
  return offset;
}

type HeightPayload = { anchor: string; height: number };

// The bus has no replay, and the widgets that read these heights are lazy —
// they mount long after the anchors broadcast. Keep the last value so a late
// subscriber starts from the truth instead of zero.
const lastHeights = new Map<string, number>();

export function useBroadcastHeight<T extends HTMLElement>(anchor: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => {
      lastHeights.set(anchor, el.offsetHeight);
      emit<HeightPayload>('rect:height', { anchor, height: el.offsetHeight });
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchor]);
  return ref;
}

export function useElementHeight(anchor: string) {
  const [height, setHeight] = useState(() => lastHeights.get(anchor) ?? 0);
  useEffect(
    () =>
      on<HeightPayload>('rect:height', (p) => {
        if (p.anchor === anchor) setHeight(p.height);
      }),
    [anchor]
  );
  return height;
}
