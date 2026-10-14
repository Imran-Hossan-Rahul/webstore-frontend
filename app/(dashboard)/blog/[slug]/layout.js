export async function generateMetadata({ params }) {
  const { slug } = params;
  const baseUrl = 'https://webstore-frontend-fawn.vercel.app';
  // Use v1 API and explicitly use IPv4 loopback to prevent ECONNREFUSED
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/blogs/${slug}?lang=en`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Blog Not Found | AmrPlatform' };
    
    const data = await res.json();
    const blogData = data.data || data;
    const title = blogData.en?.title || blogData.title || "Blog";
    const excerpt = blogData.en?.excerpt || blogData.excerpt || blogData.en?.content || blogData.content || "";
    const plainExcerpt = excerpt.substring(0, 160).replace(/<[^>]+>/g, '');

    return {
      title: `${title} | AmrPlatform`,
      description: plainExcerpt || "Read this amazing blog on AmrPlatform.",
      keywords: blogData.tags || ["blog", "article", "AmrPlatform"],
      openGraph: {
        title: title,
        description: plainExcerpt || "Read this amazing blog on AmrPlatform.",
        url: `${baseUrl}/blog/${slug}`,
        siteName: 'AmrPlatform',
        images: [
          {
            url: blogData.coverImage || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: plainExcerpt || "Read this amazing blog on AmrPlatform.",
        images: [blogData.coverImage || '/og-image.jpg'],
      },
      alternates: {
        canonical: `${baseUrl}/blog/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Blog | AmrPlatform',
      description: 'Read blogs on AmrPlatform',
    };
  }
}

export default function BlogLayout({ children }) {
  return children;
}
