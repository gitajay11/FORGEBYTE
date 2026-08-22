// Server-side proxy to Groq. The API key stays here — it is never sent to
// the browser, and the client only ever talks to this route.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Groq retires model ids periodically — override with GROQ_MODEL if this one
// starts returning 404 / decommissioned.
const MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 12;

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
        stream: true,
        temperature: 0.6,
        max_tokens: 500,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    });
  } catch {
    return Response.json(
      { error: 'Could not reach the assistant.' },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Log upstream detail server-side; don't leak it to the client.
    console.error('Groq error', upstream.status, await upstream.text().catch(() => ''));
    return Response.json(
      { error: 'The assistant is unavailable right now.' },
      { status: 502 }
    );
  }

  // Groq speaks OpenAI-style SSE. Unwrap it and emit plain text so the client
  // can just append chunks as they arrive.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();

  // Network chunks don't align to SSE lines, so an event can straddle two
  // reads. Hold the incomplete tail between pulls instead of dropping it.
  let buffer = '';

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;

        try {
          const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) {
            controller.enqueue(encoder.encode(delta));
          }
        } catch {
          // a malformed event — skip it rather than killing the stream
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
