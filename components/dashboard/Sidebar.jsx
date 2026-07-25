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
      <span className={`text-[14px] font-sans tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'font-semibold' : 'font-normal'} ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
        {label}
      </span>
      {count && (
        <span
          className={`ml-auto shrink-0 relative z-10 text-[12px] font-sans font-bold px-[8px] py-[2px] rounded-apple-pill transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:px-0 lg:overflow-hidden' : 'opacity-100'} ${
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

export default function Sidebar({ isHovered }) {
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
    api.get('/market/categories/all')
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
  const isCollapsed = false;

  return (
    <aside className="h-full flex flex-col bg-transparent lg:bg-apple-canvas dark:bg-transparent lg:dark:bg-apple-canvas border-0 lg:border lg:border-apple-hairline rounded-none lg:rounded-apple-lg p-0 lg:p-3 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 hover:pr-0 transition-all custom-scrollbar">
        {/* Main Nav (Hidden on Mobile, moved to bottom nav) */}
        <div className="hidden lg:block space-y-1">
          {features.enableCommunity && (
              <>
              <SidebarItem
                icon={Terminal}
                label={t("Devlogs")}
                href="/devlogs"
                active={pathname?.startsWith("/devlogs")}
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                icon={Layout}
                label={t("artifacts")}
                href="/artifacts"
                active={pathname?.startsWith("/artifacts")}
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                icon={FileText}
                label={t("codex")}
                href="/codex"
                active={pathname?.startsWith("/codex")}
                isCollapsed={isCollapsed}
              />
            </>
          )}
          {/* Categories Accordion */}
          {[
            { id: 'smart-watch', name: 'Smart Watch', icon: Watch },
            { id: 'earbuds', name: 'Earbuds', icon: Headphones },
            { id: 'over-ear-headphones', name: 'Over-Ear Headphones', icon: Headphones },
            { id: 'power-banks', name: 'Power Banks', icon: BatteryCharging },
            { id: 'adapters', name: 'Adapters', icon: Cable },
          ].map(category => {
            const isActive = q === category.name.toLowerCase();
            const Icon = category.icon;
            
            return (
              <div key={category.id} className="relative">
                <button
                  onClick={() => {
                    if (isCollapsed) return;
                    router.push(`/market?q=${encodeURIComponent(category.name.toLowerCase())}`);
                  }}
                  className={`w-full group relative flex items-center justify-between px-[12px] py-[10px] mb-[2px] rounded-apple-sm transition-all duration-200 ${
                    isActive
                      ? "bg-[#e5e5ea] text-apple-ink dark:bg-[#2c2c2e] dark:text-white"
                      : "text-apple-ink dark:text-white hover:bg-[#f2f2f7] dark:hover:bg-[#1c1c1e]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px] opacity-80" />
                    <span className={`text-[14px] font-sans ${isActive ? 'font-semibold' : 'font-normal'} ${isCollapsed ? 'hidden' : 'block'}`}>
                      {category.name}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-3" />

        {features.enableCommunity && (
          <>
            {/* Library + Saved */}
            <div className="space-y-1">
              <SidebarItem
                icon={Bookmark}
                label={t("saved")}
                href="/?view=saved"
                active={pathname === "/" && view === "saved"}
                count=""
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                icon={Trophy}
                label={t("achievements")}
                href="/achievements"
                active={pathname?.startsWith("/achievements")}
                isCollapsed={isCollapsed}
              />
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-3" />

            {/* Community section */}
            <div className="space-y-1">
              <SidebarItem
                icon={Trophy}
                label={t("challenges")}
                href="/challenges"
                active={pathname?.startsWith("/challenges")}
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                icon={Briefcase}
                label={t("jobs")}
                href="/jobs"
                active={pathname?.startsWith("/jobs")}
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                icon={Target}
                label={t("proposals")}
                href="/proposals"
                active={pathname?.startsWith("/proposals")}
                isCollapsed={isCollapsed}
              />
              <SidebarItem 
                icon={ShieldCheck} 
                label={t("rewards_wallet")} 
                href="/wallet" 
                active={pathname?.startsWith("/wallet")}
                isCollapsed={isCollapsed}
              />

              {(user?.role === "patron" || user?.role === "admin" || user?.isHost) && (
                <>
                  <div className={`mt-8 mb-3 px-4 text-[11px] font-sans font-semibold text-apple-muted uppercase tracking-[0.04em] transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'}`}>
                    {t("host_panel")}
                  </div>
                  {user?.role === "patron" || user?.role === "admin" ? (
                    <>
                      <SidebarItem
                        icon={Users}
                        label={t("manage_jobs")}
                        href="/manage-jobs"
                        active={pathname?.startsWith("/manage-jobs")}
                        isCollapsed={isCollapsed}
                      />
                    </>
                  ) : null}

                  {user?.isHost || user?.role === "admin" ? (
                    <>
                      <SidebarItem
                        icon={Zap}
                        label={t("host_challenge")}
                        href="/challenges/create"
                        active={pathname?.startsWith("/challenges/create")}
                        isCollapsed={isCollapsed}
                      />
                      <SidebarItem
                        icon={Trophy}
                        label={t("manage_challenges")}
                        href="/manage-challenges"
                        active={pathname?.startsWith("/manage-challenges")}
                        isCollapsed={isCollapsed}
                      />
                    </>
                  ) : null}
                </>
              )}

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
            href="/settings"
            active={pathname === "/settings"}
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
