import type { MetadataRoute } from 'next';

// TODO: update BASE_URL to the real production domain before deploying
const BASE_URL = 'https://saatvik.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
