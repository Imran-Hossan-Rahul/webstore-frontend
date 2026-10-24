"use client";
import React, { useEffect, useState, useContext } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Search, Loader2, Edit, ChevronDown, Filter, X, Check } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { PRODUCT_TYPES, PRODUCT_TYPE_COLORS } from "@/utils/digitalProducts";
import { LoadingState, EmptyState } from '@/components/ui/States';
import { Button } from "@/components/ui/Button";
import GlassBackground from '@/components/dashboard/market/GlassBackground';
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
  const [selectedProductType, setSelectedProductType] = useState(searchParams.get('productType') || '');
  
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
  const pathname = usePathname();

  useEffect(() => {
    setLoadingCartId(null);
    setLoadingBuyId(null);
  }, [pathname, searchParams]);

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
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);

        // If category_name param is present, resolve it to an ID
        const categoryName = searchParams.get('category_name');
        if (categoryName && !searchParams.get('category_id')) {
          const match = cats.find(
            c => c.name?.toLowerCase() === categoryName.toLowerCase()
          );
          if (match) {
            setSelectedCategory(match._id || match.id);
          }
        }
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
    setSelectedProductType('');
    setSortOrder('latest');
    setPage(1);
    router.push('/store');
  };

  // Compute breadcrumb label from URL params + category data
  const activeBreadcrumb = React.useMemo(() => {
    if (productIds) {
      return [
        { label: 'Store', onClick: resetFilters },
        { label: "Grand Opening Offer", onClick: null },
      ];
    }
    
    if (sectionQuery === 'popular') {
      return [
        { label: 'Store', onClick: resetFilters },
        { label: 'Popular Products', onClick: null },
      ];
    }
    
    if (sectionQuery === 'featured') {
      return [
        { label: 'Store', onClick: resetFilters },
        { label: 'Featured Products', onClick: null },
      ];
    }

    if (searchParams.get('section') === 'latest' || searchParams.get('sort') === 'latest') {
      return [
        { label: 'Store', onClick: resetFilters },
        { label: 'Latest Products', onClick: null },
      ];
    }

    if (!categories.length) return null;
    for (const cat of categories) {
      if (cat._id === selectedCategory || cat.id === selectedCategory) {
        return [
          { label: 'Store', onClick: resetFilters },
          { label: cat.name, onClick: () => router.push(`/store?category_id=${cat._id}`) },
        ];
      }
      for (const sub of (cat.subcategories || [])) {
        if (sub._id === selectedSubCategory || sub.id === selectedSubCategory) {
          return [
            { label: 'Store', onClick: resetFilters },
            { label: cat.name, onClick: () => router.push(`/store?category_id=${cat._id}`) },
            { label: sub.name, onClick: () => router.push(`/store?subCategory_id=${sub._id}`) },
          ];
        }
        for (const child of (sub.subcategories || [])) {
          if (child._id === selectedChildCategory || child.id === selectedChildCategory) {
            return [
              { label: 'Store', onClick: resetFilters },
              { label: cat.name, onClick: () => router.push(`/store?category_id=${cat._id}`) },
              { label: sub.name, onClick: () => router.push(`/store?subCategory_id=${sub._id}`) },
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
      if (selectedProductType) params.append('productType', selectedProductType);

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
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedChildCategory, isFeatured, isPopular, productIds, sortOrder, minPrice, maxPrice, selectedProductType]);

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
          className={`w-10 h-10 flex items-center justify-center rounded-[4px] transition-colors ${page === 1 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-brand-navy  hover:bg-brand-cloud '}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="w-10 h-10 flex items-center justify-center rounded-[4px] text-[14px] font-mono font-medium text-brand-navy  hover:bg-brand-cloud  transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-slate-400 font-mono tracking-widest px-1">...</span>}
          </>
        )}

        {pageNumbers.map(num => (
          <button
            key={num}
            onClick={() => handlePageChange(num)}
            className={`w-10 h-10 flex items-center justify-center rounded-[4px] text-[14px] font-mono transition-colors ${num === page ? 'bg-brand-blue text-white shadow-sm font-medium' : 'text-brand-navy  hover:bg-brand-cloud  font-medium'}`}
          >
            {num}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-slate-400 font-mono tracking-widest px-1">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 flex items-center justify-center rounded-[4px] text-[14px] font-mono font-medium text-brand-navy  hover:bg-brand-cloud  transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || loading}
          className={`w-10 h-10 flex items-center justify-center rounded-[4px] transition-colors ${page === totalPages ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-brand-navy  hover:bg-brand-cloud '}`}
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
    router.replace(`/store?q=${encodeURIComponent(searchQuery)}`);
  };

  const applyPriceFilter = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setShowMobileFilters(false);
  };

  const renderProductCard = (product) => {
    const isAdded = cartItems.includes((product.id || product._id)?.toString());
    
    return (
    <div key={product.id} className="bg-white/10 backdrop-blur-2xl rounded-[20px] transition-all duration-300 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] flex flex-col relative group hover:bg-white/20 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]">
      {/* Glass border overlay to prevent pushing content inward */}
      <div className="absolute inset-0 rounded-[20px] border border-white/20 border-t-white/40 border-l-white/40 pointer-events-none z-20" />
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
      {product.photos && (() => {
        try {
            const parsed = JSON.parse(product.photos);
            return parsed[0] ? (
              <div className="aspect-[4/3] w-full bg-transparent flex items-center justify-center overflow-hidden relative transition-colors duration-300 border-b border-white/10">
                <img 
                  src={getOptimizedUrl(parsed[0])} 
                  alt={product.title} 
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
              </div>
            ) : null;
        } catch(e) { return null; }
      })()}
      <div className="p-4 md:p-5 flex flex-col flex-1 items-center bg-transparent text-center">
        <h3 className="font-semibold text-[18px] text-black leading-snug mb-2 md:mb-3 px-2 line-clamp-2 min-h-[52px]" style={{ color: 'black' }}>{product.title || 'Product Title'}</h3>
        <div className="flex justify-center items-center gap-2 mb-3 md:mb-4 flex-1">
          <span className="text-[17px] font-medium text-slate-900">BDT {formatPrice(product.selling_price)}</span>
          {Number(product.original_price) > Number(product.selling_price) && (
            <span className="text-[13px] text-slate-500 line-through">BDT {formatPrice(product.original_price)}</span>
          )}
        </div>
        <div className="w-full flex flex-row gap-1.5 md:gap-2 mt-auto relative z-20 px-1 -translate-x-[5px] md:translate-x-0">
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
            className={`flex-auto text-white py-[6px] md:py-[8px] px-2 md:px-4 text-[12px] md:text-[13px] whitespace-nowrap font-sans font-normal rounded-full transition-colors flex items-center justify-center gap-1.5 disabled:opacity-80 disabled:cursor-not-allowed ${
              isAdded ? 'bg-[#0E7C86] hover:bg-[#0E7C86]/90' : 'bg-[#111418] hover:bg-[#2B3038] active:bg-[#000000] shadow-[0_4px_12px_rgba(17,20,24,0.20)]'
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
            className="flex-auto bg-white/20 backdrop-blur-lg border border-[rgba(17,20,24,0.18)] text-[#111418] py-[6px] md:py-[8px] px-2 md:px-4 text-[12px] md:text-[13px] whitespace-nowrap font-sans font-normal rounded-full transition-all hover:bg-white/40 hover:border-[rgba(17,20,24,0.30)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isPending && loadingBuyId === (product.id || product._id) ? (
              <AppleSpinner size={16} className="text-[#111418]" />
            ) : (
              product.productType ? 'Get Now' : 'Buy Now'
            )}
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-transparent">


      <div className="w-full flex flex-col md:flex-row min-h-screen relative z-10 bg-transparent">
        
        {/* Sidebar Filters — mobile: full-screen overlay, desktop: sticky column */}
        <div className={`
          fixed inset-0 z-[45] bg-brand-cloud backdrop-xl shadow-sm
          md:relative md:inset-auto md:z-auto
          md:bg-white/40 md:backdrop-blur-2xl md:shadow-[0_4px_30px_rgba(0,0,0,0.05)] md:border-r md:border-white/20
          md:w-[calc(13rem+30px)] lg:w-[calc(15rem+30px)] md:-ml-[30px] md:pl-[30px] flex-shrink-0 
          transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300
        `}>
          <div className="h-full md:sticky md:top-20 md:max-h-[calc(100vh-80px)] overflow-y-auto p-6 pt-20 md:pt-6 scrollbar-hide">
            <div className="flex items-center justify-between mb-8 md:hidden">
              <h2 className="text-[20px] font-display font-medium text-[#111418]">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 text-[#5B636D] hover:text-[#111418] transition-colors">
                <X size={24} />
              </button>
            </div>



            <div className="mb-8 mt-4">
              <h3 className="text-[12px] font-sans font-semibold tracking-wide uppercase text-[#111418] mb-4">Price (BDT)</h3>
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="number" 
                  value={tempMinPrice}
                  onChange={e => setTempMinPrice(e.target.value)}
                  placeholder="Min" 
                  className="w-full bg-white/80 border border-[rgba(17,20,24,0.18)] rounded-[10px] px-3 py-2.5 text-[13px] outline-none focus:outline-none focus:border-[#111418] focus:ring-2 focus:ring-[rgba(17,20,24,0.50)] transition-colors text-[#111418] placeholder:text-[#6A727C] shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[#3B424A] font-medium">-</span>
                <input 
                  type="number" 
                  value={tempMaxPrice}
                  onChange={e => setTempMaxPrice(e.target.value)}
                  placeholder="Max" 
                  className="w-full bg-white/80 border border-[rgba(17,20,24,0.18)] rounded-[10px] px-3 py-2.5 text-[13px] outline-none focus:outline-none focus:border-[#111418] focus:ring-2 focus:ring-[rgba(17,20,24,0.50)] transition-colors text-[#111418] placeholder:text-[#6A727C] shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button 
                onClick={applyPriceFilter}
                className="w-full bg-[#111418] text-[#FFFFFF] py-2.5 px-4 text-[13px] font-sans font-medium rounded-[10px] transition-all hover:bg-[#2B3038] active:bg-[#000000] hover:shadow-[0_4px_12px_rgba(17,20,24,0.20)] flex items-center justify-center"
              >
                Apply Price
              </button>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen bg-transparent">
          
          {/* Top Bar Container */}
          <div className="contents md:flex md:flex-row md:items-center md:justify-between md:gap-4 md:px-5 lg:px-6 md:py-3 md:pb-3 md:border-b border-[rgba(17,20,24,0.18)] ">
            
            {/* Breadcrumbs (Scrolls away on mobile) */}
            <div className="w-full md:max-w-md flex items-center overflow-hidden px-4 pt-[22px] pb-1.5 md:p-0 -mt-[16px] md:mt-0 relative z-30 bg-transparent">
              {searchQuery ? (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[15px] md:text-[16px] font-sans font-medium text-[#111418]  w-full pb-0.5 md:pb-0">
                  Search Results for "{searchQuery}"
                </div>
              ) : activeBreadcrumb ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono tracking-widest uppercase text-[#6A727C] w-full pb-0.5 md:pb-0">
                  {activeBreadcrumb.map((crumb, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="opacity-40 shrink-0">/</span>}
                      {crumb.onClick ? (
                        <button
                          onClick={crumb.onClick}
                          className={`transition-colors hover:text-[#2B3038] shrink-0 ${
                            i === activeBreadcrumb.length - 1 ? 'text-[#111418]  pointer-events-none' : ''
                          }`}
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-[#111418]  shrink-0">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[14px] md:text-[14px] text-[#111418]  font-medium md:font-normal">
                  Store
                </div>
              )}
            </div>
            
            {/* Filter + Sort By (Sticky on mobile globally) */}
            <div className="sticky md:static top-[44px] z-40 w-full md:w-auto px-4 pt-0.5 pb-1.5 border-b border-[rgba(17,20,24,0.18)]  md:border-none md:p-0 bg-brand-surface/80  backdrop-blur-[20px] md:bg-transparent md:backdrop-blur-none flex items-center justify-between md:justify-end gap-2 mt-0">
              <span className="text-[13px] md:text-[14px] font-sans text-[#6A727C]  whitespace-nowrap hidden md:block">Sort by:</span>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button onClick={() => setShowMobileFilters(true)} className="md:hidden flex items-center justify-center gap-1.5 bg-brand-surface  border border-[rgba(17,20,24,0.18)]  text-[13px] text-[#111418]  py-1.5 px-3 rounded-[4px] transition-colors flex-1 hover:bg-[#E6E9ED] ">
                  <Filter size={14} className="text-[#111418] " />
                  Filter
                </button>

                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full md:w-auto bg-brand-surface  border border-[rgba(17,20,24,0.18)]  md:bg-transparent md:border-transparent md:hover:bg-[#E6E9ED] text-[13px] md:text-[14px] text-[#111418]  font-medium md:font-normal py-1.5 px-3 flex items-center justify-center md:justify-end gap-1.5 cursor-pointer rounded-[4px] transition-colors shadow-sm md:shadow-none"
                  >
                    {sortOrder === 'latest' ? 'Latest Arrivals' : sortOrder === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
                    <ChevronDown className={`w-[14px] h-[14px] md:w-[16px] md:h-[16px] text-[#6A727C]  transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                    <div className="absolute right-0 top-[calc(100%+4px)] w-[200px] bg-brand-surface  border border-[rgba(17,20,24,0.18)]  rounded-[4px] shadow-sm overflow-hidden z-50 p-1">
                      <button
                        onClick={() => { setSortOrder('latest'); setIsSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] transition-colors rounded-[2px] flex items-center justify-between ${sortOrder === 'latest' ? 'bg-[#E6E9ED] text-[#111418] font-medium' : 'text-[#111418]  hover:bg-[#E6E9ED] '}`}
                      >
                        Latest Arrivals
                        {sortOrder === 'latest' && (
                          <Check className="w-4 h-4 text-[#111418]" strokeWidth={2.5} />
                        )}
                      </button>
                      <button
                        onClick={() => { setSortOrder('price_asc'); setIsSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] transition-colors rounded-[2px] flex items-center justify-between ${sortOrder === 'price_asc' ? 'bg-[#E6E9ED] text-[#111418] font-medium' : 'text-[#111418]  hover:bg-[#E6E9ED] '}`}
                      >
                        Price: Low to High
                        {sortOrder === 'price_asc' && (
                          <Check className="w-4 h-4 text-[#111418]" strokeWidth={2.5} />
                        )}
                      </button>
                      <button
                        onClick={() => { setSortOrder('price_desc'); setIsSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] transition-colors rounded-[2px] flex items-center justify-between ${sortOrder === 'price_desc' ? 'bg-[#E6E9ED] text-[#111418] font-medium' : 'text-[#111418]  hover:bg-[#E6E9ED] '}`}
                      >
                        Price: High to Low
                        {sortOrder === 'price_desc' && (
                          <Check className="w-4 h-4 text-[#111418]" strokeWidth={2.5} />
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
          <div className="flex-1 p-4 md:p-5 lg:p-6">
            {loading ? (
              <LoadingState message="Loading products..." className="min-h-[50vh] border-none bg-transparent" />
            ) : products.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  type="search"
                  title="No Results"
                  description="Try adjusting your filters or search query to find what you're looking for."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
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
