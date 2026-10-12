'use client';

import { useEffect, useRef, useState } from 'react';
import { motionReduced } from '@/lib/prefs';
import { studio } from '@/lib/content';

// ABI intro, on every full page load:
//   1. type "Architecting Bold Ideas" (~1.5s) — every letter is rendered from
//      the start and only revealed, so nothing reflows while it types;
//   2. pause (~0.3s);
//   3. merge (~0.8s): A, B and I turn lime while the other letters fade, then
//      A, B and I slide together into "ABI" (a FLIP move, so the stacked phone
//      layout slides into the same single row);
//   4. "ABI" holds, then the overlay fades away. Skip ends it at any point.
// Reduced motion shows "ABI" straight away (CSS), then the overlay goes.

const NAME = 'Architecting Bold Ideas';
const WORDS = NAME.split(' ');
const TOTAL = WORDS.join('').length;

const START_DELAY = 300;
const TYPE_TOTAL = 1500;
const PAUSE = 300;
const FADE = 350; // other letters fade, A/B/I turn lime
const SLIDE = 450; // A/B/I slide together (FADE + SLIDE = the ~0.8s merge)
const HOLD = 700;

type Phase = 'typing' | 'fade' | 'merged';

/** The hero waits for this before running its own opening sequence. */
function announceDone() {
  (window as Window & { __introDone?: boolean }).__introDone = true;
  window.dispatchEvent(new Event('intro:done'));
}

export default function IntroOverlay() {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [hidden, setHidden] = useState(false);
  const lettersRef = useRef<HTMLDivElement>(null);

  function closeIntro() {
    setHidden(true);
    document.body.classList.remove('intro-lock');
    announceDone();
  }

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    if (motionReduced()) {
      setShown(TOTAL);
      setPhase('merged');
      sleep(HOLD).then(() => !cancelled && closeIntro());
      return () => { cancelled = true; timers.forEach(clearTimeout); };
    }

    (async () => {
      await sleep(START_DELAY);
      const step = TYPE_TOTAL / TOTAL;
      for (let i = 1; i <= TOTAL; i++) {
        await sleep(step);
        if (cancelled) return;
        setShown(i);
      }
      await sleep(PAUSE);
      if (cancelled) return;
      setPhase('fade');
      await sleep(FADE);
      if (cancelled) return;

      // FLIP: note where A/B/I are, switch to the final "ABI" layout, then
      // animate each letter from its old spot to its new one.
      const root = lettersRef.current;
      const keys = root ? [...root.querySelectorAll<HTMLElement>('.il-key')] : [];
      const first = keys.map((k) => k.getBoundingClientRect());
      setPhase('merged');
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (cancelled) return;
      keys.forEach((k, i) => {
        const last = k.getBoundingClientRect();
        k.animate(
          [{ transform: `translate(${first[i].left - last.left}px, ${first[i].top - last.top}px)` }, { transform: 'none' }],
          { duration: SLIDE, easing: 'ease-in-out' }
        );
      });
      await sleep(SLIDE + HOLD);
      if (cancelled) return;
      closeIntro();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  let n = 0; // running letter index across the three words
  return (
    <div id="introOverlay" className={hidden ? 'hide' : undefined} data-phase={phase}>
      <div className="intro-meta top" aria-hidden="true">
        <span className="mono">{studio.name}</span>
        <span className="mono">{studio.city}, {studio.country}</span>
      </div>
      <div className="intro-letters" ref={lettersRef} role="img" aria-label={NAME}>
        {WORDS.map((word) => (
          <span className="intro-word" key={word} aria-hidden="true">
            {[...word].map((ch, i) => {
              const idx = n++;
              const cls = [
                'il',
                i === 0 ? 'il-key' : 'il-rest',
                idx < shown ? 'on' : '',
                phase === 'typing' && idx === shown - 1 ? 'caret' : '',
              ].filter(Boolean).join(' ');
              return <span className={cls} key={i}>{ch}</span>;
            })}
          </span>
        ))}
      </div>
      <div className="intro-meta bottom">
        <span className="mono" aria-hidden="true">Websites · Online stores · Apps</span>
        <button className="intro-skip" type="button" onClick={closeIntro}>
          Skip →
        </button>
      </div>
    </div>
  );
}
