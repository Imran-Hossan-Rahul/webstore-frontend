"use client";
import React, { useEffect, useState, useContext } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Search, Loader2, Edit, ChevronDown, Filter, X, Check } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import AppleSpinner from "@/components/ui/AppleSpinner";
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

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const sectionQuery = searchParams.get('section') || '';

  const { user } = useContext(DashboardContext) || {};
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory_id') || '');
  const [selectedChildCategory, setSelectedChildCategory] = useState(searchParams.get('childCategory_id') || '');
  const [isFeatured, setIsFeatured] = useState(sectionQuery === 'featured');
  const [isPopular, setIsPopular] = useState(sectionQuery === 'popular');
  const [isLatest, setIsLatest] = useState(sectionQuery === 'latest');
  const [productIds, setProductIds] = useState(searchParams.get('ids') || '');
  const [sortOrder, setSortOrder] = useState('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const [loadingBuyId, setLoadingBuyId] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isPending, startTransition] = React.useTransition();

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
          quantity: 1,
          price: product.selling_price
        };
        localStorage.setItem('cartDetails', JSON.stringify(cartDetails));

        window.dispatchEvent(new Event('addedToCart'));
      } catch(e) {
        console.error("Cart error", e);
      } finally {
        setLoadingCartId(null);
      }
    }, 400);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();
    const prodId = product.id || product._id;
    setLoadingBuyId(prodId);
    startTransition(() => {
      const url = `/checkout?productId=${prodId}&quantity=1&variantSummary=&finalPrice=${product.selling_price}&originalPrice=${product.original_price}`;
      router.push(url);
    });
  };

  useEffect(() => {
    api.get('/market/categories')
      .then(res => {
        const data = res.data || res || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedChildCategory('');
    setIsFeatured(false);
    setIsPopular(false);
    setIsLatest(false);
    setProductIds('');
    setMinPrice('');
    setMaxPrice('');
    setTempMinPrice('');
    setTempMaxPrice('');
    setSortOrder('latest');
    setPage(1);
    router.push('/shop');
  };

  // Compute breadcrumb label from URL params + category data
  const activeBreadcrumb = React.useMemo(() => {
    if (productIds) {
      return [
        { label: 'Shop', onClick: resetFilters },
        { label: "Grand Opening Offer", onClick: null },
      ];
    }
    
    if (sectionQuery === 'popular') {
      return [
        { label: 'Shop', onClick: resetFilters },
        { label: 'Popular Products', onClick: null },
      ];
    }
    
    if (sectionQuery === 'featured') {
      return [
        { label: 'Shop', onClick: resetFilters },
        { label: 'Featured Products', onClick: null },
      ];
    }

    if (searchParams.get('section') === 'latest' || searchParams.get('sort') === 'latest') {
      return [
        { label: 'Shop', onClick: resetFilters },
        { label: 'Latest Products', onClick: null },
      ];
    }

    if (!categories.length) return null;
    for (const cat of categories) {
      if (cat._id === selectedCategory || cat.id === selectedCategory) {
        return [
          { label: 'Shop', onClick: resetFilters },
          { label: cat.name, onClick: () => router.push(`/shop?category_id=${cat._id}`) },
        ];
      }
      for (const sub of (cat.subcategories || [])) {
        if (sub._id === selectedSubCategory || sub.id === selectedSubCategory) {
          return [
            { label: 'Shop', onClick: resetFilters },
            { label: cat.name, onClick: () => router.push(`/shop?category_id=${cat._id}`) },
            { label: sub.name, onClick: () => router.push(`/shop?subCategory_id=${sub._id}`) },
          ];
        }
        for (const child of (sub.subcategories || [])) {
          if (child._id === selectedChildCategory || child.id === selectedChildCategory) {
            return [
              { label: 'Shop', onClick: resetFilters },
              { label: cat.name, onClick: () => router.push(`/shop?category_id=${cat._id}`) },
              { label: sub.name, onClick: () => router.push(`/shop?subCategory_id=${sub._id}`) },
              { label: child.name, onClick: null },
            ];
          }
        }
      }
    }
    return null;
  }, [categories, selectedCategory, selectedSubCategory, selectedChildCategory, productIds, sectionQuery, searchParams]);

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 30,
        status: 'Live'
      });
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedSubCategory) params.append('subCategory_id', selectedSubCategory);
      if (selectedChildCategory) params.append('childCategory_id', selectedChildCategory);
      if (isFeatured) params.append('isFeatured', 'true');
      if (isPopular) params.append('isPopular', 'true');
      if (isLatest) params.append('isLatest', 'true');
      if (productIds) params.append('ids', productIds);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await api.get(`/market/products?${params.toString()}`);
      let data = res.data || [];
      const pagination = res.pagination || {};

      // Local sorting since API might not support it out of the box
      if (sortOrder === 'price_asc') {
        data.sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
      } else if (sortOrder === 'price_desc') {
        data.sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
      }

      const liveProducts = data.filter(p => p.status === 'Live');

      setProducts(liveProducts);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sync filter states from URL whenever searchParams change (e.g. sidebar navigation)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category_id') || '');
    setSelectedSubCategory(searchParams.get('subCategory_id') || '');
    setSelectedChildCategory(searchParams.get('childCategory_id') || '');
    setProductIds(searchParams.get('ids') || '');
    const section = searchParams.get('section') || '';
    setIsFeatured(section === 'featured');
    setIsPopular(section === 'popular');
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedChildCategory, isFeatured, isPopular, productIds, sortOrder, minPrice, maxPrice]);

  // Signal global loader that we are fetching data
  if (typeof window !== 'undefined') {
    if (loading && page === 1) {
      window.isFetchingData = true;
    }
  }

  useEffect(() => {
    if (!loading) {
      if (typeof window !== 'undefined') {
        window.isFetchingData = false;
        window.dispatchEvent(new Event('nextPageReady'));
      }
    }
  }, [loading]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages || newPage === page) return;
      setPage(newPage);
      fetchProducts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className="mt-12 flex justify-center items-center space-x-1 md:space-x-2 pb-8">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || loading}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed text-apple-ink' : 'text-apple-ink hover:bg-black/5 dark:hover:bg-white/10'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[15px] font-sans font-medium text-apple-ink hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              1
            </button>
            {startPage > 2 && <span className="text-apple-muted font-sans tracking-widest px-1">...</span>}
          </>
        )}

        {pageNumbers.map(num => (
          <button
            key={num}
            onClick={() => handlePageChange(num)}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-[15px] font-sans transition-all ${num === page ? 'bg-[#0071e3] text-white shadow-sm font-semibold' : 'text-apple-ink hover:bg-black/5 dark:hover:bg-white/10 font-medium'}`}
          >
            {num}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-apple-muted font-sans tracking-widest px-1">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[15px] font-sans font-medium text-apple-ink hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || loading}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${page === totalPages ? 'opacity-30 cursor-not-allowed text-apple-ink' : 'text-apple-ink hover:bg-black/5 dark:hover:bg-white/10'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.replace(`/shop?q=${encodeURIComponent(searchQuery)}`);
  };

  const applyPriceFilter = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setShowMobileFilters(false);
  };

  const renderProductCard = (product) => (
    <div key={product.id} className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-apple-lg transition-all duration-300 overflow-hidden border border-apple-hairline flex flex-col relative group">
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
      {product.photos && (() => {
        try {
            const parsed = JSON.parse(product.photos);
            return parsed[0] ? (
              <div className="aspect-square w-full bg-transparent flex items-center justify-center p-2 md:p-4 overflow-hidden relative transition-colors duration-300">
                <img 
                  src={getOptimizedUrl(parsed[0])} 
                  alt={product.title} 
                  loading="lazy"
                  className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-700 ease-in-out"
                />
              </div>
            ) : null;
        } catch(e) { return null; }
      })()}
      <div className="p-3 md:p-4 flex flex-col flex-1 items-center bg-transparent text-center">
        <h3 className="font-normal text-[17px] text-apple-ink leading-[1.47] tracking-[-0.022em] mb-1 md:mb-2 line-clamp-2">{product.title}</h3>
        <div className="flex justify-center items-center gap-2 mb-3 md:mb-4 flex-1">
          <span className="text-[17px] font-normal text-apple-ink">BDT {formatPrice(product.selling_price)}</span>
          {Number(product.original_price) > Number(product.selling_price) && (
            <span className="text-[14px] text-apple-muted line-through">BDT {formatPrice(product.original_price)}</span>
          )}
        </div>
        <div className="w-full flex flex-row gap-1.5 md:gap-2 mt-auto relative z-20 px-1 -translate-x-[5px] md:translate-x-0">
          <button 
            onClick={(e) => {
              if (cartItems.includes((product.id || product._id).toString())) {
                e.preventDefault();
                e.stopPropagation();
                router.push('/cart');
              } else {
                handleAddToCart(e, product);
              }
            }}
            disabled={loadingCartId === (product.id || product._id)}
            className={`flex-auto text-white py-[6px] px-2 md:px-4 text-[12px] md:text-[13px] whitespace-nowrap font-sans font-normal rounded-full transition-colors flex items-center justify-center gap-1.5 disabled:opacity-80 disabled:cursor-not-allowed ${
              cartItems.includes((product.id || product._id).toString()) ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#0071e3] hover:bg-[#0077ed]'
            }`}
          >
            {loadingCartId === (product.id || product._id) ? (
              <AppleSpinner size={16} className="text-white" />
            ) : cartItems.includes((product.id || product._id).toString()) ? (
              <><Check size={14} /> Added</>
            ) : (
              "Add to Cart"
            )}
          </button>
          <button 
            onClick={(e) => handleBuyNow(e, product)}
            disabled={isPending && loadingBuyId === (product.id || product._id)}
            className="flex-auto bg-transparent border border-[#0071e3] text-[#0071e3] py-[6px] px-2 md:px-4 text-[12px] md:text-[13px] whitespace-nowrap font-sans font-normal rounded-full transition-colors hover:bg-[#0071e3] hover:text-white flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-[#0071e3] disabled:text-white"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-[#0071e3]/30">
      

      <div className="w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Sidebar Filters — mobile: full-screen overlay, desktop: sticky column */}
        <div className={`
          fixed inset-0 z-[45] bg-white/40 dark:bg-[#0a0a0a]/60 backdrop-blur-xl shadow-2xl md:bg-transparent md:backdrop-blur-none md:shadow-none
          md:relative md:inset-auto md:z-auto
          md:w-64 lg:w-72 flex-shrink-0 border-r border-white/60 dark:border-white/10 md:border-apple-hairline md:dark:border-apple-hairline
          transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300
        `}>
          <div className="h-full md:sticky md:top-20 md:max-h-[calc(100vh-80px)] overflow-y-auto p-6 pt-20 md:pt-6 scrollbar-hide">
            <div className="flex items-center justify-between mb-8 md:hidden">
              <h2 className="text-2xl font-bold text-apple-ink">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 text-apple-muted hover:text-apple-ink">
                <X size={24} />
              </button>
            </div>





            <div className="mb-8 mt-4">
              <h3 className="text-[15px] font-medium text-apple-ink mb-4">Price (BDT)</h3>
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="number" 
                  value={tempMinPrice}
                  onChange={e => setTempMinPrice(e.target.value)}
                  placeholder="Min" 
                  className="w-full bg-white dark:bg-[#1d1d1f] border border-apple-hairline rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#0071e3] transition-colors text-apple-ink placeholder:text-apple-muted"
                />
                <span className="text-apple-muted">-</span>
                <input 
                  type="number" 
                  value={tempMaxPrice}
                  onChange={e => setTempMaxPrice(e.target.value)}
                  placeholder="Max" 
                  className="w-full bg-white dark:bg-[#1d1d1f] border border-apple-hairline rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#0071e3] transition-colors text-apple-ink placeholder:text-apple-muted"
                />
              </div>
              <button 
                onClick={applyPriceFilter}
                className="w-full bg-[#f5f5f7] dark:bg-white/5 text-apple-ink font-semibold py-2 rounded-lg text-[14px] border border-apple-hairline hover:bg-[#e5e5ea] dark:hover:bg-white/10 transition-colors"
              >
                Apply Price
              </button>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          
          {/* Top Bar Container */}
          <div className="contents md:flex md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-6 md:pb-6 md:border-b md:border-apple-hairline/50">
            
            {/* Breadcrumbs (Scrolls away on mobile) */}
            <div className="w-full md:max-w-md flex items-center overflow-hidden px-4 pt-[22px] pb-1.5 md:p-0 -mt-[16px] md:mt-0 bg-white/80 dark:bg-black/80 backdrop-blur-[20px] backdrop-saturate-[180%] md:bg-transparent md:backdrop-blur-none md:backdrop-saturate-100 relative z-30">
              {searchQuery ? (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[15px] md:text-[16px] text-apple-ink font-semibold w-full pb-0.5 md:pb-0">
                  Search Results for &quot;{searchQuery}&quot;
                </div>
              ) : activeBreadcrumb ? (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] md:text-[13px] text-apple-muted font-normal w-full pb-0.5 md:pb-0">
                  {activeBreadcrumb.map((crumb, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="opacity-40 shrink-0">›</span>}
                      {crumb.onClick ? (
                        <button
                          onClick={crumb.onClick}
                          className={`transition-colors hover:text-[#0071e3] shrink-0 ${
                            i === activeBreadcrumb.length - 1 ? 'text-apple-ink font-normal pointer-events-none' : ''
                          }`}
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-apple-ink font-normal shrink-0">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[14px] md:text-[14px] text-apple-ink font-semibold md:font-normal">
                  Shop
                </div>
              )}
            </div>
            
            {/* Filter + Sort By (Sticky on mobile globally) */}
            <div className="sticky md:static top-[44px] z-40 w-full md:w-auto px-4 pt-0.5 pb-1.5 border-b border-apple-hairline/50 md:border-none md:p-0 bg-white/80 dark:bg-black/80 backdrop-blur-[20px] backdrop-saturate-[180%] md:bg-transparent md:backdrop-blur-none md:backdrop-saturate-100 flex items-center justify-between md:justify-end gap-2 mt-0">
              <span className="text-[13px] md:text-[14px] font-normal text-apple-muted whitespace-nowrap hidden md:block">Sort by:</span>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button onClick={() => setShowMobileFilters(true)} className="md:hidden flex items-center justify-center gap-1.5 bg-white dark:bg-black/20 border border-apple-hairline text-[12.5px] text-apple-ink font-medium py-1.5 px-3 rounded-full transition-colors flex-1 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10">
                  <Filter size={14} className="text-apple-ink" />
                  Filter
                </button>

                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full md:w-auto bg-white dark:bg-black/20 border border-apple-hairline md:border-none md:bg-transparent text-[12.5px] md:text-[15px] text-apple-ink font-medium md:font-normal py-1.5 px-3 focus:ring-0 flex items-center justify-center md:justify-end gap-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 md:hover:bg-black/5 md:dark:hover:bg-white/10 rounded-full md:rounded-lg transition-colors shadow-sm md:shadow-none"
                  >
                    {sortOrder === 'latest' ? 'Latest Arrivals' : sortOrder === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
                    <ChevronDown className={`w-[14px] h-[14px] md:w-[18px] md:h-[18px] text-apple-muted transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                    <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white/90 dark:bg-[#2c2c2e]/90 backdrop-blur-2xl border border-apple-hairline rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 p-1.5">
                      <button
                        onClick={() => { setSortOrder('latest'); setIsSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[14px] transition-colors rounded-xl flex items-center justify-between ${sortOrder === 'latest' ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold' : 'text-apple-ink hover:bg-black/5 dark:hover:bg-white/10 font-medium'}`}
                      >
                        Latest Arrivals
                        {sortOrder === 'latest' && (
                          <svg className="w-4 h-4 text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => { setSortOrder('price_asc'); setIsSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[14px] transition-colors rounded-xl flex items-center justify-between ${sortOrder === 'price_asc' ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold' : 'text-apple-ink hover:bg-black/5 dark:hover:bg-white/10 font-medium'}`}
                      >
                        Price: Low to High
                        {sortOrder === 'price_asc' && (
                          <svg className="w-4 h-4 text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => { setSortOrder('price_desc'); setIsSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[14px] transition-colors rounded-xl flex items-center justify-between ${sortOrder === 'price_desc' ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold' : 'text-apple-ink hover:bg-black/5 dark:hover:bg-white/10 font-medium'}`}
                      >
                        Price: High to Low
                        {sortOrder === 'price_desc' && (
                          <svg className="w-4 h-4 text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </>
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 p-4 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] opacity-80">
                <AppleSpinner className="w-8 h-8 text-apple-muted animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 px-4">
                <Search strokeWidth={1.5} className="w-[60px] h-[60px] text-[#86868b] opacity-40 mb-6" />
                <h3 className="text-[24px] font-sans font-semibold text-slate-900 dark:text-white tracking-tight mb-2">No Results</h3>
                <p className="text-[16px] font-sans font-normal text-[#86868b] text-center max-w-[300px] leading-relaxed">
                  Try adjusting your filters or search query to find what you&apos;re looking for.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                  {products.map(renderProductCard)}
                </div>
                {renderPagination()}
              </>
            )}
          </div>

        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
}
