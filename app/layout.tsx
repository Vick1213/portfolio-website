import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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

const headline =
  'Chip architect & full-stack engineer — from custom AI-accelerator ASICs (Verilog/RTL) to production web, mobile, and data systems.';

export const metadata: Metadata = {
  title: 'Saatvik Choudhary — Chip Architect & Full-Stack Engineer',
  description: headline,
  openGraph: {
    title: 'Saatvik Choudhary — Chip Architect & Full-Stack Engineer',
    description: headline,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
