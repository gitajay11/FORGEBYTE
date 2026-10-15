import type { ReactNode } from 'react';
import { studio } from '@/lib/content';
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164, TELEGRAM_BOT_URL, WHATSAPP_URL } from '@/lib/site';
import { SectionLead, Words } from '@/components/motion/Text';
import ContactForm from './ContactForm';
import CopyEmail from './CopyEmail';
import SocialLinks from '@/components/site/SocialLinks';

// Contact block shared by the home page's contact section and /contact.
// Desktop: intro + ways to reach us on the left, the form in a glass card on
// the right. Phones and tablets: one column (globals.css, .contact-layout).

const ICONS = {
  mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>),
  phone: (<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />),
  telegram: (<path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />),
  share: (<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" /></>),
};

function Method({ icon, label, children }: { icon: keyof typeof ICONS; label: string; children: ReactNode }) {
  return (
    <li className="contact-method">
      <span className="contact-method-icon" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[icon]}</svg></span>
      <div className="contact-method-body">
        <span className="mono">{label}</span>
        {children}
      </div>
    </li>
  );
}

export default function ContactPanel({
  as: Heading,
  id,
  source,
  sub,
  note,
}: {
  as: 'h1' | 'h2';
  id: string;
  source: string;
  sub: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="contact-layout">
      <div className="contact-info">
        <Heading id={id} className="display-l contact-head">
          <Words text="Got a problem worth thinking about?" highlight="thinking" />
        </Heading>
        <SectionLead>{sub}</SectionLead>
        <ul className="contact-methods" aria-label="Other ways to reach us">
          <Method icon="mail" label="Email us">
            <CopyEmail email={CONTACT_EMAIL} />
          </Method>
          <Method icon="phone" label="WhatsApp / phone">
            <a className="ulink" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-track={`booking_click:${source}-whatsapp`}>
              Message us on WhatsApp ↗
            </a>
            <a className="ulink contact-phone" href={`tel:${CONTACT_PHONE_E164}`}>{CONTACT_PHONE_DISPLAY}</a>
          </Method>
          <Method icon="telegram" label="Telegram">
            <a className="ulink" href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" data-track={`booking_click:${source}-telegram`}>
              Ask our bot on Telegram ↗
            </a>
            <span className="contact-method-note">Answers about our services, work and prices, any time.</span>
          </Method>
          <Method icon="share" label="Elsewhere">
            <SocialLinks />
            <a className="ulink" href={studio.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </Method>
        </ul>
        {note}
      </div>
      <div className="contact-card">
        <ContactForm source={source} />
      </div>
    </div>
  );
}
