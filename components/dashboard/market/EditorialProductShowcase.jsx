"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { getOptimizedUrl } from './marketUtils';

const EditorialProductShowcase = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center border-t border-brand-navy/[0.08] dark:border-white/5">
        <AppleSpinner size={40} className="text-brand-blue" />
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  const featured = products[0];
  const secondary = products.slice(1, 4);

  // Fallback formatter just in case
  const formatPriceVal = (val) => {
    try {
      return Number(val).toLocaleString();
    } catch(e) {
      return val;
    }
  };

  return (
    <div className="w-full py-16 md:py-24 relative border-t border-brand-navy/[0.08] dark:border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-6 md:px-12 gap-6 max-w-6xl mx-auto">
        <div>
          <span className="text-[12px] font-mono font-medium tracking-widest text-brand-cyan uppercase mb-4 block">Selected Works</span>
          <h2 className="text-[32px] md:text-[40px] font-display font-medium text-brand-navy dark:text-white leading-tight">
            Featured Products
          </h2>
        </div>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 max-w-md leading-relaxed font-sans">
          Production-ready digital products built for real-world use. Handcrafted templates, UI systems, and technical assets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 md:px-12 max-w-6xl mx-auto">
        
        {/* Main Featured Product */}
        {featured && (
          <div className="lg:col-span-7 flex flex-col group relative">
            <Link href={`/product/${featured.id || featured._id}`} className="absolute inset-0 z-10"></Link>
            
            {/* Visual Area */}
            <div className="w-full aspect-[4/3] bg-brand-surface dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 p-8 md:p-12 flex items-center justify-center overflow-hidden mb-6 transition-colors duration-500 group-hover:border-brand-blue/30 relative">
              <div className="absolute inset-0 bg-brand-cloud/50 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {featured.photos && JSON.parse(featured.photos)[0] ? (
                <img 
                  src={getOptimizedUrl(JSON.parse(featured.photos)[0])}
                  alt={featured.title}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:-translate-y-2 relative z-10 drop-shadow-sm group-hover:drop-shadow-sm"
                />
              ) : (
                <span className="font-mono text-slate-400">NO_IMAGE</span>
              )}
            </div>
            
            {/* Metadata Area */}
            <div className="flex flex-col px-2">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <h3 className="text-[28px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300 leading-tight">
                  {featured.title}
                </h3>
                <div className="flex flex-col items-start md:items-end shrink-0">
                  <span className="text-[20px] font-sans font-medium text-brand-navy dark:text-white">
                    BDT {formatPriceVal(featured.selling_price)}
                  </span>
                  {Number(featured.original_price) > Number(featured.selling_price) && (
                    <span className="text-[13px] text-slate-400 line-through mt-1">BDT {formatPriceVal(featured.original_price)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-5 border-t border-slate-100 dark:border-white/5">
                <p className="text-[15px] text-slate-500 dark:text-slate-400 line-clamp-2 max-w-lg leading-relaxed font-sans">
                  {featured.description ? featured.description.replace(/<[^>]*>?/gm, '') : 'Premium digital asset engineered for scale and performance.'}
                </p>
                
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-[12px] font-mono font-medium tracking-widest text-brand-teal uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-[ping_2s_ease-out_infinite]"></span>
                    Available
                  </span>
                  
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                    View Product <ArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Products */}
        <div className="lg:col-span-5 flex flex-col gap-8 lg:border-l lg:border-brand-navy/[0.08] lg:dark:border-white/10 lg:pl-8">
          {secondary.map((product) => (
            <div key={product.id || product._id} className="flex-1 flex flex-col group relative">
              <Link href={`/product/${product.id || product._id}`} className="absolute inset-0 z-10"></Link>
              
              {/* Visual Area */}
              <div className="w-full aspect-[16/9] bg-brand-surface dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 p-6 flex items-center justify-center overflow-hidden mb-4 transition-colors duration-500 group-hover:border-brand-blue/30 relative">
                <div className="absolute inset-0 bg-brand-cloud/50 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {product.photos && JSON.parse(product.photos)[0] ? (
                  <img 
                    src={getOptimizedUrl(JSON.parse(product.photos)[0])}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:-translate-y-1 relative z-10"
                  />
                ) : (
                  <span className="font-mono text-slate-400">NO_IMAGE</span>
                )}
              </div>
              
              {/* Metadata Area */}
              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300 line-clamp-1">
                    {product.title}
                  </h3>
                  <span className="text-[15px] font-sans font-semibold text-brand-navy dark:text-white shrink-0 mt-0.5">
                    BDT {formatPriceVal(product.selling_price)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest line-clamp-1">
                    {product.productType || 'Digital Product'}
                  </span>
                  
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                    View <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          ))}
          {/* See All link at the bottom of secondary */}
          {secondary.length > 0 && (
            <div className="mt-auto pt-6 flex justify-end border-t border-slate-100 dark:border-white/5">
               <Link href="/shop" className="text-[13px] font-semibold text-brand-slate dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors flex items-center gap-1.5 group relative z-20">
                 Browse all products <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EditorialProductShowcase;
