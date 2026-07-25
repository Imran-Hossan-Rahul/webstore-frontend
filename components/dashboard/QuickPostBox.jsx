"use client";
import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Video, FileText, Sparkles, X, XCircle, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import { useRouter } from "next/navigation";

function CreatePostModal({ user, onClose, initialTab, onPostCreated }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Focus textarea on mount
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setMedia([...media, ...files.slice(0, 4 - media.length)]);
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", "post");
      
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
          onClose();
        }
      }
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
         onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#0f0f11] w-full max-w-[600px] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create a post</h2>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
           </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 flex items-center gap-3">
           <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-slate-200 dark:border-white/10">
             {user?.profilePicture || user?.avatar ? (
                <img src={user.profilePicture || user.avatar} alt="avatar" className="w-full h-full object-cover" />
             ) : (
                user?.name?.[0] || "U"
             )}
           </div>
           <div>
              <p className="font-bold text-slate-900 dark:text-white text-base">{user?.name || "User"}</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Post to Anyone</p>
           </div>
        </div>

        {/* Input Area */}
        <div className="px-5 pb-4 flex-1 overflow-y-auto max-h-[60vh]">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full min-h-[120px] bg-transparent border-none resize-none focus:ring-0 outline-none text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-500"
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4 rounded-xl overflow-hidden">
              {media.map((file, i) => (
                <div key={i} className="relative group aspect-square bg-slate-100 dark:bg-white/5">
                  {file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                       <Video className="w-10 h-10" />
                       <span className="text-xs font-semibold px-2 text-center truncate w-full">{file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
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
                className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400 tooltip-trigger"
                title="Add Image or Video"
              >
                <ImageIcon className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400 hidden sm:flex"
                title="Add Video"
              >
                <Video className="w-6 h-6" />
              </button>
           </div>
           
           <button
              onClick={handleSubmit}
              disabled={(!content.trim() && media.length === 0) || loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-white/10 disabled:text-slate-500 transition-all font-bold text-base flex items-center gap-2"
           >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Posting..." : "Post"}
           </button>
        </div>
      </div>
    </div>
  );
}

export default function QuickPostBox({ user, onPostCreated }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [initialTab, setInitialTab] = useState('text');

  const finalAvatar = user?.profilePicture || user?.avatar;

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-3 sm:p-4 mb-4 shadow-sm">
        {/* Top: Avatar + Pill Input */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex-shrink-0 bg-indigo-600 flex items-center justify-center text-white font-bold text-base border border-slate-200 dark:border-white/10">
             {finalAvatar ? (
                <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                user?.name?.[0] || "U"
             )}
          </div>
          <button 
             onClick={() => { setInitialTab('text'); setShowModal(true); }}
             className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-slate-400 text-sm font-medium cursor-pointer shadow-inner"
          >
             Start a post...
          </button>
        </div>

        {/* Bottom: Action Buttons */}
        <div className="flex items-center justify-between sm:justify-around px-1 pt-1">
           <button onClick={() => { setInitialTab('image'); setShowModal(true); }} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-[13px] sm:text-sm">
              <ImageIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-blue-500" /> <span>Photo</span>
           </button>

           <button onClick={() => { setInitialTab('video'); setShowModal(true); }} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-[13px] sm:text-sm">
              <Video className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-emerald-500" /> <span>Video</span>
           </button>

           <button onClick={() => router.push('/studio')} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-[13px] sm:text-sm">
              <FileText className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-orange-500" /> <span>Devlog</span>
           </button>

           <button onClick={() => router.push('/create')} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-[13px] sm:text-sm hidden lg:flex">
              <Sparkles className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-purple-500" /> <span>New Artifact</span>
           </button>
        </div>
      </div>

      {showModal && (
         <CreatePostModal 
            user={user} 
            onClose={() => setShowModal(false)} 
            initialTab={initialTab} 
            onPostCreated={onPostCreated} 
         />
      )}
    </>
  );
}
