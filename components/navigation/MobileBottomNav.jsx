"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Home, Terminal, Layout, FileText, Store, ShoppingCart, Package, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view');
  const { t } = useLanguage();
  const { user } = useUser();

  const [activeIndex, setActiveIndex] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const containerRef = useRef(null);

  // Initialize with a static width to prevent hydration mismatch
  const [width, setWidth] = useState(400);

  const navItems = [
    { icon: Store, label: "Market", href: "/shop" },
    { icon: ShoppingCart, label: "Cart", href: "/cart", hasBadge: true },
    { icon: Package, label: "Orders", href: user ? `/u/${user.username}?tab=orders` : "/auth/login" },
  ];

  // Cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cartStr = localStorage.getItem('cartIds');
        setCartCount(cartStr ? JSON.parse(cartStr).length : 0);
      } catch { setCartCount(0); }
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', (e) => { if (e.key === 'cartIds') updateCartCount(); });
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Active index tracking
  useEffect(() => {
    const index = navItems.findIndex((item) => {
      if (item.href === "/shop") return pathname?.startsWith("/shop") || pathname?.startsWith("/market");
      if (item.href === "/cart") return pathname?.startsWith("/cart");
      if (item.label === "Orders") return pathname?.includes("tab=orders");
      return false;
    });
    if (index !== -1) setActiveIndex(index);
    else setActiveIndex(-1);
  }, [pathname, view, user]);

  // Track container width
  useEffect(() => {
    if (!containerRef.current) return;
    setWidth(containerRef.current.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Spring for smooth physics
  const springX = useSpring(0, { stiffness: 400, damping: 30, mass: 0.8 });

  useEffect(() => {
    if (activeIndex !== -1 && width > 0) {
      springX.set((width / navItems.length) * activeIndex + (width / (navItems.length * 2)));
    }
  }, [activeIndex, width, springX, navItems.length]);

  // The perfectly smooth SVG notch path
  const clipPathD = useTransform(springX, (x) => {
    const safeWidth = width || 400;
    if (activeIndex === -1) {
      return `M 0,0 L ${safeWidth},0 L ${safeWidth},200 L 0,200 Z`;
    }
    return `M 0,0 
            L ${x - 46},0 
            C ${x - 24},0 ${x - 34},34 ${x},34 
            C ${x + 34},34 ${x + 24},0 ${x + 46},0 
            L ${safeWidth},0 
            L ${safeWidth},200 
            L 0,200 Z`;
  });

  // Floating circle position
  const circleLeft = useTransform(springX, (x) => x - 28);

  return (
    <>

      {/* Bottom Nav Bar */}
      <div
        ref={containerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-safe transform-gpu"
      >
        {/* Hidden SVG for clip path */}
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <clipPath id="smooth-notch" clipPathUnits="userSpaceOnUse">
              <motion.path d={clipPathD} />
            </clipPath>
          </defs>
        </svg>

        {/* Background */}
        <div
          className="absolute inset-0 bg-white/40 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border-t border-white/60 dark:border-white/10 transform-gpu"
          style={{ clipPath: 'url(#smooth-notch)', WebkitClipPath: 'url(#smooth-notch)' }}
        />

        {/* Floating Active Circle */}
        {activeIndex !== -1 && (
          <motion.div
            className="absolute -top-7 w-[56px] h-[56px] bg-slate-900 dark:bg-slate-100 rounded-full shadow-lg pointer-events-none z-20 transform-gpu"
            style={{ x: circleLeft }}
          />
        )}

        {/* Nav Items */}
        <div className="relative flex items-center justify-between h-[62px] w-full z-30 transform-gpu">
          {navItems.map((item, idx) => {
            const isActive = activeIndex === idx;
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                href={item.href}
                className="relative flex-1 flex flex-col items-center justify-center h-full outline-none group"
              >
                <motion.div
                  initial={false}
                  animate={{ y: isActive ? -31 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  className={`relative flex items-center justify-center transition-colors duration-300 ${
                    isActive
                      ? "text-white dark:text-slate-900"
                      : "text-black dark:text-white"
                  }`}
                >
                  <div className="relative">
                    <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                    {item.hasBadge && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </motion.div>

                <span
                  className={`absolute bottom-1.5 text-[10px] font-semibold transition-colors duration-300 text-black dark:text-white`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
