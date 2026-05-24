"use client";
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  Users,
  MessageCircle,
  Search,
  Hash,
  User as UserIcon,
  MoreVertical,
  Smile
} from "lucide-react";

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {message.sender?.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        )}

        <div className={`rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-purple-600 text-white'
            : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
        }`}>
          {!isOwn && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {message.sender?.name || "Unknown"}
            </div>
          )}
          <div className="text-sm">{message.content}</div>
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'
          }`}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

const OnlineUser = ({ user, isOnline }) => {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-4 h-4 text-white" />
          )}
        </div>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {user.name}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
};

export default function CommunityChat() {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  // Fetch initial messages and online users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setMessages([]);
        setOnlineUsers([]);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = {
        _id: Date.now().toString(),
        sender: currentUser || { _id: "temp", name: "You" },
        content: newMessage.trim(),
        createdAt: new Date()
      };

      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[600px] bg-white dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Community Chat
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {onlineUsers.filter(u => u.isOnline).length} online
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={message.sender?._id === currentUser?._id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Start the conversation!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded"
                >
                  <Smile className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-64 border-l border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
          <div className="p-4 border-b border-slate-100 dark:border-white/5">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
              Online ({onlineUsers.filter(u => u.isOnline).length})
            </h4>
          </div>
          <div className="p-2 max-h-full overflow-y-auto">
            {onlineUsers.map((user) => (
              <OnlineUser
                key={user._id}
                user={user}
                isOnline={user.isOnline}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
