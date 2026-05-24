"use client";

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
      // Find the other participant to check their name/username
      const otherUser = item.participants?.find(p => p._id !== currentUser?._id);
      if (!otherUser) return false;
      
      const name = otherUser.name?.toLowerCase() || "";
      const username = otherUser.username?.toLowerCase() || "";
      
      // Support searching with @ or just the name
      const searchClean = searchLower.startsWith("@") ? searchLower.slice(1) : searchLower;
      
      return name.includes(searchLower) || username.includes(searchClean);
    } else {
      // Directory search
      const name = item.name?.toLowerCase() || "";
      const username = item.username?.toLowerCase() || "";
      const searchClean = searchLower.startsWith("@") ? searchLower.slice(1) : searchLower;
      
      return name.includes(searchLower) || username.includes(searchClean);
    }
  });

  return (
    <div className="h-full w-full bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col overflow-hidden relative">
      {loading && (
        <>
          <style>{`
            @keyframes chatProgressBar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-white/5 overflow-hidden z-50">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
              style={{
                width: '100%',
                animation: 'chatProgressBar 2s infinite ease-in-out',
              }}
            />
          </div>
        </>
      )}
      {/* Header */}
      <div className="p-5 border-b border-slate-200/50 dark:border-white/5 whitespace-nowrap">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Messages</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onStartNewChat}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-gray-300"
              title="New Chat"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400"
              title="Close Messenger"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-slate-300 dark:focus:border-white/20 rounded-xl text-sm focus:outline-none transition-all dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 border-b border-slate-200/50 dark:border-white/5 whitespace-nowrap">
        {["Chats", "Directory"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === tab
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 px-2 py-2">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(6)].map((_, idx) => (
              <div 
                key={idx} 
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50/30 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/[0.03]"
              >
                {/* Avatar skeleton */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/5" />
                </div>

                {/* Content skeleton */}
                <div className="flex-1 min-w-0 text-left space-y-2">
                  {/* Row 1: Name & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-28" />
                    <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-lg w-10" />
                  </div>
                  
                  {/* Row 2: Message preview */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-3 bg-slate-200/80 dark:bg-white/5 rounded-lg w-44" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <MessageCircle className="text-slate-400 dark:text-slate-500" size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nothing found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredList.map((item) => {
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
                        ? "bg-black/5 dark:bg-white/10"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/5">
                        {avatar ? (
                          <img src={avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User size={20} className="text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      {/* Row 1: Name & Time */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-[14px] truncate ${item.unreadCount > 0 ? "font-bold text-black dark:text-white" : "font-bold text-slate-900 dark:text-gray-100"}`}>
                          {targetUser.name || targetUser.username || "Unknown"}
                        </h3>
                        {isChat && item.lastMessage && (
                          <span className={`text-[11px] shrink-0 ${item.unreadCount > 0 ? "text-indigo-600 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
                            {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      
                      {/* Row 2: Message & Badge */}
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        {isChat ? (
                           <p className={`text-[13px] truncate flex-1 ${item._id === activeCallChatId ? "text-green-500 font-bold" : item.unreadCount > 0 ? "text-slate-900 dark:text-gray-100 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
                             {item._id === activeCallChatId ? `📞 ${activeCallStatus || "In call"}` : (item.lastMessage?.content || "No messages yet")}
                           </p>
                        ) : (
                           <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate flex-1">
                             @{targetUser.username}
                           </p>
                        )}
                        
                        {isChat && item.unreadCount > 0 && (
                          <div className="shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 animate-in zoom-in duration-300">
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
