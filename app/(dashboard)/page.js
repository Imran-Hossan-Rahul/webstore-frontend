import MarketClientView from "@/components/dashboard/market/MarketClientView";

export async function generateMetadata() {
    return {
        title: "Codalina | Digital Technology Partner",
        description: "Codalina is a digital technology partner that builds, sells, maintains, and continuously improves digital products and custom technology solutions.",
        keywords: ["technology partner", "digital products", "custom solutions", "software development", "web development", "Codalina"],
        openGraph: {
            title: "Codalina | Digital Technology Partner",
            description: "Codalina is a digital technology partner that builds, sells, maintains, and continuously improves digital products and custom technology solutions.",
            type: "website"
        }
    };
}

export default async function Home() {
    let initialData = [];
    let initialPagination = { pages: 1, currentPage: 1 };
    let initialFeatured = [];
    let initialPopular = [];
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        
        // Fetch paginated, featured, and popular concurrently
        const [resAll, resFeatured, resPopular] = await Promise.all([
            fetch(`${apiUrl}/market/products?isLatest=true&limit=17&status=Live`, { cache: 'no-store' }),
            fetch(`${apiUrl}/market/products?isFeatured=true&limit=10&status=Live`, { cache: 'no-store' }),
            fetch(`${apiUrl}/market/products?isPopular=true&limit=10&status=Live`, { cache: 'no-store' })
        ]);
        
        if (resAll.ok) {
            const data = await resAll.json();
            initialData = data.data || [];
            initialPagination = data.pagination || { pages: 1, currentPage: 1 };
        }
        if (resFeatured.ok) {
            const data = await resFeatured.json();
            initialFeatured = data.data || [];
        }
        if (resPopular.ok) {
            const data = await resPopular.json();
            initialPopular = data.data || [];
        }
    } catch (error) {
        console.error("Market SSR Fetch Error:", error);
    }
    
    return (
        <MarketClientView 
            initialData={initialData} 
            initialPagination={initialPagination} 
            initialFeatured={initialFeatured}
            initialPopular={initialPopular}
        />
    );
}
