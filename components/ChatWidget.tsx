'use client';

import { useState, useRef, useEffect } from 'react';
import { WHATSAPP_URL } from '@/lib/site';

type Topic = { id: string; question: string; answer: string };

// Answers are drawn from what the page already states. Pricing deliberately
// gives no numbers — quoting a figure here that isn't on the site would be
// making one up.
const TOPICS: Topic[] = [
  {
    id: 'services',
    question: 'What do you build?',
    answer:
      'Four kinds of engagement: full web application builds, API and backend systems, MVP sprints to validate an idea, and ongoing support after launch. If it runs in a browser and needs a real backend, it is probably in scope.',
  },
  {
    id: 'stack',
    question: 'What stack do you use?',
    answer:
      'Next.js and TypeScript on the front, Node.js with PostgreSQL or Supabase behind it, Prisma for data access, Stripe where payments are involved, and Docker plus Vercel to ship. One opinionated stack, so every project starts from proven ground.',
  },
  {
    id: 'timeline',
    question: 'How long does a project take?',
    answer:
      'MVP sprints are measured in weeks, not months. Bigger builds get split into milestones so you see working software every week rather than only at the end.',
  },
  {
    id: 'process',
    question: 'How does a project run?',
    answer:
      'Four stages. Discover — a short call to pin down scope and success criteria. Design and Build — iterative, with weekly check-ins. Test and Ship — QA, performance checks, deploy. Support — a window after launch to fix what comes up.',
  },
  {
    id: 'pricing',
    question: 'What does it cost?',
    answer:
      'Every build is scoped on its own — an MVP sprint and a long-running product are very different numbers. Tell me roughly what you are building and you will get a fixed quote back, usually within a day.',
  },
  {
    id: 'work',
    question: 'Can I see past work?',
    answer:
      'Yes — Loopa, a sparkling drinks brand site with a distributor bulk-order flow, and Nutriyah, the parent food and beverage company site. Both are live and linked in the Work section above.',
  },
];

const GREETING =
  "Hi! I can answer the usual questions about Forgebyte. Pick one below, or jump straight to a real conversation on WhatsApp.";

type Message = { id: number; from: 'bot' | 'user'; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: 'bot', text: GREETING },
  ]);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const remaining = TOPICS.filter((t) => !askedIds.includes(t.id));

  // clear pending replies on unmount so a timer can't fire into a dead tree
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  // Pin to the newest message. scrollIntoView on a trailing marker stopped a
  // few pixels short of the end, so drive scrollTop directly.
  useEffect(() => {
    if (!open) return;
    const log = logRef.current;
    if (!log) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, typing, open]);

  // Escape closes and hands focus back to the launcher
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const ask = (topic: Topic) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, from: 'user', text: topic.question },
    ]);
    setAskedIds((prev) => [...prev, topic.id]);
    setTyping(true);

    // a short pause so it reads as a reply rather than an instant dump
    timers.current.push(
      setTimeout(
        () => {
          setTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: nextId.current++, from: 'bot', text: topic.answer },
          ]);
        },
        reduce ? 0 : 550
      )
    );
  };

  const restart = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyping(false);
    setAskedIds([]);
    setMessages([{ id: nextId.current++, from: 'bot', text: GREETING }]);
  };

  const goToContact = () => {
    setOpen(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat">
      <div
        className={`chat-panel${open ? ' open' : ''}`}
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Chat with Forgebyte"
        aria-hidden={!open}
      >
        <div className="chat-head">
          <span className="chat-head-dot" aria-hidden="true" />
          <div>
            <strong>Forgebyte</strong>
            <span>Usually replies within a day</span>
          </div>
          <button
            type="button"
            className="chat-close"
            onClick={() => {
              setOpen(false);
              launcherRef.current?.focus();
            }}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="chat-log" role="log" aria-live="polite" ref={logRef}>
          {messages.map((m) => (
            <p key={m.id} className={`chat-msg ${m.from}`}>
              {m.text}
            </p>
          ))}
          {typing && (
            <p className="chat-msg bot chat-typing" aria-label="Typing">
              <span />
              <span />
              <span />
            </p>
          )}
        </div>

        <div className="chat-actions">
          {remaining.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="chat-chip"
              onClick={() => ask(topic)}
              disabled={typing}
            >
              {topic.question}
            </button>
          ))}
          {remaining.length === 0 && (
            <button type="button" className="chat-chip" onClick={restart}>
              Start over
            </button>
          )}
        </div>

        <div className="chat-foot">
          <a
            className="chat-wa"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
            </svg>
            Chat on WhatsApp
          </a>
          <button type="button" className="chat-form-link" onClick={goToContact}>
            Send a message instead
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`chat-launcher${open ? ' open' : ''}`}
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <svg className="chat-icon-chat" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="chat-icon-close" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
