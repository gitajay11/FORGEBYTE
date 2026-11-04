'use client';

import { useEffect, useState } from 'react';
import { quarterLabel } from '@/lib/quarter';

/**
 * The current quarter ("Q4 2026"). Pages are built ahead of time, so the
 * server passes the quarter at build time and the browser corrects it on load
 * if the site hasn't been redeployed since the quarter changed.
 */
export default function Availability({ initial }: { initial: string }) {
  const [label, setLabel] = useState(initial);
  useEffect(() => {
    setLabel(quarterLabel());
  }, []);
  return <>{label}</>;
}
