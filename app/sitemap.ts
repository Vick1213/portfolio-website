import type { MetadataRoute } from 'next';

// TODO: update BASE_URL to the real production domain before deploying
const BASE_URL = 'https://saatvik.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
