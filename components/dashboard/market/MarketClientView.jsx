"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Edit, Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Gamepad2, Tv, BatteryCharging, Shield, ChevronLeft, ChevronRight, Star } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";

// Cloudinary optimization for free extreme performance
const getOptimizedUrl = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_auto,w_600/${parts[1]}`;
    }
  }
  // For Unsplash or others, just return as is
  return url;
};

export default function MarketClientView({ initialData = [], initialPagination = { pages: 1, currentPage: 1 } }) {
  const [products, setProducts] = useState(initialData.filter(p => p.status === 'Live'));
  const [likedProducts, setLikedProducts] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = React.useContext(DashboardContext) || {};
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const query = searchParams.get('q')?.toLowerCase() || '';

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const [heroSlides, setHeroSlides] = useState([]);

  useEffect(() => {
    const geeooBanner = {
      image: "/geeoo-banner.jpg",
      titleTop: "GEEOO",
      titleBottom: "Lightning Adapter",
      link: "#",
      isFullBanner: true
    };
    setHeroSlides([geeooBanner]);
    
    api.get('/market/banners').catch(() => {}); // Just ping it in background if needed, but ignore result

    api.get('/market/categories/all')
      .then(res => {
        setCategories(res.data || res || []);
      })
      .catch(err => console.error("Failed to load categories:", err));

    // Fallback: If SSR failed (common on Windows local with IPv6 localhost resolution), fetch on client mount
    if (initialData.length === 0) {
      fetchProducts(1, true);
    }
  }, [initialData.length]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const [page, setPage] = useState(initialPagination.currentPage || 1);
  const [hasMore, setHasMore] = useState((initialPagination.currentPage || 1) < (initialPagination.pages || 1));
  const [loading, setLoading] = useState(false);

  const fetchProducts = (pageNum, reset = false) => {
    setLoading(true);
    api.get(`/market/products?page=${pageNum}&limit=12`)
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
    if (user && products.length > 0) {
      const initialLikes = {};
      products.forEach(p => {
        if (p.likedBy && p.likedBy.includes(user.id)) {
          initialLikes[p.id] = true;
        }
      });
      setLikedProducts(prev => ({ ...prev, ...initialLikes }));
    }
  }, [user]);

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

  const displayedProducts = query 
    ? products.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query) || 
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
    : products;

  return (
    <div className="min-h-screen font-sans">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />

      {/* Hero Banners */}
      {!query && (
        <div className="p-2 pt-4 md:-mt-4 md:px-3 md:pb-2 w-full flex flex-col lg:flex-row gap-2 md:gap-4">
          {/* Main Banner Slider */}
          <div className="lg:w-2/3 w-full aspect-square md:aspect-auto md:h-[400px] lg:h-[600px] bg-[#1a1a1a] rounded-apple-lg overflow-hidden relative group cursor-pointer flex items-center justify-center">
            
            {heroSlides.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 z-0'} ${idx === currentSlide ? 'z-10' : ''}`}
              >
                {slide.isFullBanner ? (
                  <Link href={slide.link || '#'} className="absolute inset-0 flex items-center justify-center w-full h-full">
                    <img src={slide.image} alt={slide.titleBottom} className="w-full h-full object-contain z-10" />
                  </Link>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-black z-0"></div>
                    <img src={slide.image?.startsWith('http') ? slide.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${slide.image}`} alt={slide.titleBottom} className="absolute right-0 bottom-0 h-full w-full object-cover md:object-contain md:h-[90%] md:w-auto opacity-50 md:opacity-80 z-10 mix-blend-lighten" />
                    
                    <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 w-full md:w-[70%]">
                      <h3 className="text-white text-lg md:text-[32px] font-semibold tracking-[-0.015em] mb-1 md:mb-2 transition-opacity duration-700 translate-y-0">{slide.titleTop}</h3>
                      <h1 className="text-[#fbbf24] text-2xl md:text-[56px] font-semibold tracking-[-0.015em] leading-[1.08] mb-4 md:mb-6 uppercase">{slide.titleBottom}</h1>
                      <div className="flex gap-4 items-center">
                        <Link href={slide.link || '#'} className="bg-[#0066CC] text-white px-[22px] py-[11px] rounded-apple-pill font-sans text-[17px] font-normal hover:opacity-80 transition-opacity flex items-center">Buy Now <span className="ml-1 text-lg">↗</span></Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Slider Arrows */}
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white z-30 transition opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev + 1) % heroSlides.length); }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white z-30 transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#fbbf24] w-6' : 'bg-white/50 hover:bg-white'}`}
                />
              ))}
            </div>
          </div>

          {/* Side Banners */}
          <div className="lg:w-1/3 flex flex-row lg:flex-col gap-2 md:gap-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
            {/* Top Side Banner */}
            <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-apple-lg overflow-hidden relative group cursor-pointer flex flex-col justify-center items-center text-center p-4">
              <img src="https://images.unsplash.com/photo-1531297172864-822d1fe48bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Laptops" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:opacity-80 transition duration-500" />
              <div className="relative z-10">
                <p className="text-gray-300 text-[10px] md:text-[14px] font-semibold tracking-[-0.016em] mb-0.5 md:mb-1">Best deals on</p>
                <h3 className="text-yellow-400 text-sm md:text-[24px] font-semibold tracking-[-0.015em] uppercase mb-2 md:mb-4">Windows Laptops</h3>
                <button className="bg-[#0066CC] text-white px-[15px] py-[8px] rounded-apple-pill font-sans text-[14px] font-normal hover:opacity-80 transition-opacity flex items-center mx-auto">Buy Now <span className="ml-1">↗</span></button>
              </div>
            </div>
            
            {/* Bottom Side Banner */}
            <div className="flex-1 bg-gradient-to-r from-teal-900 to-slate-900 rounded-apple-lg overflow-hidden relative group cursor-pointer flex flex-col justify-center px-4 md:px-6">
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Electronics" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity group-hover:opacity-80 transition duration-500" />
              <div className="relative z-10">
                <h3 className="text-cyan-400 text-[9px] md:text-[12px] font-semibold tracking-[0.06em] mb-0.5 md:mb-1 uppercase">Largest Electronic</h3>
                <h2 className="text-white text-lg md:text-[32px] font-semibold tracking-[-0.015em] leading-[1.08] italic mb-2 md:mb-3">Hypermarket</h2>
                <div className="bg-cyan-400 text-slate-900 text-[9px] md:text-[12px] font-semibold px-2 py-1 inline-block mb-1 md:mb-2 rounded-sm">ENJOY UP TO 70% OFF.</div>
                <p className="text-gray-300 text-[8px] md:text-[12px] font-semibold uppercase">Brand New Replacement Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop by Categories */}
      {!query && (
        <div className="p-2 pt-6 md:p-8 md:pb-2 w-full">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-[28px] font-semibold text-apple-ink">Shop by Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
            {[
              { name: 'Smart Watch', icon: Watch },
              { name: 'Earbuds', icon: Headphones },
              { name: 'Over-Ear Headphones', icon: Headphones },
              { name: 'Power Banks', icon: BatteryCharging },
              { name: 'Adapters', icon: Cable },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-[#f5f5f7] hover:bg-[#e5e5ea] cursor-pointer rounded-2xl md:rounded-[20px] flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300">
                  <Icon size={32} strokeWidth={1.2} className="text-apple-ink mb-3 md:mb-4" />
                  <span className="text-[12px] md:text-[14px] font-medium text-apple-ink text-center leading-tight">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Product Grid */}
      <div className="p-2 pt-2 md:py-8 md:px-3 w-full -mt-4 md:mt-2">
        <h2 className="text-lg md:text-[32px] font-semibold tracking-[-0.015em] mb-4 md:mb-8 text-apple-ink mt-6 md:mt-0">
          {query ? `Search Results for "${searchParams.get('q')}"` : "Featured Products"}
        </h2>
        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 bg-apple-parchment rounded-apple-lg border border-apple-hairline">
            <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
            {displayedProducts.map(product => (
              <div key={product.id} className="bg-apple-parchment rounded-apple-lg transition-all duration-300 overflow-hidden border border-apple-hairline flex flex-col relative group">
              <Link href={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
              {product.photos && JSON.parse(product.photos)[0] ? (
                <div className="aspect-square w-full bg-transparent flex items-center justify-center p-4 md:p-8 overflow-hidden relative transition-colors duration-300">
                  <img 
                    src={getOptimizedUrl(JSON.parse(product.photos)[0])} 
                    alt={product.title} 
                    loading="lazy"
                    className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-700 ease-in-out"
                  />

                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Link 
                      href={`/admin/market/products?edit=${product.id}`}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-md z-20"
                      onClick={(e) => e.stopPropagation()}
                      title="Edit Product"
                    >
                      <Edit size={16} />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="h-32 md:h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs md:text-base">
                  No Image
                </div>
              )}
              <div className="p-4 md:p-6 flex flex-col flex-1 items-center bg-apple-parchment text-center">
                <h3 className="font-normal text-[17px] text-apple-ink leading-[1.47] tracking-[-0.022em] mb-2 md:mb-3 line-clamp-2">{product.title}</h3>
                <div className="flex justify-center items-center gap-2 mb-4 md:mb-6 flex-1">
                  <span className="text-[17px] font-normal text-apple-ink">BDT {formatPrice(product.selling_price)}</span>
                  {product.original_price && product.original_price > product.selling_price && (
                    <span className="text-[14px] text-apple-muted line-through">BDT {formatPrice(product.original_price)}</span>
                  )}
                </div>
                <div className="w-full flex flex-col xl:flex-row gap-3 mt-auto relative z-20">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="flex-1 bg-[#0066CC] text-white py-[6px] md:py-[8px] px-2 md:px-4 text-[13px] md:text-[15px] whitespace-nowrap font-sans font-normal rounded-apple-pill transition-opacity hover:opacity-80 flex items-center justify-center"
                  >
                    Add to Cart
                  </button>
                  <Link href={`/product/${product.id}`} className="flex-1 bg-transparent border border-[#0066CC] text-[#0066CC] py-[6px] md:py-[8px] px-2 md:px-4 text-[13px] md:text-[15px] whitespace-nowrap font-sans font-normal rounded-apple-pill transition-opacity hover:opacity-80 flex items-center justify-center">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        
        {/* Load More Button */}
        {!query && hasMore && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={loadMore}
              disabled={loading}
              className={`bg-apple-parchment border border-apple-hairline text-apple-ink px-[22px] py-[11px] rounded-apple-pill font-sans text-[17px] font-normal transition-opacity hover:opacity-80 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading...' : 'Load More Products'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
