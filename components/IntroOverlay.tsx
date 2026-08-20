'use client';

import { useEffect, useState } from 'react';

const WORDS = [
  { first: 'A', rest: 'rchitecting' },
  { first: 'B', rest: 'old' },
  { first: 'I', rest: 'deas' },
] as const;

const TYPE_SPEED = 34;

export default function IntroOverlay() {
  const [typed, setTyped] = useState(['', '', '']);
  const [cursorDone, setCursorDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  function closeIntro() {
    setHidden(true);
    document.body.classList.remove('intro-lock');
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.remove('intro-lock');
      setHidden(true);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    (async () => {
      await sleep(500);
      for (let w = 0; w < WORDS.length; w++) {
        const { rest } = WORDS[w];
        for (let i = 1; i <= rest.length; i++) {
          await sleep(TYPE_SPEED);
          if (cancelled) return;
          setTyped((prev) => {
            const next = [...prev];
            next[w] = rest.slice(0, i);
            return next;
          });
        }
      }
      setCursorDone(true);
      await sleep(900);
      if (cancelled) return;
      closeIntro();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div id="introOverlay" className={hidden ? 'hide' : undefined} aria-hidden="true">
      <button className="intro-skip" type="button" onClick={closeIntro}>
        Skip →
      </button>
      <div className="intro-letters">
        {WORDS.map((word, i) => (
          <span className="intro-word" key={word.first}>
            <span className="intro-first">{word.first}</span>
            <span className="intro-rest">{typed[i]}</span>
            {i === WORDS.length - 1 && (
              <span className={`intro-cursor${cursorDone ? ' done' : ''}`} />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
