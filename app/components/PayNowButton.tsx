'use client';

import { motion } from 'motion/react';
import { ArrowSquareOut } from '@phosphor-icons/react';

const DEFAULT_PAY_URL = 'https://chennaievents.vit.ac.in/technovit/profile';

export default function PayNowButton({
  href,
  amount,
  compact = false,
  className = '',
}: {
  href?: string | null;
  amount?: number | null;
  compact?: boolean;
  className?: string;
}) {
  const label = typeof amount === 'number' ? `Pay ₹${amount}` : 'Pay Now';

  return (
    <motion.a
      href={href ?? DEFAULT_PAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor={label}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      whileTap={{ scale: 0.94 }}
      className={`group flex items-center justify-center whitespace-nowrap rounded-full bg-[#84C87F] hover:bg-[#c2e0a5]
        text-[#064928] font-clash font-bold uppercase tracking-[0.1em] transition-colors duration-300
        ${compact ? 'gap-1.5 px-4 py-2.5 text-xs' : 'gap-2.5 w-full py-3.5 text-base tracking-[0.12em]'} ${className}`}
    >
      {label}
      <ArrowSquareOut
        size={compact ? 12 : 15}
        weight="bold"
        className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
      />
    </motion.a>
  );
}
