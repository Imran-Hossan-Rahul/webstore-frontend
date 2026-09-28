"use client";
import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Edit, Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Gamepad2, Tv, BatteryCharging, Shield, ChevronLeft, ChevronRight, Star, Check, ArrowRight, Network, ShoppingCart, Server, Rocket, MonitorPlay, Sparkles } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import MarketSEOContent from "./MarketSEOContent";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { PRODUCT_TYPE_COLORS } from "@/utils/digitalProducts";

import TechnicalBackground from "@/components/ui/TechnicalBackground";
import TechParticles from "@/components/ui/TechParticles";
import ServicesStoryteller from "./ServicesStoryteller";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

// Cloudinary optimization for free extreme performance
const getOptimizedUrl = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_auto,w_600/${parts[1]}`;
    }
  }
  return url;
};

// Custom Animated Brush Underline (Engineered to match the specific swoosh aesthetic)
const BrushUnderline = ({ colorClass, delay }) => {
  return (
    <div className="absolute left-0 -bottom-1.5 md:-bottom-2 w-full h-[10px] md:h-[12px] pointer-events-none flex items-center justify-center overflow-hidden">
      <motion.svg
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className={`w-full h-full ${colorClass}`}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main thick brush body */}
        <path d="M 2 9 L 6 3 Q 50 1 96 4 L 100 8 Q 50 6 2 9 Z" fill="currentColor" />
        {/* Left bristle detail */}
        <path d="M 0 10 L 4 5 Q 15 4 25 4 Q 15 6 0 10 Z" fill="currentColor" opacity="0.8" />
        {/* Right bristle detail */}
        <path d="M 75 5 Q 85 5 98 7 L 94 10 Q 85 7 75 5 Z" fill="currentColor" opacity="0.8" />
      </motion.svg>
    </div>
  );
};

const ElectronicCurrentText = ({ delay = 3.8 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className="fixed z-0 left-0 right-0 flex justify-center pointer-events-none"
      style={{ top: 'calc(50vh + 90px)' }}
    >
      <motion.div
        className="font-mono text-[10px] md:text-[12px] font-semibold tracking-[0.3em] uppercase text-transparent bg-clip-text"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(100,116,139,0.4) 0%, rgba(100,116,139,0.4) 40%, rgba(255,255,255,0.8) 47%, rgba(255,255,255,1) 50%, rgba(34,211,238,1) 53%, rgba(100,116,139,0.4) 60%, rgba(100,116,139,0.4) 100%)",
          backgroundSize: "400% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        animate={{
          backgroundPosition: ["100% 0%", "0% 0%"]
        }}
        transition={{
          duration: 3.5,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 1.5
        }}
      >
        Build ➔ Launch ➔ Maintain ➔ Improve
      </motion.div>
    </motion.div>
  );
};

const ProcessSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rawRotate = useTransform(scrollYProgress, [0, 0.8, 1], [0, -360, -360]);
  const carouselRotate = useSpring(rawRotate, { 
    stiffness: 40, 
    damping: 20, 
    mass: 0.8,
    restDelta: 0.001
  });

  const stepData = [
    {
      id: "01",
      title: "Buy / Order & Customize",
      subtitle: "Tailoring to your brand",
      description: "First, you buy the product or place an order. We then meticulously customize the system, adapting the design, features, and identity to perfectly match your brand vision.",
      chips: ["Custom Branding", "Feature Adaptation", "Full UI Retouch"],
      icon: <ShoppingCart size={28} className="text-brand-cyan" />
    },
    {
      id: "02",
      title: "Deploy & Live Launch",
      subtitle: "Production deployment",
      description: "Once customized and thoroughly tested, our engineering team handles full deployment to your live server, ensuring ironclad stability, speed, and security.",
      chips: ["Cloud Architecture", "DNS & SSL Setup", "Performance Tuning"],
      icon: <Rocket size={28} className="text-brand-cyan" />
    },
    {
      id: "03",
      title: "1 Month Free Care",
      subtitle: "Handover & stabilization",
      description: "We provide 30 days of completely free maintenance. We resolve any post-launch issues, assist with database & content uploads, and hand over complete control if you wish.",
      chips: ["30-Day Free Support", "Bug Fixes & Uploads", "Smooth Handover"],
      icon: <Shield size={28} className="text-brand-cyan" />
    },
    {
      id: "04",
      title: "Ongoing Maintenance",
      subtitle: "3, 6, or 12 Month Contracts",
      description: "Keep your platform healthy long-term with structured care plans. We perform regular software upgrades, daily monitoring, security patches, and continuous improvements.",
      chips: ["Daily Monitoring", "Regular Upgrades", "Priority SLA"],
      icon: <MonitorPlay size={28} className="text-brand-cyan" />
    }
  ];

  return (
    <div ref={containerRef} className="h-[500vh] w-full relative bg-[#030712] border-t border-brand-navy/[0.08] dark:border-white/5">
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden py-12 px-6">
      {/* Background Atmosphere - Hero Style */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden">
        {/* Deep Tech Subtle Radial Glow Behind Particles */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-brand-blue/15 blur-[120px] rounded-full"></div>
        
        <TechParticles scatterOnly={true} />
        
        {/* 3D Ground Plane Grid (Cyberspace Floor) */}
        <div 
          className="absolute left-0 right-0 bottom-0 overflow-hidden z-0 pointer-events-none" 
          style={{ top: '58vh', perspective: '800px', transformStyle: 'preserve-3d' }}
        >
          <div 
            className="absolute left-[-50%] right-[-50%] top-0 h-[200vh]" 
            style={{ 
              transform: 'rotateX(75deg)',
              transformOrigin: 'top center',
              backgroundSize: '80px 80px',
              backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)`,
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)'
            }}>
          </div>
        </div>
      </div>


      {/* 3D Carousel Stage */}
      <div 
        className="relative z-20 w-full mx-auto flex items-center justify-center h-[350px] md:h-[450px]" 
        style={{ perspective: "1200px" }}
      >
        <motion.div
          style={{ rotateY: carouselRotate, transformStyle: "preserve-3d", willChange: "transform" }}
          className="relative w-[300px] md:w-[350px] h-[360px] md:h-[400px] scale-[0.6] sm:scale-75 md:scale-100 cursor-grab active:cursor-grabbing"
        >
          {stepData.map((step, index) => {
            const rotateY = index * 90; // 0, 90, 180, 270
            return (
              <div
                key={step.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: `rotateY(${rotateY}deg) translateZ(300px)`,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Front Face */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#060d1d] border-2 border-brand-cyan/40 hover:border-brand-cyan/70 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9),_0_0_20px_rgba(34,199,232,0.15)] flex flex-col transition-colors duration-300"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* Cyber Corner Accents */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-brand-cyan/40"></div>
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-brand-cyan/40"></div>
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-brand-cyan/40"></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-brand-cyan/40"></div>

                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,199,232,0.2)]">
                        {step.icon}
                      </div>
                      <div>
                        <span className="text-brand-cyan font-mono text-[10px] uppercase tracking-wider block font-medium">
                          {step.subtitle}
                        </span>
                        <h3 className="text-white font-display text-[18px] md:text-[20px] font-bold tracking-tight leading-tight mt-1">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <div className="font-mono text-[24px] md:text-[30px] font-black text-brand-cyan/25 select-none">
                      {step.id}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 font-sans text-[13px] md:text-[14px] leading-relaxed mb-6 font-light">
                    {step.description}
                  </p>

                  {/* Chips / Deliverables */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.08] mt-auto">
                    {step.chips.map((chip, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-brand-cyan/90 font-mono text-[10px] flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-brand-cyan"></span>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Back Face */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#030712] border-2 border-brand-cyan/20 rounded-3xl flex items-center justify-center shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="w-24 h-24 bg-brand-cyan/10 rounded-full blur-2xl absolute"></div>
                  <span className="text-brand-cyan/10 font-black text-8xl font-mono tracking-tighter select-none">{step.id}</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Interactive Scroll Helper Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-500 text-[11px] font-mono uppercase tracking-widest pt-1 z-30">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping"></span>
        <span>Scroll to Rotate</span>
      </div>

      </div>
    </div>
  );
};


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
      return typeof formatPrice === 'function' ? formatPrice(val) : Number(val).toLocaleString();
    } catch(e) {
      return val;
    }
  };

  return (
    <div className="w-full py-16 md:py-24 relative border-t border-brand-navy/[0.08] dark:border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-6 md:px-12 gap-6 max-w-[1400px] mx-auto">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 px-6 md:px-12 max-w-[1400px] mx-auto">
        
        {/* Main Featured Product (Wide) */}
        {featured && (
          <div className="sm:col-span-2 lg:col-span-6 flex flex-col group relative">
            <Link href={`/product/${featured.id || featured._id}`} className="absolute inset-0 z-10"></Link>
            
            {/* Visual Area */}
            <div className="w-full aspect-[16/9] lg:aspect-auto lg:h-[420px] bg-brand-surface dark:bg-brand-surface rounded-[8px] border border-brand-navy/[0.08] dark:border-white/10 p-8 md:p-12 flex items-center justify-center overflow-hidden mb-5 transition-colors duration-500 group-hover:border-brand-blue/30 relative">
              <div className="absolute inset-0 bg-brand-cloud/50 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {featured.photos && JSON.parse(featured.photos)[0] ? (
                <img 
                  src={getOptimizedUrl(JSON.parse(featured.photos)[0])}
                  alt={featured.title}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-all duration-700 ease-out group-hover:scale-[1.02] relative z-10"
                />
              ) : (
                <span className="font-mono text-slate-400">NO_IMAGE</span>
              )}
            </div>
            
            {/* Metadata Area */}
            <div className="flex flex-col px-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                <h3 className="text-[24px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300 leading-tight">
                  {featured.title}
                </h3>
                <div className="flex flex-col items-start md:items-end shrink-0">
                  <span className="text-[18px] font-sans font-medium text-brand-navy dark:text-white">
                    BDT {formatPriceVal(featured.selling_price)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between opacity-80 pt-3 border-t border-slate-100 dark:border-white/5">
                <p className="text-[14px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm leading-relaxed font-sans">
                  {featured.description ? featured.description.replace(/<[^>]*>?/gm, '') : 'Premium digital asset engineered for scale.'}
                </p>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors shrink-0">
                  View Product <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Products (Narrow) */}
        {secondary.map((product) => (
          <div key={product.id || product._id} className="col-span-1 lg:col-span-2 flex flex-col group relative">
            <Link href={`/product/${product.id || product._id}`} className="absolute inset-0 z-10"></Link>
            
            {/* Visual Area */}
            <div className="w-full aspect-[4/3] lg:aspect-auto lg:h-[420px] bg-brand-surface dark:bg-brand-surface rounded-[8px] border border-brand-navy/[0.08] dark:border-white/10 p-5 flex items-center justify-center overflow-hidden mb-5 transition-colors duration-500 group-hover:border-brand-blue/30 relative">
              <div className="absolute inset-0 bg-brand-cloud/50 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {product.photos && JSON.parse(product.photos)[0] ? (
                <img 
                  src={getOptimizedUrl(JSON.parse(product.photos)[0])}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-all duration-700 ease-out group-hover:scale-[1.03] relative z-10"
                />
              ) : (
                <span className="font-mono text-slate-400">NO_IMAGE</span>
              )}
            </div>
            
            {/* Metadata Area */}
            <div className="flex flex-col px-1 flex-1">
              <div className="flex flex-col gap-2 mb-2">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest line-clamp-1">
                  {product.productType || 'Asset'}
                </span>
                <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300 line-clamp-2 leading-[1.3]" style={{ minHeight: 'calc(1.3 * 16px * 2)' }}>
                  {product.title}
                </h3>
              </div>
              
              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[14px] font-sans font-semibold text-brand-navy dark:text-white shrink-0">
                  BDT {formatPriceVal(product.selling_price)}
                </span>
                <span className="opacity-0 group-hover:opacity-100 flex items-center text-[12px] font-semibold text-brand-navy dark:text-white group-hover:text-brand-blue transition-all duration-300">
                  <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* See All */}
      {secondary.length > 0 && (
        <div className="mt-12 flex justify-center max-w-[1400px] mx-auto px-6">
           <Link href="/shop" className="text-[13px] font-semibold text-brand-slate dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors flex items-center gap-1.5 group relative z-20">
             Browse all products <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
           </Link>
        </div>
      )}
    </div>
  );
};

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

export default function MarketClientView({ initialData = [], initialPagination = { pages: 1, currentPage: 1 }, initialFeatured = [], initialPopular = [] }) {
  const [products, setProducts] = useState(initialData.filter(p => p.status === 'Live'));
  const [featuredProducts, setFeaturedProducts] = useState(initialFeatured.filter(p => p.status === 'Live'));
  const [popularProducts, setPopularProducts] = useState(initialPopular.filter(p => p.status === 'Live'));
  const [likedProducts, setLikedProducts] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = React.useContext(DashboardContext) || {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [isPending, startTransition] = React.useTransition();
  const [loadingBuyId, setLoadingBuyId] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const isScrolledPastHeroRef = useRef(false);
  const [floorCoords, setFloorCoords] = useState({ y: 0, x: null, textWidth: 500 });
  const searchBarRef = useRef(null);

  useEffect(() => {
    const handleFloor = (e) => setFloorCoords({ y: e.detail.y, x: e.detail.x, textWidth: e.detail.textWidth || 500 });
    window.addEventListener('floor-position', handleFloor);
    return () => window.removeEventListener('floor-position', handleFloor);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;
      
      const rect = searchBarRef.current.getBoundingClientRect();
      // Trigger when the element reaches exactly 80px from the top of the viewport 
      // (navbar is 52px, so this is just as it starts to slide underneath)
      const scrolled = rect.top < 80;
      
      if (scrolled !== isScrolledPastHeroRef.current) {
          isScrolledPastHeroRef.current = scrolled;
          window.dispatchEvent(new CustomEvent('toggle-navbar-search', { detail: scrolled }));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateCart = () => {
      try {
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) setCartItems(JSON.parse(cartStr));
      } catch (e) {}
    };
    updateCart();
    window.addEventListener('addedToCart', updateCart);
    window.addEventListener('cartUpdated', updateCart);
    return () => {
      window.removeEventListener('addedToCart', updateCart);
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const heroSlides = [];
  const bottomBanners = [];

  const bottomScrollRef = useRef(null);
  const topScrollRef = useRef(null);

  useEffect(() => {

    api.get('/market/banners').catch(() => {}); // Just ping it in background if needed, but ignore result

    api.get('/market/categories')
      .then(res => {
        setCategories(res.categories || res.data || []);
      })
      .catch(err => console.error("Failed to load categories:", err));

    // Fallback: If SSR failed (common on Windows local with IPv6 localhost resolution), fetch on client mount
    if (initialData.length === 0) {
      fetchProducts(1, true);
    }
    if (initialFeatured.length === 0) {
      setLoadingFeatured(true);
      api.get('/market/products?isFeatured=true&limit=10&status=Live').then(res => setFeaturedProducts((res.data || []).filter(p => p.status === 'Live'))).catch(console.error).finally(() => setLoadingFeatured(false));
    }
    if (initialPopular.length === 0) {
      setLoadingPopular(true);
      api.get('/market/products?isPopular=true&limit=10&status=Live').then(res => setPopularProducts((res.data || []).filter(p => p.status === 'Live'))).catch(console.error).finally(() => setLoadingPopular(false));
    }
  }, [initialData.length, initialFeatured.length, initialPopular.length]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const leafCategories = React.useMemo(() => {
    let leaves = [];
    categories.forEach(cat => {
      const subcats = cat.subcategories || [];
      if (subcats.length === 0) {
        leaves.push({ ...cat, paramKey: 'category_id' });
      } else {
        subcats.forEach(sub => {
          const children = sub.subcategories || [];
          if (children.length === 0) {
            leaves.push({ ...sub, paramKey: 'subCategory_id' });
          } else {
            children.forEach(child => {
              leaves.push({ ...child, paramKey: 'childCategory_id' });
            });
          }
        });
      }
    });
    return leaves;
  }, [categories]);

  useEffect(() => {
    if (bottomScrollRef.current && bottomScrollRef.current.children.length > currentSlide) {
      const targetChild = bottomScrollRef.current.children[currentSlide];
      const childWidth = targetChild.getBoundingClientRect().width;
      const gap = window.innerWidth >= 768 ? 10 : (window.innerWidth >= 640 ? 0 : 2); // gap is 10px on md/lg, 2px on mobile
      const scrollPos = currentSlide * (childWidth + gap);
      bottomScrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
    if (topScrollRef.current && topScrollRef.current.children.length > currentSlide) {
      const targetChild = topScrollRef.current.children[currentSlide];
      const childWidth = targetChild.getBoundingClientRect().width;
      const scrollPos = currentSlide * childWidth;
      topScrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [currentSlide]);

  const [page, setPage] = useState(initialPagination.currentPage || 1);
  const [hasMore, setHasMore] = useState((initialPagination.currentPage || 1) < (initialPagination.pages || 1));
  const [loading, setLoading] = useState(initialData.length === 0);
  const [loadingFeatured, setLoadingFeatured] = useState(initialFeatured.length === 0);
  const [loadingPopular, setLoadingPopular] = useState(initialPopular.length === 0);

  const fetchProducts = (pageNum, reset = false) => {
    setLoading(true);
    api.get(`/market/products?isLatest=true&page=${pageNum}&limit=17&status=Live`)
      .then(res => {
        // Backend now returns { data, pagination }
        const data = res.data || [];
        const pagination = res.pagination || {};
        const liveProducts = data.filter(p => p.status === 'Live');
        
        if (reset) {
            setProducts(liveProducts);
        } else {
            setProducts(prev => [...prev, ...liveProducts]);
        }
        
        if (pagination.currentPage >= pagination.pages) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
        
        if (user) {
          const initialLikes = {};
          liveProducts.forEach(p => {
            if (p.likedBy && p.likedBy.includes(user.id)) {
              initialLikes[p.id] = true;
            }
          });
          setLikedProducts(prev => ({ ...prev, ...initialLikes }));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Initialize likes when user context is ready
  useEffect(() => {
    if (user && (products.length > 0 || featuredProducts.length > 0 || popularProducts.length > 0)) {
      const initialLikes = {};
      [...products, ...featuredProducts, ...popularProducts].forEach(p => {
        if (p.likedBy && p.likedBy.includes(user.id)) {
          initialLikes[p.id] = true;
        }
      });
      setLikedProducts(prev => ({ ...prev, ...initialLikes }));
    }
  }, [user, products, featuredProducts, popularProducts]);

  const loadMore = () => {
    if (!loading && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, false);
    }
  };

  const toggleLike = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const currentlyLiked = likedProducts[productId];
    setLikedProducts(prev => ({ ...prev, [productId]: !currentlyLiked }));
    try {
      await api.put(`/market/products/${productId}/like`, {});
    } catch (err) {
      setLikedProducts(prev => ({ ...prev, [productId]: currentlyLiked }));
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const prodId = product.id || product._id;
    setLoadingCartId(prodId);
    
    setTimeout(() => {
      try {
        const cartStr = localStorage.getItem('cartIds');
        let cartIds = [];
        if (cartStr) cartIds = JSON.parse(cartStr);
        if (!cartIds.includes(prodId.toString())) {
          cartIds.push(prodId.toString());
          localStorage.setItem('cartIds', JSON.stringify(cartIds));
        }
        
        const detailsStr = localStorage.getItem('cartDetails');
        let cartDetails = detailsStr ? JSON.parse(detailsStr) : {};
        
        cartDetails[prodId.toString()] = {
          variants: '',
          finalPrice: product.selling_price
        };
        localStorage.setItem('cartDetails', JSON.stringify(cartDetails));
        
      } catch(err) {}
      
      window.dispatchEvent(new CustomEvent('addedToCart'));
      setLoadingCartId(null);
    }, 400);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    const prodId = product.id || product._id;
    if (prodId) {
      setLoadingBuyId(prodId);
      startTransition(() => {
        router.push(`/product/${prodId}`);
      });
    }
  };

  const displayedProducts = query 
    ? products.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query) || 
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
    : products;

  const renderProductCard = (product) => {
    const isAdded = cartItems.includes((product.id || product._id)?.toString());
    
    return (
      <div key={product.id} className="bg-brand-surface dark:bg-brand-surface rounded-[8px] transition-all duration-300 overflow-hidden border border-brand-navy/[0.08] dark:border-white/10 flex flex-col relative group hover:shadow-[1px_1px_10px_rgba(11,37,69,0.02)] dark:hover:shadow-none dark:hover:border-white/20/50">
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
      {product.photos && JSON.parse(product.photos)[0] ? (
        <div className="aspect-square w-full bg-brand-cloud dark:bg-brand-dark flex items-center justify-center p-4 overflow-hidden relative border-b border-slate-100 dark:border-white/10">
          <img 
            src={getOptimizedUrl(JSON.parse(product.photos)[0])} 
            alt={product.title} 
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link 
              href={`/admin/market/products?edit=${product.id}`}
              className="absolute top-2 right-2 bg-brand-surface/90 p-2 rounded-[4px] text-brand-blue hover:bg-brand-blue hover:text-white transition shadow-sm border border-brand-navy/[0.08] z-20"
              onClick={(e) => e.stopPropagation()}
              title="Edit Product"
            >
              <Edit size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="aspect-square w-full bg-brand-cloud dark:bg-brand-dark flex items-center justify-center text-brand-slate dark:text-slate-300/50 text-[13px] border-b border-slate-100 dark:border-white/10 font-mono">
          NO_IMAGE
        </div>
      )}
      <div className="p-4 flex flex-col flex-1 bg-transparent">
        {product.productType && (
          <span className={`inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] mb-2 self-start ${PRODUCT_TYPE_COLORS[product.productType] || 'bg-slate-100 dark:bg-brand-surface/[0.05] text-slate-600 dark:text-slate-300 dark:bg-brand-surface/10 dark:text-slate-300'}`}>
            {product.productType}
          </span>
        )}
        <h3 className="font-medium text-[15px] text-brand-navy dark:text-white leading-[1.4] mb-2 line-clamp-2" style={{ minHeight: 'calc(1.4 * 15px * 2)' }}>{product.title}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[15px] font-semibold text-brand-navy dark:text-white">BDT {formatPrice(product.selling_price)}</span>
          {Number(product.original_price) > Number(product.selling_price) && (
            <span className="text-[13px] text-slate-400 line-through">BDT {formatPrice(product.original_price)}</span>
          )}
        </div>
        <div className="w-full flex flex-row gap-2 mt-auto relative z-20">
          <button 
            onClick={(e) => {
              if (isAdded) {
                e.preventDefault();
                e.stopPropagation();
                router.push('/cart');
              } else {
                handleAddToCart(e, product);
              }
            }}
            disabled={loadingCartId === (product.id || product._id)}
            className={`flex-auto text-white py-2 px-3 text-[13px] font-sans font-medium rounded-[4px] transition-colors duration-200 flex items-center justify-center gap-1.5 disabled:opacity-80 disabled:cursor-not-allowed z-20 ${
              isAdded ? 'bg-brand-teal hover:bg-brand-teal/90' : 'bg-brand-blue hover:bg-brand-blue/90'
            }`}
          >
            {loadingCartId === (product.id || product._id) ? (
              <AppleSpinner size={16} className="text-white" />
            ) : isAdded ? (
              <><Check size={14} /> Added</>
            ) : (
              "Add to Cart"
            )}
          </button>
          <button 
            onClick={(e) => handleBuyNow(e, product)}
            disabled={isPending && loadingBuyId === (product.id || product._id)}
            className="flex-auto bg-transparent border border-brand-navy/[0.08] dark:border-white/20 text-brand-navy dark:text-white py-2 px-3 text-[13px] font-sans font-medium rounded-[4px] transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-blue dark:hover:text-brand-blue flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isPending && loadingBuyId === (product.id || product._id) ? (
              <AppleSpinner size={16} className="text-brand-navy dark:text-white" />
            ) : (
              <>
                <span>{product.productType ? 'Get Now' : 'Buy Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-brand-main">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />

      
      
      {/* World-Class Premium Hero Section */}
      {!query && (
        <div className="relative w-full min-h-[100vh] flex flex-col items-center justify-start border-b border-white/[0.05]">
          
          {/* Fixed Background for Parallax Effect */}
          <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden">
            {/* Background Effects - Ultra Premium Glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full"></div>
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full"></div>
            
            {/* Deep Tech Subtle Radial Glow Behind Particles */}
            {/* Deep Tech Subtle Radial Glow Behind Particles */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 3.5, ease: "easeOut", delay: 3.5 }}
              className="absolute top-[45vh] -translate-y-1/2 w-[600px] h-[500px] bg-brand-blue/15 blur-[120px] rounded-full z-0 pointer-events-none" 
              style={{ left: floorCoords.x ? `${floorCoords.x}px` : '50%', transform: 'translate(-50%, -50%)' }}
            ></motion.div>
            
            <TechParticles />
            
            {/* 3D Ground Plane Grid (Cyberspace Floor) */}
            <div 
              className="absolute left-0 right-0 bottom-0 overflow-hidden z-0 pointer-events-none" 
              style={{ top: floorCoords.y ? `${floorCoords.y}px` : '58vh', perspective: '800px', transformStyle: 'preserve-3d' }}
            >
              <motion.div 
                initial={{ rotateX: -20, z: 1200, y: -200, scale: 1.5, opacity: 0 }}
                animate={{ rotateX: 75, z: 0, y: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.05, 1, 0.1, 1], delay: 0.1 }}
                className="absolute left-[-50%] right-[-50%] top-0 h-[200vh]" 
                style={{ 
                  transformOrigin: floorCoords.x ? `${floorCoords.x + (typeof window !== 'undefined' ? window.innerWidth : 1920) * 0.5}px top` : 'top center',
                  backgroundSize: '80px 80px',
                  backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)`,
                  maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)'
                }}>
              </motion.div>
            </div>

            {/* Sharp Horizon Line */}
            <motion.div 
              initial={{ opacity: 0, scaleX: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, scaleX: 1, filter: "blur(1px)" }}
              transition={{ duration: 0.6, ease: "circOut", delay: 0.8 }}
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/80 to-transparent z-0 pointer-events-none origin-center" 
              style={{ top: floorCoords.y ? `${floorCoords.y}px` : '58vh' }}
            ></motion.div>

            {/* Letter-Specific Synchronized Reflection Glows */}
            <div 
              className="absolute h-[100px] z-0 pointer-events-none origin-bottom"
              style={{ 
                width: floorCoords.textWidth ? `${floorCoords.textWidth}px` : '500px',
                top: floorCoords.y ? `${floorCoords.y - 10}px` : '57vh', 
                left: floorCoords.x ? `${floorCoords.x}px` : '50%', 
                transform: 'translateX(-50%) perspective(800px) rotateX(75deg)' 
              }}
            >
              {/* Phase 1: 'a', 'i', 'a' (1.5s) */}
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 1.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '46%', width: '12%' }}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 1.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '66%', width: '6%' }}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 1.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '86%', width: '14%' }}></motion.div>

              {/* Phase 2: 'o', 'n' (2.5s) */}
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 2.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '17%', width: '14%' }}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 2.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '72%', width: '14%' }}></motion.div>

              {/* Phase 3: 'C', 'd', 'l' (3.5s) */}
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut", delay: 3.5 }} className="absolute top-0 h-full bg-brand-cyan/30 blur-[30px] rounded-full" style={{ left: '0%', width: '17%' }}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut", delay: 3.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '31%', width: '14%' }}></motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut", delay: 3.5 }} className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full" style={{ left: '59%', width: '7%' }}></motion.div>
            </div>
          </div>
          
          {/* Electronic Current Text Below Codalina */}
          <ElectronicCurrentText delay={3.8} />
          
          {/* Scrollable Overlay Content */}
          <div className="relative z-10 w-full flex flex-col items-center pointer-events-none">
            
            {/* Transparent spacer to show the fixed Codalina background initially. 
                85vh means the next section will peek 15vh from the bottom. */}
            <div className="w-full" style={{ height: '85vh' }}></div>

            {/* Solid Black Content Block that scrolls over the fixed background */}
            <div className="w-full bg-black z-30 pointer-events-auto rounded-t-[32px] border-t border-white/[0.05] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
              
              {/* Tagline Section - Big Centered Text */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full py-24 md:py-32 px-6 flex flex-col items-center justify-center max-w-6xl mx-auto"
              >
                <h2 className="text-[32px] md:text-[48px] lg:text-[60px] font-display font-medium text-white text-center leading-[1.2] lg:leading-[1.1] tracking-tight">
                  We partner with you to build, launch, maintain, and continuously improve your{" "}
                  <span className="relative inline-block group px-1 md:px-2">
                    <span className="relative z-10 text-white group-hover:text-brand-cyan transition-colors duration-500">websites</span>
                    <BrushUnderline colorClass="text-brand-cyan" delay={0.2} />
                  </span>,{" "}
                  <span className="relative inline-block group px-1 md:px-2">
                    <span className="relative z-10 text-white group-hover:text-brand-cyan transition-colors duration-500">SaaS</span>
                    <BrushUnderline colorClass="text-brand-cyan" delay={0.4} />
                  </span>, and{" "}
                  <span className="relative inline-block group px-1 md:px-2">
                    <span className="relative z-10 text-white group-hover:text-brand-cyan transition-colors duration-500">web applications</span>
                    <BrushUnderline colorClass="text-brand-cyan" delay={0.6} />
                  </span>{" "}
                  <span className="text-slate-400">with dedicated care long after launch.</span>
                </h2>
              </motion.div>

              <ServicesStoryteller />
          </div>
          </div>
        </div>
      )}
      
      {/* Content Below Hero */}
      <div className="relative z-10 w-full bg-brand-main">






      {/* Product Lifecycle Process Section */}
      {!query && <ProcessSection />}

      {/* Editorial Product Showcase */}
      {!query && (
        <EditorialProductShowcase 
          products={displayedProducts.length > 0 ? displayedProducts : popularProducts} 
          isLoading={loading && displayedProducts.length === 0} 
        />
      )}


      
      {/* Search Empty State */}
      {query && displayedProducts.length === 0 && (
        <div className="text-center py-20 bg-brand-cloud dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/5 w-full my-8">
          <h3 className="text-lg font-semibold text-brand-navy dark:text-white">No products found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search query</p>
        </div>
      )}
      
      {/* Search Results */}
      {query && displayedProducts.length > 0 && (
        <EditorialProductShowcase 
          products={displayedProducts} 
          isLoading={loading} 
        />
      )}




      
      <MarketSEOContent />
      </div>
    </div>
  );
}
