"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Box, 
  Code2, 
  Briefcase, 
  Layers, 
  Headset, 
  UserCircle,
  Cloud, TerminalSquare, Component, Code, Smartphone, Shirt, Monitor, ShoppingBag, Dumbbell, Book, Car, Coffee, Heart, Gamepad, Camera, Gift
} from "lucide-react";

export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Box;
  const name = categoryName.toLowerCase();
  
  if (name.includes('saas') || name.includes('cloud') || name.includes('app')) return Cloud;
  if (name.includes('script') || name.includes('automation') || name.includes('bot')) return TerminalSquare;
  if (name.includes('ui kit') || name.includes('plugin') || name.includes('template')) return Component;
  if (name.includes('code') || name.includes('source')) return Code;

  if (name.includes('charger') || name.includes('adapter')) return '/icons/categories/charger.png';
  if (name.includes('power') && name.includes('bank')) return '/icons/categories/power-bank.png';
  if (name.includes('cable') || name.includes('usb')) return '/icons/categories/usb-cable.png';
  if (name.includes('watch')) return '/icons/categories/smart-watch.png';
  if (name.includes('smart') || name.includes('bluetooth') || name.includes('speaker')) return '/icons/categories/smart.png';
  if (name.includes('neckband')) return '/icons/categories/neckband.png';
  if (name.includes('music') || name.includes('audio') || name.includes('headphone') || name.includes('earphone') || name.includes('earbud') || name.includes('tws')) return '/icons/categories/music.png';

  if (name.includes('phone') || name.includes('mobile')) return Smartphone;
  if (name.includes('fashion') || name.includes('cloth') || name.includes('shirt') || name.includes('apparel') || name.includes("men's") || name.includes("women's")) return Shirt;
  if (name.includes('home') || name.includes('furniture') || name.includes('decor')) return Home;
  if (name.includes('electronic') || name.includes('computer') || name.includes('pc') || name.includes('laptop')) return Monitor;
  if (name.includes('bag') || name.includes('luggage')) return ShoppingBag;
  if (name.includes('sport') || name.includes('fitness') || name.includes('outdoor')) return Dumbbell;
  if (name.includes('book') || name.includes('stationery')) return Book;
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car;
  if (name.includes('food') || name.includes('grocery') || name.includes('drink') || name.includes('kitchen')) return Coffee;
  if (name.includes('health') || name.includes('beauty') || name.includes('care') || name.includes('makeup')) return Heart;
  if (name.includes('game') || name.includes('toy')) return Gamepad;
  if (name.includes('camera') || name.includes('photo')) return Camera;
  if (name.includes('gift') || name.includes('party')) return Gift;
  return Box;
};

export default function Sidebar({ isHovered = false, isCollapsed = false }) {
  const pathname = usePathname();

  const mainNav = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/shop?type=product", icon: Box },
    { label: "Software", href: "/shop?type=software", icon: Code2 },
    { label: "Services", href: "/shop?type=service", icon: Briefcase },
    { label: "Solutions", href: "/solutions", icon: Layers },
  ];

  const bottomNav = [
    { label: "Support", href: "/support", icon: Headset },
    { label: "Account", href: "/settings/profile", icon: UserCircle },
  ];

  const SidebarItem = ({ icon: Icon, label, href }) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]);
    
    return (
      <Link
        href={href}
        className={`group/item relative flex items-center px-[12px] py-[10px] mb-1 rounded-[4px] transition-all duration-200 ${
          active
            ? "bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-brand-cyan"
            : "text-brand-slate dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
        }`}
      >
        <div className="relative z-10 flex items-center w-full justify-start gap-4">
          <div className="flex items-center justify-center shrink-0 w-[24px]">
            <Icon
              className={`w-[20px] h-[20px] transition-all duration-300 ${
                active ? "stroke-[2.5px]" : "stroke-[2px] opacity-80"
              }`}
            />
          </div>
          <span className={`text-[14px] font-sans tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100 max-w-[200px] lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-[200px] ${active ? 'font-semibold' : 'font-medium'}`}>
            {label}
          </span>
        </div>
        
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-brand-blue rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <aside className="h-full flex flex-col py-6 relative w-full">
      {/* Top Logo */}
      <div className="px-4 mb-8 flex items-center gap-4 h-[32px] cursor-pointer">
         <div className="w-[32px] h-[32px] bg-brand-navy rounded-[6px] flex items-center justify-center shrink-0 shadow-sm border border-brand-navy/10">
            <span className="text-white font-display font-bold text-[18px] leading-none tracking-tighter">C</span>
         </div>
         <span className={`font-display font-semibold text-[18px] text-brand-navy dark:text-white tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100 max-w-[200px] lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-[200px]`}>
           Codalina
         </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 mt-auto pt-4 border-t border-slate-200 dark:border-white/10 space-y-1">
        {bottomNav.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </div>
    </aside>
  );
}
