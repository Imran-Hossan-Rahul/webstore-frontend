"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import { webrtcManager } from "@/utils/webrtcManager";
import { MessageCircle, X, Phone, PhoneOff } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import CallInterface from "./CallInterface";
import DraggableResizableWindow from "./DraggableResizableWindow";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AppleSpinner from "@/components/ui/AppleSpinner";

/**
 * ChatModal
 * A floating, detached chat system.
 * Left (List) and Right (Conversation) are separate draggable units.
 */
export default function ChatModal({ isOpen, onClose, initialUserId, showList = true }) {
  const { isGuest, requireAuth, user: contextUser } = useContext(DashboardContext) || {};
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  // Message cache: chatId â†’ messages[] â€” so switching chats shows instant data
  const messageCacheRef = useRef(new Map());
  const activeChatIdRef = useRef(null);

  // Sync props to internal state for backwards compatibility
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsOpenInternal(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("openChatOnLoad") === "true") {
      sessionStorage.removeItem("openChatOnLoad");
      // Wait for initialization
      setTimeout(() => setIsOpenInternal(true), 1500);
    }
  }, []);
  
  const isModalOpen = isOpen !== undefined ? isOpen : isOpenInternal;

  const logCallMessage = async (statusLabel, currentCallData, isVideo, startTime) => {
    if (!currentCallData || !currentUser) return;
    // Only the caller logs the message to prevent duplicates
    if (currentCallData.callerId !== currentUser._id) return;

    let durationStr = "";
    if (startTime) {
       const durationSec = Math.floor((Date.now() - startTime) / 1000);
       const m = Math.floor(durationSec / 60).toString().padStart(2, '0');
       const s = (durationSec % 60).toString().padStart(2, '0');
       durationStr = ` (${m}:${s})`;
    }

    const content = `ðŸ“ž ${isVideo ? 'Video' : 'Audio'} call ${statusLabel}${durationStr}`;
    try {
      const res = await api.post(`/chat/message/${currentCallData.chatId}`, {
        content,
        type: "text"
      });
      // Backend automatically broadcasts this to both participants
    } catch (e) {
      console.error("Failed to log call", e);
    }
  };

  useEffect(() => {
    activeChatIdRef.current = (isModalOpen && selectedChat) ? selectedChat._id : null;
  }, [isModalOpen, selectedChat]);

  // Persist "seen" on the server whenever the panel is opened, so the navbar dot
  // stays cleared after a refresh until a genuinely newer message arrives.
  useEffect(() => {
    if (!isModalOpen || !currentUser) return;
    api.put("/chat/seen")
      .then(() => window.dispatchEvent(new CustomEvent('chat-count-update', { detail: { count: 0 } })))
      .catch((e) => console.error("Failed to record chat seen", e));
  }, [isModalOpen, currentUser?._id]);

  useEffect(() => {
    const handleToggleChatEvent = () => {
      setIsOpenInternal((prev) => {
        const nextState = !prev;
        if (nextState) {
          window.dispatchEvent(new CustomEvent('chat-count-update', { detail: { count: 0 } }));
        }
        return nextState;
      });
    };

    const handleOpenChatEvent = async (event) => {
      const targetUserId = event.detail?.userId;
      setIsOpenInternal(true);
      
      // Clear the navbar badge count when opening the modal
      window.dispatchEvent(new CustomEvent('chat-count-update', { detail: { count: 0 } }));

      if (targetUserId) {
        setActiveUserId(targetUserId);
        // Load the chat immediately if currentUser is ready
        if (currentUser) {
          try {
            const res = await api.get(`/chat/chat/${targetUserId}`);
            if (res.success && res.chat) {
              setSelectedChat(res.chat);
              setChats(prev => !prev.some(c => c._id === res.chat._id) ? [res.chat, ...prev] : prev);
            }
          } catch (e) {
            console.error("Failed to load user chat from event", e);
          }
        }
      }
    };

    const handleOpenSupportChatEvent = async () => {
      setIsOpenInternal(true);
      setShowGreeting(false);
      window.dispatchEvent(new CustomEvent('chat-count-update', { detail: { count: 0 } }));

      if (currentUser?.role !== 'admin' && !selectedChat) {
        try {
          const res = await api.get("/chat/support");
          if (res.success && res.chat) {
            setSelectedChat(res.chat);
          }
        } catch (e) {
          console.error("Failed to fetch support chat from event", e);
        }
      }
    };

    const handleOpenOrderRoomEvent = async (event) => {
      const orderId = event.detail?.orderId;
      if (!orderId) return;
      try {
        const res = await api.get(`/chat/order/${orderId}`);
        if (res.success && res.chat) {
          setSelectedChat(res.chat);
          setChats((prev) => (prev.some((c) => c._id === res.chat._id) ? prev : [res.chat, ...prev]));
        }
      } catch (e) {
        console.error("Failed to open order room", e);
      }
      setShowGreeting(false);
      setIsOpenInternal(true);
    };

    window.addEventListener("toggle-chat", handleToggleChatEvent);
    window.addEventListener("open-chat", handleOpenChatEvent);
    window.addEventListener("open-support-chat", handleOpenSupportChatEvent);
    window.addEventListener("open-order-room", handleOpenOrderRoomEvent);

    return () => {
      window.removeEventListener("toggle-chat", handleToggleChatEvent);
      window.removeEventListener("open-chat", handleOpenChatEvent);
      window.removeEventListener("open-support-chat", handleOpenSupportChatEvent);
      window.removeEventListener("open-order-room", handleOpenOrderRoomEvent);
    };
  }, [currentUser, selectedChat]);

  const handleClose = () => {
    setIsOpenInternal(false);
    if (onClose) onClose();
  };

  // Removed auto-fetch support chat so customers can see the sidebar and choose their chats

  // Call State
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [showIncomingToast, setShowIncomingToast] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);

  // 1. Initial Data Fetch (Runs once on mount or when contextUser changes)
  useEffect(() => {
    const initialize = async () => {
      if (!contextUser) return;
      if (currentUser && currentUser._id === contextUser._id) return;
      
      try {
        setLoading(true);
        setCurrentUser(contextUser);
        
        let newUsers = [];
        let newChats = [];

        if (contextUser.role !== 'guest') {
          const [usersRes, chatsRes] = await Promise.all([
            api.get("/chat/users"),
            api.get("/chat/chats"),
          ]);
          newUsers = usersRes.users || [];
          newChats = chatsRes.chats || [];
        } else {
          // Guests only fetch their chats (to get support chat history for the popup)
          try {
            const chatsRes = await api.get("/chat/chats");
            newChats = chatsRes.chats || [];
          } catch (e) { console.error("Guest chat fetch failed", e); }
        }

        setUsers(newUsers);
        setChats(newChats);
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [contextUser, currentUser]);

  // 1.5 Socket Connection & Online Tracking (Runs when currentUser is ready)
  useEffect(() => {
    if (!currentUser) return;

    // Immediately emit online status so backend can broadcast and send back online list
    socket.emit("user:online", currentUser._id);

    const handleConnect = () => {
      // Re-emit online status if socket disconnects and reconnects later
      socket.emit("user:online", currentUser._id);
    };

    const handleUserStatus = ({ userId, status, lastActiveAt }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        status === "online" ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
      
      if (lastActiveAt) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, lastActiveAt } : u));
        setChats(prev => prev.map(c => ({
          ...c,
          participants: c.participants.map(p => p._id === userId ? { ...p, lastActiveAt } : p)
        })));
      }
    };

    const handleOnlineList = (onlineIds) => {
      setOnlineUsers(new Set(onlineIds));
    };

    socket.on("connect", handleConnect);
    socket.on("user:status", handleUserStatus);
    socket.on("users:onlineList", handleOnlineList);
    
    return () => {
      socket.off("connect", handleConnect);
      socket.off("user:status", handleUserStatus);
      socket.off("users:onlineList", handleOnlineList);
    };
  }, [currentUser]);

  // 2. Chat Selection & Room Join
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    // Set global active chat for notification muting
    window.activeChatId = selectedChat?._id || null;

    // Show cached messages instantly if available, otherwise blank + loading
    const cached = messageCacheRef.current.get(selectedChat._id);
    if (cached && cached.length > 0) {
      setMessages(cached);
      setIsLoadingMessages(false);
    } else {
      setMessages([]);
      setIsLoadingMessages(true);
    }

    socket.emit("chat:join", selectedChat._id);

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${selectedChat._id}`);
        const fetched = res.messages || [];
        // Update cache and state
        messageCacheRef.current.set(selectedChat._id, fetched);
        setMessages(fetched);
        await api.put(`/chat/read/${selectedChat._id}`);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();

    const handleNewMessage = async (message) => {
      if (message.sender?._id !== currentUser._id && message.sender !== currentUser._id) {
        setMessages((prev) => {
          const updated = [...prev, message];
          // Keep cache fresh
          messageCacheRef.current.set(selectedChat._id, updated);
          return updated;
        });
        updateChatSnippet(selectedChat._id, message);
        // Fix 1: Immediately mark as read so sender receives message:seen
        if (activeChatIdRef.current === selectedChat._id) {
          try {
            await api.put(`/chat/read/${selectedChat._id}`);
          } catch (e) {
            console.error("Failed to mark new message as read:", e);
          }
        }
      }
    };

    const handleTyping = ({ userId, typing }) => {
      if (userId !== currentUser._id) setIsTyping(typing);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleTyping);

    // Clear unread count when chat is opened
    setChats(prev => prev.map(c => c._id === selectedChat._id ? { ...c, unreadCount: 0 } : c));

    return () => {
      socket.emit("chat:leave", selectedChat._id);
      window.activeChatId = null;
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleTyping);
    };
  }, [selectedChat, currentUser]);

  // 2.5 Handle initialUserId selection
  const effectiveUserId = initialUserId || activeUserId;
  useEffect(() => {
    const handleInitialUser = async () => {
      if (!effectiveUserId || !currentUser) return;
      try {
        const res = await api.get(`/chat/chat/${effectiveUserId}`);
        if (res.success && res.chat) {
          setSelectedChat(res.chat);
          setChats(prev => !prev.some(c => c._id === res.chat._id) ? [res.chat, ...prev] : prev);
        }
      } catch (e) {
        console.error("Failed to load initial user chat", e);
      }
    };
    handleInitialUser();
  }, [effectiveUserId, currentUser]);

  // 3. Global Listeners
  useEffect(() => {
    if (!currentUser) return;

    const handleGlobalMessage = ({ chatId, message }) => {
      updateChatSnippet(chatId, message);
      // Add to cache so it shows instantly when opening the chat
      const cached = messageCacheRef.current.get(chatId) || [];
      // Prevent duplicates
      if (!cached.some(m => m._id === message._id)) {
        messageCacheRef.current.set(chatId, [...cached, message]);
      }
    };

    const handleIncomingCall = async ({ callerId, callType, chatId }) => {
      const caller = users.find(u => u._id === callerId) || chats.flatMap(c => c.participants).find(p => p._id === callerId);
      setCallData({
        callerId,
        callerName: caller?.name || caller?.username || "Unknown",
        callerAvatar: caller?.profilePicture || caller?.avatar,
        chatId
      });
      setIsVideoCall(callType === "video");
      setIsIncomingCall(true);
      setShowIncomingToast(true);
      setIsCallOpen(false); // Call UI will open when accepted
    };

    const handleCallAccepted = async ({ responderId }) => {
      setIsCallOpen(true);
      setIsIncomingCall(false);
      setShowIncomingToast(false);
      setCallStartTime(Date.now());
      if (callData) await webrtcManager.initiateCall(responderId, callData.chatId, isVideoCall);
    };

    const handleCallRejected = () => {
      setIsCallOpen(false);
      setShowIncomingToast(false);
      logCallMessage("declined", callData, isVideoCall, null);
      setCallStartTime(null);
    };

    const handleCallEnded = () => {
      setIsCallOpen(false);
      setShowIncomingToast(false);
      logCallMessage(callStartTime ? "ended" : "missed", callData, isVideoCall, callStartTime);
      webrtcManager.endCall(false);
      setCallStartTime(null);
    };

    const handleUnsend = ({ messageId }) => {
      const updateFn = (msg) => msg._id === messageId ? { ...msg, isUnsent: true, content: "This message was unsent" } : msg;
      setMessages((prev) => prev.map(updateFn));
      // Fix cache
      messageCacheRef.current.forEach((msgs, cId) => {
        messageCacheRef.current.set(cId, msgs.map(updateFn));
      });
    };

    const handleReact = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((msg) => msg._id === messageId ? { ...msg, reactions } : msg));
    };

    const handleMediaReady = ({ messageId, fileUrl }) => {
      setMessages((prev) => prev.map((msg) => msg._id === messageId ? { ...msg, fileUrl } : msg));
    };

    // WhatsApp-style delivery tick: server tells sender the message was received
    const handleDelivered = ({ messageId, chatId }) => {
      setMessages((prev) => prev.map((msg) =>
        msg._id === messageId || (msg.isPending && (msg.chatId === chatId || msg.chatId?.toString() === chatId))
          ? { ...msg, deliveredTo: [...(msg.deliveredTo || []), "__delivered__"] }
          : msg
      ));
      // Also update cache
      messageCacheRef.current.forEach((msgs, cId) => {
        messageCacheRef.current.set(cId, msgs.map(m =>
          m._id === messageId || (m.isPending && (m.chatId === cId || m.chatId?.toString() === cId))
            ? { ...m, deliveredTo: [...(m.deliveredTo || []), "__delivered__"] } 
            : m
        ));
      });
    };

    // WhatsApp-style seen ticks: recipient opened the chat
    const handleSeen = ({ chatId: seenChatId, readerId }) => {
      if (readerId === currentUser._id) return; // ignore own reads
      setMessages((prev) => prev.map((msg) =>
        msg.chatId === seenChatId || msg.chatId?.toString() === seenChatId
          ? { ...msg, readBy: [...new Set([...(msg.readBy || []), readerId])] }
          : msg
      ));
    };

    socket.on(`user:${currentUser._id}:newMessage`, handleGlobalMessage);
    socket.on(`global:support:newMessage`, handleGlobalMessage);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:ended", handleCallEnded);
    socket.on("message:unsend", handleUnsend);
    socket.on("message:react", handleReact);
    socket.on("message:mediaReady", handleMediaReady);
    socket.on("message:delivered", handleDelivered);
    socket.on("message:seen", handleSeen);

    return () => {
      socket.off(`user:${currentUser._id}:newMessage`, handleGlobalMessage);
      socket.off(`global:support:newMessage`, handleGlobalMessage);
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:ended", handleCallEnded);
      socket.off("message:unsend", handleUnsend);
      socket.off("message:react", handleReact);
      socket.off("message:mediaReady", handleMediaReady);
      socket.off("message:delivered", handleDelivered);
      socket.off("message:seen", handleSeen);
    };
  }, [currentUser, users, chats, callData, isVideoCall]);

  const updateChatSnippet = (chatId, message) => {
    setChats((prev) => {
      const chatExists = prev.some((c) => c._id === chatId);
      if (!chatExists) return prev;
      return prev.map((chat) =>
        chat._id === chatId
          ? { 
              ...chat, 
              lastMessage: { content: message.content, createdAt: message.createdAt }, 
              updatedAt: message.createdAt,
              unreadCount: (activeChatIdRef.current === chatId) ? 0 : (chat.unreadCount || 0) + 1
            }
          : chat
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const handleSendMessage = async (text) => {
    if (!selectedChat || !currentUser) return;
    socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser._id });
    
    const localId = `local_${Date.now()}`;
    const optimisticMsg = {
      _id: localId,
      chatId: selectedChat._id,
      sender: currentUser,
      content: text,
      type: "text",
      createdAt: new Date().toISOString(),
      isPending: true
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);
    updateChatSnippet(selectedChat._id, optimisticMsg);
    
    try {
      const res = await api.post(`/chat/message/${selectedChat._id}`, { content: text, type: "text" });
      setMessages((prev) => prev.map((msg) => {
        if (msg._id === localId) {
          // Preserve any real-time delivery/read statuses that arrived before the HTTP response
          const mergedMessage = { ...res.message };
          if (msg.deliveredTo && msg.deliveredTo.length > 0) {
            mergedMessage.deliveredTo = [...new Set([...(mergedMessage.deliveredTo || []), ...msg.deliveredTo])];
          }
          if (msg.readBy && msg.readBy.length > 0) {
            mergedMessage.readBy = [...new Set([...(mergedMessage.readBy || []), ...msg.readBy])];
          }
          return mergedMessage;
        }
        return msg;
      }));
      updateChatSnippet(selectedChat._id, res.message);
    } catch (err) { 
      console.error(err); 
      setMessages((prev) => prev.filter(msg => msg._id !== localId));
    }
  };

  const handleSendFile = async (file) => {
    if (!selectedChat || !currentUser) return;
    const localId = `local_${Date.now()}`;
    const isImage = file.type.startsWith("image/");
    const optimisticMsg = {
      _id: localId, chatId: selectedChat._id, sender: currentUser, content: file.name, type: isImage ? "image" : "file",
      fileUrl: isImage ? URL.createObjectURL(file) : null, fileName: file.name, createdAt: new Date().toISOString(), isPending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.upload(`/chat/upload-media/${selectedChat._id}`, formData);
      setMessages((prev) => prev.map((msg) => {
        if (msg._id === localId) {
          const mergedMessage = { ...res.message };
          if (msg.deliveredTo && msg.deliveredTo.length > 0) {
            mergedMessage.deliveredTo = [...new Set([...(mergedMessage.deliveredTo || []), ...msg.deliveredTo])];
          }
          if (msg.readBy && msg.readBy.length > 0) {
            mergedMessage.readBy = [...new Set([...(mergedMessage.readBy || []), ...msg.readBy])];
          }
          return mergedMessage;
        }
        return msg;
      }));
      updateChatSnippet(selectedChat._id, res.message);
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter(m => m._id !== localId));
    }
  };

  const notifyTyping = () => {
    if (!selectedChat || !currentUser) return;
    socket.emit("typing:start", { chatId: selectedChat._id, userId: currentUser._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser._id });
    }, 1000);
  };

  const [isMinimized, setIsMinimized] = useState(false);

  const getOtherParticipant = (chatObj) => chatObj?.participants?.find((p) => p._id !== currentUser?._id);

  const handleAcceptFromToast = async () => {
    setShowIncomingToast(false);
    setIsCallOpen(true);
    setIsIncomingCall(false);
    setIsOpenInternal(true);
    
    // Ensure chat is selected so CallInterface is mounted inside ChatWindow
    let targetChat = chats.find(c => c._id === callData.chatId);
    if (!targetChat && callData.callerId) {
       try {
         const res = await api.get(`/chat/chat/${callData.callerId}`);
         targetChat = res.chat;
         setChats(prev => !prev.some(c => c._id === res.chat._id) ? [res.chat, ...prev] : prev);
       } catch (e) { console.error(e); }
    }
    if (targetChat) {
       setSelectedChat(targetChat);
    }
    
    setCallStartTime(Date.now());
    await webrtcManager.acceptCall(callData.callerId, callData.chatId, isVideoCall, currentUser._id);
  };

  const handleRejectFromToast = () => {
    socket.emit("call:reject", { targetUserId: callData.callerId, callerId: currentUser._id });
    setShowIncomingToast(false);
    setIsCallOpen(false);
    // Receiver doesn't log, caller will receive call:rejected and log it
  };

  // If not open and no active chat, don't render anything (except toast)
  // Admin Profile fetching (public)
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("/user/admin-profile");
        if (res.success && res.admin) {
          setAdminProfile(res.admin);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };
    fetchAdmin();
  }, []);

  const adminAvatar = adminProfile?.profilePicture || null;
  const [showGreeting, setShowGreeting] = useState(true);
  const [isChatButtonLoading, setIsChatButtonLoading] = useState(false);

  // Derive latest message for popup
  const supportChat = chats.find(c => c.isSupportChat) || chats.find(c => c.participants?.some(p => p.role === 'admin' || p.role === 'superadmin'));
  const hasHistory = supportChat && supportChat.lastMessage;

  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "";

  if (!isModalOpen && !showIncomingToast && !isHomePage) return null;

  return (
    <>
      {/* Incoming Call Toast (Small Floating Modal) */}
      {showIncomingToast && callData && (
         <div className="fixed bottom-[85px] md:bottom-6 right-4 md:right-6 z-[9999] w-80 bg-brand-surface dark:bg-slate-900 border border-brand-navy/[0.10] dark:border-white/10 rounded-2xl shadow-sm p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-brand-surface/10 overflow-hidden shrink-0 border border-brand-navy/[0.10] dark:border-white/5 flex items-center justify-center">
                 {callData.callerAvatar ? (
                   <img src={getOptimizedUrl(callData.callerAvatar)} alt="Caller" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-xl">ðŸ“ž</span>
                 )}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate text-base">{callData.callerName}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Incoming {isVideoCall ? "Video" : "Audio"} Call...</p>
               </div>
            </div>
            <div className="flex gap-3 mt-1">
               <button 
                 onClick={handleRejectFromToast} 
                 className="flex-1 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-xl py-2.5 flex justify-center transition-all"
               >
                 <PhoneOff size={20}/>
               </button>
               <button 
                 onClick={handleAcceptFromToast} 
                 className="flex-1 bg-brand-teal text-white hover:bg-green-600 rounded-xl py-2.5 flex justify-center shadow-sm shadow-green-500/20 transition-all hover:-translate-y-0.5"
               >
                 <Phone size={20}/>
               </button>
            </div>
         </div>
      )}

      {/* FIXED CHAT WIDGET */}
      {isModalOpen && (
        <div onWheel={(e) => e.stopPropagation()} className="fixed bottom-24 right-4 sm:right-6 w-[360px] sm:w-[380px] h-[550px] max-h-[calc(100vh-120px)] bg-brand-surface/90 dark:bg-brand-surface/90 backdrop-blur-2xl rounded-[4px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden z-[9990] overflow-y-auto overscroll-contain animate-in slide-in-from-bottom-5 fade-in duration-300">
           
           {!selectedChat ? (
                // Chat Sidebar (List of chats)
                <ChatSidebar 
                    currentUser={currentUser}
                    users={users} 
                    chats={chats} 
                    onlineUsers={onlineUsers} 
                    selectedChat={selectedChat}
                    onSelectChat={setSelectedChat}
                    loading={loading}
                    onSelectUser={async (user) => {
                      try {
                        const url = user.isSupportChat ? `/chat/support` : `/chat/chat/${user._id}`;
                        const res = await api.get(url);
                        setSelectedChat(res.chat);
                        setChats(prev => !prev.some(c => c._id === res.chat._id) ? [res.chat, ...prev] : prev);
                      } catch (e) { console.error(e); }
                    }}
                    onStartNewChat={() => {}}
                    onClose={handleClose}
                    onDeleteChat={async (chatId) => {
                      if (!window.confirm("Remove this chat from your list?")) return;
                      try {
                        await api.delete(`/chat/chat/${chatId}`);
                        setChats(prev => prev.filter(c => c._id !== chatId));
                        if (selectedChat?._id === chatId) setSelectedChat(null);
                      } catch (e) { console.error("Failed to delete chat", e); }
                    }}
                    activeCallChatId={(isCallOpen || showIncomingToast) ? callData?.chatId : null}
                    activeCallStatus={isIncomingCall ? "Ringing..." : "Calling..."}
                />
           ) : (
              // Active Conversation Window
              <div className="flex-1 flex flex-col min-h-0 w-full relative">
                <CallInterface 
                   isOpen={isCallOpen} isIncoming={isIncomingCall}
                   callerName={callData?.callerName || getOtherParticipant(selectedChat)?.name || getOtherParticipant(selectedChat)?.username}
                   callerAvatar={callData?.callerAvatar || getOtherParticipant(selectedChat)?.profilePicture}
                   isVideoCall={isVideoCall}
                   onAccept={async () => { if (callData) { setIsIncomingCall(false); setCallStartTime(Date.now()); await webrtcManager.acceptCall(callData.callerId, callData.chatId, isVideoCall, currentUser._id); } }}
                   onReject={() => { if (callData) socket.emit("call:reject", { targetUserId: callData.callerId, callerId: currentUser._id }); setIsCallOpen(false); }}
                   onEnd={() => { 
                     logCallMessage(callStartTime ? "ended" : "missed", callData, isVideoCall, callStartTime);
                     webrtcManager.endCall(true); 
                     setIsCallOpen(false); 
                     setCallStartTime(null);
                   }}
                />

                <ChatWindow onGoToSupport={async () => { const url = '/chat/support'; try { const res = await api.get(url); setSelectedChat(res.chat); setChats(prev => !prev.some(c => c._id === res.chat._id) ? [res.chat, ...prev] : prev); } catch(e){} }} 
                  chat={selectedChat} messages={messages} isLoadingMessages={isLoadingMessages} currentUser={currentUser}
                  isOnline={selectedChat && onlineUsers.has(getOtherParticipant(selectedChat)?._id)}
                  isTyping={isTyping}
                  onSendMessage={(text) => { notifyTyping(); handleSendMessage(text); }}
                  onSendFile={handleSendFile}
                  onInitiateCall={async (isVideo) => {
                    if (!selectedChat || !currentUser) return;
                    const targetUserId = getOtherParticipant(selectedChat)?._id;
                    if (!targetUserId) return;
                    setIsVideoCall(isVideo);
                    setCallData({ targetUserId, chatId: selectedChat._id });
                    setIsIncomingCall(false);
                    
                    try {
                      await webrtcManager.initializeLocalStream(isVideo);
                    } catch (e) {
                      console.error("Failed to get local stream", e);
                    }

                    setCallStartTime(null); // Reset timer just in case
                    setIsCallOpen(true);
                    socket.emit("call:initiate", { targetUserId, callerId: currentUser._id, callType: isVideo ? "video" : "audio", chatId: selectedChat._id });
                  }}
                  onMinimize={handleClose}
                  onClose={handleClose}
                  onBack={() => setSelectedChat(null)}
                  onUnsendMessage={(id) => {
                    const updateFn = m => m._id === id ? { ...m, isUnsent: true, content: "This message was unsent" } : m;
                    setMessages(prev => prev.map(updateFn));
                    const cached = messageCacheRef.current.get(selectedChat._id);
                    if (cached) messageCacheRef.current.set(selectedChat._id, cached.map(updateFn));
                    socket.emit("message:unsend", { chatId: selectedChat._id, messageId: id });
                  }}
                  onReactMessage={(id, emoji) => {
                    let nr;
                    setMessages(prev => prev.map(m => {
                      if (m._id === id) {
                        nr = [...(m.reactions || [])];
                        const idx = nr.findIndex(r => r.user?._id === currentUser._id || r.user === currentUser._id);
                        if (idx > -1) { if (nr[idx].emoji === emoji) nr.splice(idx, 1); else nr[idx].emoji = emoji; }
                        else nr.push({ emoji, user: { _id: currentUser._id, name: currentUser.name } });
                        return { ...m, reactions: nr };
                      }
                      return m;
                    }));
                    
                    // Update cache
                    const cached = messageCacheRef.current.get(selectedChat._id);
                    if (cached && nr) {
                      messageCacheRef.current.set(selectedChat._id, cached.map(m => m._id === id ? { ...m, reactions: nr } : m));
                    }
                    setTimeout(() => socket.emit("message:react", { chatId: selectedChat._id, messageId: id, reactions: nr }), 0);
                  }}
                  onDeleteMessage={async (id) => {
                    const updateFn = m => m._id !== id;
                    setMessages(prev => prev.filter(updateFn));
                    const cached = messageCacheRef.current.get(selectedChat._id);
                    if (cached) messageCacheRef.current.set(selectedChat._id, cached.filter(updateFn));
                    try {
                      await api.delete(`/chat/message/${id}`);
                    } catch (err) {
                      console.error("Failed to delete message on backend", err);
                    }
                  }}
                />
              </div>
           )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-brand-surface dark:bg-[#1a1a1a] w-full max-w-sm rounded-3xl p-6 shadow-sm border border-white/20 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })}
                className="px-5 py-2.5 rounded-xl font-medium text-brand-slate dark:text-slate-300 hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
                }}
                className="px-5 py-2.5 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
