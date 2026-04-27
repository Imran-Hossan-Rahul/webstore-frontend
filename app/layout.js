import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ['system-ui', 'arial'],
});

export const metadata = {
  metadataBase: new URL('https://webstore-frontend-fawn.vercel.app'),
  title: {
    default: "AmrPlatform - Showcase Your Creativity",
    template: "%s | AmrPlatform"
  },
  description: "A professional community for creators to showcase their templates, share insightful blogs, and collaborate on projects.",
  keywords: ["templates", "blogs", "creators", "design", "development", "community", "portfolio"],
  authors: [{ name: "AmrPlatform Creators" }],
  creator: "AmrPlatform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://webstore-frontend-fawn.vercel.app",
    siteName: "AmrPlatform",
    title: "AmrPlatform - Showcase Your Creativity",
    description: "A professional community for creators to showcase their templates, share insightful blogs, and collaborate on projects.",
    images: [
      {
        url: "/og-image.jpg", // We can use a default or an empty array if not present
        width: 1200,
        height: 630,
        alt: "AmrPlatform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AmrPlatform - Showcase Your Creativity",
    description: "A professional community for creators to showcase their templates, share insightful blogs, and collaborate on projects.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

