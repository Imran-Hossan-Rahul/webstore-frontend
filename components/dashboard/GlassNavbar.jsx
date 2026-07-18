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
  ChevronDown,
  X,
} from "lucide-react";
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
      <div className="max-w-[1800px] mx-auto bg-white/40 md:bg-white/80 dark:bg-[#0a0a0a]/60 md:dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/60 dark:border-white/10 pl-[7px] pr-[10px] h-[64px] flex items-center justify-between shadow-sm relative overflow-visible">
        
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
                <div className="relative flex-shrink-0">
                   <button 
                     type="button"
                     onClick={(e) => { 
                       e.preventDefault(); 
                       setIsDropdownOpen(!isDropdownOpen); 
                       document.getElementById('mobile-search-input')?.focus();
                     }}
                     className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase transition-colors"
                   >
                     {searchType === 'all' ? 'All' : searchType} <ChevronDown className="w-3 h-3" />
                   </button>
                   
                   <AnimatePresence>
                     {isDropdownOpen && (
                       <motion.div
                         initial={{ opacity: 0, y: -5 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -5 }}
                         transition={{ duration: 0.15, ease: "easeOut" }}
                         className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[110]"
                       >
                         {['all', 'posts', 'artifacts', 'codex', 'jobs', 'challenges', 'marketplace', 'workspace', 'proposals', 'saved'].map((type) => (
                           <button
                             key={type}
                             onClick={(e) => { 
                               e.preventDefault();
                               e.stopPropagation();
                               setSearchType(type); 
                               setIsDropdownOpen(false); 
                               document.getElementById('mobile-search-input')?.focus();
                             }}
                             className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${searchType === type ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                           >
                             {type === 'posts' ? 'Devlogs' : type}
                           </button>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

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
            className={`md:hidden flex w-full max-w-[200px] items-center justify-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-transparent rounded-full px-4 h-9 transition-colors ml-2 transition-opacity duration-200 ${mobileSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <img src="/logo.png" alt="Codalina" className="w-5 h-5 object-contain" />
            <span className="text-[13px] font-semibold font-sans text-black dark:text-white">Search Codalina</span>
          </button>

          <div className={`hidden md:flex w-full max-w-lg items-center bg-slate-50 dark:bg-white/5 border ${searchFocused ? 'border-slate-900 dark:border-white bg-white dark:bg-slate-900 shadow-sm' : 'border-slate-200 dark:border-white/10'} rounded-xl px-3 h-10 transition-all duration-200 relative`}>
              <Search strokeWidth={1.5} className={`w-4 h-4 ${searchFocused ? 'text-slate-900 dark:text-white' : 'text-slate-400'} mr-2`} />
              <input 
                  id="desktop-search-input"
                  type="text" 
                  placeholder="Search Codalina..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white font-medium font-sans"
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
              
              <div 
                className="relative hidden lg:flex flex-shrink-0"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                 <button 
                   type="button"
                   onClick={(e) => { 
                     e.preventDefault(); 
                     if (!isDropdownOpen) setIsDropdownOpen(true); 
                     document.getElementById('desktop-search-input')?.focus();
                   }}
                   className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase transition-colors"
                 >
                   {searchType === 'all' ? 'All' : searchType} <ChevronDown className="w-3 h-3" />
                 </button>
                 
                 <AnimatePresence>
                   {isDropdownOpen && (
                     <motion.div
                       initial={{ opacity: 0, y: -5, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: -5, scale: 0.95 }}
                       transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
                       className="absolute right-0 top-[calc(100%+8px)] w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[110]"
                     >
                       {['all', 'posts', 'artifacts', 'codex', 'jobs', 'challenges', 'marketplace', 'workspace', 'proposals', 'saved'].map((type) => (
                         <button
                           key={type}
                           onClick={(e) => { 
                             e.preventDefault();
                             setSearchType(type); 
                             setIsDropdownOpen(false); 
                             document.getElementById('desktop-search-input')?.focus();
                           }}
                           className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${searchType === type ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                         >
                           {type === 'posts' ? 'Devlogs' : type}
                         </button>
                       ))}
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

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
            {!isGuest && user?.hasCraftsmanAccount && !pathname?.startsWith("/market") && (
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

            <div className="flex items-center gap-1 sm:gap-2 border-r border-slate-200 dark:border-white/10 pr-2 sm:pr-4">
                
                {!isGuest && (
                  <>
                    <button onClick={onToggleChat} className="p-1 sm:p-2 rounded-xl text-black hover:text-black dark:text-white transition-all relative">
                        <MessageCircle strokeWidth={1.5} className="w-5 h-5" />
                        {unreadChatCount > 0 && (
                          <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-mono font-medium rounded-full flex items-center justify-center leading-none">
                            {unreadChatCount}
                          </span>
                        )}
                    </button>
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
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/auth/login" className="px-2 sm:px-3 py-1.5 text-[11px] font-mono font-bold text-black dark:text-white hover:opacity-60 transition-opacity uppercase tracking-wider">Log in</Link>
                <Link href="/auth/register" className="px-4 sm:px-5 py-1.5 text-[11px] font-mono font-bold border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white rounded-lg transition-colors uppercase tracking-wider">Join</Link>
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



