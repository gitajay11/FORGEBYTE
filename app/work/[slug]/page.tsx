import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { caseStudies, services } from '@/lib/content';
import { SITE_URL } from '@/lib/site';
import { Reveal, Words } from '@/components/motion/Text';
import BrowserFrame from '@/components/BrowserFrame';
import { Approach, DepthTracker } from '@/components/work/Approach';

// Only the case studies we know about; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  return {
    title: `${cs.title} — our work`,
    description: `${cs.oneLiner} ${cs.problem}`.slice(0, 158),
    alternates: { canonical: `/work/${cs.slug}` },
    openGraph: { title: `${cs.title} — built by Forgebyte`, description: cs.oneLiner, url: `${SITE_URL}/work/${cs.slug}` },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = caseStudies.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const cs = caseStudies[i];
  const next = caseStudies[(i + 1) % caseStudies.length];
  const serviceNames = cs.services.map((s) => services.find((x) => x.slug === s)?.name).filter(Boolean);
  const domain = cs.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: cs.title,
    about: cs.oneLiner,
    url: `${SITE_URL}/work/${cs.slug}`,
    creator: { '@type': 'Organization', name: 'Forgebyte', url: SITE_URL },
    image: `${SITE_URL}${cs.image}`,
  };

  const meta: [string, string][] = [
    ['Client', cs.client],
    ['Industry', cs.industry],
    ['Year', cs.year],
    ['What we did', cs.role],
    ['Status', cs.status],
  ];

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DepthTracker slug={cs.slug} />

      {/* Hero: the real site, front and centre */}
      <header className="cs-hero">
        <div className="container">
          <Link href="/work" className="ulink mono back">← All work</Link>
          <div className="cs-hero-grid">
            <div>
              <h1 className="display-xl"><Words text={cs.title} /></h1>
              <p className="one section-body">{cs.oneLiner}</p>
              <a href={cs.url} target="_blank" rel="noopener" className="btn btn-ghost">
                Visit {domain} <span className="arrow" aria-hidden="true">↗</span>
              </a>
            </div>
            <Reveal variant="scale">
              <BrowserFrame src={cs.image} alt={cs.imageAlt} url={cs.url} sizes="(max-width: 1023px) 92vw, 760px" priority />
            </Reveal>
          </div>
          <dl className="metabar">
            {meta.map(([k, v]) => (
              <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container">
        <section className="cs-block" aria-labelledby="problem">
          <h2 className="mono" id="problem">01 — The challenge</h2>
          <div className="content section-body"><Reveal as="p" variant="perspective" className="lead">{cs.problem}</Reveal></div>
        </section>

        <section className="cs-block" aria-labelledby="questions">
          <h2 className="mono" id="questions">02 — The questions we asked</h2>
          <div className="content section-body">
            <ol className="questions list-prose">
              {cs.questions.map((q, n) => (
                <Reveal as="li" variant="clip-up" key={q}><span className="mono">Q{n + 1}</span><span>{q}</span></Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="cs-block" aria-labelledby="approach">
          <h2 className="mono" id="approach">03 — What we did</h2>
          <div className="content section-body"><Approach items={cs.approach} /></div>
        </section>

        <section className="cs-block" aria-labelledby="build">
          <h2 className="mono" id="build">04 — What we built</h2>
          <div className="content section-body">
            <ul className="build-list">{cs.build.map((b) => <li key={b}>{b}</li>)}</ul>
            <p className="mono" style={{ marginTop: 'var(--s-5)' }}>Built with — {cs.stack.join(' · ')}</p>
          </div>
        </section>

        <section className="cs-block" aria-labelledby="outcome">
          <h2 className="mono" id="outcome">05 — The result</h2>
          <div className="content section-body">
            <Reveal as="p" variant="blur" className="lead">{cs.outcome}</Reveal>
            <p className="muted" style={{ marginTop: 'var(--s-4)', fontSize: '0.95rem' }}>
              We only share numbers we can prove. None have been measured for this project yet.
            </p>
            <p style={{ marginTop: 'var(--s-6)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <a href={cs.url} target="_blank" rel="noopener" className="ulink">Visit {domain} ↗</a>
              <Link href="/contact" className="ulink" data-track={`cta_click:case-${cs.slug}`}>Start a project like this →</Link>
            </p>
            {serviceNames.length > 0 && <p className="mono" style={{ marginTop: 'var(--s-5)' }}>Services — {serviceNames.join(' · ')}</p>}
          </div>
        </section>
        {/* Client quote: shown only once a real, approved testimonial exists. */}
      </div>

      <Link href={`/work/${next.slug}`} className="next-cs" data-cursor="view">
        <div className="container next-cs-grid">
          <div>
            <p className="mono" style={{ marginBottom: 'var(--s-4)' }}>Next project</p>
            <p className="display-l">{next.title} →</p>
            <p className="body section-body" style={{ marginTop: 'var(--s-4)' }}>{next.oneLiner}</p>
          </div>
          <BrowserFrame src={next.image} alt="" url={next.url} sizes="(max-width: 1023px) 92vw, 560px" />
        </div>
      </Link>
    </article>
  );
}
