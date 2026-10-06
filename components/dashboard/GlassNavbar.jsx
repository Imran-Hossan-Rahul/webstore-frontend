"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Menu, MessageCircle, Plus, Command, UserCheck, ChevronDown, X, Headset, MessageCircleQuestion } from "lucide-react";
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
import { getOptimizedUrl } from "@/utils/optimizeImage";

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
  const isHomePage = pathname === '/' || pathname === '';
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

  const [showNavbarSearch, setShowNavbarSearch] = useState(false);

  useEffect(() => {
    if (pathname !== '/') {
        setShowNavbarSearch(true);
        return;
    }
    
    // We rely purely on the custom event dispatched by MarketClientView
    // which correctly uses getBoundingClientRect on mount.
    const handleToggle = (e) => {
        setShowNavbarSearch(e.detail);
    };
    window.addEventListener('toggle-navbar-search', handleToggle);
    return () => window.removeEventListener('toggle-navbar-search', handleToggle);
  }, [pathname]);

  const [hasPendingOrders, setHasPendingOrders] = useState(false);

  useEffect(() => {
    const checkPendingOrders = async () => {
      try {
        let orders = [];
        if (user && user.role !== 'guest') {
          orders = await api.get('/market/orders');
        } else {
          const storedIds = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
          if (storedIds.length > 0) {
            orders = await api.post('/market/orders/guest/list', { ids: storedIds });
          }
        }
        if (Array.isArray(orders)) {
          const hasPending = orders.some(o => o.payment_status !== 'Verified' && o.status !== 'Cancelled');
          setHasPendingOrders(hasPending);
        }
      } catch (err) {
        // ignore
      }
    };
    checkPendingOrders();
    window.addEventListener('orderPlaced', checkPendingOrders);
    return () => window.removeEventListener('orderPlaced', checkPendingOrders);
  }, [user]);

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
        try {
            const [notifRes, chatRes] = await Promise.all([
                api.get("/notifications/unread-count"),
                api.get("/chat/unread-count")
            ]);
            if (notifRes.success) setUnreadNotifications(notifRes.count);
            if (chatRes.success) setUnreadChatCount(chatRes.count);
        } catch (error) {
            console.error("Failed to fetch notification counts:", error);
        }
    };
    if (user) fetchCounts();
  }, [isGuest, user]);

  // Real-time Sync
  useEffect(() => {
    if (!user?._id) return;

    const handleCountUpdate = () => setUnreadNotifications(p => p + 1);
    const handleChatUpdate = async () => {
        try {
            const res = await api.get("/chat/unread-count");
            if (res.success) setUnreadChatCount(res.count);
        } catch (error) {
            console.error("Failed to fetch chat count:", error);
        }
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
    socket.on(`user:${user._id}:chatRead`, handleChatUpdate);
    
    window.addEventListener("notification-count-update", handleLocalCountSync);
    window.addEventListener("chat-count-update", handleLocalChatSync);

    return () => {
      socket.off(`user:${user._id}:unread-count-update`, handleCountUpdate);
      socket.off(`user:${user._id}:newMessage`, handleChatUpdate);
      socket.off(`user:${user._id}:chatRead`, handleChatUpdate);
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
        router.push(`/store?q=${encodeURIComponent(searchQuery)}`);
        setSearchFocused(false);
        setMobileSearchOpen(false);
        setIsDropdownOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="w-full bg-white/40 backdrop-blur-2xl saturate-[1.8] border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)] pl-[12px] pr-[16px] h-[48px] flex items-center justify-between relative overflow-visible">
        
        {/* Left Section */}
        <div className={`flex items-center flex-shrink-0 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${mobileSearchOpen ? 'max-w-0 opacity-0 gap-0 md:max-w-none md:opacity-100 md:gap-2' : 'max-w-[50px] md:max-w-none opacity-100 gap-2'}`}>
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-brand-surface/10 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0 -ml-2 shrink-0">
                {sidebarOpen ? (
                  <X strokeWidth={1.5} className="w-[22px] h-[22px] text-black" />
                ) : (
                  <Menu strokeWidth={1.5} className="w-[22px] h-[22px] text-black" />
                )}
            </button>
            <Link href="/" className="hidden md:flex items-center gap-2 group shrink-0 ml-2">
                <img src="/logo.png" alt="Codalina" className="h-8 w-8 object-contain" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-semibold text-xl tracking-tight text-black font-display">
                      Codalina
                  </span>
                </div>
            </Link>
        </div>

        {/* Center Section: Optimized Search */}
        <div className={`flex-1 flex justify-center relative transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileSearchOpen ? 'px-0' : 'px-2'}`}>
          
          {/* Mobile Search Container (only visible on mobile) */}
          <AnimatePresence>
          {showNavbarSearch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`md:hidden flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-full relative ${mobileSearchOpen ? 'max-w-full' : 'max-w-[200px] justify-center'}`}
          >
            <div 
              onClick={() => {
                if (!mobileSearchOpen) {
                  setMobileSearchOpen(true);
                  setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
                }
              }}
              className={`relative flex items-center h-[32px] rounded-[8px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] border overflow-visible cursor-text w-full ${mobileSearchOpen ? 'bg-white border-brand-blue ring-2 ring-brand-blue/20' : 'bg-white/60 border-black/10 backdrop-blur-sm hover:bg-white/80 hover:border-black/20'}`} 
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
                  className={`bg-transparent border-none outline-none text-[14px] text-left text-black transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10 h-full w-full mb-[3px] font-sans ${mobileSearchOpen ? 'placeholder:text-black/40' : 'placeholder:text-black/50 cursor-pointer pointer-events-none select-none'}`}
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
                className={`text-[17px] font-sans whitespace-nowrap shrink-0 px-2 transition-all active:opacity-50 tracking-[-0.4px] text-brand-blue font-normal`}
              >
                {searchQuery?.trim() ? 'Search' : 'Cancel'}
              </button>
            </div>

            {/* Mobile Suggestions inline overlay */}
            {mobileSearchOpen && searchFocused && searchQuery?.trim() && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-brand-surface dark:bg-brand-dark border border-brand-navy/[0.10] dark:border-white/10 rounded-[4px] shadow-[0_8px_32px_rgba(11,37,69,0.08)] overflow-hidden z-[100]">
                  <SearchSuggestions 
                      suggestions={suggestions} 
                      isSearching={isSearching} 
                      handleSearch={handleSearch}
                      totalResults={totalResults}
                      searchType={searchType}
                    />
                </div>
            )}
          </motion.div>
          )}
          </AnimatePresence>

          {/* Desktop Search Container */}
          <AnimatePresence>
          {showNavbarSearch && (
          <motion.div
            layoutId="global-search-bar-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="hidden md:flex w-full max-w-[500px] items-center relative overflow-visible"
          >
          <div 
            onClick={() => {
                if (!searchFocused) {
                  setTimeout(() => document.getElementById('desktop-search-input')?.focus(), 100);
                }
            }}
            className={`hidden md:flex w-full max-w-[500px] items-center ${(searchFocused || searchQuery) ? 'bg-white border-brand-blue ring-2 ring-brand-blue/20 shadow-sm' : 'bg-white/60 border-black/10 backdrop-blur-sm hover:bg-white/80 hover:border-black/20'} border rounded-[8px] px-4 h-[36px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative cursor-text overflow-visible`}
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
                  <Search strokeWidth={2} className="w-[17px] h-[17px] shrink-0 mr-1.5 transition-colors text-black/50 mb-[3px]" />
                  <input 
                      id="desktop-search-input"
                      type="text" 
                      placeholder="Search Codalina" 
                      className={`bg-transparent border-none outline-none text-[14px] text-black text-left w-full mb-[3px] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] font-sans ${(searchFocused || searchQuery) ? 'placeholder:text-black/40' : 'placeholder:text-black/40 cursor-pointer pointer-events-none select-none'}`}
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
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-brand-surface dark:bg-brand-dark border border-brand-navy/[0.10] dark:border-white/10 rounded-[4px] shadow-[0_8px_32px_rgba(11,37,69,0.08)] overflow-hidden z-[100] transform transition-all">
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
              className={`text-[17px] font-sans whitespace-nowrap shrink-0 px-2 transition-all active:opacity-50 tracking-[-0.4px] text-brand-blue font-normal`}
            >
              {searchQuery?.trim() ? 'Search' : 'Cancel'}
            </button>
          </div>

        </div>

        {/* Right Section */}
        <div className={`flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${mobileSearchOpen ? 'max-w-0 opacity-0 md:max-w-none md:opacity-100 md:gap-4 gap-0' : 'max-w-none opacity-100 sm:gap-4 gap-2'}`}>
            {/* Cart and Orders Links */}
            {pathname !== "/book-call" && (
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <Link href="/cart" className="p-2 rounded-xl text-black hover:bg-black/5 transition-all relative group flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href={user ? `/u/${user.username}?tab=orders` : "/orders"} title="My Orders" className="p-2 rounded-xl text-black hover:bg-black/5 transition-all relative group flex items-center justify-center">
                  <div className={`relative transition-colors duration-500 ${hasPendingOrders ? 'text-brand-blue' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasPendingOrders ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}>
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                      <path d="M3 6h18"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    {hasPendingOrders && (
                      <span className="absolute -top-[2px] -right-[2px] flex h-[8px] w-[8px]">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75 duration-1000"></span>
                        <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-brand-blue"></span>
                      </span>
                    )}
                  </div>
                </Link>
                {user && (
                  <button 
                    onClick={() => {
                      if (onToggleChat) onToggleChat();
                      else router.push('/chat');
                    }}
                    title="Live Chat" 
                    className="px-3 py-1.5 ml-1 rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-all relative group flex items-center gap-2 justify-center border border-brand-blue/20 shadow-sm shadow-brand-blue/5"
                  >
                    <div className="relative flex items-center justify-center">
                      <MessageCircleQuestion size={16} className={unreadChatCount > 0 ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''} />
                      {unreadChatCount > 0 && (
                        <span className="absolute -top-[2px] -right-[2px] flex h-[8px] w-[8px]">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 duration-1000"></span>
                          <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] font-medium hidden sm:block tracking-wide">Live Chat</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 sm:gap-2 border-r border-black/10 pr-2 sm:pr-4 shrink-0">
                <div className="hidden sm:block shrink-0">
                  <ThemeToggle />
                </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 z-50 relative shrink-0">
                 <div className="w-9 h-9 rounded-full bg-brand-surface/10 animate-pulse shrink-0"></div>
              </div>
            ) : (!user || isGuest || user?.role === 'guest') ? (
              <div className="flex items-center gap-1.5 sm:gap-3 z-50 relative shrink-0">
                <Link href="/auth/login" className="px-3 sm:px-[15px] py-[7px] rounded-[4px] text-[13px] sm:text-[14px] font-sans font-medium text-black hover:opacity-70 transition-opacity whitespace-nowrap">Log in</Link>
                <Link href="/auth/register" className="px-3 sm:px-[14px] py-[6px] rounded-[4px] bg-brand-blue border border-brand-blue text-white text-[12px] sm:text-[13px] font-sans font-medium hover:bg-brand-blue/90 transition-all whitespace-nowrap">Join</Link>
              </div>
            ) : isHomePage ? (
              <div onClick={() => router.push(`/u/${user?.username}`)} className="flex items-center gap-3 cursor-pointer group shrink-0">
                  <div className="text-right hidden xl:block shrink-0">
                      <div className="text-[14px] font-normal text-black font-sans leading-tight">{user?.name}</div>
                  </div>
                  <div className="w-7 h-7 md:w-9 md:h-9 shrink-0 rounded-full bg-black/10 overflow-hidden border border-black/15">
                      {user?.profilePicture ? (
                        <img src={getOptimizedUrl(user.profilePicture)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/50 font-bold">{user?.name?.[0]}</div>
                      )}
                  </div>
              </div>
            ) : null}
        </div>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </nav>
  );
};

export default React.memo(GlassNavbar);



