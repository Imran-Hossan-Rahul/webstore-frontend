export async function generateMetadata({ params }) {
  const { slug } = params;
  const baseUrl = 'https://codalina-frontend-fawn.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await fetch(`${apiUrl}/codex/${slug}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Codex Not Found | AmrPlatform' };
    
    const data = await res.json();
    const codex = data.data || data;

    return {
      title: `${codex.title} | AmrPlatform`,
      description: codex.content ? codex.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Read this amazing codex on AmrPlatform.",
      keywords: codex.tags || ["codex", "codex", "AmrPlatform"],
      openGraph: {
        title: codex.title,
        description: codex.content ? codex.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Read this amazing codex on AmrPlatform.",
        url: `${baseUrl}/codexs/${slug}`,
        siteName: 'AmrPlatform',
        images: [
          {
            url: codex.coverImage || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: codex.title,
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: codex.title,
        description: codex.content ? codex.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Read this amazing codex on AmrPlatform.",
        images: [codex.coverImage || '/og-image.jpg'],
      },
      alternates: {
        canonical: `${baseUrl}/codexs/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Codex | AmrPlatform',
      description: 'Read codexs on AmrPlatform',
    };
  }
}

export default function CodexLayout({ children }) {
  return children;
}
