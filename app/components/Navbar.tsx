'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { List } from '@phosphor-icons/react';
import gsap from 'gsap';
import { motion } from 'motion/react';
import { emit } from '../hooks/useEventBus';
import { useAuthState, logout, openLogin } from '../hooks/useAuthState';
import { useLenis } from './SmoothScrolling';

export const NAV_LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/team', label: 'Team' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

function AuthNavButton({ mobile = false, onAfterClick }: { mobile?: boolean; onAfterClick?: () => void }) {
  const { loggedIn } = useAuthState();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    onAfterClick?.();
    if (loggedIn) {
      setBusy(true);
      await logout();
      setBusy(false);
    } else {
      openLogin();
    }
  };

  if (mobile) {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        className="px-6 py-3 text-left text-white font-semibold uppercase tracking-widest text-sm
          border-b border-white/5 last:border-0
          hover:bg-white/5 hover:text-[#84C87F] transition-colors duration-150 disabled:opacity-50"
      >
        {loggedIn ? 'Logout' : 'Login'}
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      disabled={busy}
      data-cursor={loggedIn ? 'Logout' : 'Login'}
      className="shrink-0 rounded-full bg-[#84C87F] hover:bg-[#c2e0a5] text-[#064928]
        font-clash font-bold uppercase tracking-[0.1em] text-xs lg:text-sm px-4 lg:px-5 py-2 lg:py-2.5
        transition-colors duration-200 disabled:opacity-50"
    >
      {loggedIn ? 'Logout' : 'Login'}
    </motion.button>
  );
}

function ProfileNavLink({ mobile = false, onAfterClick }: { mobile?: boolean; onAfterClick?: () => void }) {
  const { loggedIn } = useAuthState();
  if (!loggedIn) return null;

  if (mobile) {
    return (
      <Link
        href="/profile"
        onClick={onAfterClick}
        className="px-6 py-3 text-white font-semibold uppercase tracking-widest text-sm
          border-b border-white/5 last:border-0
          hover:bg-white/5 hover:text-[#84C87F] transition-colors duration-150"
      >
        Profile
      </Link>
    );
  }

  return <ProfileDesktopLink />;
}

function ProfileDesktopLink() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    const link = linkRef.current;
    if (!link) return;
    const bar = link.querySelector<HTMLElement>('.nav-bar');
    if (!bar) return;
    gsap.killTweensOf(bar);
    gsap.fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(link, { color: '#84C87F', duration: 0.2, ease: 'power1.out' });
  };

  const handleMouseLeave = () => {
    const link = linkRef.current;
    if (!link) return;
    const bar = link.querySelector<HTMLElement>('.nav-bar');
    if (!bar) return;
    gsap.killTweensOf(bar);
    gsap.to(bar, { scaleX: 0, transformOrigin: 'right center', duration: 0.25, ease: 'power2.in' });
    gsap.to(link, { color: '#ffffff', duration: 0.2, ease: 'power1.in' });
  };

  return (
    <a
      href="/profile"
      ref={linkRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="Profile"
      className="relative text-white font-semibold uppercase cursor-pointer
        text-sm tracking-wide lg:text-base lg:tracking-wider"
      style={{ textDecoration: 'none' }}
    >
      Profile
      <span
        className="nav-bar absolute left-0 -bottom-1 w-full h-[2px] bg-[#84C87F]"
        style={{ transform: 'scaleX(0)', transformOrigin: 'left center', display: 'block' }}
      />
    </a>
  );
}

function TerminalMenu({
  pathname,
  loggedIn,
  onAuth,
  onClose,
}: {
  pathname: string;
  loggedIn: boolean;
  onAuth: () => void;
  onClose: () => void;
}) {
  const routes = NAV_LINKS.map((l) => ({ href: l.href, label: l.label }));
  if (loggedIn) routes.push({ href: '/profile', label: 'Profile' });

  return (
    <div
      className="relative flex h-full flex-col px-7 font-terminal text-[#c2e0a5]
        pt-[calc(env(safe-area-inset-top,0px)+1.25rem)]
        pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        data-cursor="Close"
        className="-mr-1 shrink-0 self-end px-1 py-2 text-lg tracking-[0.35em] text-[#84C87F]
          transition-colors hover:text-[#c2e0a5]"
      >
        [&thinsp;X&thinsp;]
      </button>

      <nav
        data-lenis-prevent
        className="terminal-scroll -mx-7 mt-9 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-7 pb-4"
      >
        {routes.map((r, i) => {
          const active = pathname === r.href;
          return (
            <Link
              key={r.href}
              href={r.href}
              onClick={onClose}
              data-cursor={r.label}
              className="group relative py-3.5"
            >
              <span
                aria-hidden
                className={`absolute -left-7 top-0 h-full w-[3px] bg-[#84C87F] transition-opacity duration-200 ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span
                className={`block font-clash text-[2.1rem] font-bold lowercase leading-[1.04] tracking-tight
                  transition-transform duration-200 group-hover:translate-x-1.5 sm:text-[2.6rem] ${
                    active ? 'text-[#84C87F]' : 'text-[#c2e0a5]'
                  }`}
              >
                {r.label}
              </span>
              <span className="mt-1 block text-[11px] tracking-wide text-[#84C87F]/35">
                {String(i + 1).padStart(2, '0')} &nbsp; cd&nbsp;~{r.href}
                {active && <span className="terminal-cursor ml-1 text-[#84C87F]">_</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 pt-6">
        <p className="text-sm text-[#84C87F]/80">
          <span className="text-[#84C87F]">$</span>{' '}
          <span className="terminal-cursor text-[#84C87F]">▋</span>
        </p>
        <button
          type="button"
          onClick={() => {
            onAuth();
            onClose();
          }}
          data-cursor={loggedIn ? 'Logout' : 'Login'}
          className="group mt-4 block w-full border-t-2 border-[#84C87F]/15 pt-4 text-left"
        >
          <span
            className="block font-clash text-[1.7rem] font-bold lowercase leading-none text-[#c2e0a5]
              transition-transform duration-200 group-hover:translate-x-1.5"
          >
            {loggedIn ? 'logout' : 'login'}
          </span>
          <span className="mt-1 block text-[11px] tracking-wide text-[#84C87F]/35">
            ./auth&nbsp;{loggedIn ? 'logout' : 'login'}
          </span>
        </button>
      </div>
    </div>
  );
}

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const { loggedIn } = useAuthState();

  const openMenu = () => {
    setMenuOpen(true);

    gsap.fromTo(
      menuPanelRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.28, ease: 'power2.out', pointerEvents: 'auto' }
    );
  };

  const closeMenu = () => {
    gsap.set(menuPanelRef.current, { pointerEvents: 'none' });

    gsap.to(menuPanelRef.current, {
      opacity: 0, duration: 0.22, ease: 'power2.in',
      onComplete: () => setMenuOpen(false),
    });
  };

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [menuOpen, lenis]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) closeMenu();
        emit('navbar:collapsed', !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleMenu = () => menuOpen ? closeMenu() : openMenu();

  const handleMouseEnter = (index: number) => {
    const link = linkRefs.current[index];
    if (!link) return;
    const bar = link.querySelector<HTMLElement>('.nav-bar');
    if (!bar) return;
    gsap.killTweensOf(bar);
    gsap.fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(link, { color: '#84C87F', duration: 0.2, ease: 'power1.out' });
  };

  const handleMouseLeave = (index: number) => {
    const link = linkRefs.current[index];
    if (!link) return;
    const bar = link.querySelector<HTMLElement>('.nav-bar');
    if (!bar) return;
    gsap.killTweensOf(bar);
    gsap.to(bar, { scaleX: 0, transformOrigin: 'right center', duration: 0.25, ease: 'power2.in' });
    gsap.to(link, { color: '#ffffff', duration: 0.2, ease: 'power1.in' });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="relative z-50 mx-auto mt-3 sm:mt-5 w-[calc(100%-24px)]
          xl:w-[88%] xl:max-w-[1320px]
          flex items-center justify-between bg-[#064928] text-white shadow-xl
          py-3 md:py-5 px-4 xl:px-8 rounded-xl xl:rounded-2xl"
      >
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <a
            href="https://chennai.vit.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            data-cursor="Its VIT Chennai"
            className="shrink-0 flex items-center"
          >
            <img
              src="/vit-logo.png"
              alt="VIT Chennai"
              style={{ filter: 'brightness(0) invert(1)' }}
              className="object-contain block h-8 w-auto sm:h-9 md:h-10"
            />
          </a>
          <span
            aria-hidden
            className="shrink-0 w-[3px] h-4 sm:h-5 rounded-full bg-gradient-to-b from-white/80 via-[#c2e0a5] to-[#84C87F]"
          />
          <Link
            href="/"
            onClick={closeMenu}
            data-cursor="Homepage"
            className="font-clash font-bold whitespace-nowrap text-white hover:text-[#84C87F] transition-colors duration-200
              text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide"
          >
            technoVIT
          </Link>
        </div>

        <div className="hidden xl:flex items-center gap-4 lg:gap-5">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              ref={(el) => { linkRefs.current[i] = el; }}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
              data-cursor={link.label}
              className="relative text-white font-semibold uppercase cursor-pointer
                text-sm tracking-wide lg:text-base lg:tracking-wider"
              style={{ textDecoration: 'none' }}
            >
              {link.label}
              <span
                className="nav-bar absolute left-0 -bottom-1 w-full h-[2px] bg-[#84C87F]"
                style={{ transform: 'scaleX(0)', transformOrigin: 'left center', display: 'block' }}
              />
            </a>
          ))}
          <ProfileNavLink />
          <AuthNavButton />
        </div>

        <button
          onClick={toggleMenu}
          className="xl:hidden -mr-1 p-1.5 text-[#84C87F] transition-colors hover:text-[#c2e0a5]"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <List size={28} />
        </button>
      </nav>

      <div
        ref={menuPanelRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 310,
          opacity: 0,
          pointerEvents: 'none',
        }}
        className="xl:hidden bg-[#064928]"
      >
        <div aria-hidden className="terminal-scanlines opacity-[0.12]" />
        <TerminalMenu
          pathname={pathname}
          loggedIn={loggedIn}
          onAuth={() => (loggedIn ? logout() : openLogin())}
          onClose={closeMenu}
        />
      </div>
    </>
  );
};

export default Navbar;
