"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Plus, X, Loader2, Image as ImageIcon, Upload, Film, Edit, Eye } from "lucide-react";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [wholesalerId, setWholesalerId] = useState('');
  const [status, setStatus] = useState('Draft');
  const [mediaFiles, setMediaFiles] = useState([]); // Multiple files
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [tags, setTags] = useState('');
  const [procurementThreshold, setProcurementThreshold] = useState(20);
  const [estDeliveryDays, setEstDeliveryDays] = useState(3);
  const [reportedStockQuantity, setReportedStockQuantity] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [specifications, setSpecifications] = useState([{ key: '', value: '', isHighlight: false }]);
  const [variantGroups, setVariantGroups] = useState([{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]);
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [wholesalerSearch, setWholesalerSearch] = useState('');
  const [showWholesalerDropdown, setShowWholesalerDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchWholesalers();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/market/categories/all');
      setCategories(res.data || res || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/market/products');
      const data = res.data || res;
      setProducts(data);
      
      // Auto-open edit modal if edit param is in URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          const productToEdit = data.find(p => p.id === editId || p._id === editId);
          if (productToEdit) {
            setTimeout(() => handleEditClick(productToEdit), 100);
            window.history.replaceState({}, '', '/admin/market/products');
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWholesalers = async () => {
    try {
      const res = await api.get('/market/wholesalers');
      const data = res.data || res;
      setWholesalers(data);
      if (data.length > 0) setWholesalerId(data[0].id);
    } catch (err) {
      console.error("Failed to fetch wholesalers", err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('sku', sku);
      formData.append('brand', brand);
      formData.append('category_id', categoryId);
      if (subCategoryId) formData.append('subCategory_id', subCategoryId);
      formData.append('description', description);
      formData.append('cost_price', parseFloat(costPrice) || 0);
      formData.append('selling_price', parseFloat(sellingPrice) || 0);
      formData.append('original_price', parseFloat(originalPrice) || 0);
      formData.append('wholesaler_id', wholesalerId);
      formData.append('status', status);
      formData.append('weight', parseFloat(weight) || 0);
      formData.append('dimensions', dimensions);
      formData.append('tags', tags);
      formData.append('specifications', JSON.stringify(specifications.filter(s => s.key && s.value)));
      formData.append('variantGroups', JSON.stringify(variantGroups.filter(g => g.name && g.options.length > 0)));
      formData.append('procurement_threshold', procurementThreshold);
      formData.append('est_delivery_days', estDeliveryDays);
      formData.append('reportedStockQuantity', reportedStockQuantity);
      formData.append('isFeatured', isFeatured);
      formData.append('groupId', groupId);
      formData.append('warranty_info', warrantyInfo);
      formData.append('return_policy', returnPolicy);

      // Append all selected files
      if (mediaFiles && mediaFiles.length > 0) {
        Array.from(mediaFiles).forEach(file => {
          formData.append('media', file);
        });
      }

      // If editing and we want to keep existing photos
      if (editingProductId) {
        // Find the original product to get its photos
        const originalProduct = products.find(p => p.id === editingProductId);
        if (originalProduct && originalProduct.photos) {
          // If it's already a string, append it directly. If it's an array, stringify it.
          const photosStr = typeof originalProduct.photos === 'string' ? originalProduct.photos : JSON.stringify(originalProduct.photos);
          formData.append('photos', photosStr);
        }
      }
      
      let res;
      if (editingProductId) {
        res = await api.post(`/market/products/${editingProductId}`, formData);
      } else {
        res = await api.post('/market/products', formData);
      }
      
      if (res) {
        setShowModal(false);
        setEditingProductId(null);
        // Reset form
        setTitle(''); setSku(''); setBrand(''); setCategoryId(''); setSubCategoryId(''); setDescription(''); setCostPrice(''); setSellingPrice(''); setOriginalPrice(''); setMediaFiles([]); setWeight(''); setDimensions(''); setTags(''); setReportedStockQuantity(0); setIsFeatured(false); setGroupId(''); setSpecifications([{ key: '', value: '', isHighlight: false }]); setWarrantyInfo(''); setReturnPolicy('');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (p) => {
    setEditingProductId(p.id);
    setTitle(p.title || '');
    setSku(p.sku || '');
    setBrand(p.brand || '');
    setCategoryId(p.category_id || '');
    setSubCategoryId(p.subCategory_id || '');
    setDescription(p.description || '');
    setCostPrice(p.cost_price || '');
    setSellingPrice(p.selling_price || '');
    setOriginalPrice(p.original_price || '');
    setWholesalerId(p.wholesaler?.id || p.wholesaler_id || '');
    setStatus(p.status || 'Draft');
    setWeight(p.weight || '');
    setDimensions(p.dimensions || '');
    setTags(p.tags || '');
    setProcurementThreshold(p.procurement_threshold || 20);
    setEstDeliveryDays(p.est_delivery_days || 3);
    setReportedStockQuantity(p.reportedStockQuantity || 0);
    setIsFeatured(p.isFeatured || false);
    setGroupId(p.groupId || '');
    setWarrantyInfo(p.warranty_info || '');
    setReturnPolicy(p.return_policy || '');
    try {
      setSpecifications(typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || [{ key: '', value: '', isHighlight: false }]));
    } catch(e) {
      setSpecifications([{ key: '', value: '', isHighlight: false }]);
    }
    try {
      setVariantGroups(typeof p.variantGroups === 'string' ? JSON.parse(p.variantGroups) : (p.variantGroups || [{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]));
    } catch(e) {
      setVariantGroups([{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]);
    }
    setMediaFiles([]);
    setShowModal(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-400">Products Inventory</h1>
          <p className="text-gray-400 text-sm">Manage all marketplace products and monitor stock levels.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProductId(null);
            setTitle(''); setSku(''); setBrand(''); setCategoryId(''); setSubCategoryId(''); setDescription(''); setCostPrice(''); setSellingPrice(''); setOriginalPrice(''); setMediaFiles([]); setWeight(''); setDimensions(''); setTags(''); setReportedStockQuantity(0); setIsFeatured(false); setGroupId(''); setSpecifications([{ key: '', value: '', isHighlight: false }]); setVariantGroups([{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]); setWarrantyInfo(''); setReturnPolicy('');
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-900/20 shrink-0"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-950 text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium border-b border-gray-800 w-16">Image</th>
              <th className="p-4 font-medium border-b border-gray-800">Title</th>
              <th className="p-4 font-medium border-b border-gray-800">Wholesaler</th>
              <th className="p-4 font-medium border-b border-gray-800">Cost Price</th>
              <th className="p-4 font-medium border-b border-gray-800">Selling Price</th>
              <th className="p-4 font-medium border-b border-gray-800">Status</th>
              <th className="p-4 font-medium border-b border-gray-800 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-gray-500">No products listed. Add one to get started.</td>
              </tr>
            ) : products.map(p => {
              let image = null;
              try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
              return (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="p-4">
                    {image ? (
                      <img src={getOptimizedUrl(image)} alt="Product" className="w-10 h-10 object-cover rounded-md bg-gray-800" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center text-gray-500"><ImageIcon size={16} /></div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-200">{p.title}</td>
                  <td className="p-4 text-gray-400">{p.wholesaler?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-400">BDT {p.cost_price}</td>
                  <td className="p-4 font-bold text-green-400">BDT {p.selling_price}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      p.status === 'Live' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 
                      p.status === 'Draft' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                      'bg-orange-900/30 text-orange-400 border border-orange-900/50'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/market/product/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition" title="View in Store">
                        <Eye size={16} />
                      </a>
                      <button onClick={() => handleEditClick(p)} className="p-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 hover:text-blue-300 border border-blue-900/50 rounded-lg transition" title="Edit Product">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center text-gray-500">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No products listed. Add one to get started.</div>
        ) : products.map(p => {
          let image = null;
          try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
          return (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="shrink-0">
                {image ? (
                  <img src={getOptimizedUrl(image)} alt="Product" className="w-14 h-14 object-contain rounded-lg bg-gray-800 p-1" />
                ) : (
                  <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500"><ImageIcon size={20} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-100 text-sm truncate">{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.wholesaler?.name || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-green-400">BDT {p.selling_price}</span>
                  <span className="text-xs text-gray-600">·</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.status === 'Live' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 
                    p.status === 'Draft' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                    'bg-orange-900/30 text-orange-400 border border-orange-900/50'
                  }`}>{p.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <a href={`/market/product/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition" title="View">
                  <Eye size={15} />
                </a>
                <button onClick={() => handleEditClick(p)} className="p-2 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded-lg transition" title="Edit">
                  <Edit size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
              <h3 className="text-xl font-bold text-white">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <div className="text-red-500 mt-0.5"><X size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-red-500">Submission Failed</h4>
                    <p className="text-sm text-red-400/90">{errorMsg}</p>
                  </div>
                </div>
              )}
              <form id="productForm" onSubmit={handleAddProduct} className="space-y-6">
                
                {/* SECTION: Core Details */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-800 pb-2">Core Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Product Title *</label>
                        <input 
                          required
                          type="text" 
                          value={title} onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          placeholder="e.g. Mechanical Keyboard"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Category *</label>
                        <div className="relative">
                          <select 
                            required
                            value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); }}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none"
                          >
                            <option value="" disabled>Select a category</option>
                            {categories.filter(c => !c.isSubcategory).map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Sub-category</label>
                        <div className="relative">
                          <select 
                            value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none"
                            disabled={!categoryId}
                          >
                            <option value="">Select a sub-category</option>
                            {categories.filter(c => c.isSubcategory && String(c.parentCategory?._id) === categoryId).map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">SKU (Stock Keeping Unit) (Optional)</label>
                      <input 
                        type="text" 
                        value={sku} onChange={(e) => setSku(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. KEY-MECH-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Brand (Optional)</label>
                      <input 
                        type="text" 
                        value={brand} onChange={(e) => setBrand(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. Logitech"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Variant Group ID (Optional)</label>
                      <input 
                        type="text" 
                        value={groupId} onChange={(e) => setGroupId(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Link similar products"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: Pricing & Inventory */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-800 pb-2">Pricing & Inventory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Cost Price (BDT) *</label>
                      <input 
                        required
                        type="number" 
                        value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Wholesaler price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Selling Price (BDT) *</label>
                      <input 
                        required
                        type="number" 
                        value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Retail price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Original Price (BDT)</label>
                      <input 
                        type="number" 
                        value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Crossed-out price"
                        title="If set higher than selling price, this will show as a crossed-out old price"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Reported Stock Quantity *</label>
                      <input 
                        required
                        type="number" 
                        value={reportedStockQuantity} onChange={(e) => setReportedStockQuantity(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Wholesaler's available stock"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Procurement Threshold (Optional)</label>
                      <input 
                        type="number" 
                        value={procurementThreshold} onChange={(e) => setProcurementThreshold(Math.min(e.target.value, reportedStockQuantity))}
                        max={reportedStockQuantity}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Auto order below this count"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cannot exceed reported stock.</p>
                    </div>
                  </div>
                  
                  {costPrice && sellingPrice && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Estimated Margin:</span>
                      <div className="text-right">
                        <span className={`font-bold ${sellingPrice - costPrice > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          BDT {(sellingPrice - costPrice).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({costPrice > 0 ? (((sellingPrice - costPrice) / costPrice) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: Logistics & Supplier */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-800 pb-2">Logistics & Supplier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Select Wholesaler *</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={wholesalerSearch}
                          onChange={(e) => {
                            setWholesalerSearch(e.target.value);
                            setShowWholesalerDropdown(true);
                          }}
                          onFocus={() => setShowWholesalerDropdown(true)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          placeholder={wholesalerId ? wholesalers.find(w => w._id === wholesalerId)?.name || "-- Search Wholesaler --" : "-- Search Wholesaler --"}
                        />
                        {showWholesalerDropdown && (
                          <div className="fixed inset-0 z-40" onClick={() => setShowWholesalerDropdown(false)}></div>
                        )}
                        {showWholesalerDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {wholesalers.filter(w => w.name.toLowerCase().includes(wholesalerSearch.toLowerCase())).map(w => (
                              <div 
                                key={w._id} 
                                className="px-4 py-3 hover:bg-gray-800 cursor-pointer text-gray-200 border-b border-gray-800/50 last:border-0"
                                onClick={() => {
                                  setWholesalerId(w._id);
                                  setWholesalerSearch(w.name);
                                  setShowWholesalerDropdown(false);
                                }}
                              >
                                {w.name}
                              </div>
                            ))}
                            {wholesalers.filter(w => w.name.toLowerCase().includes(wholesalerSearch.toLowerCase())).length === 0 && (
                              <div className="px-4 py-3 text-gray-500">No wholesalers found matching "{wholesalerSearch}"</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Est. Delivery Days (Optional)</label>
                      <input 
                        type="number" 
                        value={estDeliveryDays} onChange={(e) => setEstDeliveryDays(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Days to restock"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Weight (kg) (Optional)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={weight} onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. 1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Dimensions (L x W x H) (Optional)</label>
                      <input 
                        type="text" 
                        value={dimensions} onChange={(e) => setDimensions(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. 30x20x10 cm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Warranty Information (Optional)</label>
                      <input 
                        type="text" 
                        value={warrantyInfo} onChange={(e) => setWarrantyInfo(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. 1 Year Brand Warranty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Return Policy (Optional)</label>
                      <input 
                        type="text" 
                        value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. 14 Days Free Return"
                      />
                    </div>
                  </div>

                  {/* SECTION: Specifications */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-800 pb-2">Specifications (Dynamic)</h4>
                    <div className="space-y-3">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input 
                            type="text" 
                            value={spec.key} 
                            onChange={(e) => {
                              const newSpecs = [...specifications];
                              newSpecs[index].key = e.target.value;
                              setSpecifications(newSpecs);
                            }}
                            placeholder="e.g. Brand" 
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition" 
                          />
                          <input 
                            type="text" 
                            value={spec.value} 
                            onChange={(e) => {
                              const newSpecs = [...specifications];
                              newSpecs[index].value = e.target.value;
                              setSpecifications(newSpecs);
                            }}
                            placeholder="e.g. Apple" 
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition" 
                          />
                          <label className="flex items-center gap-2 text-sm text-gray-400 shrink-0 cursor-pointer hover:text-gray-300">
                            <input
                              type="checkbox"
                              checked={spec.isHighlight || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const highlightCount = specifications.filter(s => s.isHighlight).length;
                                  if (highlightCount >= 5) {
                                    alert("You can only highlight a maximum of 5 specifications.");
                                    return;
                                  }
                                }
                                const newSpecs = [...specifications];
                                newSpecs[index].isHighlight = e.target.checked;
                                setSpecifications(newSpecs);
                              }}
                              className="w-4 h-4 rounded bg-gray-900 border-gray-700 accent-blue-500 cursor-pointer"
                            />
                            Highlight
                          </label>
                          {true && (
                            <button 
                              type="button" 
                              onClick={() => {
                                const newSpecs = specifications.filter((_, i) => i !== index);
                                setSpecifications(newSpecs);
                              }} 
                              className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition shrink-0"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => setSpecifications([...specifications, { key: '', value: '', isHighlight: false }])}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-2 p-1"
                      >
                        <Plus size={16} /> Add Specification
                      </button>
                    </div>
                  </div>

                  {/* SECTION: Product Variants */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Product Variants (Optional)</label>
                    <div className="space-y-4">
                      {variantGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                          <div className="flex gap-2 mb-3">
                            <input 
                              type="text" 
                              value={group.name} 
                              onChange={(e) => {
                                const newGroups = [...variantGroups];
                                newGroups[groupIdx].name = e.target.value;
                                setVariantGroups(newGroups);
                              }}
                              placeholder="Group Name (e.g. Color, Storage)" 
                              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500"
                            />
                            {true && (
                              <button 
                                type="button" 
                                onClick={() => setVariantGroups(variantGroups.filter((_, i) => i !== groupIdx))} 
                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                          <div className="pl-4 space-y-2 border-l-2 border-gray-800">
                            {group.options.map((option, optionIdx) => (
                              <div key={optionIdx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                                <input 
                                  type="text" 
                                  value={option.label} 
                                  onChange={(e) => {
                                    const newGroups = [...variantGroups];
                                    newGroups[groupIdx].options[optionIdx].label = e.target.value;
                                    setVariantGroups(newGroups);
                                  }}
                                  placeholder="Label (e.g. Lavender)" 
                                  className="w-full md:w-1/3 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500"
                                />
                                <input 
                                  type="number" 
                                  value={option.priceDifference} 
                                  onChange={(e) => {
                                    const newGroups = [...variantGroups];
                                    newGroups[groupIdx].options[optionIdx].priceDifference = parseFloat(e.target.value) || 0;
                                    setVariantGroups(newGroups);
                                  }}
                                  placeholder="Price Diff (+/-)" 
                                  title="Price Difference: How much extra this option costs. Use 0 if the price is the same as the base product."
                                  className="w-full md:w-1/4 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500"
                                />
                                <select 
                                  value={(option.imageIndex !== undefined && option.imageIndex !== '') ? 'image' : 'text'}
                                  onChange={(e) => {
                                    const newGroups = [...variantGroups];
                                    if (e.target.value === 'text') {
                                      newGroups[groupIdx].options[optionIdx].imageIndex = '';
                                    } else {
                                      newGroups[groupIdx].options[optionIdx].imageIndex = '0';
                                    }
                                    setVariantGroups(newGroups);
                                  }}
                                  className="w-full md:w-1/5 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-white text-sm focus:border-blue-500"
                                >
                                  <option value="text">Text Option</option>
                                  <option value="image">Image Option</option>
                                </select>
                                {(option.imageIndex !== undefined && option.imageIndex !== '') && (
                                  <input 
                                    type="number" 
                                    value={option.imageIndex} 
                                    onChange={(e) => {
                                      const newGroups = [...variantGroups];
                                      newGroups[groupIdx].options[optionIdx].imageIndex = e.target.value;
                                      setVariantGroups(newGroups);
                                    }}
                                    placeholder="Img Idx" 
                                    title="Index of the uploaded photo to use as thumbnail"
                                    className="w-full md:w-1/5 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500"
                                  />
                                )}
                                {true && (
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newGroups = [...variantGroups];
                                      newGroups[groupIdx].options = group.options.filter((_, i) => i !== optionIdx);
                                      setVariantGroups(newGroups);
                                    }} 
                                    className="p-1.5 text-red-500 hover:bg-red-500/20 rounded-md transition"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button 
                              type="button" 
                              onClick={() => {
                                const newGroups = [...variantGroups];
                                newGroups[groupIdx].options.push({ label: '', priceDifference: 0, imageIndex: '' });
                                setVariantGroups(newGroups);
                              }}
                              className="text-xs text-green-400 hover:text-green-300 font-medium flex items-center gap-1 mt-2"
                            >
                              <Plus size={14} /> Add Option
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => setVariantGroups([...variantGroups, { name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }])}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 p-1"
                      >
                        <Plus size={16} /> Add Variant Group
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION: Content & Display */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-800 pb-2">Content & Display</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Status *</label>
                      <div className="relative">
                        <select 
                          required
                          value={status} onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Live">Live</option>
                          <option value="Threshold reached">Threshold reached</option>
                          <option value="Paused/Sold out">Paused / Sold out</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Search Tags (Optional)</label>
                      <input 
                        type="text" 
                        value={tags} onChange={(e) => setTags(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Comma separated..."
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-5 h-5 appearance-none border-2 border-gray-600 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-colors"
                        />
                        {isFeatured && (
                          <svg className="absolute w-3.5 h-3.5 text-white left-0.5 top-0.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-200 font-medium block">Feature on Homepage</span>
                        <span className="text-gray-500 text-xs">Highlight this product on the marketplace landing page</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Product Media (Images & Videos)</label>
                    <div className="relative w-full bg-gray-950 border border-gray-800 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer">
                      <input 
                        type="file" 
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            setMediaFiles(prev => prev ? [...prev, ...newFiles] : newFiles);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Upload size={24} className="mb-2 text-blue-400" />
                        <span className="text-sm">Click or drag files to upload</span>
                        <span className="text-xs text-gray-500 mt-1">Images will be auto-converted to WebP. Max 50MB per file.</span>
                      </div>
                    </div>
                    
                    {/* Preview selected files count */}
                    {mediaFiles && mediaFiles.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">{mediaFiles.length} file(s) selected</span>
                          <button type="button" onClick={() => setMediaFiles(null)} className="text-sm text-red-400 hover:text-red-300">Clear All</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(mediaFiles).map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-800 text-xs px-3 py-1.5 rounded-md text-gray-300">
                              {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <Film size={14} />}
                              <span className="truncate max-w-[150px]">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Product Description (Optional)</label>
                    <textarea 
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition h-24 resize-none"
                      placeholder="Detailed product features and specifications..."
                    ></textarea>
                  </div>
                </div>

              </form>
                {/* Form Actions */}
                <div className="pt-6 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-gray-900 pb-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="productForm"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/20"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {editingProductId ? "Save Changes" : "Publish Product"}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
