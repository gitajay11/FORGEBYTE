'use client';

import { useRef, useState } from 'react';
import { services, studio } from '@/lib/content';
import { CONTACT_EMAIL } from '@/lib/site';
import { track } from '@/lib/track';

export const BUDGETS = ['Not sure yet', 'Under ₹1 lakh', '₹1–3 lakh', '₹3–8 lakh', '₹8 lakh +'];
export const TIMELINES = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'];
/** Last choice in "What you need" — sent like any other option. */
export const NOT_SURE = 'Not sure yet';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; text: string }
  | { kind: 'done'; reference: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(data: FormData): Errors {
  const e: Errors = {};
  if (!String(data.get('name') ?? '').trim()) e.name = 'Tell us what to call you.';
  const email = String(data.get('email') ?? '').trim();
  if (!email) e.email = 'We need an email to reply to.';
  else if (!EMAIL_RE.test(email)) e.email = 'That email address does not look right.';
  if (String(data.get('message') ?? '').trim().length < 10) e.message = 'A sentence or two about the problem, please.';
  return e;
}

export default function ContactForm({ source = 'contact' }: { source?: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [errors, setErrors] = useState<Errors>({});
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onInput = (e: React.FormEvent<HTMLFormElement>) => {
    // clear a field's error as soon as it becomes valid
    const name = (e.target as HTMLInputElement).name as keyof Errors;
    if (errors[name] && !validate(new FormData(e.currentTarget))[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (started.current) return;
    started.current = true;
    track('form_start', { source });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);
    const firstBad = (['name', 'email', 'message'] as const).find((k) => found[k]);
    if (firstBad) {
      form.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not send your message right now.');
      track('form_submit', { source });
      setState({ kind: 'done', reference: body.reference ?? '' });
    } catch (err) {
      // keep everything the visitor typed; offer the direct route
      setState({ kind: 'error', text: (err as Error).message });
    }
  }

  if (state.kind === 'done') {
    return (
      <div className="form-done" role="status" aria-live="polite">
        <p className="mono" style={{ marginBottom: 12 }}>{state.reference ? `Reference ${state.reference}` : 'Sent'}</p>
        <h3 className="h3">Received. Coffee is brewing.</h3>
        <p>We&apos;ll reply within {studio.replyWithin}. A confirmation with a copy of your message is on its way to your inbox.</p>
        <button className="ulink" type="button" onClick={() => { setState({ kind: 'idle' }); started.current = false; }}>
          Send another message
        </button>
      </div>
    );
  }

  const sending = state.kind === 'sending';
  const err = (k: keyof Errors) =>
    errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-error` } : {};

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} onInput={onInput} noValidate aria-busy={sending}>
      <p className="form-note"><span className="req" aria-hidden="true">*</span>Required</p>
      <div className="field">
        <label htmlFor="cf-name">Name<span className="req" aria-hidden="true">*</span></label>
        <input id="cf-name" name="name" className="input" autoComplete="name" required aria-required="true" {...err('name')} />
        <p className="field-error" id="name-error" aria-live="polite">{errors.name}</p>
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email<span className="req" aria-hidden="true">*</span></label>
        <input id="cf-email" name="email" type="email" className="input" autoComplete="email" inputMode="email" required aria-required="true" {...err('email')} />
        <p className="field-error" id="email-error" aria-live="polite">{errors.email}</p>
      </div>
      <div className="field full">
        <label htmlFor="cf-company">Company <span className="opt">(optional)</span></label>
        <input id="cf-company" name="company" className="input" autoComplete="organization" />
      </div>
      <fieldset className="field full">
        <legend>What you need <span className="opt">(optional, pick any)</span></legend>
        <div className="chips">
          {[...services.map((s) => s.short), NOT_SURE].map((need) => (
            <label className="chip" key={need}>
              <input type="checkbox" name="needs" value={need} />
              <span>{need}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="cf-budget">Budget <span className="opt">(optional)</span></label>
        <div className="select">
          <select id="cf-budget" name="budget" className="input" defaultValue="">
            <option value="">Choose a range</option>
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-timeline">Timeline <span className="opt">(optional)</span></label>
        <div className="select">
          <select id="cf-timeline" name="timeline" className="input" defaultValue="">
            <option value="">Choose one</option>
            {TIMELINES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="field full">
        <label htmlFor="cf-message">What&apos;s the problem?<span className="req" aria-hidden="true">*</span></label>
        <textarea id="cf-message" name="message" className="input" placeholder="What are you trying to fix or build, and for whom?" required aria-required="true" {...err('message')} />
        <p className="field-error" id="message-error" aria-live="polite">{errors.message}</p>
      </div>

      {/* spam trap: real visitors never see or fill this */}
      <input type="text" name="_gotcha" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending} data-magnetic>
          {sending ? <><span className="spinner" aria-hidden="true" /> Sending…</> : <>Send it <span className="arrow" aria-hidden="true">→</span></>}
        </button>
        <p className="form-status" role="status" aria-live="polite" data-tone={state.kind === 'error' ? 'error' : undefined}>
          {sending && 'Checking the kettle…'}
          {state.kind === 'error' && (
            <>
              {state.text} Your message is still here — try again, or email <a className="ulink" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </>
          )}
        </p>
      </div>
    </form>
  );
}
