"use client";
import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Edit, Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Gamepad2, Tv, BatteryCharging, Shield, ChevronLeft, ChevronRight, Star, Check, ArrowRight } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import MarketSEOContent from "./MarketSEOContent";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { getCategoryIcon } from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import { PRODUCT_TYPE_COLORS } from "@/utils/digitalProducts";

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

const ProcessSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const start = windowHeight * 0.8;
      const end = windowHeight * 0.3;
      
      if (rect.top > start) {
        setScrollProgress(0);
        setActiveIndex(0);
      } else if (rect.top < end) {
        setScrollProgress(100);
        setActiveIndex(3);
      } else {
        const progress = ((start - rect.top) / (start - end)) * 100;
        setScrollProgress(progress);
        
        if (progress < 25) setActiveIndex(0);
        else if (progress < 50) setActiveIndex(1);
        else if (progress < 75) setActiveIndex(2);
        else setActiveIndex(3);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stages = [
    { num: '01', title: 'BUILD', desc: 'We design and engineer the foundation.' },
    { num: '02', title: 'LAUNCH', desc: 'We ship a stable, usable product.' },
    { num: '03', title: 'MAINTAIN', desc: 'We keep the system healthy and up to date.' },
    { num: '04', title: 'IMPROVE', desc: 'We continuously evolve the product.' }
  ];

  return (
    <div ref={sectionRef} className="w-full py-20 md:py-32 relative border-t border-slate-200 dark:border-white/5">
      <div className="flex flex-col mb-16 px-6 md:px-12 text-center items-center">
        <span className="text-[12px] font-mono font-medium tracking-widest text-brand-cyan uppercase mb-4">Partnership Model</span>
        <h2 className="text-[32px] md:text-[40px] font-display font-medium text-brand-navy dark:text-white leading-tight">
          Engineered for the long term.
        </h2>
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-6 md:px-0">
        {/* Connection Line Background */}
        <div className="absolute top-[28px] left-[12.5%] right-[12.5%] h-[1px] bg-slate-200 dark:bg-white/10 hidden md:block"></div>
        
        {/* Connection Line Progress */}
        <div 
          className="absolute top-[28px] left-[12.5%] h-[1px] bg-brand-blue hidden md:block transition-all duration-300 ease-out shadow-[0_0_10px_rgba(29,95,209,0.5)]"
          style={{ width: `${scrollProgress * 0.75}%` }}
        ></div>

        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-12 md:gap-0">
          {stages.map((stage, idx) => {
            const isActive = activeIndex >= idx;
            const isCurrent = activeIndex === idx;
            return (
              <div key={stage.num} className="flex-1 flex flex-col items-center text-center group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-700 mb-6 bg-brand-cloud dark:bg-[#0D1117] relative z-10 ${isActive ? 'border-brand-blue text-brand-blue' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'}`}>
                  <span className="text-[14px] font-mono font-semibold">{stage.num}</span>
                  {/* Subtle active ping */}
                  {isCurrent && <div className="absolute inset-0 rounded-full border border-brand-blue/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>}
                </div>
                <h3 className={`text-[18px] font-display font-semibold transition-colors duration-500 mb-3 ${isActive ? 'text-brand-navy dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {stage.title}
                </h3>
                <p className={`text-[14px] font-sans leading-relaxed max-w-[200px] transition-colors duration-500 ${isActive ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400/50 dark:text-slate-600'}`}>
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const EditorialProductShowcase = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center border-t border-slate-200 dark:border-white/5">
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
    <div className="w-full py-16 md:py-24 relative border-t border-slate-200 dark:border-white/5">
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
            <div className="w-full aspect-[4/3] bg-white dark:bg-[#0D1117] rounded-[4px] border border-slate-200 dark:border-white/10 p-8 md:p-12 flex items-center justify-center overflow-hidden mb-6 transition-colors duration-500 group-hover:border-brand-blue/30 relative">
              <div className="absolute inset-0 bg-brand-cloud/50 dark:bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {featured.photos && JSON.parse(featured.photos)[0] ? (
                <img 
                  src={getOptimizedUrl(JSON.parse(featured.photos)[0])}
                  alt={featured.title}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:-translate-y-2 relative z-10 drop-shadow-sm group-hover:drop-shadow-md"
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
        <div className="lg:col-span-5 flex flex-col gap-8 lg:border-l lg:border-slate-200 lg:dark:border-white/10 lg:pl-8">
          {secondary.map((product) => (
            <div key={product.id || product._id} className="flex-1 flex flex-col group relative">
              <Link href={`/product/${product.id || product._id}`} className="absolute inset-0 z-10"></Link>
              
              {/* Visual Area */}
              <div className="w-full aspect-[16/9] bg-white dark:bg-[#0D1117] rounded-[4px] border border-slate-200 dark:border-white/10 p-6 flex items-center justify-center overflow-hidden mb-4 transition-colors duration-500 group-hover:border-brand-blue/30 relative">
                <div className="absolute inset-0 bg-brand-cloud/50 dark:bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
          <Link href={viewAllLink} className="text-[13px] md:text-[14px] font-medium text-brand-navy dark:text-white bg-transparent border border-slate-200 dark:border-white/10 px-4 py-1.5 md:px-5 md:py-2 rounded-[4px] hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-blue dark:hover:text-brand-blue transition-colors">
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-5 z-10 bg-white/90 dark:bg-[#1d1d1f]/90 backdrop-blur border border-apple-hairline p-2 md:p-3 rounded-full shadow-sm text-apple-ink hover:scale-105 transition-transform"
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
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-5 z-10 bg-white/90 dark:bg-[#1d1d1f]/90 backdrop-blur border border-apple-hairline p-2 md:p-3 rounded-full shadow-sm text-apple-ink hover:scale-105 transition-transform"
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined') {
      // Calculate from -1 to 1 based on screen size
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    }
  };

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
      <div key={product.id} className="bg-white dark:bg-[#0D1117] rounded-[8px] transition-all duration-300 overflow-hidden border border-slate-200 dark:border-[#30363D] flex flex-col relative group hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:hover:shadow-none dark:hover:border-[#8B949E]/50">
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
      {product.photos && JSON.parse(product.photos)[0] ? (
        <div className="aspect-square w-full bg-brand-cloud dark:bg-[#010409] flex items-center justify-center p-4 overflow-hidden relative border-b border-slate-100 dark:border-[#30363D]">
          <img 
            src={getOptimizedUrl(JSON.parse(product.photos)[0])} 
            alt={product.title} 
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link 
              href={`/admin/market/products?edit=${product.id}`}
              className="absolute top-2 right-2 bg-white/90 p-2 rounded-[4px] text-brand-blue hover:bg-brand-blue hover:text-white transition shadow-sm border border-slate-200 z-20"
              onClick={(e) => e.stopPropagation()}
              title="Edit Product"
            >
              <Edit size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="aspect-square w-full bg-brand-cloud dark:bg-[#010409] flex items-center justify-center text-brand-slate/50 text-[13px] border-b border-slate-100 dark:border-[#30363D] font-mono">
          NO_IMAGE
        </div>
      )}
      <div className="p-4 flex flex-col flex-1 bg-transparent">
        {product.productType && (
          <span className={`inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] mb-2 self-start ${PRODUCT_TYPE_COLORS[product.productType] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
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
            className="flex-auto bg-transparent border border-slate-300 dark:border-white/20 text-brand-navy dark:text-white py-2 px-3 text-[13px] font-sans font-medium rounded-[4px] transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-blue dark:hover:text-brand-blue flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed"
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
    <div className="min-h-screen font-sans">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />

      {/* Digital Technology Partner Hero Section */}
      {/* Digital Technology Partner Hero Section */}
      {!query && (
        <div 
          className="w-full relative overflow-hidden bg-brand-cloud dark:bg-brand-navy border-b border-slate-200 dark:border-brand-navy/10 mt-0 mb-12 rounded-[4px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        >
          {/* Solid Foundation */}
          <div className="absolute inset-0 bg-white dark:bg-brand-navy z-0"></div>
          
          {/* Subtle Grid Pattern for tech feel */}
          <div className="absolute inset-0 bg-[url('/icons/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.03] z-0 pointer-events-none transition-transform duration-500 ease-out invert dark:invert-0" 
            style={{ 
              backgroundSize: '40px 40px',
              transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
            }}
          ></div>

          <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-20 md:py-32 min-h-[600px] max-w-[1400px] mx-auto">
            
            {/* Left Content (Text & CTAs) */}
            <div 
              className="w-full lg:w-[45%] flex flex-col items-start text-left z-20 mb-16 lg:mb-0 transition-transform duration-700 ease-out animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{
                transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`
              }}
            >
              {/* Technical Identifier Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[11px] font-mono font-medium mb-8 tracking-widest">
                <div className="w-1.5 h-1.5 bg-brand-cyan animate-pulse-soft"></div>
                DIGITAL TECHNOLOGY PARTNER
              </div>

              <h1 className="text-[40px] md:text-[56px] lg:text-[64px] font-display font-semibold tracking-tight text-brand-navy dark:text-white mb-6 leading-[1.1]">
                Build. Launch.<br/>
                <span className="text-brand-blue dark:text-white/90">Maintain. Improve.</span>
              </h1>
              
              <p className="text-[16px] md:text-[18px] text-slate-500 dark:text-brand-cloud/80 max-w-lg mb-10 font-sans leading-[1.6]">
                Websites, software, tools and custom solutions — built to last and cared for after launch.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto mb-12">
                <button 
                  onClick={() => {
                    const el = document.getElementById('shop-categories');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="group relative inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-3.5 rounded-[4px] font-sans font-medium text-[14px] hover:bg-brand-blue/90 transition-all duration-200 w-full sm:w-auto"
                >
                  Start a Project
                </button>
                
                <Link 
                  href="/shop" 
                  className="group inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-transparent text-brand-navy dark:text-white border border-transparent dark:border-white/20 px-8 py-3.5 rounded-[4px] font-sans font-medium text-[14px] hover:bg-slate-200 dark:hover:bg-white/5 transition-all duration-200 w-full sm:w-auto"
                >
                  Explore Products
                </Link>
              </div>

              {/* Technical Metadata */}
              <div className="flex items-center gap-6 text-[11px] font-mono text-brand-cyan uppercase tracking-widest border-t border-slate-200 dark:border-white/10 pt-6 w-full max-w-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 dark:text-white/40">Latency</span>
                  <span className="text-brand-blue dark:text-brand-cyan">{"< 50ms"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 dark:text-white/40">Uptime</span>
                  <span className="text-brand-blue dark:text-brand-cyan">99.99%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 dark:text-white/40">Global Edge</span>
                  <span className="text-brand-blue dark:text-brand-cyan">Active</span>
                </div>
              </div>
            </div>

            {/* Right Content (Custom Visual Experience) */}
            <div 
              className="w-full lg:w-[55%] relative h-[400px] md:h-[500px] flex items-center justify-center lg:justify-end z-10 pointer-events-none transition-transform duration-700 ease-out"
              style={{
                transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) perspective(1000px) rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`
              }}
            >
              
              {/* Outer Ambient Glow */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[400px] h-[280px] md:h-[400px] bg-brand-blue/20 rounded-full blur-[80px] md:blur-[100px] opacity-60 transition-transform duration-1000"
                style={{ transform: `translate(calc(-50% + ${mousePos.x * -40}px), calc(-50% + ${mousePos.y * -40}px))` }}
              ></div>
              
              {/* The "Core" Wrapper */}
              <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] animate-[pulseSoft_6s_ease-in-out_infinite]">
                
                {/* Connection Lines (SVG) */}
                <svg 
                  className="absolute inset-0 w-full h-full text-brand-cyan/20 transition-transform duration-500 ease-out" 
                  viewBox="0 0 400 400" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
                >
                  <path d="M200 50 L200 350 M50 200 L350 200" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_40s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }} />
                  <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="animate-[spin_30s_linear_infinite]" style={{ transformOrigin: 'center' }} />
                  <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </svg>

                {/* Layered Geometric Modules */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[240px] h-[200px] md:h-[240px] border border-brand-blue/20 bg-[#071932]/80 backdrop-blur-sm transition-transform duration-[400ms] ease-out"
                  style={{ transform: `translate(calc(-50% + ${mousePos.x * 15}px), calc(-50% + ${mousePos.y * 15}px)) rotate(45deg)` }}
                ></div>
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] md:w-[200px] h-[160px] md:h-[200px] border border-brand-cyan/40 bg-brand-navy transition-transform duration-[500ms] ease-out"
                  style={{ transform: `translate(calc(-50% + ${mousePos.x * 25}px), calc(-50% + ${mousePos.y * 25}px)) rotate(45deg)` }}
                >
                   {/* Inner core grid */}
                   <div className="absolute inset-0 bg-[url('/icons/grid-pattern.svg')] opacity-20" style={{ backgroundSize: '20px 20px' }}></div>
                </div>
                
                {/* Central Floating Processor */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] bg-brand-cyan shadow-[0_0_30px_rgba(34,199,232,0.15)] flex items-center justify-center transition-transform duration-[200ms] ease-out"
                  style={{ transform: `translate(calc(-50% + ${mousePos.x * 40}px), calc(-50% + ${mousePos.y * 40}px))` }}
                >
                   <div className="w-[60px] h-[60px] bg-brand-navy flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/90 animate-pulse"></div>
                   </div>
                </div>

                {/* Floating Technical Labels (Parallax Depth) */}
                <div 
                  className="absolute top-[10%] left-[50%] -translate-x-1/2 bg-brand-navy/90 border border-brand-cyan/20 px-2 py-1 text-[10px] font-mono text-brand-cyan uppercase tracking-widest backdrop-blur-md transition-transform duration-700 ease-out"
                  style={{ transform: `translate(calc(-50% + ${mousePos.x * 50}px), ${mousePos.y * 50}px)` }}
                >
                  SYSTEM
                </div>
                <div 
                  className="absolute bottom-[20%] left-[5%] bg-brand-navy/90 border border-brand-cyan/20 px-2 py-1 text-[10px] font-mono text-brand-cloud uppercase tracking-widest backdrop-blur-md transition-transform duration-1000 ease-out"
                  style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}
                >
                  BUILD
                </div>
                <div 
                  className="absolute top-[20%] right-[5%] bg-brand-navy/90 border border-brand-cyan/20 px-2 py-1 text-[10px] font-mono text-[#F5A623] uppercase tracking-widest backdrop-blur-md transition-transform duration-500 ease-out"
                  style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
                >
                  DEPLOY
                </div>
                <div 
                  className="absolute bottom-[10%] right-[20%] bg-brand-navy/90 border border-brand-cyan/20 px-2 py-1 text-[10px] font-mono text-brand-cyan uppercase tracking-widest backdrop-blur-md transition-transform duration-700 ease-out"
                  style={{ transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 45}px)` }}
                >
                  MONITOR
                </div>
                <div 
                  className="absolute top-[45%] left-0 -translate-y-1/2 bg-brand-navy/90 border border-brand-cyan/20 px-2 py-1 text-[10px] font-mono text-brand-teal uppercase tracking-widest backdrop-blur-md transition-transform duration-1000 ease-out"
                  style={{ transform: `translate(${mousePos.x * -70}px, calc(-50% + ${mousePos.y * -70}px))` }}
                >
                  IMPROVE
                </div>

                {/* Orbiting Modules */}
                <div className="absolute top-0 left-0 w-full h-full animate-[spin_15s_linear_infinite]" style={{ transformOrigin: 'center' }}>
                  <div className="absolute top-[20px] left-[50%] -translate-x-1/2 w-2 h-2 bg-brand-cyan shadow-[0_0_10px_#22C7E8]"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-[spin_25s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }}>
                  <div className="absolute bottom-[40px] right-[40px] w-1.5 h-1.5 bg-[#F5A623] shadow-[0_0_10px_#F5A623]"></div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Capabilities Section */}
      {!query && (
        <div className="w-full border-t border-slate-200 dark:border-white/5 relative">
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start px-6 md:px-12 py-12 md:py-20 max-w-[1400px] mx-auto">
            <div className="md:w-1/3">
              <span className="text-[12px] font-mono font-medium tracking-widest text-brand-cyan uppercase mb-4 block">Our Capabilities</span>
              <h2 className="text-[28px] md:text-[36px] font-display font-medium text-brand-navy dark:text-white leading-tight mb-6">
                Engineered for scale and performance.
              </h2>
              <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                We don't just write code. We architect reliable systems that act as the technical foundation for your business operations. From complex data pipelines to highly responsive user interfaces.
              </p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              {[
                { title: "Custom Web Applications", desc: "React, Next.js, and Node.js ecosystems built for high traffic and maximum uptime." },
                { title: "SaaS Infrastructure", desc: "Scalable multi-tenant architectures, secure authentication, and robust billing integrations." },
                { title: "System Integrations", desc: "Connecting your bespoke tools with CRM, ERP, and payment gateways seamlessly." },
                { title: "Technical Maintenance", desc: "Continuous monitoring, version upgrades, and performance tuning for existing systems." },
              ].map((item, idx) => (
                <div key={idx} className="group">
                  <div className="w-10 h-10 rounded-[4px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4 text-brand-navy dark:text-white group-hover:border-brand-blue group-hover:text-brand-blue transition-colors">
                    <Check size={18} />
                  </div>
                  <h3 className="text-[16px] font-medium text-brand-navy dark:text-white mb-2">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Right Sidebar (Flash Deals, etc) */}
      {!query && (
        <div className="lg:hidden w-full px-2 mt-4 mb-2">
          <RightSidebar />
        </div>
      )}

      {/* What We Build (Premium Capability Grid) */}
      {!query && (
        <div id="what-we-build" className="w-full py-16 md:py-24 relative">
          
          <div className="flex flex-col mb-12 px-2 md:px-0">
            <span className="text-[12px] font-mono font-medium tracking-widest text-brand-cyan uppercase mb-4">Core Focus</span>
            <h2 className="text-[32px] md:text-[40px] font-display font-medium text-brand-navy dark:text-white leading-tight">
              What we build
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 md:px-0">
            
            {/* 1. Websites (Wide) */}
            <Link href="/shop?type=service" className="group md:col-span-2 bg-brand-cloud dark:bg-[#0D1117] border border-slate-200 dark:border-white/10 rounded-[4px] p-8 md:p-10 flex flex-col md:flex-row gap-8 hover:border-brand-blue/40 transition-colors duration-300 relative overflow-hidden">
              <div className="flex-1 flex flex-col z-10">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">01 / Digital Real Estate</span>
                <h3 className="text-[28px] font-display font-medium text-brand-navy dark:text-white mb-4 group-hover:text-brand-blue transition-colors">Websites</h3>
                <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mb-8">
                  High-performance digital experiences and bespoke business websites architected for speed, conversion, and scale.
                </p>
                <div className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                  Explore <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              {/* Visual Component */}
              <div className="w-full md:w-[240px] h-[160px] md:h-full relative shrink-0 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-[80%] h-[80%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] shadow-sm flex flex-col p-3 transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                  <div className="w-full h-[12px] border-b border-slate-100 dark:border-white/5 mb-3 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <div className="w-full h-8 bg-brand-cloud dark:bg-white/5 rounded-[2px] mb-2 transform origin-left transition-transform duration-300 group-hover:scale-x-[0.99]"></div>
                  <div className="flex gap-2 flex-1">
                    <div className="flex-1 bg-brand-cloud dark:bg-white/5 rounded-[2px]"></div>
                    <div className="w-1/3 bg-brand-cloud dark:bg-white/5 rounded-[2px]"></div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. Software (Square) */}
            <Link href="/shop?type=software" className="group md:col-span-1 bg-brand-navy border border-brand-navy/10 rounded-[4px] p-8 md:p-10 flex flex-col hover:border-brand-cyan/40 transition-colors duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
              
              <div className="flex-1 flex flex-col z-10">
                <span className="text-[11px] font-mono text-brand-cyan/70 uppercase tracking-widest mb-6">02 / Systems</span>
                <h3 className="text-[28px] font-display font-medium text-white mb-4">Software</h3>
                <p className="text-[14px] text-white/70 leading-relaxed mb-8">
                  Custom tools, complex business systems, and scalable software solutions.
                </p>
                <div className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-brand-cyan">
                  Explore <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              {/* Visual Component */}
              <div className="w-full h-[120px] mt-8 relative flex items-end pointer-events-none">
                 <div className="w-full h-full border-t border-brand-cyan/20 border-l border-brand-cyan/20 flex p-4 relative">
                   <div className="absolute -top-1 -left-1 w-2 h-2 bg-brand-cyan shadow-[0_0_8px_#22C7E8] transition-shadow duration-300 group-hover:shadow-[0_0_12px_#22C7E8]"></div>
                   <div className="w-full h-full bg-gradient-to-tr from-brand-cyan/5 to-transparent">
                     <svg className="w-full h-full text-brand-cyan/20" viewBox="0 0 100 50" preserveAspectRatio="none">
                       <path d="M0,50 L20,30 L40,40 L60,10 L80,20 L100,0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="transition-transform duration-500 ease-out transform group-hover:translate-y-[-2px]" />
                     </svg>
                   </div>
                 </div>
              </div>
            </Link>

            {/* 3. Digital Products (Square) */}
            <Link href="/shop?type=product" className="group md:col-span-1 bg-brand-cloud dark:bg-[#0D1117] border border-slate-200 dark:border-white/10 rounded-[4px] p-8 md:p-10 flex flex-col hover:border-brand-blue/40 transition-colors duration-300 relative overflow-hidden">
              <div className="flex-1 flex flex-col z-10">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">03 / Assets</span>
                <h3 className="text-[28px] font-display font-medium text-brand-navy dark:text-white mb-4 group-hover:text-brand-blue transition-colors">Products</h3>
                <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                  Templates, UI systems, components, and premium developer assets.
                </p>
                <div className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                  Explore <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              {/* Visual Component */}
              <div className="w-full h-[120px] mt-8 relative flex items-center justify-center pointer-events-none">
                 <div className="w-16 h-16 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] shadow-sm absolute left-1/2 -translate-x-full -ml-2 transform transition-transform duration-500 group-hover:-translate-x-[110%] group-hover:-translate-y-2 group-hover:rotate-[-5deg]"></div>
                 <div className="w-16 h-16 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] shadow-md absolute left-1/2 -translate-x-1/2 z-10 transform transition-transform duration-500 group-hover:-translate-y-4"></div>
                 <div className="w-16 h-16 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] shadow-sm absolute left-1/2 ml-2 transform transition-transform duration-500 group-hover:translate-x-[10%] group-hover:-translate-y-2 group-hover:rotate-[5deg]"></div>
              </div>
            </Link>

            {/* 4. Ongoing Care (Wide) */}
            <Link href="/shop?type=service" className="group md:col-span-2 bg-[#0A1A2F] border border-[#132A4A] rounded-[4px] p-8 md:p-10 flex flex-col md:flex-row gap-8 hover:border-[#1C4173] transition-colors duration-300 relative overflow-hidden">
              <div className="flex-1 flex flex-col z-10">
                <span className="text-[11px] font-mono text-brand-teal uppercase tracking-widest mb-6">04 / Lifecycle</span>
                <h3 className="text-[28px] font-display font-medium text-white mb-4">Ongoing Care</h3>
                <p className="text-[14px] text-white/70 leading-relaxed max-w-sm mb-8">
                  Maintenance, security updates, monitoring, and continuous improvement for your digital systems.
                </p>
                <div className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-brand-teal">
                  Explore <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              {/* Visual Component */}
              <div className="w-full md:w-[240px] h-[160px] md:h-full relative shrink-0 flex items-center justify-center pointer-events-none">
                 <div className="w-[120px] h-[120px] rounded-full border border-brand-teal/20 flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border border-brand-teal/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                   <div className="w-[80px] h-[80px] rounded-full border border-brand-teal/40 flex items-center justify-center">
                      <div className="w-2 h-2 bg-brand-teal rounded-full shadow-[0_0_15px_#0B7A68]"></div>
                   </div>
                   {/* Orbiting element */}
                   <div className="absolute top-0 left-0 w-full h-full animate-[spin_8s_linear_infinite]" style={{ transformOrigin: 'center' }}>
                     <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-cyan/50 rounded-full"></div>
                   </div>
                 </div>
              </div>
            </Link>

          </div>
        </div>
      )}

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
        <div className="text-center py-20 bg-brand-cloud dark:bg-[#0D1117] rounded-[4px] border border-slate-200 dark:border-white/5 w-full my-8">
          <h3 className="text-lg font-semibold text-brand-navy dark:text-white">No products found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search query</p>
        </div>
      )}
      
      {/* Search Results */}
      {query && displayedProducts.length > 0 && (
        <EditorialProductShowcase 
          products={displayedProducts} 
          isLoading={loading} 
        />
      )}

      {/* Why Codalina Editorial */}
      {!query && (
        <div className="w-full py-24 md:py-32 relative border-t border-slate-200 dark:border-white/5">
          <div className="flex flex-col lg:flex-row gap-16 md:gap-24 px-6 md:px-12 max-w-6xl mx-auto relative">
            
            {/* Left: Sticky Header */}
            <div className="lg:w-1/3 flex flex-col items-start lg:sticky lg:top-32 h-fit">
              <span className="text-[12px] font-mono font-medium tracking-widest text-brand-cyan uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse-soft"></span>
                Why Codalina
              </span>
              <h2 className="text-[32px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white leading-[1.1] mb-6">
                Built for today.<br />Designed to evolve.
              </h2>
              <p className="text-[15px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                We engineer digital infrastructure with a focus on maintainable architecture and proactive care.
              </p>
            </div>

            {/* Right: The 5 Principles List */}
            <div className="lg:w-2/3 flex flex-col">
              
              {/* Principle 1 */}
              <div className="group flex flex-col md:flex-row gap-4 md:gap-12 py-8 md:py-12 border-t border-slate-200 dark:border-white/10 relative">
                 <div className="md:w-1/3 shrink-0 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-[4px] bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] text-brand-slate dark:text-slate-400 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-white transition-colors duration-300">01</div>
                   <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300">Reliable by design</h3>
                 </div>
                 <div className="md:w-2/3">
                   <p className="text-[15px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-brand-navy dark:group-hover:text-slate-300 transition-colors duration-300">
                     Every system we build is security-conscious by design. We use proven frameworks and established deployment pipelines to ensure stability without sacrificing speed.
                   </p>
                 </div>
              </div>
              
              {/* Principle 2 */}
              <div className="group flex flex-col md:flex-row gap-4 md:gap-12 py-8 md:py-12 border-t border-slate-200 dark:border-white/10 relative">
                 <div className="md:w-1/3 shrink-0 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-[4px] bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] text-brand-slate dark:text-slate-400 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-white transition-colors duration-300">02</div>
                   <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300">Clear communication</h3>
                 </div>
                 <div className="md:w-2/3">
                   <p className="text-[15px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-brand-navy dark:group-hover:text-slate-300 transition-colors duration-300">
                     We translate complex technical requirements into plain language. No dark patterns, no hidden dependencies—just honest technical partnership.
                   </p>
                 </div>
              </div>

              {/* Principle 3 */}
              <div className="group flex flex-col md:flex-row gap-4 md:gap-12 py-8 md:py-12 border-t border-slate-200 dark:border-white/10 relative">
                 <div className="md:w-1/3 shrink-0 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-[4px] bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] text-brand-slate dark:text-slate-400 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-white transition-colors duration-300">03</div>
                   <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300">Maintainable technology</h3>
                 </div>
                 <div className="md:w-2/3">
                   <p className="text-[15px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-brand-navy dark:group-hover:text-slate-300 transition-colors duration-300">
                     We avoid brittle abstractions and exotic tech stacks. Our software is built to adapt, with clean codebases that future developers can confidently inherit.
                   </p>
                 </div>
              </div>

              {/* Principle 4 */}
              <div className="group flex flex-col md:flex-row gap-4 md:gap-12 py-8 md:py-12 border-t border-slate-200 dark:border-white/10 relative">
                 <div className="md:w-1/3 shrink-0 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-[4px] bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] text-brand-slate dark:text-slate-400 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-white transition-colors duration-300">04</div>
                   <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300">Long-term care</h3>
                 </div>
                 <div className="md:w-2/3">
                   <p className="text-[15px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-brand-navy dark:group-hover:text-slate-300 transition-colors duration-300">
                     Launching is just the starting line. We provide proactive care, regular security patches, and performance monitoring to keep your platform healthy.
                   </p>
                 </div>
              </div>

              {/* Principle 5 */}
              <div className="group flex flex-col md:flex-row gap-4 md:gap-12 py-8 md:py-12 border-t border-slate-200 dark:border-white/10 border-b relative">
                 <div className="md:w-1/3 shrink-0 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-[4px] bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] text-brand-slate dark:text-slate-400 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-white transition-colors duration-300">05</div>
                   <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors duration-300">Continuous improvement</h3>
                 </div>
                 <div className="md:w-2/3">
                   <p className="text-[15px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-brand-navy dark:group-hover:text-slate-300 transition-colors duration-300">
                     Digital products are living systems. We rely on user feedback and data metrics to constantly refine, iterate, and improve the user experience.
                   </p>
                 </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Premium Final Conversion CTA */}
      {!query && (
        <div className="w-full px-6 md:px-12 pb-20 pt-12 md:pt-20">
          <div className="relative w-full bg-brand-navy rounded-[8px] overflow-hidden border border-brand-navy/5 flex flex-col items-center text-center px-6 py-24 md:py-32 shadow-2xl">
            
            {/* Background & Technical Accents */}
            <div className="absolute inset-0 bg-[url('/icons/grid-pattern.svg')] opacity-[0.03] z-0 pointer-events-none" style={{ backgroundSize: '30px 30px' }}></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 hover:opacity-100"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 hover:opacity-100"></div>
            
            {/* Subtle technical UI elements around the edges */}
            <div className="absolute top-8 left-8 hidden md:flex flex-col gap-2 z-10 opacity-70">
              <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-widest text-left">System State</span>
              <div className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-[ping_2s_ease-out_infinite]"></span>
                <span className="text-[11px] font-mono text-white/50">ONLINE</span>
              </div>
            </div>
            
            <div className="absolute bottom-8 right-8 hidden md:flex flex-col gap-2 z-10 text-right opacity-70">
              <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-widest">Project Types</span>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[11px] font-mono text-white/50 hover:text-brand-cyan cursor-default transition-colors">WEBSITE</span>
                <span className="text-[11px] font-mono text-white/50 hover:text-brand-cyan cursor-default transition-colors">SOFTWARE</span>
                <span className="text-[11px] font-mono text-white/50 hover:text-brand-cyan cursor-default transition-colors">DIGITAL PRODUCT</span>
                <span className="text-[11px] font-mono text-white/50 hover:text-brand-cyan cursor-default transition-colors">ONGOING CARE</span>
              </div>
            </div>
            
            {/* Corner brackets */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-brand-cyan/20 pointer-events-none"></div>
            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-brand-cyan/20 pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-brand-cyan/20 pointer-events-none"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-brand-cyan/20 pointer-events-none"></div>

            {/* Main Content */}
            <div className="relative z-20 flex flex-col items-center max-w-2xl mx-auto mt-4">
              
              <h2 className="text-[40px] md:text-[56px] font-display font-semibold tracking-tight text-white mb-6 leading-[1.1]">
                Have something to build?<br />
                <span className="text-white/70">Let's make it real.</span>
              </h2>
              
              <p className="text-[16px] md:text-[18px] text-brand-cloud/70 max-w-lg mb-12 font-sans leading-[1.6]">
                Tell us what you're building, improving or maintaining. We're ready to engineer your next digital solution.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link 
                  href="/contact" 
                  className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#e0961f] text-brand-navy px-8 py-4 rounded-[4px] font-sans font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Start a Project
                  <ArrowRight size={18} />
                </Link>
                
                <Link 
                  href="/shop" 
                  className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-brand-cyan hover:text-brand-cyan text-white px-8 py-4 rounded-[4px] font-sans font-medium text-[15px] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Explore Codalina
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      )}
      
      <MarketSEOContent />
    </div>
  );
}
