'use client';

import { useEffect, useState } from 'react';
import { motionReduced } from '@/lib/prefs';
import { studio } from '@/lib/content';

// ABI intro, once per full page load:
//   1. "A", "B", "I" fade/slide in one by one (150ms stagger);
//   2. after a 0.4s pause each letter grows into its word, one after the
//      other (0.5s each, 0.3s apart). The lime capital stays put and the rest
//      of the word unfolds from it;
//   3. "Architecting Bold Ideas" holds, then the overlay fades away.
// An invisible copy of the final text reserves its full size from the first
// paint, so nothing around it moves. Reduced motion shows the final text
// straight away (CSS). Skip ends it at any point.

const WORDS = [
  { key: 'A', rest: 'rchitecting' },
  { key: 'B', rest: 'old' },
  { key: 'I', rest: 'deas' },
] as const;
const NAME = WORDS.map((w) => w.key + w.rest).join(' ');

const START_DELAY = 200;
const LETTERS_IN = 3 * 150 + 300; // stagger + one letter's entrance
const PAUSE = 400;
const WORD = 500;
const BETWEEN = 300;
const HOLD = 800;

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
          <span className="il-rest"><span>{w.rest}</span></span>
        </span>
      ))}
    </>
  );
}

export default function IntroOverlay() {
  const [lettersIn, setLettersIn] = useState(false);
  const [opened, setOpened] = useState(0); // how many words have expanded
  const [hidden, setHidden] = useState(false);

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
        <span className="intro-line intro-live" aria-hidden="true">
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
