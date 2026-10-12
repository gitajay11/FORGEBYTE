'use client';

import { useEffect, useRef } from 'react';
import { motionReduced } from '@/lib/prefs';

// GSAP is loaded on demand, only for wide screens with full motion — the
// stacked mobile layouts and reduced-motion mode never download it.
const DESKTOP = '(min-width: 1024px)';

async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

function useDesktopStory(setup: (lib: Awaited<ReturnType<typeof loadGsap>>, root: HTMLElement) => () => void) {
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = anchor.current?.parentElement;
    if (!root) return;
    const mq = window.matchMedia(DESKTOP);
    let teardown: (() => void) | null = null;
    let cancelled = false;

    const apply = async () => {
      teardown?.();
      teardown = null;
      if (!mq.matches || motionReduced()) return;
      const lib = await loadGsap();
      if (cancelled || !mq.matches) return;
      teardown = setup(lib, root);
      // fonts change line heights, which moves every trigger
      document.fonts?.ready.then(() => !cancelled && lib.ScrollTrigger.refresh());
    };
    // the intro's scroll lock changes the page height when it lifts
    const remeasure = () => void loadGsap().then(({ ScrollTrigger }) => !cancelled && ScrollTrigger.refresh());
    void apply();
    mq.addEventListener('change', apply);
    window.addEventListener('fb-prefs', apply);
    window.addEventListener('intro:done', remeasure);
    return () => {
      cancelled = true;
      mq.removeEventListener('change', apply);
      window.removeEventListener('fb-prefs', apply);
      window.removeEventListener('intro:done', remeasure);
      teardown?.();
    };
    // setup is stable per component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return anchor;
}

/** One pinned section: the process line draws through each stage. */
export function ProcessPin() {
  const anchor = useDesktopStory(({ gsap, ScrollTrigger }, root) => {
    const steps = root.querySelector<HTMLElement>('.process-steps');
    const items = [...root.querySelectorAll<HTMLElement>('.step')];
    if (!steps || !items.length) return () => {};
    steps.dataset.pinned = 'true';
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top+=96',
          end: () => `+=${items.length * 260}`,
          pin: true,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            steps.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
            const idx = Math.min(items.length - 1, Math.floor(p * items.length));
            items.forEach((el, i) => (el.dataset.active = String(i <= idx)));
          },
        },
      });
    }, root);
    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      delete steps.dataset.pinned;
      steps.style.removeProperty('--p');
      items.forEach((el) => delete el.dataset.active);
    };
  });
  return <span ref={anchor} hidden />;
}
