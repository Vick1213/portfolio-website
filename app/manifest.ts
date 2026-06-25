import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Saatvik Choudhary: Chip Architect & Full-Stack Engineer',
    short_name: 'Saatvik.dev',
    description:
      'Chip architect & full-stack engineer, from custom AI-accelerator ASICs (Verilog/RTL) to production web, mobile, and data systems.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05060a',
    theme_color: '#05060a',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
