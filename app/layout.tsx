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

const BASE_URL = 'https://saatvik-choudhary.com';

const TITLE = 'Saatvik Choudhary, Chip Architect & Full-Stack Engineer';
const DESCRIPTION =
  'Chip architect & full-stack engineer, from custom AI-accelerator ASICs (Verilog/RTL) to production web, mobile, and data systems.';

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

// Person structured data, the primary signal that ties this site to the
// real-world "Saatvik Choudhary" entity. The `sameAs` links let Google
// reconcile this site with the same person behind the LinkedIn/GitHub
// profiles, which is what powers a knowledge/people panel.
const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Saatvik Choudhary',
  url: BASE_URL,
  image: `${BASE_URL}/images/saatvik-choudhary.jpg`,
  jobTitle: 'Chip Architect & Full-Stack Engineer',
  description: DESCRIPTION,
  email: 'mailto:saatvik1213@gmail.com',
  knowsAbout: [
    'ASIC design',
    'Verilog',
    'RTL design',
    'AI accelerators',
    'Full-stack web development',
    'Next.js',
    'React',
    'TypeScript',
  ],
  sameAs: [
    'https://www.linkedin.com/in/saatvik-choudhary/',
    'https://github.com/Vick1213',
    'https://github.com/saatvik1213',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Server-rendered static object, not user input, safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
