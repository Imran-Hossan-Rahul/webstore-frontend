"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Search, Image as ImageIcon } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";

const getOptimizedUrl = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_auto,w_100/${parts[1]}`;
    }
  }
  return url;
};

export default function FeaturedProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/market/products?page=${pageNum}&limit=50&search=${searchQuery}&includePhysical=true`);
      if (pageNum === 1) {
        setProducts(res.data || []);
      } else {
        setProducts(prev => [...prev, ...(res.data || [])]);
      }
      setHasMore(res.pagination?.currentPage < res.pagination?.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchProducts(1);
    }
  };

  const toggleFeatured = async (product) => {
    const newStatus = !product.isFeatured;
    // Optimistic UI update
    setProducts(products.map(p => p.id === product.id ? { ...p, isFeatured: newStatus } : p));
    
    try {
      await api.put(`/market/products/${product.id}`, { isFeatured: newStatus });
    } catch (err) {
      console.error('Failed to update featured status:', err);
      // Revert on failure
      setProducts(products.map(p => p.id === product.id ? { ...p, isFeatured: !newStatus } : p));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-brand-navy dark:text-white">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-400">Featured Products</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Toggle products to show them in the Featured section on the homepage.</p>
      </div>

      <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Title or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Products Grid — 2 columns */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {loading && page === 1 ? (
          <div className="col-span-2 py-16 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <AppleSpinner className="animate-spin mb-3" />
            <span className="text-sm">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 dark:text-slate-400 text-sm">No products found.</div>
        ) : products.map(p => {
          let image = null;
          try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
          return (
            <div key={p.id} className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-brand-surface/5 transition group">
              <div className="shrink-0">
                {image ? (
                  <img src={getOptimizedUrl(image)} alt="Product" className="w-12 h-12 object-cover rounded-[4px] bg-brand-cloud dark:bg-brand-surface" />
                ) : (
                  <div className="w-12 h-12 bg-brand-cloud dark:bg-brand-surface rounded-[4px] flex items-center justify-center text-brand-slate dark:text-slate-300"><ImageIcon size={16} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-100 truncate leading-tight">{p.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{p.sku || 'No SKU'}</span>
                  <span className="text-brand-slate dark:text-slate-300 text-[11px]">·</span>
                  <span className="text-[12px] font-bold text-green-400">BDT {p.selling_price}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!p.isFeatured} onChange={() => toggleFeatured(p)} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-surface after:border-brand-navy/[0.08] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3">
        {loading && page === 1 ? (
          <div className="py-12 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <AppleSpinner className="animate-spin mb-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">No products found.</div>
        ) : products.map(p => {
          let image = null;
          try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
          return (
            <div key={p.id} className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-4 flex items-center gap-4">
              <div className="shrink-0">
                {image ? (
                  <img src={getOptimizedUrl(image)} alt="Product" className="w-14 h-14 object-cover rounded-[4px] bg-brand-cloud dark:bg-brand-surface p-1" />
                ) : (
                  <div className="w-14 h-14 bg-brand-cloud dark:bg-brand-surface rounded-[4px] flex items-center justify-center text-slate-500 dark:text-slate-400"><ImageIcon size={20} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 text-sm truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{p.sku || 'No SKU'}</span>
                  <span className="text-brand-slate dark:text-slate-300 text-xs">·</span>
                  <span className="text-sm font-bold text-green-400">BDT {p.selling_price}</span>
                </div>
              </div>
              <div className="flex shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!p.isFeatured} onChange={() => toggleFeatured(p)} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-surface after:border-brand-navy/[0.08] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
      
      {hasMore && !loading && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchProducts(nextPage);
            }}
            className="bg-brand-cloud dark:bg-brand-surface hover:bg-slate-700 text-white px-6 py-2 rounded-[4px] text-sm transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
