"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState } from "react";
import { Search, Plus, MessageCircle, User, X } from "lucide-react";

export default function ChatSidebar({
  currentUser,
  users = [],
  chats = [],
  onlineUsers = new Set(),
  selectedChat,
  onSelectUser,
  onSelectChat,
  onStartNewChat,
  onClose,
  onDeleteChat, // New prop for removing chat from list
  activeCallChatId,
  activeCallStatus,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Chats");

  const displayList = activeTab === "Chats" ? chats : users;

  const filteredList = displayList.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    
    if (activeTab === "Chats") {
      // For support chats, admin may not be in participants array, so find any participant
      const currentUserId = currentUser?._id;
      const otherUser = item.participants?.find(p => p._id !== currentUserId && p._id?.toString() !== currentUserId?.toString())
        ?? item.participants?.[0]; // fallback: show first participant for support chats
      if (!otherUser) return false;
      
      const name = otherUser.name?.toLowerCase() || "";
      const username = otherUser.username?.toLowerCase() || "";
      
      // Support searching with @ or just the name
      const searchClean = searchLower.startsWith("@") ? searchLower.slice(1) : searchLower;
      
      // If no search, show all chats
      if (!searchLower) return true;
      return name.includes(searchLower) || username.includes(searchClean);
    } else {
      // Directory search
      const name = item.name?.toLowerCase() || "";
      const username = item.username?.toLowerCase() || "";
      const searchClean = searchLower.startsWith("@") ? searchLower.slice(1) : searchLower;
      
      return name.includes(searchLower) || username.includes(searchClean);
    }
  }).sort((a, b) => {
    if (activeTab === "Chats") {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    }
    return 0;
  });

  return (
    <div className="h-full w-full bg-brand-surface/60 dark:bg-brand-dark/80 backdrop-blur-xl flex flex-col overflow-hidden relative">
      {loading && (
        <>
          <style>{`
            @keyframes chatProgressBar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-brand-surface/5 overflow-hidden z-50">
            <div 
              className="h-full bg-gradient-to-r from-[#111418] via-[#6A727C] to-[#111418] shadow-[0_0_10px_rgba(17,20,24,0.3)]"
              style={{
                width: '100%',
                animation: 'chatProgressBar 2s infinite ease-in-out',
              }}
            />
          </div>
        </>
      )}
      {/* Header */}
      <div className="px-4 pt-[3px] pb-3 border-b border-slate-200/50 dark:border-white/5 whitespace-nowrap mt-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[17px] font-bold tracking-tight text-slate-900">Messages</h1>
          <div className="flex items-center gap-1">
            {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
              <button
                onClick={onStartNewChat}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-brand-surface/10 rounded-full transition-colors text-slate-600"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-slate-500 hover:text-slate-700"
              title="Close Messenger"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-black/10 border border-slate-200/50 dark:border-white/10 focus:border-brand-blue/30 focus:bg-white/90 dark:focus:bg-black/20 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-md"
          />
        </div>
      </div>

      {/* Tabs */}
      {currentUser?.role === 'admin' && (
      <div className="flex px-2 pt-2 border-b border-brand-navy/[0.08]/50 dark:border-white/5 whitespace-nowrap">
        {[{ id: "Chats", label: "Chats" }, { id: "Directory", label: "Directory" }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 px-2 py-2">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(6)].map((_, idx) => (
              <div 
                key={idx} 
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-brand-cloud/30 dark:bg-brand-surface/[0.02] border border-slate-100 dark:border-white/5/50 dark:border-white/[0.03]"
              >
                {/* Avatar skeleton */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-brand-surface/10 border border-brand-navy/[0.08] dark:border-white/5" />
                </div>

                {/* Content skeleton */}
                <div className="flex-1 min-w-0 text-left space-y-2">
                  {/* Row 1: Name & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 bg-slate-200 dark:bg-brand-surface/10 rounded-lg w-28" />
                    <div className="h-3 bg-slate-200 dark:bg-brand-surface/5 rounded-lg w-10" />
                  </div>
                  
                  {/* Row 2: Message preview */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-3 bg-slate-200 dark:bg-brand-surface/[0.1]/80 dark:bg-brand-surface/5 rounded-lg w-44" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-brand-surface/5 flex items-center justify-center mb-3">
              <MessageCircle className="text-slate-400 dark:text-slate-500 dark:text-slate-400" size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nothing found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activeTab === "Directory" && currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin' ? (
              <div className="relative group">
                <button
                  onClick={() => onSelectUser({ _id: "support_channel", name: "Customer Support", username: "support", role: "admin", isSupportChat: true })}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-black/5"
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#E6E9ED] flex items-center justify-center overflow-hidden border border-[rgba(17,20,24,0.18)]">
                      <MessageCircle size={20} className="text-[#111418]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-[14px] font-bold text-slate-900 truncate">
                      Contact Customer Support
                    </h3>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">
                      Get help from our team
                    </p>
                  </div>
                </button>
              </div>
            ) : filteredList.map((item) => {
              const isChat = activeTab === "Chats";
              let targetUser = isChat 
                ? (item.participants?.find(p => p._id !== currentUser?._id) || item.participants[0]) 
                : item;

              if (!targetUser) return null;

              const isSelected = selectedChat && isChat ? selectedChat._id === item._id : false;
              const isOnline = onlineUsers.has(targetUser._id);
              const avatar = targetUser.profilePicture || targetUser.avatar;

              return (
                <div key={item._id} className="relative group">
                  <button
                    onClick={() => isChat ? onSelectChat(item) : onSelectUser(targetUser)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      isSelected
                        ? "bg-black/5 dark:bg-brand-surface/10"
                        : "hover:bg-black/5 dark:hover:bg-brand-surface/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                        {currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin' ? (
                           <img src="/codalina-logo.png" className="w-full h-full object-cover p-1.5" alt="Codalina" />
                        ) : avatar ? (
                          <img src={getOptimizedUrl(avatar)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User size={20} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0E7C86] border-2 border-white dark:border-[#0a0a0a] rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      {/* Row 1: Name & Time */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-[14px] truncate flex items-center gap-1.5 ${item.unreadCount > 0 ? "font-bold text-slate-900" : "font-bold text-slate-700"}`}>
                          {currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin' ? (
                            isChat && item.orderId ? (
                              <>Order Chat <span className="text-[10px] bg-slate-200/50 px-1.5 py-0.5 rounded-md text-slate-600">#{item.orderId.toString().toUpperCase()}</span></>
                            ) : isChat && item.isSupportChat ? (
                              "Codalina Support"
                            ) : (targetUser.name || targetUser.username || "Unknown")
                          ) : (
                            (targetUser.name || targetUser.username || "Unknown")
                          )}
                        </h3>
                        {isChat && item.lastMessage && (
                          <span className={`text-[11px] shrink-0 ${item.unreadCount > 0 ? "text-[#111418] font-bold" : "text-slate-500"}`}>
                            {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      
                      {/* Row 2: Message & Badge */}
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        {isChat ? (
                           <p className={`text-[13px] truncate flex-1 ${item._id === activeCallChatId ? "text-[#0E7C86] font-bold" : item.unreadCount > 0 ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                             {item._id === activeCallChatId ? `📞 ${activeCallStatus || "In call"}` : (item.lastMessage?.content || "No messages yet")}
                           </p>
                        ) : (
                           <p className="text-[12px] text-slate-500 truncate flex-1">
                             @{targetUser.username}
                           </p>
                        )}
                        
                        {isChat && item.unreadCount > 0 && (
                          <div className="shrink-0 w-5 h-5 bg-[#0E7C86] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-[#0E7C86]/20 animate-in zoom-in duration-300">
                            {item.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
