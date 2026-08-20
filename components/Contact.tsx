'use client';

import { useState } from 'react';
import Select from './Select';

// Posts to Formspree, which forwards submissions to the account inbox.
const FORM_ENDPOINT = 'https://formspree.io/f/mrpzrjwa';

const PROJECT_TYPES = [
  'Web App Development',
  'API & Backend',
  'MVP Sprint',
  'Ongoing Support',
  'Other',
] as const;

const DEFAULT_PROJECT_TYPE = PROJECT_TYPES[0];

const SENT_MESSAGE = "✓ message sent — I'll reply within a day.";

type Status = { text: string; tone: '' | 'success' | 'error' };

export default function Contact() {
  const [projectType, setProjectType] = useState<string>(DEFAULT_PROJECT_TYPE);
  const [status, setStatus] = useState<Status>({ text: '', tone: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const resetForm = () => {
      form.reset();
      setProjectType(DEFAULT_PROJECT_TYPE);
    };

    // Honeypot: if this hidden field got filled in, silently drop it (bot)
    if (data.get('_gotcha')) {
      setStatus({ text: SENT_MESSAGE, tone: 'success' });
      resetForm();
      return;
    }

    setSubmitting(true);
    setStatus({ text: '$ sending message...', tone: '' });

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Submission failed');

      setStatus({ text: SENT_MESSAGE, tone: 'success' });
      resetForm();
    } catch {
      setStatus({
        text: '✗ something went wrong — email hello@forgebyte.dev directly.',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact">
      <div className="wrap">
        <div className="contact-box">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            contact
          </div>
          <h2>Have a project in mind?</h2>
          <p>
            Tell me what you&apos;re building — I&apos;ll reply within a day with
            next steps or a few clarifying questions.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <Select
              id="projectType"
              name="project_type"
              label="Project type"
              options={PROJECT_TYPES}
              value={projectType}
              onChange={setProjectType}
            />

            <div className="field">
              <label htmlFor="message">Project details</label>
              <textarea
                id="message"
                name="message"
                placeholder="What are you building, and what's the timeline?"
                required
              />
            </div>

            {/* Honeypot spam trap — stays empty for real visitors, hidden from view */}
            <input
              type="text"
              name="_gotcha"
              className="honeypot"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="form-submit-row">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                Send message →
              </button>
              <p
                className={`form-status${status.tone ? ` ${status.tone}` : ''}`}
                role="status"
                aria-live="polite"
              >
                {status.text}
              </p>
            </div>
          </form>

          <div className="contact-divider">or</div>

          <div className="contact-links">
            {/* TODO: replace with your real email */}
            <a href="mailto:hello@forgebyte.dev" className="btn btn-ghost">
              Email hello@forgebyte.dev
            </a>
            {/* TODO: replace with your real Calendly link */}
            <a
              href="https://calendly.com/forgebyte"
              className="btn btn-ghost"
              target="_blank"
              rel="noopener"
            >
              Book a call →
            </a>
          </div>
          <div className="social-row">
            {/* TODO: replace with your real GitHub */}
            <a href="https://github.com/forgebyte" target="_blank" rel="noopener">
              GitHub
            </a>
            {/* TODO: replace with your real LinkedIn */}
            <a
              href="https://linkedin.com/in/forgebyte"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
            {/* TODO: replace with your real X/Twitter */}
            <a href="https://x.com/forgebyte" target="_blank" rel="noopener">
              X / Twitter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
