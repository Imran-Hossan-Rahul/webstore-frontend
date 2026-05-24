"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  Menu, 
  MessageCircle, 
  Plus, 
  Command,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import ProfileModal from "../DashboardComponents/ProfileModal";
import CraftsmanProfileModal from "../DashboardComponents/CraftsmanProfileModal";
import NotificationDropdown from "./NotificationDropdown";
import ThemeToggle from '../ThemeToggle';
import { useUser } from "@/context/UserContext";
import SearchSuggestions from "./navbar/SearchSuggestions";
import CreateDropdown from "./navbar/CreateDropdown";

const GlassNavbar = ({ 
  toggleSidebar, 
  onOpenCreatePost, 
  searchQuery, 
  setSearchQuery, 
  onToggleChat,
  onToggleNotification,
  unreadChatCount: externalChatCount,
  unreadNotificationCount: externalNotifCount
}) => {
  const router = useRouter();
  const { user, isGuest, logout } = useUser();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [suggestions, setSuggestions] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Sync counts from props or fetch initially
  useEffect(() => {
    if (isGuest) return;
    const fetchCounts = async () => {
        const [notifRes, chatRes] = await Promise.all([
            api.get("/notifications/unread-count"),
            api.get("/chat/unread-count")
        ]);
        if (notifRes.success) setUnreadNotifications(notifRes.count);
        if (chatRes.success) setUnreadChatCount(chatRes.count);
    };
    fetchCounts();
  }, [isGuest]);

  // Real-time Sync
  useEffect(() => {
    if (!user?._id) return;

    const handleCountUpdate = () => setUnreadNotifications(p => p + 1);
    const handleChatUpdate = async () => {
        const res = await api.get("/chat/unread-count");
        if (res.success) setUnreadChatCount(res.count);
    };

    const handleLocalCountSync = (e) => {
        if (e.detail && e.detail.count !== undefined) {
            setUnreadNotifications(e.detail.count);
        }
    };

    const handleLocalChatSync = (e) => {
        if (e.detail && e.detail.count !== undefined) {
            setUnreadChatCount(e.detail.count);
        }
    };

    socket.on(`user:${user._id}:unread-count-update`, handleCountUpdate);
    socket.on(`user:${user._id}:newMessage`, handleChatUpdate);
    window.addEventListener("notification-count-update", handleLocalCountSync);
    window.addEventListener("chat-count-update", handleLocalChatSync);

    return () => {
      socket.off(`user:${user._id}:unread-count-update`, handleCountUpdate);
      socket.off(`user:${user._id}:newMessage`, handleChatUpdate);
      window.removeEventListener("notification-count-update", handleLocalCountSync);
      window.removeEventListener("chat-count-update", handleLocalChatSync);
    };
  }, [user?._id]);

  // Search Suggestions Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery?.trim() || !searchFocused) {
        setSuggestions(null);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.success) setSuggestions(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFocused]);

  const totalResults = useMemo(() => {
    if (!suggestions) return 0;
    return Object.values(suggestions).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  }, [suggestions]);

  const handleSearch = () => {
    if (searchQuery?.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchFocused(false);
        setMobileSearchOpen(false);
    }
  };

  if (mobileSearchOpen) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-[1800px] mx-auto bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-4 h-[64px] flex items-center shadow-sm gap-3">
          <button 
            onClick={() => {
              setMobileSearchOpen(false);
              setSearchQuery("");
            }} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="flex-1 flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 h-10 relative">
            <Search strokeWidth={1.5} className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              autoFocus
              className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white font-medium font-sans"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            {searchFocused && searchQuery?.trim() && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[100]">
                <SearchSuggestions 
                  suggestions={suggestions} 
                  isSearching={isSearching} 
                  handleSearch={handleSearch}
                  totalResults={totalResults}
                />
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-[1800px] mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 h-[64px] flex items-center shadow-sm">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                <Menu strokeWidth={1.5} className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">A</div>
                <span className="font-medium text-xl tracking-tight hidden sm:block text-slate-900 dark:text-white font-sans">
                    Codalina
                </span>
            </Link>
        </div>

        {/* Center Section: Optimized Search */}
        <div className="flex-1 flex justify-center px-4 relative">
          <div className={`hidden md:flex w-full max-w-lg items-center bg-slate-50 dark:bg-white/5 border ${searchFocused ? 'border-slate-900 dark:border-white bg-white dark:bg-slate-900 shadow-sm' : 'border-slate-200 dark:border-white/10'} rounded-xl px-3 h-10 transition-all duration-200 relative`}>
              <Search strokeWidth={1.5} className={`w-4 h-4 ${searchFocused ? 'text-slate-900 dark:text-white' : 'text-slate-400'} mr-2`} />
              <input 
                  type="text" 
                  placeholder="Search everything..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white font-medium font-sans"
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[9px] font-mono font-medium text-slate-400 uppercase">
                  <Command strokeWidth={1.5} className="w-3 h-3" /> <span>K</span>
              </div>

              {/* Modular Suggestions */}
              {searchFocused && searchQuery?.trim() && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[100]">
                      <SearchSuggestions 
                        suggestions={suggestions} 
                        isSearching={isSearching} 
                        handleSearch={handleSearch}
                        totalResults={totalResults}
                      />
                  </div>
              )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
            {!isGuest && user?.hasCraftsmanAccount && (
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-mono font-medium hover:bg-blue-600 dark:hover:bg-blue-50 transition-all uppercase tracking-wider"
                >
                  <Plus strokeWidth={1.5} className="w-4 h-4" /> <span>Create</span>
                </button>
                <CreateDropdown 
                  isOpen={showCreateDropdown} 
                  setIsOpen={setShowCreateDropdown} 
                  onOpenCreatePost={onOpenCreatePost} 
                />
              </div>
            )}

            <div className="flex items-center gap-1 sm:gap-2 border-r border-slate-200 dark:border-white/10 pr-4">
                <button 
                  onClick={() => setMobileSearchOpen(true)} 
                  className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <Search strokeWidth={1.5} className="w-5 h-5" />
                </button>
                
                {!isGuest && (
                  <>
                    <button onClick={onToggleChat} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all relative">
                        <MessageCircle strokeWidth={1.5} className="w-5 h-5" />
                        {unreadChatCount > 0 && (
                          <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-mono font-medium rounded-full flex items-center justify-center leading-none">
                            {unreadChatCount}
                          </span>
                        )}
                    </button>
                    <button onClick={onToggleNotification} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all relative">
                        <Bell strokeWidth={1.5} className="w-5 h-5" />
                        {unreadNotifications > 0 && (
                          <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-mono font-medium rounded-full flex items-center justify-center leading-none">
                            {unreadNotifications}
                          </span>
                        )}
                    </button>
                  </>
                )}
                <ThemeToggle />
            </div>

            {isGuest ? (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="px-4 py-2 text-[11px] font-mono font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-wider">Log in</Link>
                <Link href="/auth/register" className="px-4 py-2 text-[11px] font-mono font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg uppercase tracking-wider hover:opacity-90 transition-opacity">Join Free</Link>
              </div>
            ) : (
              <div onClick={() => router.push(`/u/${user.username}`)} className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden xl:block">
                      <div className="text-sm font-medium text-slate-900 dark:text-white font-sans">{user.name}</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono font-medium flex items-center justify-end gap-1 uppercase tracking-[0.2em]">
                          <UserCheck strokeWidth={1.5} className="w-2.5 h-2.5" /> {user.hasCraftsmanAccount ? "Craftsman" : "Member"}
                      </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{user.name?.[0]}</div>
                      )}
                  </div>
              </div>
            )}
        </div>
      </div>

      {/* Modals */}
      {user?.hasCraftsmanAccount ? (
        <CraftsmanProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      ) : (
        <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      )}
    </nav>
  );
};

export default React.memo(GlassNavbar);



