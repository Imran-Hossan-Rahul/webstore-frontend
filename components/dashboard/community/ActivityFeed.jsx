"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { Zap, Palette, Code, FileText, MessageCircle, CheckCircle, User, Users, Image as ImageIcon } from "lucide-react";

import AppleSpinner from "@/components/ui/AppleSpinner";

const ActivityIcon = ({ type }) => {
  const iconProps = { className: "w-5 h-5" };

  switch (type) {
    case "working_on_devlog":
      return <Palette {...iconProps} className="text-indigo-600" />;
    case "sharing_task":
      return <CheckCircle {...iconProps} className="text-green-500" />;
    case "solving_problem":
      return <Code {...iconProps} className="text-purple-500" />;
    case "joined_collaboration":
      return <User {...iconProps} className="text-orange-500" />;
    case "completed_task":
      return <CheckCircle {...iconProps} className="text-emerald-500" />;
    case "started_chatting":
      return <MessageCircle {...iconProps} className="text-pink-500" />;
    case "created_post":
      return <FileText {...iconProps} className="text-indigo-500" />;
    case "updated_profile":
      return <User {...iconProps} className="text-cyan-500" />;
    default:
      return <Zap {...iconProps} className="text-slate-500" />;
  }
};

const ActivityItem = ({ activity }) => {
  const getActivityText = () => {
    switch (activity.type) {
      case "working_on_devlog":
        return `is working on "${activity.title}"`;
      case "sharing_task":
        return `shared a task: "${activity.title}"`;
      case "solving_problem":
        return `is solving: "${activity.title}"`;
      case "joined_collaboration":
        return `joined collaboration room "${activity.title}"`;
      case "completed_task":
        return `completed task: "${activity.title}"`;
      case "started_chatting":
        return `started a conversation`;
      case "created_post":
        return `created a new post: "${activity.title}"`;
      case "updated_profile":
        return `updated their profile`;
      default:
        return activity.title;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          {activity.user?.avatar ? (
            <img
              src={activity.user.avatar}
              alt={activity.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <ActivityIcon type={activity.type} />
          <span className="font-semibold text-slate-900 dark:text-white">
            {activity.user?.name || "Unknown User"}
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {getActivityText()}
          </span>
        </div>

        {activity.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
          {activity.devlogId && (
            <span className="flex items-center gap-1">
               {/* Icon removed */}
              Devlog
            </span>
          )}
          {activity.roomId && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Room
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/community/activities');
      if (res.success) {
        setActivities(res.data);
      } else {
        setError("Failed to load activities");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Error loading activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Set up real-time updates (would need socket integration)
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <AppleSpinner className="mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading community activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error.message || error}</p>
        <button
          onClick={fetchActivities}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[600px]">
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Live Activity Feed
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          See what the community is working on right now
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity._id} activity={activity} />
          ))
        ) : (
          <div className="p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No activities yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Be the first to share what you&apos;re working on!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

