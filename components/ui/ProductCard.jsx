import React from 'react';
import Link from 'next/link';

export const ProductCard = ({ product, getOptimizedUrl, formatPrice, className = '' }) => {
  let coverImage = '';
  try {
    const photos = typeof product.photos === 'string' ? JSON.parse(product.photos) : product.photos;
    if (photos && photos.length > 0) coverImage = getOptimizedUrl(photos[0]);
  } catch(e) {}

  return (
    <Link href={`/product/${product.id}`} className={`group flex flex-col bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] overflow-hidden hover:border-brand-blue dark:hover:border-brand-blue/50 transition-all ${className}`}>
      {/* Cover Image */}
      <div className="aspect-[4/3] w-full bg-brand-cloud dark:bg-[#0D1117] border-b border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center p-4">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">No Image</span>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="bg-brand-blue text-white text-[10px] font-mono font-medium tracking-widest uppercase px-2 py-1 rounded-[4px]">
              Featured
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[14px] font-sans font-medium text-brand-navy dark:text-white line-clamp-1 mb-1 group-hover:text-brand-blue transition-colors">
          {product.title}
        </h3>
        
        <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500 line-clamp-1 mb-4">
          {[product.category, product.sub_category].filter(Boolean).join(' • ')}
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-[15px] font-mono font-medium text-brand-navy dark:text-white">
              BDT {formatPrice(product.selling_price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
