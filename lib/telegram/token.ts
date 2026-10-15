import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { tgConfig } from './config';

// Short signed tokens that carry only a submission id — never personal data.
//   start: t.me/<bot>?start=<token> links a chat to a submission (24h)
//   mail/call: the work chat's "Reply by email" / "Call" buttons, which open
//     /api/telegram/go?t=<token>; the server looks the address up (90 days,
//     the same as the data is kept)
// Layout: 1 byte kind + 16 bytes uuid + 4 bytes expiry (unix s) + 12 bytes
// HMAC-SHA256 = 33 bytes -> 44 base64url chars (Telegram allows 64, A-Z a-z 0-9 _ -).

const KINDS = { start: 1, mail: 2, call: 3 } as const;
export type TokenKind = keyof typeof KINDS;
export const TTL = { start: 24 * 3600, mail: 90 * 86400, call: 90 * 86400 } as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mac(body: Buffer) {
  const secret = tgConfig().linkSecret;
  if (!secret) throw new Error('TELEGRAM_LINK_SECRET is not set');
  return createHmac('sha256', secret).update(body).digest().subarray(0, 12);
}

export function signToken(kind: TokenKind, submissionId: string, now = Date.now()): string {
  if (!UUID_RE.test(submissionId)) throw new Error('bad submission id');
  const exp = Buffer.alloc(4);
  exp.writeUInt32BE(Math.floor(now / 1000) + TTL[kind]);
  const body = Buffer.concat([Buffer.from([KINDS[kind]]), Buffer.from(submissionId.replace(/-/g, ''), 'hex'), exp]);
  return Buffer.concat([body, mac(body)]).toString('base64url');
}

/** The submission id, or null if the token is malformed, forged, the wrong kind or expired. */
export function verifyToken(kind: TokenKind, token: string, now = Date.now()): string | null {
  if (!/^[A-Za-z0-9_-]{44}$/.test(token)) return null;
  const raw = Buffer.from(token, 'base64url');
  if (raw.length !== 33) return null;
  const body = raw.subarray(0, 21);
  let expected: Buffer;
  try { expected = mac(body); } catch { return null; }
  if (!timingSafeEqual(expected, raw.subarray(21))) return null;
  if (body[0] !== KINDS[kind]) return null;
  if (body.readUInt32BE(17) < Math.floor(now / 1000)) return null;
  const hex = body.subarray(1, 17).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
