import { Sparkle } from '@phosphor-icons/react';
import type { Speaker } from './data';

function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => !/^(mr\.?|mrs\.?|ms\.?|dr\.?)$/i.test(p));
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function SpeakerCard({ speaker, tag }: { speaker: Speaker; tag: string }) {
  return (
    <div
      className="speaker-card group relative flex flex-col overflow-hidden rounded-lg
        border border-[#84C87F]/20 bg-[#03080a] isolate transition-colors duration-300 hover:border-[#84C87F]/50"
      style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.08), 0 20px 50px rgba(0,0,0,0.35)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-[#080f09] border-b border-[#84C87F]/10 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F56]/70" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#FFBD2E]/70" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#27C93F]/70" />
        </div>
        <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/50">
          {tag}
        </span>
      </div>

      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#080f09]">
        {speaker.photoUrl ? (
          <img
            src={speaker.photoUrl}
            alt={speaker.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover contrast-110"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#080f09]">
            <span
              className="font-clash font-bold text-[#84C87F]/15 group-hover:text-[#84C87F]/25
                transition-colors duration-500 leading-none text-6xl"
            >
              {initialsOf(speaker.name)}
            </span>
            <span className="font-terminal text-[9px] uppercase tracking-[0.25em] text-[#84C87F]/25">
              Photo Pending
            </span>
          </div>
        )}
        <div aria-hidden className="terminal-scanlines opacity-30 group-hover:opacity-0 transition-opacity duration-700" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[#84C87F] px-2.5 py-1">
          <Sparkle size={11} weight="fill" className="text-[#064928]" />
          <span className="font-bold uppercase tracking-[0.15em] text-[9px] text-[#064928]">
            {speaker.role}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-4 py-3.5">
        <h3 className="font-clash font-bold text-[#c2e0a5] text-xl leading-tight">{speaker.name}</h3>
        <span className="font-bold uppercase tracking-[0.15em] text-[#84C87F]/70 text-[11px] leading-snug">
          {speaker.designation}
        </span>
        <span className="text-[#c2e0a5]/70 text-sm leading-snug">{speaker.organization}</span>

        {speaker.extra && speaker.extra.length > 0 && (
          <ul className="mt-1.5 flex flex-col gap-1 border-t border-[#84C87F]/10 pt-2">
            {speaker.extra.map((line) => (
              <li key={line} className="flex gap-1.5 text-[#84C87F]/60 text-xs leading-relaxed">
                <span className="text-[#84C87F]/40">&rsaquo;</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
