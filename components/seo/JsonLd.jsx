/**
 * JsonLd - Reusable JSON-LD Structured Data Component
 * Injects Schema.org markup for Google Rich Results
 * Usage: <JsonLd data={schemaObject} />
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  const jsonString = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

// Helper: Article schema for Codex blog posts
export function buildArticleSchema({ title, description, author, publishedAt, updatedAt, image, url, keywords }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image ? [image] : [],
    "author": {
      "@type": "Person",
      "name": author || "Codalina Craftsman"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Codalina",
      "logo": {
        "@type": "ImageObject",
        "url": "https://codalina-frontend-fawn.vercel.app/logo.png"
      }
    },
    "datePublished": publishedAt,
    "dateModified": updatedAt || publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": Array.isArray(keywords) ? keywords.join(", ") : keywords,
    "inLanguage": "en-US"
  };
}

// Helper: TechArticle schema for Devlogs (project showcases)
export function buildTechArticleSchema({ title, description, author, publishedAt, updatedAt, image, url, tools, difficulty }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": description,
    "image": image ? [image] : [],
    "author": {
      "@type": "Person",
      "name": author || "Codalina Craftsman"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Codalina",
      "logo": {
        "@type": "ImageObject",
        "url": "https://codalina-frontend-fawn.vercel.app/logo.png"
      }
    },
    "datePublished": publishedAt,
    "dateModified": updatedAt || publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "proficiencyLevel": difficulty || "Beginner",
    "dependencies": Array.isArray(tools) ? tools.join(", ") : tools,
    "inLanguage": "en-US"
  };
}

// Helper: SoftwareApplication schema for Artifacts (UI components, templates)
export function buildSoftwareSchema({ title, description, author, category, price, url, image, rating, ratingCount }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "description": description,
    "image": image,
    "author": {
      "@type": "Person",
      "name": author || "Codalina Craftsman"
    },
    "applicationCategory": category || "WebApplication",
    "operatingSystem": "Web Browser",
    "url": url,
    "offers": {
      "@type": "Offer",
      "price": price || 0,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Codalina"
    }
  };

  if (rating && ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": ratingCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  return schema;
}

// Helper: BreadcrumbList schema
export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
