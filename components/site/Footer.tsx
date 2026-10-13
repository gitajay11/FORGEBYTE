import Link from 'next/link';
import { studio } from '@/lib/content';
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/site';
import { PrefToggles, StudioClock } from './FooterControls';
import SocialLinks from './SocialLinks';
import CopyEmail from '@/components/contact/CopyEmail';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-cta">
            <p className="h3">A small studio for teams who want the right thing built, not just something built.</p>
            <Link href="/contact" className="btn btn-primary" data-magnetic data-track="cta_click:footer">
              Start a project <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <SocialLinks />
          </div>
          <div className="footer-cols">
            <nav aria-label="Footer">
              <p className="mono">Pages</p>
              <ul>
                <li><Link href="/work">Work</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/studio">About us</Link></li>
                <li><Link href="/lab">Demos</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </nav>
            <div>
              <p className="mono">Elsewhere</p>
              <ul>
                <li><CopyEmail email={CONTACT_EMAIL} className="email-copy--sm" /></li>
                <li><a href={WHATSAPP_URL} target="_blank" rel="noopener" data-track="booking_click:footer-whatsapp">WhatsApp ↗</a></li>
                <li><a href={studio.github} target="_blank" rel="noopener">GitHub ↗</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-meta">
          <div className="group">
            <StudioClock />
            <span className="mono live">Taking on new projects · {studio.availability}</span>
          </div>
          <div className="group">
            <PrefToggles />
            <Link href="/privacy" className="mono">Privacy</Link>
            <span className="mono">© {new Date().getFullYear()} {studio.name}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
