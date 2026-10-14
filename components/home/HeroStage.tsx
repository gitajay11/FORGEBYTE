'use client';

import { useEffect, useRef } from 'react';
import { detectTier, onThemeChange, resolvedTheme } from '@/lib/prefs';
import { HERO_STACKED } from '@/lib/heroLayout';
import type { HeroScene } from '@/scenes/hero';

const SEEN = 'fb-hero-seen';
// Opening sequence (ms after the ABI intro hands over). Total < 2.4s.
const AT = { text: 1000, meta: 1800, idle: 2400, sceneMs: 1800 };

type W = Window & { __introDone?: boolean };

/**
 * Drives the hero: sets data-stage on the <section> (CSS reveals the
 * headline, then metadata + CTA), lazily loads the three.js scene after
 * first paint, maps scroll-out to the scene's dissolve, and lets any input
 * skip the sequence. Return visitors in the same session start at idle.
 */
export default function HeroStage() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = anchor.current?.closest<HTMLElement>('.hero');
    const host = hero?.querySelector<HTMLElement>('.hero-scene');
    if (!hero || !host) return;

    const tier = detectTier();
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === '1'; } catch {}
    const instant = seen || tier === 'static';

    let scene: HeroScene | null = null;
    let buildScene: (() => void) | null = null;
    let themeNow = resolvedTheme();
    // Rebuild the scene when the theme flips (blending and colours differ)
    const offTheme = onThemeChange(() => {
      const t = resolvedTheme();
      if (t !== themeNow) { themeNow = t; buildScene?.(); }
    });
    let disposed = false;
    let introRaf = 0;
    let startedAt = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const setStage = (s: string) => { hero.dataset.stage = s; };

    const finish = () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(introRaf);
      setStage('idle');
      scene?.setIntro(1);
      try { sessionStorage.setItem(SEEN, '1'); } catch {}
      window.removeEventListener('keydown', skip);
      hero.removeEventListener('pointerdown', skip);
      window.removeEventListener('wheel', skip);
    };
    const skip = () => finish();

    const loadScene = async () => {
      if (tier === 'static') return;
      const { createHeroScene } = await import('@/scenes/hero');
      if (disposed) return;
      buildScene = () => {
        scene?.dispose();
        scene = createHeroScene(host, tier, resolvedTheme());
        host.dataset.ready = 'true';
        if (instant || hero.dataset.stage === 'idle') scene.setIntro(1);
        onScroll();
      };
      buildScene();
    };

    const runSequence = () => {
      if (instant) { finish(); return; }
      startedAt = performance.now();
      setStage('light');
      const tick = () => {
        const p = Math.min(1, (performance.now() - startedAt) / AT.sceneMs);
        scene?.setIntro(p);
        if (p < 1) introRaf = requestAnimationFrame(tick);
      };
      introRaf = requestAnimationFrame(tick);
      timers.push(setTimeout(() => setStage('text'), AT.text));
      timers.push(setTimeout(() => setStage('meta'), AT.meta));
      timers.push(setTimeout(finish, AT.idle));
      window.addEventListener('keydown', skip, { once: true });
      hero.addEventListener('pointerdown', skip, { once: true });
      window.addEventListener('wheel', skip, { once: true, passive: true });
    };

    // Scroll-out: 0 at top, 1 once the hero has scrolled away. Phones (the
    // scene sits below the text): 0 until its own box starts leaving the top
    // of the screen, so it isn't half-dissolved by the time you reach it.
    const stacked = window.matchMedia(HERO_STACKED);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const h = hero.offsetHeight || 1;
        const p = stacked.matches
          ? -host.getBoundingClientRect().top / (host.offsetHeight || 1)
          : window.scrollY / (h * 0.9);
        scene?.setScroll(Math.min(1, Math.max(0, p)));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Touch: a tap sends a pulse through the sculpture
    const onTap = (e: PointerEvent) => { if (e.pointerType !== 'mouse') scene?.pulse(); };
    hero.addEventListener('pointerdown', onTap);

    // Load the scene once the browser is idle, so it never competes with
    // first paint; start the sequence when the ABI intro hands over.
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(() => void loadScene(), { timeout: 1200 });
    else timers.push(setTimeout(() => void loadScene(), 300));

    const begin = () => runSequence();
    if ((window as W).__introDone) begin();
    else window.addEventListener('intro:done', begin, { once: true });

    return () => {
      disposed = true;
      offTheme();
      timers.forEach(clearTimeout);
      cancelAnimationFrame(introRaf);
      window.removeEventListener('intro:done', begin);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      hero.removeEventListener('pointerdown', skip);
      hero.removeEventListener('pointerdown', onTap);
      scene?.dispose();
      scene = null;
    };
  }, []);

  return <span ref={anchor} hidden />;
}
