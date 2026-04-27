export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/private/', '/settings/'],
    },
    sitemap: 'https://webstore-frontend-fawn.vercel.app/sitemap.xml',
  }
}
