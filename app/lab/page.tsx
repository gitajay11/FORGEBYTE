import type { Metadata } from 'next';
import { lab } from '@/lib/content';
import { Words } from '@/components/motion/Text';
import BrowserFrame from '@/components/BrowserFrame';
import OpenChat from '@/components/lab/OpenChat';

export const metadata: Metadata = {
  title: 'Demos',
  description: 'Demo websites and experiments from Forgebyte — clearly labelled, and kept separate from client work.',
  alternates: { canonical: '/lab' },
};

export default function LabPage() {
  return (
    <>
      <section className="page-hero container">
        <p className="mono" style={{ marginBottom: 'var(--s-5)' }}>07 — Demos</p>
        <h1 className="display-xl"><Words text="Demos" highlight="Demos" /></h1>
        <p className="lede section-body">
          Example websites and experiments. None of these are client projects — they show what we can build before
          you commit to anything.
        </p>
      </section>
      <section className="container" style={{ paddingBottom: 'var(--section-y)' }} aria-label="Demos and experiments">
        {lab.map((l) => (
          <article className="cs-block" key={l.slug} aria-labelledby={`lab-${l.slug}`}>
            <p className="mono">{l.kind}</p>
            <div className="content section-body">
              <h2 className="display-l" id={`lab-${l.slug}`} style={{ marginBottom: 'var(--s-5)' }}>{l.title}</h2>
              <p className="body" style={{ marginBottom: 'var(--s-6)' }}>{l.body}</p>
              <div style={{ marginBottom: 'var(--s-5)' }}>
                <BrowserFrame src={l.image} alt={l.imageAlt} url={l.url} sizes="(max-width: 1023px) 92vw, 760px" />
              </div>
              {l.url.startsWith('#') ? (
                <OpenChat>Try it — open the chat →</OpenChat>
              ) : (
                <a href={l.url} target="_blank" rel="noopener" className="ulink">Open the demo ↗</a>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
