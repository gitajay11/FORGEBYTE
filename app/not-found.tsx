import Link from 'next/link';
import { LazyLostScene as LostScene } from '@/components/lazy';

export default function NotFound() {
  return (
    <section className="lost" aria-labelledby="lost-h">
      <LostScene />
      <div className="container">
        <p className="mono">Error 404 · page not found</p>
        <h1 id="lost-h" className="display-l" style={{ maxWidth: '14ch' }}>
          This page asked too many questions and wandered off.
        </h1>
        <p className="section-body">The link may be old, or mistyped. Scatter the particles while you decide where to go next.</p>
        <div className="actions">
          <Link href="/" className="btn btn-primary" data-magnetic>Back home <span className="arrow" aria-hidden="true">→</span></Link>
          <Link href="/contact" className="ulink" data-track="cta_click:404">Start a project instead</Link>
        </div>
      </div>
    </section>
  );
}
