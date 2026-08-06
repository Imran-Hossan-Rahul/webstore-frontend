const BASE_URL = 'https://codalina.com';

export const metadata = {
  title: 'Shop Electronics & Digital Assets | Codalina',
  description: 'Explore a wide variety of premium electronics and digital products on Codalina Market. Find the best deals, browse through categories, and buy securely.',
  keywords: ['shop', 'electronics', 'digital assets', 'Codalina market', 'buy electronics online', 'premium products'],
  openGraph: {
    title: 'Shop Electronics & Digital Assets | Codalina',
    description: 'Explore a wide variety of premium electronics and digital products on Codalina Market.',
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
