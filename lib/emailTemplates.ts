// HTML + plain-text emails for the contact form.
//
// Built for mail clients, not browsers: table layout, inline styles, 600px
// max width, bulletproof (table-cell) buttons. A small <style> block adds
// progressive extras only — hover states, stacking under 480px, and a dark
// palette for clients that honour prefers-color-scheme (Apple Mail). Images
// are hosted PNGs on the site (public/email), each with alt text and an
// opaque background so they survive dark-mode inversion.

import { CONTACT_EMAIL, CONTACT_PHONE_E164, SITE_NAME, SITE_URL, WHATSAPP_URL } from './site';
import { socials, studio, team } from './content';

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  company: string;
  needs: string[];
  budget: string;
  timeline: string;
  message: string;
  /** Which form it came from: "home" or "contact-page". */
  source: string;
  /** Short id shown in both emails so a reply can be matched to the enquiry. */
  reference: string;
  receivedAt: Date;
};

/** e.g. FB-K7M2QX — time-derived, unique enough for a small studio's inbox. */
export function makeReference(now = Date.now()): string {
  return 'FB-' + now.toString(36).slice(-6).toUpperCase();
}

const RESPONSE_TIME = 'within 24–48 hours';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const C = {
  bg: '#EEF2F8',
  card: '#FFFFFF',
  border: '#DCE3EE',
  panel: '#F5F7FB',
  text: '#0B1220',
  muted: '#56627A',
  blue: '#1F5BD8', // brand blue, light-mode ink (passes 4.5:1 on white)
  blueSoft: '#EAF0FD',
  lime: '#C8F25A', // brand lime for the primary button
  onLime: '#0B1220',
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, '<br>');
const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'there';
const excerpt = (s: string, n = 280) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
const service = (e: Enquiry) => (e.needs.length ? e.needs.join(', ') : 'General enquiry');

function istTime(d: Date): string {
  return d.toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  }) + ' IST';
}

export function pageLabel(source: string): string {
  if (source === 'home') return `Home page (${SITE_URL.replace(/^https?:\/\//, '')}/#contact)`;
  if (source === 'contact-page') return `Contact page (${SITE_URL.replace(/^https?:\/\//, '')}/contact)`;
  return source || 'Unknown';
}

/** Digits for wa.me / tel:. A bare 10-digit number is assumed Indian (+91). */
export function phoneDigits(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
}

type Variant = 'primary' | 'secondary';
/** Bulletproof pill button: the colour lives on the cell, so it shows even
 *  where the link's padding is ignored. */
function button(href: string, label: string, variant: Variant = 'secondary'): string {
  const primary = variant === 'primary';
  const bg = primary ? C.lime : C.card;
  const color = primary ? C.onLime : C.blue;
  const border = primary ? C.lime : '#BFD0F5';
  return `<table role="presentation" cellpadding="0" cellspacing="0" class="btn-wrap" style="display:inline-table;margin:0 8px 10px 0;border-collapse:separate;"><tr>
  <td class="btn btn-${variant}" bgcolor="${bg}" style="border-radius:999px;background:${bg};border:1px solid ${border};">
    <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:600;line-height:1.2;color:${color};text-decoration:none;border-radius:999px;">${esc(label)}</a>
  </td></tr></table>`;
}

function label(text: string): string {
  return `<div class="t2" style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};margin:0 0 10px;">${esc(text)}</div>`;
}

/** Key/value rows in a bordered panel. Values are pre-escaped HTML. */
function rows(items: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="panel" style="border:1px solid ${C.border};border-radius:12px;border-collapse:separate;background:${C.panel};margin:0 0 24px;">
${items
  .map(
    ([k, v], i) => `<tr>
  <td class="stack t2" style="padding:12px 16px;width:32%;font-family:${MONO};font-size:12px;color:${C.muted};vertical-align:top;${i ? `border-top:1px solid ${C.border};` : ''}">${esc(k)}</td>
  <td class="stack t1" style="padding:12px 16px;font-family:${FONT};font-size:14px;line-height:1.55;color:${C.text};vertical-align:top;${i ? `border-top:1px solid ${C.border};` : ''}">${v}</td>
</tr>`
  )
  .join('\n')}
</table>`;
}

function socialRow(): string {
  const live = socials.filter((s) => s.url && s.url !== '#');
  if (!live.length) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 14px;"><tr>
${live
  .map(
    (s) => `<td style="padding:0 5px;"><a href="${esc(s.url)}" target="_blank"><img src="${SITE_URL}/email/${s.name.toLowerCase()}.png" width="32" height="32" alt="${esc(s.name)}" style="display:block;border:0;width:32px;height:32px;"></a></td>`
  )
  .join('')}
</tr></table>`;
}

/** Shared frame: logo header, white card, footer. */
function frame(o: { title: string; preheader: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(o.title)}</title>
<style>
  /* progressive enhancement only — everything works without this block */
  .btn a:hover { opacity: 0.88; }
  .btn-secondary:hover { background: ${C.blueSoft} !important; }
  .flink:hover { color: ${C.blue} !important; }
  @media (max-width: 480px) {
    .card { padding: 26px 20px !important; }
    .stack { display: block !important; width: 100% !important; box-sizing: border-box; }
    .stack + .stack { border-top: 0 !important; padding-top: 0 !important; }
    .btn-wrap { display: table !important; width: 100% !important; margin: 0 0 10px !important; }
    .btn-wrap td, .btn-wrap a { display: block !important; text-align: center !important; }
    h1 { font-size: 22px !important; }
  }
  @media (prefers-color-scheme: dark) {
    body, .bg { background: #0A0C10 !important; }
    .card { background: #11141B !important; border-color: #232A36 !important; }
    .panel { background: #181C25 !important; border-color: #232A36 !important; }
    .panel td { border-color: #232A36 !important; }
    .pill { background: #1A2540 !important; }
    .t1 { color: #F0F3F8 !important; }
    .t2 { color: #B4BCCB !important; }
    .ink { color: #7CA9FF !important; }
    .btn-secondary { background: #11141B !important; border-color: #3A4A6B !important; }
    .btn-secondary a { color: #7CA9FF !important; }
  }
</style>
</head>
<body class="bg" style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(o.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:${C.bg};">
<tr><td align="center" style="padding:32px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

  <tr><td style="padding:0 4px 18px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;"><a href="${SITE_URL}" target="_blank"><img src="${SITE_URL}/email/logo.png" width="40" height="40" alt="Forgebyte logo" style="display:block;border:0;width:40px;height:40px;border-radius:10px;"></a></td>
      <td style="padding-left:12px;vertical-align:middle;">
        <div class="t1" style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:-0.02em;color:${C.text};line-height:1.1;">${SITE_NAME}</div>
        <div class="t2" style="font-family:${MONO};font-size:11px;letter-spacing:0.08em;color:${C.muted};margin-top:3px;">Architecting Bold Ideas</div>
      </td>
    </tr></table>
  </td></tr>

  <tr><td class="card" style="background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:34px 34px 30px;">
    ${o.body}
  </td></tr>

  <tr><td align="center" style="padding:26px 10px 0;font-family:${FONT};font-size:12px;line-height:1.65;color:${C.muted};" class="t2">
    ${o.footer}
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

const contactLine = `<a class="flink" href="mailto:${CONTACT_EMAIL}" style="color:${C.muted};text-decoration:none;">${CONTACT_EMAIL}</a> &nbsp;·&nbsp; <a class="flink" href="tel:${CONTACT_PHONE_E164}" style="color:${C.muted};text-decoration:none;">${CONTACT_PHONE_E164.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2')}</a> &nbsp;·&nbsp; ${studio.city}, ${studio.country}`;

/* ------------------------------------------------------------------ */
/* Email A — confirmation to the visitor                                */
/* ------------------------------------------------------------------ */

export function visitorConfirmation(e: Enquiry, opts: { bookingUrl?: string } = {}): { subject: string; text: string; html: string } {
  const first = firstName(e.name);
  const subject = `We've received your message, ${first}`;
  const workUrl = `${SITE_URL}/work`;
  const bookUrl =
    opts.bookingUrl ||
    `https://wa.me/${CONTACT_PHONE_E164.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'd like to book a call about my enquiry ${e.reference}.`)}`;
  const signed = `${team.map((m) => m.short).join(' & ')}, ${SITE_NAME}`;

  const summary: [string, string][] = [
    ['What you need', esc(service(e))],
    ...(e.budget ? [['Budget', esc(e.budget)] as [string, string]] : []),
    ...(e.timeline ? [['Timeline', esc(e.timeline)] as [string, string]] : []),
    ['Your message', nl2br(excerpt(e.message))],
    ['Reference', `<span style="font-family:${MONO};">${esc(e.reference)}</span>`],
  ];

  const html = frame({
    title: subject,
    preheader: `Thanks for reaching out — we'll reply ${RESPONSE_TIME}. Reference ${e.reference}.`,
    body: `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr>
      <td class="ink pill" style="padding:6px 12px;border-radius:999px;background:${C.blueSoft};font-family:${MONO};font-size:12px;color:${C.blue};">&#10003;&nbsp; Message received &nbsp;·&nbsp; ${esc(e.reference)}</td>
    </tr></table>
    <h1 class="t1" style="margin:0 0 14px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:${C.text};">Hi ${esc(first)}, thanks for getting in touch.</h1>
    <p class="t1" style="margin:0 0 26px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.text};">
      We've got your message, and one of us will read it properly and reply <strong>${RESPONSE_TIME}</strong> &mdash; with next steps or a few questions.
    </p>

    ${label('Your enquiry')}
    ${rows(summary)}

    ${label('While you wait')}
    <div style="margin:0 0 18px;">
      ${button(workUrl, 'View our work', 'primary')}${button(WHATSAPP_URL, 'Chat on WhatsApp')}${button(bookUrl, 'Book a call')}
    </div>

    <p class="t2" style="margin:6px 0 22px;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.muted};">
      Want to add something &mdash; a deadline, a budget or a link? Just reply to this email; it comes straight to us.
    </p>
    <p class="t1" style="margin:0;font-family:${FONT};font-size:15px;line-height:1.5;color:${C.text};">&mdash; ${esc(signed)}</p>
    `,
    footer: `${socialRow()}
    <div style="margin:0 0 10px;">${contactLine}</div>
    <div>This is an automated confirmation of the message you sent through <a class="flink" href="${SITE_URL}" style="color:${C.muted};">${SITE_URL.replace(/^https?:\/\//, '')}</a>. If you didn't send it, you can ignore this email.</div>`,
  });

  const text = [
    `Hi ${first},`,
    '',
    `Thanks for getting in touch with ${SITE_NAME}. We've got your message, and one of us will reply ${RESPONSE_TIME} with next steps or a few questions.`,
    '',
    'YOUR ENQUIRY',
    `What you need: ${service(e)}`,
    ...(e.budget ? [`Budget:        ${e.budget}`] : []),
    ...(e.timeline ? [`Timeline:      ${e.timeline}`] : []),
    `Reference:     ${e.reference}`,
    'Your message:',
    excerpt(e.message),
    '',
    'WHILE YOU WAIT',
    `View our work:    ${workUrl}`,
    `Chat on WhatsApp: ${WHATSAPP_URL}`,
    `Book a call:      ${bookUrl}`,
    '',
    'Want to add something? Just reply to this email.',
    '',
    `— ${signed}`,
    '',
    '--',
    `${CONTACT_EMAIL} · ${CONTACT_PHONE_E164} · ${studio.city}, ${studio.country}`,
    `This is an automated confirmation of the message you sent through ${SITE_URL}.`,
  ].join('\n');

  return { subject, text, html };
}

/* ------------------------------------------------------------------ */
/* Email B — notification to the studio (WORK_MAIL)                     */
/* ------------------------------------------------------------------ */

export function studioNotification(e: Enquiry): { subject: string; text: string; html: string } {
  const first = firstName(e.name);
  const svc = service(e);
  const subject = `New enquiry: ${e.name} – ${svc}`;
  const replySubject = `Re: your ${SITE_NAME} enquiry (${e.reference})`;
  const mailto = `mailto:${e.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(`Hi ${first},\n\n`)}`;
  const digits = e.phone ? phoneDigits(e.phone) : '';
  const tel = digits ? `tel:+${digits}` : '';
  const wa = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${first}, this is ${team[0].short} from ${SITE_NAME} — thanks for your enquiry (${e.reference}).`)}` : '';

  const link = (href: string, text: string) => `<a class="ink" href="${esc(href)}" style="color:${C.blue};text-decoration:none;">${esc(text)}</a>`;
  const table: [string, string][] = [
    ['Name', esc(e.name)],
    ['Email', link(`mailto:${e.email}`, e.email)],
    ['Phone', e.phone ? link(tel, e.phone) : '—'],
    ...(e.company ? [['Company', esc(e.company)] as [string, string]] : []),
    ['Service', esc(svc)],
    ...(e.budget ? [['Budget', esc(e.budget)] as [string, string]] : []),
    ...(e.timeline ? [['Timeline', esc(e.timeline)] as [string, string]] : []),
    ['Submitted', esc(istTime(e.receivedAt))],
    ['Page', esc(pageLabel(e.source))],
    ['Reference', `<span style="font-family:${MONO};">${esc(e.reference)}</span>`],
  ];

  const html = frame({
    title: subject,
    preheader: excerpt(e.message, 120),
    body: `
    <div class="ink" style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.blue};margin:0 0 10px;">New enquiry &nbsp;·&nbsp; ${esc(e.reference)}</div>
    <h1 class="t1" style="margin:0 0 18px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:${C.text};">${esc(e.name)} &mdash; ${esc(svc)}</h1>

    <div style="margin:0 0 22px;">
      ${button(mailto, `Reply to ${first}`, 'primary')}${tel ? button(tel, 'Call') : ''}${wa ? button(wa, 'WhatsApp') : ''}
    </div>

    ${label('Details')}
    ${rows(table)}

    ${label('Message')}
    <div class="panel t1" style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.text};padding:16px 18px;border-left:3px solid ${C.blue};background:${C.panel};border-radius:0 10px 10px 0;margin:0 0 6px;">${nl2br(e.message)}</div>
    `,
    footer: `<div>Sent from the contact form on <a class="flink" href="${SITE_URL}" style="color:${C.muted};">${SITE_URL.replace(/^https?:\/\//, '')}</a>. Replying to this email goes straight to ${esc(e.name)}.</div>`,
  });

  const text = [
    `New enquiry via the ${SITE_NAME} contact form (${e.reference})`,
    '',
    `Name:      ${e.name}`,
    `Email:     ${e.email}`,
    `Phone:     ${e.phone || '—'}`,
    ...(e.company ? [`Company:   ${e.company}`] : []),
    `Service:   ${svc}`,
    ...(e.budget ? [`Budget:    ${e.budget}`] : []),
    ...(e.timeline ? [`Timeline:  ${e.timeline}`] : []),
    `Submitted: ${istTime(e.receivedAt)}`,
    `Page:      ${pageLabel(e.source)}`,
    '',
    'Message:',
    e.message,
    '',
    `Reply:     ${mailto}`,
    ...(tel ? [`Call:      ${tel}`] : []),
    ...(wa ? [`WhatsApp:  ${wa}`] : []),
  ].join('\n');

  return { subject, text, html };
}
