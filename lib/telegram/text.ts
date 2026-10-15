// Everything that comes from a visitor passes through cleanInput() before it
// is stored, put in a prompt or echoed in a message, and through esc() before
// it goes into a Telegram message (sent as HTML).

// control characters, zero-width and bidi-override characters (used to hide
// or reorder text)
// eslint-disable-next-line no-control-regex
const HIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

export const MAX_QUESTION = 500;

export function cleanInput(value: string, max = MAX_QUESTION): string {
  return value
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(HIDDEN, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Escapes text for Telegram's HTML parse mode. */
export const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Telegram limits a message to 4096 characters. */
export const fit = (value: string, max = 4000) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);
