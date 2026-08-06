"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Send, Paperclip, Phone, Video, MoreVertical, User, X, Check, CheckCheck, Minus, RotateCcw, Smile, Download, FileText, Trash2, Clock, ArrowUp, Plus } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import AppleSpinner from "@/components/ui/AppleSpinner";

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
  onBack,
  isFullScreen = false,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [virtualGreetingDeleted, setVirtualGreetingDeleted] = useState(false);
  const [virtualGreetingReactions, setVirtualGreetingReactions] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  const displayMessages = useMemo(() => {
    if (isLoadingMessages || currentUser?.role === 'admin' || virtualGreetingDeleted) return messages;

    const adminParticipant = chat?.participants?.find(p => p.role === 'admin' || p.role === 'superadmin');
    
    const virtualMsg = {
      _id: 'virtual-greeting',
      sender: adminParticipant || 'admin',
      content: "Hi, I'm Imran! 👋\nHow can I help you today?",
      type: "text",
      createdAt: chat?.createdAt || new Date().toISOString(),
      reactions: virtualGreetingReactions,
      isVirtual: true
    };
    
    return [virtualMsg, ...messages];
  }, [messages, isLoadingMessages, currentUser, chat, virtualGreetingDeleted, virtualGreetingReactions]);
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
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Active ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Active on ${date.toLocaleDateString()}`;
  };

  const statusText = isOnline ? "Online" : formatLastActive(otherUser.lastActiveAt);


  const handleReactMessage = (msgId, emoji) => {
    if (msgId === 'virtual-greeting') {
      setVirtualGreetingReactions(prev => {
        // Simple toggle for virtual message
        if (prev.some(r => r.emoji === emoji)) return prev.filter(r => r.emoji !== emoji);
        return [...prev, { emoji, userId: currentUser?._id }];
      });
      return;
    }
    onReactMessage?.(msgId, emoji);
  };

  return (
    <div ref={headerRef} className="flex-1 flex flex-col bg-[#fafafa] dark:bg-black relative min-w-0 overflow-hidden w-full h-full">
      
      {/* Floating Action Buttons */}
      {!isFullScreen && (
        <>
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-md text-[#0071e3] transition-colors shadow-sm border border-black/5 dark:border-white/10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
          </div>
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={onMinimize}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-md text-[#86868b] hover:text-black dark:hover:text-white transition-colors shadow-sm border border-black/5 dark:border-white/10"
              title="Minimize"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </>
      )}

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-6 px-[14px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
        
        {/* Profile Info Header in Chat Body (iOS iMessage style) */}
        <div className="flex flex-col items-center justify-center pt-0 pb-0 mb-6 select-none animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mb-2.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-[#2c2c2e] flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-black/5 dark:border-white/10">
              {avatar ? (
                <img src={getOptimizedUrl(avatar, 150)} className="w-full h-full object-cover" alt="" />
              ) : (
                <User size={32} className="text-[#86868b]" />
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-[2.5px] border-[#fafafa] dark:border-black rounded-full shadow-sm"></div>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white tracking-tight">
            {otherUser.name || otherUser.username}
          </h2>
          <p className="text-[12px] text-[#86868b] dark:text-[#98989d] mt-0.5 tracking-tight">
            Codalina Support
          </p>
        </div>

        {/* Loading Spinner — only when no cached data exists */}
        {isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-100 transition-opacity duration-300 mt-10">
            <AppleSpinner size={28} className="text-[#0071e3]" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading messages...</p>
          </div>
        )}



        {/* Empty state — for Admins */}
        {!isLoadingMessages && messages.length === 0 && currentUser?.role === 'admin' && (
          <div className="flex flex-col pb-4">
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40 mt-10">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <MessageCircle size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No messages yet. Say hello!</p>
            </div>
          </div>
        )}

        {/* Actual Messages */}
        {displayMessages.map((msg, idx) => {
          const isOwn = msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id;
          const hasReactions = msg.reactions && msg.reactions.length > 0;
          
          // Group reactions by emoji
          const reactionGroups = {};
          (msg.reactions || []).forEach(r => {
            const emoji = r.emoji;
            if (!reactionGroups[emoji]) reactionGroups[emoji] = 0;
            reactionGroups[emoji]++;
          });

          const nextMsg = displayMessages[idx + 1];
          const currentSenderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
          const nextSenderId = typeof nextMsg?.sender === 'object' ? nextMsg?.sender?._id : nextMsg?.sender;
          const isLastInGroup = !nextMsg || currentSenderId !== nextSenderId;

          let senderObj = null;
          if (isOwn) {
            senderObj = currentUser;
          } else {
            senderObj = chat?.participants?.find(p => p._id === currentSenderId);
          }

          return (
            <div key={msg._id || idx} className={`flex ${isOwn ? "justify-end" : "justify-start"} group mb-${isLastInGroup ? '3' : '1'}`}>
              <div className={`flex flex-col gap-1 max-w-[90%] md:max-w-[85%] ${isOwn ? "items-end" : "items-start"}`}>
                
                <div className={`relative flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {isLastInGroup ? (
                    <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      {senderObj?.profilePicture ? (
                        <img src={getOptimizedUrl(senderObj.profilePicture, 100)} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      )}
                    </div>
                  ) : (
                    <div className="w-7 h-7 shrink-0" />
                  )}

                  <div 
                    className={`relative text-[15px] font-sans tracking-tight leading-snug shadow-sm ${
                      !msg.isUnsent && msg.type === "image"
                        ? "p-0 bg-transparent shadow-none"
                        : `px-4 py-2.5 ${
                            msg.isUnsent
                              ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 italic border border-dashed border-slate-200 dark:border-white/10 rounded-2xl"
                              : isOwn 
                                ? `bg-[#0071e3] text-white rounded-[20px] ${isLastInGroup ? 'rounded-br-[4px]' : ''} shadow-sm` 
                                : `bg-[#e5e5ea] dark:bg-[#2c2c2e] text-black dark:text-white rounded-[20px] ${isLastInGroup ? 'rounded-bl-[4px]' : ''} shadow-sm`
                          }`
                    }`}
                  >
                    {/* Image rendering */}
                    {!msg.isUnsent && msg.type === "image" && msg.fileUrl && (
                      <img 
                        src={msg.fileUrl} 
                        alt="attachment" 
                        className="max-w-[220px] rounded-[18px] mb-1 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => { setFullScreenImage(msg.fileUrl); setZoom(1); }}
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
                                onClick={() => handleReactMessage(msg._id, emoji)}
                                className="text-xl hover:opacity-80 transition-opacity p-0.5"
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
                        className="inline-flex items-center gap-0.5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-full px-2 py-0.5 text-[13px] shadow-sm cursor-pointer hover:-translate-y-0.5 transition-opacity"
                        onClick={() => handleReactMessage(msg._id, emoji)}
                        title="Click to react"
                      >
                        {emoji}{count > 1 && <span className="text-[11px] text-slate-500">{count}</span>}
                      </span>
                    ))}
                  </div>
                )}

                {isLastInGroup && (
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
                )}
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
      <div className="p-3 md:p-4 bg-white/70 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 z-10 shrink-0 min-w-0 w-full overflow-hidden">
        
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-3">
            {filePreview ? (
              <img src={getOptimizedUrl(filePreview)} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-black/5 dark:border-white/10" />
            ) : (
              <div className="w-12 h-12 bg-slate-200 dark:bg-black rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-slate-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight truncate">{selectedFile.name}</p>
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
            className={`shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#2c2c2e] hover:bg-slate-200 dark:hover:bg-[#3a3a3c] transition-colors text-[#86868b] dark:text-[#98989d] ${isCompact ? 'w-8 h-8 mb-1' : 'w-9 h-9 mb-1'}`}
          >
            <Plus size={isCompact ? 16 : 20} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 min-w-0 bg-white dark:bg-[#1c1c1e] border border-slate-300 dark:border-white/10 rounded-full flex items-center pl-4 pr-1 py-1 transition-colors shadow-sm">
            <input
              type="text"
              placeholder="iMessage"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 min-w-0 bg-transparent outline-none border-none text-slate-900 dark:text-white placeholder:text-[#86868b] font-sans tracking-tight text-[15px] py-1.5"
            />
            
            <button 
              onClick={handleSend}
              disabled={!newMessage.trim() && !selectedFile}
              className={`shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full transition-all ml-2 ${
                (newMessage.trim() || selectedFile)
                  ? "bg-[#0071e3] text-white hover:scale-105 shadow-sm"
                  : "bg-slate-100 dark:bg-[#2c2c2e] text-slate-300 dark:text-[#48484a]"
              }`}
            >
              <ArrowUp size={16} strokeWidth={3} className={(newMessage.trim() || selectedFile) ? "" : "opacity-50"} />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image View */}
      {fullScreenImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors backdrop-blur-md z-50"
            onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }}
          >
            <X size={20} />
          </button>
          
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom Controls */}
                <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-[#1c1c1e]/80 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 z-50 shadow-2xl">
                  <button 
                    onClick={(e) => { e.stopPropagation(); zoomOut(); }} 
                    className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                    title="Zoom Out"
                  >
                    <Minus size={22} strokeWidth={1.5} />
                  </button>
                  <div className="w-[1px] h-5 bg-white/20 mx-1"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetTransform(); }} 
                    className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                    title="Reset Zoom"
                  >
                    <RotateCcw size={20} strokeWidth={1.5} />
                  </button>
                  <div className="w-[1px] h-5 bg-white/20 mx-1"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); zoomIn(); }} 
                    className="w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                    title="Zoom In"
                  >
                    <Plus size={22} strokeWidth={1.5} />
                  </button>
                </div>

                <div 
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  onClick={(e) => {
                    // Close if clicked exactly on the background overlay
                    if (e.target.tagName !== 'IMG' && !e.target.closest('button')) {
                      setFullScreenImage(null);
                    }
                  }}
                >
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <img
                      src={fullScreenImage}
                      alt="Fullscreen view"
                      className="max-w-full max-h-[100vh] sm:max-h-[90vh] object-contain cursor-grab active:cursor-grabbing pointer-events-auto"
                      style={{ WebkitUserDrag: 'none' }} // Prevent default browser image drag
                    />
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        </div>,
        document.body
      )}
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
