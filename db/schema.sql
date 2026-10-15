-- Forgebyte: Telegram bot + contact form storage (Neon Postgres).
-- Idempotent: safe to run again (npm run db:migrate). Statements are separated
-- by a line containing only "-- ;" so the migrate script can send them one at
-- a time over Neon's HTTP driver.

-- One row per contact-form submission. Kept so the Telegram confirmation can
-- summarise the request, and so "Reply by email" / "Call" buttons can look up
-- the visitor's details without putting them in a URL. Deleted after 90 days.
create table if not exists submissions (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  company     text not null default '',
  needs       text[] not null default '{}',
  budget      text not null default '',
  timeline    text not null default '',
  message     text not null,
  source      text not null default '',
  created_at  timestamptz not null default now()
);
-- ;
create index if not exists submissions_created_at on submissions (created_at);
-- ;

-- Which Telegram chat asked for updates on which submission.
create table if not exists telegram_links (
  chat_id        bigint not null,
  submission_id  uuid not null references submissions (id) on delete cascade,
  linked_at      timestamptz not null default now(),
  primary key (chat_id, submission_id)
);
-- ;

-- The last few turns per chat, for follow-up questions. Trimmed to 10 rows per
-- chat on every write and deleted after 90 days.
create table if not exists chat_messages (
  id          bigserial primary key,
  chat_id     bigint not null,
  role        text not null check (role in ('user', 'assistant')),
  text        text not null,
  created_at  timestamptz not null default now()
);
-- ;
create index if not exists chat_messages_chat on chat_messages (chat_id, id desc);
-- ;

-- Fixed-window counters (per chat per minute / per day), shared by every
-- serverless instance. Old windows are swept with the 90-day cleanup.
create table if not exists rate_limits (
  key           text not null,
  window_start  timestamptz not null,
  count         integer not null default 0,
  primary key (key, window_start)
);
