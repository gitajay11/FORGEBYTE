'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/track';
import { motionReduced } from '@/lib/prefs';

const REVEAL = '[data-reveal], .words, .typein, .draw';

/**
 * Page-wide behaviour that would otherwise force every section to become a
 * client component:
 *  - one IntersectionObserver adds `.in` to reveal targets (CSS animates);
 *  - one click listener reports `data-track` elements to analytics;
 *  - a pointer listener gives `[data-magnetic]` elements a capped pull.
 * Re-scans on every route change.
 */
export default function SiteEffects() {
  const pathname = usePathname();

  // iOS Safari only applies :active (press feedback) once the page has a
  // touch listener; an empty passive one is enough.
  useEffect(() => {
    const noop = () => {};
    document.addEventListener('touchstart', noop, { passive: true });
    return () => document.removeEventListener('touchstart', noop);
  }, []);

  // Reveals
  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>(REVEAL)];
    // SVG strokes need their own length for the draw-in.
    document.querySelectorAll<SVGGeometryElement>('.draw path, .draw line, .draw polyline').forEach((el) => {
      try { el.style.setProperty('--len', String(Math.ceil(el.getTotalLength()))); } catch {}
    });
    const reveal = (el: Element) => {
      el.classList.add('in');
      io.unobserve(el);
    };
    // threshold 0: a target hidden by its own clip-path reports zero visible
    // area even when on screen, so any intersection counts.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && reveal(e.target)),
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    targets.forEach((t) => (t.classList.contains('in') ? null : io.observe(t)));
    // Anything already scrolled past (anchor jumps, restored scroll, fast
    // flicks) is revealed outright so nothing stays hidden above the reader.
    const sweep = () => {
      for (const t of targets) {
        if (!t.classList.contains('in') && t.getBoundingClientRect().bottom < 0) reveal(t);
      }
    };
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; sweep(); }); };
    sweep();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  // Analytics on [data-track="event:label"]
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      const [name, label = ''] = (el.dataset.track ?? '').split(':');
      if (name === 'cta_click' || name === 'booking_click') track(name, { label, path: location.pathname });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Magnetic pull, fine pointers only, max 8px
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let active: HTMLElement | null = null;
    const MAX = 8;
    const onMove = (e: PointerEvent) => {
      if (motionReduced()) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (active && active !== el) {
        active.style.transform = '';
        active = null;
      }
      if (!el) return;
      active = el;
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * MAX;
      const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * MAX;
      el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    };
    const reset = () => {
      if (active) active.style.transform = '';
      active = null;
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', reset);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', reset);
      reset();
    };
  }, []);

  return null;
}
