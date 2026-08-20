// TODO: placeholder case studies — swap for real client work (problem →
// approach → result) and delete the .work-note banner below once shipped.
const WORK = [
  {
    slug: 'saas-dashboard/',
    title: 'SaaS Analytics Dashboard',
    copy: 'Example of a data-heavy internal tool: auth, role-based access, and live charts.',
    tags: ['Next.js', 'Postgres', 'Recharts'],
  },
  {
    slug: 'marketplace-mvp/',
    title: 'Two-Sided Marketplace MVP',
    copy: 'Example of a launch-ready MVP: listings, checkout, and messaging between users.',
    tags: ['Next.js', 'Stripe', 'Supabase'],
  },
  {
    slug: 'internal-tooling/',
    title: 'Internal Ops Tooling',
    copy: 'Example of workflow automation: cutting a manual process down to a few clicks.',
    tags: ['Node.js', 'Prisma', 'Docker'],
  },
];

export default function Work() {
  return (
    <section id="work">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">work</div>
          <h2 className="section-title">Recent work</h2>
          <p className="section-desc">
            Forgebyte is newly launched — real case studies are on the way. Below
            is the kind of work I take on, so you know what to expect.
          </p>
        </div>
        <div className="work-note">
          ⚠ Placeholder content — swap these three cards for real case studies
          (problem → approach → result) once you&apos;ve shipped your first
          client projects.
        </div>
        <div className="work-grid">
          {WORK.map((item) => (
            <article className="work-card" key={item.slug}>
              <div className="work-thumb">{item.slug}</div>
              <div className="work-body">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <div className="work-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="work-status">● Case study coming soon</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
