// Outbound mail. SMTP via Nodemailer when the SMTP_* variables are set;
// otherwise the message is handed to Formspree so nothing is lost while the
// credentials are still being set up. Server-only — never import from a
// client component.

import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { CONTACT_EMAIL, FORM_ENDPOINT, SITE_NAME } from './site';

const env = (name: string) => (process.env[name] ?? '').trim();

const SMTP_HOST = env('SMTP_HOST');
const SMTP_PORT = Number.parseInt(env('SMTP_PORT'), 10) || 587;
const SMTP_USER = env('SMTP_USER');
const SMTP_PASS = env('SMTP_PASS');
// 465 is implicit TLS; 587 (and 25) negotiate STARTTLS after connecting.
const SMTP_SECURE = /^(1|true|yes)$/i.test(env('SMTP_SECURE')) || SMTP_PORT === 465;

const MAIL_TO = env('MAIL_TO') || CONTACT_EMAIL;
// Most providers reject a From that isn't the authenticated mailbox, so
// default to the SMTP user and put the visitor in Reply-To instead.
const MAIL_FROM = env('MAIL_FROM') || (SMTP_USER ? `${SITE_NAME} <${SMTP_USER}>` : '');

export const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_FROM);

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export type OutboundMail = {
  subject: string;
  text: string;
  /** Visitor's address, so a reply from the inbox goes straight back to them. */
  replyTo?: string;
  /** Flat key/value copy of the submission, used for the Formspree fallback. */
  fields: Record<string, string>;
};

export type DeliveryResult =
  | { ok: true; via: 'smtp' | 'formspree' }
  | { ok: false; via: 'smtp' | 'formspree'; error: string };

/** Sends one message. Never throws — callers decide how to surface failure. */
export async function deliver(mail: OutboundMail): Promise<DeliveryResult> {
  if (smtpConfigured) {
    try {
      await getTransporter().sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
      });
      return { ok: true, via: 'smtp' };
    } catch (err) {
      console.error('SMTP send failed', err);
      return { ok: false, via: 'smtp', error: (err as Error)?.message ?? 'unknown' };
    }
  }

  // Fallback: Formspree, which forwards to the same inbox.
  const body = new URLSearchParams(mail.fields);
  body.set('_subject', mail.subject);
  if (mail.replyTo) body.set('_replyto', mail.replyTo);
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Formspree rejected', res.status, detail);
      return { ok: false, via: 'formspree', error: `HTTP ${res.status}` };
    }
    return { ok: true, via: 'formspree' };
  } catch (err) {
    console.error('Formspree request failed', err);
    return { ok: false, via: 'formspree', error: (err as Error)?.message ?? 'unknown' };
  }
}
