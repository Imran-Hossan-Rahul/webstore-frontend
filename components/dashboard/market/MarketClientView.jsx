"use client";
import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Edit, Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Gamepad2, Tv, BatteryCharging, Shield, ChevronLeft, ChevronRight, Star, Check } from "lucide-react";
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
  // For Unsplash or others, just return as is
  return url;
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
    <div className="p-2 pt-2 md:py-8 md:px-3 w-full -mt-4 md:mt-2 relative group">
      <div className="flex justify-between items-center mb-4 md:mb-8 mt-6 md:mt-0">
        <h2 className="text-lg md:text-[32px] font-semibold tracking-[-0.015em] text-apple-ink">
          {title}
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-[13px] md:text-[15px] font-semibold text-apple-ink bg-transparent border border-apple-hairline px-4 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            See all
          </Link>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <AppleSpinner size={40} className="text-[#0071e3]" />
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
      <div key={product.id} className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-apple-lg transition-all duration-300 overflow-hidden border border-apple-hairline flex flex-col relative group">
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
      {product.photos && JSON.parse(product.photos)[0] ? (
        <div className="aspect-square w-full bg-transparent flex items-center justify-center p-2 md:p-4 overflow-hidden relative transition-colors duration-300">
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
      <div className="px-2 py-3 md:p-4 flex flex-col flex-1 items-center bg-transparent text-center">
        {product.productType && (
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 ${PRODUCT_TYPE_COLORS[product.productType] || 'bg-gray-100 text-gray-600'}`}>
            {product.productType}
          </span>
        )}
        <h3 className="font-normal text-[17px] text-apple-ink leading-[1.47] tracking-[-0.022em] mb-1 md:mb-2 line-clamp-2 px-1" style={{ minHeight: 'calc(1.47 * 17px * 2)' }}>{product.title}</h3>
        <div className="flex justify-center items-center gap-2 mb-3 md:mb-4 flex-1">
          <span className="text-[17px] font-normal text-apple-ink">BDT {formatPrice(product.selling_price)}</span>
          {Number(product.original_price) > Number(product.selling_price) && (
            <span className="text-[14px] text-apple-muted line-through">BDT {formatPrice(product.original_price)}</span>
          )}
        </div>
        <div className="w-full flex flex-row gap-1.5 md:gap-2 mt-auto relative z-20 px-1 -translate-x-[2px] md:translate-x-0">
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
            className={`flex-auto text-white py-[6px] px-2 md:px-4 text-[12px] md:text-[13px] whitespace-nowrap font-sans font-normal rounded-apple-pill transition-colors flex items-center justify-center gap-1.5 disabled:opacity-80 disabled:cursor-not-allowed z-20 ${
              isAdded ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#0066CC] hover:bg-[#0055b3]'
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
            className="flex-auto bg-transparent border border-[#0066CC] text-[#0066CC] py-[6px] px-4 md:px-4 text-[12px] md:text-[13px] whitespace-nowrap font-sans font-normal rounded-apple-pill transition-colors hover:bg-[#0066CC] hover:text-white flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-[#0066CC] disabled:text-white"
          >
            {isPending && loadingBuyId === (product.id || product._id) ? (
              <AppleSpinner size={16} className="text-white" />
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

      {/* Minimal Digital Products Hero Section */}
      {!query && (
        <div className="w-full flex flex-col pt-8 pb-12 md:pt-16 md:pb-20 overflow-hidden px-4 text-center items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 max-w-4xl">
            Build faster with premium <span className="text-[#0066CC]">digital assets</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
            Production-ready SaaS templates, UI kits, and automation scripts built by an engineer, for engineers. Stop reinventing the wheel and launch your next idea this weekend.
          </p>
          <div className="flex gap-4">
            <button onClick={() => {
              const el = document.getElementById('shop-categories');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} className="bg-[#0066CC] hover:bg-[#0055b3] text-white px-6 py-3 rounded-full font-medium transition-colors">
              Browse Categories
            </button>
            <Link href="/shop" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-full font-medium transition-colors">
              View All Assets
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Right Sidebar (Flash Deals, etc) */}
      {!query && (
        <div className="lg:hidden w-full px-2 mt-4 mb-2">
          <RightSidebar />
        </div>
      )}

      {/* Shop by Categories */}
      {!query && leafCategories.length > 0 && (
        <div id="shop-categories" className="p-2 pt-2 md:py-8 md:px-3 w-full -mt-4 md:mt-2 relative group">
          <div className="flex justify-between items-center mb-4 md:mb-8 mt-6 md:mt-0">
            <h2 className="text-lg md:text-[32px] font-semibold tracking-[-0.015em] text-apple-ink">Shop by Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-5">
            {leafCategories.slice(0, 10).map((cat, idx) => {
              const IconOrImage = getCategoryIcon(cat.name);
              const isImg = typeof IconOrImage === 'string';
              return (
                <div 
                  key={cat._id || idx} 
                  onClick={() => router.push(`/shop?${cat.paramKey}=${cat._id}`)}
                  className="bg-[#f5f5f7] hover:bg-[#e5e5ea] cursor-pointer rounded-2xl md:rounded-[20px] flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300"
                >
                  {isImg ? (
                    <img src={IconOrImage} alt={cat.name} className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 object-contain" />
                  ) : (
                    <IconOrImage size={32} strokeWidth={1.2} className="text-apple-ink mb-3 md:mb-4" />
                  )}
                  <span className="text-[12px] md:text-[14px] font-medium text-apple-ink text-center leading-tight">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Products */}
      {!query && (displayedProducts.length > 0 || loading) && (
        <ScrollableProductRow
          title="Latest Products"
          products={displayedProducts}
          renderProductCard={renderProductCard}
          viewAllLink="/shop?section=latest"
          isLoading={loading}
        />
      )}
      {query && displayedProducts.length === 0 && (
        <div className="text-center py-20 bg-apple-parchment rounded-apple-lg border border-apple-hairline w-full -mt-4 md:mt-2">
          <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search query</p>
        </div>
      )}

      {/* Popular Products */}
      {!query && (popularProducts.length > 0 || loadingPopular) && (
        <ScrollableProductRow
          title="Popular Products"
          products={popularProducts}
          renderProductCard={renderProductCard}
          viewAllLink="/shop?section=popular"
          isLoading={loadingPopular}
        />
      )}

      {/* Featured / Explore More */}
      {!query && (featuredProducts.length > 0 || loadingFeatured) && (
        <ScrollableProductRow
          title="Explore More"
          products={featuredProducts}
          renderProductCard={renderProductCard}
          viewAllLink="/shop"
          isLoading={loadingFeatured}
        />
      )}

      {/* Full-width Explore CTA */}
      {!query && (
        <div className="px-3 pb-12 pt-2 md:pt-4">
          <Link
            href="/shop"
            className="group flex items-center justify-between w-full bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/10 rounded-[20px] md:rounded-[24px] p-6 md:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500"
          >
            <div>
              <p className="text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.1em] text-black/50 dark:text-white/50 mb-1.5 md:mb-2">Marketplace</p>
              <h2 className="text-[22px] md:text-[28px] font-semibold tracking-[-0.015em] text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                Browse the full collection
              </h2>
            </div>
            <div className="shrink-0 ml-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center group-hover:bg-[#e8e8ed] dark:group-hover:bg-[#3a3a3c] transition-colors duration-300">
              <ChevronRight className="text-[#1d1d1f] dark:text-[#f5f5f7] transition-transform duration-300 group-hover:translate-x-0.5" size={24} strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      )}
      
      <MarketSEOContent />
    </div>
  );
}
