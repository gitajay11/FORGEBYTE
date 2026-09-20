// HTML email templates for the contact form. Everything is inline-styled and
// table-based because that is still what mail clients reliably render; the
// palette mirrors the site (dark ground, #39FF88 accent) but the message body
// sits on a light card so it stays readable in every client, including ones
// that ignore dark-mode hints.

import { CONTACT_EMAIL, SITE_NAME, SITE_URL, WHATSAPP_URL } from './site';

export type Enquiry = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

const C = {
  bg: '#060907',
  panel: '#0F1612',
  border: '#1E2B22',
  accent: '#39FF88',
  accentOn: '#04140B',
  text: '#E4F5EA',
  muted: '#93AC9D',
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

/** Shared frame: dark header with the wordmark, light card, dark footer. */
function frame(opts: { preheader: string; eyebrow: string; title: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
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
  <tr><td style="background:${C.cardBg};border-radius:14px;border:1px solid ${C.cardBorder};padding:32px 32px 28px;">
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
  const subject = `New enquiry from ${e.name}${e.projectType ? ` — ${e.projectType}` : ''}`;
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
  const subject = `Got your message — ${SITE_NAME}`;

  const text = [
    `Hi ${first},`,
    '',
    `Thanks for getting in touch with ${SITE_NAME}. Your message has arrived and I'll reply within a day with next steps or a few clarifying questions.`,
    '',
    'Here is what you sent:',
    '',
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

  const html = frame({
    preheader: "Thanks for reaching out — I'll reply within a day.",
    eyebrow: 'Message received',
    title: `Thanks, ${first} — I've got your message.`,
    body: `
      <p style="margin:0 0 18px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.cardText};">
        I'll read it properly and reply within a day, usually with next steps or a couple of clarifying questions. No need to do anything in the meantime.
      </p>

      <div style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.cardMuted};margin:0 0 8px;">Your message</div>
      ${detailRows([['Project type', esc(e.projectType || '—')]])}
      <div style="font-family:${FONT};font-size:14px;line-height:1.65;color:${C.cardText};padding:16px 18px;border-left:3px solid ${C.accent};background:#F6F9F7;border-radius:0 8px 8px 0;margin:-8px 0 26px;">${nl2br(e.message)}</div>

      <p style="margin:0 0 14px;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.cardMuted};">Need me sooner?</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:10px;">${button(WHATSAPP_URL, 'Chat on WhatsApp')}</td>
        <td>${button(`${SITE_URL}/#work`, 'See recent work', false)}</td>
      </tr></table>

      <p style="margin:28px 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.cardText};">— Ajay<br><span style="color:${C.cardMuted};font-size:13px;">${SITE_NAME}</span></p>
    `,
    footer: `You're receiving this because you sent a message through <a href="${SITE_URL}" style="color:${C.muted};">${SITE_URL.replace(/^https?:\/\//, '')}</a>. If that wasn't you, just ignore this email — nothing else will be sent.`,
  });

  return { subject, text, html };
}
