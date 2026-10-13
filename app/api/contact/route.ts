// Receives the contact form, emails the enquiry to the studio (WORK_MAIL) and
// a confirmation to the visitor. SMTP settings come from env vars only.

import { BOOKING_URL, INBOX, sendMail, smtpConfigured } from '@/lib/mail';
import { makeReference, studioNotification, visitorConfirmation } from '@/lib/emailTemplates';
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
  if (!smtpConfigured) {
    console.error('Contact form: SMTP_HOST/SMTP_USER/SMTP_PASS not set');
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

  // Both emails at once. The studio copy is the one that matters: if it
  // fails, say so (the visitor keeps their input and can retry). If only the
  // visitor's confirmation fails, the enquiry still arrived — log it and
  // report success.
  const studio = studioNotification(enquiry);
  const confirmation = visitorConfirmation(enquiry, { bookingUrl: BOOKING_URL });
  const visitor = { name, address: email };
  const [toStudio, toVisitor] = await Promise.allSettled([
    sendMail({ to: INBOX, replyTo: visitor, ...studio }),
    sendMail({ to: visitor, replyTo: INBOX, ...confirmation }),
  ]);

  if (toStudio.status === 'rejected') {
    console.error(`Contact form ${enquiry.reference}: studio email failed`, toStudio.reason);
    return Response.json({ error: 'Could not send your message right now.' }, { status: 502 });
  }
  if (toVisitor.status === 'rejected') {
    console.error(`Contact form ${enquiry.reference}: confirmation email failed`, toVisitor.reason);
  }

  return Response.json(
    { ok: true, reference: enquiry.reference, confirmationSent: toVisitor.status === 'fulfilled' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
