import ArtifactClientView from "./ArtifactClientView";

// Server Component — pre-fetches artifact for SSR
// This ensures Google crawler gets full content immediately
export default async function ArtifactServerPage({ params }) {
    const { id } = params;
    let initialArtifact = null;
    
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/artifact/${id}`, { next: { revalidate: 60 } });
        if (res.ok) {
            const data = await res.json();
            initialArtifact = data.data || data;
        }
    } catch (error) {
        console.error("Failed to fetch artifact on server:", error);
    }
    
    return <ArtifactClientView initialArtifact={initialArtifact} />;
}
