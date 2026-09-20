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

1. **To the studio inbox** — the enquiry, with the visitor in `Reply-To` so
   replying from Gmail goes straight back to them. If this send fails the
   form reports an error.
2. **To the visitor** — a confirmation with a copy of their message and
   WhatsApp / site links. Sent after the response via `after()`; a failure
   here is logged, not surfaced.

Chat-widget leads (`lib/leads.ts`) go to the studio inbox through the same
transport. There is no fallback: without `SMTP_HOST`, `SMTP_USER` and
`SMTP_PASS` the route returns 503 and the form shows an error.

Set these in Vercel (Settings → Environment Variables) and redeploy:

| Variable    | Example          | Notes                                  |
| ----------- | ---------------- | -------------------------------------- |
| `SMTP_HOST` | `smtp.gmail.com` |                                        |
| `SMTP_PORT` | `465`            | 465 = TLS (default), 587 = STARTTLS    |
| `SMTP_USER` | `you@gmail.com`  | The mailbox that sends                 |
| `SMTP_PASS` | app password     | Gmail needs an App Password, not login |

Rate limit: 5 submissions per IP per 10 minutes, per serverless instance
(the same caveat as the chat limiter — it trims abuse, it is not a quota).

## Still outstanding

- The social links in `components/Contact.tsx` point at `github.com/forgebyte`,
  `linkedin.com/in/forgebyte` and `x.com/forgebyte` — none of which are ours.
- The hero badge in `components/Hero.tsx` advertises availability for Q4 2026.
- Nav order doesn't match page order: the page runs Services before Work, but
  the nav lists Work first, so the scroll-spy indicator appears to jump back.
