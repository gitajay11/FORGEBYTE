'use client';

import { useRef, useState } from 'react';

/** Older browsers (and non-secure contexts) have no async clipboard API. */
function legacyCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

/** The address as a mailto: link (opens the visitor's mail app), plus a copy
 *  button that swaps to a tick with a "Copied!" tooltip for 1.5s. */
export default function CopyEmail({ email, className = '' }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      ok = legacyCopy(email);
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className={`email-copy ${className}`.trim()}>
      {/* in a narrow column it wraps before the @, never mid-word */}
      <a className="email-link ulink" href={`mailto:${email}`}>{email.split('@')[0]}<wbr />@{email.split('@')[1]}</a>
      <button type="button" className="copy-btn" aria-label="Copy email address" data-copied={copied} onClick={copy}>
        <svg className="i-copy" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        <svg className="i-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        <span className="copy-tip" aria-hidden="true">Copied!</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{copied ? 'Email address copied' : ''}</span>
    </span>
  );
}
