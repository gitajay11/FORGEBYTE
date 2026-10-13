// Outbound mail over SMTP via Nodemailer. Server-only — never import from a
// client component. Every setting comes from environment variables.

import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { CONTACT_EMAIL, SITE_NAME } from './site';

const env = (name: string) => (process.env[name] ?? '').trim();

const SMTP_HOST = env('SMTP_HOST');
const SMTP_PORT = Number.parseInt(env('SMTP_PORT'), 10) || 465;
const SMTP_USER = env('SMTP_USER');
const SMTP_PASS = env('SMTP_PASS');
// 465 is implicit TLS; 587 negotiates STARTTLS after connecting. SMTP_SECURE
// overrides the guess for providers that do something else.
const SMTP_SECURE = env('SMTP_SECURE') ? env('SMTP_SECURE').toLowerCase() === 'true' : SMTP_PORT === 465;

/** Where enquiries land, and the Reply-To on the visitor's confirmation. */
export const INBOX = env('WORK_MAIL') || CONTACT_EMAIL;
// Most providers reject a From that isn't the authenticated mailbox, so the
// default is the SMTP user; MAIL_FROM can set a display name or an alias the
// account is allowed to send as.
const FROM = env('MAIL_FROM') || `${SITE_NAME} <${SMTP_USER}>`;

/** Optional calendar link for the "Book a call" button. */
export const BOOKING_URL = env('BOOKING_URL');

export const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

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

/** A bare address, or a name + address kept apart so a name containing
 *  commas or angle brackets can never be parsed as extra recipients. */
export type Address = string | { name: string; address: string };

export type OutboundMail = {
  to: Address;
  subject: string;
  text: string;
  html?: string;
  replyTo?: Address;
};

/** Sends one message. Throws on failure so callers can decide what to show. */
export async function sendMail(mail: OutboundMail): Promise<void> {
  if (!smtpConfigured) {
    throw new Error('SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }
  await getTransporter().sendMail({ from: FROM, ...mail });
}
