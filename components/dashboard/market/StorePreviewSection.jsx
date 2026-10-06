"use client";
import Image from 'next/image';
import AppleSpinner from "@/components/ui/AppleSpinner";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue } from 'framer-motion';
import { getOptimizedUrl } from './marketUtils';

const StorePreviewSection = ({ products }) => {
  const [navigatingId, setNavigatingId] = React.useState(null);
  const router = useRouter();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isHoveringBuyBtn, setIsHoveringBuyBtn] = React.useState(false);

  const topScrollRef = React.useRef(null);
  const bottomScrollRef = React.useRef(null);

  const baseProducts = products || [];

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const centerCarousel = () => {
        if (topScrollRef.current && topScrollRef.current.children[4]) {
          const child = topScrollRef.current.children[4];
          topScrollRef.current.scrollLeft = child.offsetLeft - (window.innerWidth / 2) + (child.offsetWidth / 2);
        }
        if (bottomScrollRef.current && bottomScrollRef.current.children[4]) {
          const child = bottomScrollRef.current.children[4];
          bottomScrollRef.current.scrollLeft = child.offsetLeft - (window.innerWidth / 2) + (child.offsetWidth / 2);
        }
      };

      centerCarousel();
      const timer1 = setTimeout(centerCarousel, 50);
      const timer2 = setTimeout(centerCarousel, 250);
      const timer3 = setTimeout(centerCarousel, 600);
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }
  }, [baseProducts.length]);

  const dummyProducts = Array.from({ length: 6 }).map((_, i) => ({
    id: `dummy-${i}`,
    title: `Premium Website Design ${i + 1}`,
    photos: JSON.stringify([`/assets/placeholder-${(i % 3) + 1}.jpg`]),
  }));

  const productsToUse = baseProducts.length > 0 ? baseProducts : dummyProducts;

  let row1Items = [...productsToUse];
  if (productsToUse.length > 0) {
    while (row1Items.length < 6) row1Items = [...row1Items, ...productsToUse];
  }
  const row1Marquee = [...row1Items, ...row1Items];

  let row2Items = [...productsToUse];
  if (productsToUse.length > 0) {
    while (row2Items.length < 10) row2Items = [...row2Items, ...productsToUse];
  }
  const row2Marquee = [...row2Items, ...row2Items];

  // Carousel State & Logic
  const [topIndex, setTopIndex] = React.useState(0);
  const [topIsTransitioning, setTopIsTransitioning] = React.useState(true);
  
  const [bottomIndex, setBottomIndex] = React.useState(0);
  const [bottomIsTransitioning, setBottomIsTransitioning] = React.useState(true);

  React.useEffect(() => {
    const topTimer = setInterval(() => {
      setTopIsTransitioning(true);
      setTopIndex(prev => prev + 1);
    }, 4000);
    return () => clearInterval(topTimer);
  }, []);

  React.useEffect(() => {
    if (topIndex === row1Items.length) {
      const snapTimer = setTimeout(() => {
        setTopIsTransitioning(false);
        setTopIndex(0);
      }, 800); // Wait for transition to complete
      return () => clearTimeout(snapTimer);
    }
  }, [topIndex, row1Items.length]);

  React.useEffect(() => {
    const bottomTimer = setInterval(() => {
      setBottomIsTransitioning(true);
      setBottomIndex(prev => prev + 1);
    }, 4000); 
    return () => clearInterval(bottomTimer);
  }, []);

  React.useEffect(() => {
    if (bottomIndex === row2Items.length) {
      const snapTimer = setTimeout(() => {
        setBottomIsTransitioning(false);
        setBottomIndex(0);
      }, 800);
      return () => clearTimeout(snapTimer);
    }
  }, [bottomIndex, row2Items.length]);

  // Early return if no products (must be called after all hooks)
  // if (baseProducts.length === 0) return null;

  const getFirstPhoto = (photosStr) => {
    if (!photosStr) return null;
    try {
      const parsed = JSON.parse(photosStr);
      return Array.isArray(parsed) ? parsed[0] : null;
    } catch (e) {
      return null;
    }
  };

  const renderCard = (product, idx, widthClass) => {
    const firstPhoto = getFirstPhoto(product.photos);
    return (
    <Link 
      key={`${product.id || product._id}-${idx}`} 
      href={`/product/${product.id || product._id}`} 
      className={`shrink-0 flex flex-col group cursor-none relative ${widthClass} h-[350px] md:h-[480px] mr-[13px]`}
    >
      {/* Visual Container */}
      <div onClick={() => setNavigatingId(`product-${product.id || product._id}`)} className="w-full h-full bg-slate-50 border border-slate-200/80 rounded-none overflow-hidden relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-brand-blue/30 group-hover:shadow-[0_20px_40px_-15px_rgba(29,95,209,0.15)]">
      {navigatingId === `product-${product.id || product._id}` && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[16px]">
           <AppleSpinner size={32} className="text-[#0071e3]" />
        </div>
      )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"></div>
        {firstPhoto ? (
          <Image src={getOptimizedUrl(firstPhoto)} alt={product.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover z-10" priority unoptimized />
        ) : (
          <div className="text-slate-400 font-mono text-[12px] flex flex-col items-center gap-2 relative z-10">
            <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">?</span>
            NO_PREVIEW
          </div>
        )}
        
        {/* Hover UI Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-30 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-brand-navy font-sans text-[13px] font-semibold tracking-tight shadow-sm">
            {idx % 4 === 0 ? "7 Days Delivery" : idx % 4 === 1 ? "15 Days Delivery" : idx % 4 === 2 ? "3 Days Delivery" : "1 Month Delivery"}
          </div>
          <div 
            className="bg-brand-blue hover:bg-blue-600 text-white px-5 py-2 rounded-full font-sans text-[13px] font-semibold tracking-tight shadow-lg shadow-brand-blue/30 flex items-center gap-2 cursor-pointer transition-colors"
            onMouseEnter={(e) => {
              e.stopPropagation();
              setIsHoveringBuyBtn(true);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setIsHoveringBuyBtn(false);
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Buy clicked for product:", product.id || product._id);
            }}
          >
            Buy Now <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
  };

  const formatPriceVal = (val) => {
    try {
      return Number(val).toLocaleString();
    } catch(e) {
      return val;
    }
  };

  return (
    <div className="w-full bg-white pt-10 pb-20 md:pt-16 md:pb-32 relative border-t border-slate-200 z-30 pointer-events-auto overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent"></div>
      
      <div className="max-w-[1400px] w-full mx-auto flex flex-col items-center text-center px-6 md:px-12 mb-16 relative z-10">
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-brand-navy dark:text-brand-navy text-[24px] min-[380px]:text-[28px] md:text-[40px] lg:text-[48px] font-display font-medium leading-[1.2] tracking-tight max-w-5xl text-balance mx-auto">
            Explore our store and buy your website <span className="text-slate-400 dark:text-slate-500 whitespace-normal md:whitespace-nowrap">just like an ecommerce store.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-500 font-sans text-[15px] min-[380px]:text-[16px] md:text-[18px] max-w-3xl leading-[1.6] text-balance mx-auto mt-2">
            Pick a website, and we will handle the customization, content upload, and deployment according to your brand at NO extra cost.
          </p>
        </div>
      </div>
      
      {/* Custom Cursor Overlay */}
      <motion.div 
        className={`fixed top-0 left-0 w-24 h-24 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-navy font-display text-[13px] font-bold tracking-widest pointer-events-none z-[100] transition-all duration-200 ease-out shadow-xl ${(isHovering && !isHoveringBuyBtn) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%", transitionProperty: 'opacity, transform, background-color' }}
      >
        DETAILS
      </motion.div>

      {/* Marquee Layout */}
      <div 
        className="w-full relative z-10 overflow-hidden group/marquee"
        onMouseMove={(e) => {
          cursorX.set(e.clientX);
          cursorY.set(e.clientY);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .carousel-row-top { --card-width: 85vw; }
          .carousel-row-bottom { --card-width: 60vw; }
          
          /* Apple-style mobile swiper */
          @media (max-width: 767px) {
            .mobile-snap-container {
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              scrollbar-width: none;
              padding-left: calc(50vw - (var(--card-width) / 2));
              padding-right: calc(50vw - (var(--card-width) / 2));
            }
            .mobile-snap-container::-webkit-scrollbar {
              display: none;
            }
            .mobile-snap-container > a {
              scroll-snap-align: center;
            }
            .mobile-disable-transform {
              transform: none !important;
              transition: none !important;
            }
          }

          @media (min-width: 768px) {
            .carousel-row-top { --card-width: 40vw; }
            .carousel-row-bottom { --card-width: 28.5vw; }
          }
        ` }} />
        
        <div className="flex flex-col gap-[13px] w-full">
          {/* Top Row: 2.5 visible items => ~40vw each (Desktop) / Apple Swiper (Mobile) */}
          <div 
            ref={topScrollRef}
            className="flex relative w-full md:w-max mobile-snap-container carousel-row-top mobile-disable-transform"
            style={{ 
              transform: `translateX(calc(-${topIndex} * (var(--card-width) + 13px)))`,
              transition: topIsTransitioning ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
          >
            {row1Marquee.map((product, idx) => renderCard(product, idx, 'w-[85vw] md:w-[40vw]'))}
          </div>

          {/* Bottom Row: 3.5 visible items => ~28.5vw each (Desktop) / Apple Swiper (Mobile) */}
          <div 
            ref={bottomScrollRef}
            className="flex relative w-full md:w-max mobile-snap-container carousel-row-bottom mobile-disable-transform"
            style={{ 
              transform: `translateX(calc(-${bottomIndex} * (var(--card-width) + 13px)))`,
              transition: bottomIsTransitioning ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
          >
            {row2Marquee.map((product, idx) => renderCard(product, idx, 'w-[60vw] md:w-[28.5vw]'))}
          </div>
        </div>
      </div>
      
      {/* Bottom Action & Custom Project CTA */}
      <div className="w-full max-w-[1400px] mx-auto mt-24 mb-12 px-6 md:px-12 relative z-10">
        <div className="group flex flex-col relative">

          <div className="relative z-10 flex flex-col w-full mb-10 overflow-hidden">
            <h3 className="text-brand-navy dark:text-brand-navy text-[17px] min-[350px]:text-[18px] min-[375px]:text-[20px] min-[410px]:text-[22px] min-[480px]:text-[26px] sm:text-[34px] md:text-[40px] lg:text-[48px] xl:text-[52px] font-display font-semibold leading-[1.15] tracking-tight mb-4 whitespace-nowrap overflow-visible">
              Need something completely custom?
            </h3>
            <p className="text-slate-600 dark:text-slate-600 font-sans text-[15px] md:text-[18px] leading-relaxed max-w-full font-light">
              Got a unique idea? Whether it&apos;s a custom web app or a scalable SaaS platform, we build it from scratch. Tell us your vision, and we&apos;ll handle the rest.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full border-t border-brand-navy/[0.08] dark:border-brand-navy/[0.08] pt-10 gap-8 lg:gap-0">
            
            {/* Human Touch Vibe - Solo Founder */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full border-[3px] border-white dark:border-white shadow-sm overflow-hidden">
                {/* Just replace this URL with your actual professional photo */}
                <Image src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&auto=format&fit=crop&q=80" alt="Founder & Lead Architect" fill sizes="56px" className="object-cover" unoptimized />
                {/* Green online status dot */}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-white rounded-full z-10"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-navy dark:text-brand-navy font-sans text-[16px] font-semibold tracking-tight">Talk directly to the Founder</span>
                <span className="text-brand-blue dark:text-brand-blue font-sans text-[14px]">Available for discovery calls</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full lg:w-auto shrink-0">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/submit-brief');
                }}
                className="bg-white dark:bg-white hover:bg-slate-50 dark:hover:bg-slate-50 border border-slate-200 dark:border-slate-200 text-brand-navy dark:text-brand-navy px-4 min-[350px]:px-8 py-3 min-[350px]:py-4 rounded-full font-sans text-[13px] min-[350px]:text-[15px] font-semibold transition-all duration-300 flex items-center justify-center w-full sm:w-auto shadow-sm whitespace-nowrap"
              >
                Submit Project Brief
              </button>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/book-call');
                }}
                className="bg-brand-navy dark:bg-brand-navy text-white dark:text-white hover:bg-brand-blue dark:hover:bg-brand-blue px-4 min-[350px]:px-8 py-3 min-[350px]:py-4 rounded-full font-sans text-[13px] min-[350px]:text-[15px] font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-navy/10 transform hover:-translate-y-1 w-full sm:w-auto whitespace-nowrap"
              >
                Book a Strategy Call <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePreviewSection;

