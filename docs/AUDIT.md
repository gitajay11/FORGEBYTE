# Forgebyte — pre-redesign audit

Written 12 Oct 2026, before any redesign code, against `main` at `ba03764`
(live on www.forgebyte.online) and the repo `gitajay11/FORGEBYTE`.

## Brief placeholders, filled from verified sources

| Placeholder | Value used | Source |
| --- | --- | --- |
| AGENCY NAME | Forgebyte | live site, `lib/site.ts` |
| FOUNDER NAME | Ajay Kumar | `lib/site.ts`, portfolio `lib/content.ts` (`AJAY` / `KUMAR`) |
| LOCATION | Chennai, India · IST (UTC+5:30) · 13.08°N 80.27°E | portfolio qualification location — **assumption**, confirm |
| SERVICES | Web applications · APIs & backend systems · MVP sprints · AI features in products · Ongoing support | live site services + the shipped Groq chat assistant (the AI line is evidenced by this site only — confirm it is sold) |
| IDEAL CLIENTS | Founders, early-stage startups and small businesses | live site copy ("founders and teams who need to move fast") + actual clients (F&B, retail) |
| ENGAGEMENT MODELS | Discovery call · Fixed-scope build · MVP sprint · Ongoing support | live site process + services |
| STARTING PRICE | On request (each build scoped and quoted) | no pricing published anywhere; the chat assistant is instructed never to quote |
| CASE STUDIES | Loopa, Nutriyah, Sri Cauvery Electronics, Élaré Beauty (client/product work); Ember & Oak, Care Dental (demos → Lab) | live Work section, local repos `cafe`, `dentist`, `electronics_pwa`, `elare` |
| TESTIMONIALS | **None** | nothing exists — Proof section shows thinking, not quotes |
| CONTACT | admin.forgebyte@gmail.com · WhatsApp +91 63749 72948 · github.com/gitajay11 · linkedin.com/in/ajayak1501 | `lib/site.ts`, portfolio `lib/content.ts` |
| EXISTING SITE / REPO | www.forgebyte.online · github.com/gitajay11/FORGEBYTE | |
| DOMAIN | www.forgebyte.online (apex 308 → www) | |
| EST. YEAR | 2026 | first commit of this repo — **assumption**, confirm |
| AVAILABILITY | Booking projects for Q4 2026 | existing hero badge |
| REPLY TIME | Within 1 working day | existing contact copy ("I'll reply within a day") |

## Baseline (live site)

- **Stack:** Next.js 16.3.1 (App Router), React 19.2.8, TypeScript, plain CSS
  (`app/globals.css`, ~600 lines), `next/font` (Inter + JetBrains Mono),
  Nodemailer over Gmail SMTP, Groq chat route. Deployed on Vercel from `main`.
- **Structure:** single page — Intro (ABI) → Header → Hero → About → Services →
  Work → Process → Contact → Footer, plus chat widget. Routes: `/`,
  `/api/chat`, `/api/contact`, robots, sitemap, icons, OG image.
- **Weight:** 8 scripts, 181.8 KB JS gzipped as first measured — but that
  figure included a 38.7 KB `nomodule` polyfill modern browsers never load,
  so the real up-front weight was ~143 KB. 6.5 KB CSS, 67.5 KB HTML.
- **Headings:** one H1, ordered H2/H3. All images have alt text.
- **Forms:** contact → `/api/contact` → two SMTP emails (studio + visitor
  confirmation, reference id). Chat leads → same inbox. Honeypot + per-IP
  rate limit.
- **Analytics:** none.
- **Responsive:** works 360–1920; mobile nav overlay; intro stacks below 900px.
- **Lighthouse:** not measured in this environment — run it on the preview
  deploy before merging.

## Keep

- Contact pipeline: `app/api/contact`, `lib/mail.ts`, `lib/emailTemplates.ts`
  (restyle the accent only), honeypot, rate limit, reference ids.
- Chat widget + `/api/chat` (FAQ and Groq), lead capture in `lib/leads.ts`.
  Restyle to the new tokens; update its project list.
- The ABI intro **mechanism** exactly as is: typed words, plays on every
  load, Skip, stacks vertically below 900px, hidden for reduced motion.
  Only its styling changes (owner instruction).
- Metadata base, canonical host, robots, sitemap, icons, JSON-LD.
- Project screenshots in `public/work/`.
- Verified facts: services, process, contact details, project descriptions.

## Rewrite

- **Visual system:** green-on-black terminal look → the brief's editorial
  system (tokens in `styles/tokens.css` + `lib/tokens.ts`). **Owner change:**
  the brief's violet accent is replaced with blue, and a light theme was
  added alongside dark (follows the OS, with a toggle).
- **Typography:** Inter → Space Grotesk (display + body), keep JetBrains Mono.
- **Information architecture:** one page → Home + `/work`, `/work/[slug]`,
  `/services`, `/studio`, `/contact`, `/lab`, `/privacy`, custom 404.
- **Copy:** first person singular ("I") → studio "we" with the founder named,
  per the brief's voice rules.
- **Hero:** add the 3D centrepiece (progressive, lazy, poster fallback).
- **Work:** identical cards → per-project worlds and case-study pages.
- **Contact form:** 4 fields → brief's 7 (name, email, company, needs,
  budget, timeline, problem); emails updated to carry the new fields.
- **OG image:** static PNG → generated, on-brand.
- **Social links:** `github.com/forgebyte`, `linkedin.com/in/forgebyte` and
  `x.com/forgebyte` are **not ours** — replace with the founder's real links.

## Missing — needs the owner

1. **Client permission** to name Loopa, Nutriyah, Sri Cauvery Electronics and
   Élaré Beauty as case studies. They are already public on the live site, so
   they stay named, but written consent should be on file.
2. **Testimonials** — none exist. Ask the four clients for one or two lines
   each (name, role, consent).
3. **Verified outcomes** — no metrics for any project. Case studies use
   clearly labelled qualitative outcomes until real numbers exist.
4. **Project years, durations and Ajay's exact role** per project — not
   recorded anywhere. Shown as "2026" (when they were added) and marked for
   confirmation.
5. **Booking link** (Cal.com or similar) — none. WhatsApp + email are used.
6. **Pricing floor** — "on request" until a number is chosen.
7. **Founding year and city** — assumed 2026 and Chennai; confirm.
8. **Founder portrait** — none supplied; the Studio section uses a
   typographic treatment instead.
9. **AI service line** — evidenced only by this site's own assistant. Confirm
   it should be marketed, or drop it.
10. **Élaré Beauty** — client or own product? Shown as "in progress".
11. **Privacy policy** — no existing text; a plain-language draft is added
    and should be reviewed.

## Technology decisions

- **Next.js App Router** stays — SEO, per-page metadata, case-study routes,
  server-side forms.
- **three.js directly** (no React Three Fiber / Drei): one hero scene and one
  404 scene; plain three keeps the lazy bundle small and every geometry,
  material and renderer has one explicit `dispose()` path.
- **GSAP + ScrollTrigger** for scroll choreography (Process pin, Work track).
- **No Lenis** — native scroll keeps anchors, find-in-page and keyboard
  scrolling reliable.
- **No Framer Motion** — CSS transitions and the View Transitions API cover
  component and route transitions without another ~40 KB.
- **Case-study worlds** are 2D canvas scenes, not separate WebGL contexts:
  cheaper on phones, and the brief caps 3D to where it earns its cost.
- **Analytics:** `@vercel/analytics` (cookieless) with custom events.

## Results after the rebuild (redesign branch)

| Check | Result |
| --- | --- |
| Up-front JS, modern browsers | 143–152 KB gzipped per page (budget 180) |
| Lazy 3D bundle (three.js + scene) | 133 KB gzipped (budget 350) |
| GSAP + ScrollTrigger | 18 KB, desktop + full motion only |
| Pages × widths (375, 1440) | 24/24: no JS errors, no horizontal overflow |
| Headings | one H1 per page, no skipped levels |
| Images / controls | all images have alt; all buttons and links labelled |
| Contrast | every text token ≥ 4.5:1 in both themes |
| No JavaScript | full content, offer and CTA visible; intro skipped |
| Reduced motion | no intro, no pins, poster instead of 3D, content identical |
| Contact form | validated, end-to-end tested: both emails carry the new fields and a shared reference |
| 404 | returns a real 404 status |

Not measured here: Lighthouse scores, real-device Safari/iOS, screen readers
(VoiceOver / NVDA). Do these on the preview deploy before merging.
