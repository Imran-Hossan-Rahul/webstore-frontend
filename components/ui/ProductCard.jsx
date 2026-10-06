import React from 'react';
import Link from 'next/link';

export const ProductCard = ({ product, getOptimizedUrl, formatPrice, className = '' }) => {
  let coverImage = '';
  try {
    const photos = typeof product.photos === 'string' ? JSON.parse(product.photos) : product.photos;
    if (photos && photos.length > 0) coverImage = getOptimizedUrl(photos[0]);
  } catch(e) {}

  const isFeatured = product.isFeatured;
  
  return (
    <Link href={`/product/${product.id}`} className={`group flex flex-col ${isFeatured ? 'bg-brand-dark text-white' : 'bg-brand-surface '} border border-brand-navy/[0.08]  rounded-[4px] overflow-hidden hover:border-brand-blue :border-brand-blue/50 transition-all shadow-[1px_1px_10px_rgba(11,37,69,0.02)] ${className}`}>
      {/* Cover Image */}
      <div className={`aspect-[4/3] w-full ${isFeatured ? 'bg-[#06172E]' : 'bg-brand-cloud '} border-b border-brand-navy/[0.08]  relative overflow-hidden flex items-center justify-center p-4`}>
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={product.title}
            className={`w-full h-full object-contain ${!isFeatured && 'mix-blend-multiply '} transition-transform duration-300 group-hover:scale-105`}
          />
        ) : (
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">No Image</span>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {isFeatured && (
            <span className="bg-brand-interaction shadow-[0_0_15px_rgba(29,95,209,0.3)] text-white text-[10px] font-mono font-medium tracking-widest uppercase px-2 py-1 rounded-[4px] border border-white/20">
              Featured
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className={`text-[14px] font-sans font-medium ${isFeatured ? 'text-white' : 'text-brand-navy '} line-clamp-1 mb-1 group-hover:text-brand-blue transition-colors`}>
          {product.title}
        </h3>
        
        <div className={`text-[11px] font-mono tracking-widest uppercase ${isFeatured ? 'text-brand-sky/60' : 'text-slate-500 '} line-clamp-1 mb-4`}>
          {[product.category, product.sub_category].filter(Boolean).join(' • ')}
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className={`text-[15px] font-mono font-medium ${isFeatured ? 'text-white' : 'text-brand-navy '}`}>
              BDT {formatPrice(product.selling_price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

