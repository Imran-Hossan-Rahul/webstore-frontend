const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const BASE_URL = 'https://codalina.com';

const getOptimizedUrl = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_auto,w_800/${parts[1]}`;
    }
  }
  return url;
};

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const res = await fetch(`${API_URL}/market/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    
    // Support the case where backend returns data inside a 'data' key or directly
    let raw = await res.json();
    const product = raw.data || raw;

    let images = [];
    try {
      images = typeof product.photos === 'string' ? JSON.parse(product.photos) : (product.photos || []);
    } catch (e) {}

    const isDigital = !!product.productType;
    const title = `${product.title} | Codalina`;
    const description = product.description ? product.description.slice(0, 160) : (isDigital ? "Buy premium source code and SaaS templates at Codalina." : "Buy premium products at Codalina Market.");
    const image = images.length > 0 ? getOptimizedUrl(images[0]) : `${BASE_URL}/og-image.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/product/${id}`,
        siteName: 'Codalina',
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: product.title,
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `${BASE_URL}/product/${id}`
      }
    };
  } catch (error) {
    return {
      title: 'Codalina Product | Codalina',
    };
  }
}

export default async function ProductLayout({ children, params }) {
  const { id } = params;
  let jsonLd = null;

  try {
    const res = await fetch(`${API_URL}/market/products/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      let raw = await res.json();
      const product = raw.data || raw;
      const isDigital = !!product.productType;

      let images = [];
      try {
        images = typeof product.photos === 'string' ? JSON.parse(product.photos) : (product.photos || []);
      } catch (e) {}
      
      const baseProductSchema = {
        '@context': 'https://schema.org',
        '@type': isDigital ? 'SoftwareApplication' : 'Product',
        name: product.title,
        image: images.map(img => getOptimizedUrl(img)),
        description: product.description || "Premium product from Codalina Market",
        sku: product.sku || product.id,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Codalina'
        },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/product/${id}`,
          priceCurrency: 'BDT',
          price: product.selling_price,
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.status === 'Live' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };

      if (isDigital) {
        baseProductSchema.applicationCategory = 'DeveloperApplication';
        baseProductSchema.operatingSystem = 'All';
        if (product.fileSize) baseProductSchema.fileSize = product.fileSize;
        if (product.fileFormat) baseProductSchema.fileFormat = product.fileFormat;
        if (product.version) baseProductSchema.softwareVersion = product.version;
        // Optionally add aggregateRating if reviews are available (left out if no data yet)
      }

      jsonLd = [
        baseProductSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${BASE_URL}/store` },
            { '@type': 'ListItem', position: 3, name: product.title, item: `${BASE_URL}/product/${id}` }
          ]
        }
      ];
    }
  } catch(e) {}

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
