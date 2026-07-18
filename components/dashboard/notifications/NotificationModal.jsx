"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, ExternalLink, MessageCircle, Heart, UserPlus, ShoppingBag, Info } from "lucide-react";
import { api } from "@/utils/api";
import socket from "@/utils/socket";
import DraggableResizableWindow from "../chat/DraggableResizableWindow";

/**
 * NotificationModal
 * A floating, draggable notification system.
 */
export default function NotificationModal({ isOpen, onClose }) {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" or "unread"
  const [currentUser, setCurrentUser] = useState(null);

  // Sync props to internal state for backwards compatibility
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsOpenInternal(isOpen);
    }
  }, [isOpen]);

  // Event listener for toggle-notification event
  useEffect(() => {
    const handleToggleNotifEvent = () => {
      setIsOpenInternal((prev) => !prev);
    };

    window.addEventListener("toggle-notification", handleToggleNotifEvent);
    return () => {
      window.removeEventListener("toggle-notification", handleToggleNotifEvent);
    };
  }, []);

  const handleClose = () => {
    setIsOpenInternal(false);
    if (onClose) onClose();
  };

  const isModalOpen = isOpen !== undefined ? isOpen : isOpenInternal;

  // 1. Initial Data Fetch
  useEffect(() => {
    if (!isModalOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [
          api.get(`/notifications?filter=${filter}&limit=50`),
          api.get("/notifications/unread-count")
        ];
        
        if (!currentUser) promises.unshift(api.get("/user/profile"));
        else promises.unshift(Promise.resolve({ user: currentUser }));

        const [profileRes, notifRes, countRes] = await Promise.all(promises);

        const user = currentUser || profileRes.data || profileRes.user;
        if (!currentUser) setCurrentUser(user);

        if (notifRes.success) setNotifications(notifRes.notifications);
        if (countRes.success) setUnreadCount(countRes.count);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isModalOpen, filter]);

  // 2. Socket Listeners
  useEffect(() => {
    if (!currentUser?._id) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => {
        if (prev.some(n => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    };
    
    const handleSync = () => {
      if (isModalOpen) {
        api.get(`/notifications?filter=${filter}&limit=50`).then(res => {
          if (res.success) setNotifications(res.notifications);
        });
      }
    };

    socket.on(`user:${currentUser._id}:notification`, handleNewNotification);
    socket.on(`user:${currentUser._id}:notification-sync`, handleSync);
    
    return () => {
      socket.off(`user:${currentUser._id}:notification`, handleNewNotification);
      socket.off(`user:${currentUser._id}:notification-sync`, handleSync);
    };
  }, [currentUser?._id, isModalOpen, filter]);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notification-count-update', { detail: { count: 0 } }));
      // Trigger navbar badge reset
      socket.emit(`user:notification-reset-trigger`, { userId: currentUser?._id });
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-mark all as read when modal opens
  useEffect(() => {
    if (isModalOpen && unreadCount > 0) {
      markAllRead();
    }
  }, [isModalOpen, unreadCount]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        window.dispatchEvent(new CustomEvent('notification-count-update', { detail: { count: newCount } }));
        return newCount;
      });
      // Trigger navbar badge refresh
      socket.emit(`user:notification-reset-trigger`, { userId: currentUser?._id });
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "message": return <MessageCircle className="text-indigo-600" size={18} />;
      case "like": return <Heart className="text-red-500 fill-red-500" size={18} />;
      case "follow": return <UserPlus className="text-purple-500" size={18} />;
      case "purchase": return <ShoppingBag className="text-emerald-500" size={18} />;
      case "comment": return <MessageCircle className="text-amber-500" size={18} />;
      default: return <Info className="text-slate-500" size={18} />;
    }
  };

  if (!isModalOpen) return null;

  return (
    <DraggableResizableWindow 
      initialWidth={420} 
      initialHeight={600} 
      minWidth={350} 
      minHeight={400}
      storageKey="notification_window_state"
    >
      <div className="flex flex-col h-full w-full bg-white/90 dark:bg-black/90 backdrop-blur-2xl overflow-hidden relative rounded-2xl shadow-2xl border border-white/20 dark:border-white/5">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-white/5 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllRead}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-emerald-500"
              title="Mark all as read"
            >
              <Check size={20} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex px-4 py-3 gap-2 border-b border-slate-200/50 dark:border-white/5">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === "all" ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === "unread" ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}
          >
            Unread
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-3 space-y-2">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Bell size={48} className="mb-4 text-gray-300" />
              <p className="text-sm font-bold text-slate-500">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.read && markAsRead(notif._id)}
                className={`group relative flex gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${notif.read ? "bg-white/40 dark:bg-white/5 border-transparent opacity-80" : "bg-white dark:bg-white/10 border-slate-100 dark:border-white/10 shadow-sm"}`}
              >
                {/* Status Dot */}
                {!notif.read && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg shadow-blue-500/50" />
                )}

                {/* Sender Avatar / Icon */}
                <div className="shrink-0">
                  <div className="relative w-12 h-12">
                    <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/5">
                      {notif.sender?.profilePicture ? (
                        <img src={getOptimizedUrl(notif.sender.profilePicture)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="text-slate-400 font-bold text-sm uppercase">
                          {notif.sender?.name?.[0] || notif.sender?.username?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    {/* Floating Type Icon */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white dark:bg-black shadow-lg border border-slate-100 dark:border-white/10 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-[13px] leading-tight dark:text-gray-200 ${notif.read ? "font-medium" : "font-bold"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-2">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                    {notif.message}
                  </p>
                  
                  {notif.link && (
                    <a 
                      href={notif.link}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-black dark:text-white uppercase tracking-wider hover:underline"
                    >
                      View Details <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                {/* Inline Actions (Visible on Hover) */}
                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       // Logic to delete single notification if needed
                     }}
                     className="p-1.5 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">End of activities</p>
        </div>
      </div>
    </DraggableResizableWindow>
  );
}
