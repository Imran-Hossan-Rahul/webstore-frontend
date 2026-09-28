"use client";
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";

const ScrollableProductRow = ({ title, products, renderProductCard, viewAllLink, isLoading }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [products]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 280;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <div className="p-2 pt-2 md:py-8 md:px-0 w-full -mt-4 md:mt-2 relative group">
      <div className="flex justify-between items-center mb-4 md:mb-8 mt-6 md:mt-0 px-2 md:px-0">
        <h2 className="text-lg md:text-[28px] font-display font-medium text-brand-navy dark:text-white">
          {title}
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-[13px] md:text-[14px] font-medium text-brand-navy dark:text-white bg-transparent border border-brand-navy/[0.08] dark:border-white/10 px-4 py-1.5 md:px-5 md:py-2 rounded-[4px] hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-blue dark:hover:text-brand-blue transition-colors">
            See all
          </Link>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <AppleSpinner size={40} className="text-brand-blue" />
        </div>
      ) : (
        <div className="relative">
          {showLeft && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-5 z-10 bg-brand-surface/90 dark:bg-[#1d1d1f]/90 backdrop-blur border border-apple-hairline p-2 md:p-3 rounded-full shadow-sm text-apple-ink hover:scale-105 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-3 md:gap-5 snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitMaskImage: `linear-gradient(to right, #000, #000 calc(100% - 32px), ${showRight && products.length > 3 ? 'transparent' : '#000'})`,
              maskImage: `linear-gradient(to right, #000, #000 calc(100% - 32px), ${showRight && products.length > 3 ? 'transparent' : '#000'})`
            }}
          >
            {products.map((item, idx) => (
              <div key={item.id || idx} className="min-w-[160px] max-w-[160px] md:min-w-[220px] md:max-w-[220px] lg:min-w-[240px] lg:max-w-[240px] snap-start shrink-0">
                {renderProductCard(item)}
              </div>
            ))}
          </div>

          {showRight && products.length > 3 && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-5 z-10 bg-brand-surface/90 dark:bg-[#1d1d1f]/90 backdrop-blur border border-apple-hairline p-2 md:p-3 rounded-full shadow-sm text-apple-ink hover:scale-105 transition-transform"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
};

export default ScrollableProductRow;
