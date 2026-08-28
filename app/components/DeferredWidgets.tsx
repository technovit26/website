'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const TrailerModal = dynamic(() => import('./TrailerModal'), { ssr: false });
const ContextMenu = dynamic(() => import('./ContextMenu'), { ssr: false });
const Terminal = dynamic(() => import('./Terminal'), { ssr: false });
const Konami = dynamic(() => import('./Konami'), { ssr: false });
const QuestionMark = dynamic(() => import('./QuestionMark'), { ssr: false });
const EggMaster = dynamic(() => import('./EggMaster'), { ssr: false });
const ConsoleEgg = dynamic(() => import('./ConsoleEgg'), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function DeferredWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  return (
    <>
      <TrailerModal />
      <ContextMenu />
      <Terminal />
      <Konami />
      <QuestionMark />
      <EggMaster />
      <ConsoleEgg />
    </>
  );
}
