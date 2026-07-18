"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Home, Terminal, Layout, FileText, Store, ShoppingCart, Package, X } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view');
  const { t } = useLanguage();

  const [activeIndex, setActiveIndex] = useState(0);
  const [marketOpen, setMarketOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const containerRef = useRef(null);

  // Initialize with window width to avoid clipping on first render
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 400
  );

  const navItems = [
    { icon: Home, label: t("feed") || "Feed", href: "/" },
    { icon: Terminal, label: t("Devlogs") || "Devlogs", href: "/devlogs" },
    { icon: Layout, label: t("artifacts") || "Artifacts", href: "/artifacts" },
    { icon: FileText, label: t("codex") || "Codex", href: "/codex" },
    { icon: Store, label: "Market", href: "/market", isMarket: true },
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
      if (item.href === "/") return pathname === "/" && (!view || view === 'discover');
      return pathname?.startsWith(item.href);
    });
    if (index !== -1) setActiveIndex(index);
    else setActiveIndex(-1);
  }, [pathname, view]);

  // Close market popup on outside click
  useEffect(() => {
    if (!marketOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMarketOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [marketOpen]);

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
      springX.set((width / 5) * activeIndex + (width / 10));
    }
  }, [activeIndex, width, springX]);

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

  // Market icon x position for popup alignment
  const marketCenterX = width > 0 ? (width / 5) * 4 + (width / 10) : 0;

  return (
    <>
      {/* Market Popup */}
      <AnimatePresence>
        {marketOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 z-[55] bg-black/20 backdrop-blur-[2px]"
              onPointerDown={() => setMarketOpen(false)}
            />

            {/* Popup cards */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.7 }}
              className="md:hidden fixed z-[59] flex flex-col gap-2"
              style={{
                bottom: '100px',
                right: '12px',
              }}
            >
              {/* Cart */}
              <Link
                href="/market/cart"
                onClick={() => setMarketOpen(false)}
                className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl text-slate-800 dark:text-slate-100 font-semibold text-[14px] active:scale-95 transition-transform"
              >
                <div className="relative">
                  <ShoppingCart size={18} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                Cart
              </Link>

              {/* My Orders */}
              <Link
                href="/market/orders"
                onClick={() => setMarketOpen(false)}
                className="flex items-center gap-3 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl font-semibold text-[14px] active:scale-95 transition-transform"
              >
                <Package size={18} strokeWidth={2} />
                My Orders
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <div
        ref={containerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-safe shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.5)] transform-gpu"
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
            const isMarket = item.isMarket;

            if (isMarket) {
              const isOnMarket = pathname?.startsWith('/market');
              return (
                <div key={idx} className="relative flex-1 flex flex-col items-center justify-center h-full">
                  
                  {/* Hamburger toggle button — top-right of the floating circle, merged background */}
                  <AnimatePresence>
                    {isOnMarket && (
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMarketOpen((prev) => !prev);
                        }}
                        className="absolute -top-[37px] right-[3px] z-50 w-7 h-7 bg-slate-900 dark:bg-slate-100 rounded-full flex flex-col items-center justify-center gap-[2.5px] outline-none shadow-md"
                        aria-label="Toggle market menu"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {marketOpen ? (
                            <motion.div
                              key="x"
                              initial={{ rotate: -45, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 45, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="flex flex-col items-center gap-[3px]"
                            >
                              {/* X shape — two diagonal lines */}
                              <span className="w-[12px] h-[2px] rounded-full bg-white dark:bg-slate-900 rotate-45 translate-y-[5px]" />
                              <span className="w-[12px] h-[2px] rounded-full bg-white dark:bg-slate-900 -rotate-45 -translate-y-[0px]" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="menu"
                              initial={{ rotate: 45, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -45, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="flex flex-col items-center gap-[3px]"
                            >
                              <span className="w-[12px] h-[1.5px] rounded-full bg-white dark:bg-slate-900" />
                              <span className="w-[8px] h-[1.5px] rounded-full bg-white dark:bg-slate-900" />
                              <span className="w-[12px] h-[1.5px] rounded-full bg-white dark:bg-slate-900" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Market nav link — always just navigates, icon never changes */}
                  <Link
                    href={item.href}
                    onClick={() => setMarketOpen(false)}
                    className="relative flex-1 w-full flex flex-col items-center justify-center outline-none group"
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
                      <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                    </motion.div>

                    <span
                      className={`absolute bottom-1.5 text-[10px] font-semibold transition-colors duration-300 text-black dark:text-white`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setMarketOpen(false)}
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
                  <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
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
