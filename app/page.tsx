import IntroOverlay from '@/components/IntroOverlay';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Work from '@/components/Work';
import Process from '@/components/Process';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  CONTACT_EMAIL,
  CONTACT_PHONE_E164,
} from '@/lib/site';

// Deliberately limited to what the page actually states. No address, phone,
// founder or rating fields — inventing them is a structured-data violation
// and Google penalises markup that doesn't match visible content.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#business`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  slogan: 'We code. You grow.',
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE_E164,
  logo: `${SITE_URL}/logo/forgebyte-mark.png`,
  image: `${SITE_URL}/opengraph-image.png`,
  knowsAbout: [
    'Next.js',
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'Prisma',
    'Stripe',
    'Docker',
    'Web application development',
  ],
  makesOffer: [
    'Web Application Development',
    'API & Backend Systems',
    'MVP Sprints',
    'Ongoing Support',
  ].map((name) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IntroOverlay />
      <Header />
      <main id="top">
        <Hero />
        <About />
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
