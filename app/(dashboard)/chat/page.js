"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import { webrtcManager } from "@/utils/webrtcManager";
import { MessageCircle } from "lucide-react";
import ChatSidebar from "@/components/dashboard/chat/ChatSidebar";
import ChatWindow from "@/components/dashboard/chat/ChatWindow";
import CallInterface from "@/components/dashboard/chat/CallInterface";
import DraggableResizableWindow from "@/components/dashboard/chat/DraggableResizableWindow";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('room');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Call State
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callData, setCallData] = useState(null); // { callerId, callerName, callerAvatar, chatId }

  // 1. Initial Data Fetch & Socket Connection
  useEffect(() => {
    const initialize = async () => {
      try {
        const [profileRes, usersRes, chatsRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/chat/users"),
          api.get("/chat/chats"),
        ]);

        const user = profileRes.user || profileRes.data;
        if (!user || !user._id) {
          console.error("Initialization failed: user profile not returned from API", profileRes);
          return;
        }
        setCurrentUser(user);
        
        const fetchedChats = chatsRes.chats || [];
        setUsers(usersRes.users || []);
        setChats(fetchedChats);

        // Auto-select room from URL
        if (roomIdFromUrl) {
          const target = fetchedChats.find(c => String(c._id) === String(roomIdFromUrl));
          if (target) {
            setSelectedChat(target);
          }
        }

        socket.emit("user:online", user._id);
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };
    initialize();

    socket.on("user:status", ({ userId, status, lastActiveAt }) => {
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
    });

    return () => {
      socket.off("user:status");
    };
  }, []);

  // 2. Chat Selection & Room Join
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    socket.emit("chat:join", selectedChat._id);

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${selectedChat._id}`);
        setMessages(res.messages || []);
        // Mark read
        await api.put(`/chat/read/${selectedChat._id}`);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();

    const handleNewMessage = (message) => {
      if (message.sender?._id !== currentUser._id && message.sender !== currentUser._id) {
        setMessages((prev) => [...prev, message]);
        // Also update chat list snippet
        updateChatSnippet(selectedChat._id, message);
      }
    };

    const handleTyping = ({ userId, typing }) => {
      if (userId !== currentUser._id) setIsTyping(typing);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleTyping);

    return () => {
      socket.emit("chat:leave", selectedChat._id);
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleTyping);
    };
  }, [selectedChat, currentUser]);

  // 3. Global Message Listener (for unselected chats)
  useEffect(() => {
    if (!currentUser) return;

    const handleGlobalMessage = ({ chatId, message }) => {
      updateChatSnippet(chatId, message);
    };

    socket.on(`user:${currentUser._id}:newMessage`, handleGlobalMessage);

    // Call Listeners
    socket.on("call:incoming", ({ callerId, callType, chatId }) => {
      const caller = users.find(u => u._id === callerId) || chats.flatMap(c => c.participants).find(p => p._id === callerId);
      
      setCallData({
        callerId,
        callerName: caller?.name || caller?.username || "Unknown",
        callerAvatar: caller?.profilePicture || caller?.avatar,
        chatId
      });
      setIsVideoCall(callType === "video");
      setIsIncomingCall(true);
      setIsCallOpen(true);
    });

    socket.on("call:accepted", async ({ responderId }) => {
      setIsCallOpen(true);
      setIsIncomingCall(false);
      // Initiate WebRTC offer
      if (callData) {
         await webrtcManager.initiateCall(responderId, callData.chatId, isVideoCall);
      }
    });

    socket.on("call:rejected", () => {
      setIsCallOpen(false);
      alert("Call was declined.");
    });

    socket.on("call:ended", () => {
      setIsCallOpen(false);
      webrtcManager.endCall(false);
    });

    socket.on("message:unsend", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isUnsent: true, content: "This message was unsent" } : msg
        )
      );
    });

    socket.on("message:react", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    });

    socket.on("message:mediaReady", ({ messageId, fileUrl }) => {
      // Craftsman finished uploading to Cloudinary — replace temp URL with CDN URL
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, fileUrl } : msg
        )
      );
    });

    return () => {
      socket.off(`user:${currentUser._id}:newMessage`);
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("message:unsend");
      socket.off("message:react");
      socket.off("message:mediaReady");
    };
  }, [currentUser, users, chats, callData, isVideoCall]);

  const updateChatSnippet = (chatId, message) => {
    setChats((prev) => {
      const chatExists = prev.some((c) => c._id === chatId);
      if (!chatExists) return prev; // Optionally fetch chat if it's completely new

      return prev.map((chat) =>
        chat._id === chatId
          ? { ...chat, lastMessage: { content: message.content, createdAt: message.createdAt }, updatedAt: message.createdAt }
          : chat
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  // 4. Send Handlers
  const handleSendMessage = async (text) => {
    if (!selectedChat || !currentUser) return;

    socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser._id });

    try {
      const res = await api.post(`/chat/message/${selectedChat._id}`, { content: text, type: "text" });
      setMessages((prev) => [...prev, res.message]);
      updateChatSnippet(selectedChat._id, res.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFile = async (file) => {
    if (!selectedChat || !currentUser) return;
    
    // Optimistic: show a local placeholder immediately
    const localId = `local_${Date.now()}`;
    const isImage = file.type.startsWith("image/");
    const localPreview = isImage ? URL.createObjectURL(file) : null;
    const optimisticMsg = {
      _id: localId,
      chatId: selectedChat._id,
      sender: currentUser._id,
      content: file.name,
      type: isImage ? "image" : "file",
      fileUrl: localPreview,
      fileName: file.name,
      createdAt: new Date().toISOString(),
      _isLocal: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use api.upload() which does NOT set Content-Type (lets browser set boundary)
      const res = await api.upload(`/chat/upload-media/${selectedChat._id}`, formData);
      // Replace the optimistic message with the real one from server
      setMessages((prev) => prev.map(m => m._id === localId ? res.message : m));
      updateChatSnippet(selectedChat._id, res.message);
    } catch (err) {
      console.error("File upload failed:", err);
      // Remove the optimistic message on failure
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

  const handleUnsendMessage = (messageId) => {
    if (!selectedChat) return;
    // Optimistic update first
    setMessages((prev) => prev.map(msg =>
      msg._id === messageId ? { ...msg, isUnsent: true, content: "This message was unsent" } : msg
    ));
    // Then sync to backend via socket
    socket.emit("message:unsend", { chatId: selectedChat._id, messageId });
  };

  const handleDeleteMessage = (messageId) => {
    // Delete only from local state (patron-side only, no broadcast)
    setMessages((prev) => prev.filter(msg => msg._id !== messageId));
  };

  const handleReactMessage = (messageId, reactionEmoji) => {
    if (!selectedChat || !currentUser) return;
    
    // Optimistic update first — instant feedback
    let newReactions;
    setMessages((prev) => prev.map(msg => {
      if (msg._id === messageId) {
        newReactions = [...(msg.reactions || [])];
        const existingIdx = newReactions.findIndex(r => r.user?._id === currentUser._id || r.user === currentUser._id);
        if (existingIdx > -1) {
          if (newReactions[existingIdx].emoji === reactionEmoji) {
            newReactions.splice(existingIdx, 1);
          } else {
            newReactions[existingIdx].emoji = reactionEmoji;
          }
        } else {
          newReactions.push({ emoji: reactionEmoji, user: { _id: currentUser._id, name: currentUser.name } });
        }
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
    // Sync to backend after UI already updated
    setTimeout(() => {
      socket.emit("message:react", { chatId: selectedChat._id, messageId, reactions: newReactions });
    }, 0);
  };

  const handleSelectUserFromDirectory = async (user) => {
    try {
      const res = await api.get(`/chat/chat/${user._id}`);
      setSelectedChat(res.chat);
      // ensure it's in the chat list
      setChats(prev => {
         if (!prev.some(c => c._id === res.chat._id)) {
            return [res.chat, ...prev];
         }
         return prev;
      });
    } catch (error) {
      console.error("Failed to load/create chat:", error);
    }
  };

  const [isMinimized, setIsMinimized] = useState(false);

  // 5. Call Handlers
  const initiateCall = (isVideo) => {
    if (!selectedChat || !currentUser) return;
    const targetUserId = selectedChat.participants.find(p => p._id !== currentUser._id)?._id;
    if (!targetUserId) return;

    setIsVideoCall(isVideo);
    setCallData({ targetUserId, chatId: selectedChat._id });
    setIsIncomingCall(false);
    setIsCallOpen(true);

    socket.emit("call:initiate", {
      targetUserId,
      callerId: currentUser._id,
      callType: isVideo ? "video" : "audio",
      chatId: selectedChat._id
    });
  };

  const acceptCall = async () => {
    if (!callData) return;
    setIsIncomingCall(false);
    await webrtcManager.acceptCall(callData.callerId, callData.chatId, isVideoCall);
  };

  const rejectCall = () => {
    if (callData) {
      socket.emit("call:reject", { targetUserId: callData.callerId, callerId: currentUser._id });
    }
    setIsCallOpen(false);
  };

  const endCall = () => {
    webrtcManager.endCall(true);
    setIsCallOpen(false);
  };

  const getOtherParticipant = (chatObj) => {
    return chatObj?.participants?.find((p) => p._id !== currentUser?._id);
  };

  if (isMinimized) {
    const avatar = getOtherParticipant(selectedChat)?.profilePicture || getOtherParticipant(selectedChat)?.avatar;
    return (
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-brand-surface border-2 border-brand-blue shadow-sm flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity relative"
        >
          {selectedChat && avatar ? (
             <img src={getOptimizedUrl(avatar)} className="w-full h-full object-cover" alt="" />
          ) : (
             <MessageCircle size={24} className="text-brand-blue" />
          )}
          {/* Online Indicator for minimized head */}
          {selectedChat && onlineUsers.has(getOtherParticipant(selectedChat)?._id) && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-brand-teal border-2 border-white rounded-full"></div>
          )}
        </button>
      </div>
    );
  }

  return (
    <DraggableResizableWindow initialWidth={1200} initialHeight={720} minWidth={620} minHeight={420}>
      <div className="flex h-full w-full bg-brand-surface  overflow-hidden relative">
        {/* Call Overlay */}
        <CallInterface 
           isOpen={isCallOpen}
           isIncoming={isIncomingCall}
           callerName={callData?.callerName || getOtherParticipant(selectedChat)?.name || getOtherParticipant(selectedChat)?.username}
           callerAvatar={callData?.callerAvatar || getOtherParticipant(selectedChat)?.profilePicture}
           isVideoCall={isVideoCall}
           onAccept={acceptCall}
           onReject={rejectCall}
           onEnd={endCall}
        />

        <ChatSidebar 
          users={users}
          chats={chats}
          onlineUsers={onlineUsers}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onSelectUser={handleSelectUserFromDirectory}
          onStartNewChat={() => {}} // Could open a modal or just rely on Directory tab
        />

        <ChatWindow 
          chat={selectedChat}
          messages={messages}
          currentUser={currentUser}
          isOnline={selectedChat && onlineUsers.has(getOtherParticipant(selectedChat)?._id)}
          isTyping={isTyping}
          onSendMessage={(text) => { notifyTyping(); handleSendMessage(text); }}
          onSendFile={handleSendFile}
          onInitiateCall={initiateCall}
          onMinimize={() => setIsMinimized(true)}
          onUnsendMessage={handleUnsendMessage}
          onReactMessage={handleReactMessage}
          onDeleteMessage={handleDeleteMessage}
          onClose={() => router.push("/")}
        />
      </div>
    </DraggableResizableWindow>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[720px] w-full items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
