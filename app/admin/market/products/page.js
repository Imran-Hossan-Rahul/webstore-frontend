"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useEffect, useState } from 'react';
import { PRODUCT_TYPES, LICENSE_TYPES, TECH_STACK_OPTIONS } from '@/utils/digitalProducts';
import { api } from '@/utils/api';
import { Plus, X, Image as ImageIcon, Upload, Film, Edit, Eye, Trash2 } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterChildCategory, setFilterChildCategory] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 30;

  // Form State — Core
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [childCategoryId, setChildCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [status, setStatus] = useState('Draft');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [tags, setTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [specifications, setSpecifications] = useState([{ key: '', value: '', isHighlight: false }]);
  const [variantGroups, setVariantGroups] = useState([{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]);

  // Form State — Digital Product Fields
  const [productType, setProductType] = useState('');
  const [licenseType, setLicenseType] = useState('Personal');
  const [demoUrl, setDemoUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [techStack, setTechStack] = useState([]); // string[]
  const [fileFormat, setFileFormat] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState([{ version: '', date: '', notes: '' }]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [existingScreenshots, setExistingScreenshots] = useState([]);

  useEffect(() => {
    fetchWholesalers();
    fetchCategories();
  }, []);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    fetchProducts(1, false);
  }, [filterCategory, filterSubCategory, filterChildCategory]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/market/categories/all');
      setCategories(res.data || res || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async (pageNum, append) => {
    const pg = pageNum ?? page;
    const ap = append ?? false;
    if (ap) setLoadingMore(true);
    else setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pg,
        limit,
        includePhysical: true,
        ...(searchQuery && { search: searchQuery }),
        ...(filterCategory && { category_id: filterCategory }),
        ...(filterSubCategory && { subCategory_id: filterSubCategory }),
        ...(filterChildCategory && { childCategory_id: filterChildCategory }),
      }).toString();

      const res = await api.get(`/market/products?${queryParams}`);
      const payload = res.data || res;
      const newProducts = payload.data || payload;
      if (ap) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
      }
      
      // Auto-open edit modal if edit param is in URL
      if (!ap && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          const productToEdit = newProducts.find(p => p.id === editId || p._id === editId);
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
      setLoadingMore(false);
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
      // ── Core fields ──────────────────────────────────────────────────────
      formData.append('title', title);
      formData.append('sku', sku);
      formData.append('brand', brand);
      formData.append('category_id', categoryId);
      if (subCategoryId) formData.append('subCategory_id', subCategoryId);
      if (childCategoryId) formData.append('childCategory_id', childCategoryId);
      formData.append('description', description);
      formData.append('cost_price', parseFloat(costPrice) || 0);
      formData.append('selling_price', parseFloat(sellingPrice) || 0);
      formData.append('original_price', parseFloat(originalPrice) || 0);
      formData.append('status', status);
      formData.append('tags', tags);
      formData.append('specifications', JSON.stringify(specifications.filter(s => s.key && s.value)));
      formData.append('variantGroups', JSON.stringify(variantGroups.filter(g => g.name && g.options.length > 0)));
      formData.append('isFeatured', isFeatured);
      formData.append('isPopular', isPopular);
      formData.append('groupId', groupId);

      // ── Digital product fields ───────────────────────────────────────────
      formData.append('productType', productType);
      formData.append('licenseType', licenseType);
      formData.append('demoUrl', demoUrl);
      formData.append('documentationUrl', documentationUrl);
      formData.append('techStack', JSON.stringify(techStack));
      formData.append('fileFormat', fileFormat);
      formData.append('fileSize', fileSize);
      formData.append('version', version);
      formData.append('changelog', JSON.stringify(changelog.filter(c => c.version && c.notes)));
      formData.append('downloadUrl', downloadUrl);

      // ── Thumbnail photos ─────────────────────────────────────────────────
      if (mediaFiles && mediaFiles.length > 0) {
        Array.from(mediaFiles).forEach(file => {
          formData.append('media', file);
        });
      }
      if (editingProductId) {
        formData.append('photos', JSON.stringify(existingPhotos));
      }

      // ── Screenshot gallery ───────────────────────────────────────────────
      if (screenshotFiles && screenshotFiles.length > 0) {
        Array.from(screenshotFiles).forEach(file => {
          formData.append('screenshots', file);
        });
      }
      if (editingProductId) {
        formData.append('screenshotGallery', JSON.stringify(existingScreenshots));
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
        setTitle(''); setSku(''); setBrand(''); setCategoryId(''); setSubCategoryId(''); setChildCategoryId('');
        setDescription(''); setCostPrice(''); setSellingPrice(''); setOriginalPrice('');
        setMediaFiles([]); setExistingPhotos([]); setTags('');
        setIsFeatured(false); setIsPopular(false); setGroupId('');
        setSpecifications([{ key: '', value: '', isHighlight: false }]);
        setVariantGroups([{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]);
        // Reset digital fields
        setProductType(''); setLicenseType('Personal'); setDemoUrl(''); setDocumentationUrl('');
        setTechStack([]); setFileFormat(''); setFileSize(''); setVersion('');
        setChangelog([{ version: '', date: '', notes: '' }]); setDownloadUrl('');
        setScreenshotFiles([]); setExistingScreenshots([]);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await api.delete(`/market/products/${id}`);
      setProducts(products.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleEditClick = (p) => {
    setEditingProductId(p.id);
    // Core fields
    setTitle(p.title || '');
    setSku(p.sku || '');
    setBrand(p.brand || '');
    setCategoryId(p.category_id || '');
    setSubCategoryId(p.subCategory_id || '');
    setChildCategoryId(p.childCategory_id || '');
    setDescription(p.description || '');
    setCostPrice(p.cost_price || '');
    setSellingPrice(p.selling_price || '');
    setOriginalPrice(p.original_price || '');
    setStatus(p.status || 'Draft');
    setTags(p.tags || '');
    setIsFeatured(p.isFeatured || false);
    setIsPopular(p.isPopular || false);
    setGroupId(p.groupId || '');
    try {
      const parsedSpecs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
      setSpecifications(parsedSpecs && parsedSpecs.length > 0 ? parsedSpecs : [{ key: '', value: '', isHighlight: false }]);
    } catch(e) { setSpecifications([{ key: '', value: '', isHighlight: false }]); }
    try {
      const parsedVars = typeof p.variantGroups === 'string' ? JSON.parse(p.variantGroups) : p.variantGroups;
      setVariantGroups(parsedVars && parsedVars.length > 0 ? parsedVars : []);
    } catch(e) { setVariantGroups([]); }
    let initialPhotos = [];
    if (p.photos) {
      try { initialPhotos = typeof p.photos === 'string' ? JSON.parse(p.photos) : p.photos; } catch (e) {}
    }
    setExistingPhotos(initialPhotos);
    setMediaFiles([]);
    // Digital product fields
    setProductType(p.productType || '');
    setLicenseType(p.licenseType || 'Personal');
    setDemoUrl(p.demoUrl || '');
    setDocumentationUrl(p.documentationUrl || '');
    try {
      const ts = typeof p.techStack === 'string' ? JSON.parse(p.techStack) : p.techStack;
      setTechStack(Array.isArray(ts) ? ts : []);
    } catch(e) { setTechStack([]); }
    setFileFormat(p.fileFormat || '');
    setFileSize(p.fileSize || '');
    setVersion(p.version || '');
    try {
      const cl = typeof p.changelog === 'string' ? JSON.parse(p.changelog) : p.changelog;
      setChangelog(Array.isArray(cl) && cl.length > 0 ? cl : [{ version: '', date: '', notes: '' }]);
    } catch(e) { setChangelog([{ version: '', date: '', notes: '' }]); }
    setDownloadUrl(p.downloadUrl || '');
    let initialScreenshots = [];
    if (p.screenshotGallery) {
      try { initialScreenshots = typeof p.screenshotGallery === 'string' ? JSON.parse(p.screenshotGallery) : p.screenshotGallery; } catch(e) {}
    }
    setExistingScreenshots(initialScreenshots);
    setScreenshotFiles([]);
    setShowModal(true);
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-full text-brand-navy dark:text-brand-navy dark:text-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-400">Digital Products</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage all digital marketplace listings — templates, source code, tools, and UI kits.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProductId(null);
            setTitle(''); setSku(''); setBrand(''); setCategoryId(''); setSubCategoryId(''); setChildCategoryId('');
            setDescription(''); setCostPrice(''); setSellingPrice(''); setOriginalPrice('');
            setMediaFiles([]); setExistingPhotos([]); setTags('');
            setIsFeatured(false); setIsPopular(false); setGroupId('');
            setSpecifications([{ key: '', value: '', isHighlight: false }]);
            setVariantGroups([{ name: '', options: [{ label: '', priceDifference: 0, imageIndex: '' }] }]);
            setProductType(''); setLicenseType('Personal'); setDemoUrl(''); setDocumentationUrl('');
            setTechStack([]); setFileFormat(''); setFileSize(''); setVersion('');
            setChangelog([{ version: '', date: '', notes: '' }]); setDownloadUrl('');
            setScreenshotFiles([]); setExistingScreenshots([]);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-[4px] font-medium transition shrink-0"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-4 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-[2]">
            <input 
              type="text" 
              placeholder="Search by Title, SKU, or Tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter') {
                  setPage(1);
                  fetchProducts();
                }
              }}
              className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex-1">
            <select 
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setFilterSubCategory(''); setFilterChildCategory(''); setPage(1); }}
              className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-brand-blue transition"
            >
              <option value="">All Categories</option>
              {categories.filter(c => !c.isSubcategory).map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {filterCategory && (
            <div className="flex-1">
              <select 
                value={filterSubCategory}
                onChange={(e) => { setFilterSubCategory(e.target.value); setFilterChildCategory(''); setPage(1); }}
                className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-brand-blue transition"
              >
                <option value="">All Sub-categories</option>
                {categories.filter(c => c.isSubcategory && String(c.parentCategory?._id || c.parentCategory) === filterCategory).map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          {filterSubCategory && categories.filter(c => c.isSubcategory && String(c.parentCategory?._id || c.parentCategory) === filterSubCategory).length > 0 && (
            <div className="flex-1">
              <select 
                value={filterChildCategory}
                onChange={(e) => { setFilterChildCategory(e.target.value); setPage(1); }}
                className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-brand-blue transition"
              >
                <option value="">All Child-categories</option>
                {categories.filter(c => c.isSubcategory && String(c.parentCategory?._id || c.parentCategory) === filterSubCategory).map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
      {/* Search Button: also resets list */}
          <div className="flex gap-2 shrink-0">
            <button onClick={() => { setProducts([]); setPage(1); fetchProducts(1, false); }} className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-[4px] font-medium transition">Search</button>
            <button onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterSubCategory(''); setFilterChildCategory(''); setProducts([]); setPage(1); }} className="bg-brand-cloud dark:bg-brand-surface hover:bg-slate-700 text-brand-navy dark:text-slate-300 px-4 py-2 rounded-[4px] transition">Clear</button>
          </div>
        </div>
      </div>
      
      {/* Products Grid — 2 columns */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-2 py-16 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <AppleSpinner className="animate-spin mb-3" />
            <span className="text-sm">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 dark:text-slate-400 text-sm">No products found. Add one to get started.</div>
        ) : products.map(p => {
          let image = null;
          try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
          return (
            <div key={p.id || p._id} className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-brand-surface/5 transition group">
              {/* Thumbnail */}
              <div className="shrink-0">
                {image ? (
                  <img src={getOptimizedUrl(image)} alt="Product" className="w-12 h-12 object-cover rounded-[4px] bg-brand-cloud dark:bg-brand-surface" />
                ) : (
                  <div className="w-12 h-12 bg-brand-cloud dark:bg-brand-surface rounded-[4px] flex items-center justify-center text-brand-slate dark:text-slate-300">
                    <ImageIcon size={16} />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-100 truncate leading-tight">{p.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {p.productType && (
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-900/20 border border-violet-900/40 px-1.5 py-0.5 rounded">{p.productType}</span>
                  )}
                  {p.licenseType && (
                    <span className="text-[10px] text-blue-400">{p.licenseType}</span>
                  )}
                  <span className="text-brand-slate dark:text-slate-300 text-[11px]">·</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">cost ৳{p.cost_price}</span>
                  <span className="text-brand-slate dark:text-slate-300 text-[11px]">→</span>
                  <span className="text-[12px] font-bold text-green-400">৳{p.selling_price}</span>
                </div>
              </div>
              {/* Status + Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                  p.status === 'Live' ? 'bg-green-900/30 text-green-400 border border-green-900/50' :
                  p.status === 'Draft' ? 'bg-brand-cloud dark:bg-brand-surface text-slate-500 dark:text-slate-400 border border-brand-navy/[0.08] dark:border-white/10' :
                  'bg-orange-900/30 text-orange-400 border border-orange-900/50'
                }`}>{p.status}</span>
                <a href={`/market/product/${p.id || p._id}`} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-[4px] bg-brand-cloud dark:bg-brand-surface hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-white transition" title="View">
                  <Eye size={13} />
                </a>
                <button onClick={() => handleEditClick(p)}
                  className="p-1.5 rounded-[4px] bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 hover:text-blue-300 border border-blue-900/50 transition" title="Edit">
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDeleteProduct(p.id || p._id)}
                  className="p-1.5 rounded-[4px] bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 border border-red-900/50 transition" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {!loading && products.length > 0 && page < totalPages && (
        <div className="hidden md:flex justify-center mt-6 mb-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2.5 px-8 py-2.5 bg-brand-surface dark:bg-brand-surface hover:bg-brand-cloud dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue text-brand-navy dark:text-slate-300 hover:text-white rounded-[4px] font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <><AppleSpinner size={16} /><span>Loading...</span></>
            ) : (
              <><span>Load More</span><span className="text-slate-500 dark:text-slate-400 text-xs">({products.length} loaded)</span></>
            )}
          </button>
        </div>
      )}
      {!loading && page >= totalPages && products.length > 0 && (
        <p className="hidden md:block text-center text-brand-slate dark:text-slate-300 text-xs mt-4 mb-1">✓ All {products.length} products loaded</p>
      )}

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <AppleSpinner className="animate-spin mb-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">No products listed. Add one to get started.</div>
        ) : products.map(p => {
          let image = null;
          try { const a = JSON.parse(p.photos); image = a[0]; } catch(e) {}
          return (
            <div key={p.id} className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-4 flex items-center gap-4">
              <div className="shrink-0">
                {image ? (
                  <img src={getOptimizedUrl(image)} alt="Product" className="w-14 h-14 object-contain rounded-[4px] bg-brand-cloud dark:bg-brand-surface p-1" />
                ) : (
                  <div className="w-14 h-14 bg-brand-cloud dark:bg-brand-surface rounded-[4px] flex items-center justify-center text-slate-500 dark:text-slate-400"><ImageIcon size={20} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 text-sm truncate">{p.title}</p>
                {p.productType && <p className="text-[10px] text-violet-400 mt-0.5">{p.productType} · {p.licenseType || 'Personal'}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-green-400">BDT {p.selling_price}</span>
                  <span className="text-xs text-brand-slate dark:text-slate-300">·</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.status === 'Live' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 
                    p.status === 'Draft' ? 'bg-brand-cloud dark:bg-brand-surface text-slate-500 dark:text-slate-400 border border-brand-navy/[0.08] dark:border-white/10' :
                    'bg-orange-900/30 text-orange-400 border border-orange-900/50'
                  }`}>{p.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <a href={`/market/product/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-brand-cloud dark:bg-brand-surface hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-white rounded-[4px] transition" title="View">
                  <Eye size={15} />
                </a>
                <button onClick={() => handleEditClick(p)} className="p-2 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded-[4px] transition" title="Edit">
                  <Edit size={15} />
                </button>
                <button onClick={() => handleDeleteProduct(p.id || p._id)} className="p-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-[4px] transition" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination UI - hidden since we use Load More */}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-brand-navy/[0.08] dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-brand-navy dark:text-white">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[4px] flex items-start gap-3">
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
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Core Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Product Title *</label>
                        <input 
                          required
                          type="text" 
                          value={title} onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                          placeholder="e.g. Mechanical Keyboard"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Category *</label>
                        <div className="relative">
                          <select 
                            required
                            value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); setChildCategoryId(''); }}
                            className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition appearance-none"
                          >
                            <option value="" disabled>Select a category</option>
                            {categories.filter(c => !c.isSubcategory).map(c => (
                              <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Sub-category</label>
                        <div className="relative">
                          <select 
                            value={subCategoryId} onChange={(e) => { setSubCategoryId(e.target.value); setChildCategoryId(''); }}
                            className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition appearance-none"
                            disabled={!categoryId}
                          >
                            <option value="" disabled>Select a sub-category</option>
                            {categories.filter(c => c.isSubcategory && String(c.parentCategory?._id || c.parentCategory) === categoryId).map(c => (
                              <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {categoryId && subCategoryId && categories.filter(c => c.isSubcategory && String(c.parentCategory?._id || c.parentCategory) === subCategoryId).length > 0 && (
                        <div className="md:col-span-2 mt-4">
                          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Child Category</label>
                          <div className="relative">
                            <select 
                              value={childCategoryId} onChange={(e) => setChildCategoryId(e.target.value)}
                              className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition appearance-none"
                            >
                              <option value="" disabled>Select a child category</option>
                              {categories.filter(c => c.isSubcategory && String(c.parentCategory?._id || c.parentCategory) === subCategoryId).map(c => (
                                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">SKU (Stock Keeping Unit) (Optional)</label>
                      <input 
                        type="text" 
                        value={sku} onChange={(e) => setSku(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. KEY-MECH-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Brand (Optional)</label>
                      <input 
                        type="text" 
                        value={brand} onChange={(e) => setBrand(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. Logitech"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Variant Group ID (Optional)</label>
                      <input 
                        type="text" 
                        value={groupId} onChange={(e) => setGroupId(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Link similar products"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: Pricing */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Cost Price (internal) *</label>
                      <input 
                        required
                        type="number" 
                        value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Your cost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Selling Price *</label>
                      <input 
                        required
                        type="number" 
                        value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Customer-facing price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Original Price (crossed-out)</label>
                      <input 
                        type="number" 
                        value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. pre-sale price"
                      />
                    </div>
                  </div>
                  {costPrice && sellingPrice && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-brand-surface/5 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 flex justify-between items-center">
                      <span className="text-brand-navy dark:text-slate-300 text-sm">Estimated Margin:</span>
                      <div className="text-right">
                        <span className={`font-bold ${sellingPrice - costPrice > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          BDT {(sellingPrice - costPrice).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          ({costPrice > 0 ? (((sellingPrice - costPrice) / costPrice) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: Digital Product Details */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Digital Product Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Product Type *</label>
                      <select 
                        required
                        value={productType} onChange={(e) => setProductType(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition appearance-none"
                      >
                        <option value="" disabled>Select type...</option>
                        {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">License Type *</label>
                      <select 
                        required
                        value={licenseType} onChange={(e) => setLicenseType(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition appearance-none"
                      >
                        {LICENSE_TYPES.map(l => <option key={l.value} value={l.value}>{l.label} — {l.description}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Demo / Live Preview URL</label>
                      <input 
                        type="url"
                        value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="https://demo.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Documentation URL</label>
                      <input 
                        type="url"
                        value={documentationUrl} onChange={(e) => setDocumentationUrl(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="https://docs.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">File Format</label>
                      <input 
                        type="text"
                        value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. ZIP, .fig, .sketch, .jsx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">File Size</label>
                      <input 
                        type="text"
                        value={fileSize} onChange={(e) => setFileSize(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. 24 MB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Current Version</label>
                      <input 
                        type="text"
                        value={version} onChange={(e) => setVersion(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. 2.1.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Secure Download URL <span className="text-red-400">🔒 Admin only</span></label>
                      <input 
                        type="url"
                        value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition font-mono text-sm"
                        placeholder="https://cdn.codalina.com/files/product.zip"
                        autoComplete="off"
                      />
                      <p className="text-xs text-brand-slate dark:text-slate-300 mt-1">Never exposed to the customer-facing UI. Only served after verified purchase.</p>
                    </div>
                  </div>

                  {/* Tech Stack Tags */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Tech Stack</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {techStack.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-blue-900/30 text-blue-300 border border-blue-800/50 text-xs px-2.5 py-1 rounded-full">
                          {tag}
                          <button type="button" onClick={() => setTechStack(techStack.filter(t => t !== tag))} className="text-blue-400 hover:text-white transition ml-1">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value && !techStack.includes(e.target.value)) setTechStack([...techStack, e.target.value]); }}
                      className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue transition appearance-none text-sm"
                    >
                      <option value="">+ Add a technology...</option>
                      {TECH_STACK_OPTIONS.filter(t => !techStack.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Changelog */}
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 border-b border-brand-navy/[0.08] dark:border-white/10 pb-1">Version Changelog</h5>
                    <div className="space-y-3">
                      {changelog.map((entry, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2 items-start">
                          <input type="text" value={entry.version} onChange={(e) => { const c=[...changelog]; c[idx].version=e.target.value; setChangelog(c); }}
                            placeholder="v2.0.0" className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-blue transition col-span-1" />
                          <input type="date" value={entry.date} onChange={(e) => { const c=[...changelog]; c[idx].date=e.target.value; setChangelog(c); }}
                            className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-blue transition col-span-1" />
                          <input type="text" value={entry.notes} onChange={(e) => { const c=[...changelog]; c[idx].notes=e.target.value; setChangelog(c); }}
                            placeholder="What changed?" className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-blue transition col-span-2" />
                          <button type="button" onClick={() => setChangelog(changelog.filter((_,i)=>i!==idx))} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-[4px] transition"><X size={14}/></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setChangelog([...changelog, { version: '', date: '', notes: '' }])}
                        className="text-xs text-blue-400 hover:text-blue-300 border border-blue-900/40 px-3 py-1.5 rounded-[4px] transition">+ Add Changelog Entry</button>
                    </div>
                  </div>

                  {/* Screenshot Gallery Uploader */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Screenshot Gallery (separate from thumbnail)</label>
                    {existingScreenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {existingScreenshots.map((url, idx) => (
                          <div key={idx} className="relative w-20 h-20">
                            <img src={url} alt={`Screenshot ${idx+1}`} className="w-full h-full object-cover rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10" />
                            <button type="button" onClick={() => setExistingScreenshots(existingScreenshots.filter((_,i)=>i!==idx))}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center"><X size={10}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input type="file" multiple accept="image/*" onChange={(e) => setScreenshotFiles(e.target.files)}
                      className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-900/30 file:text-blue-300 hover:file:bg-blue-800/40 transition" />
                    <p className="text-xs text-brand-slate dark:text-slate-300 mt-1">These appear in the product detail screenshot gallery section.</p>
                  </div>
                </div>

                  {/* SECTION: Specifications */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Specifications (Dynamic)</h4>
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
                            className="flex-1 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue transition" 
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
                            className="flex-1 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue transition" 
                          />
                          <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 shrink-0 cursor-pointer hover:text-brand-navy dark:text-slate-300">
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
                              className="w-4 h-4 rounded bg-brand-surface dark:bg-brand-surface border-brand-navy/[0.08] dark:border-white/10 accent-blue-500 cursor-pointer"
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
                              className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-[4px] transition shrink-0"
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
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Product Variants (Optional)</label>
                    <div className="space-y-4">
                      {variantGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="p-4 border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] bg-brand-surface dark:bg-brand-surface/50">
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
                              className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2 text-white text-sm focus:border-brand-blue"
                            />
                            {true && (
                              <button 
                                type="button" 
                                onClick={() => setVariantGroups(variantGroups.filter((_, i) => i !== groupIdx))} 
                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-[4px] transition"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                          <div className="pl-4 space-y-2 border-l-2 border-brand-navy/[0.08] dark:border-white/10">
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
                                  className="w-full md:w-1/3 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-1.5 text-white text-sm focus:border-brand-blue"
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
                                  className="w-full md:w-1/4 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-1.5 text-white text-sm focus:border-brand-blue"
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
                                  className="w-full md:w-1/5 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-2 py-1.5 text-white text-sm focus:border-brand-blue"
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
                                    className="w-full md:w-1/5 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-1.5 text-white text-sm focus:border-brand-blue"
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

                {/* SECTION: Content & Display */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Content & Display</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Status *</label>
                      <div className="relative">
                        <select 
                          required
                          value={status} onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition appearance-none"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Live">Live</option>
                          <option value="Threshold reached">Threshold reached</option>
                          <option value="Paused/Sold out">Paused / Sold out</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Search Tags (Optional)</label>
                      <input 
                        type="text" 
                        value={tags} onChange={(e) => setTags(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Comma separated..."
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] hover:bg-brand-cloud dark:bg-brand-surface/30 transition">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-5 h-5 appearance-none border-2 border-slate-600 rounded-md checked:bg-brand-blue checked:border-brand-blue transition-colors"
                        />
                        {isFeatured && (
                          <svg className="absolute w-3.5 h-3.5 text-white left-0.5 top-0.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-200 font-medium block">Feature on Homepage</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Highlight this product on the marketplace landing page</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] hover:bg-brand-cloud dark:bg-brand-surface/30 transition">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isPopular}
                          onChange={(e) => setIsPopular(e.target.checked)}
                          className="w-5 h-5 appearance-none border-2 border-slate-600 rounded-md checked:bg-purple-500 checked:border-purple-500 transition-colors"
                        />
                        {isPopular && (
                          <svg className="absolute w-3.5 h-3.5 text-white left-0.5 top-0.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-200 font-medium block">Mark as Popular</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Show this product in the Popular section on the homepage</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Product Media (Images & Videos)</label>
                    <div className="relative w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 border-dashed rounded-[4px] p-4 text-center hover:border-brand-blue transition cursor-pointer">
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
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Upload size={24} className="mb-2 text-blue-400" />
                        <span className="text-sm">Click or drag files to upload</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Images will be auto-converted to WebP. Max 50MB per file.</span>
                      </div>
                    </div>
                    
                    {/* Preview Existing Photos */}
                    {existingPhotos && existingPhotos.length > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Previously Uploaded ({existingPhotos.length})</span>
                          <button type="button" onClick={() => setExistingPhotos([])} className="text-sm text-red-400 hover:text-red-300">Remove All</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {existingPhotos.map((photoUrl, i) => (
                            <div key={i} className="relative group w-20 h-20 rounded-md overflow-hidden bg-brand-cloud dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10">
                              <img src={photoUrl} alt={`Existing ${i}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setExistingPhotos(existingPhotos.filter((_, idx) => idx !== i))}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={20} className="text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview selected files count */}
                    {mediaFiles && mediaFiles.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">{mediaFiles.length} file(s) selected</span>
                          <button type="button" onClick={() => setMediaFiles(null)} className="text-sm text-red-400 hover:text-red-300">Clear All</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(mediaFiles).map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-brand-cloud dark:bg-brand-surface text-xs px-3 py-1.5 rounded-md text-brand-navy dark:text-slate-300">
                              {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <Film size={14} />}
                              <span className="truncate max-w-[150px]">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Product Description (Optional)</label>
                    <textarea 
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-blue-500 transition h-24 resize-none"
                      placeholder="Detailed product features and specifications..."
                    ></textarea>
                  </div>
                </div>

              </form>
                {/* Form Actions */}
                <div className="pt-6 border-t border-brand-navy/[0.08] dark:border-white/10 flex justify-end gap-3 sticky bottom-0 bg-brand-surface dark:bg-brand-surface pb-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 rounded-[4px] font-medium text-brand-navy dark:text-slate-300 hover:bg-brand-cloud dark:bg-brand-surface hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="productForm"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] font-bold bg-brand-blue hover:bg-brand-blue text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? <AppleSpinner size={18} className="animate-spin" /> : null}
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
