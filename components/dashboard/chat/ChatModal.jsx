"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import { webrtcManager } from "@/utils/webrtcManager";
import { MessageCircle, X, Phone, PhoneOff } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import CallInterface from "./CallInterface";
import DraggableResizableWindow from "./DraggableResizableWindow";

/**
 * ChatModal
 * A floating, detached chat system.
 * Left (List) and Right (Conversation) are separate draggable units.
 */
export default function ChatModal({ isOpen, onClose, initialUserId, showList = true }) {
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
  // Message cache: chatId → messages[] — so switching chats shows instant data
  const messageCacheRef = useRef(new Map());
  const activeChatIdRef = useRef(null);

  // Sync props to internal state for backwards compatibility
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsOpenInternal(isOpen);
    }
  }, [isOpen]);
  
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

    const content = `📞 ${isVideo ? 'Video' : 'Audio'} call ${statusLabel}${durationStr}`;
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

    window.addEventListener("toggle-chat", handleToggleChatEvent);
    window.addEventListener("open-chat", handleOpenChatEvent);

    return () => {
      window.removeEventListener("toggle-chat", handleToggleChatEvent);
      window.removeEventListener("open-chat", handleOpenChatEvent);
    };
  }, [currentUser]);

  const handleClose = () => {
    setIsOpenInternal(false);
    if (onClose) onClose();
  };

  // Call State
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [showIncomingToast, setShowIncomingToast] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);

  // 1. Initial Data Fetch (Runs once on mount)
  useEffect(() => {
    const initialize = async () => {
      if (currentUser) return;
      try {
        setLoading(true);
        const [profileRes, usersRes, chatsRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/chat/users"),
          api.get("/chat/chats"),
        ]);

        const user = profileRes.user || profileRes.data;
        if (!user || !user._id) return;
        
        setCurrentUser(user);
        setUsers(usersRes.users || []);
        setChats(chatsRes.chats || []);
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

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
  if (!isModalOpen && !selectedChat && !showIncomingToast) return null;

  if (isMinimized && !showIncomingToast) {
    const avatar = getOtherParticipant(selectedChat)?.profilePicture || getOtherParticipant(selectedChat)?.avatar;
    return (
      <div className="fixed bottom-6 right-20 z-[9999]">
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-white dark:bg-black border-2 border-indigo-500 shadow-2xl flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity relative"
        >
          {selectedChat && avatar ? <img src={getOptimizedUrl(avatar)} className="w-full h-full object-cover" alt="" /> : <MessageCircle size={24} className="text-indigo-500" />}
          {selectedChat && onlineUsers.has(getOtherParticipant(selectedChat)?._id) && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full"></div>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Incoming Call Toast (Small Floating Modal) */}
      {showIncomingToast && callData && (
         <div className="fixed bottom-6 right-6 z-[9999] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                 {callData.callerAvatar ? (
                   <img src={getOptimizedUrl(callData.callerAvatar)} alt="Caller" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-xl">📞</span>
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
                 className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-xl py-2.5 flex justify-center shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
               >
                 <Phone size={20}/>
               </button>
            </div>
         </div>
      )}

      {/* PART 1: CHAT LIST (Sidebar) */}
      {isModalOpen && showList && (
          <DraggableResizableWindow 
            initialWidth={380} 
            initialHeight={700} 
            minWidth={320} 
            minHeight={400}
            storageKey="chat_sidebar_state"
          >
            <div className="flex h-full w-full bg-white/90 dark:bg-black/90 backdrop-blur-xl overflow-hidden relative rounded-2xl shadow-2xl border border-white/20 dark:border-white/5">
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
                      const res = await api.get(`/chat/chat/${user._id}`);
                      setSelectedChat(res.chat);
                      setChats(prev => !prev.some(c => c._id === res.chat._id) ? [res.chat, ...prev] : prev);
                    } catch (e) { console.error(e); }
                  }}
                  onStartNewChat={() => {}}
                  onClose={handleClose} // Closes via parent toggle
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
            </div>
          </DraggableResizableWindow>
        )}

        {/* PART 2: CONVERSATION WINDOW (Appears only when a chat is selected) */}
        {selectedChat && (
          <DraggableResizableWindow 
            initialWidth={700} 
            initialHeight={700} 
            minWidth={450} 
            minHeight={400}
            storageKey="chat_content_state"
          >
            <div className="flex h-full w-full bg-white dark:bg-black overflow-hidden relative rounded-2xl shadow-2xl border border-white/20 dark:border-white/5">
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

              <ChatWindow 
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
                onMinimize={() => setIsMinimized(true)}
                onClose={() => {
                  if (!showList) handleClose();
                  else setSelectedChat(null);
                }} // Closing conversation only
                onUnsendMessage={(id) => {
                  setConfirmDialog({
                    isOpen: true,
                    title: "Delete for everyone",
                    message: "Are you sure you want to unsend this message? It will be removed for everyone in the chat.",
                    onConfirm: () => {
                      const updateFn = m => m._id === id ? { ...m, isUnsent: true, content: "This message was unsent" } : m;
                      setMessages(prev => prev.map(updateFn));
                      const cached = messageCacheRef.current.get(selectedChat._id);
                      if (cached) messageCacheRef.current.set(selectedChat._id, cached.map(updateFn));
                      socket.emit("message:unsend", { chatId: selectedChat._id, messageId: id });
                    }
                  });
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
                onDeleteMessage={(id) => {
                  setConfirmDialog({
                    isOpen: true,
                    title: "Delete for me",
                    message: "This message will be deleted for you. Other participants can still see it.",
                    onConfirm: async () => {
                      const updateFn = m => m._id !== id;
                      setMessages(prev => prev.filter(updateFn));
                      const cached = messageCacheRef.current.get(selectedChat._id);
                      if (cached) messageCacheRef.current.set(selectedChat._id, cached.filter(updateFn));
                      try {
                        await api.delete(`/chat/message/${id}`);
                      } catch (err) {
                        console.error("Failed to delete message on backend", err);
                      }
                    }
                  });
                }}
              />
            </div>
          </DraggableResizableWindow>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
                }}
                className="px-5 py-2.5 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
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
