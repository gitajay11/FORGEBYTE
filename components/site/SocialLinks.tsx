import { socials } from '@/lib/content';

// Inline stroke icons in the same style as the theme toggle — no icon
// library. Shapes from Lucide (ISC) and Tabler (MIT, for X, WhatsApp and Telegram).
const ICONS: Record<(typeof socials)[number]['name'], React.ReactNode> = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  X: (
    <>
      <path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
    </>
  ),
  YouTube: (
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  Facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  WhatsApp: (
    <>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </>
  ),
  Telegram: <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />,
};

export default function SocialLinks() {
  return (
    <ul className="socials" aria-label="Forgebyte on social media">
      {socials.map((s) => (
        <li key={s.name}>
          <a
            className="social-link"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Forgebyte on ${s.name} (opens in a new tab)`}
            data-track={`social_click:${s.name.toLowerCase()}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[s.name]}</svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
