import type { Sponsor } from './data';

export default function SponsorCard({ sponsor, tag }: { sponsor: Sponsor; tag: string }) {
  return (
    <div
      className="sponsor-card group relative flex flex-col overflow-hidden rounded-lg
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

      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#080f09] flex items-center justify-center">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            loading="lazy"
            className="max-h-[60%] max-w-[70%] object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-[#84C87F]/25 mx-6 px-6 py-5">
            <span className="font-terminal text-[9px] uppercase tracking-[0.25em] text-[#84C87F]/40">
              Logo Pending
            </span>
            <span className="font-clash font-bold text-[#84C87F]/20 text-2xl leading-none text-center">
              {sponsor.name}
            </span>
          </div>
        )}
        <div aria-hidden className="terminal-scanlines opacity-30 group-hover:opacity-0 transition-opacity duration-700" />
      </div>

      <div className="flex flex-col items-center gap-1 px-4 py-3.5 text-center">
        <h3 className="font-clash font-bold text-[#c2e0a5] text-lg leading-tight">{sponsor.name}</h3>
        {sponsor.tagline && (
          <span className="font-bold uppercase tracking-[0.15em] text-[#84C87F]/60 text-[10px]">
            {sponsor.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
