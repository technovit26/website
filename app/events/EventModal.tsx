'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarBlank,
  CurrencyInr,
  Envelope,
  GraduationCap,
  MapPin,
  Phone,
  Sparkle,
  Ticket,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import { useLenis } from '../components/SmoothScrolling';
import { formatEventWindow, formatPrice, posterUrl, type EventItem } from './data';

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[#84C87F]/70 mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/40">{label}</span>
        <span className="text-[#c2e0a5] text-sm font-semibold truncate">{value}</span>
      </div>
    </div>
  );
}

export default function EventModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const lenis = useLenis();
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setFlash(false), 180);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const body = document.body;
    const oh = html.style.overflow;
    const ob = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      window.removeEventListener('keydown', onKey);
      html.style.overflow = oh;
      body.style.overflow = ob;
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
      data-no-context-menu
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a]
          w-full max-w-2xl max-h-[88dvh] flex flex-col"
        style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.15), 0 40px 100px rgba(0,0,0,0.85)' }}
      >
        <div className="relative flex items-center px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 select-none shrink-0">
          <button
            onClick={onClose}
            aria-label="Close"
            data-cursor="Close"
            className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors shrink-0"
          />
          <span className="absolute left-1/2 -translate-x-1/2 font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/50 truncate max-w-[70%]">
            {event.id}.sh · details
          </span>
        </div>

        <div className="flex gap-4 sm:gap-5 px-5 sm:px-7 pt-6 sm:pt-7 shrink-0">
          <div className="relative w-24 sm:w-32 md:w-36 aspect-[3/4] shrink-0 overflow-hidden rounded-md border border-[#84C87F]/15">
            <img
              src={posterUrl(event.posterPath)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div aria-hidden className="terminal-scanlines opacity-25" />
            {flash && (
              <motion.div
                aria-hidden
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute inset-0 bg-white pointer-events-none"
              />
            )}
          </div>

          <div className="flex flex-col justify-center gap-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/50">
                {event.clubName}
              </span>
              {event.isSpecialEvent && (
                <span className="flex items-center gap-1 rounded-full bg-[#84C87F] px-2 py-0.5">
                  <Sparkle size={9} weight="fill" className="text-[#064928]" />
                  <span className="font-bold uppercase tracking-[0.15em] text-[8px] text-[#064928]">Flagship</span>
                </span>
              )}
            </div>
            <h2 className="font-clash font-bold text-[#c2e0a5] text-xl sm:text-2xl md:text-3xl leading-tight">
              {event.eventName}
            </h2>
          </div>
        </div>

        <div className="terminal-scroll flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-4" data-lenis-prevent>
          <p className="text-[#84C87F]/80 text-sm sm:text-[15px] leading-relaxed">{event.longDescription}</p>
        </div>

        <div className="px-5 sm:px-7 pb-6 sm:pb-7 shrink-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-5 py-5 border-y border-[#84C87F]/10 mb-6">
            <MetaRow icon={<CalendarBlank size={15} weight="bold" />} label="When" value={formatEventWindow(event.startDateTime, event.endDateTime)} />
            <MetaRow icon={<MapPin size={15} weight="bold" />} label="Venue" value={event.eventVenue} />
            <MetaRow
              icon={<UsersThree size={15} weight="bold" />}
              label="Participation"
              value={`${event.participationType}${event.participationType === 'Team' ? ` · up to ${event.teamSize}` : ''}`}
            />
            <MetaRow icon={<CurrencyInr size={15} weight="bold" />} label="Entry Fee" value={formatPrice(event.pricePerPerson)} />
            <MetaRow icon={<Ticket size={15} weight="bold" />} label="Event Type" value={event.eventType} />
            <MetaRow icon={<GraduationCap size={15} weight="bold" />} label="Open To" value={event.eventFor} />
          </div>

          {event.facultyCoordName && (
            <div className="flex flex-col gap-2 mb-6">
              <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/40">Faculty Coordinator</span>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-[#c2e0a5] text-sm font-semibold">{event.facultyCoordName}</span>
                {event.facultyCoordEmail && (
                  <a href={`mailto:${event.facultyCoordEmail}`} data-cursor="Email" className="flex items-center gap-1.5 text-[#84C87F]/70 hover:text-[#84C87F] text-xs transition-colors">
                    <Envelope size={13} weight="bold" />
                    {event.facultyCoordEmail}
                  </a>
                )}
                {event.facultyCoordMobile && (
                  <a href={`tel:${event.facultyCoordMobile}`} data-cursor="Call" className="flex items-center gap-1.5 text-[#84C87F]/70 hover:text-[#84C87F] text-xs transition-colors">
                    <Phone size={13} weight="bold" />
                    {event.facultyCoordMobile}
                  </a>
                )}
              </div>
            </div>
          )}

          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Register"
            className="group flex items-center justify-center gap-3 w-full rounded-full bg-[#84C87F] hover:bg-[#c2e0a5]
              text-[#064928] font-clash font-bold uppercase tracking-[0.15em] text-sm py-3.5 transition-colors duration-300"
          >
            Register Now
          </a>
        </div>
      </motion.div>

      <button
        onClick={onClose}
        aria-label="Close"
        data-cursor="Close"
        className="absolute top-5 right-5 sm:top-8 sm:right-8 w-10 h-10 rounded-full border border-[#84C87F]/30
          bg-[#064928] text-[#84C87F] flex items-center justify-center hover:bg-[#84C87F] hover:text-[#064928] transition-colors"
      >
        <X size={16} weight="bold" />
      </button>
    </motion.div>
  );
}
