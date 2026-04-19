"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Eye, Download, MessageCircle } from "lucide-react";
import axios from "axios";
import { CARD_SHAPES } from "@/constants/cardShapes";
import { useToast } from "@/components/ui/ToastProvider";

export default function VideoCard({ item, type }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likesCount || 0);
  const [following, setFollowing] = useState(item.author?.isFollowing || false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Normalize Data
  const isTemplate = type === "template";
  const title = item.title;
  const description = item.description || item.excerpt;
  const image = item.coverImage || item.thumbnail;
  const author = item.author || item.user; 
  const slug = item.slug;
  const tags = item.tags || [];

  // Card Shape Logic
  const shapeKey = item.cardShape || "square-medium";
  const shapeConfig = CARD_SHAPES[shapeKey] || CARD_SHAPES["square-medium"];
  // Use config values or defaults (Granular Grid System)
  const gridRowSpan = shapeConfig.rows || 28; 
  const imagePixelHeight = shapeConfig.height || 260; 
  const colSpanClass = shapeConfig.colSpan || "col-span-1";

  // Interaction Handlers
  const handleClick = () => {
     if (isTemplate) router.push(`/templates/${slug}`);
     else router.push(`/blogs/${slug}`); 
  };

  const handleLike = async (e) => {
      e.stopPropagation();
      const token = localStorage.getItem("token");
      if (!token) {
          showToast("Please login to like posts.", "info", "Login Required");
          return;
      }

      // Optimistic
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      try {
          const endpoint = isTemplate 
             ? ${process.env.NEXT_PUBLIC_API_URL}/template/${slug}/like`
             : ${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}/like`;
          
          await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
          console.error("Like failed", err);
          setLiked(!liked); // Revert
          setLikeCount(prev => liked ? prev + 1 : prev - 1);
      }
  };

  const handleDownload = (e) => {
      e.stopPropagation();
      window.open(item.fileUrl || "#", "_blank");
  };

  const handleFollow = async (e) => {
      e.stopPropagation();
      const token = localStorage.getItem("token");
      if (!token) {
          showToast("Please login to follow creators.", "info", "Login Required");
          return;
      }
      if (!author?._id) return;

      setLoadingFollow(true);
      const prevFollowing = following;
      setFollowing(!following);

      try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/follow/${author._id}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
          );
      } catch (err) {
          console.error("Follow error", err);
          setFollowing(prevFollowing);
          showToast("Failed to update follow status. Please try again.", "error", "Error");
      } finally {
          setLoadingFollow(false);
      }
  };

  const handleChat = (e) => {
      e.stopPropagation();
      const token = localStorage.getItem("token");
      if (!token) {
          showToast("Please login to start a chat.", "info", "Login Required");
          return;
      }
      if (author?._id) {
        router.push(`/user/creator/chat?targetUser=${author._id}`);
      }
  };

  // Render Helpers
  const truncatedTitle = title.length > 60 ? title.substring(0, 60) + "..." : title;
  const displayedTags = tags.slice(0, 3);
  const isFree = item.price === 0;

  // Blog Card (Text-Focused)
  if (!isTemplate) {
      return (
        <div 
            className={`flex flex-col ${colSpanClass} group cursor-pointer`}
            style={{ gridRowEnd: `span ${gridRowSpan > 20 ? 20 : gridRowSpan}` }}
            onClick={handleClick}
        >
             <div className="bg-white dark:bg-gray-900 rounded-xl p-4 h-full flex flex-col hover:shadow-md transition-shadow">
                 <h3 className="font-semibold text-base leading-snug text-gray-900 dark:text-white mb-2 line-clamp-2">
                     {title}
                 </h3>
                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                     {description || "Read more about this topic..."}
                 </p>
                 <div className="flex items-center gap-2 mt-auto">
                    <img 
                        src={author?.profilePic || author?.avatar || "/placeholder.png"} 
                        className="w-5 h-5 rounded-full object-cover" 
                        alt="Author" 
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{author?.name || "Writer"}</span>
                    <span className="text-xs text-gray-500 ml-auto">Read</span>
                    <span className="text-xs text-gray-400">{item.readTime || "5 min read"}</span>
                 </div>
             </div>
        </div>
      );
  }

  // Template Card (Image-Focused)
  return (
    <div 
        className={`flex flex-col ${colSpanClass} group cursor-pointer`}
        style={{ gridRowEnd: `span ${gridRowSpan}` }}
    >
      {/* Card Container */}
      <div
        className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg w-full bg-gray-100 dark:bg-gray-800 transition-all duration-300"
        style={{ height: `${imagePixelHeight}px` }}
        onClick={handleClick}
      >
        {/* Price Badge */}
        <div className="absolute top-3 left-3 z-20">
             {isFree ? (
               <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md">FREE</span>
             ) : (
               <span className="bg-white text-gray-900 px-2.5 py-1 rounded-md font-semibold text-xs">${item.price}</span>
             )}
        </div>

        {/* Media */}
        {image && image.endsWith(".mp4") ? (
          <video src={image} className="w-full h-full object-cover" muted loop autoPlay playsInline />
        ) : (
          <img
            src={image || "/placeholder.png"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 px-1">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">{title}</h3>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <img 
                      src={author?.profilePic || author?.avatar || "/placeholder.png"} 
                      className="w-6 h-6 rounded-full object-cover" 
                      alt={author?.name} 
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{author?.name || 'Creator'}</span>
                  {author?.verified && (
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
