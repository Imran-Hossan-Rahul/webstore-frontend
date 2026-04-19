"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Plus, Paperclip, Send, Download, Phone, Mail, User as UserIcon, X, MessageCircle } from "lucide-react";
import { api } from "@/utils/api";
import socket from "@/utils/socket";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [mediaTab, setMediaTab] = useState("Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch current user and connect socket
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/user/profile");
        setCurrentUser(res.user);
        // Notify server that user is online
        socket.emit("user:online", res.user._id);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchCurrentUser();

    // Listen for user status changes
    socket.on("user:status", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (status === "online") {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    return () => {
      socket.off("user:status");
    };
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/chat/users");
        setUsers(res.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch user chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/chat/chats");
        setChats(res.chats || []);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };
    fetchChats();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    // Join chat room
    socket.emit("chat:join", selectedChat._id);

    const handleNewMessage = (message) => {
      // Only add message if it's from another user (prevent duplicate)
      if (message.sender?._id !== currentUser._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ userId, typing }) => {
      if (userId !== currentUser._id) {
        setIsTyping(typing);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("user:typing", handleTyping);

    return () => {
      socket.emit("chat:leave", selectedChat._id);
      socket.off("message:new", handleNewMessage);
      socket.off("user:typing", handleTyping);
    };
  }, [selectedChat, currentUser]);

  // Listen for new messages in any chat
  useEffect(() => {
    if (!currentUser) return;

    const handleNewChatMessage = ({ chatId, message }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? { ...chat, lastMessage: { content: message.content, createdAt: message.createdAt } }
            : chat
        )
      );
    };

    socket.on(`user:${currentUser._id}:newMessage`, handleNewChatMessage);

    return () => {
      socket.off(`user:${currentUser._id}:newMessage`, handleNewChatMessage);
    };
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Select user and load/create chat
  const handleSelectUser = async (user) => {
    try {
      const res = await api.get(`/chat/chat/${user._id}`);
      setSelectedChat(res.chat);
      const msgRes = await api.get(`/chat/messages/${res.chat._id}`);
      setMessages(msgRes.messages || []);
      
      // Mark as read
      await api.put(`/chat/read/${res.chat._id}`);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (!selectedChat) return;
    
    socket.emit("typing:start", { chatId: selectedChat._id, userId: currentUser?._id });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser?._id });
    }, 1000);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send file
  const handleSendFile = async () => {
    if (!selectedFile || !selectedChat) return;

    try {
      setUploading(true);
      
      // Use file preview as fileUrl for images
      const fileUrl = filePreview || null;
      const fileType = selectedFile.type.startsWith("image/") ? "image" : "file";
      
      console.log('Sending file:', {
        fileName: selectedFile.name,
        type: fileType,
        hasFileUrl: !!fileUrl,
        fileUrlLength: fileUrl?.length
      });
      
      const res = await api.post(`/chat/message/${selectedChat._id}`, {
        content: selectedFile.name,
        type: fileType,
        fileName: selectedFile.name,
        fileUrl: fileUrl
      });
      
      console.log('Message sent:', res.message);
      
      setMessages((prev) => [...prev, res.message]);
      handleRemoveFile();
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send file:", error);
    } finally {
      setUploading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    // If file is selected, send file instead
    if (selectedFile) {
      await handleSendFile();
      return;
    }

    if (!newMessage.trim() || !selectedChat) return;

    try {
      socket.emit("typing:stop", { chatId: selectedChat._id, userId: currentUser?._id });
      
      const res = await api.post(`/chat/message/${selectedChat._id}`, {
        content: newMessage,
        type: "text"
      });
      setMessages((prev) => [...prev, res.message]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
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

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayList = activeTab === "All" ? filteredUsers : [];

  const newChatFilteredUsers = users.filter((user) => {
    const searchLower = newChatSearch.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleStartNewChat = async (user) => {
    setShowNewChatModal(false);
    setNewChatSearch("");
    await handleSelectUser(user);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="p-2 hover:bg-blue-50 rounded-full transition group"
              title="Start New Chat"
            >
              <Plus size={20} className="text-gray-600 group-hover:text-blue-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {["All", "Archive", "Unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {displayList.length === 0 && activeTab === "All" && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No conversations yet</p>
              <p className="text-sm text-gray-400 mb-4">Start chatting with other users</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Start New Chat
              </button>
            </div>
          )}
          {displayList.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition ${
                selectedChat && getOtherParticipant(selectedChat)?._id === user._id ? "bg-blue-50" : ""
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                {isUserOnline(user._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 truncate">{user.name || user.username}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {getOtherParticipant(selectedChat)?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">
                  {getOtherParticipant(selectedChat)?.username || "User"}
                </h2>
                <p className={`text-xs ${isUserOnline(getOtherParticipant(selectedChat)?._id) ? "text-green-500" : "text-gray-400"}`}>
                  {isUserOnline(getOtherParticipant(selectedChat)?._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => {
                // Check if message is from current user
                const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
                const currentUserId = currentUser?._id || currentUser?.id;
                const isOwn = senderId?.toString() === currentUserId?.toString();
                
                return (
                  <div key={msg._id || idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md ${isOwn ? "order-2" : "order-1"}`}>
                      <div
                        className={`rounded-2xl ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {/* Image Message */}
                        {msg.type === "image" && (
                          <div className="p-1">
                            {msg.fileUrl ? (
                              <img 
                                src={msg.fileUrl} 
                                alt={msg.fileName || "Image"} 
                                className="max-w-xs rounded-lg cursor-pointer"
                                onClick={() => window.open(msg.fileUrl, '_blank')}
                              />
                            ) : (
                              <div className="px-4 py-2 flex items-center gap-2">
                                <Paperclip size={18} />
                                <p className="text-sm">{msg.fileName || msg.content}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* File Message */}
                        {msg.type === "file" && (
                          <a
                            href={msg.fileUrl || '#'}
                            download={msg.fileName || msg.content}
                            onClick={(e) => {
                              if (!msg.fileUrl) {
                                e.preventDefault();
                                alert('File URL not available');
                              }
                            }}
                            className="px-4 py-2 flex items-center gap-2 hover:opacity-80 transition"
                          >
                            <Paperclip size={18} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{msg.fileName || msg.content}</p>
                              <p className="text-xs opacity-75">Click to download</p>
                            </div>
                            <Download size={16} />
                          </a>
                        )}
                        
                        {/* Text Message */}
                        {msg.type === "text" && (
                          <p className="text-sm px-4 py-2">{msg.content}</p>
                        )}
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Paperclip size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-gray-200 rounded-full transition"
                    >
                      <X size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
                >
                  <Paperclip size={20} className="text-gray-600" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={!!selectedFile}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={uploading || (!newMessage.trim() && !selectedFile)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Profile */}
      {selectedChat && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Profile Section */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {getOtherParticipant(selectedChat)?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {getOtherParticipant(selectedChat)?.username || "User"}
              </h2>
              <p className="text-sm text-gray-500">{getOtherParticipant(selectedChat)?.role || "User"}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-600">Not available</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-600">{getOtherParticipant(selectedChat)?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <UserIcon size={18} className="text-gray-400" />
                <span className="text-gray-600">@{getOtherParticipant(selectedChat)?.username || "user"}</span>
              </div>
            </div>

            {/* Media Section */}
            <div>
              <div className="flex border-b border-gray-200 mb-4">
                {["Files", "Media", "Links"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMediaTab(tab)}
                    className={`flex-1 py-2 text-sm font-medium transition ${
                      mediaTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Files Tab */}
              {mediaTab === "Files" && (
                <div className="space-y-2">
                  {messages.filter(m => m.type === "file").length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">No files shared yet</p>
                    </div>
                  ) : (
                    messages.filter(m => m.type === "file").map((msg, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <Paperclip size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{msg.fileName || msg.content}</p>
                          <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</p>
                        </div>
                        <a 
                          href={msg.fileUrl || '#'} 
                          download={msg.fileName || msg.content}
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={(e) => {
                            if (!msg.fileUrl) {
                              e.preventDefault();
                              alert('File not available for download');
                            }
                          }}
                        >
                          <Download size={16} className="text-gray-600" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Media Tab */}
              {mediaTab === "Media" && (
                <div className="grid grid-cols-3 gap-2">
                  {messages.filter(m => m.type === "image" && m.fileUrl).length === 0 ? (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      <p className="text-sm">No media shared yet</p>
                    </div>
                  ) : (
                    messages.filter(m => m.type === "image" && m.fileUrl).map((msg, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(msg.fileUrl, '_blank')}
                      >
                        <img 
                          src={msg.fileUrl} 
                          alt={msg.fileName || 'Image'} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Links Tab */}
              {mediaTab === "Links" && (
                <div className="space-y-2">
                  {messages.filter(m => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    return m.type === "text" && urlRegex.test(m.content);
                  }).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">No links shared yet</p>
                    </div>
                  ) : (
                    messages.filter(m => {
                      const urlRegex = /(https?:\/\/[^\s]+)/g;
                      return m.type === "text" && urlRegex.test(m.content);
                    }).map((msg, idx) => {
                      const urlRegex = /(https?:\/\/[^\s]+)/g;
                      const links = msg.content.match(urlRegex);
                      return links?.map((link, linkIdx) => (
                        <a
                          key={`${idx}-${linkIdx}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 hover:bg-gray-50 rounded-lg transition"
                        >
                          <p className="text-sm text-blue-600 truncate">{link}</p>
                          <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</p>
                        </a>
                      ));
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Start New Chat</h2>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatSearch("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4">
              {newChatFilteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No users found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {newChatFilteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleStartNewChat(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition group"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        {isUserOnline(user._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        {user.role && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {user.role}
                          </span>
                        )}
                      </div>
                      <MessageCircle size={18} className="text-gray-400 group-hover:text-blue-600 transition" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                Select a user to start chatting • {newChatFilteredUsers.length} user{newChatFilteredUsers.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
