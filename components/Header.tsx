'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import logo from '@/public/logo/forgebyte-logo.png';

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Process' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const progressRef = useRef<HTMLSpanElement>(null);

  // Condense-on-scroll + reading progress. The bar is written straight to the
  // DOM rather than through state — this fires every frame while scrolling and
  // re-rendering the whole header that often would drop frames.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled((prev) => (y > 8 === prev ? prev : y > 8));

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Scroll-spy: highlight whichever section is crossing the middle of the
  // viewport, so the nav says where you are on a single-page site.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.querySelector(link.href)
    ).filter((el): el is Element => el !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={scrolled ? 'scrolled' : undefined}>
      <nav>
        <a href="#top" className="logo">
          {/* the mark supplies the braces, so the wordmark goes without them */}
          <Image
            src={logo}
            alt=""
            width={54}
            height={36}
            className="logo-lockup"
            priority
          />
          forgebyte
        </a>
        <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={active === link.href ? 'active' : undefined}
                aria-current={active === link.href ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="nav-cta" onClick={() => setOpen(false)}>
              Start a project
            </a>
          </li>
        </ul>
        <button
          className={`nav-toggle${open ? ' open' : ''}`}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="navLinks"
          onClick={() => setOpen((v) => !v)}
        >
          {/* three bars that cross into an X — a text glyph can't animate */}
          <span className="nav-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </nav>
      <span className="scroll-progress" ref={progressRef} aria-hidden="true" />
    </header>
  );
}
