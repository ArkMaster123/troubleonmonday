import type { MetadataRoute } from 'next';

const DEFAULT_BASE_URL = 'https://troubleonmonday.com';

function getBaseUrl(): string {
  const candidate = process.env.APP_BASE_URL?.trim() || DEFAULT_BASE_URL;
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
