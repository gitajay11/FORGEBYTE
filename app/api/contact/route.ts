// Receives the contact form: emails the enquiry to the studio (WORK_MAIL),
// sends the visitor a confirmation, and adds a row to the enquiries Google
// Sheet via Sheet Ninja. All settings come from env vars only.

import { BOOKING_URL, INBOX, sendMail, smtpConfigured } from '@/lib/mail';
import { makeReference, pageLabel, studioNotification, visitorConfirmation } from '@/lib/emailTemplates';
import { appendToSheet, istTimestamp, sheetConfigured } from '@/lib/sheet';
import { clientIp, createRateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter(5, 10 * 60_000); // 5 per 10 minutes per IP

const MAX = { name: 120, email: 254, phone: 24, company: 120, budget: 40, timeline: 40, source: 30, message: 5000 } as const;
const MAX_NEEDS = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,24}$/;

// Control characters out of everything; line breaks only survive in the
// message (a newline in a name could otherwise reach an email header).
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (v: string, multiline = false) =>
  (multiline ? v.replace(/\r\n?/g, '\n') : v.replace(/[\r\n\t]+/g, ' ')).replace(CONTROL, '').trim();

function field(data: FormData, name: keyof typeof MAX): string {
  const value = data.get(name);
  return typeof value === 'string' ? clean(value, name === 'message').slice(0, MAX[name]) : '';
}

export async function POST(request: Request) {
  if (!smtpConfigured && !sheetConfigured) {
    console.error('Contact form: neither SMTP (SMTP_HOST/SMTP_USER/SMTP_PASS) nor SHEETNINJA_API_URL is set');
    return Response.json({ error: 'The contact form is not configured yet.' }, { status: 503 });
  }

  if (limiter.hit(clientIp(request))) {
    return Response.json({ error: 'Too many messages just now — give it a few minutes.' }, { status: 429 });
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid form submission.' }, { status: 400 });
  }

  // Honeypot: real visitors never see this field. Pretend it worked so the
  // bot has nothing to learn from.
  if (data.get('_gotcha')) {
    return Response.json({ ok: true, reference: makeReference() });
  }

  const name = field(data, 'name');
  const email = field(data, 'email');
  const phone = field(data, 'phone');
  const company = field(data, 'company');
  const budget = field(data, 'budget');
  const timeline = field(data, 'timeline');
  const message = field(data, 'message');
  const source = field(data, 'source').replace(/[^a-z-]/gi, '');
  const needs = data
    .getAll('needs')
    .filter((v): v is string => typeof v === 'string')
    .map((v) => clean(v).slice(0, 40))
    .filter(Boolean)
    .slice(0, MAX_NEEDS);

  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email and a description of the problem are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 400 });
  }
  if (phone && (!PHONE_RE.test(phone) || (phone.match(/\d/g) ?? []).length < 7)) {
    return Response.json({ error: 'That phone number does not look right.' }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json({ error: 'A sentence or two about the problem, please.' }, { status: 400 });
  }

  const enquiry = {
    name, email, phone, company, needs, budget, timeline, message, source,
    reference: makeReference(),
    receivedAt: new Date(),
  };

  // Email to the studio, confirmation to the visitor and the sheet row, all at
  // once. The enquiry counts as received if it reached the studio by either
  // route (email or sheet) — otherwise say so, and the visitor keeps their
  // input to retry. Any single failure is logged.
  const studio = studioNotification(enquiry);
  const confirmation = visitorConfirmation(enquiry, { bookingUrl: BOOKING_URL });
  const visitor = { name, address: email };
  const skipped = Promise.reject(new Error('not configured'));
  skipped.catch(() => {}); // settled below; silence the unhandled-rejection warning
  const [toStudio, toVisitor, toSheet] = await Promise.allSettled([
    smtpConfigured ? sendMail({ to: INBOX, replyTo: visitor, ...studio }) : skipped,
    smtpConfigured ? sendMail({ to: visitor, replyTo: INBOX, ...confirmation }) : skipped,
    sheetConfigured
      ? appendToSheet({
          submittedAt: istTimestamp(enquiry.receivedAt),
          reference: enquiry.reference,
          name, email, phone, company,
          service: needs.length ? needs.join(', ') : 'General enquiry',
          budget, timeline, message,
          page: pageLabel(source),
        })
      : skipped,
  ]);

  const log = (what: string, r: PromiseSettledResult<void>, configured: boolean) => {
    if (configured && r.status === 'rejected') console.error(`Contact form ${enquiry.reference}: ${what} failed`, r.reason);
  };
  log('studio email', toStudio, smtpConfigured);
  log('confirmation email', toVisitor, smtpConfigured);
  log('sheet row', toSheet, sheetConfigured);

  if (toStudio.status === 'rejected' && toSheet.status === 'rejected') {
    return Response.json({ error: 'Could not send your message right now.' }, { status: 502 });
  }

  return Response.json(
    { ok: true, reference: enquiry.reference, confirmationSent: toVisitor.status === 'fulfilled' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
