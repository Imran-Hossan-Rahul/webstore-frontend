"use client";
import React, { useState } from "react";
import { api } from "@/utils/api";
import { X, MessageCircle } from "lucide-react";

const CATEGORIES = [
  { id: "general", label: "General", color: "bg-slate-500" },
  { id: "technical", label: "Technical", color: "bg-brand-blue" },
  { id: "design", label: "Design", color: "bg-purple-500" },
  { id: "business", label: "Business", color: "bg-brand-teal" },
  { id: "feedback", label: "Feedback", color: "bg-orange-500" },
  { id: "announcement", label: "Announcement", color: "bg-red-500" }
];

export default function CreateDiscussionModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    category: "general",
    tags: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      const res = await api.post("/community/discussions", { ...formData, tags });
      if (res.success) {
        onSuccess();
        setFormData({ topic: "", description: "", category: "general", tags: "" });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-2xl w-full shadow-2xl border border-white/10">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Start Discussion
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-slate dark:text-slate-300 mb-3">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.category === cat.id
                      ? `${cat.color} text-white border-transparent`
                      : "border-slate-200 dark:border-white/10 text-brand-slate dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-slate dark:text-slate-300 mb-2">
              Discussion Topic
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="What would you like to discuss?"
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-slate dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Provide context for the discussion..."
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-slate dark:text-slate-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="react, design, api, etc."
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-brand-slate dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-medium"
            >
              {loading ? "Creating..." : "Start Discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
