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
  const query = searchParams.get('q')?.toLowerCase() || '';

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      titleTop: "When Budget is Limited",
      titleBottom: "Performance is Unlimited!"
    },
    {
      image: "https://images.unsplash.com/photo-1531297172864-822d1fe48bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      titleTop: "Best Deals on",
      titleBottom: "Windows Laptops"
    },
    {
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      titleTop: "Largest Electronic",
      titleBottom: "Hypermarket"
    },
    {
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      titleTop: "Next Generation",
      titleBottom: "Smart Watches"
    },
    {
      image: "https://images.unsplash.com/photo-1606220838315-056192d5e927?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      titleTop: "Premium Quality",
      titleBottom: "Audio Devices"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 2000);
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
            if (p.likes && p.likes.includes(user.id)) {
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
        if (p.likes && p.likes.includes(user.id)) {
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
    <div className="bg-gray-50 min-h-screen">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />

      {/* Hero Banners */}
      {!query && (
        <div className="p-2 pt-4 md:p-8 md:pb-2 max-w-7xl mx-auto flex flex-col lg:flex-row gap-2 md:gap-4">
          {/* Main Banner Slider */}
          <div className="lg:w-2/3 w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px] bg-black rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
            
            {heroSlides.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 z-0'} ${idx === currentSlide ? 'z-10' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-black z-0"></div>
                <Image src={slide.image} alt={slide.titleBottom} width={1200} height={800} priority={idx === 0} className="absolute right-0 bottom-0 h-full w-full object-cover md:object-contain md:h-[90%] md:w-auto opacity-50 md:opacity-80 z-10 mix-blend-lighten" />
                
                <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 w-full md:w-[70%]">
                  <h3 className="text-white text-lg md:text-3xl font-medium mb-1 md:mb-2 drop-shadow-md transition-transform duration-700 translate-y-0">{slide.titleTop}</h3>
                  <h1 className="text-[#fbbf24] text-2xl md:text-5xl font-black leading-tight mb-4 md:mb-6 drop-shadow-lg uppercase">{slide.titleBottom}</h1>
                  <div className="flex gap-4 items-center">
                    <button className="bg-white text-black px-4 md:px-8 py-1.5 md:py-2.5 rounded-full font-bold text-sm md:text-base hover:bg-gray-200 transition shadow-lg flex items-center">Buy Now <span className="ml-1 text-lg">↗</span></button>
                  </div>
                </div>
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
          <div className="lg:w-1/3 flex flex-row lg:flex-col gap-2 md:gap-4 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[450px]">
            {/* Top Side Banner */}
            <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden relative group cursor-pointer flex flex-col justify-center items-center text-center p-4 shadow-sm">
              <Image src="https://images.unsplash.com/photo-1531297172864-822d1fe48bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Laptops" width={600} height={400} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition duration-500" />
              <div className="relative z-10">
                <p className="text-gray-300 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1">Best deals on</p>
                <h3 className="text-yellow-400 text-sm md:text-2xl font-black uppercase tracking-wider mb-2 md:mb-4 drop-shadow-md">Windows Laptops</h3>
                <button className="bg-orange-500 text-white px-3 md:px-5 py-1 md:py-1.5 rounded font-bold text-[10px] md:text-sm hover:bg-orange-600 transition shadow-lg flex items-center mx-auto">Buy Now <span className="ml-1">↗</span></button>
              </div>
            </div>
            
            {/* Bottom Side Banner */}
            <div className="flex-1 bg-gradient-to-r from-teal-900 to-slate-900 rounded-xl overflow-hidden relative group cursor-pointer flex flex-col justify-center px-4 md:px-6 shadow-sm">
              <Image src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Electronics" width={600} height={400} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity group-hover:scale-105 transition duration-500" />
              <div className="relative z-10">
                <h3 className="text-cyan-400 text-[9px] md:text-xs font-semibold tracking-widest mb-0.5 md:mb-1 uppercase">Largest Electronic</h3>
                <h2 className="text-white text-lg md:text-3xl font-light italic mb-2 md:mb-3">Hypermarket</h2>
                <div className="bg-cyan-400 text-slate-900 text-[9px] md:text-xs font-bold px-2 py-1 inline-block mb-1 md:mb-2 rounded-sm shadow-sm">ENJOY UP TO 70% OFF.</div>
                <p className="text-gray-300 text-[8px] md:text-[11px] font-medium uppercase">Brand New Replacement Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop by Categories */}
      {!query && (
        <div className="p-2 pt-6 md:p-8 md:pb-2 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Shop by Categories</h2>
            <button className="text-[10px] md:text-sm px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors font-medium">SEE ALL</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
            {[
              { name: 'Phones', icon: Smartphone },
              { name: 'Tablet', icon: Tablet },
              { name: 'Laptop', icon: Laptop },
              { name: 'Smart Watch', icon: Watch },
              { name: 'AirPods', icon: Headphones },
              { name: 'Sounds', icon: Speaker },
              { name: 'Accessories', icon: Cable },
              { name: 'Gadgets', icon: Gamepad2 },
              { name: 'Earbuds', icon: Headphones },
              { name: 'Phone Cases', icon: Smartphone },
              { name: 'Screen Protectors', icon: Shield },
              { name: 'Over-Ear Headphones', icon: Headphones },
              { name: 'MacBook Case', icon: Laptop },
              { name: 'Power Banks', icon: BatteryCharging },
              { name: 'Adapters', icon: Cable },
              { name: 'Smart TV', icon: Tv },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-gray-200/50 hover:bg-gray-200 cursor-pointer rounded-lg flex flex-col items-center justify-center p-3 md:p-5 transition-colors">
                  <Icon size={36} strokeWidth={1.2} className="text-gray-800 mb-2 md:mb-3" />
                  <span className="text-[10px] md:text-[13px] font-medium text-gray-800 text-center leading-tight">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Product Grid */}
      <div className="p-2 pt-2 md:p-8 max-w-7xl mx-auto -mt-4 md:mt-2">
        <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-8 text-gray-800 mt-6 md:mt-0">
          {query ? `Search Results for "${searchParams.get('q')}"` : "Featured Products"}
        </h2>
        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
            {displayedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative group">
              <Link href={`/market/product/${product.id}`} className="absolute inset-0 z-0"></Link>
              {product.photos && JSON.parse(product.photos)[0] ? (
                <div className="aspect-square w-full bg-[#f5f5f7] flex items-center justify-center p-4 md:p-8 overflow-hidden relative transition-colors duration-300">
                  <img 
                    src={getOptimizedUrl(JSON.parse(product.photos)[0])} 
                    alt={product.title} 
                    loading="lazy"
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-in-out drop-shadow-sm"
                  />
                  {/* Hover Like Button */}
                  <button 
                    onClick={(e) => toggleLike(e, product.id)}
                    className="absolute top-3 right-3 bg-[#f5f5f7] hover:bg-gray-200 p-2 rounded-full text-gray-500 hover:text-gray-900 transition-opacity duration-200 opacity-0 group-hover:opacity-100 shadow-sm border border-gray-200/50 z-10"
                    title="Add to Wishlist"
                  >
                    <Star size={16} strokeWidth={2} className={likedProducts[product.id] ? 'fill-current text-pink-500' : ''} />
                  </button>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Link 
                      href={`/admin/market/products?edit=${product.id}`}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-md z-10"
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
              <div className="p-3 md:p-5 flex flex-col flex-1 items-center bg-white text-center">
                <h3 className="font-medium text-[13px] md:text-base text-gray-800 mb-2 md:mb-3 line-clamp-2 transition-colors">{product.title}</h3>
                <div className="flex justify-center items-center gap-2 mb-4 md:mb-5 flex-1">
                  <span className="text-base md:text-lg font-bold text-gray-900">BDT {formatPrice(product.selling_price)}</span>
                  {product.original_price && product.original_price > product.selling_price && (
                    <span className="text-[11px] md:text-sm text-gray-500 line-through decoration-gray-400">BDT {formatPrice(product.original_price)}</span>
                  )}
                </div>
                <div className="w-full flex gap-2 mt-auto relative z-10">
                  <Link href={`/market/product/${product.id}`} className="flex-[0.8] bg-[#111827] hover:bg-black text-white py-2 md:py-2 text-[10px] md:text-[11px] rounded transition-colors font-medium uppercase tracking-wider flex items-center justify-center shadow-sm">
                    View
                  </Link>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="flex-[1.2] bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-2 md:py-2 text-[10px] md:text-[11px] rounded transition-colors font-medium uppercase tracking-wider shadow-sm"
                  >
                    Add to Cart
                  </button>
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
              className={`bg-white border border-gray-300 text-gray-800 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading...' : 'Load More Products'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
