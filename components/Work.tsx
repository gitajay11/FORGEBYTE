import Image from 'next/image';
import loopaShot from '@/public/work/loopa.png';
import nutriyahShot from '@/public/work/nutriyah.png';
import sriCauveryShot from '@/public/work/sri-cauvery-electronics.png';
import emberOakShot from '@/public/work/ember-and-oak.jpg';
import careDentalShot from '@/public/work/care-dental.jpg';
import elareShot from '@/public/work/elare-beauty.jpg';

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
  {
    slug: 'sricauveryelectronics.shop/',
    title: 'Sri Cauvery — Electronics Store',
    status: 'Under testing',
    copy: 'Bilingual Tamil/English storefront for a Madurai electronics and return-gifts retailer: product catalogue, cart and checkout with cash on delivery, installable as a PWA, plus an admin app for orders and stock.',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'PWA'],
    href: 'https://www.sricauveryelectronics.shop/',
    image: sriCauveryShot,
    alt: 'Sri Cauvery Electronics homepage with the headline "Everyday electronics. Unforgettable gifts."',
  },
  {
    slug: 'cafecaffeine.vercel.app/',
    title: 'Ember & Oak — Coffee House Site',
    status: 'Demo',
    copy: 'Concept site for a specialty coffee house: cinematic video hero, scroll-driven story and menu sections, a gallery, and a table-reservation flow. Built to show what a hospitality brand site can feel like.',
    tags: ['React', 'Vite', 'Tailwind', 'Framer Motion'],
    href: 'https://cafecaffeine.vercel.app/',
    image: emberOakShot,
    alt: 'Ember & Oak homepage: espresso pouring behind the headline "Coffee, crafted slowly."',
  },
  {
    slug: 'cleardental.vercel.app/',
    title: 'Care Dental — Clinic Site',
    status: 'Demo',
    copy: 'Concept site for a dental clinic: services, doctors, a smile gallery, a five-step patient journey and an FAQ, with an appointment form that emails the clinic through a small Express backend.',
    tags: ['React', 'Vite', 'Tailwind', 'Express', 'Nodemailer'],
    href: 'https://cleardental.vercel.app/',
    image: careDentalShot,
    alt: 'Care Dental homepage: a smiling patient beside the headline "Dental Care"',
  },
  {
    slug: 'elarebeauty.store/',
    title: 'Élaré Beauty — Makeup E-commerce',
    status: 'Under forging',
    copy: 'Full-stack storefront for a premium makeup brand: shade-led product pages, cart and checkout with Razorpay and cash on delivery, order-confirmation email, plus an admin back-office. Installable as a PWA.',
    tags: ['React', 'Hono', 'Postgres', 'Razorpay', 'PWA'],
    href: 'https://www.elarebeauty.store/',
    image: elareShot,
    alt: 'Élaré Beauty homepage: a model beside the headline "Beauty, defined by you."',
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
            Client projects and concept builds, running on the open web.
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
                <div className="work-foot">
                  <a
                    className="work-status"
                    href={item.href}
                    target="_blank"
                    rel="noopener"
                  >
                    Visit site ↗
                  </a>
                  {item.status && (
                    <span className="work-badge">{item.status}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
