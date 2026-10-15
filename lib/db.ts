import 'server-only';
import { neon } from '@neondatabase/serverless';

// Neon Postgres over HTTP (one request per query, nothing to pool), for the
// Telegram bot and contact-form storage. Schema: db/schema.sql.

export type Sql = <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

let client: Sql | null = null;
let override: Sql | null = null;

/** Tests only: send queries to an in-process Postgres instead (scripts/test-telegram.ts). */
export function setSqlForTests(fn: Sql | null) {
  override = fn;
}

export const dbConfigured = () => Boolean(override || (process.env.DATABASE_URL ?? '').trim());

export function sql(): Sql {
  if (override) return override;
  if (!client) {
    const url = (process.env.DATABASE_URL ?? '').trim();
    if (!url) throw new Error('DATABASE_URL is not set');
    client = neon(url) as unknown as Sql;
  }
  return client;
}
