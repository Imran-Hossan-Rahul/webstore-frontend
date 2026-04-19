"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Send, MessageCircle, User as UserIcon, ArrowLeft, Sparkles } from "lucide-react";
import { api } from "@/utils/api";
import socket from "@/utils/socket";

export default function ChatModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastSeen, setLastSeen] = useState({});
  const [pendingRequest, setPendingRequest] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [sendingMessages, setSendingMessages] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const messagesCacheRef = useRef({});
  const chatsCacheRef = useRef({});

  // Fetch current user
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/user/profile");
        setCurrentUser(res.user || res.data);
        socket.emit("user:online", (res.user || res.data)?._id);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchCurrentUser();

    socket.on("user:status", ({ userId, status, lastSeen: lastSeenTime }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (status === "online") newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
      
      if (status === "offline" && lastSeenTime) {
        setLastSeen((prev) => ({ ...prev, [userId]: lastSeenTime }));
      }
    });

    return () => socket.off("user:status");
  }, [isOpen]);

  // Check for auto-open chat with specific user
  useEffect(() => {
    if (!isOpen) return;
    
    const openChatWith = sessionStorage.getItem('openChatWith');
    if (openChatWith) {
      try {
        const userData = JSON.parse(openChatWith);
        sessionStorage.removeItem('openChatWith');
        
        // Auto-select this user
        setTimeout(() => {
          handleSelectUser(userData);
        }, 500);
      } catch (err) {
        console.error('Failed to parse openChatWith:', err);
      }
    }
  }, [isOpen]);

  // Fetch users (with cache)
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUsers = async () => {
      try {
        // Check session storage cache
        const cachedUsers = sessionStorage.getItem('chat_users');
        const cacheTime = sessionStorage.getItem('chat_users_time');
        const now = Date.now();
        
        // Use cache if less than 2 minutes old
        if (cachedUsers && cacheTime && (now - parseInt(cacheTime)) < 120000) {
          setUsers(JSON.parse(cachedUsers));
          return;
        }
        
        const res = await api.get("/chat/users");
        const usersList = res.users || [];
        setUsers(usersList);
        
        // Cache in session storage
        sessionStorage.setItem('chat_users', JSON.stringify(usersList));
        sessionStorage.setItem('chat_users_time', now.toString());
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [isOpen]);

  // Socket listeners
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    socket.emit("chat:join", selectedChat._id);

    const handleNewMessage = (message) => {
      if (message.sender?._id !== currentUser._id) {
        const newMsg = { ...message, status: "delivered" };
        setMessages((prev) => {
          const updated = [...prev, newMsg];
          // Update cache
          const otherUser = getOtherParticipant(selectedChat);
          if (otherUser) {
            messagesCacheRef.current[otherUser._id] = updated;
          }
          return updated;
        });
        scrollToBottom();
        socket.emit("message:delivered", { messageId: message._id, chatId: selectedChat._id });
      }
    };

    const handleMessageDelivered = ({ messageId }) => {
      setMessages((prev) => {
        const updated = prev.map((msg) => msg._id === messageId ? { ...msg, status: "delivered" } : msg);
        // Update cache
        const otherUser = getOtherParticipant(selectedChat);
        if (otherUser) {
          messagesCacheRef.current[otherUser._id] = updated;
        }
        return updated;
      });
    };

    const handleMessageRead = ({ messageId }) => {
      setMessages((prev) => {
        const updated = prev.map((msg) => msg._id === messageId ? { ...msg, status: "read" } : msg);
        // Update cache
        const otherUser = getOtherParticipant(selectedChat);
        if (otherUser) {
          messagesCacheRef.current[otherUser._id] = updated;
        }
        return updated;
      });
    };

    const handleTyping = ({ userId, typing }) => {
      if (userId !== currentUser._id) setIsTyping(typing);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleTyping);
    socket.on("message:delivered", handleMessageDelivered);
    socket.on("message:read", handleMessageRead);

    return () => {
      socket.emit("chat:leave", selectedChat._id);
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleTyping);
      socket.off("message:delivered", handleMessageDelivered);
      socket.off("message:read", handleMessageRead);
    };
  }, [selectedChat, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Select user
  const handleSelectUser = async (user) => {
    try {
      setNewMessage("");
      setPendingRequest(null);
      
      // Check cache for chat
      const cachedChat = chatsCacheRef.current[user._id];
      const cachedMessages = messagesCacheRef.current[user._id];
      
      if (cachedChat && cachedMessages) {
        // Load from cache instantly
        setSelectedChat(cachedChat);
        setMessages(cachedMessages);
        
        if (cachedChat?.status === "pending" && cachedChat?.initiator !== currentUser?._id) {
          setPendingRequest(cachedChat);
        }
        
        setTimeout(() => inputRef.current?.focus(), 50);
        
        // Fetch fresh data in background
        fetchChatData(user._id, true);
      } else {
        // No cache, show loading and fetch
        setIsLoadingMessages(true);
        setMessages([]);
        await fetchChatData(user._id, false);
        setIsLoadingMessages(false);
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
      setIsLoadingMessages(false);
    }
  };

  const fetchChatData = async (userId, isBackground = false) => {
    try {
      const res = await api.get(`/chat/chat/${userId}`);
      const chat = res.chat;
      
      // Cache chat
      chatsCacheRef.current[userId] = chat;
      
      if (!isBackground) {
        setSelectedChat(chat);
        
        if (chat?.status === "pending" && chat?.initiator !== currentUser?._id) {
          setPendingRequest(chat);
        }
      }
      
      const msgRes = await api.get(`/chat/messages/${chat._id}`);
      const messagesWithStatus = (msgRes.messages || []).map(msg => ({
        ...msg,
        status: msg.isRead ? "read" : (msg.isDelivered ? "delivered" : "sent")
      }));
      
      // Cache messages
      messagesCacheRef.current[userId] = messagesWithStatus;
      
      if (!isBackground) {
        setMessages(messagesWithStatus);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        // Update if still on same chat
        setMessages(messagesWithStatus);
      }
      
      await api.put(`/chat/read/${chat._id}`);
      socket.emit("messages:read", { chatId: chat._id });
    } catch (error) {
      console.error("Failed to fetch chat data:", error);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (!selectedChat) return;
    socket.emit("typing:start", { chatId: selectedChat._id, userId: currentUser?._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser?._id });
    }, 1000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content: newMessage,
      sender: currentUser?._id,
      createdAt: new Date().toISOString(),
      status: "sending",
      type: "text"
    };

    try {
      socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser?._id });
      
      setMessages((prev) => [...prev, tempMessage]);
      setSendingMessages((prev) => new Set([...prev, tempId]));
      setNewMessage("");
      scrollToBottom();
      
      const res = await api.post(`/chat/message/${selectedChat._id}`, {
        content: tempMessage.content,
        type: "text"
      });
      
      setMessages((prev) => {
        const updated = prev.map((msg) => msg._id === tempId ? { ...res.message, status: "sent" } : msg);
        // Update cache
        const otherUser = getOtherParticipant(selectedChat);
        if (otherUser) {
          messagesCacheRef.current[otherUser._id] = updated;
        }
        return updated;
      });
      setSendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => 
        prev.map((msg) => msg._id === tempId ? { ...msg, status: "failed" } : msg)
      );
      setSendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !currentUser) return null;
    return chat.participants?.find((p) => p._id !== currentUser._id);
  };

  const isUserOnline = (userId) => onlineUsers.has(userId);

  const getLastSeenText = (userId) => {
    if (isUserOnline(userId)) return "Active now";
    
    const lastSeenTime = lastSeen[userId];
    if (!lastSeenTime) return "Offline";
    
    const now = new Date();
    const seen = new Date(lastSeenTime);
    const diffMs = now - seen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    return "Offline";
  };

  const handleAcceptRequest = async () => {
    try {
      await api.post(`/chat/accept/${selectedChat._id}`);
      setPendingRequest(null);
      const updatedChat = { ...selectedChat, status: "active" };
      setSelectedChat(updatedChat);
      
      // Update cache
      const otherUser = getOtherParticipant(selectedChat);
      if (otherUser) {
        chatsCacheRef.current[otherUser._id] = updatedChat;
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleBlockUser = async () => {
    try {
      const otherUser = getOtherParticipant(selectedChat);
      await api.post(`/chat/block/${otherUser._id}`);
      setBlockedUsers((prev) => new Set([...prev, otherUser._id]));
      setSelectedChat(null);
      setMessages([]);
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-md h-[650px] animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-white/10 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 dark:border-white/5 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{filteredUsers.length} conversations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-xl transition-all hover:rotate-90 duration-300"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {!selectedChat ? (
          <>
            {/* Search */}
            <div className="p-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-2">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start chatting with creators</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => {
                    const userLastSeen = getLastSeenText(user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10 cursor-pointer transition-all rounded-xl group"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                            {user.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          {isUserOnline(user._id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {user.name || user.username}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userLastSeen}</p>
                        </div>
                        <MessageCircle size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 transition-colors" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/50 dark:border-white/5 bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-900/5 dark:to-blue-900/5">
              <button
                onClick={() => {
                  setSelectedChat(null);
                  setMessages([]);
                }}
                className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-xl transition-all hover:-translate-x-1 duration-200"
              >
                <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                  {getOtherParticipant(selectedChat)?.username?.[0]?.toUpperCase() || "U"}
                </div>
                {isUserOnline(getOtherParticipant(selectedChat)?._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {getOtherParticipant(selectedChat)?.username || "User"}
                </h3>
                <p className={`text-xs font-medium flex items-center gap-1 ${isUserOnline(getOtherParticipant(selectedChat)?._id) ? "text-green-500" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isUserOnline(getOtherParticipant(selectedChat)?._id) ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                  {getLastSeenText(getOtherParticipant(selectedChat)?._id)}
                </p>
              </div>
            </div>

            {/* Pending Request Banner */}
            {pendingRequest && (
              <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Message Request</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {getOtherParticipant(selectedChat)?.username} wants to send you a message. Do you know this person?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAcceptRequest}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={handleBlockUser}
                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      >
                        Block
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-black/10">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start the conversation</p>
                  <p className="text-xs text-gray-400">Send a message to begin chatting</p>
                </div>
              ) : (
                <>
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                    const isOwn = senderId?.toString() === currentUser?._id?.toString();
                    const messageStatus = msg.status || "sent";
                    
                    const getStatusIcon = () => {
                      if (messageStatus === "sending") {
                        return (
                          <svg className="w-3 h-3 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        );
                      }
                      if (messageStatus === "failed") {
                        return <span className="text-red-400 text-sm" title="Failed">⚠</span>;
                      }
                      if (messageStatus === "sent") {
                        return <span className="text-gray-300" title="Sent">✓</span>;
                      }
                      if (messageStatus === "delivered") {
                        return <span className="text-gray-300" title="Delivered">✓✓</span>;
                      }
                      if (messageStatus === "read") {
                        return <span className="text-blue-400" title="Read">✓✓</span>;
                      }
                      return null;
                    };
                    
                    return (
                      <div key={msg._id || idx} className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-${isOwn ? 'right' : 'left'}-2 duration-200`}>
                        <div className={`max-w-[80%] ${isOwn ? "order-2" : "order-1"}`}>
                          <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${isOwn ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-md" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-md"}`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <p className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {isOwn && (
                              <span className="text-xs flex items-center">
                                {getStatusIcon()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              {pendingRequest ? (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Accept the message request to reply
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 duration-200"
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
