'use client';

import { useEffect, useRef, useState } from 'react';
import { services, studio } from '@/lib/content';
import { CONTACT_EMAIL } from '@/lib/site';
import { track } from '@/lib/track';
import Dropdown from './Dropdown';

export const BUDGETS = ['Not sure yet', 'Under ₹1 lakh', '₹1–3 lakh', '₹3–8 lakh', '₹8 lakh +'];
export const TIMELINES = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'];
/** Last choice in "What you need" — sent like any other option. */
export const NOT_SURE = 'Not sure yet';
/** Other components ask the form to tick a "What you need" option with
 *  `window.dispatchEvent(new CustomEvent(PRESELECT_NEED, { detail: 'Online store' }))`. */
export const PRESELECT_NEED = 'fb-preselect-need';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>;
type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; text: string }
  | { kind: 'done'; reference: string; confirmationSent: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,24}$/;

function validate(data: FormData): Errors {
  const e: Errors = {};
  if (!String(data.get('name') ?? '').trim()) e.name = 'Tell us what to call you.';
  const email = String(data.get('email') ?? '').trim();
  if (!email) e.email = 'We need an email to reply to.';
  else if (!EMAIL_RE.test(email)) e.email = 'That email address does not look right.';
  const phone = String(data.get('phone') ?? '').trim();
  if (phone && (!PHONE_RE.test(phone) || (phone.match(/\d/g) ?? []).length < 7)) e.phone = 'That phone number does not look right.';
  if (String(data.get('message') ?? '').trim().length < 10) e.message = 'A sentence or two about the problem, please.';
  return e;
}

export default function ContactForm({ source = 'contact' }: { source?: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [errors, setErrors] = useState<Errors>({});
  const started = useRef(false);
  const submitting = useRef(false); // blocks double submits (fast double-click, Enter twice)
  const formRef = useRef<HTMLFormElement>(null);

  // "Discuss this project" in the phone services window: tick that service
  useEffect(() => {
    const onNeed = (e: Event) => {
      const need = (e as CustomEvent<string>).detail;
      const box = [...(formRef.current?.querySelectorAll<HTMLInputElement>('input[name="needs"]') ?? [])].find((b) => b.value === need);
      if (box) box.checked = true;
    };
    window.addEventListener(PRESELECT_NEED, onNeed);
    return () => window.removeEventListener(PRESELECT_NEED, onNeed);
  }, []);

  // Inline validation: check a field when the visitor leaves it (empty fields
  // they only tabbed through are left alone until they submit)
  const onBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    const field = e.target as unknown as HTMLInputElement;
    const name = field.name as keyof Errors;
    if (!(['name', 'email', 'phone', 'message'] as string[]).includes(name)) return;
    if (!field.value.trim() && !errors[name]) return;
    const msg = validate(new FormData(e.currentTarget))[name];
    if (msg !== errors[name]) setErrors((prev) => ({ ...prev, [name]: msg }));
  };

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
    if (submitting.current) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);
    const firstBad = (['name', 'email', 'phone', 'message'] as const).find((k) => found[k]);
    if (firstBad) {
      form.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    submitting.current = true;
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not send your message right now.');
      track('form_submit', { source });
      // the form unmounts here, so "Send another message" starts from a clean form
      setState({ kind: 'done', reference: body.reference ?? '', confirmationSent: body.confirmationSent !== false });
    } catch (err) {
      // keep everything the visitor typed; offer a retry and the direct route
      setState({ kind: 'error', text: (err as Error).message });
    } finally {
      submitting.current = false;
    }
  }

  if (state.kind === 'done') {
    return (
      <div className="form-done" role="status" aria-live="polite">
        <p className="mono" style={{ marginBottom: 12 }}>{state.reference ? `Reference ${state.reference}` : 'Sent'}</p>
        <h3 className="h3">Message sent! Check your inbox for a confirmation.</h3>
        <p>
          {state.confirmationSent
            ? <>We&apos;ve emailed you a copy of your message. We&apos;ll reply within {studio.replyWithin}.</>
            : <>Your message reached us, but the confirmation email didn&apos;t go through — we&apos;ll still reply within {studio.replyWithin}.</>}
        </p>
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
    <form ref={formRef} className="form" onSubmit={onSubmit} onInput={onInput} onBlur={onBlur} noValidate aria-busy={sending}>
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
      <div className="field">
        <label htmlFor="cf-phone">Phone / WhatsApp <span className="opt">(optional)</span></label>
        <input id="cf-phone" name="phone" type="tel" className="input" autoComplete="tel" inputMode="tel" {...err('phone')} />
        <p className="field-error" id="phone-error" aria-live="polite">{errors.phone}</p>
      </div>
      <div className="field">
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
        <label htmlFor="cf-budget" id="cf-budget-label">Budget <span className="opt">(optional)</span></label>
        <Dropdown id="cf-budget" name="budget" labelId="cf-budget-label" placeholder="Choose a range" options={BUDGETS} />
      </div>
      <div className="field">
        <label htmlFor="cf-timeline" id="cf-timeline-label">Timeline <span className="opt">(optional)</span></label>
        <Dropdown id="cf-timeline" name="timeline" labelId="cf-timeline-label" placeholder="Choose one" options={TIMELINES} />
      </div>
      <div className="field full">
        <label htmlFor="cf-message">What&apos;s the problem?<span className="req" aria-hidden="true">*</span></label>
        <textarea id="cf-message" name="message" className="input" placeholder="What are you trying to fix or build, and for whom?" required aria-required="true" {...err('message')} />
        <p className="field-error" id="message-error" aria-live="polite">{errors.message}</p>
      </div>

      {/* which form this came from, for the studio's notification */}
      <input type="hidden" name="source" value={source} />
      {/* spam trap: real visitors never see or fill this */}
      <input type="text" name="_gotcha" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending} data-magnetic>
          {sending ? <><span className="spinner" aria-hidden="true" /> Sending…</> : <>Send it <span className="arrow" aria-hidden="true">→</span></>}
        </button>
        <ul className="trust" aria-label="What to expect">
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>Reply within 24–48 hrs</li>
          <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>No spam</li>
        </ul>
        <p className="form-status" role="status" aria-live="polite" data-tone={state.kind === 'error' ? 'error' : undefined}>
          {sending && 'Checking the kettle…'}
          {state.kind === 'error' && (
            <>
              {state.text} Your message is still here.{' '}
              <button type="button" className="ulink form-retry" onClick={() => formRef.current?.requestSubmit()}>Try again</button>
              {' '}or email <a className="ulink" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </>
          )}
        </p>
      </div>
    </form>
  );
}
