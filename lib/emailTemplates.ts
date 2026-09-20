// HTML email templates for the contact form. Everything is inline-styled and
// table-based because that is still what mail clients reliably render; the
// palette borrows the site's #39FF88 accent, but on a light neutral ground —
// a full-bleed dark email reads as a wall of black in Gmail, and light stays
// readable in every client, including ones that ignore dark-mode hints.

import { CONTACT_EMAIL, SITE_NAME, SITE_URL, WHATSAPP_URL } from './site';

export type Enquiry = {
  name: string;
  email: string;
  projectType: string;
  message: string;
  /** Short id shown in both emails so a reply can be matched to the enquiry. */
  reference: string;
  receivedAt: Date;
};

/** e.g. FB-K7M2QX — time-derived, unique enough for a one-person inbox. */
export function makeReference(now = Date.now()): string {
  return 'FB-' + now.toString(36).slice(-6).toUpperCase();
}

function formatReceived(d: Date): string {
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  });
}

/** Small uppercase mono label used above each section of the card. */
function label(text: string, mb = 12): string {
  return `<div style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.cardMuted};margin:0 0 ${mb}px;">${esc(text)}</div>`;
}

const C = {
  bg: '#F3F6F4',
  accent: '#39FF88',
  accentOn: '#04140B',
  text: '#111814',
  muted: '#6B7A70',
  cardBg: '#FFFFFF',
  cardText: '#111814',
  cardMuted: '#5B6B60',
  cardBorder: '#E3EBE6',
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(s: string): string {
  return esc(s).replace(/\r?\n/g, '<br>');
}

function button(href: string, label: string, primary = true): string {
  // Neon green text on the white card fails contrast, so the ghost variant
  // uses the darker green the eyebrow labels use.
  const bg = primary ? C.accent : 'transparent';
  const color = primary ? C.accentOn : '#1E9A55';
  const border = primary ? C.accent : '#BFE3CD';
  return `<a href="${esc(href)}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:${bg};color:${color};border:1px solid ${border};font-family:${MONO};font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.01em;">${esc(label)}</a>`;
}

/** Shared frame: wordmark, white card, small-print footer on a light ground. */
function frame(opts: { preheader: string; eyebrow: string; title: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<!-- preheader: shows next to the subject in the inbox list, hidden in the body -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(opts.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <!-- header -->
  <tr><td style="padding:0 4px 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:34px;height:34px;border-radius:8px;background:${C.accent};text-align:center;vertical-align:middle;font-family:${MONO};font-weight:700;font-size:16px;color:${C.accentOn};">{}</td>
      <td style="padding-left:10px;font-family:${MONO};font-size:17px;font-weight:600;color:${C.text};letter-spacing:-0.01em;">forgebyte</td>
    </tr></table>
  </td></tr>

  <!-- card -->
  <tr><td style="background:${C.cardBg};border-radius:14px;border:1px solid #DDE6E0;padding:32px 32px 28px;">
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#1E9A55;margin-bottom:12px;">${esc(opts.eyebrow)}</div>
    <h1 style="margin:0 0 18px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:${C.cardText};letter-spacing:-0.02em;">${esc(opts.title)}</h1>
    ${opts.body}
  </td></tr>

  <!-- footer -->
  <tr><td style="padding:22px 4px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
    ${opts.footer}
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function detailRows(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.cardBorder};border-radius:10px;overflow:hidden;margin:0 0 20px;">
${rows
  .map(
    ([k, v], i) => `<tr>
  <td style="padding:11px 14px;width:34%;font-family:${MONO};font-size:12px;color:${C.cardMuted};background:#F6F9F7;${i ? `border-top:1px solid ${C.cardBorder};` : ''}vertical-align:top;">${esc(k)}</td>
  <td style="padding:11px 14px;font-family:${FONT};font-size:14px;color:${C.cardText};${i ? `border-top:1px solid ${C.cardBorder};` : ''}vertical-align:top;">${v}</td>
</tr>`
  )
  .join('\n')}
</table>`;
}

/* ------------------------------------------------------------------ */
/* To the studio                                                        */
/* ------------------------------------------------------------------ */

export function studioNotification(e: Enquiry): { subject: string; text: string; html: string } {
  const subject = `New enquiry from ${e.name}${e.projectType ? ` — ${e.projectType}` : ''} [${e.reference}]`;
  const mailto = `mailto:${e.email}?subject=${encodeURIComponent(`Re: your ${SITE_NAME} enquiry`)}`;

  const text = [
    `New enquiry via the ${SITE_NAME} contact form`,
    '',
    `Name:          ${e.name}`,
    `Email:         ${e.email}`,
    `Project type:  ${e.projectType || '—'}`,
    '',
    'Message:',
    e.message,
    '',
    `Reply: ${mailto}`,
  ].join('\n');

  const html = frame({
    preheader: e.message.slice(0, 120),
    eyebrow: 'Contact form',
    title: `${e.name} wants to talk about a project`,
    body: `
      ${detailRows([
        ['Reference', `<span style="font-family:${MONO};">${esc(e.reference)}</span> &middot; ${esc(formatReceived(e.receivedAt))}`],
        ['Name', esc(e.name)],
        ['Email', `<a href="mailto:${esc(e.email)}" style="color:#1E9A55;text-decoration:none;">${esc(e.email)}</a>`],
        ['Project type', esc(e.projectType || '—')],
      ])}
      <div style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.cardMuted};margin:0 0 8px;">Message</div>
      <div style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.cardText};padding:16px 18px;border-left:3px solid ${C.accent};background:#F6F9F7;border-radius:0 8px 8px 0;margin:0 0 24px;">${nl2br(e.message)}</div>
      ${button(mailto, `Reply to ${e.name.split(' ')[0]} →`)}
    `,
    footer: `Sent from the contact form on <a href="${SITE_URL}" style="color:${C.muted};">${SITE_URL.replace(/^https?:\/\//, '')}</a>. Replying to this email goes straight to ${esc(e.name)}.`,
  });

  return { subject, text, html };
}

/* ------------------------------------------------------------------ */
/* To the visitor                                                       */
/* ------------------------------------------------------------------ */


export function visitorConfirmation(e: Enquiry): { subject: string; text: string; html: string } {
  const first = e.name.trim().split(/\s+/)[0] || 'there';
  const subject = `Got your message, ${first} — ${SITE_NAME} [${e.reference}]`;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Re: ${e.reference} — ${e.projectType || 'my project'}`
  )}`;

  const text = [
    `Hi ${first},`,
    '',
    `Thanks for getting in touch with ${SITE_NAME}. Your message has arrived (reference ${e.reference}) and I'll reply within a day with next steps or a few clarifying questions.`,
    '',
    'What happens next:',
    '  1. I read your message today.',
    '  2. You get a reply within one working day.',
    '  3. If it fits, we book a short discovery call to define scope.',
    '',
    'Here is what you sent:',
    `Project type: ${e.projectType || '—'}`,
    e.message,
    '',
    `Need to reach me sooner? WhatsApp: ${WHATSAPP_URL}`,
    `Or email: ${CONTACT_EMAIL}`,
    '',
    '— Ajay',
    SITE_NAME,
    SITE_URL,
  ].join('\n');

  // Three-step "what happens next" timeline; the first step is already done.
  const steps: [string, string][] = [
    ['Message received', `Today, ${formatReceived(e.receivedAt)}`],
    ['Personal reply', 'Within one working day — next steps or a couple of clarifying questions.'],
    ['Discovery call', 'If it fits, a short call to define scope and what success looks like.'],
  ];

  const timeline = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
${steps
  .map(([title, sub], i) => {
    const done = i === 0;
    const last = i === steps.length - 1;
    const badge = done
      ? `background:${C.accent};color:${C.accentOn};`
      : `background:#FFFFFF;color:#1E9A55;border:1.5px solid #BFE3CD;`;
    const connector = last
      ? ''
      : `<tr><td style="height:30px;"><div style="width:2px;height:30px;margin:0 auto;background:#DDE6E0;"></div></td></tr>`;
    return `<tr>
  <td style="width:28px;vertical-align:top;padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:26px;height:26px;border-radius:13px;text-align:center;vertical-align:middle;font-family:${MONO};font-size:12px;font-weight:700;${badge}">${done ? '&#10003;' : i + 1}</td>
    </tr>${connector}</table>
  </td>
  <td style="vertical-align:top;padding:3px 0 0 14px;">
    <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${C.cardText};line-height:1.3;">${esc(title)}</div>
    <div style="font-family:${FONT};font-size:13px;color:${C.cardMuted};line-height:1.5;margin-top:2px;">${esc(sub)}</div>
  </td>
</tr>`;
  })
  .join('\n')}
</table>`;

  const tile = (href: string, heading: string, sub: string) =>
    `<td style="width:33.33%;padding:0 5px;vertical-align:top;">
  <a href="${esc(href)}" style="display:block;text-decoration:none;padding:14px 12px;border:1px solid #DDE6E0;border-radius:10px;background:#FFFFFF;">
    <div style="font-family:${MONO};font-size:12px;font-weight:600;color:#1E9A55;margin-bottom:4px;">${esc(heading)} &rarr;</div>
    <div style="font-family:${FONT};font-size:12px;line-height:1.45;color:${C.cardMuted};">${esc(sub)}</div>
  </a>
</td>`;

  const html = frame({
    preheader: `Reference ${e.reference}. I'll reply within a day — here's what happens next.`,
    eyebrow: 'Message received',
    title: `Thanks, ${first} — I've got your message.`,
    body: `
      <!-- reference pill -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:-6px 0 22px;"><tr>
        <td style="padding:6px 12px;border-radius:999px;background:#E9FBF0;border:1px solid #BFE3CD;font-family:${MONO};font-size:12px;color:#146B3A;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:4px;background:${C.accent};margin-right:7px;vertical-align:middle;"></span>Ref&nbsp;<strong>${esc(e.reference)}</strong>
        </td>
      </tr></table>

      <p style="margin:0 0 22px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.cardText};">
        I'll read it properly and get back to you within a day. No need to do anything in the meantime &mdash; but if you have a deadline, a budget range or links to anything relevant, just reply to this email and it lands in the same thread.
      </p>

      ${label('What happens next')}
      ${timeline}

      ${label('Your message', 10)}
      <div style="padding:16px 18px;border-left:3px solid ${C.accent};background:#F6F9F7;border-radius:0 8px 8px 0;margin:0 0 26px;">
        <span style="display:inline-block;padding:3px 9px;border-radius:999px;background:#FFFFFF;border:1px solid #DDE6E0;font-family:${MONO};font-size:11px;color:#1E9A55;margin-bottom:10px;">${esc(e.projectType || 'Project')}</span>
        <div style="font-family:${FONT};font-size:14px;line-height:1.65;color:${C.cardText};">${nl2br(e.message)}</div>
      </div>

      ${label('Need me sooner?')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr>
        <td style="padding:0 10px 10px 0;">${button(WHATSAPP_URL, 'Chat on WhatsApp')}</td>
        <td style="padding:0 0 10px;">${button(mailto, 'Reply by email', false)}</td>
      </tr></table>

      ${label('While you wait')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;"><tr>
        ${tile(`${SITE_URL}/#work`, 'Recent work', 'Live client projects and demos')}
        ${tile(`${SITE_URL}/#process`, 'How I work', 'Four stages, no surprises')}
        ${tile(`${SITE_URL}/#services`, 'Services', 'Apps, APIs, MVPs, support')}
      </tr></table>

      <!-- signature -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #EEF3F0;padding-top:18px;"><tr>
        <td style="width:40px;height:40px;border-radius:20px;background:#0F1612;text-align:center;vertical-align:middle;font-family:${MONO};font-size:14px;font-weight:700;color:${C.accent};">A</td>
        <td style="padding-left:12px;font-family:${FONT};line-height:1.4;">
          <div style="font-size:14px;font-weight:600;color:${C.cardText};">Ajay</div>
          <div style="font-size:12px;color:${C.cardMuted};">Founder &amp; developer, ${SITE_NAME}</div>
        </td>
      </tr></table>
    `,
    footer: `You're receiving this because you sent a message through <a href="${SITE_URL}" style="color:${C.muted};">${SITE_URL.replace(/^https?:\/\//, '')}</a>. If that wasn't you, just ignore this email &mdash; nothing else will be sent.`,
  });

  return { subject, text, html };
}
