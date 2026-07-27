"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/utils/api';
import Link from 'next/link';

const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price || 0);

const getOptimizedUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // parse slug, e.g., "smart-watch_geeoo" -> categoryId: "smart-watch", subcategoryId: "geeoo"
  const decodedSlug = decodeURIComponent(slug || '');
  const slugParts = decodedSlug.split('_');
  const categoryId = slugParts[0];
  const subcategoryId = slugParts.length > 1 ? slugParts[1] : null;

  const formatName = (str) => {
    if (!str) return '';
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  
  const categoryDisplayName = formatName(categoryId) + (subcategoryId ? ` - ${formatName(subcategoryId)}` : '');

  useEffect(() => {
    setLoading(true);
    api.get('/market/products')
      .then(res => {
        let allProducts = res || [];
        
        const filtered = allProducts.filter(p => {
            const hasCategory = p.categories?.some(c => {
               const catId = c.id?.toLowerCase() || c.name?.toLowerCase().replace(/\s+/g, '-');
               return catId === categoryId;
            }) || (p.category && (p.category.toLowerCase().replace(/\s+/g, '-') === categoryId));
            
            if (hasCategory && subcategoryId) {
               const matchesBrand = p.brand?.toLowerCase() === subcategoryId.replace(/-/g, ' ');
               return matchesBrand;
            }
            return hasCategory;
        });
        
        setProducts(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, [slug, categoryId, subcategoryId]);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-[#1d1d1f]">
      {/* Sticky Sub-Nav (Apple Style) */}
      <div className="sticky top-[73px] lg:top-0 z-40 h-[52px] bg-[#f5f5f7]/80 backdrop-blur-[20px] border-b border-[#d2d2d7] flex items-center justify-between px-4 md:px-6">
        <h2 className="text-[21px] font-semibold text-[#1d1d1f] font-sans tracking-tight">{categoryDisplayName}</h2>
      </div>

      {/* Hero Section */}
      <div className="w-full bg-[#f5f5f7] pt-[80px] pb-[80px] flex flex-col items-center justify-center text-center px-4">
         <h1 className="text-[32px] md:text-[56px] font-semibold text-[#1d1d1f] leading-[1.08] tracking-[-0.015em] mb-4">
           {categoryDisplayName}
         </h1>
         <p className="text-[17px] md:text-[21px] font-normal text-[#6e6e73] max-w-2xl leading-[1.47] tracking-[-0.022em]">
           Explore our selection of premium {categoryDisplayName.toLowerCase()}. Designed to deliver the best experience without compromises.
         </p>
      </div>

      {/* Product Grid Section */}
      <div className="w-full max-w-[1440px] mx-auto pt-[80px] pb-[80px] px-4 md:px-8">
        {loading ? (
          <div className="text-center py-20">
             <p className="text-[17px] font-normal text-[#6e6e73]">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">No products found</h3>
            <p className="text-[17px] font-normal text-[#6e6e73]">We couldn't find any products in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-[#ffffff] rounded-[18px] border border-[#d2d2d7] flex flex-col items-center p-6 transition-transform duration-300 hover:scale-[1.01]">
                {product.photos && JSON.parse(product.photos)[0] ? (
                  <div className="w-full aspect-square flex items-center justify-center mb-6">
                    <img 
                      src={getOptimizedUrl(JSON.parse(product.photos)[0])} 
                      alt={product.title}
                      className="max-w-full max-h-full object-contain drop-shadow-[3px_5px_30px_rgba(0,0,0,0.22)]"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-[#f5f5f7] flex items-center justify-center mb-6 rounded-lg">
                    <span className="text-[12px] text-[#86868b]">No Image</span>
                  </div>
                )}
                
                <h3 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight mb-2 text-center line-clamp-2">
                  {product.title}
                </h3>
                
                <p className="text-[14px] font-normal text-[#6e6e73] text-center mb-4 line-clamp-3 leading-[1.43] tracking-[-0.016em]">
                  {product.description || "Premium quality and excellent performance. Upgrade your daily workflow with the best in class."}
                </p>

                <div className="mt-auto flex flex-col w-full items-center">
                  <span className="text-[17px] font-normal text-[#1d1d1f] mb-4">
                    BDT {formatPrice(product.selling_price)}
                  </span>
                  
                  <div className="flex gap-3 w-full justify-center">
                    <Link href={`/product/${product.id}`} className="bg-transparent border border-[#0066CC] text-[#0066CC] py-[11px] px-[22px] text-[17px] text-center font-normal rounded-[980px] transition-all hover:bg-[#0066CC] hover:text-white active:scale-95 cursor-pointer">
                      Learn more
                    </Link>
                    <Link href={`/checkout?productId=${product.id}`} className="bg-[#0066CC] text-white py-[11px] px-[22px] text-[17px] font-normal text-center rounded-[980px] transition-all hover:bg-[#0071E3] active:scale-95 cursor-pointer">
                      Buy
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
