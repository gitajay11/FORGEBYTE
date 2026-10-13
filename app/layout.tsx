import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import SiteEffects from '@/components/site/SiteEffects';
import { LazyChat as ChatWidget, LazyCursor as Cursor } from '@/components/lazy';
import IntroOverlay from '@/components/IntroOverlay';
import ScrollProgress from '@/components/site/ScrollProgress';
import './globals.css';

// Self-hosted and subset by next/font; only the weights actually used.
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Browser tab reads just "FORGEBYTE" on every page: the template has no %s,
  // so pages' own titles don't show. Share previews keep SITE_TITLE (below).
  title: {
    default: 'FORGEBYTE',
    template: 'FORGEBYTE',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F7FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0C10' },
  ],
  colorScheme: 'dark light',
};

// Runs before first paint: marks JS as available (CSS only hides reveal
// targets when it is) and applies the stored motion / cursor toggles.
const PREFS_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var m=localStorage.getItem('fb-motion');if(m)d.dataset.motion=m;var c=localStorage.getItem('fb-cursor');d.dataset.cursor=c||'custom';var t=localStorage.getItem('fb-theme');if(t)d.dataset.theme=t;}catch(e){d.dataset.cursor='custom';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
        
      </head>
      {/* intro-lock is removed by IntroOverlay once the ABI intro finishes.
          suppressHydrationWarning: browser extensions write inline styles on
          <body> (e.g. margin-top:0px) before React hydrates. */}
      <body className="intro-lock" suppressHydrationWarning>
        <IntroOverlay />
        <ScrollProgress />
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <ChatWidget />
        <Cursor />
        <SiteEffects />
        <Analytics />
      </body>
    </html>
  );
}
