// Telegram buttons can only open http(s) links, so the work chat's "Reply by
// email" and "Call" buttons come here with a signed token (lib/telegram/
// token.ts) and get sent on to mailto: / tel:. The visitor's details are
// looked up server-side — they are never in the URL. `?call=studio` is the
// bot's public "Call us" button.

import { dbConfigured } from '@/lib/db';
import { CONTACT_PHONE_E164 } from '@/lib/site';
import { phoneDigits } from '@/lib/emailTemplates';
import { getSubmission } from '@/lib/telegram/store';
import { verifyToken } from '@/lib/telegram/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A tiny page rather than a bare redirect: some in-app browsers won't follow a
// redirect to mailto:/tel:, but they do open a tapped link.
function page(href: string, label: string, status = 200) {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Forgebyte</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0A0C10;color:#F0F3F8;font:16px system-ui,sans-serif}a{display:inline-block;padding:14px 22px;border-radius:999px;background:#D5FF70;color:#0A0C10;font-weight:600;text-decoration:none}</style></head>
<body>${href ? `<a href="${esc(href)}">${esc(label)}</a><script>location.href=${JSON.stringify(href)}</script>` : `<p>${esc(label)}</p>`}</body></html>`;
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get('call') === 'studio') return page(`tel:${CONTACT_PHONE_E164}`, 'Call Forgebyte');

  const token = params.get('t') ?? '';
  const mailId = verifyToken('mail', token);
  const callId = mailId ? null : verifyToken('call', token);
  const id = mailId ?? callId;
  if (!id || !dbConfigured()) return page('', 'This link has expired.', 410);

  const s = await getSubmission(id).catch(() => null);
  if (!s) return page('', 'This enquiry has been deleted.', 410);

  if (mailId) {
    const subject = encodeURIComponent(`Re: your enquiry (${s.reference})`);
    return page(`mailto:${encodeURIComponent(s.email).replace(/%40/g, '@')}?subject=${subject}`, `Reply to ${s.name}`);
  }
  if (!s.phone) return page('', 'No phone number was given.', 404);
  return page(`tel:+${phoneDigits(s.phone)}`, `Call ${s.name}`);
}
