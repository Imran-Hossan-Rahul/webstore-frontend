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

export default function PopularProductsPage() {
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
      const res = await api.get(`/market/products?page=${pageNum}&limit=50&search=${searchQuery}`);
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

  const togglePopular = async (product) => {
    const newStatus = !product.isPopular;
    // Optimistic UI update
    setProducts(products.map(p => p.id === product.id ? { ...p, isPopular: newStatus } : p));
    
    try {
      await api.put(`/market/products/${product.id}`, { isPopular: newStatus });
    } catch (err) {
      console.error('Failed to update popular status:', err);
      // Revert on failure
      setProducts(products.map(p => p.id === product.id ? { ...p, isPopular: !newStatus } : p));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-purple-400">Popular Products</h1>
        <p className="text-gray-400 text-sm">Toggle products to show them in the Popular section on the homepage.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by Title or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-950/50 text-gray-400">
              <tr>
                <th className="p-4 font-medium rounded-tl-xl">Image</th>
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium text-right rounded-tr-xl">Popular</th>
              </tr>
            </thead>
            <tbody>
              {loading && page === 1 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    <AppleSpinner className="animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500">No products found.</td>
                </tr>
              ) : products.map(p => {
                let image = null;
                try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
                return (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="p-4 w-16">
                      {image ? (
                        <img src={getOptimizedUrl(image)} alt="Product" className="w-10 h-10 object-cover rounded-md bg-gray-800" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center text-gray-500"><ImageIcon size={16} /></div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-200">
                      <p className="truncate max-w-[200px] md:max-w-md">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.sku || 'No SKU'}</p>
                    </td>
                    <td className="p-4 font-bold text-green-400">BDT {p.selling_price}</td>
                    <td className="p-4 text-right">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={!!p.isPopular}
                          onChange={() => togglePopular(p)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {hasMore && !loading && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchProducts(nextPage);
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
