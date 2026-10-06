"use client";
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Edit, ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import MarketSEOContent from "./MarketSEOContent";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { PRODUCT_TYPE_COLORS } from "@/utils/digitalProducts";
import ServicesStoryteller from "./ServicesStoryteller";
import { motion, AnimatePresence, useMotionValue, useScroll, useTransform } from 'framer-motion';

// Sub-components (extracted for maintainability)
import { getOptimizedUrl } from './marketUtils';
import HeroBackground from './HeroBackground';
import ProcessSection from './ProcessSection';
import StorePreviewSection from './StorePreviewSection';
import EditorialProductShowcase from './EditorialProductShowcase';
import ScrollableProductRow from './ScrollableProductRow';
import BrushUnderline from './BrushUnderline';

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

export default function MarketClientView({ initialData = [], initialPagination = { pages: 1, currentPage: 1 }, initialFeatured = [], initialPopular = [] }) {
  const [products, setProducts] = useState(initialData.filter(p => p.status === 'Live'));
  const [featuredProducts, setFeaturedProducts] = useState(initialFeatured.filter(p => p.status === 'Live'));
  const [popularProducts, setPopularProducts] = useState(initialPopular.filter(p => p.status === 'Live'));
  const [likedProducts, setLikedProducts] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = React.useContext(DashboardContext) || {};
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [isPending, startTransition] = React.useTransition();
  const [loadingBuyId, setLoadingBuyId] = useState(null);
  const [navigatingId, setNavigatingId] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [floorCoords, setFloorCoords] = useState({ y: 0, x: null, textWidth: 500 });
  const searchBarRef = useRef(null);
  
  useEffect(() => {
    setNavigatingId(null);
    setLoadingBuyId(null);
    setLoadingCartId(null);
  }, [pathname, searchParams]);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  useEffect(() => {
    const handleFloor = (e) => setFloorCoords({ y: e.detail.y, x: e.detail.x, textWidth: e.detail.textWidth || 500 });
    window.addEventListener('floor-position', handleFloor);
    return () => window.removeEventListener('floor-position', handleFloor);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (searchBarRef.current) {
            const rect = searchBarRef.current.getBoundingClientRect();
            const scrolled = rect.top < 80;
            if (scrolled !== isScrolledPastHero) {
                setIsScrolledPastHero(scrolled);
                window.dispatchEvent(new CustomEvent('toggle-navbar-search', { detail: scrolled }));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolledPastHero]);

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

  const [windowDim, setWindowDim] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => {
      setWindowDim({ width: document.documentElement.clientWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    api.get('/market/banners').catch(() => {});

    api.get('/market/categories')
      .then(res => {
        setCategories(res.categories || res.data || []);
      })
      .catch(err => console.error("Failed to load categories:", err));

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
      const gap = window.innerWidth >= 768 ? 10 : (window.innerWidth >= 640 ? 0 : 2);
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
        <Link href={`/product/${product.id}`} onClick={() => setNavigatingId(`product-${product.id}`)} className="absolute inset-0 z-10"></Link>
        {navigatingId === `product-${product.id}` && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px]">
             <AppleSpinner size={32} className="text-[#0071e3]" />
          </div>
        )}
      {product.photos && JSON.parse(product.photos)[0] ? (
        <div className="aspect-square w-full bg-brand-cloud dark:bg-brand-dark flex items-center justify-center p-4 overflow-hidden relative border-b border-slate-100 dark:border-white/10">
          <Image src={getOptimizedUrl(JSON.parse(product.photos)[0])} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 ease-out group-hover:scale-105" />
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link 
              href={`/admin/products/${product.id}`}
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
                setLoadingCartId(product.id || product._id);
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
    <div className="min-h-screen font-sans bg-transparent">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />

      {/* World-Class Premium Hero Section */}
      {!query && (
        <div className="relative w-full border-b border-white/[0.05]">
          {/* Fixed Container for Hero (Locks it completely in place) */}
          <motion.div style={{ opacity: heroOpacity }} className="fixed top-0 left-0 w-full h-[100vh] flex flex-col items-center justify-start overflow-hidden z-0 pointer-events-none">
            
          {/* Hero Background (white bg + 3D grid) */}
          <HeroBackground floorCoords={floorCoords} />

          {/* Black lines connecting the Liquid Glass box to the screen edges (Scrolls with the box) */}
          <svg 
            className="absolute top-0 left-0 w-full h-[100vh] pointer-events-none z-10 overflow-visible"
            style={{ 
              '--max-box-half': windowDim.width > 0 
                ? (windowDim.width < 768 ? '47.5vw' : '293px')
                : 'min(293px, 47.5vw)',
              '--outer-line-x': 'calc(var(--max-box-half) - 24px)',
              '--inner-bound': 'calc(var(--outer-line-x) * 0.95)',
              '--grid-bottom': typeof window !== 'undefined' && window.innerWidth < 768 ? '160px' : 'calc(20vh + 10px)'
            }}
          >
            {/* Outer Left Line */}
            <line 
              x1="0%" 
              y1="140" 
              x2="calc(50% - var(--outer-line-x))" 
              y2="var(--grid-bottom)" 
              stroke="#94a3b8" 
              strokeWidth="1" 
              opacity="0.4"
            />
            
            {/* Inner Perspective Lines */}
            {windowDim.width > 0 && Array.from({ length: 15 }).map((_, i) => {
              // 17 lines total (outer left + 15 inner + outer right)
              // i goes from 0 to 14, which corresponds to internal segments 1 to 15 (out of 16)
              const segment = i + 1;
              const isSmall = windowDim.width < 768;
              const yB = isSmall ? 160 : windowDim.height * 0.2 + 10;
              const maxBoxHalf = isSmall ? (windowDim.width * 0.475 - 24) : Math.min(293, windowDim.width * 0.475) - 24;
              
              const xB = windowDim.width / 2 - maxBoxHalf;
              const xRightB = windowDim.width / 2 + maxBoxHalf;
              
              // Calculate equivalent x origin at y=-150 for the outer lines
              const xA_equiv = (-150 - 140) * xB / (yB - 140);
              const xRightA_equiv = windowDim.width + (-150 - 140) * (xRightB - windowDim.width) / (yB - 140);
              
              // Apply an easing curve to push lines slightly away from the edges (towards the center)
              // We map linear t (0..1) to u (-1..1), apply a power > 1, then map back to 0..1
              const t = segment / 16;
              const u = t * 2 - 1;
              const power = 1.25; // 1.0 is linear, >1.0 pulls towards center
              const t_eased = (Math.sign(u) * Math.pow(Math.abs(u), power) + 1) / 2;
              
              // Interpolate at y=-150
              const x1 = xA_equiv + (xRightA_equiv - xA_equiv) * t_eased;
              
              // Interpolate at y=yB
              const x2 = xB + (xRightB - xB) * t_eased;
              
              return (
                <line 
                  key={`v-${i}`}
                  x1={x1} 
                  y1="-150" 
                  x2={x2} 
                  y2="var(--grid-bottom)" 
                  stroke="#94a3b8" 
                  strokeWidth="1" 
                  opacity="0.4"
                />
              );
            })}

            {/* Horizontal Perspective Lines */}
            {windowDim.width > 0 && Array.from({ length: 12 }).map((_, i) => {
              const isSmall = windowDim.width < 768;
              // Base coordinates for interpolation
              const yB = isSmall ? 160 : windowDim.height * 0.2 + 10; // Matches CSS
              const yA = -150; // Align with the new unbroken Outer Lines top origin
              const maxBoxHalf = isSmall ? (windowDim.width * 0.475 - 24) : Math.min(293, windowDim.width * 0.475) - 24;
              
              const xB = windowDim.width / 2 - maxBoxHalf;
              const xRightB = windowDim.width / 2 + maxBoxHalf;
              
              const topY = -150;
              
              // We use power function (squared) to make distance between lines increase towards the top
              const t = Math.pow((i + 1) / 16, 2); 
              
              const currentY = yB + t * (topY - yB);
              
              // Find intersection with the outer lines defined by (0, 140) and (xB, yB)
              const currentXLeft = (currentY - 140) * xB / (yB - 140);
              const currentXRight = windowDim.width + (currentY - 140) * (xRightB - windowDim.width) / (yB - 140);
              
              return (
                <line 
                  key={`h-${i}`}
                  x1={currentXLeft} 
                  y1={currentY} 
                  x2={currentXRight} 
                  y2={currentY} 
                  stroke="#94a3b8" 
                  strokeWidth="1" 
                  opacity="0.4"
                />
              );
            })}

            {/* Outer Right Line */}
            <line 
              x1="100%" 
              y1="140" 
              x2="calc(50% + var(--outer-line-x))" 
              y2="var(--grid-bottom)" 
              stroke="#94a3b8" 
              strokeWidth="1" 
              opacity="0.4"
            />
          </svg>

          {/* Floating Tilted Boxes along the outer lines */}
          {windowDim.width > 0 && (() => {
            const isSmall = windowDim.width < 768;
            const yB = isSmall ? 160 : windowDim.height * 0.2 + 10;
            const yA = 140; // Using the screen edge intersection
            // Subtract 24px for the rounded pill corner radius
            const maxBoxHalf = isSmall ? (windowDim.width * 0.475 - 24) : Math.min(293, windowDim.width * 0.475) - 24;
            
            const xA = 0;
            const xB = windowDim.width / 2 - maxBoxHalf;
            
            const xRightA = windowDim.width;
            const xRightB = windowDim.width / 2 + maxBoxHalf;

            // Left line math
            const dxLeft = xB - xA;
            const dyLeft = yB - yA;
            const angleLeft = (Math.atan2(dyLeft, dxLeft) * 180) / Math.PI;

            // Right line math
            const dxRight = xRightB - xRightA;
            const dyRight = yB - yA;
            let angleRight = (Math.atan2(dyRight, dxRight) * 180) / Math.PI;
            if (angleRight > 90) angleRight -= 180; // Keep upright

            // Positions (0 = top, 1 = bottom at the liquid glass box)
            const getLeftPos = (t) => ({ x: xA + t * dxLeft, y: yA + t * dyLeft });
            const getRightPos = (t) => ({ x: xRightA + t * dxRight, y: yA + t * dyRight });

            // Adjusted t=0.86 to visually match the old t=0.75 which was relative to yA=70
            const leftBox2 = getLeftPos(0.86); // Higher up (Big box)
            leftBox2.y -= 25; // Move up 25px
            // 50px (half big box) + 35px (gap) + 35px (half small box) = 120px difference between centers
            const leftBox1 = { y: leftBox2.y + 120 }; 
            
            const rightBox2 = getRightPos(0.86); // Higher up (Big box)
            rightBox2.y -= 25; // Move up 25px
            const rightBox1 = { y: rightBox2.y + 120 };

            return (
              <div className="absolute top-0 left-0 w-full h-[100vh] pointer-events-none z-20 overflow-visible">
                {/* Left Boxes */}
                <div 
                  className="absolute rounded-r-full bg-gradient-to-r from-brand-blue to-brand-blue/0 shadow-[0_0_35px_rgba(29,95,209,0.6)] opacity-[0.30] blur-[25px]"
                  style={{
                    left: '0px',
                    top: leftBox1.y,
                    transformOrigin: 'left center',
                    transform: `translateY(-50%) rotate(${angleLeft}deg)`,
                    width: isSmall ? '80vw' : '525px',
                    height: '70px',
                  }}
                />

                <div 
                  className="absolute rounded-r-full bg-gradient-to-r from-brand-blue to-brand-blue/0 shadow-[0_0_50px_rgba(29,95,209,0.7)] opacity-[0.40] blur-[22px]"
                  style={{
                    left: '0px',
                    top: leftBox2.y,
                    transformOrigin: 'left center',
                    transform: `translateY(-50%) rotate(${angleLeft}deg)`,
                    width: isSmall ? '90vw' : '525px',
                    height: '74px',
                  }}
                />

                {/* Right Boxes */}
                <div 
                  className="absolute rounded-l-full bg-gradient-to-l from-brand-blue to-brand-blue/0 shadow-[0_0_35px_rgba(29,95,209,0.6)] opacity-[0.30] blur-[25px]"
                  style={{
                    right: '0px',
                    top: rightBox1.y,
                    transformOrigin: 'right center',
                    transform: `translateY(-50%) rotate(${angleRight}deg)`,
                    width: isSmall ? '80vw' : '525px',
                    height: '70px',
                  }}
                />

                <div 
                  className="absolute rounded-l-full bg-gradient-to-l from-brand-blue to-brand-blue/0 shadow-[0_0_50px_rgba(29,95,209,0.7)] opacity-[0.40] blur-[22px]"
                  style={{
                    right: '0px',
                    top: rightBox2.y,
                    transformOrigin: 'right center',
                    transform: `translateY(-50%) rotate(${angleRight}deg)`,
                    width: isSmall ? '90vw' : '525px',
                    height: '74px',
                  }}
                />

                {/* Center Ambient Bridge */}
                <div 
                  className="absolute rounded-full bg-brand-blue opacity-[0.12] blur-[80px]"
                  style={{
                    left: '50%',
                    top: '0px',
                    transform: 'translate(-50%, -40%)',
                    width: '120%',
                    height: '400px',
                  }}
                />
              </div>
            );
          })()}

          
          {/* Liquid Glass Box (In front of text) */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-[160px] md:top-[calc(20vh+10px)] h-[44px] md:h-[56px] w-[95%] md:w-[586px] max-w-[700px] rounded-[50px] flex items-center justify-between z-[50] pointer-events-auto p-[3px] md:p-[5px]"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderTop: '1px solid rgba(255, 255, 255, 1)',
              boxShadow: `
                0 20px 40px -10px rgba(0, 0, 0, 0.1),
                0 25px 50px 0px rgba(37, 99, 235, 0.35),
                inset 0px 2px 8px rgba(255, 255, 255, 1)
              `
            }}
          >
            {/* Inner Border Wrapper */}
            <div className="w-full h-full flex items-center justify-between border border-slate-200/80 rounded-[40px] pl-[1px] pr-0.5 min-[350px]:pr-1 min-[450px]:pr-1.5">
              {/* Left Content: Avatars + Text */}
              <div className="flex items-center md:pl-1">
                <div className="flex -space-x-2.5 sm:-space-x-3 mr-1.5 min-[380px]:mr-2 sm:mr-3 md:mr-4">
                  <div className="w-6 h-6 min-[400px]:w-7 min-[400px]:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-[2px] md:border-[2.5px] border-white bg-slate-200 overflow-hidden shadow-sm relative z-0">
                    <Image src="https://i.pravatar.cc/100?img=33" alt="user" fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="w-6 h-6 min-[400px]:w-7 min-[400px]:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-[2px] md:border-[2.5px] border-white bg-slate-200 overflow-hidden shadow-sm relative z-10">
                    <Image src="https://i.pravatar.cc/100?img=47" alt="user" fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="w-6 h-6 min-[400px]:w-7 min-[400px]:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-[2px] md:border-[2.5px] border-white bg-slate-200 overflow-hidden shadow-sm relative z-20">
                    <Image src="https://i.pravatar.cc/100?img=12" alt="user" fill className="object-cover" sizes="40px" />
                  </div>
                </div>
                <span className="hidden min-[320px]:inline-block text-[10px] min-[350px]:text-[11px] min-[380px]:text-[12px] sm:text-[13px] md:text-[16px] font-medium text-slate-600 whitespace-nowrap tracking-tight sm:tracking-normal">
                  3+ Ready-to-launch website
                </span>
              </div>

              {/* Right Button */}
              <Link href="/store" 
                onClick={() => setNavigatingId('store')}
                className="flex-1 min-[320px]:flex-none h-[88%] md:h-[85%] relative -translate-x-[1px] ml-1.5 min-[380px]:ml-2 sm:ml-3 md:ml-8 px-2 min-[380px]:px-2.5 min-[450px]:px-3 md:px-7 border-[1.5px] border-brand-blue bg-transparent rounded-full flex items-center justify-center text-brand-blue font-medium text-[12px] min-[320px]:text-[10px] min-[350px]:text-[11px] min-[380px]:text-[12px] sm:text-[13px] md:text-[16px] whitespace-nowrap hover:bg-brand-blue/5 transition-colors cursor-pointer pointer-events-auto"
                style={{ pointerEvents: navigatingId === 'store' ? 'none' : 'auto' }}
              >
                {navigatingId === 'store' ? <AppleSpinner size={16} className="text-brand-blue" /> : <>Launch Your Site &rarr;
              </>}
              </Link>
            </div>
          </div>
          
          {/* Tagline Section */}
          <div className="absolute top-[calc(20vh+120px)] md:top-[calc(20vh+140px)] left-1/2 -translate-x-1/2 z-20 w-full px-2 min-[320px]:px-6 flex flex-col items-center justify-center max-w-6xl mx-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="w-full flex flex-col items-center justify-center"
            >
              <h1
                className="text-[24px] min-[340px]:text-[30px] min-[380px]:text-[36px] min-[500px]:text-[5vw] lg:text-[64px] xl:text-[72px] font-display font-medium text-center leading-[1.1] tracking-tight"
                style={{ color: '#0f172a' }}
              >
                <span className="whitespace-nowrap">Build, Launch & Scale</span>
                <br className="hidden min-[500px]:block" />
                <span className="min-[500px]:hidden"> </span>
                <span className="min-[500px]:whitespace-nowrap">
                  your&nbsp;business&nbsp;with{" "}
                  <span className="whitespace-nowrap">
                    Expert{" "}
                    <span className="relative inline-block group px-1">
                      <span className="relative z-10 transition-colors duration-500" style={{ color: '#0f172a' }}>Precision</span>
                      <BrushUnderline colorClass="text-brand-blue" delay={0.2} />
                    </span>
                  </span>
                </span>
              </h1>
              
              <p className="mt-4 min-[320px]:mt-6 md:mt-8 text-[12px] min-[320px]:text-[13.5px] min-[380px]:text-[15px] md:text-[18px] lg:text-[20px] text-center max-w-[95%] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl leading-relaxed text-slate-500">
                We partner with you to build, launch, maintain, and continuously improve your{" "}
                <span className="relative inline-block group px-1">
                  <span className="relative z-10 font-medium text-slate-700 transition-colors duration-500">websites</span>
                  <BrushUnderline colorClass="text-brand-blue" delay={0.4} />
                </span>, <br className="hidden md:block" />{" "}
                <span className="relative inline-block group px-1">
                  <span className="relative z-10 font-medium text-slate-700 transition-colors duration-500">SaaS</span>
                  <BrushUnderline colorClass="text-brand-blue" delay={0.6} />
                </span>, and{" "}
                <span className="relative inline-block group px-1">
                  <span className="relative z-10 font-medium text-slate-700 transition-colors duration-500">web applications</span>
                  <BrushUnderline colorClass="text-brand-blue" delay={0.8} />
                </span>{" "}
                with dedicated care long after launch.
              </p>

              {/* Call to Actions */}
              <div className="mt-8 min-[320px]:mt-10 md:mt-12 flex flex-row items-center justify-center gap-2 min-[320px]:gap-3 sm:gap-6 pointer-events-auto w-full">
                {/* Liquid Glass Button (See Plans) */}
                <button 
                  onClick={() => window.dispatchEvent(new Event('expandServices'))}
                  className="group relative px-4 py-2 min-[320px]:px-5 min-[320px]:py-2.5 min-[380px]:px-8 min-[380px]:py-3.5 md:py-4 md:px-10 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(241, 245, 249, 0.7)', /* Light gray/slate tone */
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(203, 213, 225, 0.8)', /* Uniform subtle gray border */
                    boxShadow: '0 8px 25px -4px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 font-medium text-[11px] min-[320px]:text-[13px] min-[380px]:text-[15px] md:text-[17px] text-slate-700 tracking-tight whitespace-nowrap">See Plans</span>
                </button>

                {/* Primary CTA (Partner with Us) */}
                <button 
                  onClick={() => {
                  setNavigatingId('partner');
                  router.push('/partner');
                }}
                disabled={navigatingId === 'partner'}
                  className="group relative px-4 py-2 min-[320px]:px-5 min-[320px]:py-2.5 min-[380px]:px-8 min-[380px]:py-3.5 md:py-4 md:px-10 rounded-full border border-transparent bg-brand-blue text-white overflow-hidden transition-all duration-300 hover:bg-blue-600 hover:shadow-[0_8px_30px_-5px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 font-medium text-[11px] min-[320px]:text-[13px] min-[380px]:text-[15px] md:text-[17px] tracking-tight flex items-center gap-1.5 min-[380px]:gap-2 whitespace-nowrap">
                  {navigatingId === 'partner' ? (
                    <><AppleSpinner size={20} className="text-white" /> Partner with Us</>
                  ) : (
                    <>
                    Partner with Us
                    <svg className="w-3 h-3 min-[320px]:w-3.5 min-[320px]:h-3.5 min-[380px]:w-4 min-[380px]:h-4 md:w-5 md:h-5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                  )}
                </span>
                </button>
              </div>
            </motion.div>
          </div>
          </motion.div>
          
          {/* Scrollable Overlay Content */}
          <div className="relative z-10 w-full flex flex-col items-center pointer-events-none mt-[100vh]">
            {/* Solid Content Block that scrolls over the fixed background */}
            <div className="w-full bg-black z-30 pointer-events-auto rounded-t-[32px] border-t border-white/[0.05] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center pt-8 md:pt-16">
              {/* Premium Services Scrolling Narrative */}
              <ServicesStoryteller />
          </div>

            {/* Store Preview / Ready-made Alternative */}
            <StorePreviewSection products={displayedProducts.length > 0 ? displayedProducts : (popularProducts.length > 0 ? popularProducts : products)} />
          </div>
        </div>
      )}
      
      {/* Product Lifecycle Process Section */}
      {!query && <ProcessSection />}

      {/* Content Below Hero */}
      <div className="relative z-10 w-full bg-transparent">
      
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



