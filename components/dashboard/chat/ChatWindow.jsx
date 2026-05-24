"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Phone, Video, MoreVertical, User, X, Check, CheckCheck, Minus, RotateCcw, Smile, Download, FileText, Trash2, Clock } from "lucide-react";
import { MessageCircle } from "lucide-react";

const REACTION_EMOJIS = ["❤️", "😂", "👍", "😮", "😢"];

export default function ChatWindow({
  chat,
  messages = [],
  isLoadingMessages = false,
  currentUser,
  isOnline,
  isTyping,
  onSendMessage,
  onSendFile,
  onInitiateCall,
  onMinimize,
  onClose,
  onUnsendMessage,
  onReactMessage,
  onDeleteMessage,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);

  // Responsive header observer
  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setIsCompact(entry.contentRect.width < 450);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // No chat selected fallback (though handled by parent)
  if (!chat) return null;

  const otherUser = chat.participants?.find((p) => p._id !== currentUser?._id) || chat; // fallback if it's just a user object
  const avatar = otherUser.profilePicture || otherUser.avatar;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if (selectedFile) {
      onSendFile(selectedFile);
      handleRemoveFile();
    } else if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return "Offline";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Active just now";
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Active yesterday";
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    
    return `Active on ${date.toLocaleDateString()}`;
  };

  const statusText = isOnline ? "Online" : formatLastActive(otherUser.lastActiveAt);

  return (
    <div className="flex-1 flex flex-col bg-[#fafafa] dark:bg-black relative min-w-0 overflow-hidden w-full">
      
      {/* Header */}
      <div ref={headerRef} className={`h-20 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 z-10 min-w-0 overflow-hidden ${isCompact ? 'px-3' : 'px-6'}`}>
        <div className={`flex items-center min-w-0 pr-2 ${isCompact ? 'gap-2' : 'gap-4'}`}>
          <div className="relative shrink-0">
            <div className={`rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/5 ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}>
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <User size={20} className="text-slate-400" />
              )}
            </div>
            {isOnline && (
              <div className={`absolute bottom-0 right-0 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full ${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}></div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className={`font-bold text-slate-900 dark:text-white leading-tight truncate ${isCompact ? 'text-base' : 'text-lg'}`}>
              {otherUser.name || otherUser.username}
            </h2>
            <p className={`font-medium truncate ${isCompact ? 'text-[11px]' : 'text-[13px]'} ${isOnline ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}>
              {statusText}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center shrink-0 gap-1.5 px-2">
          {/* Audio & Video Call features temporarily disabled / hidden 
          <button 
            onClick={() => onInitiateCall(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Audio Call"
          >
            <Phone size={18} />
          </button>

          <button 
            onClick={() => onInitiateCall(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Video Call"
          >
            <Video size={18} />
          </button>
          */}

          {/* Minimize */}
          <button 
            onClick={onMinimize}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minus size={18} />
          </button>

          {/* Close Conversation */}
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Close Conversation"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
        {/* Loading Skeleton — only when no cached data exists */}
        {isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-col gap-5 opacity-100 transition-opacity duration-300">
            {/* Shimmer top line */}
            <div className="relative overflow-hidden mb-2">
              <div className="h-0.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full animate-pulse" />
              </div>
            </div>

            {/* Skeleton rows: incoming messages */}
            {[1, 0.7, 0.9].map((w, i) => (
              <div key={i} className="flex items-end gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0 animate-pulse" />
                <div className="flex flex-col gap-1.5" style={{ width: `${w * 55}%` }}>
                  <div className="h-10 rounded-2xl rounded-tl-sm bg-slate-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-3 w-12 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}

            {/* Skeleton rows: outgoing messages */}
            {[0.8, 0.5].map((w, i) => (
              <div key={`own-${i}`} className="flex items-end gap-3 justify-end">
                <div className="flex flex-col gap-1.5 items-end" style={{ width: `${w * 55}%` }}>
                  <div className="h-10 rounded-2xl rounded-tr-sm bg-slate-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-3 w-12 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}

            {/* One more incoming batch */}
            {[0.85, 0.6].map((w, i) => (
              <div key={`in2-${i}`} className="flex items-end gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0 animate-pulse" />
                <div className="flex flex-col gap-1.5" style={{ width: `${w * 55}%` }}>
                  <div className="h-10 rounded-2xl rounded-tl-sm bg-slate-200 dark:bg-white/10 animate-pulse" />
                  <div className="h-3 w-12 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}

            {/* Small loading label */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
            </div>
          </div>
        )}

        {/* Empty state — no messages AND not loading */}
        {!isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <MessageCircle size={28} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No messages yet. Say hello!</p>
          </div>
        )}

        {/* Actual Messages */}
        {messages.map((msg, idx) => {
          const isOwn = msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id;
          const hasReactions = msg.reactions && msg.reactions.length > 0;
          
          // Group reactions by emoji
          const reactionGroups = {};
          (msg.reactions || []).forEach(r => {
            const emoji = r.emoji;
            if (!reactionGroups[emoji]) reactionGroups[emoji] = 0;
            reactionGroups[emoji]++;
          });

          return (
            <div key={msg._id || idx} className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
              <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                
                <div className={`relative flex items-center gap-1.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Message Bubble */}
                  <div 
                    className={`relative px-5 py-3 text-[15px] leading-relaxed shadow-sm ${
                      msg.isUnsent
                        ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 italic border border-dashed border-slate-200 dark:border-white/10 rounded-2xl"
                        : isOwn 
                          ? "bg-black dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-sm" 
                          : "bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/5 text-slate-800 dark:text-gray-200 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {/* Image rendering */}
                    {!msg.isUnsent && msg.type === "image" && msg.fileUrl && (
                      <img 
                        src={msg.fileUrl} 
                        alt="attachment" 
                        className="max-w-[220px] rounded-xl mb-1 cursor-pointer"
                        onClick={() => window.open(msg.fileUrl, '_blank')}
                      />
                    )}

                    {/* File/document rendering */}
                    {!msg.isUnsent && msg.type === "file" && (
                      <a 
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 pr-2 rounded-xl group/file ${isOwn ? 'hover:opacity-80' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOwn ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                          <FileText size={18} className={isOwn ? 'text-white' : 'text-slate-600 dark:text-gray-300'} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate max-w-[150px] ${isOwn ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{msg.fileName || msg.content}</p>
                          <p className={`text-xs ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>Download file</p>
                        </div>
                        <Download size={14} className={isOwn ? 'text-white/60' : 'text-slate-400'} />
                      </a>
                    )}

                    {/* Text content */}
                    {(msg.type === "text" || !msg.type) && (
                      <span>{msg.isUnsent ? "This message was unsent" : msg.content}</span>
                    )}
                  </div>

                  {/* Hover Action Menu */}
                  {!msg.isUnsent && (
                    <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* React Button */}
                      <MessageHoverAction
                        icon={<Smile size={14} />}
                        tooltip="React"
                        popover={
                          <div className="flex items-center gap-1 p-1.5">
                            {REACTION_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => onReactMessage?.(msg._id, emoji)}
                                className="text-xl hover:scale-125 transition-transform p-0.5"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        }
                      />
                      {/* Delete Options Popover */}
                      {isOwn && (
                        <MessageHoverAction
                          icon={<Trash2 size={12} />}
                          tooltip="Delete Message"
                          popover={
                            <div className="flex flex-col p-1.5 min-w-[160px]">
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteMessage?.(msg._id); }}
                                className="text-left px-3 py-2 text-[13px] font-medium hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 flex items-center gap-2"
                              >
                                <Trash2 size={14} className="text-slate-400" />
                                Delete for me
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onUnsendMessage?.(msg._id); }}
                                className="text-left px-3 py-2 text-[13px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-red-500 flex items-center gap-2 mt-0.5"
                              >
                                <RotateCcw size={14} />
                                Delete for everyone
                              </button>
                            </div>
                          }
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Reaction Badges */}
                {hasReactions && (
                  <div className={`flex flex-wrap gap-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(reactionGroups).map(([emoji, count]) => (
                      <span 
                        key={emoji}
                        className="inline-flex items-center gap-0.5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-full px-2 py-0.5 text-[13px] shadow-sm cursor-pointer hover:-translate-y-0.5 transition-transform"
                        onClick={() => onReactMessage?.(msg._id, emoji)}
                        title="Click to react"
                      >
                        {emoji}{count > 1 && <span className="text-[11px] text-slate-500">{count}</span>}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`flex items-center gap-1.5 px-1 text-[11px] font-medium text-slate-400 dark:text-slate-500`}>
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isOwn && !msg.isUnsent && (() => {
                    if (msg.isPending) {
                      // Pending — Clock icon
                      return (
                        <span className="flex items-center">
                          <Clock size={13} className="text-slate-400 dark:text-slate-500" />
                        </span>
                      );
                    }

                    const isSeen = msg.readBy && msg.readBy.length > 0 &&
                      msg.readBy.some(id => {
                        const idStr = typeof id === 'object' ? id?._id?.toString() || id?.toString() : id?.toString();
                        return idStr && idStr !== currentUser?._id?.toString();
                      });
                    const isDelivered = isSeen || (msg.deliveredTo && msg.deliveredTo.length > 0);

                    if (isSeen) {
                      // ✓✓ Blue — Seen
                      return (
                        <span className="flex items-center">
                          <CheckCheck size={15} className="text-indigo-500" />
                        </span>
                      );
                    } else if (isDelivered) {
                      // ✓✓ Grey — Delivered
                      return (
                        <span className="flex items-center">
                          <CheckCheck size={15} className="text-slate-400 dark:text-slate-500" />
                        </span>
                      );
                    } else {
                      // ✓ Grey — Sent
                      return (
                        <span className="flex items-center">
                          <Check size={15} className="text-slate-400 dark:text-slate-500" />
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/5 px-5 py-4 rounded-2xl rounded-tl-sm w-fit">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 z-10 shrink-0 min-w-0 w-full overflow-hidden">
        
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-3">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-black/5 dark:border-white/10" />
            ) : (
              <div className="w-12 h-12 bg-slate-200 dark:bg-black rounded-xl flex items-center justify-center">
                <Paperclip size={20} className="text-slate-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-xs font-medium text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleRemoveFile} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500">
              <X size={16} />
            </button>
          </div>
        )}

        <div className={`flex items-end max-w-4xl mx-auto w-full ${isCompact ? 'gap-2' : 'gap-3'}`}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`shrink-0 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-gray-300 ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}
          >
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 min-w-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-4 py-1.5 focus-within:border-black dark:focus-within:border-white/30 focus-within:ring-1 focus-within:ring-black/5 dark:focus-within:ring-white/10 transition-all shadow-sm">
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!!selectedFile}
              className="w-full bg-transparent py-2.5 text-[15px] focus:outline-none text-slate-900 dark:text-white placeholder-gray-400 disabled:opacity-50 min-w-0"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim() && !selectedFile}
            className={`shrink-0 flex items-center justify-center rounded-full bg-black dark:bg-white hover:opacity-90 transition-opacity text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}
          >
            <Send size={18} className={isCompact ? 'ml-0.5' : 'ml-1'} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Hover action button with optional popover
function MessageHoverAction({ icon, tooltip, popover }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title={tooltip}
        className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm"
      >
        {icon}
      </button>
      {open && popover && (
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 whitespace-nowrap">
          {popover}
        </div>
      )}
    </div>
  );
}
