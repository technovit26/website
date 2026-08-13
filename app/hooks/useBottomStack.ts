'use client';

import { useEffect, useState } from 'react';
import { emit, on } from './useEventBus';


const STACK_GAP = 12;

type PushPayload = { anchor: string; amount: number };
type PopPayload = { anchor: string };

export function useStackPush(anchor: string, active: boolean, amount: number) {
  useEffect(() => {
    if (!active) return;
    emit<PushPayload>('stack:push', { anchor, amount: amount + STACK_GAP });
    return () => emit<PopPayload>('stack:pop', { anchor });
  }, [anchor, active, amount]);
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
