import CodexPage from "@/components/dashboard/CodexPage";

export const metadata = {
  title: "Codex — Technical Articles & Developer Tutorials | Codalina",
  description: "Read in-depth technical articles, coding tutorials, and developer guides written by experienced craftsmen on Codalina. Learn React, Next.js, Node.js, and more.",
  keywords: ["technical articles", "developer tutorials", "coding guides", "web development blog", "React tutorial", "Next.js", "Node.js", "programming", "Codalina codex"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://codalina-frontend-fawn.vercel.app/codex" },
  openGraph: {
    title: "Codex — Technical Articles & Developer Tutorials | Codalina",
    description: "In-depth technical articles, coding tutorials, and developer guides by expert craftsmen on Codalina.",
    url: "https://codalina-frontend-fawn.vercel.app/codex",
    siteName: "Codalina",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Codalina Codex" }],
  },
};

export default function Codex() {
  return <CodexPage />;
}
