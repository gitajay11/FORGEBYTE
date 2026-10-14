'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Service } from '@/lib/content';
import { motionReduced } from '@/lib/prefs';
import { PRESELECT_NEED } from '@/components/contact/ContactForm';
import Glyph from './Glyph';

type Item = Pick<Service, 'slug' | 'name' | 'short' | 'glyph' | 'index' | 'promise' | 'problem' | 'deliverables' | 'duration' | 'fitIf' | 'notFitIf'>;

// Phones (<768px): the five services as a 2-column menu of tiles. Tapping one
// opens a floating glass window that grows out of the tile (FLIP: the window
// is laid out in its final place, then animated from the tile's box), with
// the details staggering in. Arrows or a sideways swipe move between
// services; X, a tap outside, a swipe down or Escape close it, shrinking it
// back into the tile of the service on show. Transform/opacity only.
// Tablets and desktop keep the full list (CSS hides this menu there).

const PHONE = '(max-width: 767px)';
const SPRING = 'cubic-bezier(0.25, 1.15, 0.4, 1)'; // slight overshoot, settles fast

/** Transform that makes box `to` sit exactly over box `from`. */
const flip = (from: DOMRect, to: DOMRect) =>
  `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width}, ${from.height / to.height})`;

const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

export default function ServiceMenu({ items }: { items: Item[] }) {
  const n = items.length;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0); // -1 / 1: which way the details slide in
  const [touched, setTouched] = useState(false); // the active tile glows once one has been opened
  const [closing, setClosing] = useState(false);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const winRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const indexRef = useRef(0);
  const closingRef = useRef(false);
  indexRef.current = index;

  const openAt = (i: number) => {
    setIndex(i);
    setDir(0);
    setTouched(true);
    setOpen(true);
  };

  const go = useCallback((step: 1 | -1) => {
    setDir(step);
    setIndex((i) => (i + step + n) % n);
  }, [n]);

  // Shrink back into the tile of the service on show, then unmount.
  const close = useCallback((after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const win = winRef.current, tile = tiles.current[indexRef.current];
    const finish = () => {
      closingRef.current = false;
      setClosing(false);
      setOpen(false);
      if (after) after();
      else tile?.focus({ preventScroll: true });
    };
    if (!win || !tile || motionReduced()) { finish(); return; }
    setClosing(true);
    const from = win.style.transform || 'none'; // mid swipe-down, start where the finger left it
    win.style.transform = '';
    overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-in', fill: 'forwards' });
    const a = win.animate(
      [{ transform: from, opacity: 1 }, { opacity: 1, offset: 0.6 }, { transform: flip(tile.getBoundingClientRect(), win.getBoundingClientRect()), opacity: 0 }],
      { duration: 280, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' }
    );
    a.onfinish = finish;
    a.oncancel = finish;
  }, []);

  // Open: grow out of the tile (measured before the first frame paints)
  useLayoutEffect(() => {
    if (!open) return;
    const win = winRef.current, tile = tiles.current[indexRef.current];
    if (!win || !tile) return;
    if (motionReduced()) return;
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    win.animate(
      [{ transform: flip(tile.getBoundingClientRect(), win.getBoundingClientRect()), opacity: 0.5 }, { opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1 }],
      { duration: 360, easing: SPRING }
    );
  }, [open]);

  // New service on show: start its details from the top
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [index]);

  // While open: lock the page, keep focus inside, keyboard controls
  useEffect(() => {
    if (!open) return;
    const prev = { overflow: document.body.style.overflow, pad: document.body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    document.body.classList.add('menu-open'); // hides the chat button, which would sit over the window
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowRight') { go(1); return; }
      if (e.key === 'ArrowLeft') { go(-1); return; }
      if (e.key !== 'Tab' || !winRef.current) return;
      const f = [...winRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1]?.focus(); }
      else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0]?.focus(); }
    };
    // grown past phone width (rotation, resize): the menu is gone, so is the window
    const mq = window.matchMedia(PHONE);
    const onMq = () => { if (!mq.matches) { closingRef.current = false; setClosing(false); setOpen(false); } };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.pad;
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open, close, go]);

  // Swipes: sideways moves between services; down (from the top of the
  // details) follows the finger and closes past a threshold.
  const touch = useRef<{ x: number; y: number; atTop: boolean; axis: 'x' | 'y' | null } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, atTop: (scrollRef.current?.scrollTop ?? 0) <= 0, axis: null };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = touch.current, win = winRef.current;
    if (!s || !win) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (!s.axis && Math.hypot(dx, dy) > 8) s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (s.axis === 'y' && s.atTop && dy > 0 && !motionReduced()) win.style.transform = `translateY(${dy * 0.6}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current, win = winRef.current;
    touch.current = null;
    if (!s || !win) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (s.axis === 'x' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { go(dx < 0 ? 1 : -1); return; }
    if (s.axis === 'y' && s.atTop && dy > 80) { close(); return; }
    if (win.style.transform) {
      const from = win.style.transform;
      win.style.transform = '';
      win.animate([{ transform: from }, { transform: 'none' }], { duration: 280, easing: SPRING });
    }
  };

  // "Discuss this project": close, tick the service in the form, go to it
  const discuss = (need: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    close(() => {
      window.dispatchEvent(new CustomEvent(PRESELECT_NEED, { detail: need }));
      // after the page's scroll lock has been released
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const contact = document.getElementById('contact');
        contact?.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' });
        contact?.focus({ preventScroll: true });
      }));
    });
  };

  const s = items[index];
  const prevItem = items[(index - 1 + n) % n], nextItem = items[(index + 1) % n];
  const pad = (v: number) => String(v).padStart(2, '0');

  return (
    <>
      <ul className="svc-menu" aria-label="Our services">
        {items.map((it, i) => (
          <li key={it.slug}>
            <button
              ref={(el) => { tiles.current[i] = el; }}
              type="button"
              className="svc-tile"
              data-active={touched && i === index}
              aria-haspopup="dialog"
              aria-expanded={open && i === index}
              onClick={() => openAt(i)}
            >
              <Glyph kind={it.glyph} className="svc-tile-icon" />
              <span className="svc-tile-title">{it.short}</span>
              <span className="mono svc-tile-n" aria-hidden="true">{it.index}</span>
            </button>
          </li>
        ))}
      </ul>

      {open && createPortal(
        <div className="svc-layer">
          <div className="svc-overlay" ref={overlayRef} onClick={() => close()} aria-hidden="true" />
          <div
            className="svc-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-window-title"
            ref={winRef}
            data-closing={closing}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="svc-win-head">
              <span className="svc-grab" aria-hidden="true" />
              <span className="mono">{s.index} / {pad(n)}</span>
              <button type="button" className="svc-close" aria-label="Close" ref={closeRef} onClick={() => close()}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="svc-win-scroll" ref={scrollRef}>
              {/* keyed: each service's details stagger in afresh */}
              <div className="svc-win-body service" key={index} data-dir={dir} style={{ '--dx': `${dir * 24}px` } as React.CSSProperties}>
                <div className="svc-win-title" style={{ '--i': 0 } as React.CSSProperties}>
                  <Glyph kind={s.glyph} className="svc-tile-icon" />
                  <h3 className="h3" id="svc-window-title">{s.name}</h3>
                </div>
                <p className="promise" style={{ '--i': 1 } as React.CSSProperties}>{s.promise}</p>
                <p className="problem" style={{ '--i': 2 } as React.CSSProperties}>{s.problem}</p>
                <dl style={{ '--i': 3 } as React.CSSProperties}>
                  <dt className="mono">You get</dt>
                  <dd><ul>{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></dd>
                  <dt className="mono">Time</dt>
                  <dd>{s.duration}</dd>
                </dl>
                <div className="fit" style={{ '--i': 4 } as React.CSSProperties}>
                  <div className="yes"><span className="mono">Right for you if</span><p>{s.fitIf}</p></div>
                  <div><span className="mono">Not right if</span><p>{s.notFitIf}</p></div>
                </div>
                <div className="svc-win-actions" style={{ '--i': 5 } as React.CSSProperties}>
                  <a href="#contact" className="btn btn-primary" onClick={discuss(s.short)} data-track={`cta_click:service-${s.slug}`}>
                    Discuss this project <span className="arrow" aria-hidden="true">→</span>
                  </a>
                  <Link href={`/services#${s.slug}`} className="ulink">More about this →</Link>
                </div>
              </div>
              <p className="sr-only" aria-live="polite">{`${s.name}, ${index + 1} of ${n}`}</p>
            </div>
            <div className="svc-win-nav">
              <button type="button" className="svc-arrow prev" aria-label={`Previous: ${prevItem.name}`} onClick={() => go(-1)}>{ARROW}</button>
              <span className="svc-dots" aria-hidden="true">
                {items.map((it, i) => <i key={it.slug} data-on={i === index} />)}
              </span>
              <button type="button" className="svc-arrow" aria-label={`Next: ${nextItem.name}`} onClick={() => go(1)}>{ARROW}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
