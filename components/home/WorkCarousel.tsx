'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import StatusBadge from '@/components/work/StatusBadge';

export type WorkItem = {
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  industry: string;
  status: string;
  oneLiner: string;
  tags: string[];
};

// Scroll-driven horizontal row of project cards.
//
// Desktop with motion on: .work-pin is tall (100vh + the row's overflow — its
// height comes from CSS, so it is right from the first paint and the pinned
// "How it works" section below measures correctly). Inside, .work-sticky
// sticks for that distance and this component maps the page's vertical
// progress through it onto translateX of the row, eased with a lerp. A
// passive scroll listener only — the page is never held or prevented.
//
// Phones and reduced motion: CSS turns it into a native swipe row with
// scroll-snap; this component then does nothing.
export default function WorkCarousel({ items }: { items: WorkItem[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const pin = pinRef.current, sticky = stickyRef.current, row = rowRef.current;
    if (!pin || !sticky || !row) return;

    let raf = 0;
    let current = 0;
    let target = 0;
    let maxShift = 0;
    const pinned = () => getComputedStyle(sticky).position === 'sticky';

    const measure = () => {
      maxShift = Math.max(0, row.scrollWidth - sticky.clientWidth);
    };
    const readTarget = () => {
      const range = pin.offsetHeight - window.innerHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, -pin.getBoundingClientRect().top / range)) : 0;
      target = progress * maxShift;
    };
    const markActive = () => {
      const mid = sticky.clientWidth / 2;
      const cards = [...row.querySelectorAll<HTMLElement>('.work-card')];
      const dist = cards.map((c) => Math.abs(c.offsetLeft - current + c.offsetWidth / 2 - mid));
      setActive(dist.indexOf(Math.min(...dist)));
    };
    const frame = () => {
      raf = 0;
      if (!pinned()) {
        row.style.transform = '';
        return;
      }
      current += (target - current) * 0.16;
      if (Math.abs(target - current) < 0.4) current = target;
      row.style.transform = `translate3d(${-current}px, 0, 0)`;
      markActive();
      if (current !== target) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (!pinned()) return;
      // re-measure every time: the scrollbar appears after the intro, which
      // narrows the viewport without firing a resize
      measure();
      readTarget();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      readTarget();
      current = target; // jump, don't glide, after a resize
      if (!raf) raf = requestAnimationFrame(frame);
    };

    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('fb-prefs', onResize); // motion toggle in the footer
    window.addEventListener('fb-restored', onResize); // back on the landing page: jump, don't glide
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('fb-prefs', onResize);
      window.removeEventListener('fb-restored', onResize);
      row.style.transform = '';
    };
  }, []);

  // Tabbing to a card that is off to the side: bring it to the middle by
  // scrolling the page to the matching point (the row follows the page).
  // Keyboard focus only — a mouse click on a card must not move the page.
  const onFocusCapture = (e: React.FocusEvent) => {
    const pin = pinRef.current, sticky = stickyRef.current, row = rowRef.current;
    if (!(e.target as HTMLElement).matches(':focus-visible')) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('.work-card');
    if (!pin || !sticky || !row || !card || getComputedStyle(sticky).position !== 'sticky') return;
    sticky.scrollLeft = 0; // focus may have scrolled the clipped box itself
    const maxShift = row.scrollWidth - sticky.clientWidth;
    const range = pin.offsetHeight - window.innerHeight;
    if (maxShift <= 0 || range <= 0) return;
    const want = Math.min(maxShift, Math.max(0, card.offsetLeft - (sticky.clientWidth - card.offsetWidth) / 2));
    const pinTop = pin.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: pinTop + (want / maxShift) * range, behavior: 'auto' });
  };

  return (
    <div className="work-pin" ref={pinRef} style={{ '--n': items.length } as React.CSSProperties}>
      <div className="work-sticky" ref={stickyRef}>
        <div className="work-row" ref={rowRef} onFocusCapture={onFocusCapture} role="list" aria-label="Our projects">
          {items.map((it, i) => (
            <article className="work-card" key={it.slug} role="listitem" data-active={i === active} aria-label={`${i + 1} of ${items.length}: ${it.title}`}>
              <div className="work-card-media">
                <Image src={it.image} alt={it.imageAlt} width={1000} height={625} sizes="(max-width: 767px) 85vw, 620px" />
              </div>
              <div className="work-card-body section-body">
                <div className="meta-row">
                  <span className="mono">{it.industry}</span>
                  <StatusBadge status={it.status} />
                </div>
                <h3>
                  {/* stretched link: the whole card opens the case study */}
                  <Link href={`/work/${it.slug}`} className="work-card-link" data-cursor="view">{it.title}</Link>
                </h3>
                <p>{it.oneLiner}</p>
                <div className="work-card-foot">
                  <ul className="tags" aria-label="What we did">
                    {it.tags.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  <span className="work-card-more" aria-hidden="true">Read the story →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
