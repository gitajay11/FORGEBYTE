const SERVICES = [
  {
    title: 'Web Application Development',
    copy: 'End-to-end product builds — from first commit to a production deploy your users can rely on.',
  },
  {
    title: 'API & Backend Systems',
    copy: 'Well-structured APIs, database design, and third-party integrations that hold up under real traffic.',
  },
  {
    title: 'MVP Sprints',
    copy: 'A working, testable prototype in weeks — built to validate an idea before you commit to more.',
  },
  {
    title: 'Ongoing Support',
    copy: 'Bug fixes, new features, and maintenance after launch, so the product keeps moving with your business.',
  },
];

export default function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">services</div>
          <h2 className="section-title">What I take on</h2>
          <p className="section-desc">
            Focused engagements, not open-ended retainers — you always know what
            you&apos;re getting and when it ships.
          </p>
        </div>
        <div className="services-grid">
          {SERVICES.map((service, i) => (
            <div className="service-card" key={service.title}>
              <div className="service-tag">
                service_{String(i + 1).padStart(2, '0')}
              </div>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
