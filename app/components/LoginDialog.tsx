'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeSlash, LockKey, User } from '@phosphor-icons/react';
import { emit, on } from '../hooks/useEventBus';
import type { AuthState } from '../hooks/useAuthState';
import { resetRegistrationCache } from '../hooks/useRegistrationData';
import { useLenis } from './SmoothScrolling';
import { playSound } from './SoundManager';
import MorphButton from './MorphButton';

type LoginKind = 'vitian' | 'non-vitian';
type Status = 'idle' | 'submitting' | 'success';

const ERROR_MESSAGES: Record<string, string[]> = {
  invalid_credentials: [
    "VIT has no idea who you are. Check your username and password.",
    "That combo doesn't check out over at VTOP.",
    "Nope — wrong username or password.",
  ],
  bad_request: ["Fill in both fields — we're not mind readers."],
  upstream_unreachable: [
    "VIT's servers are ghosting us right now. Try again in a bit.",
    "Couldn't reach mission control. Give it another shot.",
  ],
  unknown: ["Something broke on our end. Try again?"],
};

function pickMessage(code: string) {
  const pool = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.unknown;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function LoginDialog() {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<LoginKind>('vitian');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => on('login:open', () => {
    playSound('toggle');
    setOpen(true);
  }), []);

  const close = useCallback(() => {
    if (status === 'submitting') return;
    playSound('toggle');
    setOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setError(null);
      setUsername('');
      setPassword('');
      setShowPassword(false);
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

  const switchKind = (k: LoginKind) => {
    setKind(k);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    if (!username.trim() || !password) {
      setError(pickMessage('bad_request'));
      return;
    }
    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/technovit/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        playSound('denied');
        setError(pickMessage(data.code ?? 'unknown'));
        setStatus('idle');
        return;
      }
      playSound('play');
      setStatus('success');
      resetRegistrationCache();
      emit<AuthState>('auth:changed', { loggedIn: true, kind: data.kind, username: data.username });
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
        aria-label="Sign in"
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
            login.sh
          </span>
        </div>

        <div className="terminal-scroll min-h-0 overflow-y-auto p-6 sm:p-7 flex flex-col gap-6">
          <div>
            <h2 className="font-clash font-bold text-[#c2e0a5] text-3xl">Sign in</h2>
            <p className="text-[#84C87F]/60 text-base mt-1 leading-relaxed">
              Register and manage events without leaving the site.
            </p>
          </div>

          <div className="flex rounded-lg border border-[#84C87F]/20 overflow-hidden">
            {(['vitian', 'non-vitian'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => switchKind(k)}
                data-cursor="Select"
                className={`flex-1 py-2.5 font-terminal text-sm uppercase tracking-[0.15em] transition-colors ${
                  kind === k
                    ? 'bg-[#84C87F] text-[#064928] font-bold'
                    : 'bg-transparent text-[#84C87F]/60 hover:text-[#84C87F]'
                }`}
              >
                {k === 'vitian' ? 'VITian' : 'Non-VITian'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/40">
                {kind === 'vitian' ? 'VTOP Username' : 'Registered Email'}
              </span>
              <div className="flex items-center gap-2.5 rounded-lg border border-[#84C87F]/20 bg-[#080f09] px-4 py-3 focus-within:border-[#84C87F]/50 transition-colors">
                <User size={16} weight="bold" className="text-[#84C87F]/50 shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={status !== 'idle'}
                  placeholder={kind === 'vitian' ? 'USERNAME' : 'you@example.com'}
                  className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-[#c2e0a5] placeholder:text-[#84C87F]/30 font-terminal text-base disabled:opacity-50"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-terminal text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/40">Password</span>
              <div className="flex items-center gap-2.5 rounded-lg border border-[#84C87F]/20 bg-[#080f09] px-4 py-3 focus-within:border-[#84C87F]/50 transition-colors">
                <LockKey size={16} weight="bold" className="text-[#84C87F]/50 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={status !== 'idle'}
                  placeholder="••••••••"
                  className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-[#c2e0a5] placeholder:text-[#84C87F]/30 font-terminal text-base disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-cursor={showPassword ? 'Hide' : 'Show'}
                  className="shrink-0 text-[#84C87F]/50 hover:text-[#84C87F] transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                </button>
              </div>
            </label>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-[#ff8a80]/30 bg-[#ff8a80]/5 px-3.5 py-2.5">
                    <span className="text-[#ff8a80] text-sm leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <MorphButton
              status={status === 'idle' ? 'idle' : status === 'submitting' ? 'busy' : 'success'}
              label="Sign In"
              type="submit"
              dataCursor="Sign In"
            />
          </form>

          {kind === 'non-vitian' && (
            <p className="text-[#84C87F]/40 text-xs leading-relaxed border-t border-[#84C87F]/10 pt-4">
              First time here? Non-VITians need to create an account on the official portal before signing in.{' '}
              <a
                href="https://chennaievents.vit.ac.in/technovit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#84C87F] hover:text-[#c2e0a5] underline underline-offset-2"
              >
                Register there first ↗
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
