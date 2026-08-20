# Forgebyte

Marketing site for Forgebyte, a freelance web application development studio.
Next.js App Router + TypeScript.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # production build
npm start       # serve the production build
```

## Structure

```
app/
  layout.tsx     root layout, fonts (next/font), metadata
  page.tsx       composes the one-page site
  globals.css    all styling — ported verbatim from the original static page
components/
  IntroOverlay   "Architecting Bold Ideas" intro animation   (client)
  Header         sticky nav + mobile toggle                  (client)
  Hero           hero copy + Terminal
  Terminal       typing animation                            (client)
  About          stack chips
  Services       service cards
  Work           case studies — PLACEHOLDER CONTENT
  Process        four-stage process list
  Contact        contact form + Select                       (client)
  Select         themed dropdown (button + listbox)          (client)
  Footer
legacy/
  index.html     the original single-file site, kept for reference
```

Styling is plain CSS with custom properties in `app/globals.css` — no Tailwind.
Fonts are self-hosted at build time via `next/font/google`.

## Before going live

- `components/Work.tsx` renders a visible "⚠ Placeholder content" banner and
  three invented case studies. Replace or remove the section.
- Contact details in `components/Contact.tsx` are placeholders: the email,
  Calendly, GitHub, LinkedIn and X links all point at `forgebyte` handles that
  don't exist.
- The hero badge in `components/Hero.tsx` advertises availability for Q4 2026.
- No favicon, Open Graph tags, or structured data yet.

## Contact form

Posts to Formspree (endpoint in `components/Contact.tsx`). Add the production
domain to the form's **Allowed Domains** in the Formspree dashboard before
launch, or submissions will be rejected once deployed.
