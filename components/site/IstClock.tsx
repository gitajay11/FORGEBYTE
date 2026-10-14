'use client';

import { useEffect, useState } from 'react';

// Live time in Chennai (IST), 24-hour, e.g. 14:05:32. Rendered on the client
// after mount (no hydration mismatch); until then a hidden placeholder keeps
// its width. Tabular digits, so nothing shifts as it ticks. Below 360px the
// seconds are hidden (globals.css, .ist-sec).
const FMT = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export default function IstClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer = 0;
    // tick on the second boundary, so it changes with the real clock
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const p = now ? Object.fromEntries(FMT.formatToParts(now).map((x) => [x.type, x.value])) : null;
  return (
    <span className="ist-clock" style={{ visibility: p ? 'visible' : 'hidden' }}>
      {p ? `${p.hour}:${p.minute}` : '00:00'}
      <span className="ist-sec">{p ? `:${p.second}` : ':00'}</span>
    </span>
  );
}
