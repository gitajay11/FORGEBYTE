// Receives the contact form and emails it to the studio inbox.

import { after } from 'next/server';
import { INBOX, sendMail, smtpConfigured } from '@/lib/mail';
import { studioNotification, visitorConfirmation } from '@/lib/emailTemplates';
import { clientIp, createRateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter(5, 10 * 60_000); // 5 per 10 minutes per IP

const MAX = { name: 120, email: 254, project_type: 60, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function field(data: FormData, name: keyof typeof MAX): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim().slice(0, MAX[name]) : '';
}

export async function POST(request: Request) {
  if (!smtpConfigured) {
    console.error('Contact form: SMTP_HOST/SMTP_USER/SMTP_PASS not set');
    return Response.json(
      { error: 'The contact form is not configured yet.' },
      { status: 503 }
    );
  }

  if (limiter.hit(clientIp(request))) {
    return Response.json(
      { error: 'Too many messages just now — give it a few minutes.' },
      { status: 429 }
    );
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
    return Response.json({ ok: true });
  }

  const name = field(data, 'name');
  const email = field(data, 'email');
  const projectType = field(data, 'project_type');
  const message = field(data, 'message');

  if (!name || !email || !message) {
    return Response.json(
      { error: 'Name, email and project details are required.' },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 400 });
  }

  const enquiry = { name, email, projectType, message };

  // The studio copy is the one that matters: send it first and report
  // failure honestly if it bounces.
  const studio = studioNotification(enquiry);
  try {
    await sendMail({
      to: INBOX,
      replyTo: `${name} <${email}>`,
      ...studio,
    });
  } catch (err) {
    console.error('Contact form: studio email failed', err);
    return Response.json(
      { error: 'Could not send your message right now.' },
      { status: 502 }
    );
  }

  // The visitor's confirmation is a courtesy — send it after the response so
  // it never slows the form down, and log rather than fail if it bounces.
  const confirmation = visitorConfirmation(enquiry);
  after(async () => {
    try {
      await sendMail({ to: `${name} <${email}>`, replyTo: INBOX, ...confirmation });
    } catch (err) {
      console.error('Contact form: confirmation email failed', err);
    }
  });

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
