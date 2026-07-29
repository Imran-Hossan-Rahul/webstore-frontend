import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import GlobalTracker from "@/components/GlobalTracker";
import NextTopLoader from "nextjs-toploader";


export const metadata = {
  metadataBase: new URL('https://codalina-frontend-fawn.vercel.app'),
  title: {
    default: "Codalina — Where Craftsmen Build, Share & Get Hired",
    template: "%s | Codalina"
  },
  description: "Codalina is a professional platform for developers and designers to showcase their projects (Devlogs), publish technical articles (Codex), and share UI components (Artifacts). Get hired. Get noticed.",
  keywords: [
    "developer portfolio", "web development projects", "UI components", "design artifacts",
    "devlog", "coding blog", "tech articles", "craftsman", "freelance developer",
    "open source", "React templates", "Next.js", "frontend development", "Codalina"
  ],
  authors: [{ name: "Codalina" }],
  creator: "Codalina",
  publisher: "Codalina",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codalina-frontend-fawn.vercel.app",
    siteName: "Codalina",
    title: "Codalina — Where Craftsmen Build, Share & Get Hired",
    description: "Showcase your projects, publish technical articles, and share UI components on Codalina. The professional platform for developers and designers.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Codalina — Professional Developer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@codalina",
    title: "Codalina — Where Craftsmen Build, Share & Get Hired",
    description: "Showcase your projects, publish technical articles, and share UI components. The professional platform for developers.",
    images: ["/og-image.jpg"],
  },
};


import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap' 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap' 
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <ToastProvider>
                <NextTopLoader
                  color="#6252db"
                  initialPosition={0.7}
                  crawlSpeed={200}
                  height={2}
                  crawl={true}
                  showSpinner={false}
                  easing="ease"
                  speed={200}
                  shadow="0 0 10px #6252db, 0 0 5px #6252db"
                />
                <GlobalTracker />
                {children}
              </ToastProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



