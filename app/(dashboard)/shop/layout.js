const BASE_URL = 'https://codalina.com';

export const metadata = {
  title: 'Browse Premium Digital Assets | Codalina',
  description: 'Explore a wide variety of production-ready SaaS templates, UI kits, automation scripts, and source code on Codalina. Built by developers, for developers.',
  keywords: ['shop', 'digital assets', 'SaaS templates', 'source code', 'Codalina market', 'buy code online', 'premium templates'],
  openGraph: {
    title: 'Browse Premium Digital Assets | Codalina',
    description: 'Explore a wide variety of production-ready SaaS templates, UI kits, automation scripts, and source code on Codalina.',
    url: `${BASE_URL}/shop`,
    siteName: 'Codalina',
    type: 'website',
  },
  alternates: {
    canonical: `${BASE_URL}/shop`
  }
};

export default function ShopLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}
