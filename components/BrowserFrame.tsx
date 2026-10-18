import Image from 'next/image';
import VisitSite from '@/components/work/VisitSite';

/**
 * A screenshot inside a simple browser window, so it reads at a glance as
 * "this is a website". The address bar shows the real domain.
 */
export default function BrowserFrame({
  src,
  alt,
  url,
  sizes,
  priority = false,
  className = '',
  visitTitle,
}: {
  src: string;
  alt: string;
  url?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** set to the site's name to put a "Visit site ↗" pill on the preview */
  visitTitle?: string;
}) {
  const domain = url && !url.startsWith('#') ? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : 'forgebyte.online';
  return (
    <figure className={`browser ${className}`.trim()}>
      <div className="browser-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <span className="address">{domain}</span>
      </div>
      <div className="browser-view">
        <Image src={src} alt={alt} width={1000} height={625} sizes={sizes} priority={priority} />
        {visitTitle && url?.startsWith('https://') && <VisitSite href={url} title={visitTitle} className="visit-pill" />}
      </div>
    </figure>
  );
}
