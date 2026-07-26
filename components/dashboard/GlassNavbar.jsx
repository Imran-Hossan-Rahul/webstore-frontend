"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Bell, Menu, MessageCircle, Plus, Command, UserCheck, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hoverModalVariants } from "@/utils/animations";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import ProfileModal from "../DashboardComponents/ProfileModal";
import CraftsmanProfileModal from "../DashboardComponents/CraftsmanProfileModal";
import NotificationDropdown from "./NotificationDropdown";
import ThemeToggle from '../ThemeToggle';
import { useUser } from "@/context/UserContext";
import SearchSuggestions from "./navbar/SearchSuggestions";
import CreateDropdown from "./navbar/CreateDropdown";
import BetaBanner from "../BetaBanner";
import { features } from "@/constants/features";

const GlassNavbar = ({ 
  toggleSidebar, 
  sidebarOpen,
  onOpenCreatePost, 
  searchQuery, 
  setSearchQuery, 
  onToggleChat,
  onToggleNotification,
  unreadChatCount: externalChatCount,
  unreadNotificationCount: externalNotifCount
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest, logout } = useUser();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [suggestions, setSuggestions] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/codex')) setSearchType('codex');
    else if (pathname.startsWith('/artifacts')) setSearchType('artifacts');
    else if (pathname.startsWith('/jobs')) setSearchType('jobs');
    else if (pathname.startsWith('/challenges')) setSearchType('challenges');
    else if (pathname.startsWith('/market')) setSearchType('marketplace');
    else if (pathname.startsWith('/workspace')) setSearchType('workspace');
    else if (pathname.startsWith('/proposals')) setSearchType('proposals');
    else if (pathname.startsWith('/saved')) setSearchType('saved');
    else if (pathname.startsWith('/devlogs') || pathname.startsWith('/post')) setSearchType('posts');
    else if (pathname.startsWith('/u/')) setSearchType('patrons');
    else setSearchType('all');
  }, [pathname]);

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) {
          try {
            const cartIds = JSON.parse(cartStr);
            setCartCount(Array.isArray(cartIds) ? cartIds.length : 0);
          } catch(e) {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
    };
    updateCartCount();
    window.addEventListener('addedToCart', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('addedToCart', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

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
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
        if (res.success) setSuggestions(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFocused, searchType]);

  const searchParams = useSearchParams();

  const totalResults = useMemo(() => {
    if (!suggestions) return 0;
    return Object.values(suggestions).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  }, [suggestions]);

  const handleSearch = () => {
    if (searchQuery?.trim()) {
        if (searchType === 'workspace') {
            router.push(`/workspace?q=${encodeURIComponent(searchQuery)}`);
        } else if (searchType === 'proposals') {
            router.push(`/proposals?q=${encodeURIComponent(searchQuery)}`);
        } else if (searchType === 'saved') {
            router.push(`/saved?q=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
        }
        setSearchFocused(false);
        setMobileSearchOpen(false);
        setIsDropdownOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <BetaBanner />
      <div className="max-w-[1800px] mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-[20px] saturate-[180%] rounded-b-[24px] pl-[12px] pr-[16px] h-[44px] flex items-center justify-between relative overflow-visible">
        
        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-white dark:bg-slate-900 px-4 h-full flex items-center gap-3 z-[60]"
            >
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
                  id="mobile-search-input"
                  type="text" 
                  placeholder="Search Codalina" 
                  className="bg-transparent border-none outline-none text-[13px] font-semibold font-sans w-full text-slate-900 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-300"
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                      window.clearTimeout(window.searchBlurTimeout);
                      setSearchFocused(true);
                  }}
                  onBlur={() => {
                      window.searchBlurTimeout = window.setTimeout(() => setSearchFocused(false), 200);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />


                {searchFocused && searchQuery?.trim() && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[100]">
                    <SearchSuggestions 
                      suggestions={suggestions} 
                      isSearching={isSearching} 
                      handleSearch={handleSearch}
                      totalResults={totalResults}
                      searchType={searchType}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Left Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0 -ml-2">
                {sidebarOpen ? (
                  <X strokeWidth={1.5} className="w-[22px] h-[22px] text-black dark:text-white" />
                ) : (
                  <Menu strokeWidth={1.5} className="w-[22px] h-[22px] text-black dark:text-white" />
                )}
            </button>
            <Link href="/" className="hidden md:flex items-center gap-2 group">
                <img src="/logo.png" alt="Codalina" className="h-8 w-8 object-contain" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-medium text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                      Codalina
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-full">
                    Beta
                  </span>
                </div>
            </Link>
        </div>

        {/* Center Section: Optimized Search */}
        <div className="flex-1 flex justify-center px-2 relative">
          
          {/* Mobile "Search Codalina" Pill Button */}
          <button 
            onClick={() => {
              setMobileSearchOpen(true);
              setTimeout(() => {
                document.getElementById('mobile-search-input')?.focus();
              }, 250);
            }}
            className={`md:hidden flex w-full max-w-[200px] items-center justify-center gap-2 bg-apple-parchment dark:bg-apple-surfaceDark hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-apple-hairline rounded-apple-pill px-4 h-8 ml-2 transition-opacity duration-200 ${mobileSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <img src="/logo.png" alt="Codalina" className="w-4 h-4 object-contain" />
            <span className="text-[14px] font-sans text-apple-ink dark:text-apple-ink">Search</span>
          </button>

          <div className={`hidden md:flex w-full max-w-lg items-center bg-apple-parchment dark:bg-apple-surfaceDark border ${searchFocused ? 'border-[#0071E3] dark:border-[#0071E3]' : 'border-apple-hairline'} rounded-apple-md px-3 h-[32px] transition-all duration-200 relative`}>
              <Search strokeWidth={1.5} className={`w-4 h-4 ${searchFocused ? 'text-apple-ink dark:text-apple-ink' : 'text-apple-muted'} mr-2`} />
              <input 
                  id="desktop-search-input"
                  type="text" 
                  placeholder="Search Codalina..." 
                  className="bg-transparent border-none outline-none text-[14px] w-full text-apple-ink font-sans"
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                      window.clearTimeout(window.searchBlurTimeout);
                      setSearchFocused(true);
                  }}
                  onBlur={() => {
                      window.searchBlurTimeout = window.setTimeout(() => setSearchFocused(false), 200);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              


              {/* Modular Suggestions */}
              {searchFocused && searchQuery?.trim() && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[100]">
                      <SearchSuggestions 
                        suggestions={suggestions} 
                        isSearching={isSearching} 
                        handleSearch={handleSearch}
                        totalResults={totalResults}
                        searchType={searchType}
                      />
                  </div>
              )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">

            {/* Cart and Orders Links */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/cart" className="p-2 rounded-xl text-black hover:text-black dark:text-white transition-all relative group flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="p-2 rounded-xl text-black hover:text-black dark:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 border-r border-slate-200 dark:border-white/10 pr-2 sm:pr-4">
                
                {!isGuest && (
                  <>
                    <button onClick={onToggleNotification} className="p-1 sm:p-2 rounded-xl text-black hover:text-black dark:text-white transition-all relative">
                        <Bell strokeWidth={1.5} className="w-5 h-5" />
                        {unreadNotifications > 0 && (
                          <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-mono font-medium rounded-full flex items-center justify-center leading-none">
                            {unreadNotifications}
                          </span>
                        )}
                    </button>
                  </>
                )}
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>
            </div>

            {isGuest ? (
              <div className="flex items-center gap-2 sm:gap-3 z-50 relative">
                <Link href="/auth/login" className="px-[15px] py-[8px] rounded-apple-sm text-[14px] font-sans text-apple-ink dark:text-apple-ink hover:opacity-80 transition-opacity">Log in</Link>
                <Link href="/auth/register" className="px-[14px] py-[6px] rounded-apple-pill bg-[#0071E3] text-white text-[13px] font-sans hover:opacity-80 transition-opacity">Join</Link>
              </div>
            ) : (
              <div onClick={() => router.push(`/u/${user.username}`)} className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden xl:block">
                      <div className="text-[14px] font-semibold text-apple-ink dark:text-apple-ink font-sans leading-tight">{user.name}</div>
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



