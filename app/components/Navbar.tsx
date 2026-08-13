'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/team', label: 'Team' },
  { href: '/merch', label: 'Merch' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const lineTopRef = useRef<HTMLSpanElement>(null);
  const lineMidRef = useRef<HTMLSpanElement>(null);
  const lineBotRef = useRef<HTMLSpanElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const ctx = gsap.context(() => {
      const isMobile = () => window.innerWidth < 1280;

      const getFloatingProps = () =>
        isMobile()
          ? { top: 12, left: '50%', xPercent: -50, x: 0, width: 'calc(100% - 32px)', maxWidth: '100%', paddingLeft: 16, paddingRight: 16, borderRadius: 12 }
          : { top: 20, left: '50%', xPercent: -50, x: 0, width: '72%', maxWidth: 960, paddingLeft: 32, paddingRight: 32, borderRadius: 16 };

      const getStuckProps = () => ({
        top: 0, left: 0, xPercent: 0, x: 0, width: '100%', maxWidth: '100%', borderRadius: 0,
        paddingLeft: isMobile() ? 16 : 32, paddingRight: isMobile() ? 16 : 32,
      });

      const isStuckRef = { current: false };

      gsap.set(nav, { ...getFloatingProps() });

      const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top-=60',
        end: 'top top-=61',
        onEnter: () => {
          isStuckRef.current = true;
          gsap.to(nav, { ...getStuckProps(), duration: 0.45, ease: 'power3.inOut' });
        },
        onLeaveBack: () => {
          isStuckRef.current = false;
          gsap.to(nav, { duration: 0.45, ease: 'power3.inOut', ...getFloatingProps() });
        },
      });

      const handleResize = () => {
        gsap.set(nav, isStuckRef.current ? { ...getStuckProps() } : { ...getFloatingProps() });
        st.refresh();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => ctx.revert();
  }, []);

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
        style={{ position: 'fixed', zIndex: 50, left: '50%', transform: 'translateX(-50%)' }}
        className="flex items-center justify-between bg-[#064928] text-white shadow-xl py-3 md:py-4
          top-[12px] w-[calc(100%-32px)] px-[16px] rounded-[12px]
          xl:top-[20px] xl:w-[72%] xl:max-w-[960px] xl:px-[32px] xl:rounded-[16px]"
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
              text-base tracking-wider sm:text-lg sm:tracking-widest md:text-xl lg:text-2xl"
          >
            technoVIT
          </Link>
        </div>

        <div className="hidden xl:flex items-center gap-4 lg:gap-6">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              ref={(el) => { linkRefs.current[i] = el; }}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
              data-cursor={link.label}
              className="relative text-white font-semibold uppercase pb-0.5 cursor-pointer
                text-sm tracking-wide lg:text-base lg:tracking-wider"
              style={{ textDecoration: 'none' }}
            >
              {link.label}
              <span
                className="nav-bar absolute left-0 bottom-0 w-full h-[2px] bg-[#84C87F]"
                style={{ transform: 'scaleX(0)', transformOrigin: 'left center', display: 'block' }}
              />
            </a>
          ))}
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
          paddingTop: '3.5rem',
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
        </div>
      </div>
    </>
  );
};

export default Navbar;
