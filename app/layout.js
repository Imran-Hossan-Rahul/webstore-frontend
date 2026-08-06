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
  metadataBase: new URL('https://codalina.com'),
  title: {
    default: "Codalina — Digital Marketplace",
    template: "%s | Codalina"
  },
  description: "Codalina is a premium digital marketplace offering carefully selected digital products, source codes, UI components, and high-quality original electronics.",
  keywords: [
    "marketplace", "digital products", "electronics", "earphones", "earbuds", "source code", "UI components", "gadgets",
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
    url: "https://codalina.com",
    siteName: "Codalina",
    title: "Codalina — Digital Marketplace",
    description: "Codalina is a premium digital marketplace offering carefully selected digital products, source codes, UI components, and high-quality original electronics.",
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
    description: "Codalina is a premium digital marketplace offering carefully selected digital products, source codes, UI components, and high-quality original electronics.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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
                      "url": "https://codalina.com",
                      "logo": "https://codalina.com/logo.png"
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



