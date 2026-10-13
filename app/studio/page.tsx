import type { Metadata } from 'next';
import Link from 'next/link';
import { studio, team } from '@/lib/content';
import { Reveal, Words } from '@/components/motion/Text';
import { LazyPortrait as Portrait } from '@/components/lazy';

export const metadata: Metadata = {
  title: 'About us',
  description: `${studio.name} is a small studio in ${studio.city}, run by ${team[0].name} and ${team[1].display}. How we work and what you can expect.`,
  alternates: { canonical: '/studio' },
};

const PRINCIPLES = [
  { t: 'We ask “why” first.', b: 'The cheapest feature is the one we help you realise you don’t need.' },
  { t: 'Simple beats clever.', b: 'A site that just works, every day, is worth more than a flashy one that breaks.' },
  { t: 'Bad news early.', b: 'If a date or budget won’t work, you hear it in week one — not week six.' },
  { t: 'You own everything.', b: 'Your site, your accounts and your files are yours. No lock-in.' },
  { t: 'One person who knows it all.', b: 'You deal with the person building it, not a chain of hand-offs.' },
];

const WORKING_WITH_US = [
  { t: 'Plain English', b: 'No jargon. If we use a technical word, we explain it.' },
  { t: 'A fixed price', b: 'You get a written price before work starts. It only changes if what you want changes.' },
  { t: 'Weekly updates', b: 'A link to see progress every week, so nothing is a surprise at the end.' },
  { t: 'Help after launch', b: 'We stay around after your site goes live to fix anything that comes up.' },
];

export default function StudioPage() {
  return (
    <>
      <section className="page-hero container">
        <p className="mono" style={{ marginBottom: 'var(--s-5)' }}>01 — About us</p>
        <h1 className="display-xl"><Words text="Problem solvers first." /></h1>
        <p className="lede">You&apos;re not paying for hours of typing. You&apos;re paying for good decisions about what to build.</p>
      </section>

      <section className="section container" aria-labelledby="founder-h">
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
            <h2 id="founder-h" className="display-l" style={{ marginBottom: 'var(--s-6)' }}>The founders</h2>
            <Reveal as="p" variant="blur">
              {studio.name} is run by its founder, {team[0].name}, and co-founder {team[1].display}. They run every
              project personally, from the first call to the day it goes live — no middlemen.
            </Reveal>
            <p>
              They care about the details most people never notice: pages that load fast on any phone, checkouts
              that don&apos;t break, and messages that make sense to your customers.
            </p>
            <p>
              Based in {studio.city}, working with clients anywhere. Taking on new projects from {studio.availability}.
            </p>
            <p className="quirk">Bring the hard question first. It saves everyone a meeting.</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <a className="ulink" href={studio.linkedin} target="_blank" rel="noopener">{team[0].short} on LinkedIn ↗</a>
              <a className="ulink" href={studio.github} target="_blank" rel="noopener">{team[0].short} on GitHub ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="principles-h">
        <div className="grid" style={{ rowGap: 'var(--s-7)' }}>
          <h2 id="principles-h" className="display-l" style={{ gridColumn: '1 / span 4' }}>What we believe</h2>
          <ol className="principles">
            {PRINCIPLES.map((p, i) => (
              <li key={p.t}>
                <span className="mono">0{i + 1}</span>
                <div><h3>{p.t}</h3><p>{p.b}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container" aria-labelledby="working-h">
        <h2 id="working-h" className="display-l" style={{ marginBottom: 'var(--s-7)' }}>What working with us is like</h2>
        <div className="promises">
          {WORKING_WITH_US.map((w) => (
            <div key={w.t}>
              <h3>{w.t}</h3>
              <p>{w.b}</p>
            </div>
          ))}
        </div>
        <p className="body" style={{ marginTop: 'var(--s-7)' }}>
          Got something in mind? <Link href="/contact" className="ulink" data-track="cta_click:studio">Tell us about it →</Link>
        </p>
      </section>
    </>
  );
}
