'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'motion/react';
import { emit } from '../hooks/useEventBus';
import { useAuthState, logout, openLogin } from '../hooks/useAuthState';

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

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const lineTopRef = useRef<HTMLSpanElement>(null);
  const lineMidRef = useRef<HTMLSpanElement>(null);
  const lineBotRef = useRef<HTMLSpanElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    setMenuOpen(true);

    gsap.to(lineTopRef.current, { rotate: 45, y: 8, duration: 0.3, ease: 'power2.inOut' });
    gsap.to(lineMidRef.current, { scaleX: 0, opacity: 0, duration: 0.15 });
    gsap.to(lineBotRef.current, { rotate: -45, y: -8, duration: 0.3, ease: 'power2.inOut' });

    gsap.fromTo(
      menuPanelRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', pointerEvents: 'auto' }
    );
  };

  const closeMenu = () => {
    gsap.to(lineTopRef.current, { rotate: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });
    gsap.to(lineMidRef.current, { scaleX: 1, opacity: 1, duration: 0.2, delay: 0.08 });
    gsap.to(lineBotRef.current, { rotate: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });

    gsap.set(menuPanelRef.current, { pointerEvents: 'none' });

    gsap.to(menuPanelRef.current, {
      opacity: 0, y: -12, duration: 0.25, ease: 'power2.in',
      onComplete: () => setMenuOpen(false),
    });
  };

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
        className="relative z-50 mx-auto mt-3 sm:mt-5 w-[calc(100%-32px)]
          xl:w-[80%] xl:max-w-[1120px]
          flex items-center justify-between bg-[#064928] text-white shadow-xl
          py-3 md:py-4 px-4 xl:px-8 rounded-xl xl:rounded-2xl"
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
          className="xl:hidden flex flex-col justify-center items-center gap-1.5 p-1.5 w-8 h-8"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span ref={lineTopRef} className="block w-5 h-0.5 bg-[#84C87F] origin-center" />
          <span ref={lineMidRef} className="block w-5 h-0.5 bg-[#84C87F] origin-center" />
          <span ref={lineBotRef} className="block w-5 h-0.5 bg-[#84C87F] origin-center" />
        </button>
      </nav>

      <div
        ref={menuPanelRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 49,
          opacity: 0,
          pointerEvents: 'none',
          paddingTop: '4.5rem',
        }}
        className="xl:hidden bg-[#064928] border-t border-white/10 shadow-xl"
      >
        <div className="flex flex-col py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="px-6 py-3 text-white font-semibold uppercase tracking-widest text-sm
                border-b border-white/5 last:border-0
                hover:bg-white/5 hover:text-[#84C87F] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
          <ProfileNavLink mobile onAfterClick={closeMenu} />
          <AuthNavButton mobile onAfterClick={closeMenu} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
