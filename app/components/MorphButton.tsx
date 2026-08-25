'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Check, CircleNotch } from '@phosphor-icons/react';

export type MorphStatus = 'idle' | 'busy' | 'success';

export default function MorphButton({
  status,
  label,
  onClick,
  type = 'button',
  dataCursor,
  className = '',
}: {
  status: MorphStatus;
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  dataCursor?: string;
  className?: string;
}) {
  return (
    <div className="flex justify-center">
      <motion.button
        type={type}
        onClick={onClick}
        whileTap={status === 'idle' ? { scale: 0.94 } : undefined}
        animate={{ width: status === 'idle' ? '100%' : 52 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        disabled={status !== 'idle'}
        data-cursor={status === 'idle' ? dataCursor : undefined}
        className={`flex items-center justify-center gap-2 h-[52px] rounded-full bg-[#84C87F] hover:bg-[#c2e0a5]
          text-[#064928] font-clash font-bold uppercase tracking-[0.15em] text-sm transition-colors duration-300 ${className}`}
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
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
