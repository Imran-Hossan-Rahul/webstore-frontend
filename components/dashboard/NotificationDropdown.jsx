"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { api } from "@/utils/api";
import { io } from "socket.io-client";
import Link from "next/link";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    
    const socket = io(process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL);
    const userId = localStorage.getItem("userId");
    
    if (userId) {
      socket.emit("user:online", userId);
      socket.on(`user:${userId}:notification`, () => {
        fetchUnreadCount();
        if (isOpen) fetchNotifications();
      });
    }

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res?.data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=10");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed right-4 top-20 w-[420px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-[100] animate-in slide-in-from-top-5 fade-in duration-200">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-600 dark:text-gray-400">No notifications yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">When you get notifications, they'll show up here</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer relative ${
                    !notif.read ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" : ""
                  }`}
                  onClick={async () => {
                    if (!notif.read) await markAsRead(notif._id);
                    setIsOpen(false);
                    if (notif.link) {
                      setTimeout(() => {
                        window.location.href = notif.link;
                      }, 100);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                      {notif.sender?.profilePicture ? (
                        <img src={notif.sender.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        notif.sender?.name?.[0] || "S"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white leading-snug">
                        <span className="font-semibold">{notif.sender?.name || "Someone"}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">{notif.message.replace(notif.sender?.name || "", "").trim()}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{getTimeAgo(notif.createdAt)}</p>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link href="/notifications">
              <div className="p-4 text-center text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold cursor-pointer border-t border-gray-200 dark:border-gray-800 transition-colors">
                See all notifications
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
