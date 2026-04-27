export async function generateMetadata({ params }) {
  const { id } = params;
  const baseUrl = 'https://webstore-frontend-fawn.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await fetch(`${apiUrl}/template/${id}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Template Not Found | AmrPlatform' };
    
    const data = await res.json();
    const template = data.template || data.data || data;

    return {
      title: `${template.title} | AmrPlatform Templates`,
      description: template.description ? template.description.substring(0, 160).replace(/<[^>]+>/g, '') : "Discover amazing templates on AmrPlatform.",
      keywords: template.tags || ["template", "design", "development", "AmrPlatform"],
      openGraph: {
        title: template.title,
        description: template.description ? template.description.substring(0, 160).replace(/<[^>]+>/g, '') : "Discover amazing templates on AmrPlatform.",
        url: `${baseUrl}/templates/${id}`,
        siteName: 'AmrPlatform',
        images: [
          {
            url: template.previewFile || template.coverImage || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: template.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: template.title,
        description: template.description ? template.description.substring(0, 160).replace(/<[^>]+>/g, '') : "Discover amazing templates on AmrPlatform.",
        images: [template.previewFile || template.coverImage || '/og-image.jpg'],
      },
      alternates: {
        canonical: `${baseUrl}/templates/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Template | AmrPlatform',
      description: 'Discover templates on AmrPlatform',
    };
  }
}

export default function TemplateLayout({ children }) {
  return children;
}
