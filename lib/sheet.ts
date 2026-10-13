// Appends each contact-form enquiry to a Google Sheet through Sheet Ninja
// (https://docs.sheetninja.io). Server-only — the endpoint URL and token
// never reach the browser.
//
// Sheet Ninja maps camelCase keys onto the sheet's row-1 headers
// ("submittedAt" -> "Submitted At"), so the sheet needs this header row:
//   Submitted At | Reference | Name | Email | Phone | Company | Service |
//   Budget | Timeline | Message | Page
// Keys with no matching header are skipped by Sheet Ninja and logged here.

import 'server-only';

const env = (name: string) => (process.env[name] ?? '').trim();

/** The tab's endpoint from the Sheet Ninja dashboard:
 *  https://api.sheetninja.io/{namespace}/{project}/{tab} */
const SHEETNINJA_API_URL = env('SHEETNINJA_API_URL');
/** Only needed if protection is switched on for the endpoint. */
const SHEETNINJA_TOKEN = env('SHEETNINJA_TOKEN');

export const sheetConfigured = Boolean(SHEETNINJA_API_URL);

export type SheetRow = {
  submittedAt: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  page: string;
};

/** Sheets reads a cell starting with = + - @ as a formula; a leading
 *  apostrophe keeps it plain text (and stays hidden in the cell). */
const asText = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);

/** "2026-10-13 20:07:15" in India time — sorts correctly as text and is
 *  read as a date-time by Sheets. */
export function istTimestamp(d: Date): string {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
}

/** Adds one row. Throws on failure so the caller can decide what it means. */
export async function appendToSheet(row: SheetRow): Promise<void> {
  if (!sheetConfigured) throw new Error('SHEETNINJA_API_URL is not set');
  const body = Object.fromEntries(Object.entries(row).map(([k, v]) => [k, asText(v)]));
  const res = await fetch(SHEETNINJA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SHEETNINJA_TOKEN ? { Authorization: `Bearer ${SHEETNINJA_TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { added?: number; warning?: string; ignored_keys?: string[]; error?: string; message?: string };
  if (!res.ok) {
    throw new Error(`Sheet Ninja ${res.status}${data.error ? ` ${data.error}` : ''}${data.message ? `: ${data.message}` : ''}`);
  }
  // Not fatal, but means the header row doesn't match — worth seeing in logs.
  if (data.ignored_keys?.length) console.warn('Sheet Ninja ignored keys (no matching header):', data.ignored_keys.join(', '));
  if (data.warning) console.warn('Sheet Ninja warning:', data.warning);
}
