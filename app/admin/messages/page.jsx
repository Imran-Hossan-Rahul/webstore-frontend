"use client";
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import ChatSidebar from "@/components/dashboard/chat/ChatSidebar";
import ChatWindow from "@/components/dashboard/chat/ChatWindow";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function AdminMessagesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const messageCacheRef = useRef(new Map());

  // 1. Auth & Fetch Chats
  useEffect(() => {
    const initialize = async () => {
      try {
        const resUser = await api.get("/user/profile");
        if (resUser.success && (resUser.data.role === 'admin' || resUser.data.role === 'superadmin')) {
          setCurrentUser(resUser.data);
          
          const chatsRes = await api.get("/chat/chats");
          // Admin support chats
          const supportChats = (chatsRes.chats || []).filter(c => c.isSupportChat);
          setChats(supportChats);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [router]);

  // 2. Socket Listeners
  useEffect(() => {
    if (!currentUser) return;
    
    socket.emit("user:online", currentUser._id);
    
    const handleUserStatus = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        status === "online" ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
    };
    const handleOnlineList = (onlineIds) => setOnlineUsers(new Set(onlineIds));

    socket.on("user:status", handleUserStatus);
    socket.on("users:onlineList", handleOnlineList);

    return () => {
      socket.off("user:status", handleUserStatus);
      socket.off("users:onlineList", handleOnlineList);
    };
  }, [currentUser]);

  // 3. Room Join & Messages
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    window.activeChatId = selectedChat._id;

    const cached = messageCacheRef.current.get(selectedChat._id);
    if (cached) {
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
        messageCacheRef.current.set(selectedChat._id, res.messages || []);
        setMessages(res.messages || []);
        await api.put(`/chat/read/${selectedChat._id}`);
      } catch (err) {} finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();

    const handleNewMessage = async (message) => {
      if (message.sender?._id !== currentUser._id && message.sender !== currentUser._id) {
        setMessages((prev) => {
          const updated = [...prev, message];
          messageCacheRef.current.set(selectedChat._id, updated);
          return updated;
        });
        
        try {
          await api.put(`/chat/read/${selectedChat._id}`);
        } catch (e) {}
      }
    };
    
    const handleTyping = ({ userId, typing }) => {
      if (userId !== currentUser._id) setIsTyping(typing);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleTyping);

    setChats(prev => prev.map(c => c._id === selectedChat._id ? { ...c, unreadCount: 0 } : c));

    return () => {
      socket.emit("chat:leave", selectedChat._id);
      window.activeChatId = null;
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleTyping);
    };
  }, [selectedChat, currentUser]);

  // 4. Global messages
  useEffect(() => {
    if (!currentUser) return;

    const handleGlobalMessage = ({ chatId, message }) => {
       setChats(prev => {
         const chatExists = prev.some(c => c._id === chatId);
         if (!chatExists) return prev; // Ignore non-support chats
         
         return prev.map(c => {
           if (c._id === chatId) {
             return { ...c, lastMessage: message, unreadCount: window.activeChatId === chatId ? 0 : (c.unreadCount || 0) + 1 };
           }
           return c;
         });
       });
       
       const cached = messageCacheRef.current.get(chatId) || [];
       if (!cached.some(m => m._id === message._id)) {
         messageCacheRef.current.set(chatId, [...cached, message]);
       }
    };
    
    socket.on(`user:${currentUser._id}:newMessage`, handleGlobalMessage);
    socket.on(`global:support:newMessage`, handleGlobalMessage);

    return () => {
      socket.off(`user:${currentUser._id}:newMessage`, handleGlobalMessage);
      socket.off(`global:support:newMessage`, handleGlobalMessage);
    };
  }, [currentUser]);

  // Actions
  const handleSendMessage = async (content) => {
    if (!content.trim() || !selectedChat) return;
    const tempId = Date.now().toString();
    const tempMsg = {
      _id: tempId,
      chatId: selectedChat._id,
      sender: currentUser,
      content,
      type: "text",
      createdAt: new Date().toISOString(),
      isPending: true
    };

    setMessages(prev => [...prev, tempMsg]);
    
    try {
      const res = await api.post(`/chat/message/${selectedChat._id}`, { content, type: "text" });
      if (res.success) {
        setMessages(prev => prev.map(m => m._id === tempId ? res.message : m));
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const handleReactMessage = async (messageId, emoji) => {
    try {
      await api.post(`/chat/react/${messageId}`, { emoji });
    } catch (error) {}
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (error) {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <AppleSpinner className="animate-spin text-slate-400 mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white dark:bg-black rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mt-4">
      {/* Sidebar */}
      <div className="w-[320px] border-r border-black/5 dark:border-white/10 flex-shrink-0 bg-[#f5f5f7] dark:bg-[#1c1c1e] relative z-10">
        <ChatSidebar
          currentUser={currentUser}
          chats={chats}
          users={[]}
          onlineUsers={onlineUsers}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          loading={false}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 relative flex flex-col bg-white dark:bg-black z-0">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            currentUser={currentUser}
            isOnline={selectedChat.participants?.some(p => p._id !== currentUser._id && onlineUsers.has(p._id))}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
            onDeleteMessage={handleDeleteMessage}
            isFullScreen={true}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-[#fafafa] dark:bg-black">
            <MessageCircle size={64} className="mb-4 opacity-20" strokeWidth={1} />
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2 tracking-tight">Your Messages</h2>
            <p className="text-[15px] font-medium text-[#86868b]">Select a conversation from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
