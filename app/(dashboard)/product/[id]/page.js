"use client";
import React, { useEffect, useState, useContext, useTransition } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Download, Truck, ShieldCheck, Globe, FileCode2, BookOpen, ShoppingCart, CreditCard, ChevronRight, ChevronLeft, X, Check, Minus, Plus, Home, Share2, Eye, ArrowLeftRight, ShoppingBag, Package, Award, Edit, ZoomIn, ZoomOut, Zap, Tag, ExternalLink } from "lucide-react";
import { isDigitalProduct, PRODUCT_TYPE_COLORS, safeParseJSON } from "@/utils/digitalProducts";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useShare } from "@/hooks/useShare";
import { api } from "@/utils/api";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from '@/components/ui/States';
import GlassBackground from '@/components/dashboard/market/GlassBackground';
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
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [variantGroups, setVariantGroups] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedLicense, setSelectedLicense] = useState('Personal');
  const [selectedSupportPlan, setSelectedSupportPlan] = useState('basic');
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
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

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
      nodes.push({ label: cat.name, url: `/store?category_id=${cat._id || cat.id}` });
      
      // Find subcategory
      const sub = (cat.subcategories || []).find(s => s._id === product.subCategory_id || s.id === product.subCategory_id);
      if (sub) {
        nodes.push({ label: sub.name, url: `/store?subCategory_id=${sub._id || sub.id}` });
        
        // Find childcategory
        const child = (sub.subcategories || []).find(c => c._id === product.childCategory_id || c.id === product.childCategory_id);
        if (child) {
          nodes.push({ label: child.name, url: `/store?childCategory_id=${child._id || child.id}` });
        }
      }
    }
    return nodes;
  }, [product, categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans bg-transparent">
        <LoadingState message="Loading product details..." className="border-none bg-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans bg-transparent">
        <ErrorState 
          title="Product Not Found"
          message="The product you are looking for does not exist or has been removed."
          actionLabel="Return to Market"
          onRetry={() => router.push('/store')}
        />
      </div>
    );
  }

  let specs = [];
  try {
    specs = product.specifications ? JSON.parse(product.specifications) : [];
  } catch(e) {}
  
  const isDigital = isDigitalProduct(product);

  const SUPPORT_PLANS = [
    { 
      id: 'basic', 
      title: 'Free Setup & 1-Month Warranty', 
      price: 0, 
      desc: 'Full deployment & branding (Delivery: 4-7 Days), plus 1-month post-delivery support.',
      note: 'Note: The 1-month free warranty starts AFTER the 4-7 days deployment is completed. We will configure your logo, colors, text, and basic brand elements without tracking hours, ensuring delivery within the time margin. Extreme structural or UI changes are not included.',
      features: [
        { text: 'Full deployment & server setup (4-7 Days)', included: true },
        { text: 'Custom brand setup (Logo & Colors)', included: true },
        { text: '1-Month free warranty & bug fixes', included: true },
        { text: 'Layout or UI redesigns (up to 30h/mo)', included: false },
        { text: 'Custom feature development (up to 30h/mo)', included: false },
        { text: 'Core architecture overhauls (up to 60h/mo)', included: false },
        { text: 'Priority 24/7 technical support', included: false }
      ]
    },
    { 
      id: 'standard', 
      title: 'Standard Retainer (3 Months)', 
      price: 4999, 
      desc: 'Up to 30 hours/month of dedicated developer time for full redesigns or features.',
      features: [
        { text: 'Full deployment & server setup (4-7 Days)', included: true },
        { text: 'Custom brand setup (Logo & Colors)', included: true },
        { text: '1-Month free warranty & bug fixes', included: true },
        { text: 'Layout or UI redesigns (up to 30h/mo)', included: true },
        { text: 'Custom feature development (up to 30h/mo)', included: true },
        { text: 'Core architecture overhauls (up to 60h/mo)', included: false },
        { text: 'Priority 24/7 technical support', included: false }
      ]
    },
    { 
      id: 'pro', 
      title: 'Pro Retainer (6 Months)', 
      price: 8999, 
      desc: 'Up to 60 hours/month of dedicated development for massive scaling and updates.',
      features: [
        { text: 'Full deployment & server setup (4-7 Days)', included: true },
        { text: 'Custom brand setup (Logo & Colors)', included: true },
        { text: '1-Month free warranty & bug fixes', included: true },
        { text: 'Layout or UI redesigns (up to 60h/mo)', included: true },
        { text: 'Custom feature development (up to 60h/mo)', included: true },
        { text: 'Core architecture overhauls (up to 60h/mo)', included: true },
        { text: 'Priority 24/7 technical support', included: true }
      ]
    }
  ];

  const additionalPrice = variantGroups.reduce((sum, group, idx) => {
    const selectedOptIdx = selectedVariants[idx];
    if (selectedOptIdx !== undefined && group.options[selectedOptIdx]) {
      return sum + (Number(group.options[selectedOptIdx].priceDifference) || 0);
    }
    return sum;
  }, 0);
  
  const supportPlanPrice = isDigital ? (SUPPORT_PLANS.find(p => p.id === selectedSupportPlan)?.price || 0) : 0;
  
  const hasDynamicLicenses = isDigital && variantGroups.some(g => g.name === 'License Type');
  const basePriceMultiplier = (isDigital && !hasDynamicLicenses) ? (selectedLicense === 'Extended' ? 5 : selectedLicense === 'Commercial' ? 2.5 : 1) : 1;
  const finalPrice = product ? (product.selling_price * basePriceMultiplier) + additionalPrice + supportPlanPrice : 0;
  const finalOriginalPrice = product ? ((product.original_price || product.selling_price) * basePriceMultiplier) + additionalPrice + supportPlanPrice : 0;
  
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
      variantSummary: isDigital ? (hasDynamicLicenses ? `${selectedVariantsSummary} | Support: ${SUPPORT_PLANS.find(p=>p.id===selectedSupportPlan)?.title}` : `License: ${selectedLicense} | Support: ${SUPPORT_PLANS.find(p=>p.id===selectedSupportPlan)?.title}`) : selectedVariantsSummary,
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
          variants: isDigital ? `License: ${selectedLicense} | Support: ${SUPPORT_PLANS.find(p=>p.id===selectedSupportPlan)?.title}` : selectedVariantsSummary,
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
    <div className="min-h-screen pb-16 font-sans bg-transparent relative overflow-hidden">

      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        reason="like" 
      />
      {/* Breadcrumb */}
      <div className="pt-5 pb-2 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-sans font-normal w-full ml-4 text-slate-600 dark:text-slate-400">
            <Link href="/" className="transition-colors hover:text-brand-blue shrink-0 flex items-center">
              <Home size={15} className="mb-0.5 text-slate-500" />
            </Link>
            <span className="shrink-0 opacity-40">/</span>
            <Link href="/store" className="transition-colors hover:text-brand-blue shrink-0">
              Shop
            </Link>
            {breadcrumbNodes.map((node, i) => (
              <React.Fragment key={i}>
                <span className="shrink-0 opacity-40">/</span>
                <Link href={node.url} className="transition-colors hover:text-brand-blue shrink-0">
                  {node.label}
                </Link>
              </React.Fragment>
            ))}
            <span className="shrink-0 opacity-40">/</span>
            <span className="font-medium shrink-0 truncate max-w-[200px] md:max-w-md pointer-events-none text-black dark:text-white">
              {product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col gap-10 items-center">
        
        {/* Top: Media Viewer (Full Width) */}
        <div className="w-full z-10 flex flex-col gap-4">
          {(() => {
            const displayImages = [...images, ...screenshotGallery];
            const hasSidebar = (displayImages.length > 0 && product.demoUrl) || (displayImages.length > 1 && !product.demoUrl);
            const activeImg = activeImage || displayImages[0];
            
            return (
              <div className={`flex flex-col lg:flex-row gap-4 w-full ${hasSidebar ? 'lg:h-[500px]' : 'lg:h-[600px]'}`}>
                {/* Left Side: Live Preview OR Active Image */}
                <div 
                  className={`rounded-[20px] overflow-hidden relative group flex items-center justify-center shadow-sm transition-all duration-300 ${hasSidebar ? 'w-full lg:w-[75%] h-[350px] lg:h-full' : 'w-full h-[400px] lg:h-full'} ${!product.demoUrl ? 'cursor-zoom-in bg-white/20' : 'bg-brand-navy/5'}`}
                  onClick={() => {
                    if (!product.demoUrl && activeImg) setIsLightboxOpen(true);
                  }}
                >
                  {product.demoUrl ? (
                    <>
                      <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md border border-white/40 px-3 py-1.5 rounded-[20px] text-[11px] font-mono tracking-widest uppercase text-brand-navy z-20 shadow-sm flex items-center gap-2 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live Preview
                      </div>
                      
                      <a 
                        href={product.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10 cursor-pointer"
                        title="Open Live Website"
                      ></a>
                      
                      <a 
                        href={product.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-brand-navy/90 hover:bg-brand-navy backdrop-blur-md text-white px-6 py-3 rounded-full font-sans font-medium text-[14px] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:scale-105 z-30 translate-y-4 group-hover:translate-y-0"
                      >
                        <ExternalLink size={16} />
                        Click to visit live website
                      </a>
                      
                      <iframe src={product.demoUrl} className="w-full h-[calc(100%+20px)] border-none pointer-events-none" title="Live Preview" />
                    </>
                  ) : activeImg ? (
                    <>
                      <img 
                        src={getOptimizedUrl(activeImg)} 
                        alt={product.title} 
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-md border-white/20 shadow-sm/80 p-2 rounded-full transition-opacity duration-300 text-brand-slate opacity-0 group-hover:opacity-100">
                        <ZoomIn size={18} />
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] font-mono tracking-widest uppercase text-slate-400">No Media Available</div>
                  )}
                </div>
                
                {/* Right Side: Unusual Grid */}
                {hasSidebar && (
                  <div 
                    className="w-full lg:w-[25%] lg:h-full overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden min-h-0 scrollbar-hide pr-1"
                    style={{ 
                      maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', 
                      WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' 
                    }}
                  >
                    <div className="flex lg:block lg:columns-2 lg:gap-3 w-max lg:w-full lg:pb-24 pt-1">
                      {displayImages.map((img, idx) => {
                        const isActive = !product.demoUrl && activeImg === img;
                        return (
                          <button 
                            key={idx} 
                            onClick={() => {
                              if (product.demoUrl) {
                                setActiveImage(img);
                                setIsLightboxOpen(true);
                              } else {
                                setActiveImage(img);
                              }
                            }}
                            className={`shrink-0 block relative overflow-hidden rounded-[16px] border-2 transition-all ${isActive ? 'border-brand-blue shadow-md' : 'border-transparent hover:border-brand-blue/30'} h-[100px] w-auto lg:w-full lg:h-auto lg:mb-3 break-inside-avoid group`}
                          >
                            <img src={getOptimizedUrl(img)} alt={`Thumbnail ${idx+1}`} className="h-full w-auto lg:w-full lg:h-auto block group-hover:scale-105 transition-transform duration-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Bottom: Info Section (2 Columns) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4 items-start">
          
          {/* Column 1: Info & Purchase */}
          <div className="flex flex-col gap-3">
          
          {/* Top Row: Brand & Actions (Separated) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.brand && (
                <span className="border border-brand-navy/[0.08]  bg-white/40 backdrop-blur-md border-white/20 shadow-sm  text-brand-navy  text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-[20px]">
                  Brand: {product.brand}
                </span>
              )}
            </div>
            

          </div>

          {/* Top: Product Info & Delivery */}
          <div className="flex flex-col">
            
            {/* Product Info */}
            <div className="flex flex-col">
              
              {/* Gray Info Block */}
              <div className={`bg-white/40 backdrop-blur-md border-white/20 shadow-sm  border border-slate-200 px-5 pt-5 pb-5 flex justify-between items-start ${specs.filter(s => s.isHighlight).length > 0 ? 'border-b-0 rounded-t-[4px]' : 'rounded-[20px] mb-5'}`}>
                <div className="flex-1 pr-4">
                  <h1 className="text-[24px] sm:text-[28px] font-display font-medium leading-tight mb-2" style={{ color: '#0f172a' }}>
                  {product.title}
                </h1>
                  {/* SKU (Admin Only) */}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && product.sku && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-[11px] font-mono tracking-widest text-slate-500  uppercase">SKU: {product.sku}</span>
                      <Link 
                        href={`/admin/market/products?edit=${product.id}`}
                        className="text-[11px] font-mono uppercase bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-[20px] flex items-center gap-1 hover:bg-brand-cyan/20 transition-colors"
                      >
                        <Edit size={12} /> Edit Product
                      </Link>
                    </div>
                  )}
                  {(user?.role === 'admin' || user?.role === 'superadmin') && !product.sku && (
                    <div className="mt-2">
                      <Link 
                        href={`/admin/market/products?edit=${product.id}`}
                        className="text-xs bg-blue-100  text-brand-blue  px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-blue-200  transition"
                      >
                        <Edit size={12} /> Edit Product
                      </Link>
                    </div>
                  )}
                  {selectedVariantsSummary && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-[#111827]/10 border border-[#111827]/30 text-slate-800  text-[13px] rounded">
                        {selectedVariantsSummary}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right shrink-0 mt-1">
                  <div className="text-[28px] font-mono font-medium text-brand-navy  mb-1">
                    BDT {formatPrice(finalPrice)}
                  </div>
                  {finalOriginalPrice > finalPrice && (
                    <div className="text-[14px] font-mono text-slate-500  line-through">
                      BDT {formatPrice(finalOriginalPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Highlighted Specs */}
              {specs.filter(s => s.isHighlight).length > 0 && (
                <div className="mb-6 bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  border border-t-0 border-brand-navy/[0.08]  px-5 pb-5 pt-3 rounded-b-[4px]">
                  <ul className="space-y-3 mb-4">
                      {specs.filter(s => s.isHighlight).slice(0, 5).map((spec, idx) => (
                        <li key={idx}>
                          <span className="text-[13px] font-sans text-slate-600  leading-relaxed">
                            <strong className="text-brand-navy  font-medium">{spec.key}:</strong> {spec.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                      "Our purpose is to provide accurate information from trusted sources. If you find any errors or inaccuracies, please let us know."
                    </p>
                </div>
              )}

              {/* Digital: Instant Delivery & Tech Stack */}
              {isDigital && (
                <div className="flex flex-col gap-3 mb-6">
                  {/* Instant Download Block */}
                  <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm rounded-[20px] p-4 border border-brand-navy/[0.08]">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1"><Download size={20} strokeWidth={1.5} className="text-brand-blue" /></div>
                      <div className="flex flex-col flex-1">
                        <span className="font-sans font-medium text-[14px] text-brand-navy mb-1">Instant Digital Delivery</span>
                        <span className="text-[13px] text-slate-500 leading-snug mb-3">
                          After purchase, your download link will be available in your Orders page. No waiting, no shipping.
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono tracking-widest uppercase text-slate-500">
                          {product.fileFormat && <span className="bg-white/40 backdrop-blur-md border-white/20 shadow-sm px-2 py-1 rounded-[20px] border border-brand-navy/[0.08] flex items-center gap-1.5"><FileCode2 size={12}/> {product.fileFormat}</span>}
                          {product.fileSize && <span className="bg-white/40 backdrop-blur-md border-white/20 shadow-sm px-2 py-1 rounded-[20px] border border-brand-navy/[0.08] flex items-center gap-1.5"><Award size={12}/> {product.fileSize}</span>}
                          {product.version && <span className="bg-white/40 backdrop-blur-md border-white/20 shadow-sm px-2 py-1 rounded-[20px] border border-brand-navy/[0.08] flex items-center gap-1.5"><ZoomIn size={12}/> v{product.version}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tech Stack */}
                  {techStackTags.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm rounded-[20px] p-4 border border-brand-navy/[0.08]">
                      <span className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-500 block mb-3">Built With</span>
                      <div className="flex flex-wrap gap-2">
                        {techStackTags.map(tag => (
                          <span key={tag} className="text-[12px] font-mono px-2 py-1 bg-white/40 backdrop-blur-md border-white/20 shadow-sm rounded-[20px] border border-brand-navy/[0.08] text-brand-navy">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isDigital && !hasDynamicLicenses ? (
                <div className="mb-6 space-y-3 bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  p-5 rounded-[20px] border border-brand-navy/[0.08] ">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[11px] tracking-widest text-brand-navy  uppercase">Select License:</span>
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
                          className={`flex items-start gap-4 p-3 rounded-[20px] border cursor-pointer transition-all ${isSelected ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-300 hover:border-slate-400  bg-white/40 backdrop-blur-md shadow-sm '}`}
                        >
                          <div className={`mt-1 w-[14px] h-[14px] rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-slate-300 '}`}>
                            {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-sans font-medium text-[14px] ${isSelected ? 'text-brand-blue' : 'text-brand-navy '}`}>{lic}</span>
                            <span className="text-[13px] font-sans text-slate-500  mt-0.5">{desc}</span>
                          </div>
                          <div className="ml-auto flex flex-col items-end shrink-0">
                            <span className="font-mono font-medium text-brand-navy  text-[14px]">
                              BDT {formatPrice(product.selling_price * multiplier)}
                            </span>
                            {(product.original_price && product.original_price > product.selling_price) && (
                              <span className="font-mono text-slate-400 line-through text-[11px] mt-0.5">
                                BDT {formatPrice(product.original_price * multiplier)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Read Rules Button */}
                  <div className="mt-4 pt-4 border-t border-brand-navy/[0.08]">
                    <Link 
                      href="/legal" 
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 bg-brand-navy/[0.03] hover:bg-brand-navy/[0.06] text-brand-navy text-[13px] font-medium py-2.5 rounded-[12px] transition-colors border border-brand-navy/[0.05]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      Please read before buy: License Rules & How it works
                    </Link>
                  </div>
                  
                </div>
              ) : variantGroups.length > 0 && (
                <div className="mb-6 space-y-5 bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  p-5 rounded-[20px] border border-brand-navy/[0.08] ">
                  {variantGroups.map((group, groupIdx) => {
                    const selectedOptIdx = selectedVariants[groupIdx] || 0;
                    const selectedLabel = group.options[selectedOptIdx]?.label || '';
                    
                    if (isDigital && group.name === 'License Type') {
                      return (
                        <div key={groupIdx} className="mb-2">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-[11px] tracking-widest text-brand-navy  uppercase">Select License:</span>
                          </div>
                          <div className="flex flex-col gap-3">
                            {group.options.map((opt, actualIdx) => {
                              const isSelected = selectedOptIdx === actualIdx;
                              let desc = "For personal, non-commercial projects only.";
                              if (opt.label.includes('Commercial')) desc = "Use in client work & commercial products.";
                              if (opt.label.includes('Extended')) desc = "Resell or bundle in products sold to end-users.";

                              return (
                                <div 
                                  key={opt.label} 
                                  onClick={() => handleSelectVariant(groupIdx, actualIdx)}
                                  className={`flex items-start gap-4 p-3 rounded-[20px] border cursor-pointer transition-all ${isSelected ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-300 hover:border-slate-400  bg-white/40 backdrop-blur-md shadow-sm '}`}
                                >
                                  <div className={`mt-1 w-[14px] h-[14px] rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-slate-300 '}`}>
                                    {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`font-sans font-medium text-[14px] ${isSelected ? 'text-brand-blue' : 'text-brand-navy '}`}>{opt.label.replace(' License', '')}</span>
                                    <span className="text-[13px] font-sans text-slate-500  mt-0.5">{desc}</span>
                                  </div>
                                  <div className="ml-auto flex flex-col items-end shrink-0">
                                    <span className="font-mono font-medium text-brand-navy  text-[14px]">
                                      BDT {formatPrice(product.selling_price + (Number(opt.priceDifference) || 0))}
                                    </span>
                                    {(product.original_price && product.original_price > product.selling_price) && (
                                      <span className="font-mono text-slate-400 line-through text-[11px] mt-0.5">
                                        BDT {formatPrice((product.original_price || product.selling_price) + (Number(opt.originalPriceDifference) || 0))}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <div className="mt-4 pt-4 border-t border-brand-navy/[0.08]">
                            <Link href="/legal" target="_blank" className="w-full flex items-center justify-center gap-2 bg-brand-navy/[0.03] hover:bg-brand-navy/[0.06] text-brand-navy text-[13px] font-medium py-2.5 rounded-[12px] transition-colors border border-brand-navy/[0.05]">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                              Please read before buy: License Rules & How it works
                            </Link>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={groupIdx} className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono text-[11px] tracking-widest text-brand-navy  uppercase">{group.name}:</span>
                          <span className="text-slate-500  text-[13px]">{selectedLabel}</span>
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
                                  className={`aspect-square w-14 h-14 bg-white/40 backdrop-blur-md border-white/20 shadow-sm  rounded-[20px] border p-1 flex items-center justify-center overflow-hidden transition-all duration-300 ${isSelected ? 'border-brand-blue ring-1 ring-brand-blue/30' : 'border-brand-navy/[0.08]  hover:border-brand-navy/[0.08] '}`}
                                  title={option.label}
                                >
                                  <img src={imgUrl} alt={option.label} className="w-full h-full object-contain mix-blend-multiply " />
                                </button>
                              );
                            }
                            
                            return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectVariant(groupIdx, optIdx)}
                                  className={`px-4 py-2 rounded-[20px] border text-[13px] font-sans transition-colors ${isSelected ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white/40 backdrop-blur-md shadow-sm  text-slate-800  border-slate-300  hover:border-brand-blue hover:text-brand-blue'}`}
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


            </div>
          </div>
        </div>

        {/* Column 2: Additional Details */}
        <div className="flex flex-col gap-3">

              {/* Digital: Support & Development Plan Block */}
              {isDigital && (
                <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  rounded-[20px] p-5 border border-brand-navy/[0.08]  mb-4">
                  <h3 className="font-sans font-medium text-[13px] uppercase tracking-widest mb-4 text-slate-900" style={{ color: '#0f172a' }}>Dedicated Support & Development</h3>
                  <div className="flex flex-col gap-3">
                    {SUPPORT_PLANS.map(plan => (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedSupportPlan(plan.id)}
                        className={`flex gap-3 p-3 rounded-[12px] border cursor-pointer transition-all ${selectedSupportPlan === plan.id ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-200 hover:border-brand-blue/30'}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSupportPlan === plan.id ? 'border-brand-blue' : 'border-slate-300'}`}>
                            {selectedSupportPlan === plan.id && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
                          </div>
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex justify-between items-start">
                            <span className={`font-sans font-medium text-[14px] ${selectedSupportPlan === plan.id ? 'text-brand-blue' : 'text-brand-navy'}`}>{plan.title}</span>
                            <span className="font-mono text-[12px] font-bold text-slate-700">{plan.price === 0 ? 'FREE' : `+BDT ${formatPrice(plan.price)}`}</span>
                          </div>
                          <span className="text-[12px] text-slate-500 mt-1 leading-snug">{plan.desc}</span>
                          
                          {selectedSupportPlan === plan.id && plan.features && (
                            <div className="mt-3 flex flex-col gap-1.5 border-t border-brand-navy/[0.08] pt-3">
                              {plan.features.map((feature, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-2">
                                  {feature.included ? (
                                    <Check size={14} className="text-brand-teal mt-0.5 shrink-0" strokeWidth={2.5} />
                                  ) : (
                                    <X size={14} className="text-slate-400 mt-0.5 shrink-0" strokeWidth={2} />
                                  )}
                                  <span className={`text-[12px] ${feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{feature.text}</span>
                                </div>
                              ))}
                              
                              {plan.note && (
                                <div className="mt-3 p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-[10px] text-[12px] text-brand-navy leading-relaxed">
                                  {plan.note}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {/* Digital: Changelog */}
                {isDigital ? (
                  <>
                    {/* Changelog Accordion */}
                    {/* Changelog Accordion */}
                    {changelogEntries.length > 0 && (
                      <div className="border border-brand-navy/[0.08]  rounded-[20px] overflow-hidden mt-3 bg-white/40 backdrop-blur-md border-white/20 shadow-sm ">
                        <button onClick={() => setChangelogOpen(o => !o)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  text-[14px] font-sans font-medium text-brand-navy  border-b border-transparent hover:border-brand-navy/[0.08]  transition-colors">
                          <span>Version History</span>
                          <ChevronRight size={16} className={`transition-transform text-slate-400 ${changelogOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {changelogOpen && (
                          <div className="divide-y divide-slate-100 ">
                            {changelogEntries.map((entry, i) => (
                              <div key={i} className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[12px] font-mono font-medium text-brand-blue">v{entry.version}</span>
                                  {entry.date && <span className="text-[11px] font-mono text-slate-400">{new Date(entry.date).toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' })}</span>}
                                </div>
                                <p className="text-[13px] font-sans text-slate-600 ">{entry.notes}</p>
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
                      <Link href="/warranty" className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm hover:bg-slate-100   rounded-[20px] p-4 flex items-center justify-center gap-4 text-brand-navy  transition-colors group border border-brand-navy/[0.08]  mt-3">
                        <div className="shrink-0"><ShieldCheck size={24} strokeWidth={1.5} className="text-brand-blue" /></div>
                        <div className="flex flex-col">
                          <span className="font-sans font-medium text-[15px] leading-tight capitalize">{product.warranty_info}</span>
                          <span className="text-[12px] font-mono uppercase tracking-widest text-brand-blue opacity-80 mt-1 group-hover:opacity-100 transition-opacity">View Policy →</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  rounded-[20px] p-4 flex items-center justify-center gap-4 text-slate-500  border border-brand-navy/[0.08]  mt-3">
                        <div className="shrink-0"><ShieldCheck size={24} strokeWidth={1.5} className="opacity-40" /></div>
                        <div className="flex flex-col">
                          <span className="font-sans font-medium text-[15px] leading-tight text-brand-navy ">No Warranty</span>
                          <span className="text-[13px] mt-0.5">Not applicable for this item</span>
                        </div>
                      </div>
                    )}
                    {/* Legacy Physical: Delivery */}
                    <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  rounded-[20px] p-4 border border-brand-navy/[0.08]  mt-3">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1"><Truck size={20} strokeWidth={1.5} className="text-brand-blue" /></div>
                        <div className="flex flex-col flex-1">
                          <span className="font-sans font-medium text-[14px] text-brand-navy  mb-1">Delivery Details</span>
                          <span className="text-[13px] text-slate-500  leading-snug mb-2">
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

              {/* Demo / Docs CTAs */}
              {(product.demoUrl || product.documentationUrl) && (
                <div className="flex gap-3 mt-4 mb-2">
                  {product.demoUrl && (
                    <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[20px] border border-brand-blue text-brand-blue text-[14px] font-sans font-medium hover:bg-brand-blue/5 transition-colors">
                      <Globe size={16} strokeWidth={1.5} /> Live Preview
                    </a>
                  )}
                  {product.documentationUrl && (
                    <a href={product.documentationUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[20px] border border-slate-400  text-slate-700  text-[14px] font-sans font-medium hover:bg-white/60 backdrop-blur-lg border-white/30 shadow-sm  transition-colors">
                      <BookOpen size={16} strokeWidth={1.5} /> Documentation
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 relative z-10 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    className={`flex-1 h-12 rounded-[20px] font-sans font-medium text-[15px] flex items-center justify-center transition-all ${addedToCart ? 'hover:bg-brand-teal/90' : 'hover:bg-brand-blue/5'}`}
                    style={{ 
                      backgroundColor: addedToCart ? '#0B7A68' : '#ffffff', 
                      color: addedToCart ? '#ffffff' : '#1D5FD1', 
                      borderColor: addedToCart ? '#0B7A68' : '#1D5FD1', 
                      borderWidth: '1px', 
                      borderStyle: 'solid' 
                    }}
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
                  </button>
                  <button 
                    className="flex-1 h-12 rounded-[20px] font-sans font-medium text-[15px] flex items-center justify-center transition-all shadow-md hover:bg-brand-blue/90"
                    style={{ 
                      backgroundColor: '#1D5FD1', 
                      color: '#ffffff', 
                      borderColor: '#1D5FD1',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    onClick={handleBuyNow}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <AppleSpinner size={18} className="text-white" />
                    ) : (
                      <><ShoppingBag size={18} strokeWidth={1.5} className="mr-2" /> {isDigital ? 'Get License' : 'Buy Now'}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
            
          {/* Specifications (Conditional) */}
            {specs.length > 0 && (
              <div className="mt-8 mb-8">
                <h2 className="text-[24px] font-display font-medium text-brand-navy  mb-8 border-b border-brand-navy/[0.08]  pb-4">Product Information</h2>
                <ul className="flex flex-col">
                  {specs.map((s, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row border-b border-slate-100  py-5">
                      <div className="w-full sm:w-[30%] mb-2 sm:mb-0 pr-4 shrink-0 flex items-center">
                        <span className="text-[13px] font-mono text-slate-500  uppercase tracking-wide">
                          {s.key}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-[14px] font-sans text-brand-navy  leading-relaxed">
                          {s.value}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

      {/* Screenshot Gallery — Digital Products Only */}

      {/* Screenshot Gallery — Digital Products Only */}
      {isDigital && screenshotGallery.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h2 className="text-[24px] font-display font-medium text-brand-navy mb-6 border-b border-brand-navy/[0.08] pb-4">Screenshots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshotGallery.map((img, idx) => (
              <div key={idx} className="aspect-video rounded-[20px] overflow-hidden border border-brand-navy/[0.08] cursor-pointer hover:opacity-90 transition-opacity relative group"
                onClick={() => { setActiveImage(img); setIsLightboxOpen(true); setLightboxZoom(1); }}>
                <img src={getOptimizedUrl(img)} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/10 transition-colors flex items-center justify-center">
                   <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description (Conditional) */}
      {product.description && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
          <div className="w-full">
            <h2 className="text-[24px] font-display font-medium text-brand-navy mb-6 border-b border-brand-navy/[0.08] pb-4 pt-8">Description</h2>
            <div className="whitespace-pre-line prose prose-blue max-w-none text-brand-navy text-[15px] font-sans leading-relaxed">
              {product.description}
            </div>
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-xl border-white/30 shadow-sm/95 animate-in fade-in duration-300"
             onWheel={(e) => {
               e.stopPropagation();
               if (e.deltaY < 0) {
                 setLightboxZoom(z => Math.min(z + 0.25, 5));
               } else {
                 setLightboxZoom(z => Math.max(z - 0.25, 0.5));
               }
             }}>
          <div className="absolute top-16 right-6 flex flex-col gap-3 z-50">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); setLightboxZoom(1); setLightboxPan({x:0, y:0}); }}
              className="p-3 bg-white/40 backdrop-blur-md border-white/20 shadow-sm border border-brand-navy/[0.08] hover:border-brand-blue rounded-[20px] text-brand-navy transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(z => Math.min(z + 0.5, 5)); }}
              className="p-3 bg-white/40 backdrop-blur-md border-white/20 shadow-sm border border-brand-navy/[0.08] hover:border-brand-blue rounded-[20px] text-brand-navy transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxZoom(z => Math.max(z - 0.5, 0.5)); }}
              className="p-3 bg-white/40 backdrop-blur-md border-white/20 shadow-sm border border-brand-navy/[0.08] hover:border-brand-blue rounded-[20px] text-brand-navy transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={24} />
            </button>
            {lightboxZoom !== 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setLightboxZoom(1); setLightboxPan({x:0, y:0}); }}
                className="p-3 bg-white/40 backdrop-blur-md border-white/20 shadow-sm border border-brand-navy/[0.08] hover:border-brand-blue rounded-[20px] text-[12px] font-mono font-medium text-brand-navy transition-colors flex items-center justify-center"
                title="Reset Zoom"
              >
                100%
              </button>
            )}
          </div>

          
          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = images.indexOf(activeImage);
                const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
                setActiveImage(images[prevIndex]);
                setLightboxZoom(1);
                setLightboxPan({x:0, y:0});
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/40 backdrop-blur-md border-white/20 shadow-sm  border border-brand-navy/[0.08]  hover:border-brand-blue  rounded-[20px] text-brand-navy  transition-colors z-50"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div 
            className={`w-full h-full p-4 sm:p-12 flex items-center justify-center overflow-hidden ${lightboxZoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onClick={(e) => { 
              if (hasDragged) {
                setHasDragged(false);
                return;
              }
              setIsLightboxOpen(false); 
              setLightboxZoom(1); 
              setLightboxPan({x:0, y:0}); 
            }}
            onMouseDown={(e) => {
              if (lightboxZoom > 1) {
                e.stopPropagation();
                setIsDragging(true);
                setHasDragged(false);
                e.currentTarget.dataset.startX = e.clientX - lightboxPan.x;
                e.currentTarget.dataset.startY = e.clientY - lightboxPan.y;
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && lightboxZoom > 1) {
                e.stopPropagation();
                setHasDragged(true);
                const startX = parseFloat(e.currentTarget.dataset.startX);
                const startY = parseFloat(e.currentTarget.dataset.startY);
                setLightboxPan({ x: e.clientX - startX, y: e.clientY - startY });
              }
            }}
            onMouseUp={(e) => {
              if (isDragging) {
                e.stopPropagation();
                setIsDragging(false);
                // We don't reset hasDragged here so onClick can catch it
              }
            }}
            onMouseLeave={(e) => {
              if (isDragging) {
                e.stopPropagation();
                setIsDragging(false);
              }
            }}
          >
            <img 
              src={getOptimizedUrl(activeImage)} 
              alt="Zoomed Product" 
              draggable={false}
              className={`max-w-full max-h-full object-contain drop-shadow-sm animate-in zoom-in-95 ${isDragging ? 'duration-0 transition-none' : 'duration-300 transition-transform'} origin-center pointer-events-none`}
              style={{ transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${lightboxZoom})` }}
            />
          </div>

          {(isDigital && screenshotGallery.length > 0 ? screenshotGallery : images).length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const galleryToUse = isDigital && screenshotGallery.length > 0 ? screenshotGallery : images;
                const currentIndex = galleryToUse.indexOf(activeImage);
                const nextIndex = currentIndex === galleryToUse.length - 1 || currentIndex === -1 ? 0 : currentIndex + 1;
                setActiveImage(galleryToUse[nextIndex]);
                setLightboxZoom(1);
                setLightboxPan({x:0, y:0});
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/40 backdrop-blur-md border-white/20 shadow-sm  border border-brand-navy/[0.08]  hover:border-brand-blue  rounded-[20px] text-brand-navy  transition-colors z-50"
            >
              <ChevronRight size={32} />
            </button>
          )}
          
          {/* Thumbnails in Lightbox */}
          {(isDigital && screenshotGallery.length > 0 ? screenshotGallery : images).length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-4 bg-white/60 backdrop-blur-lg border-white/30 shadow-sm/80  border border-brand-navy/[0.08]  backdrop-blur-md rounded-[20px]">
              {(isDigital && screenshotGallery.length > 0 ? screenshotGallery : images).map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-[20px] overflow-hidden border transition-all ${activeImage === img ? 'border-brand-blue scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100 hover:border-brand-navy/[0.08] '}`}
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
