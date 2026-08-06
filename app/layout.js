import "./globals.css";
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import GlobalTracker from "@/components/GlobalTracker";



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

export const metadata = {
  metadataBase: new URL('https://codalina-frontend-fawn.vercel.app'),
  title: {
    default: "Codalina — Digital Marketplace",
    template: "%s | Codalina"
  },
  description: "Codalina is a premium digital marketplace to buy and sell source code, UI components, and software assets.",
  keywords: [
    "marketplace", "digital products", "source code", "UI components", "design assets",
    "software", "React templates", "Next.js", "frontend development", "Codalina"
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
    title: "Codalina — Digital Marketplace",
    description: "Buy and sell premium software assets, source code, and UI components on Codalina.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Codalina — Digital Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@codalina",
    title: "Codalina — Digital Marketplace",
    description: "Buy and sell premium software assets, source code, and UI components.",
    images: ["/og-image.jpg"],
  },
};

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
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Organization",
                      "name": "Codalina",
                      "url": "https://codalina-frontend-fawn.vercel.app",
                      "logo": "https://codalina-frontend-fawn.vercel.app/logo.png"
                    })
                  }}
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



