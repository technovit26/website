'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, CircleNotch, CheckCircle } from '@phosphor-icons/react';
import { useAuthState, openLogin } from '../hooks/useAuthState';
import { useRegistrationData, markRegisteredLocally } from '../hooks/useRegistrationData';
import MorphButton from '../components/MorphButton';
import { openTeamDialog } from '../components/TeamDialog';
import { playSound } from '../components/SoundManager';
import type { EventItem } from './data';

type RegisterStatus = 'idle' | 'busy' | 'success' | 'pay';

const ERROR_MESSAGES: Record<string, string[]> = {
  session_expired: [
    'Your session timed out. Sign in again to register.',
    "VIT logged you out behind your back. Sign in again.",
  ],
  upstream_unreachable: ["VIT's servers are ghosting us right now. Try again in a bit."],
  unknown: ['Something broke on our end. Try again?'],
};

function pickMessage(code: string) {
  const pool = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.unknown;
  return pool[Math.floor(Math.random() * pool.length)];
}

const CTA_CLASS =
  'group flex items-center justify-center gap-3 w-full rounded-full bg-[#84C87F] hover:bg-[#c2e0a5] text-[#064928] font-clash font-bold uppercase tracking-[0.15em] text-sm py-3.5 transition-colors duration-300';

function RegisterMorphButton({
  status,
  onRegister,
  onGoToProfile,
}: {
  status: RegisterStatus;
  onRegister: () => void;
  onGoToProfile: () => void;
}) {
  const expanded = status === 'idle' || status === 'pay';

  return (
    <div className="flex justify-center">
      <motion.button
        type="button"
        onClick={status === 'idle' ? onRegister : status === 'pay' ? onGoToProfile : undefined}
        whileTap={expanded ? { scale: 0.94 } : undefined}
        animate={{ width: expanded ? '100%' : 52 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        disabled={status === 'busy'}
        data-cursor={status === 'idle' ? 'Register' : status === 'pay' ? 'Continue in Profile' : undefined}
        className="flex items-center justify-center gap-2 h-[52px] rounded-full bg-[#84C87F] hover:bg-[#c2e0a5]
          text-[#064928] font-clash font-bold uppercase tracking-[0.15em] text-sm transition-colors duration-300"
      >
        <AnimatePresence mode="wait">
          {status === 'busy' && (
            <motion.span
              key="spin"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
            >
              <CircleNotch size={18} weight="bold" className="animate-spin" />
            </motion.span>
          )}
          {status === 'success' && (
            <motion.span key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Check size={18} weight="bold" />
            </motion.span>
          )}
          {status === 'idle' && (
            <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Register Now
            </motion.span>
          )}
          {status === 'pay' && (
            <motion.span
              key="pay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              Continue in Profile to Pay
              <ArrowRight size={14} weight="bold" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

export default function RegisterAction({ event }: { event: EventItem }) {
  const { loggedIn } = useAuthState();
  const router = useRouter();
  const registrationData = useRegistrationData(loggedIn);
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const isCompleted = new Date(event.endDateTime).getTime() < now;

  const upstreamEventId = registrationData?.matched[event.id] ?? null;
  const registeredInfo = registrationData?.registered[event.id] ?? null;
  const matchStatus: 'idle' | 'matched' | 'unmatched' = !registrationData
    ? 'idle'
    : upstreamEventId
      ? 'matched'
      : 'unmatched';

  const handleRegister = async () => {
    if (!upstreamEventId || registerStatus !== 'idle') return;
    setRegisterStatus('busy');
    setMessage(null);
    try {
      const res = await fetch('/api/technovit/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upstreamEventId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        playSound('denied');
        setRegisterStatus('idle');
        setMessage(pickMessage(data.code ?? 'unknown'));
        return;
      }
      playSound('play');
      setRegisterStatus('success');
      setMessage(`You're in — pay ₹${event.pricePerPerson} in your profile to lock in your spot.`);
      markRegisteredLocally(event.id, { paid: false, amount: event.pricePerPerson, payUrl: null });
      setTimeout(() => setRegisterStatus('pay'), 900);
    } catch {
      playSound('denied');
      setRegisterStatus('idle');
      setMessage(pickMessage('upstream_unreachable'));
    }
  };

  if (isCompleted) {
    return (
      <div
        className="flex items-center justify-center gap-2.5 w-full rounded-full border border-[#84C87F]/20
          text-[#84C87F]/50 font-clash font-bold uppercase tracking-[0.15em] text-sm py-3.5"
      >
        <CheckCircle size={18} weight="bold" />
        Event Completed
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <button type="button" onClick={() => openLogin()} data-cursor="Register" className={CTA_CLASS}>
        Register Now
      </button>
    );
  }

  if (matchStatus === 'idle') {
    return <MorphButton status="busy" label="Register Now" dataCursor="Register" />;
  }

  if (matchStatus === 'unmatched') {
    return (
      <a
        href={event.registrationLink}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Register"
        className={CTA_CLASS}
      >
        Register Now
      </a>
    );
  }

  if (registeredInfo && registerStatus === 'idle') {
    return (
      <div className="flex flex-col gap-3">
        {registeredInfo.paid ? (
          <div
            className="flex items-center justify-center gap-2.5 w-full rounded-full border border-[#84C87F]/30
              text-[#84C87F] font-clash font-bold uppercase tracking-[0.15em] text-sm py-3.5"
          >
            <CheckCircle size={18} weight="bold" />
            Registered · Paid
          </div>
        ) : (
          <button
            type="button"
            onClick={() => router.push('/profile')}
            data-cursor="Continue in Profile"
            className={CTA_CLASS}
          >
            Continue in Profile to Pay
          </button>
        )}
        {event.participationType === 'Team' && (
          <button
            type="button"
            onClick={() => openTeamDialog({ eventName: event.eventName, teamSize: event.teamSize })}
            data-cursor="Create Team"
            className="text-center font-terminal text-xs uppercase tracking-[0.15em] text-[#84C87F]/70 hover:text-[#84C87F] underline underline-offset-4 transition-colors"
          >
            + Create your team
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <RegisterMorphButton
        status={registerStatus}
        onRegister={handleRegister}
        onGoToProfile={() => router.push('/profile')}
      />
      {message && (
        <p
          className={`text-xs text-center leading-relaxed ${
            registerStatus === 'success' || registerStatus === 'pay' ? 'text-[#84C87F]' : 'text-[#ff8a80]'
          }`}
        >
          {message}
        </p>
      )}
      {event.participationType === 'Team' && (
        <button
          type="button"
          onClick={() => openTeamDialog({ eventName: event.eventName, teamSize: event.teamSize })}
          data-cursor="Create Team"
          className="text-center font-terminal text-xs uppercase tracking-[0.15em] text-[#84C87F]/70 hover:text-[#84C87F] underline underline-offset-4 transition-colors"
        >
          + Create your team
        </button>
      )}
    </div>
  );
}
