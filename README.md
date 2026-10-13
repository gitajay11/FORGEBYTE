# Forgebyte

Studio site for Forgebyte: an editorial site in plain English, with a lazily
loaded 3D hero, real screenshots of every project, case-study pages and a
contact pipeline over SMTP. Next.js App Router + TypeScript, three.js, GSAP.

Background for the redesign: `docs/AUDIT.md` (what was kept, rewritten and
missing) and `docs/HANDOVER.md` (assumptions and placeholders to confirm).

## Running locally

```bash
npm install
npm run dev -- -p 3001     # 3000 is often taken locally
```

```bash
npm run build   # production build
npm start       # serve the production build
```

## Structure

```
app/
  layout.tsx            fonts, metadata, pre-paint prefs script, nav/footer/intro/chat
  template.tsx          route curtain (re-mounts on every navigation)
  page.tsx              home: hero → positioning → services → work → process →
                        proof → founder → lab → engagement → FAQ → contact
  work/, work/[slug]/   work index (URL-synced filters) and case studies
  services/ studio/ contact/ lab/ privacy/   inner pages
  not-found.tsx         404 with a particle scene
  opengraph-image.tsx   generated share image (twitter-image re-exports it)
  api/chat, api/contact route handlers (Groq; SMTP)
components/
  site/                 Nav (sticky; shows the hero tagline once past the hero),
                        Footer, Cursor, theme toggles, SiteEffects
  home/                 HeroStage, IdeaField, Constellation, ScrollStories, Portrait, …
  work/ studio/ lab/ contact/ motion/
  BrowserFrame.tsx      a project screenshot inside a simple browser window
  lazy.tsx              code-split islands (decorative canvases, GSAP, chat, cursor)
scenes/hero.ts          the three.js centrepiece
lib/
  content.ts            ALL copy and project data
  tokens.ts             colour/motion tokens for canvas + 3D (mirrors styles/tokens.css)
  prefs.ts              theme / motion / cursor prefs and device tier
  mail.ts, emailTemplates.ts, leads.ts, rateLimit.ts, track.ts, site.ts
styles/tokens.css       design tokens, dark + light themes
styles/chat.css         chat widget
```

## Editing content

Everything a visitor reads lives in `lib/content.ts`: studio facts,
services, case studies, lab items, process, engagement models and FAQ. Edit
there; no layout or animation code needs to change.

**Integrity rule:** never add a client, metric, testimonial or credential that
isn't real. Unconfirmed values are listed in `docs/HANDOVER.md`.

### Adding a project

1. Screenshot the site's homepage at 1600×1000 and save it to `public/work/`
   at 1000×625 (JPEG for photo-heavy sites, PNG otherwise).
2. Add an entry to `caseStudies` in `lib/content.ts`, written in plain
   English — say what it does for the customer, keep tool names to `stack`.
3. That's it: the home page, `/work`, `/work/<slug>`, the sitemap and the
   links in "How we think" all read from the same list.

Demo sites go in `lab` instead, so they're never mistaken for client work.

### Writing copy

Most visitors are business owners, not developers. Use everyday words
("online store", "payments", "care after launch"), explain any technical term
you can't avoid, and keep sentences short.

## Themes, motion and accessibility

- **Themes:** dark by default, light when the device prefers it, or by the nav /
  footer toggle (stored in `localStorage`). Colours come only from
  `styles/tokens.css`; canvas and 3D code reads `palette(theme)` from
  `lib/tokens.ts` — keep the two in sync.
- **Motion:** OS reduced-motion or the footer toggle removes the intro, pins,
  parallax and 3D (a static poster shows instead). Content is identical.
- **Device tier** (`lib/prefs.ts`): `high` / `low` (touch, ≤4 GB, ≤4 cores)
  / `static` (reduced motion, Save-Data, no WebGL).
- **Without JavaScript** every page is readable and the intro never shows.
- Reveal animations are CSS, triggered by one IntersectionObserver in
  `SiteEffects`; mark elements with `data-reveal`, or use `<Words>` /
  `<TypeIn>` from `components/motion/Text.tsx`.

## Performance budget

| | Budget | Now |
| --- | --- | --- |
| Up-front JS (modern browsers) | 180 KB gz | 143–152 KB |
| Lazy 3D bundle | 350 KB gz | 133 KB |

Measure from the server HTML, excluding `nomodule` scripts (legacy
polyfills modern browsers never download).

## Analytics

`@vercel/analytics` (cookieless). Events: `cta_click`, `form_start`,
`form_submit`, `booking_click`, `case_study_depth`. Tag any link with
`data-track="cta_click:label"` to report it.

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
periodically (llama-3.3-70b-versatile was shut off on 2026-08-16), so if
replies start failing check
<https://console.groq.com/docs/models>.

### Limits worth knowing

Rate limiting in the route is an in-memory map, so on serverless **each
instance keeps its own counter** — it deters casual abuse but is not a real
spend guard. If the endpoint gets hit hard, move the counter to Vercel KV or
Upstash, and set a spend limit in the Groq console.

The system prompt forbids quoting prices, since none are published on the
site. If pricing is added, update the prompt in `app/api/chat/route.ts`.

## Contact form

The form posts to `/api/contact` (`app/api/contact/route.ts`), which sends
two emails over SMTP via Nodemailer (`lib/mail.ts`, templates in
`lib/emailTemplates.ts`):

1. **To the studio (`WORK_MAIL`)** — "New enquiry: Name – Service": every
   field (incl. phone, page, IST time) plus Reply / Call / WhatsApp buttons.
   The visitor is in `Reply-To`, so replying goes straight back to them.
2. **To the visitor** — "We've received your message, Name": a summary of
   what they sent, the expected reply time, and View our work / Chat on
   WhatsApp / Book a call buttons. `Reply-To` is `WORK_MAIL`.

Both are sent at once (`Promise.allSettled`). If the studio copy fails the
form shows an error and keeps the visitor's input; if only the confirmation
fails the enquiry still counts as sent and the failure is logged. Each email
has an HTML and a plain-text version; images are hosted PNGs in
`public/email/` (regenerate them if the brand changes).

Chat-widget leads (`lib/leads.ts`) go to the studio inbox through the same
transport. There is no fallback: without `SMTP_HOST`, `SMTP_USER` and
`SMTP_PASS` the route returns 503 and the form shows an error.

Set these in Vercel (Settings → Environment Variables) and redeploy:

| Variable      | Example                        | Notes                                              |
| ------------- | ------------------------------ | -------------------------------------------------- |
| `SMTP_HOST`   | `smtp.gmail.com`               | required                                           |
| `SMTP_PORT`   | `465`                          | 465 = TLS (default), 587 = STARTTLS                |
| `SMTP_SECURE` | `true`                         | optional; guessed from the port when empty         |
| `SMTP_USER`   | `you@gmail.com`                | required; the mailbox that sends                   |
| `SMTP_PASS`   | app password                   | required; Gmail needs an App Password, not login   |
| `MAIL_FROM`   | `Forgebyte <you@gmail.com>`    | optional; default `Forgebyte <SMTP_USER>`          |
| `WORK_MAIL`   | `hello@forgebyte.online`       | optional; default `CONTACT_EMAIL` in `lib/site.ts` |
| `BOOKING_URL` | `https://cal.com/forgebyte/30` | optional; without it "Book a call" opens WhatsApp  |

Rate limit: 5 submissions per IP per 10 minutes, per serverless instance
(the same caveat as the chat limiter — it trims abuse, it is not a quota).

## Deploying

Vercel builds production from `main`. Preview deployments for other branches
are currently **off** for this project — see `docs/HANDOVER.md`.
