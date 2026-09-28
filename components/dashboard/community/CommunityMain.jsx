"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import CraftsmanDiscovery from "./CreatorDiscovery";
import ResourceLibrary from "./ResourceLibrary";
import CreatePostModal from "./CreatePostModal";
import CreateDiscussionModal from "./CreateDiscussionModal";
import DiscussionChat from "./DiscussionChatNew";
import { Plus, Users, MessageSquare, CheckCircle2, Clock, TrendingUp, Zap, Search, Filter, User, Send, Share2, Bookmark, Star } from "lucide-react";

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function CommunityMain() {
  const [activeTab, setActiveTab] = useState("feed");
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCraftsmanDiscovery, setShowCraftsmanDiscovery] = useState(false);
  const [showResourceLibrary, setShowResourceLibrary] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);
  const [stats, setStats] = useState({
    activeMembers: 0,
    openTasks: 0,
    solvedToday: 0,
    activeNow: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch activities, tasks, and resources
      const [activitiesRes, tasksRes, resourcesRes] = await Promise.all([
        api.get("/community/activities").catch(() => ({ success: false, data: [] })),
        api.get("/community/tasks").catch(() => ({ success: false, data: [] })),
        api.get("/community/resources?limit=20").catch(() => ({ success: false, data: [] }))
      ]);

      // Combine all into unified feed
      const allActivities = [];

      // Add pure activities
      if (activitiesRes.success) {
        activitiesRes.data.forEach(act => {
          allActivities.push({ ...act, feedType: "activity" });
        });
      }

      // Add tasks as feed items
      if (tasksRes.success) {
        setTasks(tasksRes.data);
        tasksRes.data.forEach(task => {
          allActivities.push({
            _id: task._id,
            user: task.craftsman,
            type: "sharing_task",
            title: task.title,
            description: task.description,
            createdAt: task.createdAt,
            feedType: "task",
            taskData: task
          });
        });

        const openTasks = tasksRes.data.filter(t => t.status === "open").length;
        const solvedToday = tasksRes.data.filter(t => {
          const today = new Date().toDateString();
          return t.status === "solved" && new Date(t.updatedAt).toDateString() === today;
        }).length;
        setStats(prev => ({ ...prev, openTasks, solvedToday }));
      }

      // Add resources as feed items
      if (resourcesRes.success) {
        resourcesRes.data.forEach(resource => {
          allActivities.push({
            _id: resource._id,
            user: resource.craftsman,
            type: "created_post",
            title: resource.title,
            description: resource.description,
            createdAt: resource.createdAt,
            feedType: "resource",
            resourceData: resource
          });
        });
      }

      // Sort by date
      allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setActivities(allActivities);
      setStats(prev => ({ ...prev, activeNow: allActivities.length }));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Community Hub
          </h1>
          <p className="text-brand-slate dark:text-slate-400 mt-1">
            Connect, collaborate, and grow together
          </p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-sm transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Members"
          value={stats.activeMembers}
          color="purple"
        />
        <StatCard
          icon={MessageSquare}
          label="Open Tasks"
          value={stats.openTasks}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Solved Today"
          value={stats.solvedToday}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Now"
          value={stats.activeNow}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-navy/[0.08] dark:border-white/10">
        <TabButton
          active={activeTab === "feed"}
          onClick={() => setActiveTab("feed")}
          icon={Zap}
          label="Live Feed"
        />
        <TabButton
          active={activeTab === "tasks"}
          onClick={() => setActiveTab("tasks")}
          icon={MessageSquare}
          label="Help Board"
        />
        <TabButton
          active={activeTab === "trending"}
          onClick={() => setActiveTab("trending")}
          icon={TrendingUp}
          label="Trending"
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <LoadingState />
          ) : activeTab === "feed" ? (
            <ActivityFeed activities={activities} />
          ) : activeTab === "tasks" ? (
            <TasksList tasks={tasks} />
          ) : (
            <TrendingContent />
          )}
        </div>

        {/* Community Sidebar */}
        <div className="space-y-4">
          <OnlineUsers />
          <QuickActions 
            onStartDiscussion={() => setShowCreateDiscussion(true)}
            onFindCollaborators={() => setShowCraftsmanDiscovery(true)}
            onShareResource={() => setShowResourceLibrary(true)}
          />
          <TrendingTopics />
          <ActiveRooms />
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreated={fetchData}
        />
      )}

      {/* Craftsman Discovery Modal */}
      <CraftsmanDiscovery
        isOpen={showCraftsmanDiscovery}
        onClose={() => setShowCraftsmanDiscovery(false)}
      />

      {/* Resource Library Modal */}
      <ResourceLibrary
        isOpen={showResourceLibrary}
        onClose={() => setShowResourceLibrary(false)}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSuccess={fetchData}
      />

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={showCreateDiscussion}
        onClose={() => setShowCreateDiscussion(false)}
        onSuccess={fetchData}
      />

      {/* Discussion Chat */}
      {activeDiscussionId && (
        <DiscussionChat
          discussionId={activeDiscussionId}
          onClose={() => setActiveDiscussionId(null)}
        />
      )}
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500"
  };

  return (
    <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-brand-slate dark:text-slate-400">{label}</div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
      active
        ? "border-purple-600 text-purple-600"
        : "border-transparent text-brand-slate dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const ActivityFeed = ({ activities }) => (
  <div className="space-y-4">
    {activities.length > 0 ? (
      activities.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))
    ) : (
      <EmptyState message="No activities yet. Be the first to share!" />
    )}
  </div>
);

const ActivityCard = ({ activity }) => {
  const [likes, setLikes] = useState(activity.taskData?.solutions?.length || activity.resourceData?.likesCount || 0);
  const [comments, setComments] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const getActivityIcon = () => {
    if (activity.feedType === "task") return <MessageSquare className="w-5 h-5 text-purple-500" />;
    if (activity.feedType === "resource") return <Zap className="w-5 h-5 text-brand-blue" />;
    
    switch (activity.type) {
      case "working_on_devlog":
        return <Zap className="w-5 h-5 text-brand-blue" />;
      case "sharing_task":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case "completed_task":
        return <CheckCircle2 className="w-5 h-5 text-brand-teal" />;
      case "created_post":
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <Zap className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getActivityText = () => {
    if (activity.feedType === "task") return "shared a problem";
    if (activity.feedType === "resource") return "shared a resource";
    
    switch (activity.type) {
      case "working_on_devlog":
        return "is working on";
      case "sharing_task":
        return "shared a task";
      case "solving_problem":
        return "is solving";
      case "completed_task":
        return "completed";
      case "created_post":
        return "created a post";
      default:
        return "";
    }
  };

  const getBadge = () => {
    if (activity.feedType === "task" && activity.taskData) {
      const statusColors = {
        open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        solved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      };
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[activity.taskData.status]}`}>
          {activity.taskData.status}
        </span>
      );
    }
    if (activity.metadata?.postType === "discussion") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          Discussion
        </span>
      );
    }
    if (activity.metadata?.postType) {
      const typeColors = {
        comment: "bg-slate-100 dark:bg-brand-surface/10 text-brand-slate dark:text-slate-300",
        question: "bg-brand-blue/10 text-brand-blue",
        answer: "bg-brand-teal/10 text-brand-teal",
        issue: "bg-red-500/10 text-red-500",
        suggestion: "bg-brand-amber/10 text-brand-amber",
        critique: "bg-brand-blue/10 text-brand-blue",
        kudos: "bg-pink-500/10 text-pink-500"
      };
      const typeLabels = {
        comment: "General",
        question: "Question",
        answer: "Answer",
        issue: "Problem",
        suggestion: "Idea",
        critique: "Feedback",
        kudos: "Kudos"
      };
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[activity.metadata.postType] || typeColors.comment}`}>
          {typeLabels[activity.metadata.postType] || "General"}
        </span>
      );
    }
    return null;
  };

  const handleCardClick = () => {
    if (activity.metadata?.postType === "discussion" && activity.metadata?.discussionId) {
      setShowChat(true);
    }
  };

  return (
    <>
    <div onClick={handleCardClick} className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {activity.user?.name?.[0] || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {getActivityIcon()}
              <span className="font-bold text-slate-900 dark:text-white">
                {activity.user?.name || "Unknown"}
              </span>
              <span className="text-brand-slate dark:text-slate-400 text-sm">
                {getActivityText()}
              </span>
            </div>
            {getBadge()}
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
            {activity.title}
          </h3>
          {activity.description && (
            <p className="text-brand-slate dark:text-slate-300 mb-3 line-clamp-2">
              {activity.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">
                <Star className="w-4 h-4" />
                <span className="text-sm">{likes}</span>
              </button>
              <button className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{comments}</span>
              </button>
              <button className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-brand-teal transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {showChat && activity.metadata?.discussionId && (
      <DiscussionChat
        discussionId={activity.metadata.discussionId}
        onClose={() => setShowChat(false)}
      />
    )}
    </>
  );
};

const TasksList = ({ tasks }) => (
  <div className="space-y-4">
    {tasks.length > 0 ? (
      tasks.map((task) => <TaskCard key={task._id} task={task} />)
    ) : (
      <EmptyState message="No tasks yet. Share your first problem!" />
    )}
  </div>
);

const TaskCard = ({ task }) => {
  const statusColors = {
    open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    solved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  };

  return (
    <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {task.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[task.status]}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>
      <p className="text-brand-slate dark:text-slate-400 mb-4 line-clamp-2">
        {task.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {task.craftsman?.name}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {task.solutions?.length || 0}
          </span>
        </div>
        <div className="flex gap-2">
          {task.tags?.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendingContent = () => (
  <div className="space-y-4">
    <EmptyState message="Trending content coming soon!" />
  </div>
);

const OnlineUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/community/activities?limit=5");
        if (res.success) {
          const uniqueUsers = [];
          const userIds = new Set();
          res.data.forEach(activity => {
            if (activity.user && !userIds.has(activity.user._id)) {
              userIds.add(activity.user._id);
              uniqueUsers.push(activity.user);
            }
          });
          setUsers(uniqueUsers.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6">
      <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Recently Active
      </h3>
      <div className="space-y-3">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.[0] || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-teal border-2 border-white dark:border-black rounded-full" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.name || "Unknown"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Active recently
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No active users</p>
        )}
      </div>
    </div>
  );
};

const QuickActions = ({ onStartDiscussion, onFindCollaborators, onShareResource }) => (
  <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6">
    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      <Zap className="w-5 h-5 text-purple-600" />
      Quick Actions
    </h3>
    <div className="space-y-2">
      <ActionButton icon={MessageSquare} label="Start Discussion" onClick={onStartDiscussion} />
      <ActionButton icon={Users} label="Find Collaborators" onClick={onFindCollaborators} />
      <ActionButton icon={Zap} label="Share Resource" onClick={onShareResource} />
    </div>
  </div>
);

const TrendingTopics = () => {
  const topics = [
    { tag: "#React", count: 45 },
    { tag: "#Design", count: 38 },
    { tag: "#UI/UX", count: 32 },
    { tag: "#JavaScript", count: 28 },
    { tag: "#Figma", count: 24 }
  ];

  return (
    <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6">
      <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-600" />
        Trending Topics
      </h3>
      <div className="space-y-3">
        {topics.map((topic, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
              {topic.tag}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {topic.count} posts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActiveRooms = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/community/rooms?limit=3");
        if (res.success) {
          setRooms(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6">
      <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-brand-blue" />
        Active Rooms
      </h3>
      <div className="space-y-3">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room._id} className="p-3 bg-brand-cloud dark:bg-brand-surface/5 rounded-xl hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/10 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {room.name}
                </span>
                <span className="text-xs text-brand-teal flex items-center gap-1">
                  <div className="w-2 h-2 bg-brand-teal rounded-full" />
                  {room.participants?.length || 0}
                </span>
              </div>
              <p className="text-xs text-brand-slate dark:text-slate-400 line-clamp-1">
                {room.description}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No active rooms</p>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 text-left text-brand-slate dark:text-slate-300 hover:bg-brand-cloud dark:hover:bg-brand-surface/5 rounded-xl transition-all"
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const CreateTaskModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "design",
    tags: "",
    priority: "medium"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      const res = await api.post("/community/tasks", { ...formData, tags });
      if (res.success) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface dark:bg-black/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-brand-navy/[0.08] dark:border-white/10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Share Your Problem
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="What's your problem?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-xl bg-brand-surface dark:bg-black/40 text-slate-900 dark:text-white"
            required
          />
          <textarea
            placeholder="Describe in detail..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-xl bg-brand-surface dark:bg-black/40 text-slate-900 dark:text-white"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-xl bg-brand-surface dark:bg-black/40 text-slate-900 dark:text-white"
            >
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="ui/ux">UI/UX</option>
              <option value="other">Other</option>
            </select>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="px-4 py-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-xl bg-brand-surface dark:bg-black/40 text-slate-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-3 border border-brand-navy/[0.08] dark:border-white/10 rounded-xl bg-brand-surface dark:bg-black/40 text-slate-900 dark:text-white"
          />
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-brand-slate dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <AppleSpinner />
  </div>
);

const EmptyState = ({ message }) => {
  const createSampleActivity = async () => {
    try {
      await api.put("/community/activity", {
        type: "created_post",
        title: "Welcome to the Community!",
        description: "This is your first activity. Start sharing, collaborating, and growing together!"
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-12 text-center">
      <Zap className="w-16 h-16 text-slate-300 dark:text-brand-slate dark:text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        No activities yet
      </h3>
      <p className="text-brand-slate dark:text-slate-400 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={createSampleActivity}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
        >
          Create Your First Activity
        </button>
      </div>
    </div>
  );
};


