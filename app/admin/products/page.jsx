"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import Link from 'next/link';
import { Plus, Search, ShieldCheck, Download, Code, Edit3, Trash2, Video, Github, Eye, EyeOff } from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Assuming your backend route for fetching market products is GET /api/v1/market/products
        const res = await api.get('/market/products');
        
        // Ensure products is always an array. Backend sends { data: [...], pagination: {...} }
        const productList = Array.isArray(res) ? res : (res.data || res.products || []);
        
        // Sort by newest first just in case
        setProducts(productList.reverse());
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const id = productToDelete._id || productToDelete.id;
      await api.delete(`/market/products/${id}`);
      setProducts(products.filter(p => p._id !== id && p.id !== id));
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.status === 'Live' ? 'Draft' : 'Live';
      const formData = new FormData();
      formData.append('status', newStatus);
      // Ensure backend supports partial update or we use the correct endpoint
      await api.post(`/market/products/${product._id || product.id}`, formData);
      
      setProducts(products.map(p => {
        if ((p._id || p.id) === (product._id || product.id)) {
          return { ...p, status: newStatus };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update product status.");
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white">Digital Assets</h1>
          <p className="text-white/60 text-[14px]">Manage your source codes, templates, and SaaS products.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-black font-medium hover:bg-brand-cyan/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search assets by name or SKU..."
            className="w-full bg-[#080808] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
          />
        </div>
        <select className="bg-[#080808] border border-white/10 rounded-xl py-2.5 px-4 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50">
          <option className="bg-[#080808] text-white">All Types</option>
          <option className="bg-[#080808] text-white">Company Website</option>
          <option className="bg-[#080808] text-white">E-Commerce Website</option>
          <option className="bg-[#080808] text-white">SaaS Tool</option>
          <option className="bg-[#080808] text-white">Custom Service</option>
        </select>
      </div>

      {/* Product List */}
      <div className="bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 font-medium">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Security / Assets</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-white/40">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                      Loading assets...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-white/40">
                    No products found. Click &quot;Add New Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Code className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.title}</p>
                          <p className="text-[12px] text-white/40">{product.sales} Sales</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{product.productType}</td>
                    <td className="px-6 py-4 text-white/90">BDT {product.selling_price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.requireIpLock && (
                          <span title="IP Locked" className="p-1.5 rounded-md bg-green-500/10 text-green-400">
                            <ShieldCheck className="w-4 h-4" />
                          </span>
                        )}
                        {product.hasVideo && (
                          <span title="Video Demo Included" className="p-1.5 rounded-md bg-white/10 text-white/80">
                            <Video className="w-4 h-4" />
                          </span>
                        )}
                        {product.hasRepo && (
                          <span title="GitHub Repo Attached" className="p-1.5 rounded-md bg-white/10 text-white/80">
                            <Github className="w-4 h-4" />
                          </span>
                        )}
                        <span title="Download ZIP" className="p-1.5 rounded-md bg-white/10 text-white/80">
                          <Download className="w-4 h-4" />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider
                        ${product.status === 'Live' ? 'bg-green-400/10 text-green-400' : 'bg-white/10 text-white/50'}
                      `}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(product)} 
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" 
                          title={product.status === 'Live' ? 'Hide Product' : 'Make Live'}
                        >
                          {product.status === 'Live' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/products/${product._id || product.id}`)} 
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" 
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(product)} 
                          className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#080808] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-medium text-white mb-2">Delete Product</h3>
            <p className="text-[14px] text-white/60 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">"{productToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting && <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
