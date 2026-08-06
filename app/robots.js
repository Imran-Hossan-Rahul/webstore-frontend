const BASE_URL = 'https://codalina-frontend-fawn.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        // Allow all crawlers full access to content
        userAgent: '*',
        allow: [
          '/',
          '/codex/',
          '/devlogs/',
          '/artifacts/',
          '/post/',
          '/explore/',
          '/u/',
          '/product/',
          '/shop/',
        ],
        disallow: [
          '/admin/',
          '/settings/',
          '/wallet/',
          '/contracts/',
          '/chat/',
          '/workspace/',
          '/api/',
          '/upload-devlog',
          '/upload-artifact',
          '/post-job',
        ],
      },
      {
        // Let Google Image bot index all images
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
