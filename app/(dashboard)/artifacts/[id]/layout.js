const BASE_URL = 'https://codalina-frontend-fawn.vercel.app';

export async function generateMetadata({ params }) {
  const { id } = params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/artifact/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: 'Artifact Not Found | Codalina' };
    
    const data = await res.json();
    const artifact = data.data || data;

    // Prioritize explicit SEO fields, then smart fallbacks
    const title = artifact.seoTitle || `${artifact.title} | Codalina Artifacts`;
    const rawDescription = artifact.description?.replace(/<[^>]+>/g, '').substring(0, 155) || '';
    const description = artifact.seoDescription || rawDescription || `Discover ${artifact.title} — a premium ${artifact.category} artifact on Codalina.`;
    const keywords = artifact.focusKeywords?.length > 0
      ? artifact.focusKeywords
      : [...(artifact.tags || []), artifact.category, 'UI template', 'web component', 'Codalina'].filter(Boolean);
    const image = artifact.previewFile || artifact.coverImage || '/og-image.jpg';
    const canonicalUrl = `${BASE_URL}/artifacts/${id}`;

    return {
      title,
      description,
      keywords,
      authors: artifact.user?.name ? [{ name: artifact.user.name }] : [{ name: 'Codalina Craftsman' }],
      robots: { index: true, follow: true },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Codalina',
        images: [{ url: image, width: 1200, height: 630, alt: artifact.title }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        site: '@codalina',
      },
    };
  } catch (error) {
    console.error('Artifact metadata error:', error);
    return {
      title: 'Artifact | Codalina',
      description: 'Discover premium UI artifacts, templates and components on Codalina.',
    };
  }
}

export default function ArtifactLayout({ children }) {
  return children;
}
