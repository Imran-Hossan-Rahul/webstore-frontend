"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import AppleSpinner from '@/components/ui/AppleSpinner';
import { EmptyState, LoadingState } from '@/components/ui/States';

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState(null);

  useEffect(() => {
    setNavigatingId(null);
  }, [pathname, searchParams]);

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) {
          const cartIds = JSON.parse(cartStr);
          if (cartIds.length > 0) {
            // Enforce single-item digital cart constraint
            const singleCartId = [cartIds[cartIds.length - 1]]; // Keep the most recently added item
            if (cartIds.length > 1) {
              localStorage.setItem('cartIds', JSON.stringify(singleCartId));
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
            
            const res = await api.get(`/market/products?ids=${singleCartId[0]}`);
            const filteredProducts = res.data || [];
            
            const detailsStr = localStorage.getItem('cartDetails');
            const cartDetails = detailsStr ? JSON.parse(detailsStr) : {};

            // Map to cart item structure with fixed quantity 1
            const itemsWithQuantity = filteredProducts.map(p => {
              const details = cartDetails[p.id.toString()] || {};
              return {
                ...p,
                cartQuantity: 1,
                selectedVariants: details.variants || '',
                selling_price: details.finalPrice || p.selling_price
              };
            });
            
            setCartItems(itemsWithQuantity);
          }
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCartProducts();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const getOptimizedUrl = (url) => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_auto,q_auto,w_200/${parts[1]}`;
      }
    }
    return url;
  };



  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    try {
      const cartStr = localStorage.getItem('cartIds');
      if (cartStr) {
        let cartIds = JSON.parse(cartStr);
        cartIds = cartIds.filter(id => id !== productId.toString());
        localStorage.setItem('cartIds', JSON.stringify(cartIds));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch(e) {}
  };

  const subTotal = cartItems.reduce((sum, item) => sum + (item.selling_price * item.cartQuantity), 0);
  const total = subTotal;

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setNavigatingId('checkout');
      const item = cartItems[0];
      const query = new URLSearchParams({
        productId: item.id,
        quantity: item.cartQuantity,
        finalPrice: item.selling_price,
        originalPrice: item.original_price || item.selling_price,
        variantSummary: item.selectedVariants || ''
      }).toString();
      router.push(`/checkout?${query}`);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="max-w-[1000px]" className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading cart..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="max-w-[1000px]">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart size={24} className="text-brand-navy " />
        <h1 className="text-[24px] font-display font-medium text-brand-navy ">
          Shopping Cart
        </h1>
      </div>
      
      {cartItems.length === 0 ? (
        <EmptyState 
          variant="glass"
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          action={{
            label: navigatingId === 'explore' ? <AppleSpinner size={16} className="text-white" /> : "Continue Shopping",
            onClick: () => { setNavigatingId('explore'); router.push('/store'); }
          }}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm border border-brand-navy/[0.08] rounded-[20px] overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-brand-navy/[0.08]  px-6 py-3 hidden md:flex items-center text-[11px] font-mono font-medium text-slate-500  uppercase tracking-widest bg-transparent ">
              <div className="w-[5%]">#</div>
              <div className="w-[60%]">Product Name</div>
              <div className="w-[30%] text-right">Price</div>
              <div className="w-[5%] text-right"></div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {cartItems.map((item, index) => {
                let photos = [];
                try {
                  photos = JSON.parse(item.photos);
                } catch(e) {}
                const imageUrl = photos[0] ? getOptimizedUrl(photos[0]) : '';
                
                return (
                  <div key={item.id} className="relative flex flex-col md:flex-row md:items-center py-5 md:py-4 border-b border-brand-navy/[0.08]  px-4 md:px-6 hover:bg-slate-50  :bg-brand-surface/5 transition-colors last:border-b-0">
                    <div className="hidden md:block w-[5%] text-sm text-slate-500  font-medium">{index + 1}</div>
                    
                    {/* Image and Details Container */}
                    <div className="w-full md:w-[60%] flex items-start md:items-center gap-4 pr-10 md:pr-0">
                      <div className="w-[85px] h-[85px] md:w-16 md:h-16 rounded-[12px] overflow-hidden shrink-0 border border-brand-navy/[0.08]  bg-white/40 p-1">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.title} className="w-full h-full object-contain mix-blend-multiply " />
                        ) : (
                          <div className="w-full h-full bg-transparent flex items-center justify-center text-[11px] font-mono text-slate-400">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 pt-1 md:pt-0">
                        <Link href={`/product/${item.id}`}>
                          <h3 className="text-[15px] font-sans font-medium text-brand-navy  hover:text-brand-blue transition-colors line-clamp-2 leading-snug">{item.title}</h3>
                        </Link>
                        {item.selectedVariants && (
                          <p className="text-[13px] font-sans text-slate-500  mt-1 line-clamp-1">
                            {item.selectedVariants}
                          </p>
                        )}
                        {(item.category || item.shop_name) && (
                          <p className="text-[11px] font-mono text-slate-400 mt-1 line-clamp-1 tracking-widest uppercase">
                            {[item.category, item.shop_name].filter(Boolean).join(' • ')}
                          </p>
                        )}

                        {/* Mobile: Price Inline below details */}
                        <div className="md:hidden mt-3.5 flex items-center justify-between w-full">
                          <span className="text-[15px] font-mono font-medium text-brand-navy ">{formatPrice(item.selling_price)} BDT</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Columns (Hidden on Mobile) */}
                    <div className="hidden md:flex w-[30%] justify-end items-center">
                      <span className="text-[14px] font-mono font-medium text-brand-navy ">{formatPrice(item.selling_price)} BDT</span>
                    </div>
                    
                    {/* Delete Button */}
                    <div className="absolute top-5 right-4 md:relative md:top-0 md:w-[5%] flex justify-end">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-transparent hover:bg-red-50 rounded-[12px] active:scale-[0.98]"
                        title="Remove Item"
                      >
                        <Trash2 size={18} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-end">
            {/* Order Summary */}
            <div className="w-full lg:w-5/12 bg-white/60 backdrop-blur-lg border-white/30 shadow-sm border border-brand-navy/[0.08] rounded-[20px]">
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-sans text-slate-500 ">Sub-Total:</span>
                    <span className="text-[14px] font-mono font-medium text-brand-navy ">{formatPrice(subTotal)} BDT</span>
                  </div>
                  
                  <div className="border-t border-brand-navy/[0.08]  my-2"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-sans font-medium text-brand-navy ">Total</span>
                    <span className="text-[18px] font-mono font-bold text-brand-navy ">{formatPrice(total)} BDT</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                    <button 
                      onClick={() => { setNavigatingId('continue'); router.push('/store'); }}
                      style={{ pointerEvents: navigatingId === 'continue' ? 'none' : 'auto' }}
                      className="w-full sm:w-auto h-12 px-6 rounded-[20px] font-sans font-medium text-[15px] flex items-center justify-center transition-all bg-white text-[#1D5FD1] border border-[#1D5FD1] hover:bg-brand-blue/5"
                    >
                      {navigatingId === 'continue' ? <AppleSpinner size={16} className="text-brand-blue" /> : 'Continue Shopping'}
                    </button>
                    <button 
                      onClick={handleCheckout}
                      style={{ pointerEvents: navigatingId === 'checkout' ? 'none' : 'auto' }}
                      className="w-full sm:w-auto h-12 px-6 rounded-[20px] font-sans font-medium text-[15px] flex items-center justify-center transition-all shadow-md bg-[#1D5FD1] text-white border border-[#1D5FD1] hover:bg-brand-blue/90"
                    >
                      {navigatingId === 'checkout' ? <AppleSpinner size={16} className="text-white" /> : 'Check Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
