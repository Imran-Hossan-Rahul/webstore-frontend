"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package } from "lucide-react";

export default function MobileMarketBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) {
          const cartIds = JSON.parse(cartStr);
          setCartCount(cartIds.length);
        } else {
          setCartCount(0);
        }
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    // Also listen to storage events for cross-tab updates if necessary
    window.addEventListener('storage', (e) => {
      if (e.key === 'cartIds') updateCartCount();
    });

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  if (!pathname?.startsWith('/market')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-3 py-2 pointer-events-none">
      <div className="flex gap-2 justify-start pointer-events-auto" style={{ marginRight: '150px' }}>
        <Link 
          href="/market/cart" 
          className="flex items-center justify-center gap-2 h-11 px-5 bg-slate-100 dark:bg-brand-surface hover:bg-slate-200 dark:bg-brand-surface/[0.1] dark:hover:bg-slate-700 rounded-xl transition-all text-brand-slate dark:text-slate-200 font-semibold"
        >
           <div className="relative">
             <ShoppingCart size={17} strokeWidth={2} />
             {cartCount > 0 && (
               <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-100 dark:ring-slate-800">
                 {cartCount}
               </span>
             )}
           </div>
           <span className="text-[13px]">Cart</span>
        </Link>

        <Link 
          href="/market/orders" 
          className="flex items-center justify-center gap-2 h-11 px-5 bg-slate-900 dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white hover:bg-black dark:hover:bg-slate-100 dark:bg-brand-surface/[0.05] rounded-xl transition-all font-semibold shadow-sm"
        >
           <Package size={17} strokeWidth={2} />
           <span className="text-[13px]">My Orders</span>
        </Link>
      </div>
    </div>
  );
}
