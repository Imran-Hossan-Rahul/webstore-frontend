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
} from "lucide-react";

const SidebarItem = React.memo(({ icon: Icon, label, href, active, count }) => (
  <Link
    href={href || "#"}
    className={`group relative flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-150 ${
      active
        ? "text-slate-900 dark:text-white"
        : "text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
    }`}
  >
    {active && (
      <motion.div
        layoutId="sidebar-active-indicator"
        className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-xl"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.8 }}
      />
    )}
    <div className="relative z-10 flex items-center gap-3">
      {Icon && (
        <Icon
          className={`w-4 h-4 ${
            active ? "stroke-[2.5px]" : "stroke-[1.5px]"
          }`}
        />
      )}
      <span className={`text-sm font-sans font-medium`}>{label}</span>
    </div>
    {count && (
      <span
        className={`relative z-10 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
          active
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            : "bg-slate-100 dark:bg-white/5 text-slate-500"
        }`}
      >
        {count}
      </span>
    )}
  </Link>
));

SidebarItem.displayName = "SidebarItem";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useContext(DashboardContext) || {};
  const { t } = useLanguage();

  // Safely extract 'view' parameter
  const view = searchParams?.get("view");

  return (
    <aside className="h-full flex flex-col bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
        {/* Main Nav */}
        <div className="space-y-1">
          <SidebarItem
            icon={Home}
            label={t("feed")}
            href="/"
            active={pathname === "/" && view !== "saved" && view !== "craftsmen"}
          />
          <SidebarItem
            icon={Terminal}
            label={t("Devlogs")}
            href="/devlogs"
            active={pathname?.startsWith("/devlogs")}
          />
          <SidebarItem
            icon={Layout}
            label={t("artifacts")}
            href="/artifacts"
            active={pathname?.startsWith("/artifacts")}
          />
          <SidebarItem
            icon={FileText}
            label={t("codex")}
            href="/codex"
            active={pathname?.startsWith("/codex")}
          />
        </div>

        {/* Library + Saved */}
        <div className="mt-8 mb-3 px-4 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.2em]">
          {t("library")}
        </div>
        <div className="space-y-1">
          <SidebarItem
            icon={Bookmark}
            label={t("saved")}
            href="/?view=saved"
            active={pathname === "/" && view === "saved"}
            count=""
          />
          <SidebarItem
            icon={Trophy}
            label={t("achievements")}
            href="/achievements"
            active={pathname?.startsWith("/achievements")}
          />
        </div>

        {/* Community section */}
        <div className="mt-8 mb-3 px-4 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.2em]">
          {t("community")}
        </div>
        <div className="space-y-1">
          <SidebarItem
            icon={Trophy}
            label={t("challenges")}
            href="/challenges"
            active={pathname?.startsWith("/challenges")}
          />
          <SidebarItem
            icon={Briefcase}
            label={t("jobs")}
            href="/jobs"
            active={pathname?.startsWith("/jobs")}
          />
          <SidebarItem
            icon={Target}
            label={t("proposals")}
            href="/proposals"
            active={pathname?.startsWith("/proposals")}
          />
          <SidebarItem 
            icon={ShieldCheck} 
            label={t("rewards_wallet")} 
            href="/wallet" 
            active={pathname?.startsWith("/wallet")}
          />

          {(user?.role === "patron" || user?.role === "admin" || user?.isHost) && (
            <>
              <div className="mt-8 mb-3 px-4 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.2em]">
                {t("host_panel")}
              </div>
              {user?.role === "patron" || user?.role === "admin" ? (
                <>
                  <SidebarItem
                    icon={Users}
                    label={t("manage_jobs")}
                    href="/manage-jobs"
                    active={pathname?.startsWith("/manage-jobs")}
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
                  />
                  <SidebarItem
                    icon={Trophy}
                    label={t("manage_challenges")}
                    href="/manage-challenges"
                    active={pathname?.startsWith("/manage-challenges")}
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
          />

          <SidebarItem 
            icon={ShieldCheck} 
            label={t("verify_identity")} 
            href="/verify" 
            active={pathname === "/verify"}
          />
        </div>
        
        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>

      {/* Fixed Footer */}
      <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-white/5">
        <SidebarItem
          icon={Settings}
          label={t("settings")}
          href="/settings"
          active={pathname === "/settings"}
        />
      </div>
    </aside>

  );
}


