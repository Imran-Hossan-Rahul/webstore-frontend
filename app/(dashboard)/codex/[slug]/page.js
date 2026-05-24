import CodexClientView from "./CodexClientView";

// Next.js metadata generation for SEO
export async function generateMetadata({ params }) {
    const { slug } = params;
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        // We use fetch here to get data on the server side for SEO
        const res = await fetch(`${apiUrl}/codex/${slug}`, { next: { revalidate: 60 } }); 
        
        if (!res.ok) {
            return {
                title: "Codex Not Found | Codalina",
                description: "The requested codex could not be found."
            };
        }
        
        const codex = await res.json();
        
        // Prioritize SEO fields, fallback to standard fields
        const title = codex.seoTitle || codex.title || "Codex Article";
        const description = codex.seoDescription || codex.excerpt || "Read this amazing codex article.";
        const keywords = codex.focusKeywords?.length > 0 ? codex.focusKeywords.join(", ") : codex.tags?.join(", ") || "";
        const canonicalUrl = `https://codalina-frontend-fawn.vercel.app/codex/${slug}`;
        
        return {
            title: title,
            description: description,
            keywords: keywords,
            authors: codex.author?.name ? [{ name: codex.author.name }] : [{ name: 'Codalina Craftsman' }],
            robots: { index: true, follow: true },
            alternates: { canonical: canonicalUrl },
            openGraph: {
                title: title,
                description: description,
                url: canonicalUrl,
                siteName: 'Codalina',
                images: codex.coverImage ? [{ url: codex.coverImage, width: 1200, height: 630, alt: title }] : [],
                type: 'article',
                publishedTime: codex.createdAt,
                modifiedTime: codex.updatedAt,
                authors: codex.author?.name ? [codex.author.name] : [],
                tags: codex.tags || [],
            },
            twitter: {
                card: 'summary_large_image',
                title: title,
                description: description,
                images: codex.coverImage ? [codex.coverImage] : [],
                site: '@codalina',
            }
        };
    } catch (error) {
        console.error("Metadata fetch error:", error);
        return {
            title: "Codex Article | Codalina"
        };
    }
}

export default async function CodexServerPage({ params }) {
    const { slug } = params;
    let initialCodex = null;
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/codex/${slug}`, { next: { revalidate: 60 } });
        if (res.ok) {
            initialCodex = await res.json();
        }
    } catch (error) {
        console.error("Failed to fetch codex on server:", error);
    }
    
    // Pass the fetched data down to the client component to skip client-side loading
    return <CodexClientView initialCodex={initialCodex} slug={slug} />;
}
