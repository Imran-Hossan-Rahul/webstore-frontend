import ArtifactsDashboard from "@/components/dashboard/artifacts/ArtifactsDashboard";

export const metadata = {
  title: "Artifacts — UI Components, Templates & Design Assets | Codalina",
  description: "Download free and premium UI components, templates, animations, and design artifacts built by expert craftsmen. Browse Codalina's growing library of web artifacts.",
  keywords: ["UI components", "web templates", "design artifacts", "free templates", "React components", "CSS animations", "frontend assets", "Codalina"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://codalina-frontend-fawn.vercel.app/artifacts" },
  openGraph: {
    title: "Artifacts — UI Components & Templates | Codalina",
    description: "Download free and premium UI components, templates, and design assets from Codalina craftsmen.",
    url: "https://codalina-frontend-fawn.vercel.app/artifacts",
    siteName: "Codalina",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Codalina Artifacts" }],
  },
};

export default function Artifacts() {
  return <ArtifactsDashboard />;
}
