// Telegram settings, read from env vars only (see .env.example). Read on each
// call, not at import, so a missing value is reported where it's needed.
const env = (name: string) => (process.env[name] ?? '').trim();

export const tgConfig = () => ({
  token: env('TELEGRAM_BOT_TOKEN'),
  webhookSecret: env('TELEGRAM_WEBHOOK_SECRET'),
  linkSecret: env('TELEGRAM_LINK_SECRET'),
  workChatId: env('WORK_CHAT_ID'),
  username: env('TELEGRAM_BOT_USERNAME').replace(/^@/, ''),
  // Optional: a different Bot API server (tests). Default: api.telegram.org.
  apiRoot: env('TELEGRAM_API_ROOT') || undefined,
});

/** The work-chat notification can go out. */
export const notifyConfigured = () => {
  const c = tgConfig();
  return Boolean(c.token && c.workChatId && c.linkSecret);
};

/** Visitors can be offered "Get updates on Telegram". */
export const linkConfigured = () => {
  const c = tgConfig();
  return Boolean(c.token && c.username && c.linkSecret);
};
