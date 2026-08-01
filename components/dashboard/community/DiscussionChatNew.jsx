"use client";
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";
import { X, Send, Users, MessageCircle, Paperclip, FileText, Download, Reply, ChevronDown, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import io from "socket.io-client";

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function DiscussionChat({ discussionId, onClose }) {
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    socketRef.current = io(socketUrl, { withCredentials: true, transports: ['polling', 'websocket'], autoConnect: typeof window !== 'undefined' });
    socketRef.current.emit('discussion:join', discussionId);
    
    socketRef.current.on('discussion:mediaUploaded', ({ messageId, attachment }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, attachments: [...(msg.attachments || []), attachment] }
          : msg
      ));
    });
    
    socketRef.current.on('discussion:newMessage', ({ message }) => {
      setMessages(prev => {
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
      if (res.success) setMessages(res.data);
      
      const discussionRes = await api.get(`/community/discussions`);
      if (discussionRes.success) {
        setDiscussion(discussionRes.data.find(d => d._id === discussionId));
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
      const formData = new FormData();
      formData.append("content", newMessage);
      if (replyingTo) formData.append("replyTo", replyingTo._id);
      
      selectedFiles.forEach(file => formData.append("media", file));

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/community/discussions/${discussionId}/messages`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
        credentials: "include"
      });

      if (res.ok) {
        const result = await res.json();
        // Socket will add the message
        setNewMessage("");
        setSelectedFiles([]);
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleThread = (msgId) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(msgId)) newSet.delete(msgId);
      else newSet.add(msgId);
      return newSet;
    });
  };

  const getReplies = (msgId) => messages.filter(m => m.replyTo === msgId);
  const getTopLevelMessages = () => messages.filter(m => !m.replyTo);

  const MessageComponent = ({ msg, isReply = false, depth = 0 }) => {
    const replies = getReplies(msg._id);
    const isExpanded = expandedThreads.has(msg._id);

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-slate-200 dark:border-white/10 pl-4' : ''}`}>
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {msg.author?.name?.[0] || "U"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {msg.author?.name || "Unknown"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
              </span>
              <button
                onClick={() => setReplyingTo(msg)}
                className="opacity-0 group-hover:opacity-100 text-xs text-indigo-600 hover:text-blue-600 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            </div>
            
            {msg.content && (
              <p className="text-slate-700 dark:text-gray-300 text-sm bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-2">
                {msg.content}
              </p>
            )}
            
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {msg.attachments.map((att, i) => (
                  <div key={i} className="relative group/att">
                    {att.type === "image" && (
                      <div className="relative inline-block">
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="max-w-sm max-h-96 rounded-xl object-cover cursor-pointer"
                          onClick={() => window.open(att.url, '_blank')}
                        />
                        <a href={att.url} download={att.name} className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg opacity-0 group-hover/att:opacity-100">
                          <Download className="w-4 h-4 text-white" />
                        </a>
                      </div>
                    )}
                    {att.type === "video" && (
                      <video src={att.url} controls className="max-w-sm rounded-xl" />
                    )}
                    {att.type === "file" && (
                      <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-white/5 rounded-xl max-w-sm">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm flex-1 truncate">{att.name}</span>
                        <a href={att.url} download={att.name}>
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {replies.length > 0 && (
              <button
                onClick={() => toggleThread(msg._id)}
                className="flex items-center gap-2 mt-2 text-xs text-indigo-600 hover:text-blue-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map(reply => (
              <MessageComponent key={reply._id} msg={reply} isReply={true} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-4xl w-full h-[80vh] shadow-2xl border border-white/10 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {discussion?.topic || "Discussion"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <AppleSpinner />
            </div>
          ) : getTopLevelMessages().length > 0 ? (
            getTopLevelMessages().map(msg => (
              <MessageComponent key={msg._id} msg={msg} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p>No messages yet</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-200 dark:border-white/10">
          {replyingTo && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Replying to {replyingTo.author?.name}
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-blue-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative bg-slate-100 dark:bg-white/5 rounded-lg p-2 pr-8">
                  <span className="text-xs">{file.name}</span>
                  <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])} multiple accept="image/*,video/*,.pdf,.zip,.doc,.docx,.txt" className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5">
              <Paperclip className="w-5 h-5 text-slate-500" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
            />
            <button type="submit" disabled={!newMessage.trim() && selectedFiles.length === 0} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
