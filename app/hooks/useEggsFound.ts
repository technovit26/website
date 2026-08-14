'use client';

import { useEffect, useState } from 'react';
import { emit, on } from './useEventBus';

export const KONAMI_EGG_KEY = 'technovit_konami_unlocked';
export const TERMINAL_EGG_KEY = 'technovit_terminal_seen';
export const CONTEXT_MENU_EGG_KEY = 'technovit_ctx_hint_seen';
export const ABOUT_EGG_KEY = 'technovit_about_egg_seen';
export const GALLERY_EGG_KEY = 'technovit_gallery_egg_seen';

export const EGG_KEYS = [KONAMI_EGG_KEY, TERMINAL_EGG_KEY, CONTEXT_MENU_EGG_KEY, ABOUT_EGG_KEY, GALLERY_EGG_KEY] as const;
export type EggKey = (typeof EGG_KEYS)[number];

export type EggFoundPayload = { key: EggKey; count: number };

function countFound(): number {
  try {
    return EGG_KEYS.filter((k) => !!localStorage.getItem(k)).length;
  } catch {
    return 0;
  }
}

export function markEggFound(key: EggKey) {
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
  } catch {}
  emit<EggFoundPayload>('egg:found', { key, count: countFound() });
}

export function useEggsFound() {
  const [found, setFound] = useState(0);

  useEffect(() => {
    queueMicrotask(() => setFound(countFound()));
    return on<EggFoundPayload>('egg:found', (p) => setFound(p.count));
  }, []);

  return { found, total: EGG_KEYS.length, allFound: found >= EGG_KEYS.length };
}
