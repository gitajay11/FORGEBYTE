// The apex domain 308-redirects to www, so www is the canonical host.
// Everything that emits an absolute URL should read from here.
export const SITE_URL = 'https://www.forgebyte.online';

export const SITE_NAME = 'Forgebyte';

export const SITE_TITLE = 'Forgebyte — Freelance Web Application Development';

export const SITE_DESCRIPTION =
  'Forgebyte builds fast, scalable web applications for founders who need to ship. Full-stack development, MVP sprints, and ongoing support.';

export const CONTACT_EMAIL = 'ajayak15012004@gmail.com';

// E.164 for the tel: href — a bare 10-digit number only dials from inside
// the same country. +91 assumed; change if the number isn't Indian.
export const CONTACT_PHONE_E164 = '+916374972948';

// wa.me wants the country code with no leading '+'
export const CONTACT_WHATSAPP = CONTACT_PHONE_E164.replace(/\D/g, '');

export const WHATSAPP_URL = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(
  "Hi! I found Forgebyte and I'd like to talk about a project."
)}`;
