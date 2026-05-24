"use client";
import React, { useState, useRef } from "react";
import { Image, Video, FileText, Smile, X } from "lucide-react";
import { api } from "@/utils/api";

export default function QuickPostBox({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", "text");
      
      media.forEach(file => formData.append("media", file));

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/posts`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
        credentials: "include"
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setContent("");
          setMedia([]);
          onPostCreated?.(result.data);
        }
      }
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setMedia([...media, ...files.slice(0, 4 - media.length)]);
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          {user?.name?.[0] || "U"}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg resize-none focus:border-slate-400 dark:focus:border-slate-500 outline-none text-slate-900 dark:text-white placeholder-gray-400 transition-all"
            rows={3}
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {media.map((file, i) => (
                <div key={i} className="relative group">
                  <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Add Image"
              >
                <Image className="w-5 h-5 text-green-500" />
              </button>
              <button
                type="button"
                onClick={() => setShowFullModal(true)}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium"
              >
                + More Options
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && media.length === 0) || loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
