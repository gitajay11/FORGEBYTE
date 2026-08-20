import Terminal from './Terminal';

export default function Hero() {
  return (
    <section className="hero" style={{ borderTop: 'none' }}>
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <div className="badge">
              <span className="dot" /> Available for new projects — Q4 2026
            </div>
            <h1 className="hero-title">
              Code that ships.
              <br />
              <span className="accent-text">Products that scale.</span>
            </h1>
            <p className="hero-sub">
              Forgebyte is a freelance web application development studio. I
              design, build, and ship full-stack products for founders and teams
              who need to move fast without cutting corners.
            </p>
            <div className="btn-row">
              <a href="#contact" className="btn btn-primary">
                Start a project →
              </a>
              <a href="#work" className="btn btn-ghost">
                See how I work
              </a>
            </div>
          </div>

          <Terminal />
        </div>
      </div>
    </section>
  );
}
