"use client";
import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { api } from '@/utils/api';
import { DashboardContext } from "../../app/(dashboard)/layout";
import { useLanguage } from "@/context/LanguageContext";
import { features } from "@/constants/features";
import { Home, Compass, Zap, Users, Grid, Bookmark, TrendingUp, Settings, MessageCircle, Trophy, FileText, Layout, BarChart2, Target, Clock, ShieldCheck, Briefcase, Terminal, Store, Smartphone, Monitor, Laptop, Shirt, Box, ChevronRight, X, Watch, Headphones, BatteryCharging, Cable } from "lucide-react";

const SidebarItem = React.memo(({ icon: Icon, label, href, active, count, isCollapsed }) => (
  <Link
    href={href || "#"}
    className={`group relative flex items-center px-[12px] py-[10px] mb-[2px] rounded-apple-sm transition-all duration-200 ${
      active
        ? "bg-[#e5e5ea] text-apple-ink dark:bg-[#2c2c2e] dark:text-white"
        : "text-apple-ink dark:text-white hover:bg-[#f2f2f7] dark:hover:bg-[#1c1c1e]"
    }`}
  >
    <div className="relative z-10 flex items-center gap-3 w-full">
      {Icon && (
        <div className="flex items-center justify-center shrink-0 transition-all duration-300 group-hover:animate-jelly origin-center">
          <Icon
            className={`w-[18px] h-[18px] ${
              active ? "stroke-[2.5px] text-apple-ink dark:text-white" : "stroke-[2px] text-apple-ink dark:text-white opacity-80"
            }`}
          />
        </div>
      )}
      <span className={`text-[14px] font-sans tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'font-semibold' : 'font-normal'} ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'opacity-100 lg:max-w-[200px] w-auto'}`}>
        {label}
      </span>
      {count && (
        <span
          className={`ml-auto shrink-0 relative z-10 text-[12px] font-sans font-bold py-[2px] rounded-apple-pill overflow-hidden transition-all duration-300 flex items-center justify-center ${isCollapsed ? 'lg:opacity-0 lg:max-w-0 lg:px-0 lg:border-0 lg:m-0' : 'opacity-100 lg:max-w-[40px] px-[8px]'} ${
            active
              ? "bg-white text-apple-ink dark:bg-black dark:text-white shadow-sm"
              : "bg-apple-parchment dark:bg-[#1c1c1e] text-apple-muted"
          }`}
        >
          {count}
        </span>
      )}
    </div>
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-normal rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 hidden lg:block whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
));

SidebarItem.displayName = "SidebarItem";

export default function Sidebar({ isHovered, isCollapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useContext(DashboardContext) || {};
  const { t } = useLanguage();

  const q = searchParams?.get("q");

  const [openCategory, setOpenCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const hoverTimeoutRef = React.useRef(null);

  const handleMouseEnter = (catName) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenCategory(catName);
    }, 150); // Apple-style slight delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenCategory(null);
    }, 400); // Revert after delay
  };

  React.useEffect(() => {
    api.get('/market/categories')
      .then(res => {
        setCategories(res.data || res || []);
      })
      .catch(err => console.error(err));
  }, []);

  React.useEffect(() => {
    if (q) {
      // Set active category logic here when data is fetched
    }
  }, [q]);
  
  // Safely extract 'view' parameter
  const view = searchParams?.get("view");

  return (
    <aside className="h-full flex flex-col bg-transparent lg:bg-apple-canvas dark:bg-transparent lg:dark:bg-apple-canvas border-0 lg:border lg:border-apple-hairline rounded-none lg:rounded-apple-lg p-0 lg:p-3 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 hover:pr-0 transition-all custom-scrollbar">
        {/* Main Nav (Hidden on Mobile, moved to bottom nav) */}
        <div className="hidden lg:block space-y-1">
          {/* Removed legacy links (Devlogs, Artifacts, Codex) */}
          {/* Categories Accordion */}
          {categories.map(category => {
            const subcats = category.subcategories || [];
            const isActive = q === category.name.toLowerCase() || subcats.some(sub => q === `${category.name.toLowerCase()} ${sub.name.toLowerCase()}`);
            const isOpen = openCategory === category._id || isActive;
            const Icon = Box; // Default icon for dynamic categories
            
            return (
              <div key={category._id} className="relative"
                   onMouseEnter={() => handleMouseEnter(category._id)}
                   onMouseLeave={handleMouseLeave}>
                <button
                  onClick={() => {
                    if (isCollapsed) return;
                    setOpenCategory(isOpen ? null : category._id);
                    if (subcats.length === 0) {
                      router.push(`/market/category/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`);
                    }
                  }}
                  className={`w-full group relative flex items-center justify-between px-[12px] py-[10px] mb-[2px] rounded-apple-sm transition-all duration-200 ${
                    isActive
                      ? "bg-[#e5e5ea] text-apple-ink dark:bg-[#2c2c2e] dark:text-white"
                      : "text-apple-ink dark:text-white hover:bg-[#f2f2f7] dark:hover:bg-[#1c1c1e]"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {category.image ? (
                        <img src={category.image} alt={category.name} className="w-[18px] h-[18px] object-cover rounded opacity-80 shrink-0" />
                    ) : (
                        <Icon className="w-[18px] h-[18px] opacity-80 shrink-0" />
                    )}
                    <span className={`text-[14px] font-sans whitespace-nowrap transition-all duration-300 ${isActive ? 'font-semibold' : 'font-normal'} ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'opacity-100 lg:max-w-[200px] w-auto'}`}>
                      {category.name}
                    </span>
                  </div>
                  {subcats.length > 0 && (
                    <ChevronRight className={`w-4 h-4 transition-all duration-300 shrink-0 ${isOpen ? 'rotate-90' : ''} ${isCollapsed ? 'lg:opacity-0 lg:max-w-0 lg:scale-0 lg:ml-0' : 'opacity-100 lg:max-w-[20px] lg:scale-100 ml-auto'}`} />
                  )}
                </button>
                
                <AnimatePresence>
                  {!isCollapsed && isOpen && subcats.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-[32px]"
                    >
                      {subcats.map(sub => {
                        const childCats = sub.subcategories || [];
                        return (
                          <div key={sub._id}>
                            <Link
                              href={`/market/category/${encodeURIComponent(sub.name.toLowerCase().replace(/\s+/g, '-'))}`}
                              className={`block py-1.5 px-3 text-[13px] font-sans rounded-apple-sm transition-colors ${
                                pathname.includes(`/market/category/${encodeURIComponent(sub.name.toLowerCase().replace(/\s+/g, '-'))}`)
                                  ? "text-blue-600 dark:text-blue-400 font-medium"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              {sub.name}
                            </Link>
                            {childCats.length > 0 && (
                              <div className="ml-4 border-l border-slate-100 dark:border-white/5 pl-2 mt-1 mb-2 space-y-1">
                                {childCats.map(child => (
                                  <Link
                                    key={child._id}
                                    href={`/market/category/${encodeURIComponent(child.name.toLowerCase().replace(/\s+/g, '-'))}`}
                                    className={`block py-1 px-2 text-[12px] font-sans rounded-apple-sm transition-colors ${
                                      pathname.includes(`/market/category/${encodeURIComponent(child.name.toLowerCase().replace(/\s+/g, '-'))}`)
                                        ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/10"
                                        : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-3" />

        {features.enableCommunity && (
          <>
            <div className="space-y-1">
              <SidebarItem
                icon={Clock}
                label={t("workspace")}
                href="/workspace"
                active={pathname?.startsWith("/workspace")}
                isCollapsed={isCollapsed}
              />

              <SidebarItem 
                icon={ShieldCheck} 
                label={t("verify_identity")} 
                href="/verify" 
                active={pathname === "/verify"}
                isCollapsed={isCollapsed}
              />
            </div>
            
            <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-4" />
          </>
        )}

        {/* Settings & Help (Moved inside scrollable area) */}
        <div className="space-y-1 pb-4">
          <SidebarItem
            icon={Settings}
            label={t("settings")}
            href={user?.username ? `/u/${user.username}?tab=settings` : "/auth/login"}
            active={pathname === `/u/${user?.username}`}
            isCollapsed={isCollapsed}
          />
          
          <SidebarItem
            icon={MessageCircle}
            label={t("help_feedback")}
            href="/help"
            active={pathname === "/help"}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </aside>
  );
}
