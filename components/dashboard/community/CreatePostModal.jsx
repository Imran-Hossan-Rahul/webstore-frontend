"use client";
import React, { useState } from "react";
import { api } from "@/utils/api";
import { X, Send, MessageCircle, HelpCircle, CheckCircle, AlertCircle, Lightbulb, Eye, Flame } from "lucide-react";

const POST_TYPES = [
  { id: 'comment', label: 'General', icon: MessageCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-white/10' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'answer', label: 'Answer', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'issue', label: 'Problem', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'suggestion', label: 'Idea', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'critique', label: 'Feedback', icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'kudos', label: 'Kudos', icon: Flame, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export default function CreatePostModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "comment"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/community/activity", {
        type: "created_post",
        title: formData.title,
        description: formData.content,
        metadata: { postType: formData.type }
      });
      if (res.success) {
        onSuccess();
        setFormData({ title: "", content: "", type: "comment" });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = POST_TYPES.find(t => t.id === formData.type) || POST_TYPES[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-2xl w-full shadow-2xl border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Post
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Post Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {POST_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.type === type.id
                      ? `${type.bg} ${type.color} border-current`
                      : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              placeholder="Share your thoughts, ideas, or questions..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Preview Badge */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Preview:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${selectedType.bg} ${selectedType.color}`}>
                <selectedType.icon size={12} />
                {selectedType.label}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {formData.title || "Your title will appear here"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "Posting..." : "Post to Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
