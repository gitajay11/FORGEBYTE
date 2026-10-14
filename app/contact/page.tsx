import type { Metadata } from 'next';
import { studio } from '@/lib/content';
import { SectionTitle } from '@/components/motion/Text';
import ContactPanel from '@/components/contact/ContactPanel';

export const metadata: Metadata = {
  title: 'Start a project',
  description: `Tell Forgebyte what you are trying to fix or build. We reply within ${studio.replyWithin}, with next steps or a few questions.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <section className="contact" aria-labelledby="contact-h" style={{ paddingBlock: 'calc(var(--nav-h) + var(--section-y)) var(--section-y)' }}>
      <div className="container">
        <SectionTitle n="10" label="Contact" />
        <ContactPanel
          as="h1"
          id="contact-h"
          source="contact-page"
          sub={<>A few quick questions — only three are required. We reply within {studio.replyWithin}, and we&apos;re on {studio.tzLabel}.</>}
          note={<p className="coffee">Fill your coffee cup before booking a call with us.</p>}
        />
      </div>
    </section>
  );
}
