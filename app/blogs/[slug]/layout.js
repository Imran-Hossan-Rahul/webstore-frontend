export async function generateMetadata({ params }) {
  const { slug } = params;
  const baseUrl = 'https://webstore-frontend-fawn.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await fetch(`${apiUrl}/blog/${slug}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Blog Not Found | AmrPlatform' };
    
    const data = await res.json();
    const blog = data.data || data;

    return {
      title: `${blog.title} | AmrPlatform`,
      description: blog.content ? blog.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Read this amazing blog on AmrPlatform.",
      keywords: blog.tags || ["blog", "article", "AmrPlatform"],
      openGraph: {
        title: blog.title,
        description: blog.content ? blog.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Read this amazing blog on AmrPlatform.",
        url: `${baseUrl}/blogs/${slug}`,
        siteName: 'AmrPlatform',
        images: [
          {
            url: blog.coverImage || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.content ? blog.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Read this amazing blog on AmrPlatform.",
        images: [blog.coverImage || '/og-image.jpg'],
      },
      alternates: {
        canonical: `${baseUrl}/blogs/${slug}`,
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
