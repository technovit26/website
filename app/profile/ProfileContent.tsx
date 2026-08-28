'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CircleNotch, SignIn, WarningCircle } from '@phosphor-icons/react';
import { useAuthState, openLogin } from '../hooks/useAuthState';
import PayNowButton from '../components/PayNowButton';
import ContourBackdrop from '../components/ContourBackdrop';
import type { RegisteredEvent } from '../lib/technovit/parse';

type ProfileEvent = RegisteredEvent & { amount: number | null };
type Status = 'idle' | 'ready' | 'error';

const PAGE_SIZE = 5;

const NOTCH = (
  <>
    <span className="absolute left-1/2 -top-[7px] -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-[#064928]" />
    <span className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-[#064928]" />
  </>
);

function TicketRow({ event, index }: { event: ProfileEvent; index: number }) {
  return (
    <div
      className="relative flex rounded-lg overflow-hidden border border-[#84C87F]/20 bg-[#03080a]"
      style={{ boxShadow: '0 14px 34px rgba(0,0,0,0.3)' }}
    >
      <div className="flex-1 min-w-0 p-6 flex flex-col gap-2">
        <span className="font-terminal text-xs uppercase tracking-[0.2em] text-[#84C87F]/45">
          {event.orderId ? `Order #${event.orderId}` : `Ticket ${String(index + 1).padStart(2, '0')}`}
        </span>
        <h3 className="font-clash font-bold text-[#c2e0a5] text-xl sm:text-2xl leading-snug">{event.title}</h3>
        {event.meta && <p className="text-[#84C87F]/60 text-sm leading-relaxed">{event.meta}</p>}
      </div>

      <div className="relative w-0 shrink-0 border-l border-dashed border-[#84C87F]/25">{NOTCH}</div>

      <div className="w-40 sm:w-44 shrink-0 flex flex-col items-center justify-center gap-2.5 px-3 py-4 bg-[#080f09]">
        {event.paid ? (
          <span className="font-terminal text-sm uppercase tracking-[0.15em] text-[#84C87F]">Paid</span>
        ) : (
          <>
            <span className="font-terminal text-xs uppercase tracking-[0.15em] text-[#ff8a80]/85">
              Not yet paid
            </span>
            <PayNowButton compact href={event.payUrl} amount={event.amount} />
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfileContent() {
  const { loggedIn, username, checked } = useAuthState();
  const [status, setStatus] = useState<Status>('idle');
  const [events, setEvents] = useState<ProfileEvent[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!loggedIn) return;
    const controller = new AbortController();
    fetch('/api/technovit/profile', { signal: controller.signal })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setErrorCode(data.error ?? 'unknown');
          setStatus('error');
          return;
        }
        setEvents(data.events ?? []);
        setDisplayName(data.displayName ?? null);
        setStatus('ready');
        setPage(0);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setErrorCode('unknown');
        setStatus('error');
      });
    return () => {
      controller.abort();
    };
  }, [loggedIn]);

  const greetingName = displayName ?? username;
  const pageCount = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const pagedEvents = useMemo(
    () => events.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [events, page]
  );

  return (
    <main className="relative min-h-[100dvh] bg-[#064928] overflow-x-hidden">
      <ContourBackdrop />
      <div className="relative">
      <div className="bg-[#c2e0a5] px-5 sm:px-10 md:px-16 lg:px-24 pt-16 sm:pt-20 pb-16 sm:pb-20 flex justify-center">
        <div className="w-full max-w-4xl">
          <span className="font-terminal text-sm uppercase tracking-[0.3em] text-[#04331c]/50">
            boarding pass
          </span>
          <p className="font-clash font-bold text-[#04331c] text-5xl sm:text-6xl mt-2.5 leading-tight">
            {loggedIn && greetingName ? greetingName : 'Your registrations'}
          </p>
        </div>
      </div>
      <div className="px-5 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {!checked && (
            <div className="flex items-center justify-center gap-2 py-16 text-[#84C87F]/50">
              <CircleNotch size={18} weight="bold" className="animate-spin" />
              <span className="font-terminal text-sm uppercase tracking-[0.15em]">Checking your session…</span>
            </div>
          )}

          {checked && !loggedIn && (
            <div className="rounded-lg border border-[#84C87F]/20 bg-[#03080a] p-8 flex flex-col items-center gap-4 text-center">
              <p className="text-[#84C87F]/70 text-base max-w-sm">
                Sign in to see the events you&apos;ve registered for.
              </p>
              <button
                onClick={() => openLogin()}
                data-cursor="Login"
                className="flex items-center gap-2 rounded-full bg-[#84C87F] hover:bg-[#c2e0a5] text-[#064928]
                  font-clash font-bold uppercase tracking-[0.15em] text-sm px-6 py-3 transition-colors duration-300"
              >
                <SignIn size={16} weight="bold" />
                Login
              </button>
            </div>
          )}

          {loggedIn && status === 'idle' && (
            <div className="flex items-center justify-center gap-2 py-16 text-[#84C87F]/50">
              <CircleNotch size={18} weight="bold" className="animate-spin" />
              <span className="font-terminal text-sm uppercase tracking-[0.15em]">Loading your tickets…</span>
            </div>
          )}

          {loggedIn && status === 'error' && (
            <div className="rounded-lg border border-[#ff8a80]/30 bg-[#ff8a80]/5 p-6 flex flex-col items-center gap-3 text-center">
              <WarningCircle size={20} weight="bold" className="text-[#ff8a80]" />
              <p className="text-[#ff8a80] text-base">
                {errorCode === 'session_expired'
                  ? 'Your session timed out. Sign in again to see your profile.'
                  : "Couldn't load your profile right now. Try again in a moment."}
              </p>
              <button
                onClick={() => openLogin()}
                className="text-[#84C87F] text-sm font-terminal uppercase tracking-[0.15em] underline underline-offset-4 hover:text-[#c2e0a5] transition-colors"
              >
                Sign in again
              </button>
            </div>
          )}

          {loggedIn && status === 'ready' && events.length === 0 && (
            <div className="rounded-lg border border-[#84C87F]/20 bg-[#03080a] p-8 text-center">
              <p className="text-[#84C87F]/60 text-base mb-4">No tickets yet — nothing registered.</p>
              <Link
                href="/events"
                className="text-[#84C87F] text-sm font-terminal uppercase tracking-[0.15em] underline underline-offset-4 hover:text-[#c2e0a5] transition-colors"
              >
                Browse events →
              </Link>
            </div>
          )}

          {loggedIn && status === 'ready' && events.length > 0 && (
            <>
              <div className="flex flex-col gap-5">
                {pagedEvents.map((event, i) => (
                  <TicketRow key={event.orderId ?? page * PAGE_SIZE + i} event={event} index={page * PAGE_SIZE + i} />
                ))}
              </div>

              {pageCount > 1 && (
                <div className="mt-8 flex items-center justify-center gap-5">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Previous page"
                    data-cursor="Prev"
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-[#84C87F]/25 text-[#84C87F]
                      disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#84C87F]/60 hover:text-[#c2e0a5] transition-colors"
                  >
                    <ArrowLeft size={16} weight="bold" />
                  </button>
                  <span className="font-terminal text-xs uppercase tracking-[0.15em] text-[#84C87F]/60">
                    {page + 1} / {pageCount}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page === pageCount - 1}
                    aria-label="Next page"
                    data-cursor="Next"
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-[#84C87F]/25 text-[#84C87F]
                      disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#84C87F]/60 hover:text-[#c2e0a5] transition-colors"
                  >
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
