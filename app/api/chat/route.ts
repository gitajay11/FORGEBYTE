// Server-side proxy to Groq. The API key stays here — it is never sent to
// the browser, and the client only ever talks to this route.

import { after } from 'next/server';
import { extractContact, forwardLead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Groq retires model ids periodically — override with GROQ_MODEL if this one
// starts failing. llama-3.3-70b-versatile was shut off on 2026-08-16; Groq
// recommends openai/gpt-oss-120b as its replacement.
// https://console.groq.com/docs/deprecations
const MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 12;
const UPSTREAM_TIMEOUT_MS = 25_000;

// Crude per-instance limiter. On serverless each instance has its own map, so
// this trims casual abuse but is NOT a real quota guard — see README.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // bound memory on a long-lived instance
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

const SYSTEM_PROMPT = `You are the assistant on the website of Forgebyte, a one-person freelance web application development studio run by Ajay.

What Forgebyte offers:
- Web application development: end-to-end product builds, first commit to production deploy.
- API and backend systems: APIs, database design, third-party integrations.
- MVP sprints: a working, testable prototype in weeks, to validate an idea.
- Ongoing support: bug fixes, features and maintenance after launch.

Stack: Next.js, TypeScript, Tailwind CSS, Node.js, PostgreSQL, Supabase, Prisma, Stripe, Docker, Vercel.

Process, four stages: Discover (a short call to define scope and success criteria), Design and Build (iterative, weekly check-ins), Test and Ship (QA, performance checks, production deploy), Support (a post-launch window).

Shipped work: Loopa (loopa.nutriyah.com), a sparkling drinks brand site with a distributor bulk-order flow, and Nutriyah (nutriyah.com), the parent food and beverage company site.

Contact: the form on this page, WhatsApp, or email ajayak15012004@gmail.com.

Callbacks and contact details:
- An email address or phone number typed into this chat IS forwarded to Ajay automatically, so you may confirm that it has been passed on.
- If someone asks for a callback but has NOT given an email or phone number, do not say you will pass anything on — there is nothing to pass. Ask them for an email or phone number, or point them to the contact form or WhatsApp.
- Never claim to have scheduled a call, booked a time, or checked availability. You cannot do any of those.

Rules:
- Be brief. Two or three sentences unless asked for detail. This is a chat bubble, not a document.
- NEVER quote prices, rates, day rates or hourly figures. No pricing has been published. If asked about cost, say each build is scoped individually and invite them to describe the project for a fixed quote.
- Never invent timelines, client names, team size, testimonials or case studies beyond what is listed above.
- If you do not know something, say so and point them to the contact form or WhatsApp.
- Stay on the subject of Forgebyte and the visitor's project. Politely decline unrelated requests.
- Write plain prose. No markdown formatting, headings or bullet characters.`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'The assistant is not configured yet.' },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many messages just now — give it a minute.' },
      { status: 429 }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'No messages supplied.' }, { status: 400 });
  }

  // Rebuild the history ourselves rather than trusting the client's shape,
  // and drop anything that isn't a plain user/assistant turn.
  const messages: ChatMessage[] = [];
  for (const raw of body.messages.slice(-MAX_TURNS)) {
    if (typeof raw !== 'object' || raw === null) continue;
    const { role, content } = raw as Record<string, unknown>;
    if (role !== 'user' && role !== 'assistant') continue;
    if (typeof content !== 'string' || !content.trim()) continue;
    messages.push({ role, content: content.slice(0, MAX_MESSAGE_CHARS) });
  }

  if (!messages.length) {
    return Response.json({ error: 'No usable messages.' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        // Deliberately NOT streaming. A streamed ReadableStream response sat
        // behind Vercel returning zero bytes for 150s+; one JSON response has
        // nothing for the platform to buffer and is far easier to diagnose.
        // Groq is fast enough that the typing indicator covers the wait.
        stream: false,
        temperature: 0.6,
        // gpt-oss uses max_completion_tokens; max_tokens is ignored, which
        // lets the model run toward its 33k output ceiling.
        // reasoning tokens count against this too, so leave headroom above
        // what the answer itself needs
        max_completion_tokens: 700,
        // gpt-oss reasons before answering, and reasoning arrives in a
        // separate field this route deliberately doesn't forward. At the
        // default 'medium' that means a long silent gap before any content.
        reasoning_effort: 'low',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
      // never let a stalled upstream hang the request indefinitely
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = (err as Error)?.name === 'TimeoutError';
    console.error('Groq request failed', MODEL, err);
    return Response.json(
      {
        error: timedOut
          ? 'The assistant took too long to reply.'
          : 'Could not reach the assistant.',
        model: MODEL,
      },
      { status: 504 }
    );
  }

  if (!upstream.ok) {
    // Full detail goes to the server log only.
    const detail = await upstream.text().catch(() => '');
    console.error('Groq error', upstream.status, MODEL, detail);

    // The status code and model id are echoed back because without them a
    // production failure is undiagnosable from outside — a retired model and
    // a bad key both look identical. Neither value is sensitive; the upstream
    // body, which can carry account detail, is not included.
    return Response.json(
      {
        error: 'The assistant is unavailable right now.',
        upstreamStatus: upstream.status,
        model: MODEL,
      },
      { status: 502 }
    );
  }

  let reply: unknown;
  try {
    const data = await upstream.json();
    reply = data?.choices?.[0]?.message?.content;
  } catch (err) {
    console.error('Groq response parse failed', MODEL, err);
    return Response.json(
      { error: 'The assistant sent something unreadable.', model: MODEL },
      { status: 502 }
    );
  }

  if (typeof reply !== 'string' || !reply.trim()) {
    // gpt-oss can spend its whole budget on reasoning and return empty
    // content — surface that rather than showing a blank bubble.
    console.error('Groq returned no content', MODEL);
    return Response.json(
      { error: 'The assistant had nothing to say — try rephrasing.', model: MODEL },
      { status: 502 }
    );
  }

  const answer = reply.trim();

  // If the visitor left contact details, forward them to the same inbox the
  // contact form feeds. after() runs once the reply is sent, so capture never
  // delays the response — and a plain fire-and-forget would be killed when
  // the serverless invocation ends.
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const contact = latestUserMessage
    ? extractContact(latestUserMessage.content)
    : null;

  if (contact) {
    after(() =>
      forwardLead(contact, [...messages, { role: 'assistant', content: answer }])
    );
  }

  return Response.json(
    { reply: answer, captured: Boolean(contact) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
