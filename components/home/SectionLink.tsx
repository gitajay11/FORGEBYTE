'use client';

import type { ReactNode } from 'react';
import { motionReduced } from '@/lib/prefs';

/** In-page link to a section: smooth-scrolls to the top of the section (html's
 *  scroll-padding-top keeps it clear of the fixed header) and updates the
 *  hash without adding a history entry. Still a plain #link without JS. */
export default function SectionLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        const el = document.getElementById(to);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(history.state, '', `#${to}`);
        el.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
