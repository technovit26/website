'use client';

import { useEffect, useRef } from 'react';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/** Calls `onSuccess` whenever the classic Konami sequence is typed anywhere on the page. */
export function useKonamiCode(onSuccess: () => void) {
  const progress = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress.current = [...progress.current, key].slice(-SEQUENCE.length);
      if (progress.current.length === SEQUENCE.length && progress.current.every((k, i) => k === SEQUENCE[i])) {
        progress.current = [];
        onSuccess();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSuccess]);
}
