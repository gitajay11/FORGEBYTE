// Receives the contact form and emails it to the studio inbox.

import { deliver } from '@/lib/mail';
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

  const result = await deliver({
    subject: `Forgebyte — new enquiry from ${name}`,
    replyTo: `${name} <${email}>`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${projectType || '—'}`,
      '',
      message,
      '',
      '—',
      `Sent from the contact form on www.forgebyte.online`,
    ].join('\n'),
    fields: { name, email, project_type: projectType, message },
  });

  if (!result.ok) {
    return Response.json(
      { error: 'Could not send your message right now.' },
      { status: 502 }
    );
  }

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
