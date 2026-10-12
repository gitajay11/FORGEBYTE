'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { studio } from '@/lib/content';
import { motionReduced } from '@/lib/prefs';
import { ThemeButton } from './ThemeToggle';
import SocialLinks from './SocialLinks';

const LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/studio', label: 'About' },
  { href: '/lab', label: 'Demos' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // past 20px the bar becomes a floating glass pill
  const [scrolled, setScrolled] = useState(false);
  // On pages with a hero, the bar turns solid and shows the tagline once the
  // hero has scrolled away. Pages without a hero start in that state.
  const [pastHero, setPastHero] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Close the menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Menu: lock scroll, move focus in, Escape closes, focus returns
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      buttonRef.current?.focus();
    };
  }, [open]);

  // Contact: smooth-scrolls to the form on the home page, opens /contact elsewhere
  const onHome = pathname === '/';
  const contactHref = onHome ? '#contact' : '/contact';
  const goToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onHome) return;
    const target = document.getElementById('contact');
    if (!target) return;
    e.preventDefault();
    const wasOpen = open;
    setOpen(false);
    // let the menu release its scroll lock and focus first
    setTimeout(() => {
      target.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
      history.replaceState(null, '', '#contact');
    }, wasOpen ? 60 : 0);
  };

  const current = (href: string) => (pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined);

  return (
    <>
      <header className="nav" data-floating={scrolled && !open} data-past-hero={pastHero || open}>
        <div className="container nav-inner">
          <div className="nav-brand">
            <Link href="/" className="logo" aria-label="Forgebyte — home">
              <span className="logo-mark" aria-hidden="true">{'{}'}</span>
              <span className="logo-word">forgebyte</span>
            </Link>
            {/* the hero headline, carried into the bar once the hero is gone */}
            <p className="nav-tagline" aria-hidden="true">
              <span className="t1">We build things.</span> <span className="t2">We question things.</span>
            </p>
          </div>
          <nav aria-label="Primary">
            <ul className="nav-links">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="ulink" aria-current={current(l.href)}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={contactHref} onClick={goToContact} className="ulink" aria-current={current('/contact')} data-track="nav_click:contact">
                  Contact
                </Link>
              </li>
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

      <div id="site-menu" className="menu" data-open={open} ref={menuRef} aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile">
          <ul className="menu-list">
            {LINKS.map((l, i) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={current(l.href)}>
                  <span className="mono">0{i + 1}</span>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={contactHref} onClick={goToContact} aria-current={current('/contact')} data-track="nav_click:contact-menu">
                <span className="mono">05</span>
                Contact
              </Link>
            </li>
            <li>
              <Link href="/contact" data-track="cta_click:menu">
                <span className="mono">06</span>
                Start a project
              </Link>
            </li>
          </ul>
        </nav>
        <div className="menu-foot">
          <p className="mono live">Accepting projects · {studio.availability}</p>
          <p className="mono">{studio.city} · {studio.tzLabel}</p>
          <SocialLinks />
        </div>
      </div>
    </>
  );
}
