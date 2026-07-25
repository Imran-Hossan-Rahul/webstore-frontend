"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Users, Truck, ArrowLeft, ClipboardList } from "lucide-react";

export default function MarketAdminLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Banners', href: '/admin/market/banners', icon: ClipboardList }, // Reuse icon for now
    { name: 'Products', href: '/admin/market/products', icon: ShoppingBag },
    { name: 'Wholesalers', href: '/admin/market/wholesaler', icon: Users },
    { name: 'Procurement', href: '/admin/market/procurement', icon: Truck },
    { name: 'Orders', href: '/admin/market/orders', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-600/30">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center shrink-0">
            <Link href="/admin" className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
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
