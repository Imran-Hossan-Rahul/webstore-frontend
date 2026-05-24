"use client";
import React from "react";
import Image from "next/image";
import { Download, Heart, Eye, MoreHorizontal, Layers } from "lucide-react";

/**
 * ArtifactCard
 * 
 * A versatile card for displaying artifacts (UI Kits, Code, etc).
 * Respects the 'shape' prop to adjust layout if necessary, but primarily fills the grid cell.
 * 
 * Design:
 * - Image Centric: Image takes up 100% space.
 * - Minimal Footer: Title and Price visible at bottom.
 * - Hover Actions: Download, Like, and details reveal on hover.
 */
const ArtifactCard = ({ 
  title, 
  thumbnail, 
  price, 
  priceType, 
  author, 
  likes, 
  downloads,
  category,
  imageRows // passed from parent, number of 50px units
}) => {
  
  // Convert rows to height style: (rows * 50px) + (gap compensation if needed)
  // Simple approximation: 50px * rows - gap/2? 
  // Actually, 'height: 100%' works if parent is sized by grid.
  // BUT here we want the IMAGE to be exactly 'imageRows' tall.
  // The Footer will take the rest.
  // Grid row gap is handled by the grid container.
  // We can just use 'h-[calc(50px*N_-_gap)]'?
  // Simpler: Use style={{ height: `${imageRows * 50}px` }} for image container?
  // Let's use relative sizing logic: flex-col.
  // Parent div is `grid-row-span-X`.
  // Image should take `imageRows/(imageRows+footerRows)` %?
  // No, let's use exact pixels for stability based on the 50px unit standard, minus a bit for gap if strictly needed.
  // Actually, `h-[${imageRows * 50}px]` is a good target.
  const imageHeight = `${imageRows * 50}px`;

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col`}>
      
      {/* Image Container - Fixed Aspect Ratio 3/2 (1536x1024) */}
      <div 
        className="relative w-full aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0"
      >
        
        {/* Placeholder or Real Image */}
        {thumbnail ? (
           <Image 
             src={thumbnail} 
             alt={title} 
             fill 
             className="object-cover transition-transform duration-700 group-hover:-translate-y-0.5"
           />
        ) : (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Layers className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-xs font-bold tracking-wider uppercase opacity-50">Preview</span>
           </div>
        )}

        {/* Hover Actions (Clean - Only on Image) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
            <button className="text-white hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-pink-500 hover:scale-110 transition-all">
                <Heart className="w-5 h-5" />
            </button>
        </div>

        {/* Price Badge (Top Left) */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-md text-slate-900 dark:text-white text-[10px] font-bold shadow-sm">
            {priceType === 'free' ? 'Free' : `${price} TKNS`}
        </div>
      </div>

      {/* Footer Info - Takes remaining space */}
      <div className="flex-1 p-2.5 bg-white dark:bg-[#0F0F0F] relative z-20 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
            <div>
                 <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight mb-0.5 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {title}
                 </h3>
                 <div className="flex items-center gap-1.5">
                    {author?.avatar ? (
                         <Image src={author.avatar} width={16} height={16} className="rounded-full" alt="" />
                    ) : ( 
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" />
                    )}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{author?.name || "Craftsman"}</span>
                 </div>
            </div>
        </div>

        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-white/5">
             <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider border border-slate-200 dark:border-slate-800 px-1 py-[1px] rounded">
                {category}
             </span>
             <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                <Heart className="w-3 h-3 group-hover:text-pink-500 transition-colors" />
                <span>{likes}</span>
             </div>
        </div>
      </div>

    </div>
  );
};

export default ArtifactCard;


