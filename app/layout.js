import "./globals.css";
import { Inter, IBM_Plex_Sans, IBM_Plex_Mono, Noto_Sans_Bengali } from 'next/font/google';
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import GlobalTracker from "@/components/GlobalTracker";
import SmoothScroller from "@/components/SmoothScroller";

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap' 
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap'
});

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap' 
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-bengali',
  display: 'swap'
});

export const metadata = {
  metadataBase: new URL('https://codalina.com'),
  title: {
    default: "Codalina | Digital Technology Partner",
    template: "%s | Codalina"
  },
  description: "Codalina is a digital technology partner that builds, sells, maintains, and continuously improves digital products and custom technology solutions.",
  keywords: [
    "technology partner", "digital products", "custom solutions", "software development", "web development", 
    "maintenance", "SaaS", "Codalina"
  ],
  authors: [{ name: "Codalina" }],
  creator: "Codalina",
  publisher: "Codalina",
  icons: {
    icon: '/assets/codalina-logo.svg',
    shortcut: '/assets/codalina-logo.svg',
    apple: '/assets/apple-touch-icon.png',
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codalina.com",
    siteName: "Codalina",
    title: "Codalina | Digital Technology Partner",
    description: "Codalina is a digital technology partner that builds, sells, maintains, and continuously improves digital products and custom technology solutions.",
    images: [
      {
        url: "/assets/codalina-logo.png",
        width: 1200,
        height: 630,
        alt: "Codalina | Digital Technology Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@codalina",
    title: "Codalina | Digital Technology Partner",
    description: "Codalina is a digital technology partner that builds, sells, maintains, and continuously improves digital products and custom technology solutions.",
    images: ["/assets/codalina-logo.png"],
  },
};

export const viewport = {
  themeColor: '#E6EBF0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#E6EBF0" />
        <link rel="icon" href="/assets/codalina-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${notoSansBengali.variable} font-sans antialiased`}>
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
                      "logo": "https://codalina.com/logo.png",
                      "sameAs": [
                        "https://www.facebook.com/profile.php?id=61591711877853",
                        "https://www.instagram.com/codalinaglobal/",
                        "https://x.com/codalinaglobal",
                        "https://bikroy.com/sellerpage-AWv0rx64T4yTmhkp7goj4Zis"
                      ]
                    })
                  }}
                />
                <SmoothScroller>
                  <GlobalTracker />
                  {children}
                </SmoothScroller>
              </ToastProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



