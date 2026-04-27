"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import SettingsModal from "../DashboardComponents/SettingsModal";
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
  Briefcase,
  Trophy,
  FileText,
  Layout,
} from "lucide-react";

const SidebarItem = React.memo(({ icon: Icon, label, href, active, count }) => (
  <Link
    href={href || "#"}
    className={`group relative flex items-center justify-between px-4 py-3 rounded-2xl transition-colors duration-300 ${
      active
        ? "text-white dark:text-black"
        : "text-gray-500 dark:text-gray-400 hover:bg-white hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
    }`}
  >
    {active && (
      <motion.div
        layoutId="sidebar-active-indicator"
        className="absolute inset-0 bg-black dark:bg-white rounded-2xl shadow-lg shadow-black/5 dark:shadow-white/5"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.8 }}
      />
    )}
    <div className="relative z-10 flex items-center gap-3">
      <Icon
        className={`w-5 h-5 transition-transform group-hover:scale-110 ${
          active ? "fill-current" : ""
        }`}
      />
      <span className="font-medium">{label}</span>
    </div>
    {count && (
      <span
        className={`relative z-10 text-xs font-bold px-2 py-0.5 rounded-full ${
          active
            ? "bg-white/20 text-white dark:bg-black/10 dark:text-black"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        {count}
      </span>
    )}
  </Link>
));

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Safely extract 'view' parameter
  const view = searchParams?.get("view");

  return (
    <aside className="h-full flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-4 shadow-xl shadow-black/5 overflow-visible">
      {/* Main Nav */}
      <div className="space-y-1">
        <SidebarItem
          icon={Home}
          label="Feed"
          href="/"
          active={pathname === "/" && view !== "saved" && view !== "creators"}
        />
        <SidebarItem
          icon={Layout}
          label="Templates"
          href="/templates"
          active={pathname?.startsWith("/templates")}
        />
        <SidebarItem
          icon={FileText}
          label="Blogs"
          href="/blogs"
          active={pathname?.startsWith("/blogs")}
        />
        <SidebarItem
          icon={Compass}
          label="Explore"
          href="/explore"
          active={pathname === "/explore"}
        />
      </div>

      {/* Library + Saved — hidden temporarily
      <div className="mt-2 mb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
        Library
      </div>
      <div className="space-y-1">
        <SidebarItem
          icon={Bookmark}
          label="Saved"
          href="/?view=saved"
          active={pathname === "/" && view === "saved"}
          count=""
        />
      </div>
      */}

      {/* Community section — temporarily hidden
      <div className="mt-8 mb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
        Community
      </div>
      <div className="space-y-1">
        <SidebarItem 
          icon={Users} 
          label="Creators" 
          href="/?view=creators" 
          active={pathname === "/" && view === "creators"}
        />
      </div>
      */}

      <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-gray-500 dark:text-gray-400 hover:bg-white hover:text-black dark:hover:bg-white/10 dark:hover:text-white w-full"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">Settings</span>
          </div>
        </button>
      </div>

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </aside>
  );
}
