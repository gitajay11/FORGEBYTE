// Telegram webhook. Telegram POSTs each update here with the secret set in
// setWebhook (TELEGRAM_WEBHOOK_SECRET) in the X-Telegram-Bot-Api-Secret-Token
// header; anything without it is refused before the bot is even built.
// Setup: docs/TELEGRAM.md.

import { timingSafeEqual } from 'node:crypto';
import { webhookCallback } from 'grammy';
import { getBot } from '@/lib/telegram/bot';
import { tgConfig } from '@/lib/telegram/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function POST(request: Request) {
  const c = tgConfig();
  if (!c.token || !c.webhookSecret) {
    console.error('Telegram webhook: TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET is not set');
    return new Response('Not configured', { status: 503 });
  }
  if (!same(request.headers.get('x-telegram-bot-api-secret-token') ?? '', c.webhookSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ignore oversized bodies outright (a real update is a few KB)
  if (Number(request.headers.get('content-length') ?? 0) > 256 * 1024) {
    return new Response('Too large', { status: 413 });
  }
  const handle = webhookCallback(getBot(), 'std/http', {
    secretToken: c.webhookSecret,
    // answer Telegram before its own timeout; a slow AI reply is dropped, not retried
    timeoutMilliseconds: 25_000,
    onTimeout: 'return',
  });
  return handle(request);
}
