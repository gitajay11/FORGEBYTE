import type { Metadata } from 'next';
import { CONTACT_EMAIL } from '@/lib/site';
import { privacy } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What Forgebyte collects when you use this site, why, and how to have it removed.',
  alternates: { canonical: '/privacy' },
};

// Plain-language draft. Flagged in docs/AUDIT.md for the owner to review.
// The words live in lib/content.ts (privacy), which the Telegram bot also reads.
export default function PrivacyPage() {
  return (
    <section className="page-hero container">
      <p className="mono" style={{ marginBottom: 'var(--s-5)' }}>Privacy · last updated {privacy.updated}</p>
      <h1 className="display-l" style={{ marginBottom: 'var(--s-7)' }}>Privacy, in plain words</h1>
      <div className="prose section-body">
        <h2>What we collect</h2>
        <ul className="list-prose">
          {privacy.collect.map((c) => (
            <li key={c.label}><strong>{c.label}:</strong> {c.text}</li>
          ))}
        </ul>
        <h2>What we do not do</h2>
        <p>{privacy.notDo}</p>
        <h2>Where it goes</h2>
        <p>{privacy.where}</p>
        <h2>Removal</h2>
        <p>Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> {privacy.removal}</p>
      </div>
    </section>
  );
}
