'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';

// Leaving the landing page and coming back puts the reader exactly where they
// were.
//  - Before any navigation away from "/", the spot is saved — as a section id
//    plus the offset into it, so it still lands right if something above
//    changes height — in sessionStorage and in that history entry's state.
//  - Other pages reached from the landing page get a "← Back" button in the
//    header row (BackButton, rendered by Nav): history.back() when the
//    previous entry is the landing page, otherwise a client-side trip to "/"
//    that restores the saved spot.
//  - Scroll restoration is manual (also set before first paint in
//    app/layout.tsx), so the browser, the pinned "Our work" row and the intro
//    don't fight over it. The spot is re-applied while late content (fonts,
//    images, lazy sections) settles, and dropped as soon as the reader scrolls.
//  - The intro isn't replayed on the way back (layout.tsx adds .no-intro for
//    full-page back/forward loads; client-side returns never remount it).
//  - External links open in a new tab, so the landing page stays put.

const SPOT = 'fb-return'; // the landing page spot
const GO = 'fb-return-go'; // the Back button sent us home: restore on arrival
const POS = 'fb-scroll'; // last scroll position per URL, for back/forward elsewhere

type Spot = { y: number; id: string | null; offset: number };

const read = <T,>(key: string): T | null => {
  try { const v = sessionStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
};
const write = (key: string, v: unknown) => {
  try { sessionStorage.setItem(key, JSON.stringify(v)); } catch {}
};
const urlKey = () => location.pathname + location.search + location.hash;

/** Layout position on the page — unaffected by transforms (e.g. the route's
 *  enter animation), unlike getBoundingClientRect. */
function docTop(el: HTMLElement) {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

function currentSpot(): Spot {
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
  const y = window.scrollY;
  let id: string | null = null;
  let offset = 0;
  for (const s of document.querySelectorAll<HTMLElement>('main section[id]')) {
    const top = docTop(s);
    if (top - y > navH + 1) break;
    id = s.id;
    offset = y - top;
  }
  return { y: Math.round(y), id, offset: Math.round(offset) };
}

function saveSpot() {
  if (location.pathname !== '/') return;
  const spot = currentSpot();
  write(SPOT, spot);
  try { history.replaceState({ ...history.state, fbReturn: spot }, ''); } catch {}
}

/** Scroll to `target()` now and again while the page settles (fonts, images,
 *  lazy sections like the pinned "How it works" adding height above). The
 *  content stays hidden (html[data-restoring]) until the layout has been
 *  still for a moment, so the reader never sees it jump; any input ends it. */
function settle(target: () => number) {
  const root = document.documentElement;
  let done = false;
  let quiet = 0;
  const QUIET = 400, MAX = 1800;
  const apply = () => {
    if (done) return;
    window.scrollTo({ top: target(), behavior: 'instant' });
    window.dispatchEvent(new Event('fb-restored')); // the work row jumps instead of gliding
    clearTimeout(quiet);
    quiet = window.setTimeout(reveal, QUIET);
  };
  const ro = new ResizeObserver(apply);
  const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  const stop = () => {
    if (done) return;
    done = true;
    ro.disconnect();
    clearTimeout(quiet);
    clearTimeout(cap);
    inputs.forEach((t) => window.removeEventListener(t, stop));
    window.removeEventListener('load', apply);
    window.removeEventListener('intro:done', apply);
    delete root.dataset.restoring;
    // came back while an intro was still playing (a reloaded inner page):
    // its scroll lock clamps the page, so put the reader back once it ends
    if (document.body.classList.contains('intro-lock')) {
      window.addEventListener('intro:done', () => window.scrollTo({ top: target(), behavior: 'instant' }), { once: true });
    }
  };
  function reveal() {
    // the intro's scroll lock still holds the page at one screen: wait for it
    if (document.body.classList.contains('intro-lock')) return;
    apply();
    stop();
  }
  root.dataset.restoring = 'true';
  apply();
  requestAnimationFrame(apply);
  ro.observe(document.body);
  inputs.forEach((t) => window.addEventListener(t, stop, { passive: true }));
  window.addEventListener('load', apply);
  window.addEventListener('intro:done', apply);
  document.fonts?.ready.then(apply);
  const cap = window.setTimeout(() => { apply(); stop(); }, MAX);
}

const spotY = (s: Spot) => {
  const el = s.id ? document.getElementById(s.id) : null;
  return el ? docTop(el) + s.offset : s.y;
};

/** Is the history entry before this one the landing page? */
function previousIsLanding(): boolean {
  const nav = (window as Window & { navigation?: { currentEntry?: { index: number }; entries?: () => { url: string | null }[] } }).navigation;
  if (nav?.currentEntry && nav.entries) {
    const prev = nav.entries()[nav.currentEntry.index - 1];
    if (!prev?.url) return false;
    const u = new URL(prev.url);
    return u.origin === location.origin && u.pathname === '/';
  }
  return history.state?.fbFrom === '/';
}

/**
 * "← Back" for the header row (components/site/Nav.tsx), on every page but the
 * landing page. Shown only when html[data-back] is set — the landing page was
 * visited this session — which layout.tsx sets before first paint on full
 * loads and BackNav keeps in step on client navigations, so the header never
 * shifts after it paints. Icon only below 360px (globals.css).
 */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="back-btn"
      aria-label="Back"
      onClick={() => {
        if (previousIsLanding()) { history.back(); return; }
        try { sessionStorage.setItem(GO, '1'); } catch {}
        router.push('/', { scroll: false });
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
      <span className="back-label">Back</span>
    </button>
  );
}

export default function BackNav() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const popped = useRef(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';

    // back/forward: remember it for the route change it causes; on the same
    // page (e.g. a #hash), put that entry's own position back
    const onPop = () => {
      if (location.pathname === prevPath.current) {
        const y = read<Record<string, number>>(POS)?.[urlKey()];
        if (y !== undefined) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
      } else popped.current = true;
    };

    // last position per URL, and the landing spot (also covers navigations
    // that aren't link clicks, e.g. the chat's "contact" button). Throttled;
    // history.state only once scrolling stops (browsers rate-limit it).
    let t = 0, idle = 0;
    const onScroll = () => {
      clearTimeout(idle);
      if (location.pathname === '/' && !document.body.classList.contains('intro-lock')) idle = window.setTimeout(saveSpot, 400);
      if (t) return;
      t = window.setTimeout(() => {
        t = 0;
        const map = read<Record<string, number>>(POS) ?? {};
        map[urlKey()] = Math.round(window.scrollY);
        write(POS, map);
        if (location.pathname === '/' && !document.body.classList.contains('intro-lock')) write(SPOT, currentSpot());
      }, 150);
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) {
        // external: new tab, so this page stays where it is
        if (/^https?:$/.test(url.protocol) && !a.target) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        return;
      }
      if (location.pathname === '/' && url.pathname !== '/') saveSpot();
    };

    const onHide = () => saveSpot();

    window.addEventListener('popstate', onPop);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, true); // capture: before the router navigates
    window.addEventListener('pagehide', onHide);
    return () => {
      clearTimeout(t);
      clearTimeout(idle);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pagehide', onHide);
    };
  }, []);

  // html[data-back] shows the header's Back button on pages reached from the
  // landing page (set before paint, so the header doesn't shift)
  useLayoutEffect(() => {
    if (pathname !== '/' && read<Spot>(SPOT)) document.documentElement.dataset.back = '';
    else delete document.documentElement.dataset.back;
  }, [pathname]);

  useEffect(() => {
    const from = prevPath.current;
    prevPath.current = pathname;
    const wasPop = popped.current;
    popped.current = false;

    if (pathname === '/') {
      let go = false;
      try { go = sessionStorage.getItem(GO) === '1'; sessionStorage.removeItem(GO); } catch {}
      // full-page back/forward load (no client-side "from")
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const initialReturn = from === null && nav?.type === 'back_forward';
      const returning = (from !== null && from !== '/' && (wasPop || go)) || initialReturn;
      // back/forward: that entry's own spot; the Back button: the latest one
      const entry = history.state?.fbReturn as Spot | undefined;
      const spot = (wasPop || initialReturn ? entry : undefined) ?? read<Spot>(SPOT);
      if (returning && spot) settle(() => spotY(spot));
      return;
    }

    // remember (in this entry) where it was reached from, for the Back button
    if (from !== null && history.state && history.state.fbFrom === undefined) {
      try { history.replaceState({ ...history.state, fbFrom: from }, ''); } catch {}
    }
    if (wasPop) {
      const y = read<Record<string, number>>(POS)?.[urlKey()];
      if (y !== undefined) settle(() => y);
    }
  }, [pathname]);

  return null;
}
