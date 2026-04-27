export async function generateMetadata({ params }) {
  const { id } = params;
  const baseUrl = 'https://webstore-frontend-fawn.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await fetch(`${apiUrl}/post/${id}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Post Not Found | AmrPlatform' };
    
    const data = await res.json();
    const post = data.post || data.data || data;

    return {
      title: `${post.title || "Community Post"} | AmrPlatform`,
      description: post.content ? post.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Join the discussion on AmrPlatform.",
      keywords: post.tags || ["post", "community", "discussion", "AmrPlatform"],
      openGraph: {
        title: post.title || "Community Post",
        description: post.content ? post.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Join the discussion on AmrPlatform.",
        url: `${baseUrl}/post/${id}`,
        siteName: 'AmrPlatform',
        images: [
          {
            url: post.coverImage || post.image || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: post.title || "Post Preview",
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title || "Community Post",
        description: post.content ? post.content.substring(0, 160).replace(/<[^>]+>/g, '') : "Join the discussion on AmrPlatform.",
        images: [post.coverImage || post.image || '/og-image.jpg'],
      },
      alternates: {
        canonical: `${baseUrl}/post/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Post | AmrPlatform',
      description: 'Community post on AmrPlatform',
    };
  }
}

export default function PostLayout({ children }) {
  return children;
}
