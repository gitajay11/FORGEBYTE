import 'server-only';
import { sql } from '@/lib/db';

// Queries for the bot and the contact form (tables: db/schema.sql).

export type Submission = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  needs: string[];
  budget: string;
  timeline: string;
  message: string;
  source: string;
  created_at: string;
};

export type NewSubmission = Omit<Submission, 'id' | 'created_at'>;

export async function saveSubmission(s: NewSubmission): Promise<string> {
  const rows = await sql()<{ id: string }>`
    insert into submissions (reference, name, email, phone, company, needs, budget, timeline, message, source)
    values (${s.reference}, ${s.name}, ${s.email}, ${s.phone}, ${s.company}, ${s.needs}, ${s.budget}, ${s.timeline}, ${s.message}, ${s.source})
    returning id`;
  return rows[0].id;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const rows = await sql()<Submission>`select * from submissions where id = ${id}`;
  return rows[0] ?? null;
}

/** Links a chat to a submission. False if the submission no longer exists. */
export async function linkChat(chatId: number, submissionId: string): Promise<boolean> {
  const rows = await sql()`
    insert into telegram_links (chat_id, submission_id)
    select ${chatId}, id from submissions where id = ${submissionId}
    on conflict (chat_id, submission_id) do update set linked_at = now()
    returning submission_id`;
  return rows.length > 0;
}

export type Turn = { role: 'user' | 'assistant'; text: string };

/** The last `n` turns of a chat, oldest first. */
export async function recentTurns(chatId: number, n = 6): Promise<Turn[]> {
  const rows = await sql()<Turn>`
    select role, text from chat_messages where chat_id = ${chatId} order by id desc limit ${n}`;
  return rows.reverse();
}

/** Stores a turn and keeps only the newest 10 per chat. */
export async function addTurn(chatId: number, role: Turn['role'], text: string): Promise<void> {
  await sql()`insert into chat_messages (chat_id, role, text) values (${chatId}, ${role}, ${text})`;
  await sql()`
    delete from chat_messages where chat_id = ${chatId}
    and id not in (select id from chat_messages where chat_id = ${chatId} order by id desc limit 10)`;
}

export async function clearTurns(chatId: number): Promise<void> {
  await sql()`delete from chat_messages where chat_id = ${chatId}`;
}

/**
 * Fixed-window counter shared by every serverless instance. Records a hit and
 * returns true when `key` is over `max` within the current `windowSeconds`.
 */
export async function overLimit(key: string, windowSeconds: number, max: number): Promise<boolean> {
  const rows = await sql()<{ count: number }>`
    insert into rate_limits (key, window_start, count)
    values (${key}, to_timestamp(floor(extract(epoch from now()) / ${windowSeconds}) * ${windowSeconds}), 1)
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`;
  return Number(rows[0]?.count ?? 0) > max;
}

/**
 * Deletes submissions and chat history older than 90 days, and spent rate
 * windows. Runs on roughly one request in 50, so no scheduled job is needed.
 */
export async function maybeCleanup(chance = 0.02): Promise<void> {
  if (Math.random() > chance) return;
  try {
    await sql()`delete from submissions where created_at < now() - interval '90 days'`;
    await sql()`delete from chat_messages where created_at < now() - interval '90 days'`;
    await sql()`delete from rate_limits where window_start < now() - interval '2 days'`;
  } catch (err) {
    console.error('Telegram store: cleanup failed', err);
  }
}
