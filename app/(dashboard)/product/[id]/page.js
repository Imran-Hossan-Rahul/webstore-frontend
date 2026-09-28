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
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from '@/components/ui/States';
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
  const [selectedLicense, setSelectedLicense] = useState('Personal');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
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
      <div className="min-h-screen flex items-center justify-center ] font-sans bg-brand-main">
        <LoadingState message="Loading product details..." className="border-none bg-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen ] flex items-center justify-center font-sans bg-brand-main">
        <ErrorState 
          title="Product Not Found"
          message="The product you are looking for does not exist or has been removed."
          actionLabel="Return to Market"
          onRetry={() => router.push('/shop')}
        />
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
  
  const basePriceMultiplier = selectedLicense === 'Extended' ? 5 : selectedLicense === 'Commercial' ? 2.5 : 1;
  const finalPrice = product ? (product.selling_price * basePriceMultiplier) + additionalPrice : 0;
  const finalOriginalPrice = product ? ((product.original_price || product.selling_price) * basePriceMultiplier) + additionalPrice : 0;
  
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
      variantSummary: isDigital ? `License: ${selectedLicense}` : selectedVariantsSummary,
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
          variants: isDigital ? `License: ${selectedLicense}` : selectedVariantsSummary,
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
    <div className="min-h-screen pb-16 ] font-sans bg-brand-main">
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />
      {/* Breadcrumb */}
      <div className="pt-5 pb-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono tracking-widest uppercase text-slate-400 dark:text-slate-500 dark:text-slate-400 w-full ml-4">
            <Link href="/" className="transition-colors hover:text-brand-blue shrink-0 flex items-center">
              <Home size={14} className="mb-0.5" />
            </Link>
            <span className="opacity-40 shrink-0">/</span>
            <Link href="/shop" className="transition-colors hover:text-brand-blue shrink-0">
              Shop
            </Link>
            {breadcrumbNodes.map((node, i) => (
              <React.Fragment key={i}>
                <span className="opacity-40 shrink-0">/</span>
                <Link href={node.url} className="transition-colors hover:text-brand-blue shrink-0">
                  {node.label}
                </Link>
              </React.Fragment>
            ))}
            <span className="opacity-40 shrink-0">/</span>
            <span className="text-brand-navy dark:text-white shrink-0 truncate max-w-[200px] md:max-w-md pointer-events-none">
              {product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left: Media Viewer (Sticky on Desktop) */}
        <div className="lg:w-7/12 lg:sticky lg:top-[120px] z-10 flex flex-col gap-4">
          {isDigital && product.demoUrl ? (
            <div className="w-full aspect-video rounded-[4px] overflow-hidden border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface relative group">
              <iframe 
                src={product.demoUrl} 
                className="w-full h-full border-none"
                title="Live Demo"
              />
              <div className="absolute top-4 right-4 bg-brand-surface/90 dark:bg-brand-surface/90 backdrop-blur px-3 py-1.5 rounded-[4px] text-[11px] font-mono tracking-widest uppercase text-brand-blue border border-brand-navy/[0.08] dark:border-white/10">
                Live Preview
              </div>
            </div>
          ) : isDigital && screenshotGallery.length > 0 ? (
            <div className="w-full aspect-[4/3] rounded-[4px] overflow-hidden border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface relative">
              <img 
                src={getOptimizedUrl(activeImage || screenshotGallery[0])} 
                alt="Product Preview" 
                className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                onClick={() => setIsLightboxOpen(true)}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {screenshotGallery.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-6 h-1.5 rounded-none transition-all ${activeImage === img ? 'bg-brand-blue' : 'bg-brand-surface/50 hover:bg-brand-surface'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div 
                className="aspect-square rounded-[4px] overflow-hidden mb-2 relative group flex items-center justify-center w-full p-8 md:p-12 cursor-zoom-in bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue/30 transition-all duration-300"
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
                    <div className={`absolute top-4 right-4 bg-brand-surface/80 dark:bg-black/60 backdrop-blur-md p-2 rounded-full transition-opacity duration-300 shadow-sm text-brand-slate dark:text-slate-300 ${isZooming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      <ZoomIn size={18} />
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] font-mono tracking-widest uppercase text-slate-400">No Image Available</div>
                )}
              </div>
              
              <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 bg-brand-surface dark:bg-brand-surface rounded-[4px] flex items-center justify-center p-2 overflow-hidden border transition-all ${activeImage === img ? 'border-brand-blue ring-1 ring-brand-blue/30' : 'border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-navy/[0.08] dark:hover:border-white/20'}`}
                  >
                    <img src={getOptimizedUrl(img)} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Scrolling Content */}
        <div className="lg:w-5/12 flex flex-col gap-3">
          
          {/* Top Row: Brand & Actions (Separated) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.brand && (
                <span className="border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface text-brand-navy dark:text-white text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-[4px]">
                  Brand: {product.brand}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLike}
                className={`w-9 h-9 border flex items-center justify-center rounded-[4px] bg-brand-surface dark:bg-brand-surface transition-colors ${isLiked ? 'text-pink-500 border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-500/10' : 'text-slate-400 border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue hover:text-brand-blue'}`}
              >
                <Star size={16} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button 
                onClick={handleShare}
                className="w-9 h-9 border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface text-slate-400 flex items-center justify-center rounded-[4px] hover:border-brand-blue hover:text-brand-blue transition-colors"
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
              <div className={`bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 px-5 pt-5 pb-5 flex justify-between items-start ${specs.filter(s => s.isHighlight).length > 0 ? 'border-b-0 rounded-t-[4px]' : 'rounded-[4px] mb-5'}`}>
                <div className="flex-1 pr-4">
                  <h1 className="text-[24px] sm:text-[28px] font-display font-medium text-brand-navy dark:text-white leading-tight mb-2">
                  {product.title}
                </h1>
                  {/* SKU (Admin Only) */}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && product.sku && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-[11px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">SKU: {product.sku}</span>
                      <Link 
                        href={`/admin/market/products?edit=${product.id}`}
                        className="text-[11px] font-mono uppercase bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-[4px] flex items-center gap-1 hover:bg-brand-cyan/20 transition-colors"
                      >
                        <Edit size={12} /> Edit Product
                      </Link>
                    </div>
                  )}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && !product.sku && (
                    <div className="mt-2">
                      <Link 
                        href={`/admin/market/products?edit=${product.id}`}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-brand-blue dark:text-blue-400 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                      >
                        <Edit size={12} /> Edit Product
                      </Link>
                    </div>
                  )}
                  {selectedVariantsSummary && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-[#111827]/10 border border-[#111827]/30 text-slate-800 dark:text-slate-200 text-[13px] rounded">
                        {selectedVariantsSummary}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right shrink-0 mt-1">
                  <div className="text-[28px] font-mono font-medium text-brand-navy dark:text-white mb-1">
                    BDT {formatPrice(product.selling_price)}
                  </div>
                  {finalOriginalPrice > finalPrice && (
                    <div className="text-[14px] font-mono text-slate-500 dark:text-slate-400 line-through">
                      BDT {formatPrice(finalOriginalPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Highlighted Specs */}
              {specs.filter(s => s.isHighlight).length > 0 && (
                <div className="mb-6 bg-brand-cloud dark:bg-brand-surface border border-t-0 border-brand-navy/[0.08] dark:border-white/10 px-5 pb-5 pt-3 rounded-b-[4px]">
                  <ul className="space-y-3 mb-4">
                      {specs.filter(s => s.isHighlight).slice(0, 5).map((spec, idx) => (
                        <li key={idx}>
                          <span className="text-[13px] font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong className="text-brand-navy dark:text-white font-medium">{spec.key}:</strong> {spec.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                      "Our purpose is to provide accurate information from trusted sources. If you find any errors or inaccuracies, please let us know."
                    </p>
                </div>
              )}

              {isDigital ? (
                <div className="mb-6 space-y-3 bg-brand-cloud dark:bg-brand-surface p-5 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[11px] tracking-widest text-brand-navy dark:text-white uppercase">Select License:</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {['Personal', 'Commercial', 'Extended'].map(lic => {
                      const isSelected = selectedLicense === lic;
                      let multiplier = 1;
                      let desc = "For personal, non-commercial projects only.";
                      if (lic === 'Commercial') { multiplier = 2.5; desc = "Use in client work & commercial products."; }
                      if (lic === 'Extended') { multiplier = 5; desc = "Resell or bundle in products sold to end-users."; }
                      
                      return (
                        <div 
                          key={lic} 
                          onClick={() => setSelectedLicense(lic)}
                          className={`flex items-start gap-4 p-3 rounded-[4px] border cursor-pointer transition-all ${isSelected ? 'border-brand-blue bg-brand-blue/5' : 'border-transparent hover:border-brand-navy/[0.08] dark:hover:border-white/20 bg-brand-surface dark:bg-brand-surface'}`}
                        >
                          <div className={`mt-1 w-[14px] h-[14px] rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-brand-navy/[0.08] dark:border-slate-600'}`}>
                            {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-sans font-medium text-[14px] ${isSelected ? 'text-brand-blue' : 'text-brand-navy dark:text-white'}`}>{lic}</span>
                            <span className="text-[13px] font-sans text-slate-500 dark:text-slate-400 mt-0.5">{desc}</span>
                          </div>
                          <div className="ml-auto flex flex-col items-end">
                            <span className="font-mono font-medium text-brand-navy dark:text-white text-[14px]">
                              BDT {formatPrice(product.selling_price * multiplier)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : variantGroups.length > 0 && (
                <div className="mb-6 space-y-5 bg-brand-cloud dark:bg-brand-surface p-5 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                  {variantGroups.map((group, groupIdx) => {
                    const selectedOptIdx = selectedVariants[groupIdx] || 0;
                    const selectedLabel = group.options[selectedOptIdx]?.label || '';
                    
                    return (
                      <div key={groupIdx}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono text-[11px] tracking-widest text-brand-navy dark:text-white uppercase">{group.name}:</span>
                          <span className="text-slate-500 dark:text-slate-400 text-[13px]">{selectedLabel}</span>
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
                                  className={`aspect-square w-14 h-14 bg-brand-surface dark:bg-brand-surface rounded-[4px] border p-1 flex items-center justify-center overflow-hidden transition-all duration-300 ${isSelected ? 'border-brand-blue ring-1 ring-brand-blue/30' : 'border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-navy/[0.08] dark:hover:border-white/20'}`}
                                  title={option.label}
                                >
                                  <img src={imgUrl} alt={option.label} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </button>
                              );
                            }
                            
                            // Text Pills
                            return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectVariant(groupIdx, optIdx)}
                                  className={`px-4 py-2 rounded-[4px] border text-[13px] font-sans transition-colors ${isSelected ? 'bg-brand-blue text-white border-brand-blue' : 'bg-brand-surface dark:bg-brand-surface text-brand-navy dark:text-slate-300 border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue hover:text-brand-blue'}`}
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
                    <Button 
                      variant={addedToCart ? "primary" : "outline"}
                      className={`flex-1 ${addedToCart ? 'bg-brand-teal text-white border-brand-teal hover:bg-brand-teal/90' : 'border-brand-blue text-brand-blue hover:bg-brand-blue/5'}`}
                      onClick={() => {
                        if (addedToCart) {
                          router.push('/cart');
                        } else {
                          handleAddToCart();
                        }
                      }}
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <AppleSpinner size={18} className={addedToCart ? "text-white" : "text-brand-blue"} />
                      ) : addedToCart ? (
                        <><Check size={18} strokeWidth={1.5} className="mr-2" /> Added</>
                      ) : (
                        <><ShoppingCart size={18} strokeWidth={1.5} className="mr-2" /> Add to Cart</>
                      )}
                    </Button>
                    <Button 
                      variant="primary"
                      className="flex-1"
                      onClick={handleBuyNow}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <AppleSpinner size={18} className="text-white" />
                      ) : (
                        <><ShoppingBag size={18} strokeWidth={1.5} className="mr-2" /> {isDigital ? 'Get License' : 'Buy Now'}</>
                      )}
                    </Button>
                  </div>  
                
                {/* Digital: License & Instant Delivery block */}
                {isDigital ? (
                  <>
                    {/* License Block */}
                    <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-4 flex items-center gap-4 border border-brand-navy/[0.08] dark:border-white/10 mt-2">
                      <div className="shrink-0"><Tag size={20} strokeWidth={1.5} className="text-brand-blue" /></div>
                      <div className="flex flex-col">
                        <span className="font-sans font-medium text-[14px] text-brand-navy dark:text-white">{product.licenseType || 'Personal'} License</span>
                        <span className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {product.licenseType === 'Commercial' && 'Use in client work & commercial products.'}
                          {product.licenseType === 'Extended' && 'Resell or bundle in products sold to end-users.'}
                          {(!product.licenseType || product.licenseType === 'Personal') && 'For personal, non-commercial projects only.'}
                        </span>
                      </div>
                    </div>
                    {/* Instant Download Block */}
                    <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-4 border border-brand-navy/[0.08] dark:border-white/10">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1"><Download size={20} strokeWidth={1.5} className="text-brand-blue" /></div>
                        <div className="flex flex-col flex-1">
                          <span className="font-sans font-medium text-[14px] text-brand-navy dark:text-white mb-1">Instant Digital Delivery</span>
                          <span className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug mb-3">
                            After purchase, your download link will be available in your Orders page. No waiting, no shipping.
                          </span>
                          <div className="flex flex-wrap gap-2 text-[11px] font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            {product.fileFormat && <span className="bg-brand-surface dark:bg-brand-surface px-2 py-1 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 flex items-center gap-1.5"><FileCode2 size={12}/> {product.fileFormat}</span>}
                            {product.fileSize && <span className="bg-brand-surface dark:bg-brand-surface px-2 py-1 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 flex items-center gap-1.5"><Award size={12}/> {product.fileSize}</span>}
                            {product.version && <span className="bg-brand-surface dark:bg-brand-surface px-2 py-1 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 flex items-center gap-1.5"><ZoomIn size={12}/> v{product.version}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Demo / Docs CTAs */}
                    {(product.demoUrl || product.documentationUrl) && (
                      <div className="flex gap-3">
                        {product.demoUrl && (
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[4px] border border-brand-blue text-brand-blue text-[14px] font-sans font-medium hover:bg-brand-blue/5 transition-colors">
                            <Globe size={16} strokeWidth={1.5} /> Live Preview
                          </a>
                        )}
                        {product.documentationUrl && (
                          <a href={product.documentationUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/20 text-slate-600 dark:text-slate-300 text-[14px] font-sans font-medium hover:bg-brand-cloud dark:hover:bg-[#161B22] transition-colors">
                            <BookOpen size={16} strokeWidth={1.5} /> Documentation
                          </a>
                        )}
                      </div>
                    )}
                    {/* Tech Stack */}
                    {techStackTags.length > 0 && (
                      <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-4 border border-brand-navy/[0.08] dark:border-white/10 mt-3">
                        <span className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-3">Built With</span>
                        <div className="flex flex-wrap gap-2">
                          {techStackTags.map(tag => (
                            <span key={tag} className="text-[12px] font-mono px-2 py-1 bg-brand-surface dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 text-brand-navy dark:text-slate-300">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Changelog Accordion */}
                    {changelogEntries.length > 0 && (
                      <div className="border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] overflow-hidden mt-3 bg-brand-surface dark:bg-brand-surface">
                        <button onClick={() => setChangelogOpen(o => !o)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-brand-cloud dark:bg-brand-surface text-[14px] font-sans font-medium text-brand-navy dark:text-white border-b border-transparent hover:border-brand-navy/[0.08] dark:hover:border-white/10 transition-colors">
                          <span>Version History</span>
                          <ChevronRight size={16} className={`transition-transform text-slate-400 ${changelogOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {changelogOpen && (
                          <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {changelogEntries.map((entry, i) => (
                              <div key={i} className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[12px] font-mono font-medium text-brand-blue">v{entry.version}</span>
                                  {entry.date && <span className="text-[11px] font-mono text-slate-400">{new Date(entry.date).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' })}</span>}
                                </div>
                                <p className="text-[13px] font-sans text-slate-600 dark:text-slate-400">{entry.notes}</p>
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
                      <Link href="/warranty" className="bg-brand-cloud hover:bg-slate-100 dark:bg-brand-surface dark:hover:bg-[#1c222b] rounded-[4px] p-4 flex items-center justify-center gap-4 text-brand-navy dark:text-white transition-colors group border border-brand-navy/[0.08] dark:border-white/10 mt-3">
                        <div className="shrink-0"><ShieldCheck size={24} strokeWidth={1.5} className="text-brand-blue" /></div>
                        <div className="flex flex-col">
                          <span className="font-sans font-medium text-[15px] leading-tight capitalize">{product.warranty_info}</span>
                          <span className="text-[12px] font-mono uppercase tracking-widest text-brand-blue opacity-80 mt-1 group-hover:opacity-100 transition-opacity">View Policy →</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-4 flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 border border-brand-navy/[0.08] dark:border-white/10 mt-3">
                        <div className="shrink-0"><ShieldCheck size={24} strokeWidth={1.5} className="opacity-40" /></div>
                        <div className="flex flex-col">
                          <span className="font-sans font-medium text-[15px] leading-tight text-brand-navy dark:text-slate-300">No Warranty</span>
                          <span className="text-[13px] mt-0.5">Not applicable for this item</span>
                        </div>
                      </div>
                    )}
                    {/* Legacy Physical: Delivery */}
                    <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-4 border border-brand-navy/[0.08] dark:border-white/10 mt-3">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1"><Truck size={20} strokeWidth={1.5} className="text-brand-blue" /></div>
                        <div className="flex flex-col flex-1">
                          <span className="font-sans font-medium text-[14px] text-brand-navy dark:text-white mb-1">Delivery Details</span>
                          <span className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug mb-2">
                            Cash on Delivery available. Charges calculated at checkout based on location.
                          </span>
                          <Link href="/delivery" className="text-[12px] font-mono uppercase tracking-widest text-brand-blue hover:text-brand-blue/80 flex items-center gap-1 group w-fit mt-1">
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
              <h2 className="text-[24px] font-display font-medium text-brand-navy dark:text-white mb-8 border-b border-brand-navy/[0.08] dark:border-white/10 pb-4">Product Information</h2>
              <ul className="flex flex-col">
                {specs.map((s, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row border-b border-slate-100 dark:border-white/5 py-5">
                    <div className="w-full sm:w-[30%] mb-2 sm:mb-0 pr-4 shrink-0 flex items-center">
                      <span className="text-[13px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {s.key}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[14px] font-sans text-brand-navy dark:text-slate-300 leading-relaxed">
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
          <h2 className="text-[24px] font-display font-medium text-brand-navy dark:text-white mb-6 border-b border-brand-navy/[0.08] dark:border-white/10 pb-4">Screenshots</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {screenshotGallery.map((img, idx) => (
              <div key={idx} className="shrink-0 snap-start rounded-[4px] overflow-hidden border border-brand-navy/[0.08] dark:border-white/10 cursor-pointer hover:opacity-90 transition-opacity bg-brand-cloud dark:bg-brand-surface"
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
            <h2 className="text-[24px] font-display font-medium text-brand-navy dark:text-white mb-6 border-b border-brand-navy/[0.08] dark:border-white/10 pb-4 pt-8">Description</h2>
            <div className="whitespace-pre-line prose prose-blue dark:prose-invert max-w-none text-brand-navy dark:text-slate-300 text-[15px] font-sans leading-relaxed">
              {product.description}
            </div>
            
            {images.length > 1 && (
              <div className="mt-8 space-y-4">
                {images.slice(1).map((img, idx) => (
                  <img key={idx} src={getOptimizedUrl(img)} alt="Product Description" className="w-full rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 hover:opacity-95 transition-opacity cursor-pointer" onClick={() => { setActiveImage(img); setIsLightboxOpen(true); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16 pt-12">
        <h2 className="text-[24px] font-display font-medium text-brand-navy dark:text-white mb-8 border-b border-brand-navy/[0.08] dark:border-white/10 pb-4">Customer Reviews</h2>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Summary & Form */}
          <div className="lg:w-4/12 flex flex-col gap-6">
            <div className="bg-brand-cloud dark:bg-brand-surface p-6 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-[48px] font-display font-medium text-brand-navy dark:text-white leading-none">
                  {product.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex text-pink-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={20} className={star <= Math.round(product.averageRating || 0) ? "fill-current" : "text-slate-300 dark:text-slate-600 dark:text-slate-300"} />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-1">{product.reviewCount || 0} Ratings</span>
                </div>
              </div>
              <p className="text-[13px] font-sans text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Only verified buyers can leave a review. This ensures all feedback is genuine and helpful to our community.
              </p>
              <div className="flex flex-col gap-3 border-t border-brand-navy/[0.08] dark:border-white/10 pt-6">
                <h4 className="font-sans font-medium text-[15px] text-brand-navy dark:text-white">Leave a Review</h4>
                <div className="flex gap-1 text-pink-500 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)} className="hover:scale-110 transition-transform">
                      <Star size={24} className={star <= reviewRating ? "fill-current" : "text-slate-300 dark:text-slate-600 dark:text-slate-300"} />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/20 rounded-[4px] p-3 text-[14px] font-sans min-h-[100px] outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all text-brand-navy dark:text-white placeholder:text-slate-400"
                />
                <button 
                  onClick={() => alert('Review submitted for moderation.')}
                  className="bg-brand-navy dark:bg-brand-surface text-white dark:text-brand-navy font-sans font-medium py-2.5 rounded-[4px] text-[14px] hover:opacity-90 transition-opacity"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
          
          {/* Review List */}
          <div className="lg:w-8/12 flex flex-col gap-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, i) => (
                <div key={i} className="border-b border-brand-navy/[0.08] dark:border-white/10 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-sans font-medium text-brand-navy dark:text-white text-[15px]">{rev.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex text-pink-500">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} className={star <= rev.rating ? "fill-current" : "text-slate-300 dark:text-slate-600 dark:text-slate-300"} />
                          ))}
                        </div>
                        {rev.verified && <span className="text-[10px] font-mono font-medium text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest">Verified Buyer</span>}
                      </div>
                    </div>
                    <span className="text-[12px] font-mono tracking-widest text-slate-500 dark:text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[14px] font-sans text-brand-navy dark:text-slate-300 leading-relaxed mt-3">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] bg-brand-cloud dark:bg-brand-surface">
                <Star size={40} strokeWidth={1} className="text-slate-300 dark:text-slate-600 dark:text-slate-300 mb-4" />
                <h3 className="text-[16px] font-sans font-medium text-brand-navy dark:text-white mb-2">No reviews yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] font-sans">Be the first to share your thoughts on this product.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-cloud/95 dark:bg-brand-surface/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue dark:hover:border-brand-blue rounded-[4px] text-brand-navy dark:text-white transition-colors z-50"
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
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue dark:hover:border-brand-blue rounded-[4px] text-brand-navy dark:text-white transition-colors z-50"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div className="w-full h-full p-12 flex items-center justify-center max-w-7xl mx-auto" onClick={() => setIsLightboxOpen(false)}>
            <img 
              src={getOptimizedUrl(activeImage)} 
              alt="Zoomed Product" 
              className="max-w-full max-h-full object-contain drop-shadow-sm animate-in zoom-in-95 duration-500"
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
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-blue dark:hover:border-brand-blue rounded-[4px] text-brand-navy dark:text-white transition-colors z-50"
            >
              <ChevronRight size={32} />
            </button>
          )}
          
          {/* Thumbnails in Lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-4 bg-brand-cloud/80 dark:bg-brand-surface/80 border border-brand-navy/[0.08] dark:border-white/10 backdrop-blur-md rounded-[4px]">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-[4px] overflow-hidden border transition-all ${activeImage === img ? 'border-brand-blue scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100 hover:border-brand-navy/[0.08] dark:hover:border-white/20'}`}
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
