import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { caseStudies, services } from '@/lib/content';
import { Words } from '@/components/motion/Text';
import WorkIndex from '@/components/work/WorkIndex';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Websites Forgebyte has built: Loopa, Nutriyah, Sri Cauvery Electronics and Élaré Beauty — the challenge, the questions we asked, and what we built.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return (
    <>
      <section className="page-hero container">
        <p className="mono" style={{ marginBottom: 'var(--s-5)' }}>03 — Our work</p>
        <h1 className="display-xl"><Words text="Our work" highlight="work" /></h1>
        <p className="lede section-body">
          Real client projects — live, being tested, or still being built. Each is labelled honestly. Example sites are under{' '}
          <Link href="/lab" className="ulink">Demos</Link>.
        </p>
      </section>
      <section className="container" style={{ paddingBottom: 'var(--section-y)' }} aria-label="All case studies">
        {/* useSearchParams needs a Suspense boundary in a static page */}
        <Suspense fallback={null}>
          <WorkIndex items={caseStudies} services={services.map(({ slug, name }) => ({ slug, name }))} />
        </Suspense>
      </section>
    </>
  );
}
