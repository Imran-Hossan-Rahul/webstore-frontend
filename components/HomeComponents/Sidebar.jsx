"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Compass, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  User, 
  History, 
  Flame, 
  Music, 
  Gamepad2, 
  Trophy,
  HelpCircle,
  Settings,
  Flag,
  Layout
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, href, isActive }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
      isActive ? "bg-gray-100 dark:bg-gray-800 font-semibold" : "text-gray-700 dark:text-gray-300"
    }`}
  >
    <Icon className={`w-5 h-5 ${isActive ? "" : ""}`} />
    <span className="text-sm truncate">{label}</span>
  </Link>
);

const SidebarSection = ({ title, children }) => (
  <div className="py-2 border-b border-gray-200 dark:border-gray-800 pb-4 mb-2">
    {title && <h3 className="px-3 mb-2 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>}
    <div className="flex flex-col gap-1">
      {children}
    </div>
  </div>
);

export default function Sidebar({ isOpen = true, className = "" }) {
  const pathname = usePathname();

  // If closed (mobile/collapsed), maybe show mini version? For now, we assume fixed sidebar on generic desktop.
  
  return (
    <aside className={`w-60 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden fixed left-0 top-14 bg-white dark:bg-black scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-400 pb-10 z-30 transition-all ${className} hidden md:block border-r border-gray-100 dark:border-gray-900`}>
      <div className="px-3 py-4 space-y-1">
        <SidebarItem icon={Home} label="Home" href="/" isActive={pathname === "/"} />
        <SidebarItem icon={Layout} label="Templates" href="/templates" isActive={pathname?.startsWith("/templates")} />
        <SidebarItem icon={Compass} label="Blogs" href="/blogs" isActive={pathname?.startsWith("/blogs")} />
        <SidebarItem icon={User} label="Community" href="/community" isActive={pathname?.startsWith("/community")} />
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-2" />

      <div className="px-3 py-2 space-y-1">
        <SidebarItem icon={Settings} label="Settings" href="/settings" />
        <SidebarItem icon={HelpCircle} label="Help" href="/help" />
      </div>
      
      <div className="px-4 py-4 text-xs text-gray-500 font-medium">
        <p>&copy; 2025 Creative</p>
      </div>
    </aside>
  );
}
