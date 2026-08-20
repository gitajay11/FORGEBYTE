import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Self-hosted at build time by next/font — replaces the render-blocking
// <link> to fonts.googleapis.com the static page used.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Forgebyte — Freelance Web Application Development',
  description:
    'Forgebyte builds fast, scalable web applications for founders who need to ship. Full-stack development, MVP sprints, and ongoing support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      {/* intro-lock is removed by IntroOverlay once the intro finishes */}
      <body className="intro-lock">{children}</body>
    </html>
  );
}
