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

## Chat widget

`components/ChatWidget.tsx` has two tabs:

- **Quick answers** — scripted Q&A, no network calls, always works.
- **Ask AI** — streams from Groq via `app/api/chat/route.ts`.

### Setting up the AI tab

The key is read server-side only and never reaches the browser. Until it is
set, the Ask AI tab returns a friendly "not configured yet" message and the
Quick answers tab keeps working.

1. Get a key at <https://console.groq.com/keys>.
2. Local: `cp .env.example .env.local` and paste the key into `.env.local`
   (gitignored — never commit a real key).
3. Production: add `GROQ_API_KEY` under **Settings → Environment Variables**
   in Vercel, then redeploy. Environment variables are not picked up by an
   existing deployment.

`GROQ_MODEL` optionally overrides the model. Groq retires model ids
periodically, so if replies start failing check
<https://console.groq.com/docs/models>.

### Limits worth knowing

Rate limiting in the route is an in-memory map, so on serverless **each
instance keeps its own counter** — it deters casual abuse but is not a real
spend guard. If the endpoint gets hit hard, move the counter to Vercel KV or
Upstash, and set a spend limit in the Groq console.

The system prompt forbids quoting prices, since none are published on the
site. If pricing is added, update the prompt in `app/api/chat/route.ts`.

## Contact form

Posts to Formspree (endpoint in `components/Contact.tsx`). Add the production
domain to the form's **Allowed Domains** in the Formspree dashboard before
launch, or submissions will be rejected once deployed.

## Still outstanding

- The social links in `components/Contact.tsx` point at `github.com/forgebyte`,
  `linkedin.com/in/forgebyte` and `x.com/forgebyte` — none of which are ours.
- The hero badge in `components/Hero.tsx` advertises availability for Q4 2026.
- Nav order doesn't match page order: the page runs Services before Work, but
  the nav lists Work first, so the scroll-spy indicator appears to jump back.
