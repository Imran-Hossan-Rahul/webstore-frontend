import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import Image from 'next/image';
import { MessageCircle, Share2, MoreHorizontal, Send, Bookmark, BarChart2, Calendar, MapPin, ExternalLink, Download, FileText, CheckCircle2, Star } from "lucide-react";
import Link from 'next/link';
import { api } from "@/utils/api";
import dynamic from 'next/dynamic';
import { useShare } from "@/hooks/useShare";
import { getOptimizedUrl } from "@/utils/optimizeImage";

const DevlogPostCard = dynamic(() => import('./DevlogPostCard'), { ssr: false });

const PostCard = ({ 
  id,
  _id,
  title,
  user, 
  content, 
  images, 
  media,
  likes, 
  commentsCount: initialCommentsCount, 
  isLiked: initialIsLiked,
  isFavorited: initialIsFavorited,
  devlogStats,
  postType,
  createdAt,
  onClick,
  isGuest = false,
  onRequireAuth
}) => {
  const postId = id || _id;
  const router = useRouter();
  const { share } = useShare();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false); 
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialCommentsCount || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const isLongContent = content && content.length > 280;
  const displayContent = (!isDetailOpen && isLongContent) ? content.slice(0, 280) + "..." : content;

  const handleNavigate = useCallback(() => {
    setIsNavigating(true);
    NProgress.start();
    router.push(`/post/${postId}`);
  }, [router, postId]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
       await api.put(`/posts/${postId}/like`);
    } catch (err) {
       console.error("Like failed", err);
       setIsLiked(!newIsLiked);
       setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  const toggleComments = async (e) => {
      e.stopPropagation();
      if (isGuest) { onRequireAuth?.('comment'); return; }
      setShowComments(!showComments);
      if (!comments.length && !showComments) {
          fetchComments();
      }
  };

  const fetchComments = async () => {
      setLoadingComments(true);
      try {
          const res = await api.get(`/comments/${postId}`);
          if (res.success) {
              setComments(res.data);
          }
      } catch (err) {
          console.error("Failed to fetch comments", err);
      } finally {
          setLoadingComments(false);
      }
  };

  const handlePostComment = async () => {
      if (!commentText.trim()) return;
      if (isGuest) { onRequireAuth?.('comment'); return; }

      try {
          const res = await api.post(`/comments/${postId}`, { content: commentText });
          if (res.success) {
              const newComment = res.data; 
              setComments(prev => [newComment, ...prev]);
              setCommentText("");
              setCurrentCommentsCount(prev => prev + 1);
          }
      } catch (err) {
          console.error("Failed to post comment", err);
      }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('save'); return; }
    const newIsFavorited = !isFavorited;
    setIsFavorited(newIsFavorited);
    try {
        await api.post('/favorites/toggle', { postId });
    } catch (err) {
        console.error("Favorite failed", err);
        setIsFavorited(!newIsFavorited);
    }
  };

  const onShareClick = async (e) => {
    e.stopPropagation();
    await share({
        title: user?.name ? `Post by ${user.name}` : "Check out this post",
        text: content ? content.slice(0, 100) : "",
        url: `/post/${postId}`
    });
  };

  const timeAgo = (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m";
      return "just now";
  };

  if (postType === 'devlog' || (devlogStats && Object.keys(devlogStats).length > 0)) {
     return (
        <DevlogPostCard 
            item={{
                id, _id, title, user, content, images, likes, commentsCount: initialCommentsCount, 
                isLiked: initialIsLiked, isFavorited: initialIsFavorited, devlogStats, 
                postType, createdAt
            }}
            onClick={() => {
                 if (onClick) onClick();
            }}
        />
     );
  }

  return (
    <>
    <div 
        className="sm:border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer flex gap-2 sm:gap-3 p-4" 
        onClick={handleNavigate}
    >
       <div className="flex-shrink-0">
           <Link href={`/u/${user?.username || ''}`} className="relative group/avatar cursor-pointer">
               <div className="relative">
                   {user?.avatar ? (
                       <Image 
                            src={user.avatar} 
                            width={48} 
                            height={48} 
                            className="rounded-full object-cover border border-slate-200 dark:border-white/10" 
                            alt={user.name} 
                        />
                   ) : (
                       <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 font-bold text-lg">
                           {user?.name?.[0] || "U"}
                       </div>
                   )}
               </div>
           </Link>
       </div>

       <div className="flex-1 min-w-0">
           <div className="flex justify-between items-start mb-1">
               <div className="flex items-center gap-2 flex-wrap">
                   <Link href={`/u/${user?.username || ''}`} className="font-bold text-slate-900 dark:text-white text-base hover:underline decoration-2 decoration-purple-500 underline-offset-4 cursor-pointer font-sans">
                        {user?.name}
                   </Link>
                   {user?.isVerified && (
                        <span className="text-indigo-600">
                             <CheckCircle2 size={16} className="fill-current" />
                        </span>
                   )}
                   <span className="text-slate-400 text-[10px] font-mono font-medium uppercase tracking-tight">@{user?.username || "user"}</span>
                   <span className="text-gray-300 dark:text-slate-600 text-xs">•</span>
                   <span suppressHydrationWarning className="text-slate-400 text-[10px] font-mono font-medium uppercase tracking-tight hover:text-purple-500 cursor-pointer">{timeAgo(createdAt)}</span>
               </div>
           </div>
           
           {user?.title && <p className="text-xs text-slate-400 -mt-1 mb-2">{user.title}</p>}

           <div>
                <div className="text-slate-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap break-words mb-4 font-normal font-sans">
                    {displayContent}
                    {isLongContent && (
                        <button 
                             type="button"
                             onClick={(e) => { e.stopPropagation(); setIsDetailOpen(true); }}
                             className="text-purple-500 hover:text-purple-600 font-mono font-medium text-[10px] ml-1 hover:underline uppercase tracking-wider"
                        >
                            Read Case Study
                        </button>
                    )}
                </div>

                {(() => {
                    const displayImages = media?.length > 0 
                        ? media.filter(m => m.type === 'image').map(m => m.url)
                        : images || [];
                    
                    if (!displayImages || displayImages.length === 0) return null;
                    
                    return (
                    <div className={`grid gap-1 mb-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 ${
                        displayImages.length === 1 ? 'grid-cols-1' : 
                        displayImages.length === 2 ? 'grid-cols-2' :
                        displayImages.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                    }`}>
                        {displayImages.map((img, idx) => (
                            <div key={idx} className={`relative group/image overflow-hidden cursor-pointer bg-slate-100 dark:bg-white/5 ${
                                displayImages.length === 1 ? 'aspect-video max-h-[500px]' : 
                                (displayImages.length === 3 && idx === 0) ? 'row-span-2 aspect-[1/2]' : 'aspect-square'
                            }`}>
                                <img 
                                     src={getOptimizedUrl(img)} 
                                     className="object-cover w-full h-full" 
                                     alt={`Post content ${idx + 1}`}
                                 />
                            </div>
                        ))}
                    </div>
                    );
                })()}
                
                <div className="flex items-center justify-between py-2 max-w-md">
                    <button 
                         onClick={handleLike}
                         className={`flex items-center gap-2 group transition-all -ml-2 ${
                             isLiked ? 'text-pink-500' : 'text-slate-500 dark:text-slate-400 hover:text-pink-500'
                         }`}
                    >
                        <div className="relative">
                             <Star className={`w-[1.2rem] h-[1.2rem] ${isLiked ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-[11px] font-mono font-medium tabular-nums">{likeCount || 0}</span>
                    </button>
                    
                    <button 
                         onClick={toggleComments}
                         className={`flex items-center gap-2 group transition-all ${
                             showComments ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'
                         }`}
                     >
                        <div>
                            <MessageCircle className="w-[1.2rem] h-[1.2rem]" />
                        </div>
                        <span className="text-[11px] font-mono font-medium tabular-nums">{currentCommentsCount || 0}</span>
                    </button>

                     <button 
                         className="flex items-center gap-2 group transition-all text-slate-500 dark:text-slate-400 hover:text-green-500"
                         onClick={onShareClick}
                     >
                         <div>
                             <Share2 className="w-[1.2rem] h-[1.2rem]" />
                         </div>
                     </button>

                     <button 
                          onClick={handleFavorite}
                          className={`flex items-center gap-2 group transition-all text-slate-500 dark:text-slate-400 hover:text-pink-500 ${isFavorited ? 'text-pink-500' : ''}`}
                     >
                         <div>
                             <Bookmark className={`w-[1.2rem] h-[1.2rem] ${isFavorited ? 'fill-current' : ''}`} />
                         </div>
                     </button>
                 </div>

                 {showComments && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {loadingComments ? (
                                <div className="text-center text-slate-400 text-sm py-4">Loading conversation...</div>
                            ) : comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-3 group/comment">
                                    <div className="flex-shrink-0 mt-1">
                                        {comment.user?.avatar ? (
                                            <Image 
                                                 src={comment.user.avatar} 
                                                 width={28} 
                                                 height={28} 
                                                 className="rounded-full object-cover" 
                                                 alt={comment.user.name} 
                                             />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-300 to-gray-400 flex items-center justify-center text-white text-[10px] font-bold">
                                                {comment.user?.name?.[0] || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                         <div className="flex items-center gap-2 mb-0.5">
                                             <span className="font-medium text-xs text-slate-900 dark:text-white hover:underline cursor-pointer font-sans">{comment.user?.name}</span>
                                             <span suppressHydrationWarning className="text-slate-400 text-[10px] font-mono font-medium uppercase tracking-tight">{timeAgo(comment.createdAt)}</span>
                                         </div>
                                         <p className="text-slate-800 dark:text-gray-300 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 items-center">
                             <textarea 
                                 value={commentText}
                                 onChange={(e) => setCommentText(e.target.value)}
                                 placeholder="Tweet your reply" 
                                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-gray-400 resize-none py-2 border-b border-slate-200 dark:border-white/10"
                                 rows={1}
                                 onKeyDown={(e) => {
                                     if (e.key === 'Enter' && !e.shiftKey) {
                                         e.preventDefault();
                                         handlePostComment();
                                     }
                                 }}
                             />
                             <button 
                                 onClick={handlePostComment}
                                 disabled={!commentText.trim()}
                                 className="text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-medium text-[11px] uppercase tracking-wider"
                             >
                                 Reply
                             </button>
                        </div>
                    </div>
                )}
           </div>
       </div>
    </div>
    </>
  );
};

export default React.memo(PostCard);

