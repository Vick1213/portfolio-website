import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// TODO: update BASE_URL to the real production domain before deploying
const BASE_URL = 'https://saatvik.dev';

const TITLE = 'Saatvik Choudhary — Chip Architect & Full-Stack Engineer';
const DESCRIPTION =
  'Chip architect & full-stack engineer — from custom AI-accelerator ASICs (Verilog/RTL) to production web, mobile, and data systems.';

export const viewport: Viewport = {
  themeColor: '#05060a',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'Saatvik Choudhary',
    'chip architect',
    'ASIC design',
    'Verilog',
    'RTL',
    'AI accelerator',
    'full-stack engineer',
    'Next.js',
    'React Three Fiber',
    'portfolio',
  ],
  authors: [{ name: 'Saatvik Choudhary', url: BASE_URL }],
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Saatvik Choudhary',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
