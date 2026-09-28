"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Users, Truck, ArrowLeft, ClipboardList, Tags, Star, TrendingUp } from "lucide-react";

export default function MarketAdminLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Banners', href: '/admin/market/banners', icon: ClipboardList },
    { name: 'Categories', href: '/admin/market/categories', icon: Tags },
    { name: 'Products', href: '/admin/market/products', icon: ShoppingBag },
    { name: 'Featured', href: '/admin/market/featured', icon: Star },
    { name: 'Popular', href: '/admin/market/popular', icon: TrendingUp },
    { name: 'Latest', href: '/admin/market/latest', icon: Star },
    { name: 'Promotions', href: '/admin/market/promotions', icon: Tags },
    { name: 'Wholesalers', href: '/admin/market/wholesaler', icon: Users },
    { name: 'Procurement', href: '/admin/market/procurement', icon: Truck },
    { name: 'Orders', href: '/admin/market/orders', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen ] text-white font-sans selection: bg-brand-main">
      {/* Header */}
      <header className="bg-brand-surface dark:bg-brand-surface border-b border-brand-navy/[0.08] dark:border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center shrink-0">
            <Link href="/admin" className="p-1.5 hover:bg-brand-cloud dark:bg-brand-surface rounded-[4px] text-slate-500 dark:text-slate-400 hover:text-white transition">
              <ArrowLeft size={18} />
            </Link>
          </div>
          
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-brand-blue/10 text-blue-400' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:bg-brand-cloud dark:bg-brand-surface'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
