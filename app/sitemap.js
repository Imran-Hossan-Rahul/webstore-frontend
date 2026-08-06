/**
 * Dynamic Sitemap — Next.js App Router
 * Auto-generates sitemap.xml with all Codex, Devlog, and Artifact URLs
 * Google uses this to discover and index all content
 * 
 * URL: /sitemap.xml
 */

const BASE_URL = 'https://codalina-frontend-fawn.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchAllCodex() {
    try {
        const res = await fetch(`${API_URL}/codex?limit=1000&page=1`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || data.codexes || data.articles || [];
    } catch {
        return [];
    }
}

async function fetchAllDevlogs() {
    try {
        const res = await fetch(`${API_URL}/posts?type=devlog&limit=1000&page=1`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || data.posts || [];
    } catch {
        return [];
    }
}

async function fetchAllArtifacts() {
    try {
        const res = await fetch(`${API_URL}/artifact?limit=1000&page=1`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || data.artifacts || [];
    } catch {
        return [];
    }
}

async function fetchAllProducts() {
    try {
        const res = await fetch(`${API_URL}/market/products?limit=1000&page=1`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || data.products || data || [];
    } catch {
        return [];
    }
}

export default async function sitemap() {
    // Static pages
    const staticPages = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/codex`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
        { url: `${BASE_URL}/devlogs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
        { url: `${BASE_URL}/artifacts`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
        { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ];

    // Fetch dynamic content in parallel
    const [codexList, devlogList, artifactList, productList] = await Promise.all([
        fetchAllCodex(),
        fetchAllDevlogs(),
        fetchAllArtifacts(),
        fetchAllProducts(),
    ]);

    const codexUrls = codexList.map((item) => ({
        url: `${BASE_URL}/codex/${item.slug || item._id}`,
        lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const devlogUrls = devlogList.map((item) => ({
        url: `${BASE_URL}/post/${item._id}`,
        lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const artifactUrls = artifactList.map((item) => ({
        url: `${BASE_URL}/artifacts/${item._id}`,
        lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const productUrls = productList.map((item) => ({
        url: `${BASE_URL}/product/${item.id || item._id}`,
        lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
        changeFrequency: 'daily',
        priority: 0.9,
    }));

    return [...staticPages, ...codexUrls, ...devlogUrls, ...artifactUrls, ...productUrls];
}
