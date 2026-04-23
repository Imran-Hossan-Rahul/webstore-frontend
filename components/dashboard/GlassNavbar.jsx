"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  Menu, 
  MessageCircle, 
  Plus, 
  Command,
  Settings,
  LogOut,
  User,
  Sparkles,
  Layers,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import ProfileModal from "../DashboardComponents/ProfileModal";
import CreatorProfileModal from "../DashboardComponents/CreatorProfileModal";
import ChatModal from "./ChatModal";
import { getHasCreatorAccount } from "@/utils/api";
import NotificationDropdown from "./NotificationDropdown";
import Image from 'next/image';
import AIEnhanceButton from '../AIEnhanceButton';
import ThemeToggle from '../ThemeToggle';

export default function GlassNavbar({ toggleSidebar, onOpenCreatePost, searchQuery, setSearchQuery, isGuest = false, onRequireAuth }) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [hasCreatorAccount, setHasCreatorAccount] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  // State for user data
  const [userData, setUserData] = useState({
      name: "User",
      avatar: null,
      plan: "Member"
  });

  useEffect(() => {
    const initNavbar = async () => {
        // Fetch real user profile
        try {
            const res = await api.get('/user/profile');
            // Logic: api.js returns the payload directly ({ success: true, data: {...} })
            if (res.success) {
                const u = res.data;
                let avatar = u.profilePicture; // Try user profile first
                
                // If avatar is missing but user is a creator, try fetching creator profile (Robust fallback like ProfileModal)
                if (!avatar && u.hasCreatorAccount) {
                    try {
                        const creatorRes = await api.get("/creator/profile");
                        if (creatorRes.success && creatorRes.data?.profilePicture) {
                            avatar = creatorRes.data.profilePicture;
                        }
                    } catch (e) {
                         console.error("Failed to fetch creator profile for navbar fallback", e);
                    }
                }

                setUserData({
                    name: u.name,
                    avatar: avatar, 
                    plan: u.hasCreatorAccount ? "Creator" : "Member"
                });
                setHasCreatorAccount(u.hasCreatorAccount);
            }
        } catch (err) {
            console.error("Failed to fetch navbar user data", err);
        }
    };
    if (isGuest) return; // Skip auth fetch for guests
    initNavbar();
  }, [isGuest]);

  // Listen for open chat event
  useEffect(() => {
    const handleOpenChat = (e) => {
      setShowChatModal(true);
    };
    
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCreateDropdown && !e.target.closest('.create-dropdown-container')) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreateDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hasCreatorAccount");
    window.location.reload();
  };

  const handleSearch = () => {
    if (searchQuery && searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-[1800px] mx-auto bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-b-2xl shadow-lg shadow-black/5 px-4 h-[64px] flex items-center">
        
        {/* Left: Logo & Toggle */}
        <div className="flex items-center gap-4">
            <button 
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
            
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
                    A
                </div>
                <span className="font-bold text-xl tracking-tight hidden sm:block text-gray-900 dark:text-white">
                    Amr<span className="text-purple-600">Platform</span>
                </span>
            </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center px-4">
        <div className={`hidden md:flex w-full max-w-lg items-center bg-gray-100/50 dark:bg-white/5 border ${searchFocused ? 'border-[#00BCD4] bg-white dark:bg-black' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'} rounded-xl px-3 h-10 transition-all duration-200`}>
            <button 
                onClick={handleSearch}
                className="hover:scale-110 transition-transform"
            >
                <Search className={`w-4 h-4 ${searchFocused ? 'text-[#00BCD4]' : 'text-gray-400'} mr-2`} />
            </button>
            
            <div className="mr-2">
                <AIEnhanceButton 
                   text={searchQuery} 
                   placement="bottom"
                   onUpdate={(val) => setSearchQuery && setSearchQuery(val)}
                   className=""
                />
            </div>

            <input 
                type="text" 
                placeholder="Search resources, creators, tags..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-white placeholder:text-gray-400"
                value={searchQuery !== undefined ? searchQuery : ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-[10px] font-medium text-gray-400">
                <Command className="w-3 h-3" />
                <span>K</span>
            </div>
        </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Create button with dropdown — visible only to creators */}
            {hasCreatorAccount && (
              <div className="relative create-dropdown-container">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="hidden sm:flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-black/20 dark:shadow-white/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>

                {/* Dropdown Menu */}
                {showCreateDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <Link
                      href="/upload"
                      onClick={() => setShowCreateDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">Create Template</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Upload a new template</div>
                      </div>
                    </Link>
                    <Link
                      href="/blog-editor"
                      onClick={() => setShowCreateDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">Create Blog</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Write a new article</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Icons — chat and notifications hidden temporarily */}
            <div className="flex items-center gap-1 sm:gap-2 border-r border-gray-200 dark:border-white/10 pr-4 mr-0 sm:mr-2">
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>
            </div>

            {/* Profile — guests see Login/Signup, authenticated users see avatar */}
            {isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                >
                  Sign up free
                </button>
              </div>
            ) : (
            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 cursor-pointer group"
            >
                <div className="text-right hidden xl:block">
                    <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{userData.name}</div>
                    <div className="text-xs text-purple-600 font-bold mt-0.5 flex items-center justify-end gap-1">
                        <Sparkles className="w-3 h-3" /> {userData.plan}
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 p-[2px] hover:ring-2 ring-purple-500 transition-all">
                    <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden relative">
                         {userData.avatar ? (
                             <img 
                                src={userData.avatar} 
                                alt={userData.name} 
                                className="w-full h-full object-cover" 
                             />
                         ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-lg">
                                 {userData.name?.[0] || 'U'}
                             </div>
                         )}
                    </div>
                </div>
            </div>
            )}

            {/* Mobile menu trigger could come here if needed, keeping it simple for verification */}
        </div>

      </div>

      {/* Profile Modals */}
      {hasCreatorAccount ? (
        <CreatorProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
        />
      ) : (
        <ProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
          verifiedHasCreatorAccount={hasCreatorAccount}
        />
      )}

      {/* Chat Modal */}
      <ChatModal 
        isOpen={showChatModal} 
        onClose={() => setShowChatModal(false)}
      />
    </nav>
  );
}
