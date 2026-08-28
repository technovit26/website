'use client';

import { useEffect } from 'react';

export default function NativeCursorPreview() {
  useEffect(() => {
    document.body.classList.add('native-cursor');
    return () => document.body.classList.remove('native-cursor');
  }, []);
  return null;
}
