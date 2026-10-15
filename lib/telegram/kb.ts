// The bot's knowledge base: the website's own content (lib/content.ts — the
// same data the pages render), cut into chunks that each point back to the
// section they come from. Built in code from the deployed content, so it is
// always in sync with the site; `npm run kb:check` prints it for review.
//
// Retrieval is BM25 keyword search. The site is a few thousand words, small
// enough that keywords (with a short synonym list) find the right section
// without embeddings or a vector database.

import { caseStudies, engagements, faq, lab, privacy, process, services, studio, team } from '@/lib/content';
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, SITE_URL, WHATSAPP_URL } from '@/lib/site';

export type Chunk = { id: string; title: string; url: string; text: string };

const url = (path: string) => `${SITE_URL}${path}`;
const serviceName = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug;

export function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];

  chunks.push({
    id: 'about',
    title: 'About Forgebyte',
    url: url('/studio'),
    text: [
      `${studio.name} is a small studio in ${studio.city}, ${studio.country}, building websites, online stores, web apps and AI chat assistants for ${studio.idealClients}.`,
      `It is run by ${team.map((m) => `${m.display}, ${m.role}`).join(', and ')}. They run every project themselves, from the first call to launch.`,
      `Taking on new projects for ${studio.availability}. Works on ${studio.tzLabel}. Replies to enquiries within ${studio.replyWithin}.`,
      'Every project gets a written plan and a fixed price before work starts, with weekly updates.',
    ].join(' '),
  });

  chunks.push({
    id: 'contact',
    title: 'Contact Forgebyte',
    url: url('/contact'),
    text: [
      `Email ${CONTACT_EMAIL}. WhatsApp or phone ${CONTACT_PHONE_DISPLAY} (${WHATSAPP_URL.split('?')[0]}).`,
      `Or use the contact form on the website at ${url('/contact')}: name, email, what you need, budget, timeline and the problem. We reply within ${studio.replyWithin}.`,
    ].join(' '),
  });

  for (const s of services) {
    chunks.push({
      id: `service-${s.slug}`,
      title: s.name,
      url: url(`/services#${s.slug}`),
      text: [
        `${s.name}: ${s.promise}`,
        s.problem,
        `You get: ${s.deliverables.join('; ')}.`,
        `Time: ${s.duration}.`,
        `Right for you if ${s.fitIf} Not right if ${s.notFitIf}`,
      ].join(' '),
    });
  }

  for (const cs of caseStudies) {
    chunks.push({
      id: `work-${cs.slug}`,
      title: `${cs.title} (project)`,
      url: url(`/work/${cs.slug}`),
      text: [
        `${cs.title}, for ${cs.client} (${cs.industry}, ${cs.year}). Status: ${cs.status}. Website: ${cs.url}.`,
        cs.oneLiner,
        `The challenge: ${cs.problem}`,
        `Questions we asked: ${cs.questions.join(' ')}`,
        `What we did: ${cs.approach.map((a) => `${a.title}: ${a.body}`).join(' ')}`,
        `What we built: ${cs.build.join('; ')}.`,
        `Result: ${cs.outcome}`,
        `Services: ${cs.services.map(serviceName).join(', ')}. Built with ${cs.stack.join(', ')}.`,
      ].join(' '),
    });
  }

  chunks.push({
    id: 'process',
    title: 'How a project works',
    url: url('/#process'),
    text: `Five steps. ${process.map((p, i) => `${i + 1}. ${p.name}: ${p.what} You get: ${p.receive}. Takes: ${p.time}.`).join(' ')}`,
  });

  chunks.push({
    id: 'engage',
    title: 'Ways to work together',
    url: url('/#engage'),
    text: `${engagements.map((e) => `${e.name}: ${e.includes} Duration: ${e.duration}. Price: ${e.price}.`).join(' ')} Every project gets its own written price before work starts, and payment terms are agreed up front.`,
  });

  faq.forEach((f, i) => {
    chunks.push({ id: `faq-${i + 1}`, title: f.q, url: url('/#faq'), text: `${f.q} ${f.a}` });
  });

  chunks.push({
    id: 'demos',
    title: 'Demos and experiments',
    url: url('/lab'),
    text: `Example websites, not client projects. ${lab.map((l) => `${l.title} (${l.kind}): ${l.body}`).join(' ')}`,
  });

  chunks.push({
    id: 'privacy',
    title: 'Privacy',
    url: url('/privacy'),
    text: [
      ...privacy.collect.map((c) => `${c.label}: ${c.text}`),
      privacy.notDo,
      privacy.where,
      `To have your data removed, email ${CONTACT_EMAIL} ${privacy.removal}`,
    ].join(' '),
  });

  return chunks;
}

/* ---------------- BM25 ---------------- */

const STOP = new Set(('a an and are as at be but by can could do does did for from had has have how i if in into is it its me my of on or our so than that the their them then there these they this to too us was we were what when where which who why will with would you your yours about any also just get got want need tell please much many more some'.split(' ')));

// a few everyday words people use for what the site calls something else
const SYNONYMS: Record<string, string[]> = {
  price: ['cost', 'fixed', 'quote'], pricing: ['cost', 'price'], cost: ['price'], charge: ['cost', 'price'], fee: ['cost', 'price'], budget: ['cost', 'price'], expensive: ['cost'], cheap: ['cost'],
  long: ['weeks', 'time'], time: ['weeks'], timeline: ['weeks', 'time'], quick: ['weeks', 'quick'], fast: ['quick', 'weeks'],
  shop: ['store', 'online'], ecommerce: ['store', 'online', 'payments'], store: ['shop'], payment: ['payments'],
  app: ['web', 'apps'], website: ['websites', 'site'], site: ['website'],
  ai: ['assistant', 'assistants', 'chat'], chatbot: ['assistant', 'chat'], bot: ['assistant', 'chat'],
  portfolio: ['work', 'project'], projects: ['work', 'project'], clients: ['client', 'work'], examples: ['work', 'demo'],
  maintenance: ['care', 'launch', 'monthly'], support: ['care', 'launch'], hosting: ['launch', 'live'],
  contact: ['email', 'whatsapp', 'phone'], call: ['phone', 'whatsapp', 'chat'], reach: ['contact', 'email'],
  located: ['chennai', 'india'], location: ['chennai', 'india'], where: ['chennai'], based: ['chennai', 'india'],
  founder: ['ajay', 'pari', 'founder'], team: ['ajay', 'pari'], who: ['ajay', 'pari'],
  mvp: ['first', 'version'], prototype: ['first', 'version'],
  data: ['privacy'], gdpr: ['privacy'], cookies: ['privacy', 'analytics'],
  nda: ['nda'], own: ['owns'], ownership: ['owns'],
};

function stem(w: string) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

type Index = { chunks: Chunk[]; docs: Map<string, number>[]; lengths: number[]; avg: number; df: Map<string, number> };
let index: Index | null = null;

function getIndex(): Index {
  if (index) return index;
  const chunks = buildChunks();
  const docs = chunks.map((c) => {
    const tf = new Map<string, number>();
    // the title counts twice: it says what the chunk is about
    for (const t of [...tokenize(c.title), ...tokenize(c.title), ...tokenize(c.text)]) tf.set(t, (tf.get(t) ?? 0) + 1);
    return tf;
  });
  const lengths = docs.map((d) => [...d.values()].reduce((a, b) => a + b, 0));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  index = { chunks, docs, lengths, avg: lengths.reduce((a, b) => a + b, 0) / lengths.length, df };
  return index;
}

export type Hit = { chunk: Chunk; score: number };

/** The `k` best chunks for a query (best first), with their BM25 scores. */
export function search(query: string, k = 4): Hit[] {
  const { chunks, docs, lengths, avg, df } = getIndex();
  const terms = new Map<string, number>(); // term -> weight (synonyms count half)
  for (const t of tokenize(query)) terms.set(t, 1);
  // synonyms from the raw words, so "who"/"where" (stopwords) still expand
  for (const w of query.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    for (const s of SYNONYMS[w] ?? SYNONYMS[stem(w)] ?? []) if (!terms.has(stem(s))) terms.set(stem(s), 0.5);
  }
  const N = chunks.length, k1 = 1.4, b = 0.75;
  const scored = docs.map((tf, i) => {
    let score = 0;
    for (const [t, w] of terms) {
      const f = tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      score += w * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * lengths[i]) / avg)));
    }
    return { chunk: chunks[i], score };
  });
  return scored.filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}
