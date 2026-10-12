'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motionReduced } from '@/lib/prefs';

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

// Horizontal project carousel. A native scroller does the moving (touch
// swipe, trackpad, scroll-snap); the arrows, dots and ←/→ keys just scroll it
// to a card, and the active dot follows the scroll position.
export default function WorkCarousel({ items }: { items: WorkItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const cards = () => [...(trackRef.current?.querySelectorAll<HTMLElement>('.work-card') ?? [])];

  const goTo = (i: number) => {
    const track = trackRef.current;
    const card = cards()[Math.max(0, Math.min(items.length - 1, i))];
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft, behavior: motionReduced() ? 'auto' : 'smooth' });
  };

  // which card is in front: the one nearest the left edge, or the last at the end
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= max - 2) return setIndex(items.length - 1);
      const offsets = cards().map((c) => Math.abs(c.offsetLeft - track.scrollLeft));
      setIndex(offsets.indexOf(Math.min(...offsets)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // cards() reads the DOM; items only changes with the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(items.length - 1); }
  };

  return (
    <div className="work-carousel" role="region" aria-roledescription="carousel" aria-label="Our projects" onKeyDown={onKeyDown}>
      <div className="work-track" ref={trackRef} tabIndex={0} aria-label="Projects — use the arrow keys to move between them">
        {items.map((it, i) => (
          <article
            className="work-card"
            key={it.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}: ${it.title}`}
          >
            <div className="work-card-media">
              <Image src={it.image} alt={it.imageAlt} width={1000} height={625} sizes="(max-width: 767px) 85vw, 640px" />
            </div>
            <div className="work-card-body">
              <div className="meta-row">
                <span className="mono">{it.industry}</span>
                <span className="status" data-status={it.status}>{it.status}</span>
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

      <div className="work-controls">
        <button type="button" className="work-arrow" aria-label="Previous project" onClick={() => goTo(index - 1)} disabled={index === 0}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="work-dots">
          {items.map((it, i) => (
            <button
              type="button"
              key={it.slug}
              className="work-dot"
              aria-label={`Show project ${i + 1}: ${it.title}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="work-arrow" aria-label="Next project" onClick={() => goTo(index + 1)} disabled={index === items.length - 1}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
