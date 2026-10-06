"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Home, 
  Box, 
  Code2, 
  Briefcase, 
  Layers, 
  Headset, 
  UserCircle,
  Cloud, TerminalSquare, Component, Code, Smartphone, Shirt, Monitor, ShoppingBag, ShoppingCart, Dumbbell, Book, Car, Coffee, Heart, Gamepad, Camera, Gift
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import { useRouter } from 'next/navigation';

const getCategoryIcon = (categoryName) => {
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
  const searchParams = useSearchParams();
  const { user, isGuest, loading } = useUser();
  const router = useRouter();
  
  const currentCategoryName = searchParams ? searchParams.get('category_name') : null;
  const currentType = searchParams ? searchParams.get('type') : null;

  const mainNav = [
    { label: "Store", href: "/store", icon: ShoppingBag, isStoreRoot: true },
    { label: "Custom Web Platforms", href: "/store?category_name=Custom+Web+Platforms", icon: Monitor, categoryName: "Custom Web Platforms" },
    { label: "SaaS & Web Apps", href: "/store?category_name=SaaS+%26+Web+Applications", icon: Cloud, categoryName: "SaaS & Web Applications" },
    { label: "Enterprise E-Commerce", href: "/store?category_name=Enterprise+E-Commerce", icon: ShoppingCart, categoryName: "Enterprise E-Commerce" },
    { label: "Internal Tools & APIs", href: "/store?category_name=Internal+Tools+%26+APIs", icon: Code, categoryName: "Internal Tools & APIs" },
    { label: "Proactive Maintenance", href: "/store?category_name=Proactive+Maintenance", icon: Heart, categoryName: "Proactive Maintenance" },
  ];

  const SidebarItem = ({ icon: Icon, label, href, isStoreRoot, categoryName }) => {
    let active = false;
    
    if (href === '/') {
      active = pathname === '/';
    } else if (categoryName) {
      active = currentCategoryName === categoryName;
    } else if (isStoreRoot) {
      active = pathname === href && !currentType && !currentCategoryName;
    } else {
      active = pathname.startsWith(href);
    }
    
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={`group/item relative flex items-center px-[12px] py-[10px] mb-1.5 rounded-[10px] transition-all duration-200 border ${
          active
            ? "border-[#0071e3]/50 shadow-sm text-[#0071e3] bg-white/20"
            : "border-transparent text-slate-700 hover:bg-black/5"
        }`}
      >
        <div className="relative z-10 flex items-center w-full justify-start gap-4">
          <div className="flex items-center justify-center shrink-0 w-[24px]">
            <Icon
              className={`w-[20px] h-[20px] transition-all duration-300 ${
                active ? "stroke-[2.5px] text-[#0071e3]" : "stroke-[2px] opacity-80"
              }`}
            />
          </div>
          <span className={`text-[14px] font-sans tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100 max-w-[200px] lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-[200px] ${active ? 'font-semibold' : 'font-medium'}`}>
            {label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="h-full flex flex-col py-6 relative w-full">
      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 mt-auto pt-4 border-t border-brand-navy/[0.08] space-y-1">
        <SidebarItem label="Support" href="/support" icon={Headset} />
        
        {loading ? (
          <div className="flex items-center p-2 mt-2 gap-3 group/item">
             <div className="w-[20px] h-[20px] ml-[2px] rounded-full bg-black/5 animate-pulse shrink-0"></div>
             <div className="hidden lg:group-hover:block w-24 h-4 bg-black/5 rounded animate-pulse opacity-0 lg:group-hover:opacity-100 transition-opacity"></div>
          </div>
        ) : (!user || isGuest || user.role === 'guest') ? (
          <SidebarItem label="Account" href="/auth/login" icon={UserCircle} />
        ) : (
          <div 
            onClick={() => router.push(`/u/${user.username}`)} 
            className="group/item relative flex items-center px-[12px] py-[10px] mb-1.5 rounded-[10px] transition-all duration-200 border border-transparent text-slate-700 hover:bg-black/5 cursor-pointer mt-1"
          >
            <div className="relative z-10 flex items-center w-full justify-start gap-4">
              <div className="flex items-center justify-center shrink-0 w-[28px] -ml-[2px]">
                <div className="w-[32px] h-[32px] shrink-0 rounded-full bg-black/10 overflow-hidden border border-black/15 flex items-center justify-center shadow-sm">
                    {user?.profilePicture ? (
                      <img src={getOptimizedUrl(user.profilePicture)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black/50 font-bold text-[12px]">{user?.name?.[0]}</div>
                    )}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden transition-all duration-300 opacity-100 max-w-[200px] lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-[200px]">
                  <span className="text-[14px] font-medium font-sans text-slate-700 whitespace-nowrap leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap mt-0.5">
                    View Profile
                  </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

