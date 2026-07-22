import MarketClientView from "./MarketClientView";

export async function generateMetadata() {
    return {
        title: "Marketplace | Codalina",
        description: "Explore the Codalina electronics marketplace for the best deals on laptops, smartphones, and accessories."
    };
}

export default async function MarketServerPage() {
    let initialData = [];
    let initialPagination = { pages: 1, currentPage: 1 };
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        // Fetch first page on the server (SSR) with 60 second cache revalidation
        const res = await fetch(`${apiUrl}/market/products?page=1&limit=12`, { next: { revalidate: 60 } }); 
        
        if (res.ok) {
            const data = await res.json();
            initialData = data.data || [];
            initialPagination = data.pagination || { pages: 1, currentPage: 1 };
        }
    } catch (error) {
        console.error("Market SSR Fetch Error:", error);
    }
    
    return (
        <MarketClientView 
            initialData={initialData} 
            initialPagination={initialPagination} 
        />
    );
}
