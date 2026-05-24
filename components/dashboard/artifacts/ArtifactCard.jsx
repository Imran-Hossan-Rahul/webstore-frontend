"use client";
import React, { useState } from "react";
import { Heart, Download, Eye } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

export const ArtifactCard = ({ artifact }) => {
  const [likesCount, setLikesCount] = useState(artifact.likes || artifact.likeCount || 0);
  const [isLiked, setIsLiked] = useState(artifact.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const { showToast } = useToast();
  const viewsCount = artifact.viewsCount || artifact.views || 0;
  
  const imageSrc = artifact.previewFile || artifact.thumbnail;
  const craftsmanImage = artifact.user?.profilePic || artifact.user?.profilePicture || artifact.user?.avatar || artifact.user?.image;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return;
    setIsLiking(true);
    
    try {
      const response = await api.post(`/artifact/${artifact._id}/like`);
      
      if (response.queued !== undefined) {
        setIsLiked(response.liked);
        setLikesCount(prev => response.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setTimeout(() => setIsLiking(false), 600);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.post(`/artifact/${artifact._id}/download`);
      
      if (artifact.devlogFile) {
        window.open(artifact.devlogFile, '_blank');
      } else {
        showToast("Download link not available", "warning");
      }
    } catch (error) {
      console.error("Download error:", error.message);
      showToast(error.message || "Failed to download artifact", "error");
    }
  };

  return (
    <div className="group flex flex-col gap-3 w-full bg-transparent">
        
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 transition-all duration-300">
            <Link href={`/artifacts/${artifact.slug || artifact._id}`} className="block w-full h-full">
                {imageSrc ? (
                    <img 
                        src={imageSrc} 
                        alt={artifact.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-600 bg-slate-50 dark:bg-white/5">
                        <span className="text-4xl font-bold opacity-30">T</span>
                    </div>
                )}
            </Link>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-end justify-between">
                    <h3 className="text-white font-bold text-lg truncate max-w-[60%] drop-shadow-md">
                        {artifact.title}
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownload}
                            className="p-2.5 rounded-full bg-white text-slate-700 hover:text-blue-600 shadow-lg transition-colors"
                        >
                            <Download size={20} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`relative p-2.5 rounded-full bg-white shadow-lg transition-colors ${
                                isLiked ? 'text-red-500' : 'text-slate-700 hover:text-red-500'
                            }`}
                        >
                            <Heart 
                                size={20} 
                                strokeWidth={1.5} 
                                fill={isLiked ? 'currentColor' : 'none'}
                                className={isLiking ? 'animate-bounce' : ''}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between px-1">
            
            <div className="flex items-center gap-2 group/author cursor-pointer">
                 <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden ring-1 ring-gray-300 dark:ring-gray-600 flex-shrink-0">
                     {craftsmanImage ? (
                         <img 
                            src={craftsmanImage} 
                            alt={artifact.user?.name || "Craftsman"}
                            className="w-full h-full object-cover" 
                         />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                             {(artifact.user?.name?.[0] || 'U').toUpperCase()}
                         </div>
                     )}
                 </div>
                 <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/author:text-indigo-600 transition-colors">
                     {artifact.user?.name || "Craftsman"}
                 </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                <Eye size={14} strokeWidth={1.5} className="opacity-50" />
                <span>{viewsCount.toLocaleString()}</span>
            </div>

        </div>
    </div>
  );
};


