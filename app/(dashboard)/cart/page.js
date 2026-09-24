"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // In a real flow, you'd pass all cart items or store them in state.
      // For now, we'll just go to checkout with the first item's ID or general checkout.
      // Since checkout page expects single productId in query right now, we can adapt it later.
      // But let's just go to checkout for the first item for now to match flow.
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
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="w-full pt-4 md:-mt-4 md:pb-2 px-2 md:px-3">
        <h1 className="text-xl md:text-2xl font-semibold text-apple-ink mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
          <ShoppingCart size={24} className="text-[#111827] md:w-7 md:h-7" /> Shopping Cart
        </h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-apple-parchment rounded-apple-lg">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-6">Your cart is currently empty.</p>
            <Link href="/" className="bg-[#111] text-white px-6 py-3 rounded hover:bg-black transition text-sm font-semibold">
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div className="w-full">
            {/* Table Header */}
            <div className="border-b border-apple-ink px-6 py-[10px] hidden md:flex items-center text-[11px] font-semibold text-apple-muted uppercase tracking-[0.04em]">
              <div className="w-[5%]">#</div>
              <div className="w-[60%]">Product Name</div>
              <div className="w-[30%] text-right">Price</div>
              <div className="w-[5%] text-right"></div>
            </div>

            {/* Table Body */}
            <div className="mt-4 flex flex-col gap-4">
              {cartItems.map((item, index) => {
                let photos = [];
                try {
                  photos = JSON.parse(item.photos);
                } catch(e) {}
                const imageUrl = photos[0] ? getOptimizedUrl(photos[0]) : '';
                
                return (
                  <div key={item.id} className="relative flex flex-col md:flex-row md:items-center py-5 md:py-[12px] border-b border-apple-hairline/60 px-1 md:px-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors rounded-xl md:rounded-none">
                    <div className="hidden md:block w-[5%] text-sm text-gray-500 font-medium">{index + 1}</div>
                    
                    {/* Image and Details Container */}
                    <div className="w-full md:w-[60%] flex items-start md:items-center gap-4 pr-10 md:pr-0">
                      <div className="w-[85px] h-[85px] md:w-16 md:h-16 rounded-[10px] md:rounded-[8px] overflow-hidden shrink-0 border border-black/5 dark:border-white/10 bg-white shadow-sm">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 pt-1 md:pt-0">
                        <Link href={`/product/${item.id}`}>
                          <h3 className="text-[16px] md:text-[17px] font-semibold text-apple-ink hover:underline transition line-clamp-2 leading-snug tracking-tight">{item.title}</h3>
                        </Link>
                        {item.selectedVariants && (
                          <p className="text-[13px] md:text-[14px] font-normal text-[#86868b] mt-1 line-clamp-1">
                            {item.selectedVariants}
                          </p>
                        )}
                        {(item.category || item.shop_name) && (
                          <p className="text-[11px] text-[#86868b]/70 mt-0.5 line-clamp-1 tracking-wide uppercase">
                            {[item.category, item.shop_name].filter(Boolean).join(' • ')}
                          </p>
                        )}

                        {/* Mobile: Price Inline below details */}
                        <div className="md:hidden mt-3.5 flex items-center justify-between w-full">
                          <span className="text-[16px] font-semibold text-apple-ink tracking-tight">{formatPrice(item.selling_price)} BDT</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Columns (Hidden on Mobile) */}
                    <div className="hidden md:flex w-[30%] justify-end items-center">
                      <span className="text-[17px] font-semibold text-apple-ink tracking-tight">{formatPrice(item.selling_price)} BDT</span>
                    </div>
                    
                    {/* Delete Button - Floating on Mobile, inline on Desktop */}
                    <div className="absolute top-5 right-1 md:relative md:top-0 md:w-[5%] flex justify-end">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[#86868b] hover:text-red-500 transition-colors p-2 md:p-2.5 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full active:scale-90"
                        title="Remove Item"
                      >
                        <Trash2 size={18} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Section */}
            <div className="mt-12 flex flex-col lg:flex-row justify-end gap-12">

              {/* Order Summary */}
              <div className="w-full lg:w-5/12">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-normal text-apple-muted">Sub-Total:</span>
                    <span className="text-[17px] font-semibold text-apple-ink">{formatPrice(subTotal)} BDT</span>
                  </div>
                  
                  <div className="border-t border-dotted border-gray-300 my-2"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-apple-ink">Total</span>
                    <span className="text-[24px] font-semibold text-apple-ink">{formatPrice(total)} BDT</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                    <Link href="/" className="w-full sm:w-auto text-center bg-apple-parchment hover:bg-gray-200 text-apple-ink px-[22px] py-[11px] rounded-apple-pill text-[17px] font-sans font-normal transition-opacity hover:opacity-80">
                      Continue Shopping
                    </Link>
                    <button 
                      onClick={handleCheckout}
                      className="w-full sm:w-auto bg-apple-accent hover:bg-apple-accent/90 text-white px-[22px] py-[11px] rounded-apple-pill text-[17px] font-sans font-normal transition-opacity hover:opacity-80"
                    >
                      Check Out
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
