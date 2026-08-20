const STEPS = [
  {
    title: 'Discover',
    copy: 'A short call to define the problem, scope, and success criteria before any code gets written.',
  },
  {
    title: 'Design & Build',
    copy: 'Iterative development with regular check-ins, so you see progress every week, not just at the end.',
  },
  {
    title: 'Test & Ship',
    copy: 'QA passes, performance checks, and a deploy to production once everything holds up.',
  },
  {
    title: 'Support',
    copy: 'A window of post-launch support to fix what comes up and hand off a stable, documented product.',
  },
];

export default function Process() {
  return (
    <section id="process">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">process</div>
          <h2 className="section-title">How a project runs</h2>
          <p className="section-desc">
            Four stages, start to finish. No surprises in scope or timeline.
          </p>
        </div>
        <div className="process-list">
          {STEPS.map((step, i) => (
            <div className="process-item" key={step.title}>
              <div className="process-num">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
