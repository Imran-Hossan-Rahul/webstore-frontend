"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/States';

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
    return (
      <PageContainer maxWidth="max-w-[1000px]" className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading cart..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="max-w-[1000px]">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart size={24} className="text-brand-navy dark:text-white" />
        <h1 className="text-[24px] font-display font-medium text-brand-navy dark:text-white">
          Shopping Cart
        </h1>
      </div>
      
      {cartItems.length === 0 ? (
        <EmptyState 
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          action={{
            label: "Continue Shopping",
            onClick: () => router.push('/')
          }}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <Card className="bg-brand-surface dark:bg-brand-surface shadow-sm dark:shadow-none overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-brand-navy/[0.08] dark:border-white/10 px-6 py-3 hidden md:flex items-center text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-brand-cloud dark:bg-brand-surface">
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
                  <div key={item.id} className="relative flex flex-col md:flex-row md:items-center py-5 md:py-4 border-b border-brand-navy/[0.08] dark:border-white/10 px-4 md:px-6 hover:bg-slate-50 dark:bg-brand-surface dark:hover:bg-brand-surface/5 transition-colors last:border-b-0">
                    <div className="hidden md:block w-[5%] text-sm text-slate-500 dark:text-slate-400 font-medium">{index + 1}</div>
                    
                    {/* Image and Details Container */}
                    <div className="w-full md:w-[60%] flex items-start md:items-center gap-4 pr-10 md:pr-0">
                      <div className="w-[85px] h-[85px] md:w-16 md:h-16 rounded-[4px] overflow-hidden shrink-0 border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface p-1">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.title} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        ) : (
                          <div className="w-full h-full bg-brand-cloud dark:bg-brand-surface flex items-center justify-center text-[11px] font-mono text-slate-400">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 pt-1 md:pt-0">
                        <Link href={`/product/${item.id}`}>
                          <h3 className="text-[15px] font-sans font-medium text-brand-navy dark:text-white hover:text-brand-blue transition-colors line-clamp-2 leading-snug">{item.title}</h3>
                        </Link>
                        {item.selectedVariants && (
                          <p className="text-[13px] font-sans text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {item.selectedVariants}
                          </p>
                        )}
                        {(item.category || item.shop_name) && (
                          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 tracking-widest uppercase">
                            {[item.category, item.shop_name].filter(Boolean).join(' • ')}
                          </p>
                        )}

                        {/* Mobile: Price Inline below details */}
                        <div className="md:hidden mt-3.5 flex items-center justify-between w-full">
                          <span className="text-[15px] font-mono font-medium text-brand-navy dark:text-white">{formatPrice(item.selling_price)} BDT</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Columns (Hidden on Mobile) */}
                    <div className="hidden md:flex w-[30%] justify-end items-center">
                      <span className="text-[14px] font-mono font-medium text-brand-navy dark:text-white">{formatPrice(item.selling_price)} BDT</span>
                    </div>
                    
                    {/* Delete Button */}
                    <div className="absolute top-5 right-4 md:relative md:top-0 md:w-[5%] flex justify-end">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[4px] active:scale-[0.98]"
                        title="Remove Item"
                      >
                        <Trash2 size={18} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-end">
            {/* Order Summary */}
            <Card className="w-full lg:w-5/12 bg-brand-cloud dark:bg-brand-surface">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-sans text-slate-500 dark:text-slate-400">Sub-Total:</span>
                    <span className="text-[14px] font-mono font-medium text-brand-navy dark:text-white">{formatPrice(subTotal)} BDT</span>
                  </div>
                  
                  <div className="border-t border-brand-navy/[0.08] dark:border-white/10 my-2"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-sans font-medium text-brand-navy dark:text-white">Total</span>
                    <span className="text-[18px] font-mono font-bold text-brand-navy dark:text-white">{formatPrice(total)} BDT</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="w-full sm:w-auto"
                    >
                      Continue Shopping
                    </Button>
                    <Button 
                      onClick={handleCheckout}
                      className="w-full sm:w-auto"
                    >
                      Check Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
