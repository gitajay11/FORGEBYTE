'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { studio } from '@/lib/content';
import { motionReduced } from '@/lib/prefs';
import { ThemeButton } from './ThemeToggle';
import SocialLinks from './SocialLinks';

// In the order the sections appear on the landing page. On the home page each
// link scrolls to its section (`id`); elsewhere it opens the page (`href`).
const LINKS = [
  { id: 'about', href: '/studio', label: 'About' },
  { id: 'services', href: '/services', label: 'Services' },
  { id: 'work', href: '/work', label: 'Work' },
  { id: 'lab', href: '/lab', label: 'Demos' },
  { id: 'contact', href: '/contact', label: 'Contact' },
] as const;
type SectionId = (typeof LINKS)[number]['id'];

const num = (i: number) => String(i + 1).padStart(2, '0');

export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [open, setOpen] = useState(false);
  // past 20px the bar becomes a floating glass pill
  const [scrolled, setScrolled] = useState(false);
  // On pages with a hero, the bar turns solid and shows the tagline once the
  // hero has scrolled away. Pages without a hero start in that state.
  const [pastHero, setPastHero] = useState(false);
  // home page: the linked section currently being read
  const [section, setSection] = useState<SectionId | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const capsuleRef = useRef<HTMLSpanElement>(null);
  // while a nav click is smooth-scrolling, ignore the sections it passes
  const clickLock = useRef(false);

  // Always visible (sticky). Track whether the hero is still on screen.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > 20);
      const hero = document.querySelector<HTMLElement>('.hero');
      const navH = document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 72;
      setPastHero(!hero || hero.getBoundingClientRect().bottom <= navH + 1);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  // Home page: which section is in view. A thin band across the middle of the
  // screen; the section crossing it becomes active. Between linked sections
  // the last one stays active; over the hero, none (the capsule fades out).
  useEffect(() => {
    if (pathname !== '/') { setSection(null); return; }
    const targets = [document.querySelector<HTMLElement>('.hero'), ...LINKS.map(({ id }) => document.getElementById(id))]
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        if (clickLock.current) return;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id as SectionId;
          setSection(e.target.classList.contains('hero') ? null : id);
        }
      },
      { rootMargin: '-45% 0px -54% 0px', threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  // Close the menu on navigation, and when the window grows to desktop
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Menu: lock scroll, move focus in, Escape closes, focus returns
  useEffect(() => {
    if (!open) return;
    const prev = { overflow: document.body.style.overflow, pad: document.body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    document.body.classList.add('menu-open'); // hides the chat widget, which sits above the panel
    const first = menuRef.current?.querySelector<HTMLElement>('a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && menuRef.current) {
        const items = [...menuRef.current.querySelectorAll<HTMLElement>('a, button')];
        const all = [buttonRef.current!, ...items];
        const i = all.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); all[all.length - 1].focus(); }
        else if (!e.shiftKey && i === all.length - 1) { e.preventDefault(); all[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.pad;
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
      buttonRef.current?.focus();
    };
  }, [open]);

  // Home page: smooth-scroll to the section instead of leaving the page
  const goTo = (id: SectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = onHome ? document.getElementById(id) : null;
    if (!target) { setOpen(false); return; }
    e.preventDefault();
    const wasOpen = open;
    setOpen(false);
    setSection(id);
    clickLock.current = true;
    const unlock = () => { clickLock.current = false; window.removeEventListener('scrollend', unlock); };
    window.addEventListener('scrollend', unlock);
    setTimeout(unlock, 1500); // browsers without scrollend
    // let the menu release its scroll lock and focus first
    setTimeout(() => {
      target.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
      history.replaceState(null, '', `#${id}`);
    }, wasOpen ? 60 : 0);
  };
  const hrefFor = (l: (typeof LINKS)[number]) => (onHome ? `#${l.id}` : l.href);

  const isPage = (href: string) => pathname === href || pathname.startsWith(href + '/');
  // the link the indicator sits under: the section being read (home) or the page you're on
  const activeId = onHome ? section : LINKS.find((l) => isPage(l.href))?.id ?? null;
  const ariaCurrent = (l: (typeof LINKS)[number]) =>
    onHome ? (l.id === section ? 'true' : undefined) : isPage(l.href) ? 'page' : undefined;

  // Size and place the capsule behind the active link (transform + width).
  // Re-measured on resize, font load and when the bar changes size.
  useLayoutEffect(() => {
    const ul = linksRef.current, cap = capsuleRef.current;
    if (!ul || !cap) return;
    const place = () => {
      const a = ul.querySelector<HTMLElement>('a[data-active="true"]');
      if (!a) { cap.dataset.visible = 'false'; return; }
      const ur = ul.getBoundingClientRect(), ar = a.getBoundingClientRect();
      cap.style.setProperty('--cap-x', `${ar.left - ur.left - 14}px`);
      cap.style.setProperty('--cap-w', `${ar.width + 28}px`);
      cap.dataset.visible = 'true';
      // first placement jumps into place; later moves spring
      if (!cap.dataset.ready) requestAnimationFrame(() => { cap.dataset.ready = 'true'; });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(ul);
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => { ro.disconnect(); window.removeEventListener('resize', place); };
  }, [activeId]);

  return (
    <>
      <header className="nav" data-floating={scrolled && !open} data-past-hero={pastHero || open}>
        <div className="container nav-inner">
          <div className="nav-brand">
            <Link href="/" className="logo" aria-label="Forgebyte — home">
              <Image src="/logo/forgebyte-f.png" alt="" width={30} height={30} className="logo-mark" priority />
              <span className="logo-word">forgebyte</span>
            </Link>
            {/* the hero headline, carried into the bar once the hero is gone */}
            <p className="nav-tagline" aria-hidden="true">
              <span className="t1">We build things.</span> <span className="t2">We question things.</span>
            </p>
          </div>
          <nav aria-label="Primary">
            <ul className="nav-links" ref={linksRef}>
              {/* one shared capsule that slides behind the active link */}
              <li className="nav-capsule-slot" aria-hidden="true"><span className="nav-capsule" ref={capsuleRef} data-visible="false" /></li>
              {LINKS.map((l, i) => (
                <li key={l.id}>
                  <Link
                    href={hrefFor(l)}
                    onClick={goTo(l.id)}
                    className="nav-link"
                    aria-current={ariaCurrent(l)}
                    data-active={l.id === activeId}
                    data-track={`nav_click:${l.id}`}
                  >
                    <span className="nav-num" aria-hidden="true">{num(i)}</span>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li><ThemeButton /></li>
              <li>
                <Link href="/contact" className={`btn ${pastHero ? 'btn-primary' : 'btn-ghost'}`} data-magnetic data-track="cta_click:nav">
                  Start a project
                </Link>
              </li>
            </ul>
          </nav>
          <div className="nav-mobile">
            <ThemeButton />
            <Link href="/contact" className={`btn ${pastHero ? 'btn-primary' : 'btn-ghost'} nav-mobile-cta`} data-track="cta_click:nav-mobile">
              {/* the shorter label takes over on narrow phones */}
              <span className="cta-long">Start a project</span>
              <span className="cta-short">Start project</span>
            </Link>
            <button
              ref={buttonRef}
              className="menu-btn"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* tapping the dimmed page beside the panel closes it */}
      <div className="menu-overlay" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="site-menu" className="menu" data-open={open} ref={menuRef} aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile">
          <ul className="menu-list">
            {LINKS.slice(0, -1).map((l, i) => (
              <li key={l.id} style={{ '--i': i } as React.CSSProperties}>
                {/* closes on tap even when the link is the page you're on */}
                <Link href={hrefFor(l)} aria-current={ariaCurrent(l)} data-active={l.id === activeId} onClick={goTo(l.id)}>
                  <span className="mono">{num(i)}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-foot">
          <p className="mono live">Accepting projects · {studio.availability}</p>
          <p className="mono">{studio.city} · {studio.tzLabel}</p>
          {/* narrow phones: the theme toggle lives here, to leave the bar room for "Start a project" */}
          <div className="menu-theme"><span className="mono">Theme</span><ThemeButton /></div>
          <SocialLinks />
        </div>
        <Link
          href={hrefFor(LINKS[4])}
          className="btn btn-primary menu-cta"
          aria-current={ariaCurrent(LINKS[4])}
          data-active={activeId === 'contact'}
          onClick={goTo('contact')}
          data-track="cta_click:menu"
        >
          Contact <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}
