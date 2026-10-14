import Link from 'next/link';
import { caseStudies, engagements, faq, lab, process, services, studio, team } from '@/lib/content';
import { CONTACT_EMAIL, CONTACT_PHONE_E164, SITE_URL } from '@/lib/site';
import { Reveal, SectionTitle, Words } from '@/components/motion/Text';
import HeroStage from '@/components/home/HeroStage';
import IdeaField from '@/components/home/IdeaField';
import Glyph from '@/components/home/Glyph';
import { LazyConstellation as Constellation, LazyPortrait as Portrait, LazyProcessPin as ProcessPin } from '@/components/lazy';
import ContactPanel from '@/components/contact/ContactPanel';
import ServiceMenu from '@/components/home/ServiceMenu';
import HeroPoster from '@/components/home/HeroPoster';
import BrowserFrame from '@/components/BrowserFrame';
import WorkCarousel from '@/components/home/WorkCarousel';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#studio`,
      name: studio.name,
      url: SITE_URL,
      logo: `${SITE_URL}/logo/forgebyte-f.png`,
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE_E164,
      description: 'A small studio in Chennai building websites, online stores, web apps and AI assistants for small businesses, startups and founders.',
      areaServed: 'Worldwide',
      address: { '@type': 'PostalAddress', addressLocality: studio.city, addressCountry: 'IN' },
      founder: team.map((_, i) => ({ '@id': `${SITE_URL}/#founder-${i + 1}` })),
      knowsAbout: services.map((s) => s.name),
      sameAs: [studio.github, studio.linkedin],
    },
    ...team.map((m, i) => ({
      '@type': 'Person',
      '@id': `${SITE_URL}/#founder-${i + 1}`,
      name: m.name,
      ...(m.short !== m.name.split(' ')[0] ? { alternateName: m.short } : {}),
      jobTitle: m.role,
      worksFor: { '@id': `${SITE_URL}/#studio` },
      ...(i === 0 ? { sameAs: [studio.github, studio.linkedin] } : {}),
    })),
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO ------------------------------------------------------------- */}
      <section className="hero" data-stage="pending" aria-labelledby="hero-title">
        <HeroPoster />
        <div className="hero-scene" aria-hidden="true" />
        <p className="sr-only">
          Decorative animation: a slowly turning sculpture of particles and rings that come together into one shape.
        </p>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow live hero-meta">Taking on new projects · {studio.availability}</p>
            <h1 id="hero-title" className="display-xl">
              <span className="line l1"><span>We build</span></span>
              <span className="line l2"><span className="outline">things.</span></span>
              <span className="line l3"><span>We question</span></span>
              <span className="line l4"><span>things.</span></span>
            </h1>
            <p className="hero-sub hero-meta">
              We design and build websites, online stores and apps for {studio.idealClients} — explained in plain
              English, with a fixed price up front.
            </p>
            <div className="hero-ctas hero-meta">
              <Link href="/contact" className="btn btn-primary" data-magnetic data-track="cta_click:hero">
                Start a project <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <a href="#work" className="ulink">See our work ↓</a>
            </div>
          </div>
        </div>
        <HeroStage />
      </section>

      {/* ABOUT ------------------------------------------------------------ */}
      <section className="section manifesto" id="about" aria-labelledby="about-title" tabIndex={-1}>
        <div className="container">
          <SectionTitle n="01" label="About us" />
          <div className="grid">
            <h2 id="about-title" className="display-l manifesto-head">
              <Words text="We ask questions" highlight="questions" />{' '}
              <Words text="before we build." className="dim" />
            </h2>
            <div className="manifesto-body">
              <Reveal as="p" variant="blur">
                We&apos;re <strong>{studio.name}</strong>, a small studio run by <strong>{team[0].display}</strong> and <strong>{team[1].display}</strong>. We make websites
                and online tools that people actually find easy to use.
              </Reveal>
              <Reveal as="p" variant="blur">
                Before we build anything, we make sure we understand your business, your customers and your budget.
              </Reveal>
              <Reveal as="p" variant="blur">
                Sometimes those questions change the plan. Sometimes they save you months of work. Either way, your money
                goes on the right thing.
              </Reveal>
            </div>
            <IdeaField />
          </div>
        </div>
      </section>

      {/* SERVICES --------------------------------------------------------- */}
      <section className="section" id="services" aria-labelledby="services-title" tabIndex={-1}>
        <div className="container">
          <SectionTitle n="02" label="What we do" />
          <div className="grid" style={{ marginBottom: 'var(--s-8)' }}>
            <h2 id="services-title" className="display-l" style={{ gridColumn: '1 / span 8' }}>
              <Words text="What we can build for you" highlight="build" />
            </h2>
            <Reveal as="p" variant="blur" className="body-l" style={{ gridColumn: '1 / span 6', marginTop: 'var(--s-5)' }}>
              Five things we do well — and, for each one, when we&apos;re not the right choice.
            </Reveal>
          </div>
          {/* phones: a compact menu; each service opens in a floating window */}
          <ServiceMenu
            items={services.map(({ slug, name, short, glyph, index, promise, problem, deliverables, duration, fitIf, notFitIf }) => ({
              slug, name, short, glyph, index, promise, problem, deliverables, duration, fitIf, notFitIf,
            }))}
          />
          <div className="services-layout">
            <Constellation items={services.map(({ slug, name, glyph, index }) => ({ slug, name, glyph, index }))} />
            <div className="service-list">
              {services.map((s) => (
                <article className="service" id={s.slug} key={s.slug} aria-labelledby={`${s.slug}-title`}>
                  <div className="service-head">
                    <Glyph kind={s.glyph} className="glyph" />
                    <span className="mono">{s.index}</span>
                    <h3 className="h3" id={`${s.slug}-title`}>{s.name}</h3>
                  </div>
                  <p className="promise">{s.promise}</p>
                  <p className="problem">{s.problem}</p>
                  <dl>
                    <dt className="mono">You get</dt>
                    <dd><ul>{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></dd>
                    <dt className="mono">Time</dt>
                    <dd>{s.duration}</dd>
                  </dl>
                  <div className="fit">
                    <div className="yes"><span className="mono">Right for you if</span><p>{s.fitIf}</p></div>
                    <div><span className="mono">Not right if</span><p>{s.notFitIf}</p></div>
                  </div>
                  <Link href={`/services#${s.slug}`} className="ulink">More about this →</Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORK ------------------------------------------------------------- */}
      <section className="section" id="work" aria-labelledby="work-title" tabIndex={-1}>
        <div className="container">
          <SectionTitle n="03" label="Our work" />
          <div className="work-head">
            <h2 id="work-title" className="display-l"><Words text="Websites we’ve built" highlight="Websites" /></h2>
            <Link href="/work" className="ulink">See all work →</Link>
          </div>
        </div>
        {/* one card per project — preview beside its text. Full-bleed: on
            desktop the row slides sideways as the page scrolls down */}
        <WorkCarousel
          items={caseStudies.map((cs) => ({
            slug: cs.slug,
            title: cs.title,
            image: cs.image,
            imageAlt: cs.imageAlt,
            industry: cs.industry,
            status: cs.status,
            oneLiner: cs.oneLiner,
            tags: cs.services.map((slug) => services.find((x) => x.slug === slug)?.short).filter((t): t is string => !!t),
          }))}
        />
      </section>

      {/* PROCESS ---------------------------------------------------------- */}
      <section className="section" id="process" aria-labelledby="process-title">
        <div className="container">
          <SectionTitle n="04" label="How it works" />
          <div className="process-wrap">
            <div className="process-intro">
              <h2 id="process-title" className="display-l"><Words text="How a project works" highlight="project" /></h2>
              <p>Five simple steps. After each one, you get something you can see and keep.</p>
            </div>
            <div className="process-steps">
              <span className="process-line" aria-hidden="true"><i /></span>
              <ol>
                {process.map((p, i) => (
                  <li className="step" key={p.name}>
                    <h3 className="h3"><span className="mono">0{i + 1}</span>{p.name}</h3>
                    <p>{p.what}</p>
                    <div className="receive">
                      <span className="mono">You get — <span style={{ color: 'var(--text-1)' }}>{p.receive}</span></span>
                      <span className="mono">Takes — <span style={{ color: 'var(--text-1)' }}>{p.time}</span></span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <Reveal as="p" variant="perspective" className="process-end">
            You&apos;ll always know what&apos;s being built, why, and what it costs.
          </Reveal>
        </div>
        <ProcessPin />
      </section>

      {/* HOW WE THINK ----------------------------------------------------- */}
      <section className="section" id="thinking" aria-labelledby="thinking-title">
        <div className="container">
          <SectionTitle n="05" label="How we think" />
          <div className="proof-grid">
            <div className="proof-head">
              <h2 id="thinking-title" className="display-l"><Words text="A simple request, the right questions" highlight="questions" /></h2>
              <Reveal as="p" variant="blur" className="body" style={{ marginTop: 'var(--s-5)' }}>
                We don&apos;t have client reviews to show yet, so here&apos;s how we&apos;d approach a typical request instead.
              </Reveal>
            </div>
            <div className="teardown">
              <p className="mono" style={{ marginBottom: 12 }}>A clinic asks</p>
              <p className="brief">“We need an app for appointments.”</p>
              <ol>
                <li><p><strong>Who actually books?</strong>Patients, the front desk, or both — they need different screens.</p></li>
                <li><p><strong>What goes wrong today?</strong>Double bookings, no-shows or long phone queues each need a different fix.</p></li>
                <li><p><strong>Does it need to be an app?</strong>A booking link people open from WhatsApp may get more bookings than an app to download.</p></li>
                <li><p><strong>What does the clinic need every morning?</strong>A correct list of the day&apos;s appointments, on the phone or computer they already use.</p></li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER ---------------------------------------------------------- */}
      <section className="section" id="founder" aria-labelledby="founder-title">
        <div className="container">
          <SectionTitle n="06" label="Who you’ll work with" />
          <div className="founder">
            <div className="team-portraits">
              {team.map((m) => (
                <div className="portrait" key={m.name}>
                  <Portrait initials={m.initials} />
                  <span className="mono">{m.display}<br />{m.role}</span>
                </div>
              ))}
            </div>
            <div className="founder-body">
              <h2 id="founder-title" className="display-l" style={{ marginBottom: 'var(--s-6)' }}>
                <Words text={`You’ll work with ${team[0].short} and ${team[1].short}.`} highlight={[team[0].short, team[1].short]} />
              </h2>
              <p>
                We&apos;re {team[0].display} and {team[1].display}. We run every project at {studio.name} ourselves, from the
                first call to the day it goes live. No middlemen, and no handing you over to someone you&apos;ve never met.
              </p>
              <p>
                We care about the details most people never notice: pages that load fast, checkouts that
                don&apos;t break, and messages that make sense to your customers.
              </p>
              <p className="quirk">Fill your coffee cup before booking a call with us.</p>
              <Link href="/studio" className="ulink">More about us →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* DEMOS ------------------------------------------------------------ */}
      <section className="section" id="lab" aria-labelledby="lab-title" tabIndex={-1}>
        <div className="container">
          <SectionTitle n="07" label="Demos" />
          <div className="work-head">
            <h2 id="lab-title" className="display-l"><Words text="Demos and experiments" highlight="Demos" /></h2>
            <Link href="/lab" className="ulink">See all demos →</Link>
          </div>
          <div className="lab-strip">
            {lab.map((l) => (
              <article className="lab-tile" key={l.slug}>
                <BrowserFrame src={l.image} alt={l.imageAlt} url={l.url} sizes="(max-width: 899px) 92vw, 420px" />
                <span className="mono">{l.kind}</span>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WAYS TO WORK ----------------------------------------------------- */}
      <section className="section" id="engage" aria-labelledby="engage-title">
        <div className="container">
          <SectionTitle n="08" label="Working together" />
          <h2 id="engage-title" className="display-l" style={{ marginBottom: 'var(--s-7)' }}>
            <Words text="Ways to work together" highlight="together" />
          </h2>
          <div className="engage">
            {engagements.map((e) => (
              <div className="engage-row" key={e.name}>
                <h3>{e.name}</h3>
                <p>{e.includes}</p>
                <span className="dur">{e.duration}</span>
                <span className="price">{e.price}</span>
              </div>
            ))}
          </div>
          <p className="engage-note">
            Every project gets its own written price before work starts, and payment terms are agreed up front. We work on
            India time, which overlaps with UK and European mornings and US evenings.
          </p>
        </div>
      </section>

      {/* FAQ -------------------------------------------------------------- */}
      <section className="section" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <SectionTitle n="09" label="Questions" />
          <div className="grid">
            <h2 id="faq-title" className="display-l faq-head"><Words text="Common questions" highlight="questions" /></h2>
            <div className="faq">
              {faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}<span className="plus" aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT ---------------------------------------------------------- */}
      <section className="section contact" id="contact" aria-labelledby="contact-title" tabIndex={-1}>
        <div className="container">
          <SectionTitle n="10" label="Contact" />
          <ContactPanel
            as="h2"
            id="contact-title"
            source="home"
            sub={<>Tell us what you&apos;re trying to fix or build. We reply within {studio.replyWithin}.</>}
          />
        </div>
      </section>
    </>
  );
}
