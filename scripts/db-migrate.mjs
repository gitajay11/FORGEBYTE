// Applies db/schema.sql to the database in DATABASE_URL. Idempotent: every
// statement is "create … if not exists", so running it again is safe.
//   npm run db:migrate            (reads DATABASE_URL from the environment / .env.local)

import { readFileSync, existsSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// pick up DATABASE_URL from .env.local / .env when it isn't already set
for (const file of ['.env.local', '.env']) {
  if (process.env.DATABASE_URL || !existsSync(file)) continue;
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
  if (line) process.env.DATABASE_URL = line.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
}

const url = (process.env.DATABASE_URL ?? '').trim();
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local (or the environment) and run again.');
  process.exit(1);
}

const sql = neon(url);
const statements = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split(/^-- ;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log('✓', statement.split('\n')[0].replace(/\s*\($/, ''));
}
console.log(`Done: ${statements.length} statements applied.`);
