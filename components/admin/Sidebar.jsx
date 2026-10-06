"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Briefcase, 
  ShieldCheck, 
  CreditCard, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Products & Assets', href: '/admin/products', icon: PackageSearch },
  { name: 'Collaboration Rooms', href: '/admin/orders', icon: Briefcase },
  { name: 'Security & Licenses', href: '/admin/security', icon: ShieldCheck },
  { name: 'Payments & Invoices', href: '/admin/payments', icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="relative hidden md:flex flex-col h-screen bg-[#040608] border-r border-white/10 shrink-0 z-50 overflow-hidden"
    >
      {/* Brand area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="text-brand-cyan w-6 h-6" />
            <span className="text-white font-display font-medium text-xl tracking-tight">
              Codalina<span className="text-white/40">HQ</span>
            </span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <Sparkles className="text-brand-cyan w-6 h-6" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          // Strict match for Overview to avoid highlighting on every route, startswith for others
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative
                ${isActive 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 top-[15%] bottom-[15%] w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                />
              )}
              
              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              {!isCollapsed && (
                <span className="font-medium text-[15px] whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer (Logout/Collapse) */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all w-full justify-center md:justify-start"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
          {!isCollapsed && <span className="font-medium text-[14px]">Collapse Sidebar</span>}
        </button>
        
        <button className="group flex items-center gap-3 px-3 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full">
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && <span className="font-medium text-[15px]">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
