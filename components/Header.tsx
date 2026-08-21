'use client';

import { useState } from 'react';
import Image from 'next/image';
import logo from '@/public/logo/forgebyte-logo.png';

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Process' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header>
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
              <a href={link.href} onClick={() => setOpen(false)}>
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
          className="nav-toggle"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </nav>
    </header>
  );
}
