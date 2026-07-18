"use client";
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { DashboardContext } from "../../app/(dashboard)/layout";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  Compass,
  Zap,
  Users,
  Grid,
  Bookmark,
  TrendingUp,
  Settings,
  MessageCircle,
  Trophy,
  FileText,
  Layout,
  BarChart2,
  Target,
  Clock,
  ShieldCheck,
  Briefcase,
  Terminal,
  Store,
} from "lucide-react";

const SidebarItem = React.memo(({ icon: Icon, label, href, active, count, isCollapsed }) => (
  <Link
    href={href || "#"}
    className={`group relative flex items-center px-3 py-2.5 mb-0.5 rounded-lg transition-all duration-200 ${
      active
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/20 dark:shadow-white/20"
        : "text-black dark:text-white hover:bg-slate-100/60 dark:hover:bg-white/5"
    }`}
  >
    <div className="relative z-10 flex items-center gap-3 w-full">
      {Icon && (
        <div className="flex items-center justify-center shrink-0 transition-all duration-300 group-hover:animate-jelly origin-center">
          <Icon
            className={`w-[18px] h-[18px] ${
              active ? "stroke-[2.5px] text-white dark:text-slate-900" : "stroke-[2px] text-black dark:text-white"
            }`}
          />
        </div>
      )}
      <span className={`text-[13.5px] font-medium tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'font-semibold' : ''} ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
        {label}
      </span>
      {count && (
        <span
          className={`ml-auto shrink-0 relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:px-0 lg:overflow-hidden' : 'opacity-100'} ${
            active
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </div>
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 hidden lg:block whitespace-nowrap z-50">
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

  // Safely extract 'view' parameter
  const view = searchParams?.get("view");
  const isMarket = pathname?.startsWith("/market");
  const isCollapsed = isMarket && !isHovered;

  return (
    <aside className="h-full flex flex-col bg-transparent lg:bg-white/80 dark:bg-transparent lg:dark:bg-slate-900/40 lg:backdrop-blur-md border-0 lg:border lg:border-slate-200 lg:dark:border-white/10 rounded-none lg:rounded-2xl p-0 lg:p-3 lg:shadow-sm overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 hover:pr-0 transition-all custom-scrollbar">
        {/* Main Nav (Hidden on Mobile, moved to bottom nav) */}
        <div className="hidden lg:block space-y-1">
          <SidebarItem
            icon={Home}
            label={t("feed")}
            href="/"
            active={pathname === "/" && view !== "saved" && view !== "craftsmen"}
            isCollapsed={isCollapsed}
          />
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
          <SidebarItem
            icon={Store}
            label="Marketplace"
            href="/market"
            active={pathname?.startsWith("/market")}
            isCollapsed={isCollapsed}
          />
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-3" />

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
              <div className={`mt-8 mb-3 px-4 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.2em] transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'lg:opacity-100'}`}>
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
