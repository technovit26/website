'use client';

import { formatPrice } from './data';

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const span = Math.max(max - min, 1);
  const step = span > 100 ? 10 : 5;
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  const handleLo = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([Math.min(Number(e.target.value), hi), hi]);
  };
  const handleHi = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([lo, Math.max(Number(e.target.value), lo)]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-terminal text-[9px] uppercase tracking-[0.25em] text-[#84C87F]/40">Entry Fee</span>
        <span className="font-terminal text-xs font-semibold text-[#c2e0a5]">
          {formatPrice(lo)} – {formatPrice(hi)}
        </span>
      </div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#84C87F]/15" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#84C87F]"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLo}
          className="dual-range absolute inset-0 pointer-events-none"
          style={{ zIndex: loPct > 50 ? 3 : 2 }}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHi}
          className="dual-range absolute inset-0 pointer-events-none"
          style={{ zIndex: loPct > 50 ? 2 : 3 }}
        />
      </div>
    </div>
  );
}
