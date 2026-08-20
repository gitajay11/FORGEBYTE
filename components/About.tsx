const STACK = [
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'PostgreSQL',
  'Supabase',
  'Prisma',
  'Stripe',
  'Docker',
  'Vercel',
];

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">about</div>
          <h2 className="section-title">One developer. A studio-grade process.</h2>
          <p className="section-desc">
            Forgebyte is built around a single, opinionated stack — chosen for
            speed, reliability, and low running cost — so every project starts
            from a proven foundation instead of a blank page.
          </p>
        </div>
        <div className="stack-grid">
          {STACK.map((tech) => (
            <span className="chip" key={tech}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
