"use client";
import React, { useEffect, useState, useContext, useTransition } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Download, Truck, ShieldCheck, Globe, FileCode2, BookOpen, ShoppingCart, CreditCard, ChevronRight, ChevronLeft, X, Check, Minus, Plus, Home, Share2, Eye, ArrowLeftRight, ShoppingBag, Package, Award, Edit, ZoomIn, Zap, Tag } from "lucide-react";
import { isDigitalProduct, PRODUCT_TYPE_COLORS, safeParseJSON } from "@/utils/digitalProducts";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useShare } from "@/hooks/useShare";
import { api } from "@/utils/api";
import AuthGuardModal from "@/components/ui/AuthGuardModal";

import AppleSpinner from "@/components/ui/AppleSpinner";

const getOptimizedUrl = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_auto,w_800/${parts[1]}`;
    }
  }
  return url;
};

export default function ProductDetails({ params }) {
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity] = useState(1);
  const [images, setImages] = useState([]);
  const { user } = useContext(DashboardContext) || {};
  const [viewerCount, setViewerCount] = useState(31);
  const { share } = useShare();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [variantGroups, setVariantGroups] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });
  const [categories, setCategories] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Digital product parsed fields
  const [techStackTags, setTechStackTags] = useState([]);
  const [changelogEntries, setChangelogEntries] = useState([]);
  const [screenshotGallery, setScreenshotGallery] = useState([]);
  const [changelogOpen, setChangelogOpen] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  useEffect(() => {
    if (id) {
      try {
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) {
          const cartIds = JSON.parse(cartStr);
          if (cartIds.includes(id.toString())) {
            setAddedToCart(true);
          }
        }
      } catch(e) {}
    }
  }, [id]);

  // No fake viewer count — removed (dark pattern)

  useEffect(() => {
    if (id) {
      api.get(`/market/products/${id}`)
        .then(res => {
          const data = res.data || res;
          setProduct(data);
          
          api.get('/market/categories')
            .then(catRes => setCategories(catRes.data || catRes))
            .catch(console.error);
            
          let parsedPhotos = [];
          try {
            parsedPhotos = JSON.parse(data.photos);
          } catch(e) {}
          setImages(parsedPhotos);
          if (parsedPhotos.length > 0) {
            setActiveImage(parsedPhotos[0]);
          }
          if (data.isLiked !== undefined) {
            setIsLiked(data.isLiked);
          }
          if (data.likes !== undefined) {
            setLikeCount(data.likes);
          }
          
          let parsedVariants = [];
          try {
            if (data.variantGroups) {
              parsedVariants = typeof data.variantGroups === 'string' ? JSON.parse(data.variantGroups) : data.variantGroups;
              setVariantGroups(parsedVariants);
              
              // Check if we have saved variants in cartDetails for this product
              let savedVariantsList = [];
              try {
                const detailsStr = localStorage.getItem('cartDetails');
                if (detailsStr) {
                  const details = JSON.parse(detailsStr);
                  if (details[data.id.toString()] && details[data.id.toString()].variants) {
                    savedVariantsList = details[data.id.toString()].variants.split(' | ');
                  }
                }
              } catch(e) {}

              // Set initial selected variants
              const initialSelections = {};
              parsedVariants.forEach((g, idx) => {
                if (g.options && g.options.length > 0) {
                  let matchedIndex = 0;
                  if (savedVariantsList.length > 0) {
                    const foundIdx = g.options.findIndex(opt => savedVariantsList.includes(opt.label));
                    if (foundIdx !== -1) {
                      matchedIndex = foundIdx;
                      // Set the image if this matched variant has an associated image
                      const option = g.options[matchedIndex];
                      if (option.imageIndex !== undefined && option.imageIndex !== '' && parsedPhotos[option.imageIndex]) {
                        setActiveImage(parsedPhotos[option.imageIndex]);
                      }
                    }
                  }
                  initialSelections[idx] = matchedIndex; // Index of selected option
                }
              });
              setSelectedVariants(initialSelections);
            }
          } catch(e) {}
          setTechStackTags(safeParseJSON(data.techStack, []));
          setChangelogEntries(safeParseJSON(data.changelog, []));
          setScreenshotGallery(safeParseJSON(data.screenshotGallery, []));
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Signal global loader that we are fetching data
  if (typeof window !== 'undefined') {
    if (loading) {
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

  const breadcrumbNodes = React.useMemo(() => {
    if (!product || !categories.length) return [];
    const nodes = [];
    
    // Find category
    const cat = categories.find(c => c._id === product.category_id || c.id === product.category_id);
    if (cat) {
      nodes.push({ label: cat.name, url: `/shop?category_id=${cat._id || cat.id}` });
      
      // Find subcategory
      const sub = (cat.subcategories || []).find(s => s._id === product.subCategory_id || s.id === product.subCategory_id);
      if (sub) {
        nodes.push({ label: sub.name, url: `/shop?subCategory_id=${sub._id || sub.id}` });
        
        // Find childcategory
        const child = (sub.subcategories || []).find(c => c._id === product.childCategory_id || c.id === product.childCategory_id);
        if (child) {
          nodes.push({ label: child.name, url: `/shop?childCategory_id=${child._id || child.id}` });
        }
      }
    }
    return nodes;
  }, [product, categories]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 dark:bg-[#030303]/70 backdrop-blur-md z-[9999]">
        <AppleSpinner size={50} className="text-[#0071e3]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-apple-canvas flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">Return to Market</Link>
      </div>
    );
  }

  let specs = [];
  try {
    specs = product.specifications ? JSON.parse(product.specifications) : [];
  } catch(e) {}
  
  const isDigital = isDigitalProduct(product);

  const additionalPrice = variantGroups.reduce((sum, group, idx) => {
    const selectedOptIdx = selectedVariants[idx];
    if (selectedOptIdx !== undefined && group.options[selectedOptIdx]) {
      return sum + (Number(group.options[selectedOptIdx].priceDifference) || 0);
    }
    return sum;
  }, 0);
  
  const finalPrice = product ? product.selling_price + additionalPrice : 0;
  const finalOriginalPrice = product ? (product.original_price || product.selling_price) + additionalPrice : 0;
  
  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const selectedVariantsSummary = variantGroups.map((group, groupIdx) => {
    const selectedOptIdx = selectedVariants[groupIdx] || 0;
    return group.options[selectedOptIdx]?.label || '';
  }).filter(Boolean).join(' | ');

  const handleSelectVariant = (groupIdx, optIdx) => {
    setSelectedVariants(prev => ({ ...prev, [groupIdx]: optIdx }));
    const option = variantGroups[groupIdx]?.options[optIdx];
    if (option && option.imageIndex !== undefined && option.imageIndex !== '' && images[option.imageIndex]) {
      setActiveImage(images[option.imageIndex]);
    }
  };

  const handleBuyNow = () => {
    const query = new URLSearchParams({
      productId: product.id,
      quantity,
      variantSummary: selectedVariantsSummary,
      finalPrice,
      originalPrice: finalOriginalPrice
    }).toString();
    window.dispatchEvent(new Event('startNavigation'));
    startTransition(() => {
      router.push(`/checkout?${query}`);
    });
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    setTimeout(() => {
      setAddedToCart(true);
      
      try {
        const cartStr = localStorage.getItem('cartIds');
        let cartIds = [];
        if (cartStr) cartIds = JSON.parse(cartStr);
        if (!cartIds.includes(product.id.toString())) {
          cartIds.push(product.id.toString());
          localStorage.setItem('cartIds', JSON.stringify(cartIds));
        }
        
        const detailsStr = localStorage.getItem('cartDetails');
        let cartDetails = detailsStr ? JSON.parse(detailsStr) : {};
        cartDetails[product.id.toString()] = {
          variants: selectedVariantsSummary,
          finalPrice: finalPrice
        };
        localStorage.setItem('cartDetails', JSON.stringify(cartDetails));
        
      } catch(e) {}
      
      // Dispatch event for RightSidebar to show the toast
      window.dispatchEvent(new CustomEvent('addedToCart'));
      setIsAddingToCart(false);
    }, 400);
  };

  const handleLike = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
       await api.put(`/market/products/${product.id}/like`, {});
    } catch (err) {
       console.error("Like failed", err);
       setIsLiked(!newIsLiked);
       setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  const handleShare = async () => {
    await share({
        title: product.title,
        text: product.description ? product.description.slice(0, 100) : "",
        url: `/product/${product.id}`
    });
  };



  return (
    <div className="min-h-screen pb-16 font-sans">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />
      {/* Breadcrumb */}
      <div className="pt-5 pb-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] md:text-[13px] text-[#86868b] dark:text-gray-400 font-normal w-full pb-0.5 md:pb-0 ml-4">
            <Link href="/" className="transition-colors hover:text-[#0071e3] shrink-0 flex items-center">
              <Home size={14} className="mb-0.5" />
            </Link>
            <span className="opacity-40 shrink-0">›</span>
            <Link href="/shop" className="transition-colors hover:text-[#0071e3] shrink-0">
              Shop
            </Link>
            {breadcrumbNodes.map((node, i) => (
              <React.Fragment key={i}>
                <span className="opacity-40 shrink-0">›</span>
                <Link href={node.url} className="transition-colors hover:text-[#0071e3] shrink-0">
                  {node.label}
                </Link>
              </React.Fragment>
            ))}
            <span className="opacity-40 shrink-0">›</span>
            <span className="text-[#1d1d1f] dark:text-white font-normal shrink-0 truncate max-w-[200px] md:max-w-md pointer-events-none">
              {product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 mx-4 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left: Image Gallery (Sticky on Desktop) */}
        <div className="lg:w-5/12 lg:sticky lg:top-[120px] z-10">
          <div 
            className="aspect-square rounded-2xl overflow-hidden mb-4 relative group flex items-center justify-center w-full p-8 md:p-12 cursor-zoom-in bg-white dark:bg-black/20 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300"
            onClick={() => {
              if (activeImage) setIsLightboxOpen(true);
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
                {activeImage ? (
                  <>
                    <img 
                      src={getOptimizedUrl(activeImage)} 
                      alt={product.title} 
                      className={`w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-sm transition-transform duration-200 ease-out pointer-events-none ${isZooming ? 'scale-[2.5]' : 'scale-100 group-hover:scale-105'}`}
                      style={isZooming ? zoomStyle : {}}
                    />
                    <div className={`absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md p-2 rounded-full transition-opacity duration-300 shadow-sm text-gray-700 dark:text-gray-300 ${isZooming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      <ZoomIn size={18} />
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">No Image Available</div>
                )}
              </div>
              
              <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 bg-transparent rounded-xl flex items-center justify-center p-2 overflow-hidden border-2 transition-all ${activeImage === img ? 'border-gray-800 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={getOptimizedUrl(img)} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            </div>

        {/* Right: Scrolling Content */}
        <div className="lg:w-7/12 flex flex-col gap-3">
          
          {/* Top Row: Brand & Actions (Separated) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.brand && (
                <span className="border border-[#111827] text-gray-900 dark:text-gray-100 text-[13px] font-semibold px-3 py-1.5 rounded">
                  Brand : {product.brand}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* No fake viewer count */}
              <button 
                onClick={handleLike}
                className={`w-9 h-9 border border-[#111827] flex items-center justify-center rounded hover:bg-gray-50 dark:hover:bg-slate-800 transition ${isLiked ? 'text-pink-500 border-pink-200 dark:border-pink-900' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <Star size={16} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button 
                onClick={handleShare}
                className="w-9 h-9 border border-[#111827] text-gray-700 dark:text-gray-300 flex items-center justify-center rounded hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Top: Product Info & Delivery */}
          <div className="flex flex-col">
            
            {/* Product Info */}
            <div className="flex flex-col">
              
              {/* Gray Info Block */}
              <div className={`bg-[#efefef] dark:bg-slate-800/50 px-5 pt-5 pb-3 flex justify-between items-start ${specs.filter(s => s.isHighlight).length > 0 ? 'rounded-t-lg' : 'rounded-lg mb-5'}`}>
                <div className="flex-1 pr-4">
                  <h1 className="text-[24px] sm:text-[32px] font-bold text-[#1d1d1f] dark:text-white tracking-[-0.02em] leading-tight mb-2">
                  {product.title}
                </h1>
                  {/* SKU (Admin Only) */}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && product.sku && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                      <Link 
                        href={`/admin/market/products?edit=${product.id}`}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                      >
                        <Edit size={12} /> Edit Product
                      </Link>
                    </div>
                  )}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && !product.sku && (
                    <div className="mt-2">
                      <Link 
                        href={`/admin/market/products?edit=${product.id}`}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                      >
                        <Edit size={12} /> Edit Product
                      </Link>
                    </div>
                  )}
                  {selectedVariantsSummary && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-[#111827]/10 border border-[#111827]/30 text-gray-800 dark:text-gray-200 text-[13px] rounded">
                        {selectedVariantsSummary}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right shrink-0 mt-1">
                  <div className="text-[28px] font-bold text-[#1d1d1f] dark:text-white mb-1 tracking-[-0.01em]">
                    BDT {product.selling_price}
                  </div>
                  {finalOriginalPrice > finalPrice && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      BDT {formatPrice(finalOriginalPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Highlighted Specs */}
              {specs.filter(s => s.isHighlight).length > 0 && (
                <div className="mb-6 bg-[#f2f2f2] dark:bg-slate-800/50 px-5 pb-5 pt-1 rounded-b-lg">
                  <ul className="space-y-3 mb-4">
                      {specs.filter(s => s.isHighlight).slice(0, 5).map((spec, idx) => (
                        <li key={idx}>
                          <span className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-900 dark:text-white font-bold">{spec.key}:</strong> {spec.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">
                      &quot;Our purpose is to provide accurate information from trusted sources. If you find any errors or inaccuracies, please let us know.&quot;
                    </p>
                </div>
              )}

              {/* Variants */}
              {variantGroups.length > 0 && (
                <div className="mb-6 space-y-5 bg-[#efefef] dark:bg-slate-800/50 p-5 rounded-lg">
                  {variantGroups.map((group, groupIdx) => {
                    const selectedOptIdx = selectedVariants[groupIdx] || 0;
                    const selectedLabel = group.options[selectedOptIdx]?.label || '';
                    
                    return (
                      <div key={groupIdx}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-gray-900 dark:text-white capitalize text-[14px] tracking-wide">{group.name}:</span>
                          <span className="text-gray-700 dark:text-gray-300 text-[14px]">{selectedLabel}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2.5">
                          {group.options.map((option, optIdx) => {
                            const isSelected = selectedOptIdx === optIdx;
                            const imgUrl = (images && option.imageIndex !== undefined && option.imageIndex !== '') ? getOptimizedUrl(images[option.imageIndex]) : null;
                            
                            if (imgUrl) {
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectVariant(groupIdx, optIdx)}
                                  className={`aspect-square w-14 h-14 bg-[#f5f5f7] rounded-lg border-2 p-1 flex items-center justify-center overflow-hidden transition-all duration-300 ${isSelected ? 'border-gray-800 shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                                  title={option.label}
                                >
                                  <img src={imgUrl} alt={option.label} className="w-full h-full object-contain mix-blend-multiply" />
                                </button>
                              );
                            }
                            
                            // Text Pills
                            return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectVariant(groupIdx, optIdx)}
                                  className={`px-4 py-2 rounded-lg border text-[14px] transition ${isSelected ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border-gray-900 dark:border-white shadow-sm font-medium' : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-4 mt-6">
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      onClick={() => {
                        if (addedToCart) {
                          router.push('/cart');
                        } else {
                          handleAddToCart();
                        }
                      }}
                      disabled={isAddingToCart}
                      className={`flex-1 px-6 py-[11px] rounded-[980px] font-normal flex items-center justify-center gap-2 transition-colors disabled:opacity-80 disabled:cursor-not-allowed ${
                        addedToCart 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white border border-transparent'
                          : 'bg-transparent border border-[#0071e3] hover:bg-[#0071e3] hover:text-white text-[#0071e3]'
                      }`}
                    >
                      {isAddingToCart ? (
                        <AppleSpinner size={18} className={addedToCart ? "text-white" : "text-[#0071e3] group-hover:text-white"} />
                      ) : addedToCart ? (
                        <><Check size={18} /> Added</>
                      ) : (
                        <><ShoppingCart size={18} /> Add to Cart</>
                      )}
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      disabled={isPending}
                      className="flex-1 bg-[#0071e3] hover:bg-[#0077ED] text-white px-6 py-[11px] rounded-[980px] font-normal flex items-center justify-center gap-2 transition disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <AppleSpinner size={18} className="text-white" />
                      ) : (
                        <><ShoppingBag size={18} /> {isDigital ? 'Get License' : 'Buy'}</>
                      )}
                    </button>
                  </div>  
                
                {/* Digital: License & Instant Delivery block */}
                {isDigital ? (
                  <>
                    {/* License Block */}
                    <div className="bg-[#f5f5f7] dark:bg-slate-800/50 rounded-[14px] p-4 flex items-center gap-4 border border-[#e8e8ed] dark:border-gray-700">
                      <div className="shrink-0"><Tag size={24} strokeWidth={1.5} className="text-[#0071e3]" /></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px] text-[#1d1d1f] dark:text-white">{product.licenseType || 'Personal'} License</span>
                        <span className="text-[12.5px] text-[#86868b] mt-0.5">
                          {product.licenseType === 'Commercial' && 'Use in client work & commercial products.'}
                          {product.licenseType === 'Extended' && 'Resell or bundle in products sold to end-users.'}
                          {(!product.licenseType || product.licenseType === 'Personal') && 'For personal, non-commercial projects only.'}
                        </span>
                      </div>
                    </div>
                    {/* Instant Download Block */}
                    <div className="bg-[#f5f5f7] dark:bg-slate-800/50 rounded-[14px] p-4 border border-[#e8e8ed] dark:border-gray-700">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1"><Download size={24} strokeWidth={1.5} className="text-[#0071e3]" /></div>
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-[15px] text-[#1d1d1f] dark:text-white mb-1">Instant Digital Delivery</span>
                          <span className="text-[13px] text-[#424245] dark:text-gray-400 leading-snug mb-2">
                            After purchase, your download link will be available in your Orders page. No waiting, no shipping.
                          </span>
                          <div className="flex flex-wrap gap-3 text-[12px] text-[#86868b]">
                            {product.fileFormat && <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">📦 {product.fileFormat}</span>}
                            {product.fileSize && <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">💾 {product.fileSize}</span>}
                            {product.version && <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">🔖 v{product.version}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Demo / Docs CTAs */}
                    {(product.demoUrl || product.documentationUrl) && (
                      <div className="flex gap-2">
                        {product.demoUrl && (
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] border border-[#0071e3] text-[#0071e3] text-[14px] font-normal hover:bg-[#0071e3] hover:text-white transition">
                            <Globe size={16} /> Live Preview
                          </a>
                        )}
                        {product.documentationUrl && (
                          <a href={product.documentationUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-[14px] font-normal hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                            <BookOpen size={16} /> Documentation
                          </a>
                        )}
                      </div>
                    )}
                    {/* Tech Stack */}
                    {techStackTags.length > 0 && (
                      <div className="bg-[#f5f5f7] dark:bg-slate-800/50 rounded-[14px] p-4 border border-[#e8e8ed] dark:border-gray-700">
                        <span className="text-[12px] font-semibold uppercase tracking-wide text-[#86868b] block mb-2">Built With</span>
                        <div className="flex flex-wrap gap-2">
                          {techStackTags.map(tag => (
                            <span key={tag} className="text-[12px] px-2.5 py-1 bg-white dark:bg-slate-700 rounded-full border border-gray-200 dark:border-gray-600 text-[#1d1d1f] dark:text-gray-200">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Changelog Accordion */}
                    {changelogEntries.length > 0 && (
                      <div className="border border-[#e8e8ed] dark:border-gray-700 rounded-[14px] overflow-hidden">
                        <button onClick={() => setChangelogOpen(o => !o)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f7] dark:bg-slate-800/50 text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                          <span>Version History</span>
                          <ChevronRight size={16} className={`transition-transform ${changelogOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {changelogOpen && (
                          <div className="divide-y divide-[#e8e8ed] dark:divide-gray-700">
                            {changelogEntries.map((entry, i) => (
                              <div key={i} className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[12px] font-bold text-[#0071e3]">v{entry.version}</span>
                                  {entry.date && <span className="text-[11px] text-[#86868b]">{new Date(entry.date).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' })}</span>}
                                </div>
                                <p className="text-[13px] text-[#424245] dark:text-gray-400">{entry.notes}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Legacy Physical: Warranty */}
                    {product.warranty_info ? (
                      <Link href="/warranty" className="bg-[#f5f5f7] hover:bg-[#e8e8ed] dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-[14px] p-4 flex items-center justify-center gap-4 text-[#1d1d1f] dark:text-white transition group border border-transparent">
                        <div className="shrink-0"><ShieldCheck size={28} strokeWidth={1.5} className="text-[#0071e3]" /></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[16px] leading-tight capitalize">{product.warranty_info}</span>
                          <span className="text-[12.5px] text-[#86868b] mt-0.5 group-hover:text-[#1d1d1f] transition">View Policy →</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="bg-[#f5f5f7] dark:bg-slate-800/50 rounded-[14px] p-4 flex items-center justify-center gap-4 text-[#86868b] border border-[#e8e8ed] dark:border-gray-700">
                        <div className="shrink-0"><ShieldCheck size={28} strokeWidth={1.5} className="opacity-40" /></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[16px] leading-tight">No Warranty</span>
                          <span className="text-[12.5px] mt-0.5">Not applicable for this item</span>
                        </div>
                      </div>
                    )}
                    {/* Legacy Physical: Delivery */}
                    <div className="bg-[#f5f5f7] dark:bg-slate-800/50 rounded-[14px] p-4 border border-[#e8e8ed] dark:border-gray-700 mt-2">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1"><Truck size={24} strokeWidth={1.5} className="text-[#0071e3]" /></div>
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-[15px] text-[#1d1d1f] dark:text-white mb-1">Delivery Details</span>
                          <span className="text-[13px] text-[#424245] dark:text-gray-400 leading-snug mb-2">
                            Cash on Delivery available. Charges calculated at checkout based on location.
                          </span>
                          <Link href="/delivery" className="text-[13px] font-medium text-[#0071e3] hover:underline flex items-center gap-1 group w-fit">
                            View Delivery Policy <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>

          </div>

          {/* Specifications (Conditional) */}
          {specs.length > 0 && (
            <div className="mt-16 mb-8 max-w-[980px]">
              <h2 className="text-[28px] font-bold text-[#1d1d1f] dark:text-white mb-8 tracking-[-0.01em]">Product Information</h2>
              <ul className="flex flex-col">
                {specs.map((s, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row border-t border-[#e8e8ed] dark:border-slate-800 py-6 sm:py-8">
                    <div className="w-full sm:w-[25%] mb-3 sm:mb-0 pr-4 shrink-0">
                      <span className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white capitalize">
                        {s.key}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[15px] text-[#1d1d1f] dark:text-gray-300 leading-[1.6]">
                        {s.value}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

      {/* Screenshot Gallery — Digital Products Only */}
      {isDigital && screenshotGallery.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h2 className="text-[28px] font-bold text-[#1d1d1f] dark:text-white mb-6 tracking-[-0.01em]">Screenshots</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {screenshotGallery.map((img, idx) => (
              <div key={idx} className="shrink-0 snap-start rounded-xl overflow-hidden border border-[#e8e8ed] dark:border-gray-700 cursor-pointer hover:opacity-90 transition"
                style={{ minWidth: '60%', maxWidth: '60%' }}
                onClick={() => { setActiveImage(img); setIsLightboxOpen(true); }}>
                <img src={getOptimizedUrl(img)} alt={`Screenshot ${idx + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description (Conditional) - Appears after the sticky image container ends */}
      {product.description && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
          <div className="w-full max-w-[980px] lg:ml-auto">
            <h2 className="text-[28px] font-bold text-[#1d1d1f] dark:text-white mb-8 tracking-[-0.01em] border-t border-[#e8e8ed] dark:border-slate-800 pt-8">Description</h2>
            <div className="whitespace-pre-line prose prose-blue dark:prose-invert max-w-none text-[#1d1d1f] dark:text-gray-300 text-[15px] leading-[1.6]">
              {product.description}
            </div>
            
            {images.length > 1 && (
              <div className="mt-8 space-y-4">
                {images.slice(1).map((img, idx) => (
                  <img key={idx} src={getOptimizedUrl(img)} alt="Product Description" className="w-full rounded-xl hover:opacity-95 transition-opacity cursor-pointer" onClick={() => { setActiveImage(img); setIsLightboxOpen(true); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-[#000000]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-gray-800 dark:text-white transition-colors z-50"
          >
            <X size={24} />
          </button>
          
          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = images.indexOf(activeImage);
                const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
                setActiveImage(images[prevIndex]);
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-gray-800 dark:text-white transition-colors z-50"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div className="w-full h-full p-12 flex items-center justify-center max-w-7xl mx-auto" onClick={() => setIsLightboxOpen(false)}>
            <img 
              src={getOptimizedUrl(activeImage)} 
              alt="Zoomed Product" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = images.indexOf(activeImage);
                const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
                setActiveImage(images[nextIndex]);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-gray-800 dark:text-white transition-colors z-50"
            >
              <ChevronRight size={32} />
            </button>
          )}
          
          {/* Thumbnails in Lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-gray-800 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={getOptimizedUrl(img)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
