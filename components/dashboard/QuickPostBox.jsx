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
    <div className="bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {user?.name?.[0] || "U"}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            rows={3}
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {media.map((file, i) => (
                <div key={i} className="relative group">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-8 h-8 text-gray-400" />
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
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Add Image"
              >
                <Image className="w-5 h-5 text-green-500" />
              </button>
              <button
                type="button"
                onClick={() => setShowFullModal(true)}
                className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors font-medium"
              >
                + More Options
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && media.length === 0) || loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
