'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motionReduced } from '@/lib/prefs';
import { studio } from '@/lib/content';

// ABI intro, once per full page load:
//   1. "A", "B", "I" fade/slide in one by one (110ms stagger);
//   2. after a 0.25s pause each letter grows into its word, one after the
//      other (0.4s each, 0.18s apart). The lime capital stays put and the rest
//      of the word unfolds from it;
//   3. "Architecting Bold Ideas" holds, then the overlay fades away.
// Phones (<768px) add a step between 1 and 2: the letters arrive as a column
// centred on screen, then the column slides left to its final inset (FLIP:
// measured from the final layout, so it lands exactly where the words start)
// and "Architecting" begins unfolding as the slide finishes.
// An invisible copy of the final text reserves its full size from the first
// paint, so nothing around it moves. Reduced motion shows the final text
// straight away (CSS). Skip ends it at any point.

const WORDS = [
  { key: 'A', rest: 'rchitecting' },
  { key: 'B', rest: 'old' },
  { key: 'I', rest: 'deas' },
] as const;
const NAME = WORDS.map((w) => w.key + w.rest).join(' ');

const START_DELAY = 150;
const LETTERS_IN = 3 * 110 + 250; // stagger + one letter's entrance
const PAUSE = 250;
const WORD = 400;
const BETWEEN = 180;
const HOLD = 550;
const SHIFT = 400; // phones: the column's slide to the left
const OVERLAP = 120; // …which "Architecting" starts before the slide ends
const PHONE = '(max-width: 767px)';

/** The hero waits for this before running its own opening sequence. */
function announceDone() {
  (window as Window & { __introDone?: boolean }).__introDone = true;
  window.dispatchEvent(new Event('intro:done'));
}

function Line({ lettersIn, opened }: { lettersIn: boolean; opened: number }) {
  return (
    <>
      {WORDS.map((w, i) => (
        <span className={`intro-word${i < opened ? ' open' : ''}`} key={w.key} style={{ '--i': i } as React.CSSProperties}>
          <span className={`il-key${lettersIn ? ' in' : ''}`}>{w.key}</span>
          {/* window > text: phones wipe the window right while the text counter-slides */}
          <span className="il-rest"><span><span>{w.rest}</span></span></span>
        </span>
      ))}
    </>
  );
}

export default function IntroOverlay() {
  const [lettersIn, setLettersIn] = useState(false);
  const [opened, setOpened] = useState(0); // how many words have expanded
  const [hidden, setHidden] = useState(false);
  const [shifted, setShifted] = useState(false);
  const liveRef = useRef<HTMLSpanElement>(null);

  // Phones: before the letters show, offset the column (already in its final,
  // left-aligned spot) so it sits in the middle of the screen. FLIP "invert".
  useLayoutEffect(() => {
    const live = liveRef.current;
    if (!live || motionReduced() || !window.matchMedia(PHONE).matches) return;
    // measure the final layout, not an offset left by an earlier run
    // (React runs this twice in development)
    live.style.removeProperty('--shift');
    const keys = [...live.querySelectorAll<HTMLElement>('.il-key')].map((k) => k.getBoundingClientRect());
    const left = keys[0].left;
    const width = Math.max(...keys.map((r) => r.width));
    live.style.setProperty('--shift', `${Math.round(window.innerWidth / 2 - (left + width / 2))}px`);
  }, []);

  function closeIntro() {
    setHidden(true);
    document.body.classList.remove('intro-lock');
    announceDone();
  }

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    (async () => {
      if (motionReduced()) {
        setLettersIn(true);
        setOpened(WORDS.length);
        await sleep(HOLD);
      } else {
        await sleep(START_DELAY);
        if (cancelled) return;
        setLettersIn(true);
        await sleep(LETTERS_IN + PAUSE);
        if (cancelled) return;
        if (liveRef.current?.style.getPropertyValue('--shift')) {
          setShifted(true); // FLIP "play": slide the column home
          await sleep(SHIFT - OVERLAP);
        }
        for (let i = 1; i <= WORDS.length; i++) {
          if (cancelled) return;
          setOpened(i);
          await sleep(WORD + (i < WORDS.length ? BETWEEN : 0));
        }
        await sleep(HOLD);
      }
      if (!cancelled) closeIntro();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div id="introOverlay" className={hidden ? 'hide' : undefined}>
      <div className="intro-meta top" aria-hidden="true">
        <span className="mono">{studio.name}</span>
        <span className="mono">{studio.city}, {studio.country}</span>
      </div>
      <div className="intro-letters" role="img" aria-label={NAME}>
        {/* invisible final text: reserves the finished width and height */}
        <span className="intro-line intro-ghost" aria-hidden="true">
          <Line lettersIn opened={WORDS.length} />
        </span>
        <span className={`intro-line intro-live${shifted ? ' shifted' : ''}`} ref={liveRef} aria-hidden="true">
          <Line lettersIn={lettersIn} opened={opened} />
        </span>
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
