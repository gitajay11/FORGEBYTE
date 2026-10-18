'use client';

/** "Visit site ↗": opens a live site in a new tab. The click stops here so a
 *  card's own stretched link (or scroll handling) never fires as well.
 *  className picks the look: "visit-btn" (capsule) or "visit-pill" (glass,
 *  over a preview image). */
export default function VisitSite({ href, title, className }: { href: string; title: string; className: string }) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${title} (opens in new tab)`}
      onClick={(e) => e.stopPropagation()}
    >
      Visit site <span aria-hidden="true">↗</span>
    </a>
  );
}
