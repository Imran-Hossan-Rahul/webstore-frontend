"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";

export default function NotificationsMain() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?filter=${filter}&limit=50`);
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-black">Notifications</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-slate-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === "unread"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-slate-100"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.read) markAsRead(notif._id);
                if (notif.link) window.location.href = notif.link;
              }}
              className={`bg-white dark:bg-slate-900 rounded-[26px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                !notif.read ? "border-l-4 border-indigo-600" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {notif.sender?.name?.[0] || notif.type[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
                    {notif.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{notif.message}</p>
                  <p className="text-sm text-slate-500 mt-2">{getTimeAgo(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <div className="w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

