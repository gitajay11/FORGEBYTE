// Runs the Telegram bot on this machine for testing — the same code as the
// webhook (lib/telegram/bot.ts), but with long polling, since Telegram can't
// reach a webhook on localhost. Reads .env.local / .env like `next dev`.
//   npm run bot:dev            (refuses if the live webhook is set)
//   npm run bot:dev -- --force (removes the webhook first; set it again after —
//                               see docs/TELEGRAM.md, step 4)

import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true);

const need = ['TELEGRAM_BOT_TOKEN'];
const optional = ['GROQ_API_KEY', 'DATABASE_URL'];
const missing = need.filter((n) => !(process.env[n] ?? '').trim());
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(', ')}. Add it (from @BotFather) and run again.`);
  process.exit(1);
}
for (const n of optional.filter((n) => !(process.env[n] ?? '').trim())) {
  console.warn(`Note: ${n} is not set — ${n === 'GROQ_API_KEY' ? 'questions will get "can\'t answer right now"' : 'no chat history, rate limits or /start linking'}.`);
}

const { getBot } = await import('../lib/telegram/bot');
const bot = getBot();

const hook = await bot.api.getWebhookInfo();
if (hook.url) {
  if (!process.argv.includes('--force')) {
    console.error(`The live webhook is set (${hook.url}). Long polling would take over the bot's messages.\nRun "npm run bot:dev -- --force" to remove the webhook for local testing (set it again afterwards).`);
    process.exit(1);
  }
  await bot.api.deleteWebhook();
  console.warn('Removed the webhook for local testing. Set it again when you are done (docs/TELEGRAM.md, step 4).');
}

// Setup aid, in this local runner only (the bot itself never shows it): print
// the ID of any group the bot sees — a command sent there, or the bot being
// added — so WORK_CHAT_ID can be copied from this terminal.
const seen = new Set<number>();
bot.api.config.use(async (prev, method, payload, signal) => {
  const res = await prev(method, payload, signal);
  if (method === 'getUpdates' && res.ok) {
    for (const u of res.result as { message?: { chat: { id: number; type: string; title?: string } }; my_chat_member?: { chat: { id: number; type: string; title?: string } } }[]) {
      const chat = u.message?.chat ?? u.my_chat_member?.chat;
      if (chat && chat.type !== 'private' && !seen.has(chat.id)) {
        seen.add(chat.id);
        console.log(`Group "${chat.title ?? ''}" → WORK_CHAT_ID=${chat.id}`);
      }
    }
  }
  return res;
});

process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());

await bot.start({
  allowed_updates: ['message', 'callback_query', 'my_chat_member'],
  drop_pending_updates: true,
  onStart: (me) => console.log(`@${me.username} is running (long polling). Message it in Telegram. Ctrl+C to stop.`),
});
