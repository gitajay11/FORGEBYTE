// Outbound mail over SMTP via Nodemailer. Server-only — never import from a
// client component.

import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { CONTACT_EMAIL, SITE_NAME } from './site';

const env = (name: string) => (process.env[name] ?? '').trim();

const SMTP_HOST = env('SMTP_HOST');
const SMTP_PORT = Number.parseInt(env('SMTP_PORT'), 10) || 465;
const SMTP_USER = env('SMTP_USER');
const SMTP_PASS = env('SMTP_PASS');

/** Where studio notifications land. */
export const INBOX = CONTACT_EMAIL;
// Providers reject a From that isn't the authenticated mailbox, so send as
// the SMTP user and put the visitor in Reply-To where needed.
const FROM = `${SITE_NAME} <${SMTP_USER}>`;

export const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // 465 is implicit TLS; 587 negotiates STARTTLS after connecting.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/** Sends one message. Throws on failure so callers can decide what to show. */
export async function sendMail(mail: OutboundMail): Promise<void> {
  if (!smtpConfigured) {
    throw new Error('SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }
  await getTransporter().sendMail({ from: FROM, ...mail });
}
