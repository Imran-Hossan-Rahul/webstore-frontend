"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  MessageCircle,
  Tag,
  User,
  Calendar,
  Zap
} from "lucide-react";

const TaskCard = ({ task, onTaskClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "solved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-gray-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div
      onClick={() => onTaskClick(task)}
      className="bg-white dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {task.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
            {task.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{task.craftsman?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{task.solutions?.length || 0} solutions</span>
          </div>
          {task.bounty?.isActive && (
            <div className="flex items-center gap-1 text-purple-600">
              <Zap className="w-4 h-4" />
              <span>{task.bounty.amount} TKNS</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
          <span className="text-xs">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
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
      const tags = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      const res = await api.post("/community/tasks", {
        ...formData,
        tags
      });

      if (res.success) {
        onTaskCreated(res.data);
        setFormData({
          title: "",
          description: "",
          category: "design",
          tags: "",
          priority: "medium"
        });
        onClose();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-white/10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Share Your Problem
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Get help from the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="What's your problem?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your problem in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="ui/ux">UI/UX</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Full Stack</option>
                <option value="mobile">Mobile</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="react, api, design, etc."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const res = await api.get(`/community/tasks?${params}`);
      if (res.success) {
        setTasks(res.data);
      } else {
        setError("Failed to load tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Error loading tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory, selectedStatus]);

  const filteredTasks = React.useMemo(() => {
    if (!searchTerm) return tasks;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowerSearchTerm) ||
      task.description.toLowerCase().includes(lowerSearchTerm) ||
      task.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
  }, [tasks, searchTerm]);

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleTaskClick = (task) => {
    // TODO: Open task detail modal
  };

  return (
    <div className="min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Task Board
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Share problems and get solutions from the community
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Share Problem
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="design">Design</option>
            <option value="development">Development</option>
            <option value="ui/ux">UI/UX</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Full Stack</option>
            <option value="mobile">Mobile</option>
            <option value="marketing">Marketing</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="solved">Solved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Task Grid */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error.message || error}</p>
            <button
              onClick={fetchTasks}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} onTaskClick={handleTaskClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "open"
                ? "Try adjusting your filters"
                : "Be the first to share a problem!"}
            </p>
            {!searchTerm && selectedCategory === "all" && selectedStatus === "open" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Share Your First Problem
              </button>
            )}
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}

