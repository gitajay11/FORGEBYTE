import 'server-only';
import { Bot, InlineKeyboard, type Context } from 'grammy';
import { caseStudies, faq, process, services, studio, team } from '@/lib/content';
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, SITE_URL, WHATSAPP_URL } from '@/lib/site';
import { dbConfigured } from '@/lib/db';
import { tgConfig } from './config';
import { verifyToken } from './token';
import { cleanInput, esc, fit, MAX_QUESTION } from './text';
import { answer, FALLBACK } from './answer';
import { addTurn, clearTurns, getSubmission, linkChat, maybeCleanup, overLimit, recentTurns, type Turn } from './store';

// The Forgebyte bot (grammY), driven by the webhook at app/api/telegram.
// Private chats only: in the work group it stays silent.

const LIMITS = { perMinute: 10, questionsPerDay: 30 };
const link = (path: string) => `${SITE_URL}${path}`;
const send = (ctx: Context, html: string, keyboard?: InlineKeyboard) =>
  ctx.reply(fit(html), { parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_markup: keyboard });

/* ---------- fixed replies, built from the site's content ---------- */

// The menu's common questions: answered straight from the content (exact, and
// no AI call), each with its "Read more" link.
const faqAnswer = (q: string) => faq.find((f) => f.q === q)?.a ?? '';
const MENU: Record<string, { label: string; html: () => string }> = {
  services: { label: 'What do you build?', html: () => servicesHtml() },
  cost: { label: 'How much does it cost?', html: () => `${esc(faqAnswer('How much does it cost?'))}\n\n${readMore('/#faq', 'Common questions')}` },
  time: { label: 'How long does it take?', html: () => `${esc(faqAnswer('How long will it take?'))}\n\n${readMore('/#faq', 'Common questions')}` },
  process: { label: 'How does a project work?', html: () => `${process.map((p, i) => `${i + 1}. <b>${esc(p.name)}</b>: ${esc(p.what)}`).join('\n')}\n\n${readMore('/#process', 'How a project works')}` },
  who: { label: 'Who will I work with?', html: () => `You’ll work with ${team.map((m) => `${esc(m.display)} (${esc(m.role)})`).join(' and ')}. They run every project themselves, from the first call to launch.\n\n${readMore('/studio', 'About us')}` },
  contact: { label: 'How do I contact you?', html: () => contactHtml() },
};

const readMore = (path: string, title: string) => `<a href="${link(path)}">Read more: ${esc(title)} →</a>`;

function menu() {
  const kb = new InlineKeyboard();
  Object.entries(MENU).forEach(([key, item], i) => {
    kb.text(item.label, `m:${key}`);
    if (i % 2 === 1) kb.row();
  });
  return kb;
}

function servicesHtml() {
  return [
    '<b>What we build</b>',
    ...services.map((s) => `• <b>${esc(s.name)}</b>: ${esc(s.promise)} <i>(${esc(s.duration)})</i>`),
    '',
    readMore('/services', 'Services'),
  ].join('\n');
}

function workHtml() {
  return [
    '<b>Our work</b>',
    ...caseStudies.map((c) => `• <a href="${link(`/work/${c.slug}`)}">${esc(c.title)}</a> · ${esc(c.status)}: ${esc(c.oneLiner)}`),
    '',
    readMore('/work', 'All work'),
  ].join('\n');
}

function contactHtml() {
  return [
    '<b>Contact Forgebyte</b>',
    `Email: ${esc(CONTACT_EMAIL)}`,
    `WhatsApp / phone: ${esc(CONTACT_PHONE_DISPLAY)}`,
    `Or use the form: <a href="${link('/contact')}">${esc(link('/contact').replace(/^https?:\/\//, ''))}</a>`,
    '',
    `We reply within ${esc(studio.replyWithin)}.`,
  ].join('\n');
}

const contactKeyboard = () =>
  new InlineKeyboard().url('💬 WhatsApp', WHATSAPP_URL).url('📝 Contact form', link('/contact')).row().url('📞 Call', `${SITE_URL}/api/telegram/go?call=studio`);

const WELCOME = [
  '<b>Hi! I’m the Forgebyte bot.</b>',
  'Ask me anything about Forgebyte’s services, work, process or prices, or pick a common question below.',
  '',
  '/services · /work · /contact · /help',
].join('\n');

const HELP = [
  '<b>What I can do</b>',
  'I answer questions about Forgebyte using only what’s on our website, with a link to read more.',
  '',
  '/services — what we build',
  '/work — projects we’ve built',
  '/contact — email, WhatsApp, phone',
  '/help — this message',
  '',
  `For anything else, email ${esc(CONTACT_EMAIL)}.`,
].join('\n');

/* ---------- linking a chat to a contact-form submission ---------- */

async function confirmSubmission(ctx: Context, token: string) {
  const id = verifyToken('start', token);
  if (!id || !dbConfigured()) {
    await send(ctx, `That link has expired or isn’t valid. Your request is still with us. We reply within ${esc(studio.replyWithin)} by email.\n\nIn the meantime, ask me anything about Forgebyte.`, menu());
    return;
  }
  const chatId = ctx.chat!.id;
  const s = await getSubmission(id);
  if (!s || !(await linkChat(chatId, id))) {
    await send(ctx, `I couldn’t find that request any more. If you still need us, email ${esc(CONTACT_EMAIL)}.`, menu());
    return;
  }
  const row = (label: string, value: string) => (value ? `<b>${label}:</b> ${esc(value)}` : null);
  const html = [
    `✅ <b>Thanks, ${esc(s.name.split(' ')[0])}. We’ve got your request.</b>`,
    row('Reference', s.reference),
    row('What you need', s.needs.join(', ') || 'General enquiry'),
    row('Budget', s.budget),
    row('Timeline', s.timeline),
    `<b>Your message:</b> ${esc(fit(s.message, 300))}`,
    '',
    `We reply within ${esc(studio.replyWithin)}, by email to ${esc(s.email)}.`,
  ].filter((l) => l !== null).join('\n');
  const kb = new InlineKeyboard().url('👀 View our work', link('/work')).text('❓ Ask a question', 'ask').row().text('📇 Contact', 'm:contact');
  await send(ctx, html, kb);
}

/* ---------- the bot ---------- */

let bot: Bot | null = null;

export function getBot(): Bot {
  if (bot) return bot;
  const c = tgConfig();
  if (!c.token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  const b = new Bot(c.token, { client: c.apiRoot ? { apiRoot: c.apiRoot } : undefined });

  // private chats only; and a per-chat flood limit (shared across instances)
  b.use(async (ctx, next) => {
    if (ctx.chat?.type !== 'private') return;
    if (dbConfigured()) {
      try {
        if (await overLimit(`msg:${ctx.chat.id}`, 60, LIMITS.perMinute)) {
          if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: 'One moment, please. Too many messages.' });
          else await ctx.reply('One moment, please. Too many messages in a minute.');
          return;
        }
      } catch (err) {
        console.error('Telegram bot: rate limit check failed', err);
      }
      void maybeCleanup();
    }
    await next();
  });

  b.command('start', async (ctx) => {
    const token = cleanInput(ctx.match ?? '', 64);
    if (token) return confirmSubmission(ctx, token);
    await send(ctx, WELCOME, menu());
  });
  b.command('help', (ctx) => send(ctx, HELP, menu()));
  b.command('services', (ctx) => send(ctx, servicesHtml()));
  b.command('work', (ctx) => send(ctx, workHtml()));
  b.command('contact', (ctx) => send(ctx, contactHtml(), contactKeyboard()));
  b.command('reset', async (ctx) => {
    if (dbConfigured()) await clearTurns(ctx.chat!.id).catch(() => {});
    await send(ctx, 'Done. I’ve forgotten our conversation so far.', menu());
  });

  b.callbackQuery(/^m:(\w+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const item = MENU[ctx.match[1]];
    if (!item) return;
    await send(ctx, item.html(), ctx.match[1] === 'contact' ? contactKeyboard() : undefined);
  });
  b.callbackQuery('ask', async (ctx) => {
    await ctx.answerCallbackQuery();
    await send(ctx, 'Type your question about Forgebyte, or pick one of these:', menu());
  });

  // questions: answered only from the website's content
  b.on('message:text', async (ctx) => {
    const raw = ctx.message.text;
    if (raw.startsWith('/')) return send(ctx, HELP, menu()); // unknown command
    const question = cleanInput(raw);
    if (!question) return;
    const chatId = ctx.chat.id;

    if (dbConfigured()) {
      try {
        if (await overLimit(`q:${chatId}`, 86400, LIMITS.questionsPerDay)) {
          return send(ctx, `That’s all the questions I can answer today. For more, email ${esc(CONTACT_EMAIL)} or message us on WhatsApp.`, contactKeyboard());
        }
      } catch (err) {
        console.error('Telegram bot: daily limit check failed', err);
      }
    }

    await ctx.replyWithChatAction('typing').catch(() => {});
    let history: Turn[] = [];
    if (dbConfigured()) history = await recentTurns(chatId).catch(() => []);
    const result = await answer(question, history);

    const note = raw.length > MAX_QUESTION ? `<i>(I read the first ${MAX_QUESTION} characters.)</i>\n\n` : '';
    const html = result.source
      ? `${note}${esc(result.text)}\n\n<a href="${result.source.url}">Read more: ${esc(result.source.title)} →</a>`
      : `${note}${esc(result.text)}`;
    await send(ctx, html, result.text === FALLBACK ? contactKeyboard() : undefined);

    if (dbConfigured()) {
      await addTurn(chatId, 'user', question).catch((err) => console.error('Telegram bot: history save failed', err));
      if (result.grounded) await addTurn(chatId, 'assistant', result.text).catch(() => {});
    }
  });

  b.on('message', (ctx) => send(ctx, 'I can only read text messages. Type your question about Forgebyte.'));

  b.catch((err) => console.error('Telegram bot: update failed', err.error));
  bot = b;
  return b;
}

/** Tests only: build a fresh bot after env changes. */
export function resetBotForTests() {
  bot = null;
}
