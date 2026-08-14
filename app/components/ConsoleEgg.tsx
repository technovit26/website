'use client';

import { useEffect } from 'react';

export default function ConsoleEgg() {
  useEffect(() => {
    console.log(
      "%cTechnoVIT'26",
      'color:#84C87F;font-weight:bold;font-size:22px;font-family:sans-serif;'
    );
    console.log(
      '%cLooking around, huh? Try the Konami code.',
      'color:#84C87F;font-size:12px;line-height:1.6;font-family:monospace;'
    );
  }, []);

  return null;
}
