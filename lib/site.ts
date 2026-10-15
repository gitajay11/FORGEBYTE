// The apex domain 308-redirects to www, so www is the canonical host.
// Everything that emits an absolute URL should read from here.
export const SITE_URL = 'https://www.forgebyte.online';

export const SITE_NAME = 'Forgebyte';

export const SITE_TITLE = 'Forgebyte — Websites, online stores and apps, built in Chennai';

export const SITE_DESCRIPTION =
  'A small studio building websites, online stores, apps and AI chat assistants for small businesses and startups. Plain English, a fixed price, and weekly updates.';

export const CONTACT_EMAIL = 'admin.forgebyte@gmail.com';

// E.164 for the tel: href — a bare 10-digit number only dials from inside
// the same country. +91 assumed; change if the number isn't Indian.
export const CONTACT_PHONE_E164 = '+916374972948';
export const CONTACT_PHONE_DISPLAY = '+91 63749 72948';

// wa.me wants the country code with no leading '+'
export const CONTACT_WHATSAPP = CONTACT_PHONE_E164.replace(/\D/g, '');

export const WHATSAPP_URL = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(
  "Hi! I found Forgebyte and I'd like to talk about a project."
)}`;

// The Forgebyte Telegram bot (docs/TELEGRAM.md). Public, so it lives here; the
// same username is TELEGRAM_BOT_USERNAME on the server.
export const TELEGRAM_BOT_URL = 'https://t.me/forgeByteBot';

// Shared by the contact form and the chat widget's lead capture, so leads from
// both land in the same inbox.
