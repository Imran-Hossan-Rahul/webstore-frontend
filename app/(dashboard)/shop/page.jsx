"use client";
import React, { useEffect, useState, useContext } from 'react';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Search, Loader2, Edit, ChevronDown, Filter, X } from "lucide-react";
import AuthGuardModal from "@/components/ui/AuthGuardModal";

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
  const [sortOrder, setSortOrder] = useState('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  useEffect(() => {
    api.get('/market/categories')
      .then(res => {
        const data = res.data || res || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  // Compute breadcrumb label from URL params + category data
  const activeBreadcrumb = React.useMemo(() => {
    if (!categories.length) return null;
    for (const cat of categories) {
      if (cat._id === selectedCategory || cat.id === selectedCategory) {
        return [
          { label: 'Explore', onClick: () => { setSelectedCategory(''); setSelectedSubCategory(''); setSelectedChildCategory(''); router.push('/shop'); } },
          { label: cat.name, onClick: () => router.push(`/shop?category_id=${cat._id}`) },
        ];
      }
      for (const sub of (cat.subcategories || [])) {
        if (sub._id === selectedSubCategory || sub.id === selectedSubCategory) {
          return [
            { label: 'Explore', onClick: () => { setSelectedCategory(''); setSelectedSubCategory(''); setSelectedChildCategory(''); router.push('/shop'); } },
            { label: cat.name, onClick: () => router.push(`/shop?category_id=${cat._id}`) },
            { label: sub.name, onClick: () => router.push(`/shop?subCategory_id=${sub._id}`) },
          ];
        }
        for (const child of (sub.subcategories || [])) {
          if (child._id === selectedChildCategory || child.id === selectedChildCategory) {
            return [
              { label: 'Explore', onClick: () => { setSelectedCategory(''); setSelectedSubCategory(''); setSelectedChildCategory(''); router.push('/shop'); } },
              { label: cat.name, onClick: () => router.push(`/shop?category_id=${cat._id}`) },
              { label: sub.name, onClick: () => router.push(`/shop?subCategory_id=${sub._id}`) },
              { label: child.name, onClick: null },
            ];
          }
        }
      }
    }
    return null;
  }, [categories, selectedCategory, selectedSubCategory, selectedChildCategory]);

  const fetchProducts = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20
      });
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedSubCategory) params.append('subCategory_id', selectedSubCategory);
      if (selectedChildCategory) params.append('childCategory_id', selectedChildCategory);
      if (isFeatured) params.append('isFeatured', 'true');
      if (isPopular) params.append('isPopular', 'true');
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

      if (append) {
        setProducts(prev => [...prev, ...liveProducts]);
      } else {
        setProducts(liveProducts);
      }

      setHasMore(pagination.currentPage < pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sync filter states from URL whenever searchParams change (e.g. sidebar navigation)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category_id') || '');
    setSelectedSubCategory(searchParams.get('subCategory_id') || '');
    setSelectedChildCategory(searchParams.get('childCategory_id') || '');
    const section = searchParams.get('section') || '';
    setIsFeatured(section === 'featured');
    setIsPopular(section === 'popular');
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedChildCategory, isFeatured, isPopular, sortOrder, minPrice, maxPrice]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.replace(`/shop?q=${encodeURIComponent(searchQuery)}`);
  };

  const applyPriceFilter = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
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
        <button className="bg-[#0071e3] text-white px-[15px] py-[8px] rounded-full font-sans text-[14px] font-normal hover:bg-[#0077ed] transition-colors relative z-20">
          Buy Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-[#0071e3]/30">
      
      {/* Mobile Filter Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1d1d1f] border-b border-apple-hairline sticky top-0 z-40">
        <h1 className="text-xl font-semibold text-apple-ink">Shop</h1>
        <button onClick={() => setShowMobileFilters(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-apple-ink">
          <Filter size={20} />
        </button>
      </div>

      <div className="w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Sidebar Filters — mobile: full-screen overlay, desktop: sticky column */}
        <div className={`
          fixed inset-0 z-[45] bg-white dark:bg-[#1d1d1f] md:bg-transparent
          md:relative md:inset-auto md:z-auto
          md:w-64 lg:w-72 flex-shrink-0 border-r border-apple-hairline 
          transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300
        `}>
          <div className="h-full md:sticky md:top-20 md:max-h-[calc(100vh-80px)] overflow-y-auto p-6 scrollbar-hide">
            <div className="flex items-center justify-between mb-8 md:hidden">
              <h2 className="text-2xl font-bold text-apple-ink">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 text-apple-muted hover:text-apple-ink">
                <X size={24} />
              </button>
            </div>

            <div className="hidden md:block mb-8 mt-4">
              {activeBreadcrumb ? (
                <div className="flex items-center gap-1.5 text-[12px] text-apple-muted font-medium tracking-wide flex-wrap">
                  {activeBreadcrumb.map((crumb, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="opacity-40">›</span>}
                      {crumb.onClick ? (
                        <button
                          onClick={crumb.onClick}
                          className={`transition-colors hover:text-[#0071e3] ${
                            i === activeBreadcrumb.length - 1 ? 'text-apple-ink font-semibold pointer-events-none' : ''
                          }`}
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-apple-ink font-semibold">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <h1 className="text-2xl font-bold tracking-tight text-apple-ink">Explore</h1>
              )}
            </div>



            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-apple-muted mb-4">Price (BDT)</h3>
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
          
          {/* Top Bar */}
          <div className="p-4 md:p-8 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-apple-hairline/50">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-muted" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search marketplace..." 
                className="w-full bg-white dark:bg-[#1d1d1f] border border-apple-hairline rounded-full pl-11 pr-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all text-apple-ink placeholder:text-apple-muted"
              />
            </form>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[13px] font-semibold text-apple-muted whitespace-nowrap uppercase tracking-wider hidden md:block">Sort by:</span>
              <select 
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="bg-transparent text-[15px] text-apple-ink font-semibold py-2 pl-2 pr-8 border-none focus:ring-0 appearance-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2386868b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 p-4 md:p-8">
            {loading && page === 1 ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0071e3]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-[#1d1d1f] rounded-2xl border border-apple-hairline">
                <Search className="w-12 h-12 text-apple-muted mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-apple-ink">No products found</h3>
                <p className="text-[15px] text-apple-muted mt-2 max-w-sm mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                  {products.map(renderProductCard)}
                </div>
                
                {hasMore && (
                  <div className="mt-12 flex justify-center pb-8">
                    <button 
                      onClick={loadMore}
                      disabled={loading}
                      className={`bg-white dark:bg-[#1d1d1f] border border-apple-hairline text-[#0071e3] px-[22px] py-[11px] rounded-full font-sans text-[16px] font-medium transition-all hover:bg-[#0071e3] hover:text-white hover:border-[#0071e3] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Loading...' : 'Show More'}
                    </button>
                  </div>
                )}
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
