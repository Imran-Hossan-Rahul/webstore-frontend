import PostClientView from "./PostClientView";

// Next.js metadata generation for SEO
export async function generateMetadata({ params }) {
    const { id } = params;
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        // We use fetch here to get data on the server side for SEO
        const res = await fetch(`${apiUrl}/posts/${id}`, { next: { revalidate: 60 } }); 
        
        if (!res.ok) {
            return {
                title: "Post Not Found | Codalina",
                description: "The requested post could not be found."
            };
        }
        
        const data = await res.json();
        const post = data.data || data;
        
        // Prioritize SEO fields, fallback to standard fields
        const title = post.seoTitle || post.title || "Devlog / Project Showcase";
        const description = post.seoDescription || post.content?.substring(0, 150) || "Read this amazing devlog.";
        const keywords = post.focusKeywords?.length > 0 ? post.focusKeywords.join(", ") : post.tags?.join(", ") || "";
        const coverImage = post.images && post.images.length > 0 ? post.images[0] : null;
        const canonicalUrl = `https://codalina-frontend-fawn.vercel.app/post/${id}`;
        
        return {
            title: title,
            description: description,
            keywords: keywords,
            authors: post.user?.name ? [{ name: post.user.name }] : [{ name: 'Codalina Craftsman' }],
            robots: { index: true, follow: true },
            alternates: { canonical: canonicalUrl },
            openGraph: {
                title: title,
                description: description,
                url: canonicalUrl,
                siteName: 'Codalina',
                images: coverImage ? [{ url: coverImage, width: 1200, height: 630, alt: title }] : [],
                type: 'article',
                publishedTime: post.createdAt,
                modifiedTime: post.updatedAt,
                authors: post.user?.name ? [post.user.name] : [],
                tags: post.tags || [],
            },
            twitter: {
                card: 'summary_large_image',
                title: title,
                description: description,
                images: coverImage ? [coverImage] : [],
                site: '@codalina',
            }
        };
    } catch (error) {
        console.error("Metadata fetch error:", error);
        return {
            title: "Post | Codalina"
        };
    }
}

export default async function PostServerPage({ params }) {
    const { id } = params;
    let initialPost = null;
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/posts/${id}`, { next: { revalidate: 60 } });
        if (res.ok) {
            const data = await res.json();
            initialPost = data.data || data;
        }
    } catch (error) {
        console.error("Failed to fetch post on server:", error);
    }
    
    // Pass the fetched data down to the client component to skip client-side loading
    return <PostClientView initialPost={initialPost} />;
}
