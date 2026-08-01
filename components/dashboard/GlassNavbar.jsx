"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Menu, MessageCircle, Plus, Command, UserCheck, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hoverModalVariants } from "@/utils/animations";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import ProfileModal from "../DashboardComponents/ProfileModal";
import NotificationDropdown from "./NotificationDropdown";
import ThemeToggle from '../ThemeToggle';
import { useUser } from "@/context/UserContext";
import SearchSuggestions from "./navbar/SearchSuggestions";
import BetaBanner from "../BetaBanner";

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
  const { user, isGuest, logout, loading } = useUser();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [suggestions, setSuggestions] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/market')) setSearchType('marketplace');
    else if (pathname.startsWith('/u/')) setSearchType('users');
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
    if (isGuest || user?.role === 'guest') return;
    const fetchCounts = async () => {
        const [notifRes, chatRes] = await Promise.all([
            api.get("/notifications/unread-count"),
            api.get("/chat/unread-count")
        ]);
        if (notifRes.success) setUnreadNotifications(notifRes.count);
        if (chatRes.success) setUnreadChatCount(chatRes.count);
    };
    if (user) fetchCounts();
  }, [isGuest, user]);

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
        const res = await api.get(`/market/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.data) {
          setSuggestions({ marketplace: res.data, total: res.pagination?.total || 0 });
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFocused]);

  const searchParams = useSearchParams();

  const totalResults = useMemo(() => {
    if (!suggestions) return 0;
    if (suggestions.total !== undefined) return suggestions.total;
    return Object.values(suggestions).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  }, [suggestions]);

  const handleSearch = () => {
    if (searchQuery?.trim()) {
        router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
        setSearchFocused(false);
        setMobileSearchOpen(false);
        setIsDropdownOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <BetaBanner />
      <div className="max-w-[1800px] mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-[20px] saturate-[180%] rounded-b-[24px] pl-[12px] pr-[16px] h-[44px] flex items-center justify-between relative overflow-visible">
        
        {/* Left Section */}
        <div className={`flex items-center flex-shrink-0 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${mobileSearchOpen ? 'max-w-0 opacity-0 gap-0 md:max-w-none md:opacity-100 md:gap-2' : 'max-w-[50px] md:max-w-none opacity-100 gap-2'}`}>
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0 -ml-2 shrink-0">
                {sidebarOpen ? (
                  <X strokeWidth={1.5} className="w-[22px] h-[22px] text-black dark:text-white" />
                ) : (
                  <Menu strokeWidth={1.5} className="w-[22px] h-[22px] text-black dark:text-white" />
                )}
            </button>
            <Link href="/" className="hidden md:flex items-center gap-2 group shrink-0">
                <img src="/logo.png" alt="Codalina" className="h-8 w-8 object-contain" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-medium text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                      Codalina
                  </span>
                </div>
            </Link>
        </div>

        {/* Center Section: Optimized Search */}
        <div className={`flex-1 flex justify-center relative transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileSearchOpen ? 'px-0' : 'px-2'}`}>
          
          {/* Mobile Search Container (only visible on mobile) */}
          <div className={`md:hidden flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-full relative ${mobileSearchOpen ? 'max-w-full' : 'max-w-[200px] justify-center'}`}>
            <div 
              onClick={() => {
                if (!mobileSearchOpen) {
                  setMobileSearchOpen(true);
                  setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
                }
              }}
              className={`relative flex items-center h-[32px] bg-apple-parchment dark:bg-apple-surfaceDark rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] border overflow-visible cursor-text w-full ${mobileSearchOpen ? 'border-[#0071e3]/30' : 'border-apple-hairline'}`} 
            >
              
              {/* Left Flex Spacer for Bulletproof Centering */}
              <div className={`transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileSearchOpen ? 'flex-none w-3' : 'flex-1'}`} />

              <div 
                className="flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 h-full"
                style={{ flex: mobileSearchOpen ? '1 0 128px' : '0 0 128px' }}
              >
                <img src="/logo.png" alt="Codalina" className="w-[15px] h-[15px] object-contain shrink-0 mr-1.5 z-10 mb-[3px]" />
                
                <input 
                  id="navbar-search-input"
                  type="text" 
                  placeholder="Search Codalina" 
                  className={`bg-transparent border-none outline-none text-[14px] text-left text-apple-ink transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10 h-full w-full mb-[3px] ${mobileSearchOpen ? 'placeholder:text-apple-muted' : 'placeholder:text-apple-ink cursor-pointer pointer-events-none select-none'}`}
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    window.clearTimeout(window.searchBlurTimeout);
                    setSearchFocused(true);
                    if (!mobileSearchOpen) setMobileSearchOpen(true);
                  }}
                  onBlur={() => {
                    window.searchBlurTimeout = window.setTimeout(() => setSearchFocused(false), 200);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Right Flex Spacer for Bulletproof Centering */}
              <div className={`transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileSearchOpen ? 'flex-none w-3' : 'flex-1'}`} />
            </div>

            <div className={`overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-start shrink-0 ${mobileSearchOpen ? 'w-[65px] opacity-100 ml-1' : 'w-0 opacity-0 ml-0'}`}>
              <button 
                onClick={() => {
                  if (searchQuery?.trim()) {
                    handleSearch();
                  } else {
                    setMobileSearchOpen(false);
                    setSearchQuery("");
                    setSearchFocused(false);
                  }
                }} 
                className={`text-[17px] font-sans whitespace-nowrap shrink-0 px-2 transition-all active:opacity-50 tracking-[-0.4px] text-[#007AFF] font-normal`}
              >
                {searchQuery?.trim() ? 'Search' : 'Cancel'}
              </button>
            </div>

            {/* Mobile Suggestions inline overlay */}
            {mobileSearchOpen && searchFocused && searchQuery?.trim() && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-slate-200/60 dark:border-white/10 rounded-[18px] shadow-2xl overflow-hidden z-[100]">
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

          {/* Desktop Search Container */}
          <div 
            onClick={() => {
                if (!searchFocused) {
                  setTimeout(() => document.getElementById('desktop-search-input')?.focus(), 100);
                }
            }}
            className={`hidden md:flex w-full max-w-[500px] items-center ${(searchFocused || searchQuery) ? 'bg-white dark:bg-slate-900 border-[#0071e3]/30 shadow-sm' : 'bg-[#f5f5f7] dark:bg-[#1d1d1f] border-black/20 dark:border-white/20'} border rounded-full px-4 h-[36px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative cursor-text overflow-hidden`}
          >
              
              {/* Left Flex Spacer */}
              <div 
                className="transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ flex: (searchFocused || searchQuery) ? '0 0 0px' : '1 0 0px' }}
              />

              <div 
                className="flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 h-full"
                style={{ flex: (searchFocused || searchQuery) ? '1 0 128px' : '0 0 128px' }}
              >
                  <Search strokeWidth={2} className="w-[17px] h-[17px] shrink-0 mr-1.5 transition-colors text-black dark:text-white mb-[3px]" />
                  <input 
                      id="desktop-search-input"
                      type="text" 
                      placeholder="Search Codalina" 
                      className={`bg-transparent border-none outline-none text-[14px] text-left w-full mb-[3px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] font-sans ${(searchFocused || searchQuery) ? 'text-black dark:text-white placeholder:text-slate-400' : 'text-black dark:text-white placeholder:text-black dark:placeholder:text-white cursor-pointer pointer-events-none select-none'}`}
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
              </div>

              {/* Right Flex Spacer */}
              <div 
                className="transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ flex: (searchFocused || searchQuery) ? '0 0 0px' : '1 0 0px' }}
              />
              
              {/* Modular Suggestions */}
              {searchFocused && searchQuery?.trim() && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-slate-200/60 dark:border-white/10 rounded-[18px] shadow-2xl overflow-hidden z-[100] transform transition-all">
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

          {/* Desktop Search/Cancel Button */}
          <div className={`hidden md:flex overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] justify-start shrink-0 ${(searchFocused || searchQuery) ? 'w-[65px] opacity-100 ml-2' : 'w-0 opacity-0 ml-0'}`}>
            <button 
              onClick={() => {
                if (searchQuery?.trim()) {
                  handleSearch();
                } else {
                  setSearchQuery("");
                  setSearchFocused(false);
                }
              }} 
              className={`text-[17px] font-sans whitespace-nowrap shrink-0 px-2 transition-all active:opacity-50 tracking-[-0.4px] text-[#007AFF] font-normal`}
            >
              {searchQuery?.trim() ? 'Search' : 'Cancel'}
            </button>
          </div>

        </div>

        {/* Right Section */}
        <div className={`flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${mobileSearchOpen ? 'max-w-0 opacity-0 md:max-w-none md:opacity-100 md:gap-4 gap-0' : 'max-w-[50px] md:max-w-none opacity-100 sm:gap-4 gap-2'}`}>
            {/* Cart and Orders Links */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Link href="/cart" className="p-2 rounded-xl text-black hover:text-black dark:text-white transition-all relative group flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href={user ? `/u/${user.username}?tab=orders` : "/auth/login"} className="p-2 rounded-xl text-black hover:text-black dark:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 border-r border-slate-200 dark:border-white/10 pr-2 sm:pr-4 shrink-0">
                <div className="hidden sm:block shrink-0">
                  <ThemeToggle />
                </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 z-50 relative shrink-0">
                 <div className="hidden xl:block w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                 <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0"></div>
              </div>
            ) : (isGuest || user?.role === 'guest') ? (
              <div className="flex items-center gap-2 sm:gap-3 z-50 relative shrink-0">
                <Link href="/auth/login" className="px-[15px] py-[8px] rounded-apple-sm text-[14px] font-sans text-apple-ink dark:text-apple-ink hover:opacity-80 transition-opacity">Log in</Link>
                <Link href="/auth/register" className="px-[14px] py-[6px] rounded-apple-pill bg-[#0071E3] text-white text-[13px] font-sans hover:opacity-80 transition-opacity whitespace-nowrap">Join</Link>
              </div>
            ) : (
              <div onClick={() => router.push(`/u/${user?.username}`)} className="flex items-center gap-3 cursor-pointer group shrink-0">
                  <div className="text-right hidden xl:block shrink-0">
                      <div className="text-[14px] font-normal text-apple-ink dark:text-apple-ink font-sans leading-tight">{user?.name}</div>
                  </div>
                  <div className="w-7 h-7 md:w-9 md:h-9 shrink-0 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{user?.name?.[0]}</div>
                      )}
                  </div>
              </div>
            )}
        </div>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </nav>
  );
};

export default React.memo(GlassNavbar);



