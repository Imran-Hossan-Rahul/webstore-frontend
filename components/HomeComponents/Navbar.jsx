"use client";
import React from "react";
import Link from "next/link";
import { 
  Menu, 
  Search, 
  Video, 
  Bell, 
  User, 
  Mic, 
  Layout, 
  Plus,
  Zap,
  MessageCircle, // New Import
  X // New Import
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import NotificationDropdown from "../dashboard/NotificationDropdown";

export default function Navbar({ toggleSidebar, searchQuery, setSearchQuery, user, hasCreatorAccount, categories, activeCategory, onSelectCategory, onOpenCreatorModal }) {
  const scrollContainerRef = React.useRef(null);
  const [showMsgModal, setShowMsgModal] = React.useState(false);

  // Filter Categories if needed, or use all.
  // Optional: Scroll helper
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-black z-50 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-900 gap-4">
      
      {/* Messages Modal */}
      {showMsgModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowMsgModal(false)}>
            <div className="bg-white dark:bg-gray-900 w-[90%] max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Messages</h3>
                    <button onClick={() => setShowMsgModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No new messages</p>
                </div>
            </div>
        </div>
      )}

      {/* Left: Menu & Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-1" title="Creative Platform Home">
            <div className="p-1.5 bg-red-600 rounded-lg">
                <Layout className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">Creative</span>
        </Link>
      </div>

      {/* Center: Search (Reddit Style) */}
      <div className="hidden md:flex flex-1 max-w-[600px] mx-auto px-4">
        <div className="flex flex-1 items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 h-10 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input 
                type="text" 
                placeholder="Search" 
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 text-black dark:text-white">
            <Search className="w-6 h-6" />
        </button>

        <div className="hidden xl:block">
            {hasCreatorAccount ? (
               <Link href="/user/creator">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Dashboard</span>
                 </button>
               </Link>
            ) : (
                <button 
                    onClick={onOpenCreatorModal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create</span>
                </button>
            )}
        </div>

        <button 
            onClick={() => setShowMsgModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white relative"
        >
            <MessageCircle className="w-5 h-5" />
        </button>

        <NotificationDropdown />
        
        <ThemeToggle />

        {/* Profile */}
        {user ? (
            <button className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-offset-2 hover:ring-purple-500 transition-all">
                {user.name?.[0]?.toUpperCase() || "U"}
            </button>
        ) : (
            <Link href="/auth/login">
                <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <User className="w-4 h-4" />
                    Sign in
                </button>
            </Link>
        )}
      </div>
    </div>
  );
}
