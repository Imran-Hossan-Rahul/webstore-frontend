"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "@/utils/api";
import { X, Send, Users, MessageCircle, Paperclip, FileText, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import io from "socket.io-client";

export default function DiscussionChat({ discussionId, onClose }) {
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Connect to socket
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    socketRef.current = io(socketUrl);
    
    // Join discussion room
    socketRef.current.emit('discussion:join', discussionId);
    
    // Listen for media uploads
    socketRef.current.on('discussion:mediaUploaded', ({ messageId, attachment }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, attachments: [...(msg.attachments || []), attachment] }
          : msg
      ));
    });
    
    // Listen for new messages from other users
    socketRef.current.on('discussion:newMessage', ({ message }) => {
      setMessages(prev => {
        // Check if message already exists
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });
    
    return () => {
      socketRef.current?.emit('discussion:leave', discussionId);
      socketRef.current?.disconnect();
    };
  }, [discussionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/community/discussions/${discussionId}/messages`);
      if (res.success) {
        setMessages(res.data);
      }
      const discussionRes = await api.get(`/community/discussions`);
      if (discussionRes.success) {
        const disc = discussionRes.data.find(d => d._id === discussionId);
        setDiscussion(disc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("content", newMessage);
        if (replyingTo) formData.append("replyTo", replyingTo._id);
        
        selectedFiles.forEach(file => {
          formData.append("media", file);
        });

        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}'';
        const res = await fetch(`${apiUrl}/community/discussions/${discussionId}/messages`, {
          method: "POST",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
          body: formData,
          credentials: "include"
        });

        if (res.ok) {
          const result = await res.json();
          // Add message immediately (attachments will be added via socket)
          setMessages(prev => [...prev, result.data]);
          setNewMessage("");
          setSelectedFiles([]);
          setReplyingTo(null);
        } else {
          const error = await res.text();
          console.error('Upload failed:', res.status, error);
        }
      } else {
        const res = await api.post(`/community/discussions/${discussionId}/messages`, {
          content: newMessage,
          replyTo: replyingTo?._id
        });
        
        if (res.success) {
          setNewMessage("");
          setReplyingTo(null);
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const markAsRead = async (messageId) => {
    try {
      await api.post(`/community/discussions/${discussionId}/messages/${messageId}/read`);
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const toggleReplies = (messageId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
    // Mark message as read when expanding replies
    if (!expandedReplies[messageId]) {
      markAsRead(messageId);
    }
  };

  const getRepliesForMessage = (messageId) => {
    return messages.filter(msg => msg.replyTo === messageId);
  };

  const sortedMainMessages = useMemo(() => {
    const mainMsgs = messages.filter(msg => !msg.replyTo);
    // Sort by latest activity (last reply time or message creation time)
    return mainMsgs.sort((a, b) => {
      const aReplies = messages.filter(msg => msg.replyTo === a._id);
      const bReplies = messages.filter(msg => msg.replyTo === b._id);
      const aLastActivity = aReplies.length > 0 
        ? new Date(aReplies[aReplies.length - 1].createdAt)
        : new Date(a.createdAt);
      const bLastActivity = bReplies.length > 0
        ? new Date(bReplies[bReplies.length - 1].createdAt)
        : new Date(b.createdAt);
      return bLastActivity - aLastActivity;
    });
  }, [messages]);

  const categoryColors = {
    general: "bg-gray-500",
    technical: "bg-blue-500",
    design: "bg-purple-500",
    business: "bg-green-500",
    feedback: "bg-orange-500",
    announcement: "bg-red-500"
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-4xl w-full h-[80vh] shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${categoryColors[discussion?.category] || "bg-gray-500"}`}>
                  {discussion?.category || "General"}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{discussion?.participants?.length || 0} participants</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {discussion?.topic || "Discussion"}
              </h2>
              {discussion?.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  {discussion.description}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : messages.length > 0 ? (
            sortedMainMessages.map((msg, idx) => {
              const replies = getRepliesForMessage(msg._id);
              const imageReplies = replies.filter(r => r.attachments?.some(a => a.type === "image"));
              const otherReplies = replies.filter(r => !r.attachments?.some(a => a.type === "image"));
              const sortedReplies = [...imageReplies, ...otherReplies];
              const unreadCount = msg.unreadReplyCount || 0;

              return (
                <div key={msg._id || idx} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {msg.author?.name?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {msg.author?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {msg.content && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-2">
                        {msg.content}
                      </p>
                    )}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-3 mt-2">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="relative group">
                            {att.type === "image" && (
                              <div className="relative inline-block">
                                <img 
                                  src={att.url} 
                                  alt={att.name} 
                                  className="max-w-sm max-h-96 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                  onClick={() => window.open(att.url, '_blank')}
                                />
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </a>
                            </div>
                          )}
                          {att.type === "video" && (
                            <div className="relative inline-block">
                              <video 
                                src={att.url} 
                                controls 
                                className="max-w-sm max-h-96 rounded-xl"
                                preload="metadata"
                              />
                              <a
                                href={att.url}
                                download={att.name}
                                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </a>
                            </div>
                          )}
                          {att.type === "file" && (
                            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors max-w-sm">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{att.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(att.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <a
                                href={att.url}
                                download={att.name}
                                className="p-2 hover:bg-gray-300 dark:hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                              >
                                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </a>
                            </div>
                          )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Button and Count */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Reply
                      </button>
                      {replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(msg._id)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                          {unreadCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Replies Section */}
                    {expandedReplies[msg._id] && sortedReplies.length > 0 && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 dark:border-white/10 space-y-3">
                        {sortedReplies.map((reply, ridx) => (
                          <div key={reply._id || ridx} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {reply.author?.name?.[0] || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 dark:text-white text-xs">
                                  {reply.author?.name || "Unknown"}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {reply.content && (
                                <p className="text-gray-700 dark:text-gray-300 text-xs bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                                  {reply.content}
                                </p>
                              )}
                              {reply.attachments && reply.attachments.length > 0 && (
                                <div className="space-y-2 mt-2">
                                  {reply.attachments.map((att, i) => (
                                    <div key={i} className="relative group">
                                      {att.type === "image" && (
                                        <img 
                                          src={att.url} 
                                          alt={att.name} 
                                          className="max-w-xs max-h-48 rounded-lg object-cover cursor-pointer"
                                          onClick={() => window.open(att.url, '_blank')}
                                        />
                                      )}
                                      {att.type === "video" && (
                                        <video 
                                          src={att.url} 
                                          controls 
                                          className="max-w-xs max-h-48 rounded-lg"
                                        />
                                      )}
                                      {att.type === "file" && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-xs">
                                          <FileText className="w-4 h-4 text-blue-500" />
                                          <span className="text-gray-900 dark:text-white">{att.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-white/10">
          {replyingTo && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Replying to <span className="font-bold">{replyingTo.author?.name}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative bg-gray-100 dark:bg-white/5 rounded-lg p-2 pr-8">
                  <span className="text-xs text-gray-700 dark:text-gray-300">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*,.pdf,.zip,.doc,.docx,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
