import Image from 'next/image';
import loopaShot from '@/public/work/loopa.png';
import nutriyahShot from '@/public/work/nutriyah.png';

const WORK = [
  {
    slug: 'loopa.nutriyah.com/',
    title: 'Loopa — Sparkling Drinks Brand Site',
    copy: 'Product site for a natural sparkling drink range. Flavour pages, an ingredient-transparency section, and a bulk-order form that turns distributor enquiries into quote requests.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Formspree'],
    href: 'https://loopa.nutriyah.com/',
    image: loopaShot,
    alt: 'Loopa homepage: a green sparkling drink bottle beside the headline "Be in the Moment"',
  },
  {
    slug: 'nutriyah.com/',
    title: 'Nutriyah — Food & Beverage Company Site',
    copy: 'Corporate site for the parent F&B business: mission, capabilities, and product portfolio, built to open conversations with distributors and trade partners.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    href: 'https://www.nutriyah.com/',
    image: nutriyahShot,
    alt: 'Nutriyah homepage with the headline "Developing the next generation of food products"',
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
            Live client projects, shipped and running in production.
          </p>
        </div>
        <div className="work-grid">
          {WORK.map((item) => (
            <article className="work-card" key={item.slug}>
              <div className="work-thumb">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  placeholder="blur"
                />
              </div>
              <div className="work-body">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <div className="work-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <a
                  className="work-status"
                  href={item.href}
                  target="_blank"
                  rel="noopener"
                >
                  Visit site ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
