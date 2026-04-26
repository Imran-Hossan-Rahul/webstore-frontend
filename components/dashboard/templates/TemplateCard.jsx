"use client";
import React, { useState } from "react";
import { Heart, Download, Eye } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";

export const TemplateCard = ({ template }) => {
  const [likesCount, setLikesCount] = useState(template.likes || template.likeCount || 0);
  const [isLiked, setIsLiked] = useState(template.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const viewsCount = template.viewsCount || template.views || 0;
  
  const imageSrc = template.previewFile || template.thumbnail;
  const creatorImage = template.user?.profilePic || template.user?.profilePicture || template.user?.avatar || template.user?.image;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return;
    setIsLiking(true);
    
    try {
      const response = await api.post(`/template/${template._id}/like`);
      
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
      await api.post(`/template/${template._id}/download`);
      
      if (template.projectFile) {
        window.open(template.projectFile, '_blank');
      } else {
        alert("Download link not available");
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="group flex flex-col gap-3 w-full bg-transparent">
        
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 transition-all duration-300">
            <Link href={`/templates/${template.slug || template._id}`} className="block w-full h-full">
                {imageSrc ? (
                    <img 
                        src={imageSrc} 
                        alt={template.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-white/5">
                        <span className="text-4xl font-bold opacity-30">T</span>
                    </div>
                )}
            </Link>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-end justify-between">
                    <h3 className="text-white font-bold text-lg truncate max-w-[60%] drop-shadow-md">
                        {template.title}
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownload}
                            className="p-2.5 rounded-full bg-white text-gray-700 hover:text-blue-600 shadow-lg transition-colors"
                        >
                            <Download size={20} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`relative p-2.5 rounded-full bg-white shadow-lg transition-colors ${
                                isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                            }`}
                        >
                            <Heart 
                                size={20} 
                                strokeWidth={2.5} 
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
                     {creatorImage ? (
                         <img 
                            src={creatorImage} 
                            alt={template.user?.name || "Creator"}
                            className="w-full h-full object-cover" 
                         />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                             {(template.user?.name?.[0] || 'U').toUpperCase()}
                         </div>
                     )}
                 </div>
                 <span className="text-sm font-bold text-gray-900 dark:text-white group-hover/author:text-blue-500 transition-colors">
                     {template.user?.name || "Creator"}
                 </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                <Eye size={14} className="opacity-50" />
                <span>{viewsCount.toLocaleString()}</span>
            </div>

        </div>
    </div>
  );
};
