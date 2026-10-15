import 'server-only';
import { Api, InlineKeyboard } from 'grammy';
import { SITE_URL } from '@/lib/site';
import { pageLabel, phoneDigits } from '@/lib/emailTemplates';
import { istTimestamp } from '@/lib/sheet';
import { tgConfig } from './config';
import { signToken } from './token';
import { esc, fit } from './text';

/** A Bot API client (no update handling) for sending from anywhere. */
export function tgApi(): Api {
  const c = tgConfig();
  if (!c.token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return new Api(c.token, c.apiRoot ? { apiRoot: c.apiRoot } : undefined);
}

export type WorkEnquiry = {
  reference: string;
  receivedAt: Date;
  name: string;
  email: string;
  phone: string;
  company: string;
  needs: string[];
  budget: string;
  timeline: string;
  message: string;
  source: string;
};

/**
 * Posts a new contact-form enquiry to the work chat, with buttons to reply.
 * Telegram buttons can only open http(s) links, so "Reply by email" and
 * "Call" go through /api/telegram/go with a signed token (needs the stored
 * submission); WhatsApp links straight to wa.me. Throws on failure.
 */
export async function notifyWork(e: WorkEnquiry, submissionId: string | null): Promise<void> {
  const c = tgConfig();
  if (!c.workChatId) throw new Error('WORK_CHAT_ID is not set');

  const row = (label: string, value: string) => (value ? `<b>${label}:</b> ${esc(value)}` : null);
  const text = [
    `📥 <b>New enquiry</b> · <code>${esc(e.reference)}</code>`,
    `${esc(istTimestamp(e.receivedAt))} IST`,
    '',
    row('Name', e.name),
    row('Email', e.email),
    row('Phone', e.phone),
    row('Company', e.company),
    row('Needs', e.needs.join(', ') || 'General enquiry'),
    row('Budget', e.budget),
    row('Timeline', e.timeline),
    row('From', pageLabel(e.source)),
    '',
    '<b>Message</b>',
    esc(fit(e.message, 2500)),
  ].filter((l) => l !== null).join('\n');

  const kb = new InlineKeyboard();
  if (submissionId) kb.url('✉️ Reply by email', `${SITE_URL}/api/telegram/go?t=${signToken('mail', submissionId)}`);
  if (e.phone) {
    kb.url('💬 WhatsApp', `https://wa.me/${phoneDigits(e.phone)}`);
    if (submissionId) kb.url('📞 Call', `${SITE_URL}/api/telegram/go?t=${signToken('call', submissionId)}`);
  }

  await tgApi().sendMessage(c.workChatId, fit(text), {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: kb.inline_keyboard.length ? kb : undefined,
  });
}
