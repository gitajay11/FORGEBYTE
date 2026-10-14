'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CaseStudy, Service } from '@/lib/content';
import StatusBadge from './StatusBadge';

type Props = {
  items: CaseStudy[];
  services: Pick<Service, 'slug' | 'name'>[];
};

/**
 * Work index: big titles, a preview that follows the pointer within bounds
 * (desktop), static posters on mobile, filters synced to the URL so a
 * filtered view can be shared.
 */
export default function WorkIndex({ items, services }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const service = params.get('service') ?? '';
  const industry = params.get('industry') ?? '';
  const industries = useMemo(() => [...new Set(items.map((i) => i.industry))], [items]);

  const shown = items.filter(
    (i) => (!service || i.services.includes(service)) && (!industry || i.industry === industry)
  );

  const setFilter = (key: 'service' | 'industry', value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // Pointer-following preview, clamped to the list's bounds
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<CaseStudy | null>(null);
  useEffect(() => {
    const el = list.current;
    const pv = preview.current;
    if (!el || !pv || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0, x = 0, y = 0, cx = 0, cy = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = Math.min(Math.max(e.clientX, r.left + 200), r.right - 200);
      y = Math.min(Math.max(e.clientY, r.top + 120), r.bottom - 120);
      if (!raf) loop();
    };
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      pv.style.left = `${cx}px`;
      pv.style.top = `${cy}px`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    el.addEventListener('pointermove', move);
    return () => {
      el.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="filters" role="group" aria-label="Filter work">
        <div className="group">
          <span className="mono">Service</span>
          {services.map((s) => (
            <button key={s.slug} type="button" aria-pressed={service === s.slug} onClick={() => setFilter('service', s.slug)}>
              {s.name}
            </button>
          ))}
        </div>
        <div className="group">
          <span className="mono">Industry</span>
          {industries.map((ind) => (
            <button key={ind} type="button" aria-pressed={industry === ind} onClick={() => setFilter('industry', ind)}>
              {ind}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'project' : 'projects'} shown
      </p>

      <ul className="work-index" ref={list} onPointerLeave={() => setHover(null)}>
        {shown.map((cs) => (
          <li key={cs.slug}>
            <Link
              href={`/work/${cs.slug}`}
              data-cursor="view"
              onPointerEnter={() => setHover(cs)}
              onFocus={() => setHover(null)}
            >
              <span className="t">{cs.title}</span>
              <span className="i mono">{cs.industry} · {cs.year}</span>
              <span className="s"><StatusBadge status={cs.status} /></span>
              <span className="poster">
                <Image src={cs.image} alt="" width={1000} height={625} sizes="100vw" />
              </span>
            </Link>
          </li>
        ))}
        {!shown.length && (
          <li style={{ padding: '32px 0', color: 'var(--text-2)' }}>
            Nothing matches both filters yet.{' '}
            <button type="button" className="ulink" onClick={() => router.replace(pathname, { scroll: false })}>
              Clear filters
            </button>
          </li>
        )}
      </ul>

      <div className="preview" ref={preview} data-on={Boolean(hover)} aria-hidden="true">
        {hover && <Image src={hover.image} alt="" width={1000} height={625} sizes="380px" />}
      </div>
    </>
  );
}
