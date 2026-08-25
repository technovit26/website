'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Trash, UsersThree } from '@phosphor-icons/react';
import { emit, on } from '../hooks/useEventBus';
import { useLenis } from './SmoothScrolling';
import { playSound } from './SoundManager';
import MorphButton from './MorphButton';

interface TeamContext {
  eventName: string;
  teamSize: number;
}

type Status = 'idle' | 'submitting' | 'success';

const ERROR_MESSAGES: Record<string, string[]> = {
  bad_request: ["Fill in a team name and at least one teammate's username."],
  session_expired: ['Your session timed out. Sign in again to create a team.'],
  upstream_unreachable: ["VIT's servers are ghosting us right now. Try again in a bit."],
  upstream_rejected: ["VIT's servers said no to that one. Double-check the usernames."],
  unknown: ['Something broke on our end. Try again?'],
};

function pickMessage(code: string, fallback?: string) {
  if (fallback) return fallback;
  const pool = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.unknown;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function openTeamDialog(payload: TeamContext) {
  emit<TeamContext>('team:open', payload);
}

export default function TeamDialog() {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<TeamContext | null>(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      on<TeamContext>('team:open', (payload) => {
        playSound('toggle');
        setContext(payload ?? null);
        setOpen(true);
      }),
    []
  );

  const close = useCallback(() => {
    if (status === 'submitting') return;
    playSound('toggle');
    setOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setError(null);
      setTeamName('');
      setMembers(['']);
      setContext(null);
    }, 250);
  }, [status]);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const html = document.documentElement;
    const body = document.body;
    const oh = html.style.overflow;
    const ob = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      html.style.overflow = oh;
      body.style.overflow = ob;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, lenis, close]);

  const cap = Math.max(1, (context?.teamSize ?? 11) - 1);

  const updateMember = (i: number, value: string) => {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? value : m)));
  };

  const addMember = () => {
    setMembers((prev) => (prev.length < cap ? [...prev, ''] : prev));
  };

  const removeMember = (i: number) => {
    setMembers((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    const cleanMembers = members.map((m) => m.trim()).filter(Boolean);
    if (!teamName.trim() || cleanMembers.length === 0) {
      setError(pickMessage('bad_request'));
      return;
    }
    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/technovit/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim(), memberUsernames: cleanMembers }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        playSound('denied');
        setError(pickMessage(data.code ?? 'unknown', data.message));
        setStatus('idle');
        return;
      }
      playSound('play');
      setStatus('success');
      setTimeout(close, 900);
    } catch {
      playSound('denied');
      setError(pickMessage('upstream_unreachable'));
      setStatus('idle');
    }
  };

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={close}
        className={`fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        role="dialog"
        aria-hidden={!open}
        aria-label="Create a team"
        data-no-context-menu
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-[701] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] sm:w-[420px] max-w-[92vw]
          max-h-[88dvh] flex flex-col
          rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a]
          shadow-[0_0_0_1px_rgba(132,200,127,0.15),0_40px_100px_rgba(0,0,0,0.85)]
          transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="flex items-center px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 relative select-none shrink-0">
          <button
            onClick={close}
            aria-label="Close"
            data-cursor="Close"
            className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors"
          />
          <span className="absolute left-1/2 -translate-x-1/2 font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/50">
            team.sh
          </span>
        </div>

        <div className="terminal-scroll min-h-0 overflow-y-auto p-6 sm:p-7 flex flex-col gap-6">
          <div>
            <h2 className="font-clash font-bold text-[#c2e0a5] text-2xl">Build your team</h2>
            <p className="text-[#84C87F]/60 text-sm mt-1 leading-relaxed">
              {context
                ? `For ${context.eventName} — up to ${context.teamSize} members, including you.`
                : 'Add teammates by their registered usernames.'}
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/40">Team Name</span>
              <div className="flex items-center gap-2.5 rounded-lg border border-[#84C87F]/20 bg-[#080f09] px-4 py-3 focus-within:border-[#84C87F]/50 transition-colors">
                <UsersThree size={15} weight="bold" className="text-[#84C87F]/50 shrink-0" />
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={status !== 'idle'}
                  placeholder="e.g. Byte Force"
                  className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-[#c2e0a5] placeholder:text-[#84C87F]/30 font-terminal text-sm disabled:opacity-50"
                />
              </div>
            </label>

            <div className="flex flex-col gap-2">
              <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/40">
                Teammates (registered usernames)
              </span>
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2.5 rounded-lg border border-[#84C87F]/20 bg-[#080f09] px-4 py-3 focus-within:border-[#84C87F]/50 transition-colors">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => updateMember(i, e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={status !== 'idle'}
                      placeholder="e.g. 21BCE1234"
                      className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-[#c2e0a5] placeholder:text-[#84C87F]/30 font-terminal text-sm disabled:opacity-50"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      disabled={status !== 'idle'}
                      aria-label="Remove teammate"
                      data-cursor="Remove"
                      className="shrink-0 w-9 h-9 rounded-lg border border-[#84C87F]/20 text-[#84C87F]/50 hover:text-[#ff8a80] hover:border-[#ff8a80]/40 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
              {members.length < cap && (
                <button
                  type="button"
                  onClick={addMember}
                  disabled={status !== 'idle'}
                  data-cursor="Add"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#84C87F]/25 py-2.5
                    text-[#84C87F]/60 hover:text-[#84C87F] hover:border-[#84C87F]/50 font-terminal text-xs uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
                >
                  <Plus size={13} weight="bold" />
                  Add teammate
                </button>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-[#ff8a80]/30 bg-[#ff8a80]/5 px-3.5 py-2.5">
                    <span className="text-[#ff8a80] text-xs leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <MorphButton
              status={status === 'idle' ? 'idle' : status === 'submitting' ? 'busy' : 'success'}
              label="Create Team"
              type="submit"
              dataCursor="Create Team"
            />
          </form>
        </div>
      </div>
    </>
  );
}
