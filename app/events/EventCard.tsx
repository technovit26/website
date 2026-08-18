import { CalendarBlank, MapPin, Sparkle, UsersThree } from '@phosphor-icons/react';
import { formatEventWindow, formatPrice, posterUrl, type EventItem } from './data';

export default function EventCard({
  event,
  onOpen,
  className = 'w-[420px] sm:w-[540px] h-[260px] sm:h-[320px] shrink-0',
}: {
  event: EventItem;
  onOpen: (event: EventItem) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => onOpen(event)}
      data-cursor="View"
      className={`group relative flex text-left overflow-hidden rounded-lg
        border border-[#84C87F]/30 bg-[#03080a] transition-colors duration-300 hover:border-[#84C87F]/60 ${className}`}
      style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.12), 0 24px 60px rgba(0,0,0,0.45), 0 0 50px rgba(132,200,127,0.10)' }}
    >
      <div className="relative h-full w-[150px] sm:w-[200px] shrink-0 overflow-hidden">
        <img
          src={posterUrl(event.posterPath)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div aria-hidden className="terminal-scanlines opacity-30" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {event.isSpecialEvent && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[#84C87F] px-2.5 py-1">
            <Sparkle size={11} weight="fill" className="text-[#064928]" />
            <span className="font-bold uppercase tracking-[0.15em] text-[9px] text-[#064928]">Flagship</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between p-4 sm:p-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/50 truncate">
            {event.clubName}
          </span>
          <h3 className="font-clash font-bold text-[#c2e0a5] text-xl sm:text-2xl leading-tight line-clamp-2">
            {event.eventName}
          </h3>
          <p className="text-[#84C87F]/70 text-sm leading-relaxed line-clamp-3 mt-1">{event.shortDescription}</p>
        </div>

        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#84C87F]/10">
          <div className="flex items-center gap-2 text-[#84C87F]/60 text-xs min-w-0">
            <CalendarBlank size={13} weight="bold" className="shrink-0" />
            <span className="truncate">{formatEventWindow(event.startDateTime, event.endDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#84C87F]/60 text-xs min-w-0">
            <MapPin size={13} weight="bold" className="shrink-0" />
            <span className="truncate">{event.eventVenue}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#84C87F]/60 text-xs">
              <UsersThree size={13} weight="bold" className="shrink-0" />
              <span>{event.participationType}{event.participationType === 'Team' ? ` · up to ${event.teamSize}` : ''}</span>
            </div>
            <span className="font-clash font-bold text-[#84C87F] text-sm">{formatPrice(event.pricePerPerson)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
