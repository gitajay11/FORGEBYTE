import { FORM_ENDPOINT } from './site';

// Detection is regex rather than asking the model to flag it: a deterministic
// check can't hallucinate a lead or, worse, silently miss one.
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/;

// Loose enough for international formats, strict enough to skip version
// numbers and years — a run of digits/spacers holding at least 8 digits.
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;

export type Contact = { email?: string; phone?: string };

export function extractContact(text: string): Contact | null {
  const email = text.match(EMAIL_RE)?.[0];

  let phone: string | undefined;
  for (const candidate of text.match(new RegExp(PHONE_RE, 'g')) ?? []) {
    // ignore the digits that belong to an email we already captured
    if (email && email.includes(candidate.trim())) continue;
    if ((candidate.match(/\d/g) ?? []).length >= 8) {
      phone = candidate.trim();
      break;
    }
  }

  if (!email && !phone) return null;
  return { email, phone };
}

type Turn = { role: 'user' | 'assistant'; content: string };

/**
 * Forwards a chat lead to the same Formspree inbox the contact form uses.
 * Never throws — a capture failure must not break the visitor's reply.
 */
export async function forwardLead(
  contact: Contact,
  transcript: Turn[]
): Promise<void> {
  const body = new URLSearchParams();
  body.set('_subject', 'Forgebyte — new lead from the chat widget');
  body.set('source', 'AI chat widget');
  if (contact.email) body.set('email', contact.email);
  if (contact.phone) body.set('phone', contact.phone);
  body.set(
    'message',
    transcript
      .slice(-8)
      .map((t) => `${t.role === 'user' ? 'Visitor' : 'Bot'}: ${t.content}`)
      .join('\n\n')
  );

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('Lead forward rejected', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('Lead forward failed', err);
  }
}
