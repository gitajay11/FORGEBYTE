'use client';

import { useEffect, useState } from 'react';

const LINE_1 = 'forgebyte — freelance full-stack web development';
const LINE_2 = 'Code that ships. Products that scale.';

const TERMINAL_LABEL =
  'Terminal window showing: whoami returns forgebyte, freelance full-stack web development. cat mission.txt returns Code that ships. Products that scale.';

export default function Terminal() {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLine1(LINE_1);
      setLine2(LINE_2);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    const type = async (
      text: string,
      speed: number,
      set: (value: string) => void
    ) => {
      for (let i = 1; i <= text.length; i++) {
        await sleep(speed);
        if (cancelled) return;
        set(text.slice(0, i));
      }
    };

    (async () => {
      await type(LINE_1, 28, setLine1);
      if (cancelled) return;
      await sleep(250);
      if (cancelled) return;
      await type(LINE_2, 32, setLine2);
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="terminal" role="img" aria-label={TERMINAL_LABEL}>
      <div className="terminal-bar">
        <span />
        <span />
        <span />
      </div>
      <div className="terminal-body">
        <div className="term-line">
          <span className="prompt">➜</span> whoami
        </div>
        <div className="term-output">{line1}</div>
        <div className="term-line">
          <span className="prompt">➜</span> cat mission.txt
        </div>
        <div className="term-output accent">{line2}</div>
        <span className="cursor" />
      </div>
    </div>
  );
}
