"use client";
import React, { useState } from "react";
import { Heart, Download, Eye } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";

export const TemplateCard = ({ template }) => {
  const isFree = !template.price || template.price === 0;
  
  // Real data from template object
  // Backend returns: likes (not likesCount), isLiked, viewsCount
  const [likesCount, setLikesCount] = useState(template.likes || template.likeCount || 0);
  const [isLiked, setIsLiked] = useState(template.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const viewsCount = template.viewsCount || template.views || 0;
  
  // Image Source
  const imageSrc = template.previewFile || template.thumbnail;
  
  // Get creator image - check multiple possible fields
  const creatorImage = template.user?.profilePic || 
                       template.user?.profilePicture || 
                       template.user?.avatar ||
                       template.user?.image;

  // Like Handler with Animation
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return; // Prevent double clicks
    
    setIsLiking(true);
    
    try {
      const response = await api.post(`/template/${template._id}/like`);
      
      // Controller returns: { message, liked, queued }
      if (response.queued !== undefined) {
        setIsLiked(response.liked);
        setLikesCount(prev => response.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setTimeout(() => setIsLiking(false), 600); // Match animation duration
    }
  };

  // Download Handler
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Track download
      await api.post(`/template/${template._id}/download`);
      
      // Trigger actual download
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
        
        {/* 1. Image Container (Rounded, Clean) */}
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
                        <span className="text-4xl font-bold opacity-30">Ai</span>
                    </div>
                )}
            </Link>

            {/* Hover Overlay: Title + Actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-end justify-between">
                    <h3 className="text-white font-bold text-lg truncate max-w-[60%] drop-shadow-md">
                        {template.title}
                    </h3>
                    <div className="flex gap-2">
                        {/* Download Icon */}
                        <button 
                            onClick={handleDownload}
                            className="p-2.5 rounded-full bg-white text-gray-700 hover:text-blue-600 shadow-lg transition-colors"
                        >
                            <Download size={20} strokeWidth={2.5} />
                        </button>
                        {/* Like Icon with Animation */}
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
                                className={isLiking ? 'animate-like-bounce' : ''}
                            />
                            
                            {/* Particle Animation on Like */}
                            {isLiking && isLiked && (
                                <>
                                    <span className="absolute inset-0 animate-like-ping">
                                        <Heart size={20} className="text-red-500 opacity-75" fill="currentColor" />
                                    </span>
                                    {/* Floating particles */}
                                    {[...Array(6)].map((_, i) => (
                                        <span
                                            key={i}
                                            className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full animate-like-particle"
                                            style={{
                                                animationDelay: `${i * 0.1}s`,
                                                transform: `rotate(${i * 60}deg) translateY(-20px)`
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. Minimal Footer Meta */}
        <div className="flex items-center justify-between px-1">
            
            {/* Left: Author Info */}
            <div className="flex items-center gap-2 group/author cursor-pointer">
                 <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden ring-1 ring-gray-300 dark:ring-gray-600 flex-shrink-0">
                     {creatorImage ? (
                         <img 
                            src={creatorImage} 
                            alt={template.user?.name || "Creator"}
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">${(template.user?.name?.[0] || 'U').toUpperCase()}</div>`;
                            }}
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
                 <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                     PRO
                 </span>
            </div>

            {/* Right: Views Count (Real Data) */}
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                <Eye size={14} className="opacity-50" />
                <span>{viewsCount.toLocaleString()}</span>
            </div>

        </div>
        
        {/* CSS Animations */}
        <style jsx>{`
            @keyframes like-bounce {
                0%, 100% { transform: scale(1); }
                25% { transform: scale(1.3); }
                50% { transform: scale(0.9); }
                75% { transform: scale(1.1); }
            }
            
            @keyframes like-ping {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
            
            @keyframes like-particle {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-30px) scale(0); opacity: 0; }
            }
            
            .animate-like-bounce {
                animation: like-bounce 0.6s ease-in-out;
            }
            
            .animate-like-ping {
                animation: like-ping 0.6s ease-out;
            }
            
            .animate-like-particle {
                animation: like-particle 0.8s ease-out forwards;
            }
        `}</style>
    </div>
  );
};
