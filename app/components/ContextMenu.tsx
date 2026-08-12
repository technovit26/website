'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  House,
  CalendarBlank,
  Users,
  Images,
  Handshake,
  Info,
  LinkSimple,
  ShareNetwork,
  ArrowClockwise,
  ArrowLineUp,
  Sparkle,
  Check,
  MouseRightClick,
  Monitor,
  type Icon,
} from '@phosphor-icons/react';
import { useLenis } from './SmoothScrolling';

const NAV_ITEMS: { href: string; label: string; icon: Icon }[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/events', label: 'Events', icon: CalendarBlank },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/about', label: 'About', icon: Info },
];

const HYPE_MESSAGES = [
  'Two days. Every discipline. See you there.',
  "Inclusive Innovation — that's the theme.",
  '5000+ minds, one relentless drive to build.',
  'High on tech. See you at TechnoVIT’26.',
  '5000+ registrations and counting.',
  '50+ events. Pick your battlefield.',
  'Hackathons, robotics, and everything between.',
  'Every school. Every skill level. One fest.',
  'From first hackathon to tenth — you belong here.',
  'VIT Chennai, gearing up for two relentless days.',
  'The gatekeeping ends. The building begins.',
  'Talent and curiosity — the only entry requirements.',
];

const HINT_STORAGE_KEY = 'technovit_ctx_hint_seen';
const HINT_MAX_POKES = 4;
const MOBILE_HINT_MAX_POKES = 5;

const HINT_MESSAGES = [
  'Try right clicking',
  'Psst — right-click anywhere',
  "You haven't tried right-clicking yet",
  "There's a menu hiding under right-click",
  'Right-click. Go on.',
];

const MOBILE_HINT_MESSAGES = [
  'This one hits different on a PC. Try it there 👀',
  'Psst — the full experience lives on desktop.',
  "You're missing the good stuff. Pull up a PC.",
  'There’s a custom cursor and a secret menu on desktop.',
  'Built for a bigger screen. Come back on a PC.',
  "Right-click does something on desktop. You'll see.",
  'This site has range — desktop shows all of it.',
];

const ITEM_CLS =
  'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left ' +
  'text-white/80 text-[13px] font-medium hover:bg-white/10 hover:text-[#84C87F] transition-colors duration-150';

export default function ContextMenu() {
  const router = useRouter();
  const lenis = useLenis();
  const menuRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [hype, setHype] = useState<string | null>(null);
  const [canShare] = useState(() => typeof navigator !== 'undefined' && !!navigator.share);
  const [showHint, setShowHint] = useState(false);
  const [hintPos, setHintPos] = useState({ x: 0, y: 0 });
  const [hintMessage, setHintMessage] = useState(HINT_MESSAGES[0]);
  const [mobileHint, setMobileHint] = useState<string | null>(null);

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (localStorage.getItem(HINT_STORAGE_KEY)) return;

    let discovered = false;
    let pokes = 0;
    let lastIndex = -1;
    let timer: number;

    const markSeen = () => {
      discovered = true;
      localStorage.setItem(HINT_STORAGE_KEY, '1');
      setShowHint(false);
      window.clearTimeout(timer);
    };

    const onMove = (e: MouseEvent) => setHintPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('contextmenu', markSeen);

    const poke = () => {
      if (discovered || pokes >= HINT_MAX_POKES) return;
      pokes++;

      let index = Math.floor(Math.random() * HINT_MESSAGES.length);
      if (index === lastIndex) index = (index + 1) % HINT_MESSAGES.length;
      lastIndex = index;

      setHintMessage(HINT_MESSAGES[index]);
      setShowHint(true);
      timer = window.setTimeout(() => {
        setShowHint(false);
        timer = window.setTimeout(poke, 15000 + Math.random() * 15000);
      }, 4000);
    };

    timer = window.setTimeout(poke, 4000 + Math.random() * 5000);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('contextmenu', markSeen);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    let pokes = 0;
    let lastIndex = -1;
    let timer: number;

    const poke = () => {
      if (pokes >= MOBILE_HINT_MAX_POKES) return;
      pokes++;

      let index = Math.floor(Math.random() * MOBILE_HINT_MESSAGES.length);
      if (index === lastIndex) index = (index + 1) % MOBILE_HINT_MESSAGES.length;
      lastIndex = index;

      setMobileHint(MOBILE_HINT_MESSAGES[index]);
      timer = window.setTimeout(() => {
        setMobileHint(null);
        timer = window.setTimeout(poke, 25000 + Math.random() * 20000);
      }, 5000);
    };

    timer = window.setTimeout(poke, 6000 + Math.random() * 6000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      setCopied(false);
      setShowHint(false);

      const menu = menuRef.current;
      const pad = 8;
      const x = menu ? Math.max(pad, Math.min(e.clientX, window.innerWidth - menu.offsetWidth - pad)) : e.clientX;
      const y = menu ? Math.max(pad, Math.min(e.clientY, window.innerHeight - menu.offsetHeight - pad)) : e.clientY;
      setPos({ x, y });
      setVisible(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [close]);

  useEffect(() => {
    if (!visible || !menuRef.current) return;
    const { offsetWidth: w, offsetHeight: h } = menuRef.current;
    const pad = 8;
    setPos((prev) => {
      const x = Math.max(pad, Math.min(prev.x, window.innerWidth - w - pad));
      const y = Math.max(pad, Math.min(prev.y, window.innerHeight - h - pad));
      return x === prev.x && y === prev.y ? prev : { x, y };
    });
  }, [visible]);

  const handleNav = (href: string) => {
    close();
    router.push(href);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(close, 700);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: document.title, url: window.location.href });
    } catch {
      // user cancelled the share sheet — nothing to do
    }
    close();
  };

  const handleScrollTop = () => {
    close();
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReload = () => window.location.reload();

  const handleHype = () => {
    close();
    setHype(HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)]);
    setTimeout(() => setHype(null), 2200);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 9998 }}
              onClick={close}
            />
            <motion.div
              ref={menuRef}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 9999 }}
            className="w-60 bg-[#064928] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="px-3.5 pt-2.5 pb-2 border-b border-white/10 mb-1">
              <span className="font-clash font-bold text-white text-sm tracking-wide">technoVIT&apos;26</span>
            </div>

            <div className="px-1.5 py-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <button key={href} onClick={() => handleNav(href)} className={ITEM_CLS}>
                  <Icon size={15} weight="bold" />
                  {label}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/10 my-1" />

            <div className="px-1.5 py-1">
              <button onClick={handleCopyLink} className={ITEM_CLS}>
                {copied ? <Check size={15} weight="bold" className="text-[#84C87F]" /> : <LinkSimple size={15} weight="bold" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              {canShare && (
                <button onClick={handleShare} className={ITEM_CLS}>
                  <ShareNetwork size={15} weight="bold" />
                  Share
                </button>
              )}
              <button onClick={handleScrollTop} className={ITEM_CLS}>
                <ArrowLineUp size={15} weight="bold" />
                Scroll to Top
              </button>
              <button onClick={handleReload} className={ITEM_CLS}>
                <ArrowClockwise size={15} weight="bold" />
                Reload
              </button>
            </div>

            <div className="h-px bg-white/10 my-1" />

            <div className="px-1.5 py-1">
              <button
                onClick={handleHype}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left
                  text-[#84C87F] text-[13px] font-semibold hover:bg-[#84C87F]/10 transition-colors duration-150"
              >
                <Sparkle size={15} weight="fill" />
                Hype Me Up
              </button>
            </div>

            <div className="px-3.5 pt-1.5 pb-2 border-t border-white/10 mt-1">
              <p className="text-white/30 text-[9px] uppercase tracking-[0.15em]">
                Made with 💚 by The Website Team
              </p>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hype && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#064928] text-[#84C87F]
              font-clash font-bold text-sm px-5 py-3 rounded-full shadow-2xl border border-[#84C87F]/30
              flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkle size={16} weight="fill" />
            {hype}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', top: hintPos.y, left: hintPos.x + 20, zIndex: 999997 }}
            className="pointer-events-none -translate-y-1/2 bg-[#064928] text-[#84C87F] text-xs font-semibold
              px-3.5 py-2 rounded-full shadow-2xl border border-[#84C87F]/30 whitespace-nowrap
              flex items-center gap-1.5"
          >
            <MouseRightClick size={14} weight="bold" />
            {hintMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileHint && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#064928] text-[#84C87F]
              font-clash font-bold text-xs px-4 py-3 rounded-full shadow-2xl border border-[#84C87F]/30
              flex items-center gap-2 text-center max-w-[85vw]"
          >
            <Monitor size={16} weight="bold" className="shrink-0" />
            {mobileHint}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
