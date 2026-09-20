import { INBOX, sendMail } from './mail';

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
 * Forwards a chat lead to the studio inbox — the same route the contact form
 * takes. Never throws — a capture failure must not break the visitor's reply.
 */
export async function forwardLead(
  contact: Contact,
  transcript: Turn[]
): Promise<void> {
  const excerpt = transcript
    .slice(-8)
    .map((t) => `${t.role === 'user' ? 'Visitor' : 'Bot'}: ${t.content}`)
    .join('\n\n');

  try {
    await sendMail({
      to: INBOX,
      replyTo: contact.email,
      subject: 'New lead from the chat widget',
      text: [
        contact.email ? `Email: ${contact.email}` : null,
        contact.phone ? `Phone: ${contact.phone}` : null,
        '',
        'Last few turns of the conversation:',
        '',
        excerpt,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    });
  } catch (err) {
    console.error('Lead forward failed', err);
  }
}
