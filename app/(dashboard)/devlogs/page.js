import DevlogsPage from "@/components/dashboard/DevlogsPage";

export const metadata = {
  title: "Devlogs — Developer Project Showcases | Codalina",
  description: "Browse developer devlogs on Codalina. Follow real-world project journeys, discover how craftsmen build their apps, and hire developers directly.",
  keywords: ["devlog", "developer projects", "project showcase", "build in public", "web development journey", "Codalina"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://codalina-frontend-fawn.vercel.app/devlogs" },
  openGraph: {
    title: "Devlogs — Developer Project Showcases | Codalina",
    description: "Follow real-world project journeys from developers and designers on Codalina.",
    url: "https://codalina-frontend-fawn.vercel.app/devlogs",
    siteName: "Codalina",
    type: "website",
  },
};

export default function Devlogs() {
  return <DevlogsPage />;
}
