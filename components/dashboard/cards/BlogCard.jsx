"use client";
import React, { useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, MessageCircle, ArrowRight, TrendingUp, Clock, BookOpen, Share2, Bookmark, MoreHorizontal, FileText
} from 'lucide-react';
import { api } from '@/utils/api';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import CreatorProfileModal from '@/components/dashboard/modals/CreatorProfileModal';

const BlogCard = ({ blog, currentUser, isGuest = false, onRequireAuth }) => {
  const router = useRouter();

  if (!blog) return null;

  // Combine backend isLiked + local likedBy array check — both sources of truth
  const userId = currentUser?._id?.toString() || currentUser?._id;
  const initialIsLiked = blog.isLiked === true || (userId && blog.likedBy?.includes(userId)) || false;
  const initialLikesCount = blog.likesCount !== undefined ? blog.likesCount : (typeof blog.likes === 'number' ? blog.likes : (Array.isArray(blog.likes) ? blog.likes.length : 0));
  const initialCommentsCount = blog.commentsCount !== undefined ? blog.commentsCount : (Array.isArray(blog.comments) ? blog.comments.length : 0);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [showComments, setShowComments] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const {
    _id,
    slug,
    title,
    subtitle,
    content,
    coverImage,
    author,
    createdAt,
    readTime = "5 min read",
    views = 0,
    proTips = [],
    keyTakeaways = []
  } = blog;

  // Improved excerpt extraction: Fallback to plain string extraction if needed
  const getExcerpt = (blogObj) => {
    // 1. Use the pre-computed excerpt if available (most reliable)
    if (blogObj.excerpt && typeof blogObj.excerpt === 'string' && blogObj.excerpt.trim().length > 0) {
      return blogObj.excerpt;
    }
    
    // 2. Fallback to raw content stripping
    const htmlString = blogObj.content;
    if (!htmlString) return "";

    let parsedData = htmlString;
    try {
      if (typeof htmlString === 'string' && (htmlString.startsWith('{') || htmlString.startsWith('['))) {
        parsedData = JSON.parse(htmlString);
      }
    } catch (e) {
      parsedData = htmlString;
    }

    try {
      if (typeof parsedData === 'object' && parsedData !== null) {
        if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
          return parsedData.blocks
            .filter(b => b.type === 'paragraph' || b.type === 'header')
            .map(b => (b.data?.text || '').replace(/<[^>]*>/g, ' '))
            .join(' ')
            .replace(/&[a-z]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        return JSON.stringify(parsedData).substring(0, 100);
      }
      return String(parsedData)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch {
      return "";
    }
  };

  const rawExcerpt = getExcerpt(blog);
  // Keep it short and punchy for the feed (Information Gap Theory)
  const excerpt = rawExcerpt.length > 200
    ? rawExcerpt.substring(0, 200).trim() + "..."
    : rawExcerpt;

  const handleNavigate = () => router.push(`/blogs/${slug}`);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    const currentIsLiked = isLiked;
    
    setIsLiked(!currentIsLiked);
    setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const res = await api.post(`/blog/${slug}/like`);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      } else {
        setIsLiked(currentIsLiked);
        setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      setIsLiked(currentIsLiked);
      setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const handleCommentToggle = (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('comment'); return; }
    setShowComments(prev => !prev);
  };

  // ----------------------------------------------------------------------
  // Dynamic Avatar Fetching (Mirroring CreatorProfileModal logic)
  // ----------------------------------------------------------------------
  const [creatorAvatar, setCreatorAvatar] = useState(null);
  
  useEffect(() => {
    const authorId = blog.author?._id || blog.author;
    const initialAvatar = blog.author?.profilePicture || blog.author?.avatar;
    
    if (authorId && !initialAvatar) {
      // Check if we already cached this author's avatar globally to prevent N+1 spam
      if (window.__avatarCache && window.__avatarCache[authorId]) {
        setCreatorAvatar(window.__avatarCache[authorId]);
        return;
      }
      
      api.get(`/creator/${authorId}`)
        .then(res => {
          if (res.success && res.data) {
            const fetchedAvatar = res.data.profilePicture || res.data.userId?.profilePicture;
            if (fetchedAvatar) {
              setCreatorAvatar(fetchedAvatar);
              window.__avatarCache = window.__avatarCache || {};
              window.__avatarCache[authorId] = fetchedAvatar;
            }
          }
        })
        .catch(() => {}); // silent fail, fallback to initial
    }
  }, [blog.author]);

  const finalAvatar = creatorAvatar || author?.profilePicture || author?.avatar;

  return (
    <div className="bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors p-4 sm:p-5">
      <div
        className="group relative cursor-pointer flex gap-4 sm:gap-5"
        onClick={handleNavigate}
      >
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0">
          <div 
            className="relative group/avatar cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => { 
                e.stopPropagation(); 
                e.preventDefault();
                setIsCreatorModalOpen(true); 
            }}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10">
              {finalAvatar ? (
                <Image
                  src={finalAvatar}
                  fill
                  className="object-cover"
                  alt={author?.name || 'Author'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-bold text-lg">
                  {author?.name?.[0] || 'A'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
             <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                 <div className="flex items-center gap-2">
                    <h3 
                        className="font-bold text-gray-900 dark:text-gray-100 text-[15px] hover:underline decoration-2 decoration-emerald-500 underline-offset-4 transition-colors cursor-pointer leading-tight"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            e.preventDefault();
                            setIsCreatorModalOpen(true); 
                        }}
                    >
                        {author?.name || 'Anonymous'}
                    </h3>
                     {/* TYPE BADGE: BLOG */}
                     <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <FileText size={10} className="stroke-[3]" /> {blog.category && blog.category !== 'uncategorized' ? blog.category : 'Article'}
                    </span>
                 </div>
                 <span className="hidden sm:inline text-gray-400 text-sm">·</span>
                 <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[13px]">
                     <span>{new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                     <span className="text-gray-300 dark:text-gray-600">•</span>
                     <span className="flex items-center gap-1">
                         <Clock size={12} /> {readTime}
                     </span>
                 </div>
             </div>
             <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors hidden sm:block">
                 <MoreHorizontal size={18} />
             </button>
          </div>

          {/* Body (The Hook) */}
          <div className="space-y-1.5 mb-3 mt-1">
            <h2 className="text-[20px] sm:text-[22px] font-black text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug tracking-tight">
              {title}
            </h2>
            
            {(excerpt || subtitle) && (
              <p className="text-gray-600 dark:text-gray-300 text-[14px] sm:text-[15px] leading-relaxed line-clamp-3">
                {subtitle || excerpt || "Read the full article to discover more insights and details."}
              </p>
            )}
          </div>

          {/* Media (Visual Dominance) */}
          {coverImage && (
            <div className="w-full relative rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 mt-2 mb-3">
              <div className="aspect-[16/9] sm:aspect-[2/1] relative w-full h-full">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          )}

          {/* Tags (Optional) */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
               {blog.tags.slice(0, 4).map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    #{tag}
                  </span>
               ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm group transition-all ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
              >
                <div className="p-1.5 rounded-full group-hover:bg-pink-500/10 transition-colors">
                  <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                </div>
                <span className="font-semibold tabular-nums text-xs">{likesCount}</span>
              </button>

              {/* Comment */}
              <button
                onClick={handleCommentToggle}
                className={`flex items-center gap-1.5 text-sm group transition-all ${showComments ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <MessageCircle size={18} className={showComments ? 'fill-current' : ''} />
                </div>
                <span className="font-semibold tabular-nums text-xs">{commentsCount}</span>
              </button>

              {/* Share */}
              <button 
                  className="flex items-center gap-1.5 text-sm group transition-all text-gray-500 hover:text-green-500"
                  onClick={(e) => { e.stopPropagation(); /* share logic */ }}
              >
                  <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                      <Share2 size={18} />
                  </div>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Views */}
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <TrendingUp size={16} />
                <span className="font-medium text-xs tabular-nums">{views}</span>
              </div>
              
              {/* Bookmark */}
              <button 
                className="text-gray-400 hover:text-emerald-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                onClick={(e) => { e.stopPropagation(); /* bookmark logic */ }}
              >
                  <Bookmark size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="mt-4 sm:ml-16 border-t border-gray-100 dark:border-white/5 pt-4">
            <AdvancedCommentSection
              postId={_id}
              postAuthorId={author?._id}
              initialComments={blog.comments || []}
              onClose={() => setShowComments(false)}
              onCommentAdded={() => setCommentsCount(prev => prev + 1)}
            />
        </div>
      )}

      {/* Creator Profile Modal */}
      <CreatorProfileModal 
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        userId={author?._id}
      />
    </div>
  );
};

export default React.memo(BlogCard);
